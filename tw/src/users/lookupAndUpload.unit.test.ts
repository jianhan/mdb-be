import S3 = require("aws-sdk/clients/s3");
import SendData = ManagedUpload.SendData;
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import _ from "lodash";
import {range} from "ramda";
import rewire from "rewire";
import {Observable} from "rxjs";
import S from "sanctuary";
import Twitter = require("twitter");
import {lookupAndUpload} from "./lookupAndUpload";
import UsersLookupParameters from "./UsersLookupParameters";

let s3: S3;
let tw: Twitter;

beforeEach(() => {
    s3 = new S3();
    // @ts-ignore
    tw = new Twitter();
});

describe("pure functions", () => {

    const lookupModule = rewire("../../dist/tw/src/users/lookupAndUpload");

    it("bool2Str should convert boolean to string", () => {
        const bool2Str = lookupModule.__get__("bool2Str");
        expect(bool2Str("test")({test: true})).toBe("true");
        expect(bool2Str("test")({test: false})).toBe("false");
        expect(bool2Str("test")({})).toBe(undefined);
    });

    it("sensitizeArrAndJoin should sensitize array elements and join", () => {
        const sensitizeArrAndJoin = lookupModule.__get__("sensitizeArrAndJoin");
        const testingData = [
            {input: [""], output: ""},
            {input: ["", "", ""], output: ""},
            {input: ["test", "test"], output: "test"},
            {input: ["test", "test", "test1", "test2"], output: "test,test1,test2"},
        ];
        _.map(testingData, data => {
            const v = sensitizeArrAndJoin(",", "_screenNames")({_screenNames: data.input});
            expect(v).toEqual(data.output);
        });
    });

    it("validate should fail when empty _screenNames is provided", () => {
        const lau = lookupAndUpload({Bucket: "test", Key: "test"}, s3, tw);
        // @ts-ignore
        expect(S.isLeft(lau(new UsersLookupParameters()))).toBe(true);
    });

    it("validate should fail when _screenNames is exceeded", () => {
        const lau = lookupAndUpload({Bucket: "test", Key: "test"}, s3, tw);
        const screenNames = range(1, 101).map((n: number) => "name " + n);
        // @ts-ignore
        expect(S.isLeft(lau(new UsersLookupParameters({_screenNames: screenNames})))).toBe(true);
    });

    it("validate should fail when _userIds is exceeded", () => {
        const lau = lookupAndUpload({Bucket: "test", Key: "test"}, s3, tw);
        // @ts-ignore
        expect(S.isLeft(lau(new UsersLookupParameters({_userIds: range(1, 101)})))).toBe(true);
    });

});

describe("lookupAndUpload function", () => {

    it("should catch error correctly when lookup rejects", done => {
        const errMsg = "error occur";
        const params = new UsersLookupParameters(["chenqiushi404"]);
        const spy = jest.spyOn(tw, "get").mockRejectedValue(errMsg);
        const lau = lookupAndUpload({Bucket: "test", Key: "test"}, s3, tw)(params);

        // @ts-ignore
        expect(S.isRight(lau)).toBe(true);
        expect(spy).toBeCalled();
        S.either(() => done())((o: Observable<SendData>) => {
            o.subscribe(
                () => done(),
                err => {
                    expect(err).toEqual(errMsg);
                    done();
                },
            );
            // @ts-ignore
        })(lau);
    });

    it("should catch error correctly when upload rejects", done => {
        const errMsg = "error occur!";
        const params = new UsersLookupParameters(["chenqiushi404"]);
        jest.spyOn(tw, "get").mockResolvedValue(Promise.resolve({test: "test"}));
        const mockedUpload = () => {
            return {promise: () => Promise.reject(errMsg)};
        };
        // @ts-ignore
        jest.spyOn(s3, "upload").mockImplementation(mockedUpload);

        const lau = lookupAndUpload({Bucket: "test", Key: "test"}, s3, tw)(params);

        // @ts-ignore
        expect(S.isRight(lau)).toBe(true);

        S.either(() => done())((o: Observable<SendData>) => {
            o.subscribe(
                () => done(),
                err => {
                    expect(err).toEqual(errMsg);
                    done();
                },
            );
            // @ts-ignore
        })(lau);
    });

});
