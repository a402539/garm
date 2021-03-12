import {Component} from '@scanex/components';
import translate from './strings.js';

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