import React, { Component, Fragment } from 'react';
import L from 'leaflet';
import { Map, TileLayer, FeatureGroup, Polygon, Polyline, CircleMarker } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import leafletIndoor from 'leaflet-indoor-pytek';

import SaveIcon from '@material-ui/icons/Save';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

import GeoData from './files/data.json';

import './App.css';

// only 'features', with only 'points', 'polygons' and 'linestrings'
class MyGeoJSON extends Component {
  render() {
    return this.props.data.features.map((feature, index) => {
      const { properties } = feature;
      const { type, coordinates } = feature.geometry;
      if (type === 'Point') {
        const [lng, lat] = coordinates;
        return <CircleMarker key={index} center={[lat, lng]} properties={properties} />;
      } else if (type === 'Polygon') {
        const positions = coordinates[0].map(([lng, lat]) => [lat, lng]);
        return <Polygon key={index} positions={positions} properties={properties} />;
      } else {
        //type === 'LineString'
        const positions = coordinates.map(([lng, lat]) => [lat, lng]);
        return <Polyline key={index} positions={positions} properties={properties} />;
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
  map = null;
  indoorLayer = null;
  levelControl = null;

  saveObjects = () => localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));

  createLevelControl = () => {
    let geoData = JSON.parse(localStorage.getItem('objects'));
    if (!geoData) {
      geoData = GeoData;
    }
    let indoorLayer = new L.Indoor(geoData, {
      style: feature => ({
        color: '#666',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2,
      }),
    });
    indoorLayer.setLevel('0');
    indoorLayer.addTo(this.map);
    this.indoorLayer = indoorLayer;

    let levelControl = new L.Control.Level({
      level: indoorLayer.getLevel(),
      levels: indoorLayer.getLevels(),
      indoorLayer,
    });
    levelControl.addTo(this.map);
    this.levelControl = levelControl;
  };

  updateLevelControl = () => {
    let currentLevel = this.indoorLayer.getLevel();
    this.indoorLayer.remove();
    this.indoorLayer = new L.Indoor(this.objects.toGeoJSON(), {
      style: feature => ({
        color: '#666',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2,
      }),
    });
    this.indoorLayer.setLevel(currentLevel);
    this.indoorLayer.addTo(this.map);

    this.levelControl.remove();
    this.levelControl = new L.Control.Level({
      level: this.indoorLayer.getLevel(),
      levels: this.indoorLayer.getLevels(),
      indoorLayer: this.indoorLayer,
    });
    this.levelControl.addTo(this.map);
  };

  _onCreated = e => {
    e.layer.feature = {
      type: 'Feature',
      properties: { level: this.indoorLayer.getLevel() },
    };
    this.saveObjects();
    this.updateLevelControl();
  };

  _onEdited = e => {
    this.saveObjects();
    this.updateLevelControl();
  };

  _onDeleted = e => {
    this.saveObjects();
    this.updateLevelControl();
  };

  _onFeatureGroupReady = featureGroupRef => {
    this.objects = featureGroupRef.leafletElement;
    this.objects.eachLayer(layer => {
      layer.feature = {
        type: 'Feature',
        properties: layer.options.properties,
      };
    });

    this.saveObjects();

    this.createLevelControl();
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

  _onMapReady = ref => (this.map = ref.leafletElement);

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

        <Map id="map" ref={this._onMapReady} center={position} zoom={this.state.zoom} maxZoom={22}>
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
              draw={{ circle: false, marker: false }}
            />
            <MyGeoJSON data={geoData} />
          </FeatureGroup>
        </Map>
      </Fragment>
    );
  }
}
