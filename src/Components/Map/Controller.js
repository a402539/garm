import {Controller, Translation} from '@scanex/components';

import * as MapDialog from 'Components/MapDialog/index.js';
import Map from './Map.js';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.add('en', en);
Translation.add('ru', ru);

const translate = Translation.translate;

export default class MapController extends Controller {
    constructor({container}) {
        super();
        this._layers = {};        
        this._map = new Map(container, {center: [55.45, 37.37], zoom: 1});
    }
    async create() {
        let dlg = new MapDialog.Create();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('ok', async e => {                        
            dlg.destroy();
            dlg = null;
            const {ok, result} = await this._httpPost('maps',{name: dlg.name});
            if (ok) {
                const {id, name, layers} = result;            
            }            
        }); 
    }
    open() {
        return new Promise((resolve, reject) => {
            this._httpGet('maps').then(({ok, result}) => {
                if (ok) {
                    this._layers = {};
                    let dlg = new MapDialog.Open();
                    dlg.on('close', () => {
                        dlg.destroy();
                        dlg = null;
                        reject();
                    });
                    dlg.on('select', async e => {                                                    
                        dlg.destroy();
                        dlg = null;
                        const {id, name, layers} = e.detail;
                        this._mapInfo = {id, name, layers};
                        this.clear();
                        Array.isArray(this._mapInfo.layers) && this._mapInfo.layers.forEach(layer => {
                            layer.visible = true;
                            this._map.addLayer(layer.id);
                        });
                        resolve(this._mapInfo);
                    });
                    dlg.items = result;
                }
                else {
                    reject();
                }
            });              
        });              
    }
    async save() {
        await this._httpPut(`maps/${this._mapInfo.id}`, this._mapInfo);
    }
    clear() {
        Array.isArray(this._mapInfo.layers) && this._mapInfo.layers.forEach(layer => {
            this._map.removeLayer(layer.id);
        });
    }
    addLayer(layer) {
        this._mapInfo.layers = Array.isArray(this._mapInfo.layers) && this._mapInfo.layers || [];
        layer.maps = Array.isArray(layer.maps) && layer.maps || [];
        layer.maps.push({id: this._mapInfo.id});
        const {id, name, maps, mapLayers} = layer;
        this._mapInfo.layers.push({id, name, maps});
        if (layer.visible) {
            this._map.addLayer(layer.id);
        }
    }
    changeLayerVisibility(layerId, visible) {
        if (visible) {
            this._map.addLayer(layerId);
        }
        else {
            this._map.removeLayer(layerId);
        }        
    }    
    expand() {
        this._map.expand();
    }
    collapse() {
        this._map.collapse();
    }
};