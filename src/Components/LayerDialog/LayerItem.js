import './LayerItem.css';
import {Component} from '@scanex/components';

export default class LayerItem extends Component {
    constructor(container, options) {
        super(container, options);
    }
    render(element, options) {
        element.classList.add('layer-list-item');
        const {id, name} = options;
        element.innerHTML = `<label class="layer-id">${id}</label><label class="layer-name">${name}</label>`;
        element.addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('item:click', false, false);
            event.detail = options;
            this.dispatchEvent(event);
        });
    }
}