import './List.css';
import Component from 'Components/Component.js';
import Item from './Item.js';

export default class List extends Component {
    constructor(container, options) {
        super(container, options);
    }
    _render(element, options) { 
        element.classList.add('list');
    }
    set Item (cons) {
        this._itemCons = cons;
    }
    set items(items) {
        this._items = [];
        this._element.innerHTML = '';
        for (let item of items) {
            let el = document.createElement('div');
            this._element.appendChild(el);
            let li;
            if (this._itemCons) {
                li = new this._itemCons(el, item);    
            }
            else {
                li = new Item(el, item);
            }            
            li.addEventListener('item:click', e => {                
                let event = document.createEvent('Event');
                event.initEvent('item:click', false, false);
                event.detail = e.detail;
                this.dispatchEvent(event);
            });
            this._items.push(li);
        }
    }
};