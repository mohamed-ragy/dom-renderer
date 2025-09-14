# @ragyjs/dom-renderer

Lightweight, zero-dependency DOM renderer for building tiny UI components without frameworks.

- **Zero deps**
- **Pure ESM**
- **Event helpers:** debounce/throttle
- **Abortable listeners** via `AbortController`

---

## Install

```bash
npm i @ragyjs/dom-renderer
```

> This package is ESM-only. Use Node 18+ or any modern bundler for the browser.

---

## Import

```js
import { DomRenderer } from '@ragyjs/dom-renderer';
```

---

## Quick start

```html
<div id="app"></div>
<script type="module">
  import { DomRenderer } from '@ragyjs/dom-renderer';

  const r = new DomRenderer();

  const vnode = {
    tag: 'button',
    class: 'btn',
    text: 'Click me',
    on: {
      click: () => alert('Hello!')
    }
  };

  const out = r.render(vnode);
  (Array.isArray(out) ? out : [out]).forEach(n =>
    document.getElementById('app').appendChild(n)
  );
</script>
```

---

## VNode schema

A VNode can be:

- `string | number | null | false`
- A function returning a VNode or VNode[]
- An object:

```ts
type VNode =
  | string | number | null | false
  | (() => VNode | VNode[])
  | {
      tag?: string;                // default: 'div'
      class?: string;              // applied as className
      attr?: Record<string, string | number | boolean | null | undefined>;
      style?: Record<string, string | number | null | undefined>;
      text?: string | number;
      html?: string;               // trusted HTML
      children?: VNode | VNode[] | (() => VNode | VNode[]);
      on?: Record<string,
        Function | {
          handler: Function;
          debounce?: number;       // ms
          throttle?: number;       // ms (leading)
          options?: AddEventListenerOptions; // e.g. { passive: true }
        }
      >;
      ref?: any;                   // passed through to hooks.onRender
      signal?: AbortSignal;        // overrides renderer default signal
    };
```

---

## Renderer API

```ts
new DomRenderer(options?: {
  hooks?: {
    onRender?: (ref: any, el: Element) => void;
  };
});

render(vnode: VNode): Node | Node[];
abort(): void;                     // abort current listeners and reset controller
setSignal(signal: AbortSignal): this;
```

### Hooks

- `onRender(ref, el)` — called after every node is created and wired.  
  `ref` is whatever you put on the VNode (`node.ref`), untouched.

---

## Events

You can pass handlers as functions:

```js
on: { click: (e) => { /* ... */ } }
```

…or with an options object:

```js
on: {
  input: {
    handler: onInput,
    debounce: 300,                      // or use throttle: 200
    options: { passive: true }
  }
}
```

**Abortable listeners** (recommended): listeners use `signal` when present.

```js
const r = new DomRenderer();
const ctrl = new AbortController();
r.setSignal(ctrl.signal);

const vnode = {
  tag: 'button',
  text: 'Abortable',
  on: { click: () => console.log('clicked') }
};

// later:
ctrl.abort();   // removes listeners bound with this signal
```

> If a VNode contains `signal`, it overrides the renderer default for that node.

---

## Attributes & styles

```js
attr: {
  id: 'save',
  disabled: true,      // boolean true emits the attribute
  'data-kind': 'primary'
},
style: {
  width: '200px',
  '--accent': '#09f',  // custom properties supported
}
```

---

## Children

- Array, single VNode, or a function that returns them.

```js
children: [
  { tag: 'h2', text: 'Title' },
  () => ({ tag: 'p', text: 'Lazy child' })
]
```

---

## HTML (trusted)

```js
{ html: '<strong>Trusted</strong> content' } // beware XSS if user input reaches this
```

> **Security:** `html` is inserted as raw HTML. Only use trusted content.

---

## Return type

`render()` returns `Node | Node[]`. Normalize when mounting:

```js
const out = r.render(vnode);
for (const n of (Array.isArray(out) ? out : [out])) root.appendChild(n);
```

---

## SSR

This package targets the browser and uses `document` during rendering.

---

## License

MIT © Ragy — see [LICENSE](./LICENSE)
