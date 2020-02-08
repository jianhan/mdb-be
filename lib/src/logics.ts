import moment from "moment";
import R from "ramda";
import {sprintf} from "sprintf-js";

export const hasPropertyAndNotEmpty = (k: string, input: any) => R.and(
    R.has(k)(input),
    R.propSatisfies(x => R.not(R.isEmpty(x)), k, input),
);

export const notEmpty = R.compose(R.not, R.isEmpty);

export const prefixDateTime = (ft: string) => (name: string, dateTime: moment.Moment): string => sprintf("%s_%s", dateTime.format(ft), name);
