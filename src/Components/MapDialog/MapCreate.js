import './MapCreate.css';
import {Dialog, Translation} from '@scanex/components';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class MapCreate extends Dialog {
    constructor() {
        super({title: translate('dialog.map.create'), id: 'dlg', collapsible: false, modal: false, top: 200, left: 400});
    }
    render(element, options) {
        super.render(element, options);
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