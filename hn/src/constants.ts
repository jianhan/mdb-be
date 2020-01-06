import R from "ramda";

// define type for different environments.
export enum Environment {
    DEVELOPMENT = "development",
    STAGE = "stage",
    UAT = "uat",
    PRODUCTION = "production",
}

export const enumValues = <T>(enums: any): T[] => R.keys(enums).map(k => enums[k]).map(v => v as T);
