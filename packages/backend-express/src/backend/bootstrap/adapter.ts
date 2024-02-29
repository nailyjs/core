import { AbstractNailyBackendAdapter, IAdapterRequestHandler, IAdapterType } from "@nailyjs/backend";
import { Express, NextFunction, Request, Response } from "express";
import { join } from "path";

export class ExpressAdapter extends AbstractNailyBackendAdapter {
  constructor(private readonly app: Express) {
    super();
  }

  private mergeUriPath(controllerPath: string, mapping: string): string {
    return join("/" + controllerPath, mapping).replace(/\\/g, "/");
  }

  handler<T>(requestHandler: IAdapterRequestHandler<T>): void {
    const methodMapping = requestHandler.getMethodMapping();
    const controllerMapping = requestHandler.getControllerMapping();
    const uri = this.mergeUriPath(controllerMapping.path, methodMapping.path);
    const requestMethod = methodMapping.method.toLowerCase();

    this.app[requestMethod](uri, async (req: Request, res: Response, next: NextFunction) => {
      const { result, isResponse } = await requestHandler.runMethod({
        adapterType: IAdapterType.Separate,
        request: req,
        response: res,
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
        ip: req.ip,
        ips: req.ips,
        next: next,
      });
      if (!isResponse) res.send(result).end();
    });
  }
}
