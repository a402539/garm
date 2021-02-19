import './App.css';
import 'icons.css';
import Map from './Map.js';
import * as Components from 'Components/index.js';
import * as MapDialog from './MapDialog/index.js';
import * as LayerDialog from './LayerDialog/index.js';
import MapInfo from './MapInfo/MapInfo.js';
import T from './strings.js';

export default class App {
    constructor(container) {
        this._container = container;
        this._container.innerHTML = `<div class="app">
            <div class="header"></div>
            <div class="content">
                <div class="sidebar"></div>
                <div class="map"></div>
            </div>
        </div>`;
        this._mapInfo = {};
        let mapMenu = new Components.Menu(this._container.querySelector('.header'), {id: 'map', title: T.translate('menu.map.title')});
        mapMenu.items = ['create', 'open', 'save'].map(id => {
            return {id, title: T.translate(`menu.map.${id}`)};
        });
        mapMenu.addEventListener('item:click', async e => {
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
        });
        let layerMenu = new Components.Menu(this._container.querySelector('.header'), {id: 'layer', title: T.translate('menu.layer.title')});
        layerMenu.items = ['create', 'open'].map(id => {
            return {id, title: T.translate(`menu.layer.${id}`)};
        });
        layerMenu.addEventListener('item:click', async e => {
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
        });
        mapMenu.addEventListener('open', () => layerMenu.close());
        layerMenu.addEventListener('open', () => mapMenu.close());
        this._map = new Map(this._container.querySelector('.map'), {center: [55.45, 37.37], zoom: 10});
    }
    get sidebar() {
        this._sidebar = this._sidebar || new Components.Sidebar(this._container.querySelector('.sidebar'));
        return this._sidebar;
    }
    async _createMap() {        
        let dlg = new MapDialog.Create();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('ok', async e => {            
            const response = await fetch('maps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: dlg.name}),
            });
            const {id, name, layers} = await response.json();
            this._mapInfo = {id, name, layers};            
            dlg.destroy();
            dlg = null;
           // const p = this.sidebar.add('map');
           // new MapInfo(p, this._mapInfo);
        });        
    }    
    async _openMap() {
        const response = await fetch('maps');
        const data = await response.json();
        let dlg = new MapDialog.Open();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('select', async e => {            
            const {id, name, layers} = e.detail;
            this._mapInfo = {id, name, layers};
            dlg.destroy();
            dlg = null;
            if (Array.isArray(layers) && layers.length) {
                await this._map.load(layers);
            }
           // const p = this.sidebar.add('map');
           // new MapInfo(p, this._mapInfo);
        });
        dlg.items = data;
    }
    async _saveMap() {
        const response = await fetch('maps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this._mapInfo),
        });
        await response.json();
    }
    async _createLayer() {        
        let dlg = new LayerDialog.Create();
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