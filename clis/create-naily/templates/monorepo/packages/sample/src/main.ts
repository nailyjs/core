import { AbstractBootstrap } from "@nailyjs/core";
import { SampleService } from "./sample.service";

export class BootStrap extends AbstractBootstrap<SampleService> {}

new BootStrap(SampleService).enableInternalPlugin().run();
