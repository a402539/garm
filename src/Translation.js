class Translation {
    constructor(){
        this._langs = {};        
        let current = localStorage.getItem('lang');
        if (!current) {
            current = 'ru';            
            localStorage.setItem('lang', current);
        }     
        this._current = current;        
    }
    add (lang, obj) {        
        this._langs[lang] = this._langs[lang] || {};
        this._merge(this._langs[lang], obj);
    }
    _merge(target, obj) {
        for(let k of Object.keys(obj)) {
            if (target[k]) {
                this._merge(target[k], obj[k]);
            }
            else {
                target[k] = obj[k];
            }
        }        
    }
    translate (path) {        
        return this._translate (this._langs[this._current], path);
    }
    _translate (root, path) {
        const i = path.indexOf('.');
        if (i >= 0) {
            return this._translate(root[path.substring(0, i)], path.substring(i + 1));
        }
        else {
            return root[path];
        }
    }
}

export default new Translation();