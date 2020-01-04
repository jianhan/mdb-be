import {fromJS} from "immutable";
import winston, {Logger} from "winston";
import {DEVELOPMENT, PRODUCTION, STAGE, UAT} from "./constants";
import {Environment} from "./envs";

// logLevel defines different log level for different environment.
const logLevel = (environment: Environment): string => {
    switch (environment) {
        case DEVELOPMENT:
        case STAGE:
        case UAT:
            return "debug";
        case PRODUCTION:
            return "info";
    }
    throw new Error("unknown environment");
};

// createLogger creates a new logger.
export const createLogger = (environment: Environment, service: string): Logger => {
    const l = winston.createLogger({
        level: logLevel(environment),
        silent: false,
        format: winston.format.json(),
        defaultMeta: {service, environment},
        transports: [
            new winston.transports.File({filename: "../logs/error.log", level: logLevel(environment)}),
            new winston.transports.File({filename: "../logs/combined.log"}),
        ],
    });

    if (environment !== "production") {
        l.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }

    return fromJS(l);
};

export const logIdentity = (logger: Logger, level: string, message: string) => {
    return <T>(data: T): T => {
        logger.log({level, message, data});
        return data;
    };
};
