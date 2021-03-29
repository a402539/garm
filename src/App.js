import './App.css';
import './icons.css';
import {Menu, Sidebar, Controller, Notification, Translation} from '@scanex/components';
import * as Components from 'Components/index.js';
import en from './strings.en.json';
import ru from './strings.ru.json';
import MapInfo from './Components/MapInfo/MapInfo';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class AppController extends Controller {
    constructor(container) {
        super();
        this._notification = new Notification();
        this._container = container;
        this._container.innerHTML = `<div class="app">
            <div class="header"></div>
            <div class="content"></div>
        </div>`;        
        const headerContainer = this._container.querySelector('.header');
        
        let mapMenu = new Menu(headerContainer, {id: 'map', title: translate('menu.map.title')});                
        let layerMenu = new Menu(headerContainer, {id: 'layer', title: translate('menu.layer.title')});        
        
        mapMenu.on('item:click', this._mapMenuHandler.bind(this)).on('expanded', () => layerMenu.expanded = false);
        layerMenu.on('item:click', this._layersMenuHandler.bind(this)).on('expanded', () => mapMenu.expanded = false);

        mapMenu.items = ['create', 'open', 'save'].map(id => {
            return {id, title: translate(`menu.map.${id}`)};
        });
        layerMenu.items = ['create', 'open'].map(id => {
            return {id, title: translate(`menu.layer.${id}`)};
        });

        const contentContainer = this._container.querySelector('.content');
        this._sidebar = new Sidebar(contentContainer);
        this._sidebar.on('tab:click', () => {
            if (this._sidebar.current) {
                this._controllers.map.expand();
            }
            else {
                this._controllers.map.collapse();
            }            
        });
        this._controllers = {};
        this._controllers.map = new Components.Map({container: contentContainer}); // map controller         
        this._controllers.layers = new Components.Layers({container: contentContainer}); // layers controller
        this._controllers.layers.on('open', e => {
            let layer = e.detail;
            layer.visible = true;
            this._controllers.map.addLayer(layer);            
            this._mapInfo && this._mapInfo.addLayer(layer);
        });
        
        Object.keys(this._controllers).forEach(k => {
            this._controllers[k].notification = this._notification;
        });
    }

    async _mapMenuHandler(e) {
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
    }

    async _layersMenuHandler(e) {
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
    }

    async _createMap() {        
        await this._controllers.map.create();
    }

    async _openMap() {        
        const data = await this._controllers.map.open();
        if (data) {
            let panel = this._sidebar.getPanelContainer('map');
            const {id, name} = data;
            if (!panel) {                
                panel = this._sidebar.add('map', translate('sidebar.map.title'));
                this._controllers.map.collapse();
                this._mapInfo = new MapInfo(panel, {id, name});
            }
            else if (this._mapInfo) {
                this._mapInfo.destroy();
                this._mapInfo = new MapInfo(panel, {id, name});
            }
        }
    }

    async _saveMap() {
        await this._controllers.map.save();        
    }

    async _createLayer() {        
        await this._controllers.layers.create();
    }

    async _openLayer() {
        const data = await this._controllers.layers.open();
        if (data && this._mapInfo) {                                           
            this._mapInfo.addLayer(data);            
        }
    }
};