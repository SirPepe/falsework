import { expect } from "@esm-bundle/chai";
import { component, FalseworkElement, SHADOW_ROOT } from "../src/index.js";
import { generateTagName } from "./helpers.js";
const test = it;

describe("FalseworkElement", () => {
  test("Smoke test", () => {
    @component(generateTagName())
    class Test extends FalseworkElement {}
    const instance = new Test();
    expect(instance.shadowRoot).to.equal(null);
    expect(instance[SHADOW_ROOT]).to.not.equal(null);
  });

  test("Overriding shadow root options", () => {
    @component(generateTagName())
    class Test extends FalseworkElement {
      get shadowRootInit() {
        return { mode: "open" } as const;
      }
    }
    const instance = new Test();
    expect(instance.shadowRoot).to.not.equal(null);
  });
});
