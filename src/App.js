import React, { Component } from 'react';

import Map from './map/Map';

import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Map />
        </header>
      </div>
    );
  }
}
