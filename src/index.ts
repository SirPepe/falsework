import { html, render } from "uhtml";
import {
  debounce,
  reactive,
  subscribe,
  enhance,
  define,
} from "@sirpepe/ornament";
import type { Captured, QueryResult } from "./types.js";

// Makes all of ornament available
export * from "@sirpepe/ornament";

// Symbol for shadow root storage
export const SHADOW_ROOT: unique symbol = Symbol();

// Semi-automatic define decorator can derive a tag name from a class
export function component<T extends CustomElementConstructor>(
  tagName?: string,
): (target: T, context: ClassDecoratorContext<T>) => T {
  return function (target: T, context: ClassDecoratorContext<T>): T {
    if (!tagName) {
      tagName = Array.from(
        target.name.matchAll(/(?<=_|^)([A-Z]*[a-z]*)|([A-Z]+[a-z]*)/g),
      )
        .flatMap(([part]) => (part ? [part.toLowerCase()] : []))
        .join("-");
    }
    return define<T>(tagName)(target, context);
  };
}

// Needs to be available to users for use with @capture()
export type { Captured };

// Capture decorator's type signature. Ensures that what @capture() says is
// compatible to the method's event argument.
type CaptureDecorator<
  T,
  EventType extends keyof HTMLElementEventMap | string | Event,
  ElementType extends keyof HTMLElementTagNameMap | string | Element,
> = (
  value: (this: T, evt: Captured<EventType, ElementType>) => any,
  context: ClassMethodDecoratorContext<T>,
) => void;

export function capture<
  T extends HTMLElement,
  EventType extends keyof HTMLElementEventMap | string,
  Selector extends string,
>(
  this: unknown,
  eventNames: EventType,
  ...selectors: Selector[]
): CaptureDecorator<T, EventType, NonNullable<QueryResult<Selector>>> {
  return subscribe(
    function (this: FalseworkElement) {
      return this[SHADOW_ROOT];
    },
    eventNames,
    {
      capture: true,
      predicate: (evt) => selectors.some((s) => evt.target?.matches?.(s)),
    },
  );
}

export class FalseworkElement extends HTMLElement {
  [SHADOW_ROOT]: ShadowRoot;

  // Allow subtypes to override shadow root options
  get shadowRootInit(): ShadowRootInit {
    return { mode: "closed" };
  }

  constructor() {
    super();
    this[SHADOW_ROOT] = this.attachShadow(this.shadowRootInit);
  }

  // Automatic string tag
  get [Symbol.toStringTag](): string {
    const stringTag = this.tagName
      .split("-")
      .map((s) => s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase())
      .join("");
    return "HTML" + stringTag + "Element";
  }

  // Wraps uhtml's render() function to make it available to every subclass.
  html(...args: Parameters<typeof html>): ReturnType<typeof html> {
    return html(...args);
  }

  // Wraps uhtml's render() function. If the class has a `css` property, its
  // contents is added in a style tag next to the actual content.
  @reactive()
  @debounce({ fn: debounce.raf() })
  render(): void {
    if (!("template" in this)) {
      return;
    }
    if ("css" in this) {
      render(
        this[SHADOW_ROOT],
        this.html`${this.template}<style>${this.css}</style>`,
      );
    } else {
      render(this[SHADOW_ROOT], this.html`${this.template}`);
    }
  }
}
