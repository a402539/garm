import Component from 'Components/Component.js';
import T from './strings.js';

export default class MapInfo extends Component {
    constructor(container, options) {
        super(container, options);
    }    
    _render(element, options) {
        const {name} = options;
        element.innerHTML = `<div>
            <label>${T.translate('info.map.name')}</label>
            <label>${name}</label>
        </div>`;
    }
};