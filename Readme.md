# Falsework

**+++ THIS IS A WORK IN PROGRESS +++**

A temporary support structure for building frontends with vanilla web
components. From [Wikipedia](https://en.wikipedia.org/wiki/Falsework):

  > Falsework consists of temporary structures used in construction to support a permanent structure until its construction is sufficiently advanced to support itself.

Falsework (this "software") provides of a base class for web components and a
few utilities based on [Ornament](https://www.npmjs.com/package/@sirpepe/ornament).

**This is not a framework**, but just a set of suggestions that help to
eliminate the most tedious bits of building vanilla web components. In terms of
code, Falsework barely exists. You can use it as-is, but I find it much more
useful as a mere starting point that a replace bits and pieces in every time I
use it. The code is meant to be copied and pasted, more than it is meant to be
installed as a software package.

## Example

The following example uses TypeScript to show off, but Falsework does in no way
require TypeScript:

```typescript
import {
  type Captured,
  FalseworkElement,
  attr,
  number,
  capture,
} from "@sirpepe/falsework";

// Extending from FalseworkElement automatically registers the class as a custom
// element with the tag name derived from the class name (in this case
// "click-counter").
export class ClickCounter extends FalseworkElement {
  // Defines content attributes alongside corresponding getter/setter pairs
  // for a JS api AND attribute change handling AND type checking (and in this
  // case also bounds checking and non-NaN checking for numbers).
  @attr(number({ min: 0 })) accessor up = 0;
  @attr(number({ min: 0 })) accessor down = 0;

  // Captures events from the Shadow DOM, filtered by event name and selector
  @capture("click", "button.vote-up, button:vote-down")
  #handleUpdate(evt: Captured<MouseEvent, "button">): void {
    // Note that TypeScript understands that evt.target is neither null nor just
    // EventTarget, thanks to the helper type Captured<E, T>.
    if (evt.target.matches(".vote-up")) {
      this.up++;
    } else if (evt.target.matches(".vote-down")) {
      this.down++;
    }
  }

  // Defines CSS to inject into the shadow root for each component. This is
  // optional.
  get css() {
    return `.result { font-weight: bold }`;
  }

  // Defines the template to render in the component's shadow DOM, at most one
  // per frame. Re-rendering happens automatically every time the class state
  // (content attributes defined with @attr and/or IDL attributes defined with
  // @prop) changes.
  get template() {
    return this.html`
<p>
  <button class="vote-up">👍 ${this.up}</button>
  <span class="result">${this.up - this.down}</span>
  <button class="vote-down">👎 ${this.down}</button>
</p>`;
  }
}
```

## Guide

### General philosophy

### Exit strategy

Every good library should come with an exit strategy as well as install
instructions. Here is how you can get rid of Falsework if you want to migrate
away:

- Components built with Falsework will generally turn out to be very close to
  vanilla web components (and therefore native HTML elements), so
  **they will most probably just keep working** until the heat death of the
  universe. As almost-native elements, your components can probably be used in
  projects that use other frameworks, such as Lit or React without an
  above-average amount much hassle.
- The best way to use Falsework is quite possibly as **a mere template.** You
  can (and maybe should) simply copy much of its source code and modify it to
  your liking. Maybe swap out the rendering logic, partially apply some
  decorators or extend the base class with additional logic specific to your
  use case. Falsework consists of barely anything, and most things can be
  tweaked or replaced.

I personally don't use Falsework as a library, but rather as a template for
custom bare-bones frameworks that are slightly modified between projects. The
best way to migrate away from Falsework is to never use it as-is in the first
place. It is, after all, not a Framework.

### Installation

If you want to ignore the previous section, you *can* install
[@sirpepe/falsework](https://www.npmjs.com/package/@sirpepe/falsework) with your
favorite package manager. To get the decorator syntax working, you will probably
need [@babel/plugin-proposal-decorators](https://babeljs.io/docs/babel-plugin-proposal-decorators)
(with option `version` set to `"2023-05"`) or
[TypeScript 5.0+](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)
(with the option `experimentalDecorators` turned *off*).

## API

### Ornament

Falsework is based on [Ornament](https://www.npmjs.com/package/@sirpepe/ornament)
and exposes Ornament's entire API. Decorators like `@attr()` are the way to go
for defining content attributes.

### Class `FalseworkElement`

A base class for components:

```javascript
import { FalseworkElement } from "@sirpepe/falsework";

class HelloWorld extends FalseworkElement {}
```

Extending from `FalseworkElement` makes your class compatible with Ornament's
decorators (like `@attr()`) and also provides the following additional features:

#### Rendering

Falsework by default bundles [uhtml](https://github.com/WebReflection/uhtml) for
rendering. If you define a getter `template` on your class, its return value
gets rendered into the component's shadow DOM each time the component's data
(accessors decorated with `@prop()` or `@attr()`) changes. You can also define
a getter `css` for styles that need to be injected into the shadow DOM.

```javascript
import { FalseworkElement } from "@sirpepe/falsework";

export class HelloWorld extends FalseworkElement {
  get css() {
    return `:host { font-weight: bold }`;
  }
  get template() {
    // this.html === uhtml's html template tag
    return this.html`<p>Hello World</p>`;
  }
}
```

To customize the shadow root options on a per-class-basis, override the getter
`shadowRootInit` on your classes:

```javascript
import { FalseworkElement } from "@sirpepe/falsework";

export class HelloInput extends FalseworkElement {
  get shadowRootInit() {
    return { mode: "open", delegatesFocus: true };
  }
}
```

The default shadow root options are `{ mode: "closed" }`;

#### Automagic String Tag

### Decorators

#### Decorator `@component(tagName?)`

#### Decorator `@capture(eventNames, selector)`

### Symbols

#### `SHADOW_ROOT`

Key for the shadow roots on `FalseworkElement` instances.

### Types

This section is only relevant for TypeScript users.

#### type `Captured<Event?, Target?>`

Dealing with events in TypeScript sucks, because `target` on `Event` and its
subclasses is always `null | EventTarget`. This is due to two factors that do not
really matter when we use `@capture()`:

1. `target` on `Event` is only `null` *before* the event gets dispatched. But if
   we capture an event using `@capture()`, this is never actually the case - the
   events *have* to have been dispatched in order for us to be able to capture
   them.
2. When not `null`, `target` on `Event` is `EventTarget` because all events can
   be dispatched on any compatible target. But if we use `@capture()`, the
   decorator filters targets by CSS selector, so we *know* that `target` is at
   least `Element`, or some more specific subtype.

The type `Captured<Event?, Target?>` expresses an instance of event subtype
`Event` with the target `Target`. Both `Event` and `Target` are optional and
default to `Event` and `Element` respectively.

```typescript
import { type Captured } from "@sirpepe/falsework";

type T1 = Captured<Event, HTMLButtonElement>;
// = "Event" with "target" typed as "Element"

type T2 = Captured<MouseEvent, HTMLButtonElement>;
// = "MouseEvent" with "target" typed as "HTMLButtonElement"

type T3 = Captured<"click", "button">;
// = "MouseEvent" (Event type for "click" events) with "target" typed as HTMLButtonElement

type T4 = Captured<MouseEvent>;
// = "MouseEvent" with "target" typed as "Element" (default)

type T5 = Captured
// = "Event" (default) with "target" typed as "Element" (default)
```

`Captured` is useful a type for the argument on class methods decorated by
`@capture()`. It lets you use all the fields on the event (especially target)
without you having to do any manual type checking and `@capture()` performs
compile-time type checks to ensure that it is not applied to a method that
expects the wrong event or target:

```typescript
class TestComponent extends FalseworkElement {
  // Type checks: "click" returns MouseEvent, input[type=button] selects <button>
  @capture("click", "input[type=button]")
  a(evt: Captured<MouseEvent, "input">) {
    // allows use of properties specific to MouseEvent and <input>
    console.log(evt.button, evt.target.value);
  }

  // Does NOT type check: incompatible event name "focus" and type "MouseEvent"
  @capture("focus", "input[type=button]")
  b(evt: Captured<MouseEvent, "input">) {}

  // Does NOT type check: incompatible event targets "<input>" and "<video>"
  @capture("focus", "input[type=button]")
  c(evt: Captured<FocusEvent, "video">) {}
}
```
