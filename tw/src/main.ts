import {APIGatewayEvent} from "aws-lambda";
import {constants} from "http2";
import _ from "lodash";
import {sprintf} from "sprintf-js";
import {Environment, LogLevel} from "../../lib/src/constants";
// @ts-ignore
import {getEnvs} from "../../lib/src/envs";
// @ts-ignore
import {createLogger} from "../../lib/src/logger";
// @ts-ignore
import {LambdaFunc} from "../../lib/src/operations";
// @ts-ignore
import {Envs} from "./envs";

export const handler = async (event: APIGatewayEvent): Promise<any> => {
    try {
        const envs = await getEnvs(process.env, Envs);
        const logger = createLogger(envs.get("NODE_ENV") as Environment, envs.get("SERVICE_NAME") as string, LogLevel.DEBUG);
        const lambdaFunc: LambdaFunc = await import(event.path);
        const result = lambdaFunc(envs, logger, event);
        if (_.isUndefined(result)) {
            return {
                statusCode: constants.HTTP_STATUS_OK,
            };
        }
        result.subscribe(
            r => logger.info("invocation successful", r),
            e => logger.error("invocation failed", e),
            () => logger.error("invocation completed", event),
        );
    } catch (err) {
        return {
            statusCode: constants.HTTP_STATUS_BAD_REQUEST,
            err,
        };
    }

    return {
        statusCode: 200,
        body: sprintf("function completed: %s, please check logs ", event.path),
    };
};
