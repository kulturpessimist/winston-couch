const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, json, colorize, simple } = format;
const cfg = require(".couch.config");
const couchTransport = require("./lib/winston.couch");

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    // new transports.File({ filename: "error.log", level: "error" }),
    new couchTransport({
      url: cfg.url,
      db: cfg.db,
      app: cfg.application,
      version: cfg.version,
      level: "info",
      format: json(),
    }),
    new transports.Console({
      level: "debug",
      format: combine(colorize(), simple()),
    }),
  ],
});

logger.debug("OK");
logger.info("Messae", { random: Math.random() });
logger.warn("Help", { name: "OK", random: Math.random() }, "LÖL");
