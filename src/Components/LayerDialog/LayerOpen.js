import './LayerOpen.css';
import {Dialog, Translation} from '@scanex/components';
import LayerItem from './LayerItem.js';
import List from '../List/List.js';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class LayerOpen extends Dialog {
    constructor() {
        super({title: translate('dialog.layer.open'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    render(element, options) {
        super.render(element, options);
        this._list = new List(this.content, LayerItem);        
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