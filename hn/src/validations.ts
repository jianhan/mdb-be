import _ from "lodash";

export interface IStrKVObj {
    [key: string]: string | undefined | null;
}

export const isValid = (v: string | undefined | null): boolean => !_.isUndefined(v) && !_.isNull(v);

export const allValid = (args: IStrKVObj) => _(args).every(isValid);
