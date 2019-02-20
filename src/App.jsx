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
          <Marker key={index} position={[lat, lng]} properties={`huebr${index}`}>
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
    lat: -23.561584,
    lng: -46.656093,
    zoom: 19,
  };
  objects = [];

  _onCreated = e => {
    console.log('created something:', e);
    console.log('layer._leaflet_id:', e.layer._leaflet_id);
    console.log('layer to geojson:', e.layer.toGeoJSON());
    console.log('this.objects:', this.objects.getLayers());
    console.log('this.objects.toGeoJSON():', this.objects.toGeoJSON());
    localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));
  };

  _onEdited = e => {
    console.log('edited something:', e);
    e.layers.eachLayer(layer => {
      //do whatever you want; most likely save back to db
      console.log('layer:', layer);
      console.log('layer._leaflet_id:', layer._leaflet_id);
      console.log('layer to geojson:', layer.toGeoJSON());
    });
    // console.log(this.objects.toGeoJSON());
    console.log('this.objects:', this.objects.getLayers());
    localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));
  };

  _onDeleted = e => {
    console.log('deleted something:', e);
    e.layers.eachLayer(layer => {
      console.log('layer:', layer);
      console.log('layer to geojson:', layer.toGeoJSON());
    });
    localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));
  };

  _onFeatureGroupReady = featureGroupRef => {
    this.objects = featureGroupRef.leafletElement;
    localStorage.setItem('objects', JSON.stringify(this.objects.toGeoJSON()));
  };

  saveData = () => {
    if (window.confirm('Are you sure you want to save?')) {
      let content = localStorage.getItem('objects');
      var a = document.createElement('a');
      var file = new Blob([content], { type: 'application/json' });
      a.href = URL.createObjectURL(file);
      a.download = 'GeoJSON.json';
      a.click();
    }
  };

  loadData = () => {
    alert('in progress...');
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

        <button onClick={this.loadData} title="Load from GeoJSON file" className="action" id="load-button">
          <SaveAltIcon />
        </button>

        <Map id="map" center={position} zoom={this.state.zoom} maxZoom={19}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
