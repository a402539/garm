import './LayerOpen.css';
import {Dialog} from '@scanex/components';
import LayerItem from './LayerItem.js';
import translate from './strings.js';

export default class LayerOpen extends Dialog {
    constructor() {
        super({title: translate('dialog.layer.open'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        // this._list = new List(this.content);
        // this._list.Item = LayerItem;
        // this._list.on('item:click', e => {            
        //     let event = document.createEvent('Event');
        //     event.initEvent('select', false, false);
        //     event.detail = e.detail;
        //     this.dispatchEvent(event);
        // });
    }
    set items (items) {
        this._list.items = items;
    }
};