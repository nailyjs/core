import { Component, State, type NailyVueBuilder, Vue } from "@nailyjs/vue";

@Component()
export default class RootComponent extends Vue implements NailyVueBuilder {
  @State()
  count = 1;

  build(): JSX.Element {
    return (
      <div
        onClick={() => {
          this.count++;
        }}
      >
        Hello world, {this.count}
      </div>
    );
  }
}
