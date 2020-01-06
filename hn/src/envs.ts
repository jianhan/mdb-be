import {IsIn, IsNotEmpty, IsString, validate} from "class-validator";
import {Map} from "immutable";
import ProcessEnv = NodeJS.ProcessEnv;
import {enumValues, Environment} from "./constants";

// define environment variables.
export class Envs {
    @IsIn(enumValues(Environment), {message: `NODE_ENV must be in ${enumValues(Environment)}`})
    public NODE_ENV?: string;

    @IsNotEmpty({message: "SERVICE_NAME must not be empty."})
    @IsString({message: "SERVICE_NAME must be string"})
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
