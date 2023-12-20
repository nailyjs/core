export enum HttpMethodUppercase {
  GET = "GET",
  HEAD = "HEAD",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
}

export enum HttpMethodLowercase {
  get = "get",
  head = "head",
  post = "post",
  put = "put",
  patch = "patch",
  delete = "delete",
  options = "options",
  trace = "trace",
}

export type IHttpMethodUppercase = keyof typeof HttpMethodUppercase;
export type IHttpMethodLowercase = keyof typeof HttpMethodUppercase;
