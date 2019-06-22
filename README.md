Leaflet.HeightProfile
=====================

![preview](https://cloud.githubusercontent.com/assets/10322094/22474104/472bcc88-e7db-11e6-8c9e-7e1d53cd0b57.png)

1. [What is this?](https://github.com/GIScience/Leaflet.Heightgraph#what-is-this)
2. [How to use this library](https://github.com/GIScience/Leaflet.Heightgraph#how-to-use)

### What is this?

This plugin is under development and is inspired by [MrMufflon/Leaflet.Elevation](https://github.com/MrMufflon/Leaflet.Elevation). You may use this plugin to view an interactive height profile of linestring segments using d3js. The input data may consist of different types of attributes you wish to display.

Supported Browsers:
- Chrome
- Firefox
- Opera

### Supported data:
Input data has to be of type [GeoJSON-Format](http://geojson.org/). This must consist of feature collection(s) corresponding to a certain attribute which could - as an example - be surface or gradient information. Each `FeatureCollection` comprises a certain `attribute` in its `properties` (e.g. `'summary': 'steepness'`) and has a list of `LineString` features with coordinates including height values and the `attributeType` which corresponds to the certain type of attribute within this segment (in this case it could be an index of steepness) declared in its `properties`. Notice that the list of coordinates has to start with the last coordinates of the previous `LineString`.

```javascript
var FeatureCollections = [{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [8.6865264, 49.3859188, 114.5],
                [8.6864108, 49.3868472, 114.3],
                [8.6860538, 49.3903808, 114.8]
            ]
        },
        "properties": {
            "attributeType": "3"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [8.6860538, 49.3903808, 114.8],
                [8.6857921, 49.3936309, 114.4],
                [8.6860124, 49.3936431, 114.3]
            ]
        },
        "properties": {
            "attributeType": "0"
        }
    }],
    "properties": {
        "Creator": "OpenRouteService.org",
        "records": 2,
        "summary": "Steepness"
    }
}];
```

[Demo](https://giscience.github.io/Leaflet.Heightgraph)

### Install with Bower

`` bower install leaflet.heightgraph ``

### Optional:
You may add a mappings object to customize the colors and labels in the height graph. Without adding custom mappings the segments and labels within the graph will be displayed in random colors. Each key of the object must correspond to the `summary` key in `properties` within the `FeatureCollection`.

```javascript
colorMappings.Steepness = {
    '3': {
        text: '1-3%',
        color: '#F29898'
    },
    '0': {
        text: '4-6%',
        color: '#E07575'
    }
};
```

### How to use:

```javascript
// all used options are the default values
var hg = L.control.heightgraph({
    width: 800,
    height: 280,
    margins: {
        top: 10,
        right: 30,
        bottom: 55,
        left: 50
    },
    position: "bottomright",
    mappings: undefined || colorMappings
});
hg.addTo(map);
hg.addData(geojson);
L.geoJson(geojson).addTo(map);
```

### Dependencies:

Install npm dependencies with
```
npm install d3

// If you care about your js size, you can run:
npm install d3-selection d3-array d3-color d3-drag d3-dispatch d3-scale d3-axis d3-format d3-shape d3-interpolate d3-path d3-scale-chromatic
```

Install Leaflet.Heightgraph
```
npm install leaflet.heightgraph
```

When using NPM you can reguire all needed libraries like this
```
require ('d3');

// If you selected the single modules
require('d3-selection');
require('d3-array');
require('d3-color');
require('d3-drag');
require('d3-dispatch');
require('d3-scale');
require('d3-axis');
require('d3-format');
require('d3-shape');
require('d3-interpolate');
require('d3-path');
require('d3-scale-chromatic');

require('leaflet.heightgraph');
```

Run jasmine tests with
```
grunt jasmine
```
