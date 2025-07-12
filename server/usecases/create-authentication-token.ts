import type { AuthenticationToken } from "../types/authentication-token-response";

export const createAuthenticationToken = async (
  authCode: string,
  codeVerifier: string
) => {
  const config = useRuntimeConfig();
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;

  const authReponse = await useApi<AuthenticationToken>(
    "/v1/authorize/token",
    "POST",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // TODO replace to access token
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: authCode,
        code_verifier: codeVerifier,
      }),
    }
  );

  return authReponse;
};
