import './MapItem.css';
import Item from 'Components/List/Item.js';

export default class MapItem extends Item {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) {
        super._render(element, options);
        element.classList.add('map-list-item');
        const {id, name} = options;
        element.innerHTML = `<label class="map-id">${id}</label><label class="map-name">${name}</label>`;        
    }
}