import R from "ramda";

export enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    HTTP = "http",
    VERBOSE = "verbose",
    DEBUG = "debug",
    SILLY = "silly",
}

// define type for different environments.
export enum Environment {
    DEVELOPMENT = "development",
    STAGE = "stage",
    UAT = "uat",
    PRODUCTION = "production",
}

export const enumValues = <T>(enums: any): T[] => R.keys(enums).map(k => enums[k]).map(v => v as T);
