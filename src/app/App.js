import './App.css';
import Map from './Map.js';

export default class App {
    constructor(container) {
        this._container = container;
        this._container.innerHTML = `<div class="app">
            <div class="header">
            </div>
            <div class="content">
                <div class="sidebar"></div>
                <div class="map"></div>
            </div>
        </div>`;        
        this._map = new Map(this._container.querySelector('.map'), {center: [55.45, 37.37], zoom: 10});
    }
};