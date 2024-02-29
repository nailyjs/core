import { IPipeArgHost, ImplNailyBackendPipe } from "@nailyjs/backend";
import { Injectable } from "@nailyjs/core";

@Injectable()
export class AppPipe implements ImplNailyBackendPipe {
  transform(value: unknown, argHost: IPipeArgHost) {
    console.log(value);
    console.log(argHost);
    return value;
  }
}
