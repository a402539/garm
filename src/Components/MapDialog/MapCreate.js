import './MapCreate.css';
import {Dialog} from '@scanex/components';
import Translation from '@scanex/translations';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.addText('en', en);
Translation.addText('ru', ru);

const translate = Translation.getText.bind(Translation);

export default class MapCreate extends Dialog {
    constructor() {
        super({title: translate('dialog.map.create'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    _render(element, options) {
        super._render(element, options);
        this.content.innerHTML = `<div>
            <label>${translate('dialog.map.name')}</label>
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