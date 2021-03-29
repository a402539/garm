import {Controller, Translation} from '@scanex/components';
import CanvasLayer from 'CanvasLayer.js';
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
        this._map = new Map(container, {center: [55.45, 37.37], zoom: 10});        
        this._dataManager = new Worker("dataManager.js");
        this._dataManager.onmessage = msg => {
            // console.log('Main dataManager', msg.data);
           const data = msg.data || {};
           const {cmd, layerId, items} = data;
           switch(cmd) {
               case 'rendered':
                   if (this._layers[layerId]) {
                       this._layers[layerId].rendered(data.bitmap);
                   }
                   break;
               case 'mouseover':
					this._map._map.getContainer().style.cursor = items ? 'pointer' : '';
					if (this._layers[layerId]) {
						this._layers[layerId].mouseOver(items);
					}
                   break;
               default:
                   console.warn(translate('worker.message.bad'), data);
                   break;
           }
        };
        this._map.on('moveend', e => {
            const msg = {...e.detail, cmd: 'moveend'};
            this._dataManager.postMessage(msg);
        });
        this._map.on('eventCheck', e => {
            const msg = {...e.detail, cmd: 'eventCheck'};
            this._dataManager.postMessage(msg);
        });
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
                        this._mapInfo = e.detail;
                        this.clear();
                        Array.isArray(this._mapInfo.layers) && this._mapInfo.layers.forEach(layer => {
                            layer.visible = true;
                            this.addLayer(layer);
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
        await this._httpPut('maps', this._mapInfo);        
    }
    clear() {
        Object.keys(this._layers).forEach(id => {
            this._map.removeLayer(this._layers[id]);
        });   
    }      
    addLayer(layer) {        
        const c = new CanvasLayer({dataManager: this._dataManager, layerId: layer.id});
        this._layers[layer.id] = c;        
        if (layer.visible) {
            this._map.addLayer(c);
        }
    }
    expand() {
        this._map.expand();
    }
    collapse() {
        this._map.collapse();
    }
};