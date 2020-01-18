import {S3} from "aws-sdk";
import {PutObjectRequest} from "aws-sdk/clients/s3";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {Map} from "immutable";
import SendData = ManagedUpload.SendData;
import moment from "moment";
import {from, Observable} from "rxjs";
import { sprintf } from "sprintf-js";
import Tag from "./Tag";

export const uploadTags = (key: string, envs: Map<string, string | undefined>, s3: S3, tags: Tag[]): Observable<SendData> => {
    const params: PutObjectRequest = {
        Bucket: envs.get("S3_BUCKET_NAME") as string,
        Key: key,
        Body: JSON.stringify(tags),
    };
    return from(s3.upload(params).promise());
};

export const prefixDateTime = (ft: string) => (name: string, dateTime: moment.Moment): string => sprintf("%s_%s", dateTime.format(ft), name);
