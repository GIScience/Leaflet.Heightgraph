# HeightProfile
Height profile on map with steepness information

inspired by https://github.com/MrMufflon/Leaflet.Elevation

data-format: geojson:

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
