import { InjectValuePlugin } from "@nailyjs/core/backend";
import { AddressInfo } from "net";
import { NailyApplication } from "./app.controller";

new NailyApplication()
  .enableInternalPlugin()
  .enableBodyParser()
  .usePlugin(new InjectValuePlugin())
  .run()
  .then((server) => {
    const { address, port } = server.address() as AddressInfo;
    console.log(`Server is running on ${address}:${port}`);
  });
