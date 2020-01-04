import {IsIn, IsNotEmpty, IsString, validate} from "class-validator";
import {Map} from "immutable";
import ProcessEnv = NodeJS.ProcessEnv;

// define type for different environments.
export enum Environment {
    Development = "development",
    Stage = "stage",
    UAT = "uat",
    PRODUCTION = "production",
}

// define environment variables.
export class Envs {
    @IsIn(["development", "stage", "uat", "production"])
    public NODE_ENV?: string;

    @IsNotEmpty()
    @IsString()
    public SERVICE_NAME?: string;
}

// getEnvs retrieves environment variables.
export const getEnvs = (envs: ProcessEnv): Promise<Map<string, string | Environment | undefined>> => {
    const envsObj = Object.assign(new Envs(), envs);
    return new Promise<Map<string, string|undefined>>((resolve, reject) => {
        return validate(envsObj).then(errors => {
            if (errors.length > 0) {
                reject(errors);
            }
            resolve(Map(envsObj));
        });
    });
};
