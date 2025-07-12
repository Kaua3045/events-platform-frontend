import type { H3Event, EventHandlerRequest } from "h3";
import type { AuthenticationCodeResponse } from "../types/auth-code-response";

export const createAuthenticateCode = async (
  event: H3Event<EventHandlerRequest>,
  body: any,
  challenge: string
) => {
  const config = useRuntimeConfig();
  const clientId = config.clientId;
  const clientSecret = config.clientSecret;

  const authCodeResponse = await useApi<AuthenticationCodeResponse>(
    "/v1/authorize/code",
    "POST",
    {
      headers: {
        Authorization: `Bearer ${event.context.authSession.frontendSession?.accessToken}`,
      },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code_challenge: challenge,
        code_challenge_method: "S256",
        email: body.email,
        password: body.password,
      },
    }
  );

  return authCodeResponse;
};
