import './MapItem.css';
import {Component} from '@scanex/components';
import Translation from '@scanex/translations';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.addText('en', en);
Translation.addText('ru', ru);

const translate = Translation.getText.bind(Translation);

export default class MapItem extends Component {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) {        
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