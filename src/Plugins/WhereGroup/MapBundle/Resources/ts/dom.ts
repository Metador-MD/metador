export class EElement {
    private _element: HTMLElement;
    constructor(element: HTMLElement){
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

export class dom {
    // private static data = data;

    /**
     *
     * @param tagname
     * @param options
     * @returns {HTMLElement}
     */
    static create(tagname: string, attrs: any = {}, classes: string[] = [], text: string = '', data: any = {}): HTMLElement {
        let element = document.createElement(tagname);
        return dom.add(element, attrs, classes, text, data);
    }

    static add(element: HTMLElement, attrs: any = {}, classes: string[] = [], text: string = '', data: any = {}): HTMLElement {
        for (const key in attrs) {
            element.setAttribute(key, attrs[key]);
        }

        for (const name of classes) {
            element.classList.add(name);
        }
        if (text !== '') {
            element.textContent = text;
        }
        // for (const key in data) {
        //     element.dataset[key] = data[key];
        // }

        return element;
    }

    /**
     *
     * @param selector
     * @returns {NodeListOf<Element>}
     */
    static find(selector: string, context: any = document): NodeListOf<Element> {
        if (context instanceof Document) {
            return context.querySelectorAll(selector);
        } else if (context instanceof HTMLElement) {
            return context.querySelectorAll(selector);
        } else {
            return null; // TODO return a blank NodeListOf<Element>
        }
    }

    /**
     *
     * @param selector
     * @returns {Element|null}
     */
    static findFirst(selector: string, context: any = document): Element {
        if (context instanceof Document) {
            return context.querySelector(selector);
        } else if (context instanceof HTMLElement) {
            return context.querySelector(selector);
        } else {
            return null;
        }
    }

    /**
     *
     * @param element
     * @param name
     * @returns {boolean} true if an element contains a class name
     */
    static hasClass(element: HTMLElement, name: string): boolean {
        return element !== null && element.classList.contains(name);
    };

    /**
     *
     * @param element
     * @param name
     * @returns {Element}
     */
    static addClass(element: HTMLElement, name: string): HTMLElement | null {
        element.classList.add(name);
        return element;
    };

    /**
     *
     * @param element
     * @param name
     * @returns {Element}
     */
    static removeClass(element: HTMLElement, name: string): HTMLElement | null {
        element.classList.remove(name);
        return element;
    };

    /**
     *
     * @param element
     * @param name
     * @returns {Element}
     */
    static toggleClass(element: Element, name: string): Element | null {
        element.classList.remove(name);
        return element;
    }

    //
    // /**
    //  * Returns with element binded data.
    //  * @param element
    //  * @param key
    //  * @returns {any}
    //  */
    // static getData(element: HTMLElement, key: string = null): any {
    //     if (!dom.hasData(element, key)) {
    //         return null;
    //     } else if (key === null) {
    //         return dom.data.get(element);
    //     } else {
    //         return dom.data.get(element)[key];
    //     }
    // }
    //
    // /**
    //  * Binds with an element a data.
    //  * @param element
    //  * @param key
    //  * @param value
    //  */
    // static setData(element: HTMLElement, key: string, value: any): void {
    //     if (!dom.hasData(element)) {
    //         dom.data.set(element, {key: value});
    //     } else {
    //         let tmp = dom.getData(element);
    //         tmp[key] = value;
    //         dom.data.set(element, tmp);
    //     }
    // }
    //
    // /**
    //  * Checks if the element is binding with a data
    //  * @param element
    //  * @param key
    //  * @returns {boolean}
    //  */
    // static hasData(element: HTMLElement, key: string = null): boolean {
    //     if (!dom.data.has(element)) {
    //         return false;
    //     } else if (key === null) {
    //         return true;
    //     } else {
    //         return dom.getData(element)[key] !== null ? true : false;
    //     }
    // }
    //
    // /**
    //  * Deletes with an element binding data
    //  * @param element
    //  * @param key
    //  */
    // static deleteData(element: HTMLElement, key: string = null): void {
    //     if (dom.hasData(element, key)) {
    //         if (key === null) {
    //             dom.data.delete(element);
    //         } else {
    //             let tmp = dom.getData(element);
    //             delete tmp[key];
    //             dom.data.set(element, tmp);
    //         }
    //     }
    // }
}