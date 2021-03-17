import './MapOpen.css';
import {Dialog} from '@scanex/components';
import MapItem from './MapItem.js';
import List from '../List/List.js';
import Translation from '@scanex/translations';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.addText('en', en);
Translation.addText('ru', ru);

const translate = Translation.getText.bind(Translation);

export default class MapOpen extends Dialog {
    constructor() {
        super({title: translate('dialog.map.open'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        element.classList.add('map-dialog');
        this._list = new List(this.content, MapItem);        
        this._list.on('item:click', e => {            
            let event = document.createEvent('Event');
            event.initEvent('select', false, false);
            event.detail = e.detail;
            this.dispatchEvent(event);
        });
    }
    set items (items) {
        this._list.items = items;
    }
};