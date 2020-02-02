import _ from "lodash";
import {range} from "ramda";
import rewire from "rewire";
import S from "sanctuary";
import {lookupAndUpload} from "./lookup";
import UsersLookupParameters from "./UsersLookupParameters";

describe("pure functions", () => {
    const lookupModule = rewire("../../dist/users/lookup.js");

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

    it("validateAndLog should fail when empty _screenNames is provided", () => {
        // @ts-ignore
        const s3 = jest.genMockFromModule("aws-sdk").S3;
        // @ts-ignore
        const tw = jest.genMockFromModule("twitter").Twitter;
        const lau = lookupAndUpload("test", "test", s3, tw);
        // @ts-ignore
        expect(S.isLeft(lau(new UsersLookupParameters()))).toBe(true);
    });

    it("validateAndLog should fail when _screenNames is exceeded", () => {
        // @ts-ignore
        const s3 = jest.genMockFromModule("aws-sdk").S3;
        // @ts-ignore
        const tw = jest.genMockFromModule("twitter").Twitter;
        const lau = lookupAndUpload("test", "test", s3, tw);
        const screenNames = range(1, 101).map((n: number) => "name " + n);
        // @ts-ignore
        expect(S.isLeft(lau(new UsersLookupParameters({_screenNames: screenNames})))).toBe(true);
    });

});
