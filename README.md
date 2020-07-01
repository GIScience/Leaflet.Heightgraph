# Leaflet.Heightgraph

This plugin is inspired by [MrMufflon/Leaflet.Elevation](https://github.com/MrMufflon/Leaflet.Elevation).
You may use this plugin to view an interactive height profile of linestring segments using d3js.
The input data may consist of different types of attributes you wish to display.

![preview](https://cloud.githubusercontent.com/assets/10322094/22474104/472bcc88-e7db-11e6-8c9e-7e1d53cd0b57.png)

Supported Browsers:
- Chrome
- Firefox
- Opera

[Demo](https://giscience.github.io/Leaflet.Heightgraph)

## Installation

Prerequisite:  [`node`](https://nodejs.org/en/download/) (version >=8)
or use [`nvm`](https://github.com/nvm-sh/nvm/blob/master/README.md) to install specific node versions

Install Leaflet.Heightgraph and dependencies with npm.
```
npm install leaflet.heightgraph
```

## Import

You can import the required libraries in the head of your index.html file
```html
 <link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" />
 <script src="node_modules/leaflet/dist/leaflet.js"></script>
 <link rel="stylesheet" href="src/L.Control.Heightgraph.css"/>
 <script type="text/javascript" src="src/L.Control.Heightgraph.js"></script>
```

When using NPM you can require all needed libraries like this.
```
require('leaflet');
require('leaflet.heightgraph');
```

After importing Leaflet correctly, ES 6 Module import is possible as well:
```html
<script type="module">
    import 'leaflet.heightgraph'
</script>
```

The stylesheet can alternatively be imported in a style tag:
```html
<style>
    @import "../node_modules/leaflet.heightgraph/dist/L.Control.Heightgraph.min.css";
</style>
```

## Usage
Initialize the heightgraph, add it to your Leaflet map object and add your
Data to the heightgraph object.
```javascript
let hg = L.control.heightgraph();
hg.addTo(map);
hg.addData(geojson);
L.geoJson(geojson).addTo(map);
```

## Supported data
Input data has to be of type [GeoJSON-Format](http://geojson.org/).
This must consist of feature collection(s) corresponding to a certain
attribute which could be e.g. *surface* or *gradient* information.

Each `FeatureCollection` comprises a certain `attribute` in its `properties`
(e.g. `'summary': 'steepness'`) and has a list of `LineString` features.
These should have `coordinates` including height values and the `attributeType`
which corresponds to the certain type of attribute within this segment
(in this case it could be an index of steepness) declared in its `properties`.

Notice that the list of coordinates has to start with the last coordinate
of the previous `LineString`.

```javascript
const FeatureCollections = [{
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

## Optional settings
These additional options can be set to customize your heightgraph.
Use them by passing an options object to the heightgraph during creation e.g.:
```js
let options = {
    position: "topleft"
}
let hg = L.control.heightgraph(options);
```

### position
You can choose between `"bottomright"`, `"bottomleft"`, `"topright"` and `"topleft"`
for the position on the map.

default: `position: "bottomright"`

### width
The width of the expanded heightgraph display in pixels.

default: `width: 800`

### height
The height of the expanded heightgraph display in pixels.

default: `height: 280`

### margins
The margins define the distance between the border of the heightgraph
and the actual graph inside. You are able to specify margins for `top`, 
`right`, `bottom` and `left` in pixels.

default:
```
margins: {
    top: 10,
    right: 30,
    bottom: 55,
    left: 50
}
```

### expand
Boolean value that defines if the heightgraph should be expanded on creation.

default: `true`

### expandCallback
Function to be called if the heightgraph is expanded or reduced. The state of
the heightgraph is passed as an argument. It is `true` when expanded and
`false` when reduced.

default: `undefined`

example:
```js
expandCallback: function(expanded){
    console.log("Expanded: " + expanded)
}
```

### mappings
You may add a mappings object to customize the colors and labels in the height graph.
Without adding custom mappings the segments and labels within the graph will be displayed in random colors.
Each key of the object must correspond to the `summary` key in `properties` within the `FeatureCollection`.

default: `undefined`

Example:

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

### highlightStyle
You can customize the highlight style when using the horizontal line to 
find parts of the route above an elevation value.
Use any [Leaflet Path options](https://leafletjs.com/reference-1.5.0.html#path-option)
as value of the `highlightStyle` parameter.

default: `highlightStyle:{color: 'red'}`

Example:
```javascript
highlightStyle = {
   weight: 10,
   opacity: 0.8,
   color: 'orange'
 }
```

### translation
You can change the labels of the heightgraph info field by passing translations
for `distance`, `elevation`, `segment_length`, `type` and `legend`.

default:
```
translation: {
    distance: "Distance",
    elevation: "Elevation",
    segment_length: "Segment length",
    type: "Type",
    legend: "Legend"
    }
```

### xTicks
Specify the tick frequency in the *x axis* of the graph. Corresponds approximately to 
2 to the power of `value` ticks.

default: `xTicks: 3`

### yTicks
Specify the tick frequency in the *y axis* of the graph. Corresponds approximately to 
2 to the power of `value` ticks.

default: `yTicks: 3`

## Development setup

```bash
# clone the repository
$ git clone https://github.com/GIScience/Leaflet.Heightgraph.git

# install dependencies using a node-version >= 8
$ npm install

# start development server
$ npm start
```

## Configurations (WebStorm)

You can create run configurations for different tasks:

### Starting development server

- open `Run -> Edit Configurations...`
- click `+` to add a new configuration and choose the npm template
- give the Configuration a name e.g. `Dev`
- choose `start` as command
- press `OK`

### Testing

Debug jasmine tests with karma in WebStorm

- open `Run -> Edit Configurations...`
- click `+` to add a new configuration and choose the karma template
- give the Configuration a name e.g. `Test`
- press `OK`

### Coverage

Run karma with coverage

- once you have a karma task configured just click the run with coverage button 
- analyse coverage in Webstorm or Browser (open ./coverage/html/index.html)
