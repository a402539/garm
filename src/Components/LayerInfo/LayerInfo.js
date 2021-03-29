import {Component, Translation} from '@scanex/components';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class LayerInfo extends Component {
    constructor(container, options) {
        super(container, options);
    }
    render(element, options) {
        element.classList.add('layer-info');
        const {id, name} = options;
        element.innerHTML = `<div data-id="${id}">${name}</div>`;
    }
};