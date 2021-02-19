import Evented from 'Evented';

export default class Component extends Evented {
    constructor(container, options) {
        super();        
        this._element = document.createElement('div');
        this._element.classList.add('component');
        container.appendChild(this._element);
        this._options = options;
        this._render(this._element, options);
    }
    destroy () {
        this._element.remove();
    }
    forwardEvent(e) {
        e.stopPropagation();
        let event = document.createEvent('Event');
        event.initEvent(e.type, false, false);
        event.detail = e.detail;
        this.dispatchEvent(event);
    }
    _render(element, options) {
    }
    get element () {
        return this._element;
    }
};