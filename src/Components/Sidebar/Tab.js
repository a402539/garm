import Component from '../Component.js';

export default class Tab extends Component {
    constructor(container) {
        super(container);
    }
    _render(element, options) {
        const {id, title} = options;
        element.classList.add('sidebar-tab');
        element.innerHTML = `<i class="${id}"></i><div>${title}</div>`;
        element.addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('tab:click', false, false);
            event.detail = id;
            this.dispatchEvent(event);
        });
    }
    get id() {
        return this._options.id;
    }
};