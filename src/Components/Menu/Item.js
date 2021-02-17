import './Item.css';
import Component from 'Components/Component.js';

export default class Item extends Component {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) {
        element.classList.add('menu-item');
        element.innerText = options.title;
        element.addEventListener('click', () => {
            let event = document.createEvent('Event');
            event.initEvent('item:click', false, false);
            event.detail = options.id;
            this.dispatchEvent(event);
        });
    }
};