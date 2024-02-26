export const enum RequestMethod {
  GET = "GET",
}

export interface IExpressMapping {
  method: RequestMethod;
  path: string;
}
