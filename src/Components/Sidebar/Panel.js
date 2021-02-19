import Component from '../Component.js';

export default class Panel extends Component {
    constructor(container) {
        super(container);
    }
    _render(element, options) {
        const {id, title} = options;
        element.classList.add('sidebar-panel');        
    }
    get id() {
        return this._options.id;
    }
};