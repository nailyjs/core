import { Jexl } from "jexl";

export class NailyRegistry {
  public static readonly map = new Map<string | symbol, NIOC.Registry.Element>();
  public static readonly jexl = new Jexl();
}
