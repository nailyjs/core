import { Injectable } from "@nailyjs/core/common";

@Injectable()
export class CheckUtilService {
  public checkStringIfRelativePath(str: string) {
    if (typeof str !== "string") return false;
    if (str.startsWith(".") || str.startsWith("/")) {
      throw new Error("src must be a relative path, and cannot start with `.` or `/`");
    }
    return true;
  }
}
