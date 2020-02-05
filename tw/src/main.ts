import { APIGatewayEvent } from "aws-lambda";
import {Environment, LogLevel} from "../../lib/src/constants";
// @ts-ignore
import {getEnvs} from "../../lib/src/envs";
// @ts-ignore
import {createLogger} from "../../lib/src/logger";
import {Envs} from "./envs";

export const handler = async (event: APIGatewayEvent): Promise<any> => {
    const envs = await getEnvs(process.env, Envs);
    const logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
    const params = JSON.stringify(event.body);
    logger.info(params, envs);
    return {
        statusCode: 200,
        body: params,
    };
};
