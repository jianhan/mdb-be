import {Either, left, right} from "fp-ts/lib/Either";
import {fromJS} from "immutable";
import winston, {Logger} from "winston";
import {Environment, LogLevel} from "./constants";

// getLogLevel defines different log level for different environment.
export const getLogLevel = (environment: Environment): Either<Error, LogLevel> => {
    switch (environment) {
        case Environment.DEVELOPMENT:
        case Environment.STAGE:
        case Environment.UAT:
            return right(LogLevel.DEBUG);
        case Environment.PRODUCTION:
            return right(LogLevel.INFO);
    }

    return left(new Error("unknown environment"));
};

// createLogger creates a new logger.
export const createLogger = (environment: Environment, service: string, level: string): Logger => {
    const l = winston.createLogger({
        level,
        silent: false,
        format: winston.format.json(),
        defaultMeta: {service, environment},
        transports: [
            new winston.transports.File({filename: "logs/error.log", level}),
            new winston.transports.File({filename: "logs/combined.log"}),
        ],
    });

    if (environment !== Environment.PRODUCTION) {
        l.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }

    return fromJS(l);
};

// const createLoggerByEnv = R.partial(createLogger, [Environment.PRODUCTION, "test"]);
//
// either.map(getLogLevel(Environment.PRODUCTION), createLoggerByEnv);
