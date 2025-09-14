function debounce(fn, delay) {
    let timer;
    return function(...args) {
        const context = this; 
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(context, args);
        }, delay);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export class DomRenderer {
    constructor(options = {}) {
        this.hooks = options.hooks || {};
        this.ctr = new AbortController();
        this.signal = this.ctr.signal;
    }

    abort() {
      this.ctr.abort();
      this.ctr = new AbortController();
      this.signal = this.ctr.signal;
    }

    setSignal(signal) {
        this.signal = signal;
        return this;
    }

    render(vnode) {
        if (Array.isArray(vnode)) return vnode.flatMap(node => this.renderNode(node));
        return this.renderNode(vnode ?? '');
    }

    renderNode(node) {
        if (typeof node === 'function') {
            const result = node();
            return this.render(result);
        }

        if (typeof node === 'string') return document.createTextNode(node);

        if (node == null || node === false) return document.createTextNode('');
        if (typeof node === 'number') return document.createTextNode(String(node));

        const el = document.createElement(node.tag || 'div');


        if ('class' in node) el.className = node.class.trim();

        if ('attr' in node) {
            for (const [key, val] of Object.entries(node.attr)) {
                if (val === false || val == null) continue;
                if (val === true) { el.setAttribute(key, ''); continue; }
                el.setAttribute(key, String(val));
            }
        }

        if ('style' in node) {
            for (const [key, val] of Object.entries(node.style)) {
                if (key.startsWith('--') || key.includes('-')) {
                    el.style.setProperty(key, val);
                } else {
                    el.style[key] = val;
                }
            }
        }

        if ('text' in node) el.appendChild(document.createTextNode(node.text));

        if ('html' in node) el.insertAdjacentHTML('beforeend', node.html);
        
        if (node.children != null && node.children !== false) {
            const children = typeof node.children === 'function' ? node.children() : node.children;
            const rendered = this.render(children);
            const list = Array.isArray(rendered) ? rendered : [rendered];
            list.forEach(child => el.appendChild(child));
        }

        if ('on' in node) {
            for (const [event, val] of Object.entries(node.on)) {
                let fn;
                let options = {};
                const signal = node.signal ?? this.signal;
                if (signal) options.signal = signal;

                if (typeof val === 'function') {
                    fn = val;
                } else if (typeof val === 'object' && typeof val.handler === 'function') {
                    
                    fn = val.handler;

                    if (val.debounce && val.throttle) console.warn('Both debounce and throttle provided. Please use only one.');
                    else if (val.debounce) fn = debounce(fn, val.debounce);
                    else if (val.throttle) fn = throttle(fn, val.throttle);

                    if (typeof val.options === 'object') Object.assign(options, val.options);

                } else {
                    console.warn('Invalid event handler provided for', event);
                    continue;
                }

                el.addEventListener(event, fn, options);
            }
        }

        this.hooks?.onRender?.(node.ref, el);

        return el;
    }

}
