import rp from "request-promise-native";
import {from, Observable} from "rxjs";

export const fetch = (url: string): Observable<string> => from(rp.get(url));






