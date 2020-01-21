import {
    validateSync,
    ValidationError,
} from "class-validator";
import {Either, left, right} from "fp-ts/lib/Either";
import produce from "immer";
import R from "ramda";
import {hasPropertyAndNotEmpty} from "../logics";
import UsersLookupParameters from "./UsersLookupParameters";

const extractArr = (k: string) => {
    return R.ifElse(
        R.curry(hasPropertyAndNotEmpty)(k),
        R.compose(
            R.join(","),
            R.uniq,
            R.map(R.ifElse(R.is(String), R.trim, R.identity)),
            R.prop(k)),
        () => "",
    );
};

const updateParam = (k: string, v: any, state: { [key: string]: any }): { [key: string]: any } => produce(state, draft => {
    draft[k] = v;
});

export const constructParams = (params: UsersLookupParameters) => {
    const updateParamFunc = R.curry(updateParam);
    return R.compose(
        updateParamFunc("screen_name")(extractArr("_screenNames")(params)),
        updateParamFunc("user_id")(extractArr("_userIds")(params)),
        // @ts-ignore
        updateParamFunc("include_entities")(R.prop("_includeEntities", params)),
        // @ts-ignore
        updateParamFunc("tweet_mode")(R.prop("_tweetMode", params)),
    );
};

export const getAPIParams = (params: UsersLookupParameters): Either<ValidationError[], { [key: string]: any }> => {
    const errs = validateSync(params);

    if (errs.length > 0) {
        return left(errs);
    }

    return right(constructParams(params));
};

