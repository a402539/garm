import './MapItem.css';
import {Component, Translation} from '@scanex/components';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class MapItem extends Component {
    constructor(container, options) {
        super(container, options);
    }
    render(element, options) {        
        element.classList.add('map-list-item');
        const {id, name} = options;
        element.innerHTML = `<label class="map-id">${id}</label><label class="map-name">${name}</label>`;
        element.addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('item:click', false, false);
            event.detail = options;
            this.dispatchEvent(event);
        });    
    }
}