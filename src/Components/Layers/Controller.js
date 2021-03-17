import {Controller} from '@scanex/components';
import * as LayerDialog from '../LayerDialog/index.js';
import List from '../List/List.js';
import Translation from '@scanex/translations';
import en from './strings.en.json';
import ru from './strings.ru.json';

Translation.addText('en', en);
Translation.addText('ru', ru);

const translate = Translation.getText.bind(Translation);

export default class LayersController extends Controller {
    constructor() {
        super();
    }
    async create() {
        const dlg = new LayerDialog.Create();
        dlg.on('close', () => {
            dlg.destroy();
            dlg = null;
        });
        dlg.on('ok', async e => {            
            const {ok, result} = await this._httpPost('layers', {name: dlg.name});
            if (ok) {
                const {id, name, visible} = result;
            }
            dlg.destroy();
            dlg = null;
        }); 
    }
    async open() {
        const {ok, result} = await this._httpGet('layers');
        if (ok) {
            let dlg = new LayerDialog.Open();
            dlg.on('close', () => {
                dlg.destroy();
                dlg = null;
            });
            dlg.on('select', async e => {                
                dlg.destroy();
                dlg = null;                
                let event = document.createEvent('Event');
                event.initEvent('open', false, false);
                event.detail = e.detail;
                this.dispatchEvent(event);
            });            
            dlg.items = result;
        }
    }
};