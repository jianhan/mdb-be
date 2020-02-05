import * as moment from 'moment'
import {sprintf} from "sprintf-js";
import produce from "immer";
import {Logger} from "winston";

export const prefixDateTime = (ft: string) => (name: string, dateTime: moment.Moment): string => sprintf("%s_%s", dateTime.format(ft), name);

export type ProcessFunc = (data: any, ...func) => void;

export type ProcessErrFunc = (data: any, ...func) => void;

export type ProcessCompleteFunc = (...func) => void;

export const simpleLog = (logger: Logger, level: string, message: string, ...meta: any[]) => logger.log({level, message, ...meta});

export const updateProp = (k: string, v: any, state: { [key: string]: any }): { [key: string]: any } => produce(state, draft => {
    draft[k] = v;
});

