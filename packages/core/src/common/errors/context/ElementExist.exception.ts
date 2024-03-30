import { IElement } from "@/typings";
import { redBright } from "chalk";
import { AbstractCoreException } from "../base.exception";

export class ElementExistException extends AbstractCoreException {
  constructor(ele: IElement, ctxName = "global") {
    super();
    this.tableOptions.title = redBright`!Element Exist!`;
    if (ele.kind === "class") {
      this.tableOptions.rows.push({
        kind: ele.kind,
        "Exist Class": ele.target.name,
        "Parent Context": ctxName,
        Tokens: ele.tokens.join(", "),
        isInitialized: ele.instance ? "Yes" : "No",
        scope: ele.scope,
      });
    } else if (ele.kind === "constant") {
      this.tableOptions.rows.push({
        kind: ele.kind,
        "Exist Constant": ele.tokens.join(","),
        "Parent Context": ctxName,
        Value: ele.value,
      });
    }
    console.error(this.renderTable());
  }
}
