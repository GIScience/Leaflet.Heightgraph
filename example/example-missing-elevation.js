(function () {
    function createLineString(altitudes, mask, index) {
        let coords = [];
        let lon = index || 0;
        for (let i = 0; i < altitudes.length; i++) {
            const ele = mask[i] ? eleBase + altitudes[i] * eleFactor : undefined;
            coords.push([lon++, 0, ele]);
        }

        return { 
            "type": "Feature", 
            "geometry": { 
                "type": "LineString", 
                "coordinates": coords,
            }, 
            "properties": {
                "attributeType": "0"
            }
        };
    }

    function createGeoJson(altitudesList, maskList) {
        let features = [];
        let index = 0
        for (let i = 0; i < altitudesList.length; i++) {
            const altitudes = altitudesList[i];

            features.push(createLineString(altitudes, maskList[i], index));
            index += altitudes.length -1;
        }

        return [{
            "type":"FeatureCollection", 
            "features": features,
            "properties": {
                "records": 1,
                "summary": " "
            }
        }];
    }

    function add(map, altitudesList, ...maskListParams) {
        let layer;
        const layersControl = L.control.layers({}, {}, {
            collapsed: false,
            position: 'bottomleft'
        }).addTo(map);

        for (let i = 0; i < maskListParams.length; i++) {
            const maskList = maskListParams[i];
            
            const geoJson = createGeoJson(altitudesList, maskList);

            const hg = L.control.heightgraph({
                position: "topright",
                height: 150,
                width: 600,
                margins: {
                    top: 10,
                    right: 30,
                    bottom: 30,
                    left: 50
                },
                mappings: {
                    ' ': {
                        '0': {
                            text: 'none',
                            color: '#1f77b4'
                        }
                    }
                }
            });
            hg.addTo(map);
            hg.addData(geoJson);
            hg._svg.selectAll(".legend-hover").remove();

            const onRoute = event => {
                hg.mapMousemoveHandler(event, {showMapMarker:true})
            }
            const outRoute = event => {
                hg.mapMouseoutHandler(0)
            }

            layer = L.geoJson(geoJson,{
                weight: 10
            }).on({
                'mousemove': onRoute,
                'mouseout': outRoute,
            });

            layersControl.addBaseLayer(layer, JSON.stringify(maskList));
        }

        layer.addTo(map);
    }

    const map = new L.Map('map');
    map.setView([0,6], 6.5);

    const eleBase = 500;
    const eleFactor = 10;

    // show variants of missing elevation defined by masks
    add(map,
        [[4,5,0,4],[4,6,2,1]],
        [[1,1,1,1],[1,1,1,1]],
        [[1,1,1,1],[0,0,1,1]],
        [[0,0,1,1],[1,1,1,1]],
        [[1,1,1,1],[1,1,0,0]],
        [[0,0,0,0],[0,0,0,0]]
    );
}());
