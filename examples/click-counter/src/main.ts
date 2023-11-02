/* eslint-disable */

import {
  type Captured,
  FalseworkElement,
  attr,
  number,
  capture,
  subscribe,
} from "@sirpepe/falsework";
import { component } from "../../../src/index.js";

// Extending from FalseworkElement gets you the following:
// 1. The decorator @component() registers the class as a custom element, with a
//    tag name derived from the class name. Camel cased or snake cased class
//    names are turned into kebab case and used as tag names. This can by
//    overridden by passing a tag name to @component().
// 2. A closed shadow root, kept semi-private behind a symbol, is set up. The
//    Shadow DOM is, in most cases, an implementation detail that you will not
//    need to interact with directly.
// 3. Automatic rendering of a pre-defined template on internal state changes,
//    complete with CSS (see below)
// 4. An automatic string tag that nicely stringifies the element in, for
//    example, error messages.
@component()
export class ClickCounter extends FalseworkElement {
  // Defines content attributes alongside corresponding getter/setter pairs
  // for a JS api AND attribute change handling AND type checking (and in this
  // case also bounds checking and non-NaN checking for numbers). The component
  // automatically re-renders when any property decorated with @attr() or
  // @prop() updates.
  @attr(number({ min: 0 })) accessor up = 0;
  @attr(number({ min: 0 })) accessor down = 0;

  // Captures events from the Shadow DOM, filtered by event name and selector
  @capture("click", "button.vote-up, button.vote-down")
  #handleUpdate(evt: Captured<MouseEvent, "button">): void {
    // Note that TypeScript understands that evt.target is neither null nor just
    // "EventTarget", thanks to the helper type Captured<E, T>. The type
    // expresses an Event of type E with a target T. E defaults to Event and T
    // defaults to Elements, so you don't have to wrangle the generics unless
    // you are actually interested in the specifics of the event and its target.
    if (evt.target.matches(".vote-up")) {
      this.up++;
    } else if (evt.target.matches(".vote-down")) {
      this.down++;
    }
  }

  // Ornament's basic decorators remain available. This one listens for a global
  // event on "window" to coordinate resets.
  @subscribe(window, "reset")
  #handleReset() {
    this.up = this.down = 0;
  }

  // Defines CSS to inject into the shadow root for each component. This is
  // optional.
  get css() {
    return `.result { font-weight: bold }`;
  }

  // Defines the template to render in the component's shadow DOM, at most one
  // per frame.
  get template() {
    return this.html`
<p>
  <button class="vote-up">👍 ${this.up}</button>
  <span class="result">${this.up - this.down}</span>
  <button class="vote-down">👎 ${this.down}</button>
</p>`;
  }
}
