import {S3} from "aws-sdk";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {validateSync} from "class-validator";
import R from "ramda";
import {from, Observable} from "rxjs";
import {flatMap} from "rxjs/operators";
import S from "sanctuary";
import Twitter, {ResponseData} from "twitter";
import {hasPropertyAndNotEmpty, notEmpty} from "../logics";
import UsersLookupParameters from "./UsersLookupParameters";

const bool2Str = (k: string) => {
    return R.compose(
        R.ifElse(
            R.is(Boolean),
            (v: boolean) => v ? "true" : "false",
            R.identity,
        ),
        // @ts-ignore
        R.prop(k),
    );
};

const sensitizeArrAndJoin = (glue: string, k: string) => {
    return R.ifElse(
        R.curry(hasPropertyAndNotEmpty)(k),
        R.compose(
            R.join(glue),
            // @ts-ignore
            R.filter(notEmpty),
            R.uniq,
            R.map(R.ifElse(R.is(String), R.trim, R.identity)),
            R.prop(k)),
        () => "",
    );
};

const parse = (lookupParams: UsersLookupParameters): { [key: string]: any } => {
    return {
        user_id: sensitizeArrAndJoin(",", "_userIds")(lookupParams),
        screen_name: sensitizeArrAndJoin(",", "_screenNames")(lookupParams),
        include_entities: bool2Str("_includeEntities")(lookupParams),
        tweet_mode: bool2Str("_tweetMode")(lookupParams),
    };
};

const lookup = (tw: Twitter, params: { [key: string]: any }): Observable<ResponseData> => from(tw.get("users/lookup", params));

const validate = (params: UsersLookupParameters) => {
    const err = validateSync(params);
    if (err.length > 0) {
        return S.Left(err);
    }

    return S.Right(params);
};

const upload = (putObjectRequest: PutObjectRequest, s3: S3, o: Observable<ResponseData>) => {
    return o.pipe(
        flatMap(p => from(s3.upload(Object.assign({}, putObjectRequest, {Body: JSON.stringify(p)})).promise())),
    );
};

export const lookupAndUpload = (putObjectRequest: PutObjectRequest, s3: S3, tw: Twitter) => {
    return S.pipe([
        validate,
        S.map(parse),
        S.map(S.curry2(lookup)(tw)),
        S.map(S.curry3(upload)(putObjectRequest)(s3)),
    ]);
};
