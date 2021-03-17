import {Component} from '@scanex/components';
import './List.css';

export default class List extends Component {
    constructor(container, itemFactory) {
        super(container);        
        this._itemFactory = itemFactory;
    }
    get items() { 
        return this._items;       
    }
    set items(items) {
        const Item = this._itemFactory;
        this._items = items.map(options => {
            const item = new Item(this.element, options);
            item.on('item:click', this.forwardEvent.bind(this));
            return item;
        });
    }
    _render(element) {
        element.classList.add('scanex-component-list');
    }
};