import './MapItem.css';
import {Component} from '@scanex/components';
// import Item from 'Components/List/Item.js';

export default class MapItem extends Component {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) {        
        element.classList.add('map-list-item');
        const {id, name} = options;
        element.innerHTML = `<label class="map-id">${id}</label><label class="map-name">${name}</label>`;        
    }
}