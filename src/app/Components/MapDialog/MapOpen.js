import './MapOpen.css';
import {Dialog} from '@scanex/components';
import MapItem from './MapItem.js';
import translate from './strings.js';

export default class MapOpen extends Dialog {
    constructor() {
        super({title: T.translate('dialog.map.open'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        // this._list = new List(this.content);
        // this._list.Item = MapItem;
        // this._list.on('item:click', e => {            
        //     let event = document.createEvent('Event');
        //     event.initEvent('select', false, false);
        //     event.detail = e.detail;
        //     this.dispatchEvent(event);
        // });
    }
    set items (items) {
        // this._list.items = items;
    }
};