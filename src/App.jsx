import React, { Component, Fragment } from 'react';
// import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, FeatureGroup, Polygon, Polyline } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import SaveIcon from '@material-ui/icons/Save';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import GeoData from './files/data.json';

import './App.css';

// only 'features', with only 'points', 'polygons' and 'linestrings'
class MyGeoJSON extends Component {
  render() {
    return this.props.data.features.map((feature, index) => {
      const { type, coordinates } = feature.geometry;
      if (type === 'Point') {
        const [lng, lat] = coordinates;
        return (
          <Marker key={index} position={[lat, lng]}>
            <Popup>I was created programatically</Popup>
          </Marker>
        );
      } else if (type === 'Polygon') {
        const positions = coordinates[0].map(([lng, lat]) => [lat, lng]);
        return <Polygon key={index} positions={positions} />;
      } else {
        //type === 'LineString'
        const positions = coordinates.map(([lng, lat]) => [lat, lng]);
        return <Polyline key={index} positions={positions} />;
      }
    });
  }
}

export default class App extends Component {
  state = {
    lat: -23.562134,
    lng: -46.654993,
    zoom: 21,
  };
  objects = [];

  saveObjects = () => localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));

  _onCreated = e => this.saveObjects();

  _onEdited = e => this.saveObjects();

  _onDeleted = e => this.saveObjects();

  _onFeatureGroupReady = featureGroupRef => {
    this.objects = featureGroupRef.leafletElement;
    this.saveObjects();
  };

  saveData = () => {
    if (window.confirm('Are you sure you want to save?')) {
      let content = localStorage.getItem('objects');
      let a = document.createElement('a');
      let file = new Blob([content], { type: 'application/json' });
      a.href = URL.createObjectURL(file);
      a.download = 'GeoJSON.json';
      a.click();
    }
  };

  loadData = e => {
    let fr = new FileReader();
    fr.onload = () => {
      localStorage.setItem('objects', fr.result);
      window.location.reload();
    };
    fr.readAsText(e.target.files[0]);
  };

  render() {
    const position = [this.state.lat, this.state.lng];

    let geoData = JSON.parse(localStorage.getItem('objects'));
    if (!geoData) {
      geoData = GeoData;
    }

    return (
      <Fragment>
        <button onClick={this.saveData} title="Save to GeoJSON file" className="action" id="save-button">
          <SaveIcon />
        </button>

        <div title="Load from GeoJSON file" className="action" id="load-button">
          <SaveAltIcon />
          <input type="file" onChange={this.loadData} />
        </div>

        <Map id="map" center={position} zoom={this.state.zoom} maxZoom={22}>
          <TileLayer
            url="https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey={apikey}"
            apikey="898c4d67a8cb42a39705b6e58be006ea"
            attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <FeatureGroup ref={this._onFeatureGroupReady}>
            <EditControl
              position="topright"
              onCreated={this._onCreated}
              onEdited={this._onEdited}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              draw={{ circle: false, circlemarker: false }}
            />
            <MyGeoJSON data={geoData} />
          </FeatureGroup>
        </Map>
      </Fragment>
    );
  }
}
