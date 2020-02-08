// getEnvs retrieves environment variables.
import {Environment} from "./constants";
import ProcessEnv = NodeJS.ProcessEnv;
import {validate} from "class-validator";
import {Map} from "immutable";

export const getEnvs = async <T>(envs: ProcessEnv, c: new () => T): Promise<Map<string, string | Environment | undefined>> => {
    const envsObj = Object.assign(new c(), envs);
    return new Promise<Map<string, string|undefined>>((resolve, reject) => {
        return validate(envsObj).then(errors => {
            if (errors.length > 0) {
                reject(errors);
            }
            resolve(Map(envsObj));
        });
    });
};
