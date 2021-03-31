import './LayerCreate.css';
import {Dialog, Translation} from '@scanex/components';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class LayerCreate extends Dialog {
    constructor() {
        super({title: translate('dialog.layer.create'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    render(element, options) {
        super.render(element, options);
        this.content.innerHTML = `<div>
            <label>${translate('dialog.layer.name')}</label>
            <input class="name" type="text" value="" />
        </div>
        <div>
            <label>${translate('dialog.layer.type.title')}</label>
            <select class="type">
                <option value="0">${translate('dialog.layer.type.canvas')}</option>
                <option value="1">${translate('dialog.layer.type.grid')}</option>
            </select>
        </div>`;
        this._name = this.content.querySelector('.name');        
        this._type = this.content.querySelector('.type');
        this.footer.innerHTML = `<button>${translate('dialog.ok')}</button>`;
        this._btnOK = this.footer.querySelector('button');
        this._btnOK.disabled = true;        
        this._btnOK.addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('ok', false, false);
            this.dispatchEvent(event);
        });
        this._name.addEventListener('keydown', () => this._btnOK.disabled = this._name.value.trim() == '');
    }
    get name() {
        return this._name.value;
    }
    get type() {
        return parseInt(this._type.value, 10);
    }
};