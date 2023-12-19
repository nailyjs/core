import { Injectable, UseAspect } from "@nailyjs/core";
import { Component, State, type NailyVueBuilder, Vue } from "@nailyjs/vue";

@Injectable()
class Aspect implements NAOP.Advice {
  nailyAfterExecute(): void | Promise<void> {
    console.log("Hey");
  }

  nailyBeforeExecute(): void | Promise<void> {
    console.log("pong");
  }
}

@Component()
class TestComponent extends Vue implements NailyVueBuilder {
  build(): JSX.Element {
    return <>Children</>;
  }
}

@Component()
export default class RootComponent extends Vue implements NailyVueBuilder {
  @State()
  count = 1;

  addCount() {
    console.log(this);
    this.count++;
  }

  build(): JSX.Element {
    return (
      <div onClick={() => this.addCount()}>
        Hello world, {this.count}
        <TestComponent />
      </div>
    );
  }
}
