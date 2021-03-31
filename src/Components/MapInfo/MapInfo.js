import './MapInfo.css';
import {Component, Translation} from '@scanex/components';
import List from '../List/List.js';
import Layer from './Layer.js';

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
        element.classList.add('map-info');
        const {id, name} = options;
        this._layers = {};
        element.innerHTML = `<div class="id">
            <label>${translate('info.map.id')}</label>
            <label>${id}</label>
        </div>
        <div class="name">
            <label>${translate('info.map.name')}</label>
            <label>${name}</label>
        </div>`;        
        this._list = new List(element, Layer);        
    }
    addLayer(layer) {
        this._layers[layer.id] = layer;
        this._list.items = Object.keys(this._layers).map(id => this._layers[id]);
        for (let item of this._list.items) {
            item.on('change:visibility', e => {            
                let event = document.createEvent('Event');
                event.initEvent('layer:visible', false, false);
                const {id, visible} = item;
                event.detail = {id, visible};
                this.dispatchEvent(event);
            });
        }
    }
};