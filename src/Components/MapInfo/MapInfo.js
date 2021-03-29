import {Component, Translation} from '@scanex/components';
import LayerInfo from '../LayerInfo/LayerInfo.js';

import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class MapInfo extends Component {
    constructor(container, options) {
        super(container, options);
    }    
    render(element, options) {
        const {id, name} = options;
        this._layers = {};
        element.innerHTML = `<div>
            <label>${translate('info.map.id')}</label>
            <label>${id}</label>
        </div>
        <div>
            <label>${translate('info.map.name')}</label>
            <label>${name}</label>
        </div>
        <div class="layers"></div>`;
        this._layersContainer = element.querySelector('.layers');
    }
    addLayer(layer) {
        this._layers[layer.id] && this._layers[layer.id].destroy();
        this._layers[layer.id] = new LayerInfo(this._layersContainer, layer);
    }
};