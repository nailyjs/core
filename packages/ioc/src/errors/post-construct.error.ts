export class PostConstructError {
  constructor(parentError: any) {
    if (parentError instanceof Error)
      Error.captureStackTrace(parentError, parentError.constructor)
  }
}
