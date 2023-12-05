export const HttpMethod = {
  GET: "get",
  HEAD: "head",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
  OPTIONS: "options",
  TRACE: "trace",
} as const;

export type IHttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];
