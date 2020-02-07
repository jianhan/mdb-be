import * as moment from 'moment'
import {sprintf} from "sprintf-js";
import produce from "immer";
import {Logger} from "winston";
import {Environment} from "./constants";
import {APIGatewayEvent} from "aws-lambda";
import {Observable} from "rxjs";
import {Map} from "immutable";

export const prefixDateTime = (ft: string) => (name: string, dateTime: moment.Moment): string => sprintf("%s_%s", dateTime.format(ft), name);

export const simpleLog = (logger: Logger, level: string, message: string, ...meta: any[]) => logger.log({level, message, ...meta});

export const updateProp = (k: string, v: any, state: { [key: string]: any }): { [key: string]: any } => produce(state, draft => {
    draft[k] = v;
});

export interface LambdaFunc {
    (envs: Map<string, string | Environment | undefined>, logger: Logger, event: APIGatewayEvent) : Observable<any> | undefined
}
