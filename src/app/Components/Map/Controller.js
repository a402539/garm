import CanvasLayer from 'CanvasLayer.js';
import {MapDialog} from 'app/Components/index.js';
import Map from './Map.js';

export default class Controller {
    constructor({container}) {
        this._map = new Map(container, {center: [55.45, 37.37], zoom: 10});
        this._dataManager = new Worker("dataManager.js");
        this._dataManager.onmessage = msg => {
            // console.log('Main dataManager', msg.data);
           const data = msg.data || {};
           const {cmd, layerId, tileKey} = data;
           switch(cmd) {
               case 'rendered':
                   if (data.bitmap && this._layers[layerId]) {
                       this._layers[layerId].rendered(data.bitmap);
                   }
                   break;
               default:
                   console.warn('Warning: Bad message from worker ', data);
                   break;
           }
        };
    }
    async create() {
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
            // const p = this._sidebar.add('map');
            // new MapInfo(p, this._mapInfo);
        }); 
    }
    async open() {
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
                await this.load(layers);
            }
           // const p = this.sidebar.add('map');
           // new MapInfo(p, this._mapInfo);
        });
        dlg.items = data;
    }
    async save() {

    }
    async load (layers) {
        const response = await fetch('maps');
        const data = await response.json();
        this._layers = layers.reduce((a, layer) => {
            const c = new CanvasLayer({dataManager: this._dataManager, layerId: layer.id});
            a[layer.id] = c;
            layer.visible = true;
            if (layer.visible) {
                c.addTo(this._map);
            }
            return a;
        }, {});  
    }
};