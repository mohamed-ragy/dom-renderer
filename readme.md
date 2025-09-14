# @ragyjs/dom-renderer

A **tiny DOM renderer** for building UI without frameworks.  
It converts plain JS objects into real DOM nodes, with support for:

-   **Attributes & styles**
-   **Children**
-   **Dynamic children with functions**
-   **Event listeners** (with debounce & throttle)
-   **Abortable listeners** via `AbortController`
-   **Zero dependencies**

---

## ❓ When to use DomRenderer

DomRenderer is useful when you need to build **lightweight UI components** without pulling in heavy frameworks.

---

## 📦 Installation

```bash
npm install @ragyjs/dom-renderer
```

> ESM-only. Works with Node 18+ or any modern bundler (Vite, Webpack, etc.).

---

## 🚀 Quick Example

```html
<div id="app"></div>
```

```js
import { DomRenderer } from "@ragyjs/dom-renderer";

const r = new DomRenderer();


const vnode = {
    tag: "button",
    class: "btn",
    text: "Click me!",
    on: {
        click: () => alert("Hello World"),
    },
};

const root = document.getElementById('app');

const node = r.render(vnode);

Array.isArray(node)
    ? root.append(...node)
    : root.append(out);
```

---

## 🔧 VNode structure

A VNode can be:

-   Primitive: `string | number | null | false`
-   Function returning a VNode
-   Object with the following keys:

```ts
{
  tag?: string;     // default: 'div'
  class?: string;
  attr?: Record<string, any>;
  style?: Record<string, any>;
  text?: string | number;
  html?: string;    // trusted HTML
  children?: VNode | VNode[] | (() => VNode | VNode[]);
  on?: Record<string,
    Function | {
      handler: Function;
      debounce?: number;    // ms
      throttle?: number;    // ms
      options?: AddEventListenerOptions;
    }
  >;
  ref?: any;
  signal?: AbortSignal;     // overrides default signal
}
```

---

## ⚙️ API

### `new DomRenderer(options?)`

-   `options.hooks.onRender(ref, el)` → called after each node is created.

### `render(vnode)`

-   Returns a `Node` or `Node[]`.

### `abort()`

-   Aborts all listeners registered with the **renderer’s current signal**.

### `setSignal(signal)`

-   Use this only if you need to attach a **custom signal**.
-   In most cases, you don’t need it — calling `.abort()` on the renderer is enough.

---

## 🎛 Events

-   Simple function:
    ```js
    on: {
        click: () => console.log("clicked");
    }
    ```
-   With debounce/throttle & options:
    ```js
    on: {
      input: {
        handler: onInput,
        debounce: 300,
        options: { passive: true }
      }
    }
    ```

### Abortable listeners

Each `DomRenderer` has its own built-in `AbortController`.  
That means you can call `.abort()` on the renderer directly to remove its listeners — no need to call `setSignal()` unless you want to share signals across multiple renderers.

```js
const r = new DomRenderer();

const vnode = {
    tag: "button",
    text: "Abortable",
    on: { click: () => console.log("X") },
};
document.body.appendChild(r.render(vnode));

// later
r.abort(); // removes all listeners for this renderer
```

If you want multiple renderers (or other code) to share the same signal, then you can use `setSignal(signal)`.  
But for most usage, **`.abort()` is all you need**.

---

## 🎨 Attributes & Styles

```js
attr: {
  id: 'save',
  disabled: true,
  'data-role': 'primary'
},
style: {
  width: '200px',
  '--accent': '#09f'
}
```

---

## 👶 Children

```js
children: [
    { tag: "h2", text: "Title" },
    () => ({ tag: "p", text: "Generated child" }),
];
```

```js
const animals = ["monkey", "cat", "dog", "banana"];
const vnode = {
    tag: "ul",
    children: [
        () =>
            animals.map((item) => {
                if (item === "banana") {
                    return {
                        tag: "li",
                        text: `🍌 oh no! ${item} is not an animal 😆`,
                    };
                }
                return { tag: "li", text: `🐾 I am a ${item}` };
            }),
    ],
};
```

---

## ⚠️ HTML (trusted only)

```js
{
    html: "<strong>Trusted</strong> content";
}
```

> Be careful: raw HTML can cause XSS if user input is injected.

---

## 📜 License

MIT © Ragy — see [LICENSE](./LICENSE)
