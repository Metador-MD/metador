
export class EElement {
    private _element: HTMLElement;

    constructor(element: HTMLElement) {
        this._element = element;
    }

    get element() {
        return this._element;
    }

    setAttrs(attrs: Object = {}) {
        for (const key in attrs) {
            this._element.setAttribute(key, attrs[key]);
        }
    }

    setAttr(key: string, value: string) {
        this._element.setAttribute(key, value);
        return this;
    }

    getAttr(key: string) {
        return this._element.getAttribute(key);
    }
}