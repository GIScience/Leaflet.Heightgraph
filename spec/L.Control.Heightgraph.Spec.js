describe('L.Control.Heightgraph', function() {
    var el, geojson, data;
    beforeEach(function () {
        el = new L.control.heightgraph({
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
        el._margin = {
                top: 20,
                right: 50,
                bottom: 25,
                left: 50  
        }
        el._container = L.DomUtil.create('div', 'heightgraph');
        el._svg = d3.select(el._container)
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
        el.addData(geojson);
        data = el._data;
    });
    it('reads number of features of data correctly', function() { 
        // features 
        expect(el._profile.blocks.length).toEqual(data.length);
    });
    it('reads number of blocks of data correctly', function() {
        //blocks
        //1st feature
        expect(el._profile.blocks[0].attributes.length).toEqual(data[0].features.length);
        expect(el._profile.blocks[0].distances.length).toEqual(data[0].features.length);
        expect(el._profile.blocks[0].geometries.length).toEqual(data[0].features.length);
        //2nd feature
        expect(el._profile.blocks[1].attributes.length).toEqual(data[1].features.length);
        expect(el._profile.blocks[1].distances.length).toEqual(data[1].features.length);
        expect(el._profile.blocks[1].geometries.length).toEqual(data[1].features.length);
    });
    it('reads feature types of data correctly', function() {
        //feature types (waytypes, srufaces)
        //1st feature
        expect(el._profile.blocks[0].info.text).toEqual(data[0].properties.summary);
        //2nd feature
        expect(el._profile.blocks[1].info.text).toEqual(data[1].properties.summary);
    });
    it('reads coordinates of data correctly', function() {
        //1st block of 1st and 2nd feature
        expect(el._profile.blocks[0].geometries[0].length).toEqual(data[0].features[0].geometry.coordinates.length);
        expect(el._profile.blocks[1].geometries[0].length).toEqual(data[1].features[0].geometry.coordinates.length);
        //2nd block second block
        expect(el._profile.blocks[0].geometries[1].length).toEqual(data[0].features[1].geometry.coordinates.length);
        //x,y,z coordinates of 1st block and 1st feature
        expect(el._profile.blocks[0].geometries[0][0].x).toEqual(data[0].features[0].geometry.coordinates[0][0]);
        expect(el._profile.blocks[0].geometries[0][0].y).toEqual(data[0].features[0].geometry.coordinates[0][1]);
        expect(el._profile.blocks[0].geometries[0][0].altitude).toEqual(data[0].features[0].geometry.coordinates[0][2]);
    });
});

