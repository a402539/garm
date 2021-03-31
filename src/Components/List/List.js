import {Component} from '@scanex/components';
import './List.css';

export default class List extends Component {    
    get items() { 
        return this._items;       
    }
    set items(items) {
        const Item = this._itemFactory;
        this.element.innerHTML = '';
        this._items = items.map(options => new Item(this.element, options));
    }
    render(element, itemFactory) {
        this._itemFactory = itemFactory;
        element.classList.add('scanex-component-list');
    }
};