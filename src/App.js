import React, { Component } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import MarkerIcon from 'leaflet/dist/images/marker-icon.png';
import MarkerShadow from 'leaflet/dist/images/marker-shadow.png';

import './App.css';

let myIcon = L.icon({
  iconUrl: MarkerIcon,
  shadowUrl: MarkerShadow,
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

export default class App extends Component {
  state = {
    lat: -23.561584,
    lng: -46.656093,
    zoom: 19,
  };

  _onCreated = e => {
    console.log('created something:', e);
  };

  _onEdited = e => {
    console.log('edited something:', e);
    e.layers.eachLayer(layer => {
      //do whatever you want; most likely save back to db
      console.log('layer:', layer);
    });
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
            onCreated={this._onCreated}
            onEdited={this._onEdited}
            // onDeleted={this._onDeleted}
            // draw={{ rectangle: false }}
          />
        </FeatureGroup>
      </Map>
    );
  }
}
