import { defineEventHandler, readBody, setCookie } from "h3";
import type { H3Event, EventHandlerRequest } from "h3";
import { useApi } from "../utils/useApi";
import { generateCodeChallenge, generateRandomString } from "../utils/pkce";
import type { AuthSession } from "../types/auth-session";
import { createAuthenticationToken } from "../usecases/create-authentication-token";
import { createAuthenticateCode } from "../usecases/create-authenticate-code";
import { logger } from "../utils/logger";

export type RegisterUserResponse = {
  userId: string;
};

export type RegisterOrganizationResponse = {
  organizationId: string;
  ownerId: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  logger.debug("Registering user or organization", body);

  if (body.isOrganizer) {
    logger.debug(`Registering organization ${body}`);
    const response = await createOrganization(event, body);

    if (response.status === "error") {
      logger.warn(`Organization registration error ${response}`);
      return response;
    }

    logger.info(
      `Organization, owner user created and authenticated ${response.data}`
    );
    return response;
  }

  logger.debug(`Registering user ${body}`);
  const response = await createUser(event, body);

  if (response.status === "error") {
    logger.warn(`User registration error ${response}`);
    return response;
  }

  const codeVerifier = generateRandomString();
  const challenge = await generateCodeChallenge(codeVerifier);

  logger.debug(
    `Creating auth code with code challenge ${challenge}`,
    challenge
  );
  const authCodeResponse = await createAuthenticateCode(event, body, challenge);

  if (authCodeResponse.status === "error") {
    logger.warn(`Error on creating auth code ${authCodeResponse}`);
    return authCodeResponse;
  }

  const authCode = authCodeResponse.data.code;

  logger.debug(`Creating auth token with auth code ${authCode}`);
  const authReponse = await createAuthenticationToken(authCode, codeVerifier);

  if (authReponse.status === "error") {
    logger.warn(`Error on creating auth token ${authReponse}`, authReponse);
    return authReponse;
  }

  const id = crypto.randomUUID();
  const config = useRuntimeConfig();
  const refreshTokenExpires = config.refreshTokenExpires;

  const authToken = {
    id: id,
    accessToken: authReponse.data.access_token,
    refreshToken: authReponse.data.refresh_token,
    expiresAt: authReponse.data.expires_in,
    tokenType: authReponse.data.token_type,
    sessionType: "user",
  } as AuthSession;

  setCookie(event, "sessionId", id, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "strict",
    maxAge: parseInt(refreshTokenExpires),
  });

  await redis.set(
    `session:${id}`,
    JSON.stringify(authToken),
    "EX",
    parseInt(refreshTokenExpires, 10)
  );

  logger.info(`User created and authenticated ${response.data}`);

  return response.data; // TODO check this
});

async function createOrganization(
  event: H3Event<EventHandlerRequest>,
  body: any
) {
  const response = await useApi<RegisterOrganizationResponse>(
    "/v1/organizations",
    "POST",
    {
      headers: {
        Authorization: `Bearer ${event.context.authSession.frontendSession?.accessToken}`,
      },
      body: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        password: body.password,
        organization_name: body.organizationName,
        organization_description: body.organizationDescription,
      },
    }
  );

  return response;
}

async function createUser(event: H3Event<EventHandlerRequest>, body: any) {
  const response = await useApi<RegisterUserResponse>("/v1/users", "POST", {
    headers: {
      Authorization: `Bearer ${event.context.authSession.frontendSession?.accessToken}`,
    },
    body: {
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email,
      password: body.password,
    },
  });

  return response;
}
