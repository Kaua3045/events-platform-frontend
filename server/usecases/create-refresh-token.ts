import type { AuthenticationToken } from "../types/authentication-token-response";
import type { AuthSessionType } from "../types/auth-session";

export const createRefreshToken = async (session: AuthSessionType) => {
  const config = useRuntimeConfig();

  const authRefreshTokenResponse = await useApi<AuthenticationToken>(
    "/v1/authorize/token",
    "POST",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(
          `${config.clientId}:${config.clientSecret}`
        )}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: config.clientId,
        refresh_token: session.refreshToken,
      }),
    }
  );
  return authRefreshTokenResponse;
};
