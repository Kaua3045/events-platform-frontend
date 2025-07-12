import winston, { transports } from "winston";

const isProduction = process.env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Include stack trace
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const env = process.env.NODE_ENV || "development";
      const metaWithOtherInfos = {
        ...meta,
        env,
        serviceName: "nuxt-app",
      };

      const metaString =
        Object.keys(metaWithOtherInfos).length > 0
          ? ` - ${JSON.stringify(metaWithOtherInfos)}`
          : "";

      return (
        `[${timestamp}] [${env}] ${level.toUpperCase()} - ${message}${
          isProduction ? "" : metaString
        }` + (stack ? `\n${stack}` : "")
      );
    }),
    winston.format.colorize({
      all: true,
    })
  ),
  transports: [new transports.Console()],
});
