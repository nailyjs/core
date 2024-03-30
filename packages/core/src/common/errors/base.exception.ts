import { Table } from "console-table-printer";
import { ComplexOptions } from "console-table-printer/dist/src/models/external-table";

export abstract class AbstractCoreException extends Error {
  protected readonly tableOptions: ComplexOptions = {
    rows: [],
    columns: [],
  };

  constructor() {
    super();
  }

  renderTable() {
    const table = new Table(this.tableOptions).render();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete this.tableOptions;
    return table;
  }
}
