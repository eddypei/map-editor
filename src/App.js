import React, { Component } from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup, FeatureGroup, Polygon } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import GeoJSON from 'geojson';

import GeoJSONData from './files/data.json';

import './App.css';

// work around broken icons when using webpack, see https://github.com/PaulLeCam/react-leaflet/issues/255
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// only 'features', with only 'points' and 'polygons'
class MyGeoJSON extends Component {
  render() {
    return this.props.data.features.map((feature, index) => {
      if (feature.type === 'Feature') {
        const { geometry } = feature;
        if (geometry.type === 'Point') {
          const [lng, lat] = geometry.coordinates;
          return (
            <Marker key={index} position={[lat, lng]} properties={`huebr${index}`}>
              <Popup>I was created programatically</Popup>
            </Marker>
          );
        } else if (geometry.type === 'Polygon') {
          const positions = geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
          return <Polygon key={index} positions={positions} />;
        }
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
  };

  _onEdited = e => {
    console.log('edited something:', e);
    e.layers.eachLayer(layer => {
      //do whatever you want; most likely save back to db
      console.log('layer:', layer);
      console.log('layer._leaflet_id:', layer._leaflet_id);
      console.log('layer to geojson:', layer.toGeoJSON({ include: '_leaflet_id' }));
      console.log(
        'layer to geojson 2:',
        GeoJSON.parse(layer, {
          Point: ['_latlng.lat', '_latlng.lng'],
          Polygon: 'options.positions',
          include: ['_leaflet_id'],
        })
      );
    });
    console.log(this.objects.map(obj => obj.toGeoJSON()));
  };

  _onDeleted = e => {
    console.log('deleted something:', e);
    e.layers.eachLayer(layer => {
      console.log('layer:', layer);
      console.log('layer to geojson:', layer.toGeoJSON());
    });
  };

  _onFeatureGroupReady = featureGroupRef => {
    this.objects = featureGroupRef.leafletElement.getLayers();

    console.log(this.objects);
    console.log(this.objects.map(obj => obj._leaflet_id));
    console.log(
      GeoJSON.parse(this.objects, {
        Point: ['_latlng.lat', '_latlng.lng'],
        Polygon: [['options.positions']],
      })
    );

    featureGroupRef.leafletElement.eachLayer(layer => {
      console.log('featureGroup layer to geojson:', layer.toGeoJSON());
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
        <FeatureGroup ref={featureGroupRef => this._onFeatureGroupReady(featureGroupRef)}>
          <EditControl
            position="topright"
            onCreated={this._onCreated}
            onEdited={this._onEdited}
            onDeleted={this._onDeleted}
            onMounted={this._onMounted}
          />

          <Marker position={position}>
            <Popup>I was created manually</Popup>
          </Marker>

          <MyGeoJSON data={GeoJSONData} />
        </FeatureGroup>
      </Map>
    );
  }
}
