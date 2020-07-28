import {select} from 'd3-selection'
describe('L.Control.Heightgraph', () => {
    let hg, geojson;
    beforeEach(() => {
        hg = new L.control.heightgraph({
         width: 800,
         height: 280,
         margins: {
             top: 10,
             right: 30,
             bottom: 55,
             left: 50
         },
         position: "bottomright",
         mappings: undefined
     });
        hg._margin = {
                top: 20,
                right: 50,
                bottom: 25,
                left: 50
        }
        hg._container = L.DomUtil.create('div', 'heightgraph');
        hg._svg = select(hg._container)
            .append("svg")
            .attr("class", "heightgraph-container")
            .attr("width", 100)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
        geojson = [{
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [8.109849, 47.320243, 453.1],
                        [8.110078, 47.319857, 454.3],
                        [8.11022, 47.319656, 455]
                    ]
                },
                "properties": {
                    "attributeType": 0
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [8.11022, 47.319656, 455],
                        [8.110281, 47.319694, 455.3],
                        [8.110383, 47.319714, 455.7],
                        [8.111643, 47.319786, 456.3]
                    ]
                },
                    "properties": {
                        "attributeType": 3
                }

            }],
            "properties": {
                "Creator": "OpenRouteService.org",
                "records": 2,
                "summary": "waytypes"
            }
        },{
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [8.109849, 47.320243, 453.1],
                        [8.110078, 47.319857, 454.3]
                    ]
                },
                "properties": {
                    "attributeType": 5
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [8.110078, 47.319857, 454.3],
                        [8.11022, 47.319656, 455]
                    ]
                },
                    "properties": {
                        "attributeType": 7
                }
            },{
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [8.11022, 47.319656, 455],
                        [8.110281, 47.319694, 455.3],
                        [8.110383, 47.319714, 455.7],
                        [8.111643, 47.319786, 456.3]
                    ]
                },
                    "properties": {
                        "attributeType": 1
                }

            }],
            "properties": {
                "Creator": "OpenRouteService.org",
                "records": 3,
                "summary": "surfaces"
            }
        }];
        hg.addData(geojson );
    });
    it('reads data of geojson correctly', () => {
        expect(hg._data).toEqual(geojson);
    });
    it('reads number of features of geojson correctly', () => {
        expect(hg._categories.length).toEqual(geojson.length);
    });
    it('reads number of categories of geojson correctly', () => {
        for (let i in [0,1]) {
            expect(hg._categories[i].attributes.length).toEqual(geojson[i].features.length);
            expect(hg._categories[i].distances.length).toEqual(geojson[i].features.length);
            expect(hg._categories[i].geometries.length).toEqual(geojson[i].features.length);
        }
    });
    it('reads feature types of geojson correctly', () => {
        expect(hg._categories[0].info.text).toEqual(geojson[0].properties.summary);
        expect(hg._categories[1].info.text).toEqual(geojson[1].properties.summary);
    });
    it('reads coordinates of geojson correctly', () => {
        expect(hg._categories[0].geometries[0].length).toEqual(geojson[0].features[0].geometry.coordinates.length);
        expect(hg._categories[1].geometries[0].length).toEqual(geojson[1].features[0].geometry.coordinates.length);
        expect(hg._categories[0].geometries[1].length).toEqual(geojson[0].features[1].geometry.coordinates.length);
        //x,y,z coordinates of 1st block and 1st feature
        let category1_point1 = hg._categories[0].geometries[0][0]
        expect(category1_point1.x).toEqual(geojson[0].features[0].geometry.coordinates[0][0]);
        expect(category1_point1.y).toEqual(geojson[0].features[0].geometry.coordinates[0][1]);
        expect(category1_point1.altitude).toEqual(geojson[0].features[0].geometry.coordinates[0][2]);
    });
});

