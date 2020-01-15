import {S3} from "aws-sdk";
import {from} from "rxjs";

export const getS3 = (accessKeyId: string, secretAccessKey: string) => {
    return new S3({accessKeyId, secretAccessKey});
};

export const uploadObserver = (s3: S3) => from(s3.upload);

