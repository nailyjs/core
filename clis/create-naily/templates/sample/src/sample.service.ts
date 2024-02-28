import { ImplNailyService, Injectable } from "@nailyjs/core";

@Injectable()
export class SampleService implements ImplNailyService {
  onReady(): void | Promise<void> {
    console.log("Hello world!");
  }
}
