import './LayerItem.css';
import Item from 'Components/List/Item.js';

export default class LayerItem extends Item {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) {
        super._render(element, options);
        element.classList.add('layer-list-item');
        const {id, name} = options;
        element.innerHTML = `<label class="layer-id">${id}</label><label class="layer-name">${name}</label>`;
    }
}