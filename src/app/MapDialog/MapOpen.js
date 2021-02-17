import './MapOpen.css';
import * as Components from 'Components/index.js';
import MapItem from './MapItem.js';
import T from './strings.js';

const List =  Components.List.List;

export default class MapOpen extends Components.Dialog {
    constructor() {
        super({title: T.translate('dialog.map.open'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        this._list = new List(this.content);
        this._list.Item = MapItem;
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