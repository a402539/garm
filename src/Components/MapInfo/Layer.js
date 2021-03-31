import {Component} from '@scanex/components';

export default class Layer extends Component {
    render(element, options) {
        element.classList.add('layer');
        this._options = options;
        const {id, name, visible} = this._options;
        element.innerHTML = `<div data-id="${id}">
            <input type="checkbox" ${visible && 'checked' || ''} />
            <label>${name}</label>
        </div>`;        
        this._chkVisible = element.querySelector('input');
        this._chkVisible.addEventListener('change', e => {
            e.stopPropagation();
            this._options.visible = this._chkVisible.checked;
            let event = document.createEvent('Event');
            event.initEvent('change:visibility', false, false);
            this.dispatchEvent(event);
        });
    }
    get id() {
        return this._options.id;
    }
    get visible () {
        return this._options.visible;
    }
    set visible (visible) {
        this._chkVisible.checked = !!visible;        
    }
};