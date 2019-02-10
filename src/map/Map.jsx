import React from 'react';
import L from 'leaflet';
import { leafletDraw } from 'leaflet-draw';

import 'leaflet/dist/leaflet.css';
import './Map.css';

export default class Map extends React.Component {
  state = {
    clickStart: null,
    clickEnd: null,
  };
  map = null;
  mapId = 'map';
  popup = L.popup();

  onMapClick = e => {
    this.popup
      .setLatLng(e.latlng)
      .setContent('You clicked the map at ' + e.latlng.toString())
      .openOn(this.map);
  };

  componentDidMount() {
    this.map = L.map(this.mapId, {
      center: [-23.561674, -46.655988],
      zoom: 19,
      drawControl: true,
    });

    let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    tileLayer.addTo(this.map);

    // FeatureGroup is to store editable layers
    let drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false, // Restricts shapes to simple polygons
          drawError: {
            color: '#e1e100', // Color the shape will turn when intersects
            message: "<strong>Oh snap!<strong> you can't draw that!", // Message that will show when intersect
          },
          shapeOptions: {
            color: '#97009c',
          },
        },
        // disable toolbar item by setting it to false
        polyline: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });
    this.map.addControl(drawControl);

    var editableLayers = new L.FeatureGroup();
    this.map.addLayer(editableLayers);

    let myIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
      // iconSize: [30, 70],
      // iconAnchor: [13, -2],
      popupAnchor: [13, -2],
      // shadowSize: [50, 80],
      // shadowAnchor: [11, 90],
    });

    let marker = L.marker([-23.561874, -46.655501], { icon: myIcon });
    marker.addTo(this.map);

    let circle = L.circle([-23.561674, -46.655988], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 15,
    });
    circle.addTo(this.map);

    let polygon = L.polygon([[-23.561719, -46.656625], [-23.562056, -46.656168], [-23.562094, -46.656651]]);
    polygon.addTo(this.map);

    marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
    circle.bindPopup('I am a circle.');
    polygon.bindPopup('I am a polygon.');

    // this.map.on('click', this.onMapClick);

    // this.map.on('mousedown', e => {
    //   console.log(e.type, e.latlng);
    //   this.setState({ clickStart: e.latlng });
    // });
    // this.map.on('mouseup', async e => {
    //   console.log(e.type, e.latlng);
    //   await this.setState({ clickEnd: e.latlng });
    //   console.log(this.state);
    //   // define rectangle geographical bounds
    //   var bounds = [Object.values(this.state.clickStart), Object.values(this.state.clickEnd)];
    //   // create an orange rectangle
    //   L.rectangle(bounds, { color: '#ff7800', weight: 1 }).addTo(this.map);
    //   // zoom the map to the rectangle bounds
    //   this.map.fitBounds(bounds);
    // });

    function onEachFeature(feature, layer) {
      // does this feature have a property named popupContent?
      if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
      }
    }

    var geojsonFeature = {
      type: 'Feature',
      properties: {
        name: 'Coors Field',
        amenity: 'Baseball Stadium',
        popupContent: 'This is where the Rockies play!',
      },
      geometry: {
        type: 'Point',
        coordinates: [-46.656247, -23.561383],
      },
    };

    var geojsonMarkerOptions = {
      radius: 8,
      fillColor: '#ff7800',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };

    L.geoJSON(geojsonFeature, {
      onEachFeature: onEachFeature,
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      },
    }).addTo(this.map);
  }

  render() {
    return <div id={this.mapId} />;
  }
}
