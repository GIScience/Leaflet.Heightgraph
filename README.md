#HeightProfile

##[What is it?](##What is it?)
##[How to use](##How to use)

##What is it?

A Leaflet plugin to view an interactive height profile of polylines using d3. Addtional information (steepness, blockdistance) are also given in different profiles (Waytypes, Surfaces, Gradients) and will be shown with different color highlighting. This plugin is under development and is inspired by [MrMufflon/Leaflet.Elevation](https://github.com/MrMufflon/Leaflet.Elevation).

Here is the [link](https://giscience.github.io/Leaflet.Heightgraph/index.html#) to get a preview.


Supported and tested Browsers:

Chrome
Firefox

Supported data:

GeoJSON:
```
var geojson = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [8.788387, 49.3941891, 121.5],
                [8.7884979, 49.3942292, 121.3],
                [8.7886319, 49.3943058, 121.2]            
            ]
        },
        "properties": {
            "steepness": 6
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [8.9253361, 49.524242, 254],
                [8.9259096, 49.5241819, 259.1],
                [8.9313854, 49.5224565, 314.2]
            ]
        },
        "properties": {
            "steepness": 8
        }
    }],
    "properties": {
        "Creator": "OpenRouteService.org",
        "records": 19,
        "summary": "Bins of elevation types in route",
        "waypoint_coordinates": [{
            "lat": "49.49132258420274",
            "lon": "8.843994140625002"
        }]
    }
};
```
##How to use

Altitude information for each point is necessary in the given data. Segments of the route with differnt attribute types has to be in the data if elevation highlighting is selected.
```
//all used options are the default values
L.Control.Heightgraph = L.Control.extend({
    options: {
        position: "topleft",
        width: 800,
        height: 125,
        margins: {
            top: 20,
            right: 50,
            bottom: 25,
            left: 50
        },
        mappings: undefined
    },
    onAdd: function(map) {
        var opts = this.options;
        var controlDiv = this._container = L.DomUtil.create('div', 'heightgraph');
        L.DomEvent.disableClickPropagation(controlDiv);
        var buttonContainer = this._button = L.DomUtil.create('div', "heightgraph-toggle", controlDiv);
        var link = L.DomUtil.create('a', "heightgraph-toggle-icon", buttonContainer);
        link.href = '#';
        var closeButton = this._closeButton = L.DomUtil.create('a', "heightgraph-close-icon", controlDiv);
        this._showState = false;
        this._initToggle();
        // size for heightgraph box (svg)
        this._margin = this.options.margins;
        this._width = this.options.width - this._margin.left - this._margin.right;
        this._height = this.options.height - this._margin.top - this._margin.bottom;
        this._mappings = this.options.mappings;
        return controlDiv;
    },
    onRemove: function(map) {
        this._container = null;
        this._svg = undefined;
    },
    ```
