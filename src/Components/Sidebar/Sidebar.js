import Component from '../Component.js';
import Tab from './Tab.js';
import Panel from './Panel.js';

export default class Sidebar extends Component {
    constructor(container) {
        super(container);        
    }
    _render(element) {        
        element.innerHTML = `<div class="tabs"></div>
        <div class="panels"></div>`;
        this._tabs = {};
        this._tabsContainer = element.querySelector('.tabs');
        this._panels = {};
        this._panelsContainer = element.querySelector('.panels');
    }
    add(id) {
        const t = document.createElement('div');
        this._tabsContainer.appendChild(t);
        const tab = new Tab(t, {id});
        this._tabs[id] = tab;
        const p = document.createElement('div');
        this._panelsContainer.appendChild(p);
        const panel = new Panel(p);
        this._panels[id] = panel;
        return panel;
    }
    remove(id) {
        this._tabs[id] && this._tabs[id].destroy();
        delete this._tabs[id];
        this._panels[id] && this._panels[id].destroy();
        delete this._panels[id];
    }
};