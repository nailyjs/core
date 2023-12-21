declare global {
  export namespace NMVC {
    export interface ControllerMetadata {
      path: string;
      version: string;
    }
  }
}

export {};
