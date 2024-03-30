import { IToken } from "@/common";
import { AbstractCoreException } from "../base.exception";
import { redBright } from "chalk";

export class TokenExistException extends AbstractCoreException {
  constructor(incomingToken: IToken, ctxName: string = "global") {
    super();
    this.tableOptions.title = redBright`!Token Exist!`;
    this.tableOptions.rows.push({ "Exist Token": incomingToken, "Parent Context": ctxName });
    console.error(this.renderTable());
  }
}
