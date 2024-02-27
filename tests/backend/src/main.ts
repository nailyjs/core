import { InjectValuePlugin } from "@nailyjs/core/backend";
import { AddressInfo } from "net";
import { NailyApplication } from "./app.controller";

new NailyApplication()
  .enableInternalPlugin()
  .usePlugin(new InjectValuePlugin())
  .run()
  .then((server) => {
    console.log(`Server is running on ${(server.address() as AddressInfo).address}:${(server.address() as AddressInfo).port}`);
  });
