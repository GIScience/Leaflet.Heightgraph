L.Control.Heightgraph = L.Control.extend({
    options: {
        position: "topleft",
        width: 800,
        height: 125,
        margins: {
            top: 45,
            right: 20,
            bottom: 30,
            left: 50
        }
    },
    onAdd: function(map) {
        var opts = this.options;
        var controlDiv = this._container = L.DomUtil.create('div', 'heightGraph');
        //controlDiv.title = 'Height Graph Profile';
        this._map = map;
        this._initToggle();
        this._cont = d3.select(controlDiv);
        return controlDiv;
    },
    onRemove: function(map) {
        this._container = null;
    },
    addData: function(data) {
        this._distances = this._calcDistances(data);
        this._heightvalue = this._calculateHeightSteep(data).height;
        this._steepness = this._calculateHeightSteep(data).steep;
        this._dynamicLegend = this._updateLegend(this._steepness);
        this._waypointPosition = this._calculateHeightSteep(data).wpFeatPos;
        this._polygonData = this._updateBarData(this._heightvalue, this._steepness);
        this._waypointData = this._updateWaypointData(this._distances, this._heightvalue);
        this._createSVG = this._createBarChart(this._polygonData, this._waypointData, this._cont, this._heightvalue, this._dynamicLegend);
    },
    _initToggle: function() {
        /* inspired by L.Control.Layers */
        var container = this._container;
        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);
        if (!L.Browser.touch) {
            L.DomEvent.disableClickPropagation(container);
            //.disableScrollPropagation(container);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }
        //this._collapse();
        if (!L.Browser.android) {
            L.DomEvent.on(container, 'click', this._expand, this);
        }
    },
    _expand: function() {
        if (this._container.className.indexOf('heightGraph-collapsed') > -1) {
            this._container.className = this._container.className.replace(' heightGraph-collapsed', '');
        } else {
            L.DomUtil.addClass(this._container, 'heightGraph-collapsed');
        }
    },
    _collapse: function() {
        L.DomUtil.addClass(this._container, 'heightGraph-collapsed');
    },
    /*
     * Reset data
     */
    _clearData: function() {
        this._data = null;
        this._dist = null;
        this._maxElevation = null;
    },
    /*
     * Reset data and display
     */
    clear: function() {
        this._clearData();
        if (!this._areapath) {
            return;
        }
        // workaround for 'Error: Problem parsing d=""' in Webkit when empty data
        // https://groups.google.com/d/msg/d3-js/7rFxpXKXFhI/HzIO_NPeDuMJ
        //this._areapath.datum(this._data).attr("d", this._area);
        this._areapath.attr("d", "M0 0");
        this._x.domain([0, 1]);
        this._y.domain([0, 1]);
        this._updateAxis();
    },
    /**
     * Returns distance between each coordinate of Linestring
     * @param {FeatureCollection} a
     * @returns {Number|Array| Object} Object that contains distances between coordinates, the coordinates, and sum of distances as totaldistance
     */
    _calcDistances: function(a) {
        console.log(a)
        distances = {};
        var first, calc;
        //var wpList=[];
        distances.distance = [];
        distances.wpDistance = [];
        var featureLength = a.features.length;
        distances.coordsOfDist = [];
        for (var i = 0; i < featureLength; i++) {
            var coordLength = a.features[i].geometry.coordinates.length;
            for (var j = 0; j < coordLength - 1; j++) {
                var g = new L.LatLng(a.features[i].geometry.coordinates[j][1], a.features[i].geometry.coordinates[j][0]);
                // catch steps between features
                if (j == 0 && i > 0) {
                    calc = last.distanceTo(g);
                    distances.distance.push(calc);
                    distances.coordsOfDist.push([last, g]);
                }
                var h = new L.LatLng(a.features[i].geometry.coordinates[j + 1][1], a.features[i].geometry.coordinates[j + 1][0]);
                calc = g.distanceTo(h);
                distances.distance.push(calc);
                distances.coordsOfDist.push([g, h]);
                // save last
                if (j == coordLength - 2) {
                    last = h;
                }
            }
        }
        distances.totaldistance = distances.distance.reduce(function(pv, cv) {
            return pv + cv;
        }, 0);
        return distances;
    },
    /**
     * Returns the values (height, steepness) of the FeatureCollection as Array in list
     * @param {FeatureCollection} a
     * @returns {Number|Array|Object} list with height values and steepness values as array
     */
    _calculateHeightSteep: function(a) {
        var height = [];
        var steep = [];
        for (var i = 0; i < a.features.length; i++) {
            var coordNumber = a.features[i].geometry.coordinates.length;
            for (var j = 0; j < coordNumber; j++) {
                height.push(a.features[i].geometry.coordinates[j][2]);
                steep.push(a.features[i].properties.steepness);
            }
        }
        var list = {
            height: height,
            steep: steep
        };
        return list;
    },
    /**
     * Returns values of steepness as Array without duplicates 
     * @param {Array} a: steepness values of all coords
     * @returns {Array} list with steepness color and text as array
     */
    _updateLegend: function(a) {
        var legendList = [];
        //remove duplicates
        var cleanList = a.filter(function(elem, index) {
            return index == a.indexOf(elem);
        });

        function sortNumber(a, b) {
            return a - b;
        }
        cleanList.sort(sortNumber);
        for (var i = 0; i < cleanList.length; i++) {
            var j = cleanList[i] - 5;
            legendList.push(legendData[cleanList[i]][j]);
        }
        return legendList;
    },
    /**
     * Returns list with four x and y coordinates for svg-path (Polygon) and steepness type
     * @param {Array} a: heightvalue
     * @param {Array} steepness
     * @returns {Number|Array|Object} list with coordinates and steepness values as array
     */
    _updateBarData: function(a, steepness) {
        var list = [];
        var wplist = [];
        var adddist = [0];
        var count = a.length;
        for (var i = 0; i < count; i++) {
            adddist[i + 1] = adddist[i] + distances.distance[i];
            list.push({
                coords: [{
                    x: adddist[i],
                    y: a[i]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: a[(i + 1 == count) ? i : i + 1]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: d3.min(a)
                }, {
                    x: adddist[i],
                    y: d3.min(a)
                }],
                steepness: steepness[i],
                LatLng: distances.coordsOfDist[i]
            });
        }
        return list;
    },
    /**
     * Returns list with two x and y coordinates for svg-path (Line and circle)
     * @param {Array|Object} a: distances
     * @param {Array} b: heightvalue
     * @returns {Number|Array|Object} list with coordinates as array
     */
    _updateWaypointData: function(a, b) {
        var list = [];
        var length = a.wpDistance.length;
        for (var i = 0; i < length; i++) {
            list.push({
                wpCoords: [{
                    x: a.wpDistance[i],
                    y: d3.min(b)
                }, {
                    x: a.wpDistance[i],
                    y: (d3.max(b) / 2)
                }]
            });
        }
        return list;
    },
    _showMarker: function(ll) {
        if (!this._marker) {
            this._marker = new L.circleMarker(ll, {
                radius: 5,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(this._map);
        } else {
            this._marker.setLatLng(ll);
        }
    },
    /**
     * @param {Object} polygonData: (x,y-coords, steepness)
     * @param {Object} waypointData: (x,y-coords)
     * @param {Array} heightvalue: heightvalue of each coordinate
     * @param {Object} dynamicLegend: values for legend (text and color)
     */
    _createBarChart: function(polygonData, waypointData, container, heightvalue, dynamicLegend) {
        //SVG area
        var margin = this.options.margins,
            width = this.options.width - margin.left - margin.right,
            height = 180 - margin.top - margin.bottom;
        var x = d3.scale.linear().range([0, width]).domain([0, distances.totaldistance]);
        var y = d3.scale.linear().range([height, 0]).domain(d3.extent(heightvalue, function(d) {
            return d;
        }));
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(4).tickFormat(function(d) {
            return d / 1000;
            // var prefix = d3.formatPrefix(d);
            // return prefix.scale(d) //+ prefix.symbol;
        });
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(4);
        var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
            return ((Math.round(((d.coords[0].y + d.coords[1].y) / 2) * 100) / 100) + " m");
        });
        var tipDist = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
            return (d);
        });
        var svgSec = d3.select(this._container).append("svg").attr("class", "background").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // axes and axes labels
        svgSec.append('g').attr("transform", "translate(0," + height + ")") // create a <g> element
            .attr('class', 'x axis') // specify classes
            .call(xAxis).append("text").attr("x", width - 20).attr("y", y(d3.max(heightvalue)) + 15).style("font-size", "12px").style("text-anchor", "middle").attr("fill", "#fff").text("km");
        svgSec.append('g').attr('class', 'y axis').call(yAxis).append("text").attr("x", -30).attr("y", -5).attr("fill", "#fff").attr("dy", "0").style("font-size", "12px").style("text-anchor", "initial").text("hm");
        svgSec.selectAll('.axis path').style({
            'stroke': '#fff',
            'fill': 'none',
            'stroke-width': '1'
        });
        svgSec.selectAll('.axis line').style({
            'visibility': 'hidden'
        });
        // scale data (polygon-path)
        var polygon = d3.svg.line().x(function(d) {
            return x(d.x);
        }).y(function(d) {
            return y(d.y);
        });
        // bar chart as path
        svgSec.selectAll('hpath').data(polygonData).enter().append('path')
            //.attr('leafletId', id)
            .attr('d', function(d) {
                return polygon(d.coords);
            })
            //.attr("data-legend",function(d) { return d.steepness})
            .attr("fill-opacity", 0.6).attr('fill', function(d) {
                return (d.steepness - 5 == -5 ? '#028306' : d.steepness - 5 == -4 ? '#2AA12E' : d.steepness - 5 == -3 ? '#53BF56' : d.steepness - 5 == -2 ? '#7BDD7E' : d.steepness - 5 == -1 ? '#A4FBA6' : d.steepness - 5 == 0 ? '#ffcc99' : d.steepness - 5 == 1 ? '#F29898 ' : d.steepness - 5 == -2 ? '#E07575' : d.steepness - 5 == 3 ? '#CF5352' : d.steepness - 5 == 4 ? '#BE312F' : d.steepness - 5 == 5 ? '#AD0F0C' : '#AD0F0C');
            }).on('mouseover', handleMouseOver).on("mouseout", handleMouseOut).on("mousemove", mousemove);
        // focus line
        var focus = svgSec.append("g").attr("class", "focus").style("display", "none");
        focus.append("text").attr("x", 5).attr("font-size", "10px").attr("dy", ".35em").style("background", "black").attr("fill", "#fff");
        focus.insert("rect", "text").attr("width", function(d) {
            return 53;
        }).attr("height", function(d) {
            return 14;
        }).attr("y", "-7").attr("x", "-1").style("fill", "#000");
        var focusLineGroup = svgSec.append("g").attr("class", "focusLine");
        var focusLine = focusLineGroup.append("line").attr("stroke-width", 1).attr("fill", "#fff").attr("x1", 10).attr("x2", 10).attr("y1", y(d3.max(heightvalue))).attr("y2", y(d3.min(heightvalue))).style("display", "none");
        // waypoints line
        svgSec.selectAll('linePath').data(waypointData).enter().append('path').attr('class', 'wpLine').attr('d', function(d) {
            return polygon(d.wpCoords);
        }).attr('pointer-events', 'none').attr("stroke-width", 2).attr('stroke', 'black');
        // waypoints circle
        svgSec.selectAll('hcircle').data(waypointData).enter().append('circle').attr('cx', function(d) {
                return x(d.wpCoords[1].x);
            }).attr('cy', function(d) {
                return y(d.wpCoords[1].y);
            }).attr('pointer-events', 'none').attr('r', 8)
            //.attr("data-legend",function(d) { return d.steepness})
            .attr('fill', 'black');
        svgSec.selectAll('wpText').data(waypointData).enter().append("text").attr("class", "wp-text").attr("dx", function(d) {
            return x(d.wpCoords[1].x) - 3.5;
        }).attr("dy", function(d) {
            return y(d.wpCoords[1].y - 3);
        }).text(function(d, i) {
            return i + 1;
        }).style('fill', 'white').style('font-size', '12px');
        // legend
        var legendRectSize = 7;
        var legendSpacing = 7;
        var legend = svgSec.selectAll('.legend').data(dynamicLegend).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * 2;
            var horz = -2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
        legend.append('rect').attr('width', legendRectSize).attr('height', legendRectSize).attr('x', 30).attr('y', 30).style('fill', function(d, i) {
            return (d.color);
        });
        legend.append('text').attr('x', 40).attr('y', 36).style('font-size', 10).attr('fill', '#fff').text(function(d, i) {
            return d.text;
        });
        svgSec.call(tip);
        // Create Event Handlers for mouse
        function handleMouseOver(d, i) {
            // Use D3 to select element, change color and size
            tip.show(d);
            focus.style("display", null);
            focusLine.style("display", null);
        }

        function handleMouseOut(d, i) {
            // Use D3 to select element, change color back to normal
            tip.hide(d);
            focus.style("display", "none");
            focusLine.style("display", "none");
        }
        var self = this;

        function mousemove(d) {
            var x0 = x.invert(d3.mouse(this)[0]); //distance in m   
            var d0 = d.coords[0].x,
                d1 = d.coords[1].x;
            var d2 = d1 - x0 > x0 - d0 ? 0 : 1; // shortest distance between mouse and coords of polygon
            var y0 = d.coords[d2].y;
            var LatLngCoords = d.LatLng;
            var segmentCenter = L.latLngBounds(LatLngCoords[0], LatLngCoords[1]).getCenter();
            self._showMarker(segmentCenter);
            focus.style("display", "initial").attr("transform", "translate(" + x(x0) + "," + y(d3.min(heightvalue)) + ")");
            focus.select("text").text(Math.round((x0 / 1000) * 100) / 100 + ' km'); //text in km
            focusLine.style("display", "initial").attr('x1', x(x0)).attr('y1', y(y0)).attr('x2', x(x0));
        }
    }
});
L.control.heightgraph = function(options) {
    return new L.Control.Heightgraph(options);
};