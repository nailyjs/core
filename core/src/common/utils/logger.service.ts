import { green, yellow, red, blue } from "chalk";
import { Injectable } from "../decorators/injectable.decorator.js";

export interface LoggerService {
  log<Message>(message: Message, category?: string): void;
  warn<Message>(message: Message, category?: string): void;
  error<Message>(message: Message, category?: string): void;
  debug<Message>(message: Message, category?: string): void;
}

@Injectable()
export class Logger implements LoggerService {
  log<Message>(message: Message, category: string = "Naily"): void {
    console.log(green(`LOG   ${new Date().toLocaleString()} [${category}] ${message}`));
  }
  warn<Message>(message: Message, category: string = "Naily"): void {
    console.warn(yellow(`WARN  ${new Date().toLocaleString()} [${category}] ${message}`));
  }
  error<Message>(message: Message, category: string = "Naily"): void {
    console.error(red(`ERROR ${new Date().toLocaleString()} [${category}] ${message}`));
  }
  debug<Message>(message: Message, category: string = "Naily"): void {
    console.debug(blue(`DEBUG ${new Date().toLocaleString()} [${category}] ${message}`));
  }
}
