import Component from 'Components/Component.js';

export default class Item extends Component {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) { 
        element.classList.add('list-item');
        element.addEventListener('click', e => {
            e.stopPropagation();
            let event = document.createEvent('Event');
            event.initEvent('item:click', false, false);
            event.detail = options;
            this.dispatchEvent(event);
        });      
    }    
};