import './Menu.css';
import Component from 'Components/Component.js';
import Item from './Item.js';

export default class Menu extends Component {
    constructor(container, options) {
        super(container, options);      
    }
    _render(element, options) {
        element.classList.add('menu');
        this._header = document.createElement('div');
        this._header.classList.add('menu-header');
        this._header.innerText = options.title;        
        element.appendChild(this._header);
        this._children = document.createElement('div');
        this._children.classList.add('menu-children');
        this._children.classList.add('hidden');
        element.appendChild(this._children);
        this._header.addEventListener('click', this._toggle.bind(this));
    }
    open () {
        this._children.classList.remove('hidden');
        let event = document.createEvent('Event');
        event.initEvent('open', false, false);        
        this.dispatchEvent(event);
    }
    close() {
        this._children.classList.add('hidden');
    }
    _toggle () {
        if (this._children.classList.contains('hidden')) {
           this.open();
        }
        else {
            this.close();
        }
    }
    set items(items) {
        this._items = [];
        for (let item of items) {
            let el = document.createElement('div');
            this._children.appendChild(el);
            if (Array.isArray(item.children) && item.children.length) {                                
                let g = new Menu(el, item);
                g.items = item.children;
                this._items.push(g);
            }
            else {
                let leaf = new Item(el, item);
                leaf.addEventListener('item:click', e => {   
                    this.close();                 
                    let event = document.createEvent('Event');
                    event.initEvent('item:click', false, false);
                    event.detail = [this._options.id, e.detail].join('.');
                    this.dispatchEvent(event);
                });
                this._items.push(leaf);
            }
        }
    }
};