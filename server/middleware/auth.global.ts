import type { AuthSessionType } from "../types/auth-session";
import type { AuthenticationToken } from "../types/authentication-token-response";
import { createRefreshToken } from "../usecases/create-refresh-token";
import { logger } from "../utils/logger";
import { redis } from "../utils/redis";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "/";

  if (PUBLIC_ROUTES.includes(url)) {
    return;
  }

  logger.info("Auth middleware", event.context.authSession);

  const config = useRuntimeConfig();
  const refreshTokenExpires = config.refreshTokenExpires;

  const sessionId = getCookie(event, "sessionId");
  logger.debug("Loading sessionId cookie");
  const sessionRaw = await redis.get(`session:${sessionId}`);

  event.context.authSession ??= {};

  if (sessionRaw) {
    logger.debug(`Session founded for value ${sessionId}`);
    const session = JSON.parse(sessionRaw); // TODO check is expired and refresh
    event.context.authSession.userSession = session;
    logger.info(`Session loaded for value ${sessionId}`);
    return;
  }

  logger.debug(
    `Session not founded for value ${
      sessionId == undefined ? "undefined" : sessionId
    }`
  );
  const sessionFrontend = await redis.get(`session:frontend`);

  if (sessionFrontend) {
    logger.debug("Session for frontend founded");
    const sessionFrontendParsed = JSON.parse(
      sessionFrontend
    ) as AuthSessionType;
    const expiryDate = new Date(sessionFrontendParsed.expiresAt);
    expiryDate.setSeconds(expiryDate.getSeconds() - 30); // Buffer (-30 seconds)
    const now = new Date();
    const expired = now >= expiryDate;

    if (expired) {
      logger.debug("Session for frontend expired, refreshing");
      const authRefreshTokenResponse = await createRefreshToken(
        sessionFrontendParsed
      );

      if (authRefreshTokenResponse.status === "error") {
        logger.error(
          `Session for frontend refresh returned error ${authRefreshTokenResponse}`
        );
        throw createError({
          statusCode: 401,
          statusMessage: "Unauthorized",
        });
      }

      const sessionFrontendRefreshed = {
        id: "frontend",
        accessToken: authRefreshTokenResponse.data.access_token,
        refreshToken: authRefreshTokenResponse.data.refresh_token,
        expiresAt: authRefreshTokenResponse.data.expires_in,
        tokenType: authRefreshTokenResponse.data.token_type,
      } as AuthSessionType;

      await redis.set(
        `session:frontend`,
        JSON.stringify(sessionFrontendRefreshed),
        "EX",
        parseInt(refreshTokenExpires, 10)
      );

      event.context.authSession.frontendSession = sessionFrontendRefreshed;
      logger.info(
        `Session for frontend refreshed and now expires at ${event.context.authSession.frontendSession.expiresAt}`
      );
      return;
    }

    logger.debug("Session for frontend not expired and setting to context");
    event.context.authSession.frontendSession = sessionFrontendParsed;
    logger.info("Session for frontend not expired and loaded");
    return;
  }

  logger.debug("Session for frontend not found");
  const authenticateFrontendBody = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const authenticateFrontendResponse = await useApi<AuthenticationToken>(
    "/v1/authorize/token",
    "POST",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${config.clientId}:${config.clientSecret}`
        )}`,
      },
      body: authenticateFrontendBody,
    }
  );

  if (authenticateFrontendResponse.status === "error") {
    logger.debug(
      `Session for frontend creating returned error ${authenticateFrontendResponse}`
    );
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const sessionFrontendCreated = {
    id: "frontend",
    accessToken: authenticateFrontendResponse.data.access_token,
    refreshToken: authenticateFrontendResponse.data.refresh_token,
    expiresAt: authenticateFrontendResponse.data.expires_in,
    tokenType: authenticateFrontendResponse.data.token_type,
    sessionType: "frontend",
  } as AuthSessionType;

  await redis.set(
    `session:frontend`,
    JSON.stringify(sessionFrontendCreated),
    "EX",
    parseInt(refreshTokenExpires, 10)
  );

  event.context.authSession.frontendSession = sessionFrontendCreated;
  logger.info(
    `Session for frontend created and now expires at ${event.context.authSession.frontendSession.expiresAt}`
  );
});
