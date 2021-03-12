import './App.css';
import 'icons.css';
import {Menu, Sidebar} from '@scanex/components';
import * as Components from 'Components/index.js';
import translate from './strings.js';

export default class App {
    constructor(container) {
        this._container = container;
        this._container.innerHTML = `<div class="app">
            <div class="header"></div>
            <div class="content"></div>
        </div>`;
        this._mapInfo = {};
        const headerContainer = this._container.querySelector('.header');
        let mapMenu = new Menu(headerContainer, {id: 'map', title: translate('menu.map.title')});
        mapMenu.items = ['create', 'open', 'save'].map(id => {
            return {id, title: translate(`menu.map.${id}`)};
        });        
        let layerMenu = new Menu(headerContainer, {id: 'layer', title: translate('menu.layer.title')});
        layerMenu.items = ['create', 'open'].map(id => {
            return {id, title: translate(`menu.layer.${id}`)};
        });
        mapMenu.on('item:click', async e => {
            console.log(e.detail);            
            switch(e.detail) {
                case 'map.create':
                    await this._createMap();
                    break;
                case 'map.open':
                    await this._openMap();
                    break;
                case 'map.save':
                    await this._saveMap();
                    break;
                default:
                    break;
            }
        })
        .on('expanded', () => {
            layerMenu.expanded = false;
        });
        layerMenu
        .on('item:click', async e => {
            console.log(e.detail);
            switch(e.detail) {
                case 'layer.create':
                    await this._createLayer();
                    break;
                case 'layer.open':
                    await this._openLayer();
                    break;
                default:
                    break;
            }
        })
        .on('expanded', () => {
            mapMenu.expanded = false;
        });        
        const contentContainer = this._container.querySelector('.content');
        this._sidebar = new Sidebar(contentContainer);
        this._controllers = {};
        this._controllers.map = new Components.Map({container: contentContainer}); // map controller
        this._controllers.layers = new Components.Layers({container: contentContainer}); // layers controller
    }    
    async _createMap() {        
        await this._map.create();
    }    
    async _openMap() {        
        await this._map.open();
    }
    async _saveMap() {        
    }
    async _createLayer() {        
        let dlg = new Components.LayerDialog.Create();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('ok', async e => {            
            const response = await fetch('layers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: dlg.name}),
            });
            const {id, name, visible} = await response.json();  
            if (!Array.isArray(this._mapInfo.layers)) {
                this._mapInfo.layers = [];
            }
            this._mapInfo.layers.push({id, name, visible});
            console.log(this._mapInfo);
            dlg.destroy();
            dlg = null;
            
            await this._map.load(this._mapInfo.layers);
            
        });        
    }
    async _openLayer() {
        const response = await fetch('layers');
        const data = await response.json();
        let dlg = new LayerDialog.Open();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('select', async e => {
            const {id, name, visible} = e.detail;
            if (!Array.isArray(this._mapInfo.layers)) {
                this._mapInfo.layers = [];
            }
            this._mapInfo.layers.push({id, name, visible});
            console.log(this._mapInfo);

            await this._map.load(this._mapInfo.layers);

            dlg.destroy();
            dlg = null;
        });
        dlg.items = data;
    }
};