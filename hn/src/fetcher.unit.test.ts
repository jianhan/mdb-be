import axios, {AxiosResponse} from "axios";
import {Substitute} from "@fluffy-spoon/substitute";
import {fetch} from "./fetcher";

jest.mock("axios");
// const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("fetcher function", () => {

    it("should fetch and return an html string", async (done) => {
        const html = "test html";
        const mockedResponse = Substitute.for<AxiosResponse>();
        mockedResponse.data = (): string => "test";

        // mockedAxios.get.mockImplementationOnce(() => Promise.resolve(mockedResponse));
        fetch("https://www.carsales.com.au").subscribe((data) => {
            console.log(data);
            // expect(data).toEqual(html);
            done();
        });
    });
});
