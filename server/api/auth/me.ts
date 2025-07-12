import type { User } from "~/server/types/user";
import { logger } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const session = event.context.authSession.userSession;

  logger.debug(`Fetching authenticated user data ${session?.id}`);
  const response = await useApi<User>("/v1/users/me", "GET", {
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });

  if (response.status === "error") {
    logger.warn(`Error on fetching authenticated user data ${response}`);
    return createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      data: {
        message: response.message,
        errors: response.errors,
      },
    });
  }

  logger.info(`Authenticated user data retrived success ${response.data}`);
  return response.data;
});
