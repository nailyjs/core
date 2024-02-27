export const enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  ALL = "ALL",
}

export interface INailyControllerMapping {
  method: RequestMethod;
  path: string;
}

export interface INailyControllerMetadata {
  path: string;
  version?: string;
}
