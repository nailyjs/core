import { Injectable } from "@nailyjs/core";
import { Value } from "@nailyjs/core/backend";

@Injectable()
export class ExpressService {
  @Value("naily.backend.express.port")
  public readonly port: number;
}
