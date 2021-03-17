import {Component} from '@scanex/components';
import Translation from '@scanex/translations';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.addText('en', en);
Translation.addText('ru', ru);

const translate = Translation.getText.bind(Translation);

export default class MapInfo extends Component {
    constructor(container, options) {
        super(container, options);
    }    
    _render(element, options) {
        const {name} = options;
        element.innerHTML = `<div>
            <label>${translate('info.map.name')}</label>
            <label>${name}</label>
        </div>`;
    }
};