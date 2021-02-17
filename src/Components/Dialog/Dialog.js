import './Dialog.css';
import T from 'Translation.js';
import Component from 'Components/Component.js';

export default class Dialog extends Component {
    constructor({title, id, collapsible = false, modal = false, top, left}) {
        super(document.body, {id, collapsible, modal, top, left});                
        this._titleElement.innerText = title;        
        if (!modal) {
            if (this._id) {
                this._element.setAttribute('id', this._id);
            }
            this._moving = false;
            this._offsetX;
            this._offsetY;
            this._header.addEventListener('mousedown', this._start.bind(this));
            this._element.addEventListener('mousemove', this._move.bind(this));
            window.addEventListener('mouseup', this._stop.bind(this));
        }        
    }    
    get header () {
        return this._header;
    }
    get content () {
        return this._content;
    }
    get footer () {
        return this._footer;
    }    
    _start (e) {
        e.stopPropagation();
        const {clientX, clientY} = e;
        const {top, left} = this._element.getBoundingClientRect();
        this._offsetX = clientX - left;
        this._offsetY = clientY - top;
        this._moving = true;
    }
    _stop () {
        if (this._moving) {
            this._moving = false;
            this._savePosition(this._element);
        }        
    }
    _move (e) {
        if (this._moving) {
            e.stopPropagation();
            const {clientX, clientY} = e;
            this._element.style.left = `${clientX - this._offsetX}px`;
            this._element.style.top = `${clientY - this._offsetY}px`;            
        }
    }
    _toggle(e) {
        e.stopPropagation();
        if (this._btnToggle.classList.contains('minimize')) {
            this._btnToggle.setAttribute('title', T.translate('dialog.maximize'));
            this._btnToggle.classList.remove('minimize');
            this._btnToggle.classList.add('maximize');
            this._content.classList.add('hidden');
            this._footer.classList.add('hidden');
            let event = document.createEvent('Event');
            event.initEvent('minimize', false, false);
            this.dispatchEvent(event);
        }
        else {
            this._btnToggle.setAttribute('title', T.translate('dialog.minimize'));
            this._btnToggle.classList.remove('maximize');
            this._btnToggle.classList.add('minimize');            
            this._content.classList.remove('hidden');
            this._footer.classList.remove('hidden');
            let event = document.createEvent('Event');
            event.initEvent('maximize', false, false);
            this.dispatchEvent(event);
        }
        
    }
    _close(e) {
        e.stopPropagation();
        let event = document.createEvent('Event');
        event.initEvent('close', false, false);
        this.dispatchEvent(event);
    } 
    destroy() {
        if (this._overlay) {
            this._overlay.remove();
        }
        super.destroy();
    }   
    _render(element, {id, collapsible, modal, top, left}) {                                    
        if (modal) {
            this._overlay = document.createElement('div');
            this._overlay.classList.add('dialog-overlay');
            this._overlay.addEventListener('click', e => e.stopPropagation());
            document.body.appendChild(this._overlay);
        }
        else {
            this._id = id;
        }

        element.classList.add('dialog');                    
        
        this._header = document.createElement('div');
        this._header.classList.add('header');

        this._titleElement = document.createElement('label');        
        this._header.appendChild(this._titleElement);

        let buttons = document.createElement('div');
        buttons.classList.add('header-buttons');        

        if (collapsible && !modal) {
            this._btnToggle = document.createElement('i');
            this._btnToggle.setAttribute('title', T.translate('dialog.minimize'));
            this._btnToggle.classList.add('icon');
            this._btnToggle.classList.add('minimize');
            this._btnToggle.addEventListener('click', this._toggle.bind(this));
            buttons.appendChild(this._btnToggle);
        }

        let btnClose = document.createElement('i');
        btnClose.setAttribute('title', T.translate('dialog.close'));
        btnClose.classList.add('icon');
        btnClose.classList.add('close');
        btnClose.addEventListener('click', this._close.bind(this));
        buttons.appendChild(btnClose);

        this._header.appendChild(buttons);

        element.appendChild(this._header);

        this._content = document.createElement('div');
        this._content.classList.add('content');
        element.appendChild(this._content);

        this._footer = document.createElement('div');
        this._footer.classList.add('footer');
        element.appendChild(this._footer);

        this._restorePosition(element, top, left);
    }
    _restorePosition(el, top, left) {        
        if (typeof this._id === 'string' && this._id != '') {
            const pos = window.localStorage.getItem(`${this._id}.position`);            
            const [x, y] = pos && pos.split(',') || [0, 0];
            el.style.top = `${y || top || Math.round (window.innerHeight / 2)}px`;
            el.style.left = `${x || left || Math.round (window.innerWidth / 2)}px`;
        }
        else {
            const r = el.getBoundingClientRect();
            el.style.top = `${top || Math.round (window.innerHeight / 2 - r.height)}px`;
            el.style.left = `${left || Math.round (window.innerWidth / 2 - r.width)}px`;
        }
    }
    _savePosition(el) {
        if (typeof this._id === 'string' && this._id != '') {            
            const {top, left} = el.getBoundingClientRect();
            window.localStorage.setItem(`${this._id}.position`, [left, top].join(','));
        }
    }
};