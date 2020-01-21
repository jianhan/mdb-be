import {IsIn, IsNotEmpty, IsString, validate} from "class-validator";
import {Map} from "immutable";
import ProcessEnv = NodeJS.ProcessEnv;
import {enumValues, Environment} from "./constants";

/**
 * Environment variables.
 */
export class Envs {

    @IsIn(enumValues(Environment), {message: `NODE_ENV must be in ${enumValues(Environment)}`})
    public NODE_ENV?: string;

    @IsNotEmpty()
    @IsString()
    public SERVICE_NAME?: string;

    @IsNotEmpty()
    @IsString()
    public CONSUMER_API_KEY?: string;

    @IsNotEmpty()
    @IsString()
    public CONSUMER_API_SECRET_KEY?: string;

    @IsNotEmpty()
    @IsString()
    public ACCESS_TOKEN?: string;

    @IsNotEmpty()
    @IsString()
    public ACCESS_SECRET?: string;

    @IsNotEmpty()
    @IsString()
    public S3_ACCESS_KEY_ID?: string;

    @IsNotEmpty()
    @IsString()
    public S3_SECRET_ACCESS_KEY?: string;

    @IsNotEmpty()
    @IsString()
    public S3_BUCKET_NAME?: string;

}

// getEnvs retrieves environment variables.
export const getEnvs = async (envs: ProcessEnv): Promise<Map<string, string | Environment | undefined>> => {
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
