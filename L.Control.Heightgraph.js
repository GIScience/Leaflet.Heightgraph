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
        var controlDiv = this._container = L.DomUtil.create('div', 'heightgraph');
        //controlDiv.title = 'Height Graph Profile';
        var buttonContainer = this._button = L.DomUtil.create('div', "heightgraph-toggle", controlDiv);
        var link = L.DomUtil.create('a', "heightgraph-toggle-icon", buttonContainer);
        link.href = '#';
        var closeButton = this._closeButton = L.DomUtil.create('a', "heightgraph-close-icon", controlDiv);
        this._showState = false;
        this._map = map;
        this._initToggle();
        this._cont = d3.select(controlDiv);
        // create combobox for selection
        var selection = document.createElement("select");
        selection.setAttribute("class", "selection");
        this._cont.node().appendChild(selection);
        this._profileType = "-1";
        return controlDiv;
    },
    onRemove: function(map) {
        this._container = null;
        this._svgSec = undefined;
    },
    addData: function(data) {
        this._selection(data);
        this._calcDistances();
        this._calculateHeightType();
        this._updateLegend();
        this._updateBarData();
        this._createBarChart();
    },
    _initToggle: function() {
        /* inspired by L.Control.Layers */
        var container = this._container;
        if (!L.Browser.touch) {
            L.DomEvent.disableClickPropagation(container);
            //.disableScrollPropagation(container);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }
        if (!L.Browser.android) {
            L.DomEvent.on(this._button, 'click', this._expand, this);
            L.DomEvent.on(this._closeButton, 'click', this._expand, this);
        }
    },
    _expand: function() {
        if (!this._showState) {
            document.getElementsByClassName("background")[0].style.display = "block";
            document.getElementsByClassName("selection")[0].style.display = "block";
            document.getElementsByClassName("heightgraph-toggle")[0].style.display = "none";
            document.getElementsByClassName("heightgraph-close-icon")[0].style.display = "block";
            this._showState = !this._showState;
        } else {
            document.getElementsByClassName("selection")[0].style.display = 'none';
            document.getElementsByClassName("background")[0].style.display = "none";
            document.getElementsByClassName("heightgraph-toggle")[0].style.display = "block";
            document.getElementsByClassName("heightgraph-close-icon")[0].style.display = "none";
            this._showState = !this._showState;
        }
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
    _selection: function(data) {
        // without color
        this._selectedData = data[0];
        var self = this;
        d3.select(".selection").on("change", function() {
            self._svgSec.selectAll("*").remove();
            self._profileType = this.value;
            if (self._profileType == -1) {
                self._selectedData = data[0];
            } else {
                self._selectedData = data[self._profileType];
            }
            self._calcDistances();
            self._calculateHeightType();
            self._updateLegend();
            self._updateBarData();
            self._createBarChart();
        }).selectAll("option").data([{
            text: "none",
            id: -1
        }, {
            text: "steepness",
            id: 2
        }, {
            text: "surfaces",
            id: 1
        }, {
            text: "waytypes",
            id: 0
        }]).enter().append("option").attr("value", function(d) {
            return d.id;
        }).text(function(d) {
            return d.text;
        });
    },
    /**
     * Returns FeatureCollection of a special type (steepness, waytypes,..) 
     * @param {FeatureCollection} a
     * @param {String} type: profile that should be presented
     */
    _dataSelection: function(a, type) {
        var length = a.length;
        for (var i = 0; i < length; i++) {
            if (typeof(a[i].features[1].properties.waytype) !== "undefined" && type == "waytypes") {
                data = a[i];
            }
            if (typeof(a[i].features[1].properties.surface) !== "undefined" && type == "surfaces") {
                data = a[i];
            }
            if (typeof(a[i].features[1].properties.speed) !== "undefined" && type == "speed") {
                data = a[i];
            }
            if (typeof(a[i].features[1].properties.steepness) !== "undefined" && type == "steepness") {
                data = a[i];
            }
            if (type == "none") {
                data = a[1];
            }
        }
        if (length == 1) {
            data = a[0];
        }
        return data;
    },
    /**
     * Returns distance between each coordinate of Linestring
     * @param {FeatureCollection} a
     * @returns {Number|Array| Object} Object that contains distances between coordinates, the coordinates, and sum of distances as totaldistance
     */
    _calcDistances: function() {
        distances = {};
        var first, calc;
        //var wpList=[];
        var a = this._selectedData;
        distances.distance = [];
        distances.wpDistance = [];
        distances.blockDistances = [];
        var featureLength = a.features.length;
        distances.coordsOfDist = [];
        for (var i = 0; i < featureLength; i++) {
            var coordLength = a.features[i].geometry.coordinates.length;
            var blockDistance = 0;
            for (var j = 0; j < coordLength - 1; j++) {
                var g = new L.LatLng(a.features[i].geometry.coordinates[j][1], a.features[i].geometry.coordinates[j][0]);
                var h = new L.LatLng(a.features[i].geometry.coordinates[j + 1][1], a.features[i].geometry.coordinates[j + 1][0]);
                calc = g.distanceTo(h);
                distances.distance.push(calc);
                // calculate distances of specific block
                blockDistance += calc;
                distances.coordsOfDist.push([g, h]);
            }
            distances.blockDistances.push(Array.apply(null, Array(coordLength - 1)).map(function() {
                return blockDistance;
            }));
        }
        // flatten again
        distances.blockDistances = [].concat.apply([], distances.blockDistances);
        distances.totaldistance = distances.distance.reduce(function(pv, cv) {
            return pv + cv;
        }, 0);
        this._distances = distances;
    },
    /**
     * Returns the values (height, profileType-option(steepness, speed,...)) of the FeatureCollection as Array in list
     * @param {FeatureCollection} a
     * @returns {Number|Array|Object} list with height values and steepness values as array
     */
    _calculateHeightType: function() {
        var a = this._selectedData;
        var heights = [];
        var types = [];
        var profileType = this._profileType;
        for (var i = 0; i < a.features.length; i++) {
            var coordNumber = a.features[i].geometry.coordinates.length;
            // ignore first entry
            for (var j = 1; j < coordNumber; j++) {
                heights.push(a.features[i].geometry.coordinates[j][2]);
                types.push(a.features[i].properties.attributeType);
            }
        }
        this._heightvalues = heights;
        this._types = types;
    },
    /**
     * Returns values of steepness as Array without duplicates 
     * @param {Array} a: values of profileType (steepness, speed, watypes,...) of all coords
     * @param {String} b: profileType(steepness, speed, waytypes)
     * @returns {Array} list with steepness color and text as array
     */
    _updateLegend: function() {
        var a = this._types;
        var b = this._profileType;
        var legendList = [];
        var text = [];
        var color = [];
        //remove duplicates
        var cleanList = a.filter(function(elem, index) {
            return index == a.indexOf(elem);
        });

        function sortNumber(a, b) {
            return a - b;
        }
        cleanList.sort(sortNumber);
        for (var i = 0; i < cleanList.length; i++) {
            if (b == "2") {
                legendList[i] = {
                    text: mappings.steepnessTypes[cleanList[i]].text,
                    color: mappings.steepnessTypes[cleanList[i]].color
                };
            }
            if (b == "-1") {
                legendList[i] = {
                    text: "",
                    color: "none"
                };
            }
            if (b == "0") {
                legendList[i] = {
                    text: mappings.wayTypes[cleanList[i]].text,
                    color: mappings.wayTypes[cleanList[i]].color
                };
            }
            if (b == "1") {
                legendList[i] = {
                    text: mappings.surfaceTypes[cleanList[i]].text,
                    color: mappings.surfaceTypes[cleanList[i]].color
                };
            }
        }
        this._dynamicLegend = legendList;
    },
    /**
     * Returns list with four x and y coordinates for svg-path (Polygon) and type
     * @param {Array} a: heightvalue
     * @param {Array} type of profile(steepness, speed, waytypes)
     * @param {FeatureCollection}: data 
     * @returns {Number|Array|Object} list with coordinates and steepness values as array
     */
    _updateBarData: function() {
        var heightvalues = this._heightvalues;
        var types = this._types;
        var data = this._selectedData;
        var distances = this._distances;
        var profileType = this._profileType;
        var count = heightvalues.length;
        var color, text, wplist = [],
            list = [];
        var adddist = [0];
        for (var i = 0; i < count; i++) {
            adddist[i + 1] = adddist[i] + distances.distance[i];
            if (profileType == "2") {
                color = mappings.steepnessTypes[types[i]].color;
                text = mappings.steepnessTypes[types[i]].text;
            }
            if (profileType == "-1") {
                color = "gray";
                text = "";
            }
            if (profileType == "0") {
                color = mappings.wayTypes[types[i]].color;
                text = mappings.wayTypes[types[i]].text;
            }
            if (profileType == "1") {
                color = mappings.surfaceTypes[types[i]].color;
                text = mappings.surfaceTypes[types[i]].text;
            }
            list.push({
                coords: [{
                    x: adddist[i],
                    y: heightvalues[i]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: heightvalues[(i + 1 == count) ? i : i + 1]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: d3.min(heightvalues)
                }, {
                    x: adddist[i],
                    y: d3.min(heightvalues)
                }],
                type: types[i],
                text: text,
                blockdist: distances.blockDistances[i],
                color: color,
                LatLng: distances.coordsOfDist[i]
            });
        }
        this._polygonData = list;
    },
    _showMarker: function(ll, height, heightvalues, color, text) {
        var layerpoint = this._map.latLngToLayerPoint(ll);
        var normalizedAlt = height / (d3.max(heightvalues) * 5) * height;
        var normalizedY = layerpoint.y - normalizedAlt;
        if (!this._mouseHeightFocus) {
            var heightG = d3.select(".leaflet-overlay-pane svg").append("g");
            this._mouseHeightFocus = heightG.append('svg:line').attr('class', 'height-focus line').attr('x2', '0').attr('y2', '0').attr('x1', '0').attr('y1', '0');
            this._mouseHeightFocusLabel = heightG.append("g").attr('class', 'height-focus label');
            var pointG = this._pointG = heightG.append("g").attr('class', 'height-focus circle');
            pointG.append("svg:circle").attr("r", 5).attr("cx", 0).attr("cy", 0).attr("class", "height-focus circle-lower");
        }
        this._mouseHeightFocus.attr("x1", layerpoint.x).attr("x2", layerpoint.x).attr("y1", layerpoint.y).attr("y2", normalizedY);
        this._pointG.attr("transform", "translate(" + layerpoint.x + "," + layerpoint.y + ")").attr('fill', color);
        this._mouseHeightFocusLabel.selectAll("*").remove();
        this._mouseHeightFocusLabel.append("text").attr("x", layerpoint.x + 3).attr("y", normalizedY).text(height + " m");
        this._mouseHeightFocusLabel.append("text").attr("x", layerpoint.x + 3).attr("y", normalizedY + 11).text(text);
    },
    /**
     erfljkdflgdf
     */
    _createBarChart: function() {
        var polygonData = this._polygonData;
        var container = this._cont;
        var heightvalues = this._heightvalues;
        var dynamicLegend = this._dynamicLegend;
        //SVG area
        var margin = this.options.margins,
            width = this.options.width - margin.left - margin.right,
            height = this.options.height - margin.top - margin.bottom;
        var x = d3.scale.linear().range([0, width]).domain([0, distances.totaldistance]);
        var y = d3.scale.linear().range([height, 0]).domain(d3.extent(heightvalues, function(d) {
            return d;
        }));
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(8).tickFormat(function(d) {
            return d / 1000;
            // var prefix = d3.formatPrefix(d);
            // return prefix.scale(d) //+ prefix.symbol;
        });
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(8);
        // if we switch options the svgSeg has already been generated
        var svgSec;
        if (this._svgSec === undefined) {
            svgSec = this._svgSec = d3.select(this._container).append("svg").attr("class", "background").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        } else {
            console.log('ELSE')
            svgSec = this._svgSec;
        }
        // axes and axes labels
        svgSec.append('g').attr("transform", "translate(0," + height + ")") // create a <g> element
            .attr('class', 'x axis') // specify classes
            .call(xAxis);
        svgSec.append('g').attr('class', 'y axis').call(yAxis);
        var xAxisText = svgSec.append("text").attr('class', 'AxisText') // text label for the x axis
            .attr("x", width / 2).attr("y", height + 27).text("km");
        var yAxisText = svgSec.append("text").attr('class', 'AxisText') // text label for the y axis
            .attr("x", -20).attr("y", height - height - 10).text("hm");
        // scale data (polygon-path)
        var polygon = d3.svg.line().x(function(d) {
            return x(d.x);
        }).y(function(d) {
            return y(d.y);
        });
        // bar chart as path
        svgSec.selectAll('hpath').data(polygonData).enter().append('path').attr('class', 'bars').attr('d', function(d) {
            return polygon(d.coords);
        }).attr('fill', function(d) {
            return (d.color);
        }).on('mouseover', handleMouseOver);
        svgSec.on('mouseleave', handleMouseLeave);
        svgSec.on('mouseenter', handleMouseEnter);
        // focus line
        var focus = svgSec.append("g").attr("class", "focus");
        focus.append("rect").attr("x", 3).attr("y", -45).attr("width", 135).attr("height", 48);
        focus.append("text").attr("x", 7).attr("id", "distance");
        focus.append("text").attr("x", 7).attr("id", "height");
        focus.append("text").attr("x", 7).attr("id", "blockdistance");
        var focusLineGroup = svgSec.append("g").attr("class", "focusLine");
        var focusLine = focusLineGroup.append("line").attr("x1", 10).attr("x2", 10).attr("y1", y(d3.max(heightvalues))).attr("y2", y(d3.min(heightvalues)));
        // legend
        var legendRectSize = 7;
        var legendSpacing = 7;
        //legendBox.append(legend);
        var legend = svgSec.selectAll('.legend').data(dynamicLegend).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * 2;
            var horz = legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
        legend.append('rect').attr('class', 'legend-rect').attr('x', width + 20).attr('y', 8).attr('width', 6).attr('height', 6).style('fill', function(d, i) {
            return d.color;
        });
        legend.append('text').attr('class', 'legend-text').attr('x', width + 30).attr('y', 15).text(function(d, i) {
            return d.text;
        });
        //line top border
        var borderTopLine = d3.svg.line().x(function(d) {
            return x(d.coords[0].x);
        }).y(function(d) {
            return y(d.coords[0].y);
        }).interpolate("basis");
        svgSec.append("svg:path").attr("d", borderTopLine(polygonData)).attr('class', 'borderTop');
        // tick length
        d3.selectAll("g.y.axis g.tick line").attr("x2", function(d) {
            return -4;
        });
        d3.selectAll("g.x.axis g.tick line").attr("y2", function(d) {
            return 4;
        });
        var self = this;
        // Create Event Handlers for mouse
        function handleMouseOver(d, i) {
            var color = d.color;
            var text = d.text;
            var x0 = x.invert(d3.mouse(this)[0]); //distance in m
            var d0 = d.coords[0].x,
                d1 = d.coords[1].x;
            var d2 = d1 - x0 > x0 - d0 ? 0 : 1; // shortest distance between mouse and coords of polygon
            var y0 = (Math.round(((d.coords[0].y + d.coords[1].y) / 2) * 100) / 100); //height
            var LatLngCoords = d.LatLng;
            var segmentCenter = L.latLngBounds(LatLngCoords[0], LatLngCoords[1]).getCenter();
            self._showMarker(segmentCenter, y0, heightvalues, color, text);
            focus.style("display", "initial").attr("transform", "translate(" + x(x0) + "," + (self.options.height - self.options.margins.top - self.options.margins.bottom - 5) + ")");
            focus.select("#distance").text('Distance: ' + Math.round((x0 / 1000) * 100) / 100 + ' km').attr("y", -3);
            focus.select("#height").text('Height: ' + y0.toFixed(0) + ' m').attr("y", -18);
            if (d.text.length > 0) focus.select("#blockdistance").text('Length of segment: ' + (d.blockdist / 1000).toFixed(2) + ' km').attr("y", -33);
            focusLine.style("display", "initial").attr('x1', x(x0)).attr('y1', y(y0)).attr('x2', x(x0));
        }

        function handleMouseLeave() {
            if (self._mouseHeightFocus) {
                self._mouseHeightFocus.style("display", "none");
                self._mouseHeightFocusLabel.style("display", "none");
                self._pointG.style("display", "none");
                focus.style('display', 'none');
                focusLine.style('display', 'none');
            }
        }

        function handleMouseEnter() {
            if (self._mouseHeightFocus) {
                self._mouseHeightFocus.style("display", 'block');
                self._mouseHeightFocusLabel.style("display", 'block');
                self._pointG.style("display", 'block');
                focus.style('display', 'block');
                focusLine.style('display', 'block');
            }
        }
    }
});
L.control.heightgraph = function(options) {
    return new L.Control.Heightgraph(options);
};