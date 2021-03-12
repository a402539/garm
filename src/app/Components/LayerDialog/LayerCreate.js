import './LayerCreate.css';
import {Dialog} from '@scanex/components';
import translate from './strings.js';

export default class LayerCreate extends Dialog {
    constructor() {
        super({title: translate('dialog.layer.create'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        this.content.innerHTML = `<div>
            <label>${translate('dialog.layer.name')}</label>
            <input class="name" type="text" value="" />
        </div>`;
        this._name = this.content.querySelector('.name');
        this.footer.innerHTML = `<button>${translate('dialog.ok')}</button>`;
        this.footer.querySelector('button').addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('ok', false, false);
            this.dispatchEvent(event);
        });
    }
    get name() {
        return this._name.value;
    }
};