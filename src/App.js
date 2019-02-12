import React, { Component } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import './App.css';

let myIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
  // iconSize: [38, 95],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
  shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  // shadowSize: [68, 95],
  // shadowAnchor: [22, 94],
});

export default class App extends Component {
  state = {
    lat: -23.561584,
    lng: -46.656093,
    zoom: 19,
  };

  render() {
    const position = [this.state.lat, this.state.lng];

    return (
      <Map id="map" center={position} zoom={this.state.zoom} maxZoom={19}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={myIcon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>

        <FeatureGroup>
          <EditControl
            position="topright"
            onEdited={this._onEditPath}
            onCreated={this._onCreate}
            onDeleted={this._onDeleted}
            draw={{ rectangle: false }}
          />
        </FeatureGroup>
      </Map>
    );
  }
}
