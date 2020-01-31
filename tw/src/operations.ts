import moment from "moment";
import {sprintf} from "sprintf-js";
import produce from "immer";

export const prefixDateTime = (ft: string) => (name: string, dateTime: moment.Moment): string => sprintf("%s_%s", dateTime.format(ft), name);

export type ProcessStrFunc = (data: string) => void;

export type ProcessErrFunc = (data: any) => void;

export type ProcessCompleteFunc = () => void;

export const updateProp = (k: string, v: any, state: { [key: string]: any }): { [key: string]: any } => produce(state, draft => {
    draft[k] = v;
});

