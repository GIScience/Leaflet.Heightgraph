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
    /**
     * add Data from geoJson and call all functions
     * @param {FeatureCollection} data
     */
    addData: function(data) {
        if (this._svg !== undefined) {
            this._svg.selectAll("*").remove();
            /** reset options */
            var options = document.querySelectorAll('.selection option');
            for (var i = 0, l = options.length; i < l; i++) {
                options[i].selected = options[i].defaultSelected;
            }
        }
        this._data = data;
        this._selection();
        this._calcDistances();
        this._createLegendList();
        this._createBarData();
        this._createBarChart();
        this._createLegend(this._svg);
    },
    _initToggle: function() {
        /* inspired by L.Control.Layers */
        if (!L.Browser.touch) {
            L.DomEvent.disableClickPropagation(this._container);
        } else {
            L.DomEvent.on(this._container, 'click', L.DomEvent.stopPropagation);
        }
        if (!L.Browser.android) {
            L.DomEvent.on(this._button, 'click', this._expand, this);
            L.DomEvent.on(this._closeButton, 'click', this._expand, this);
        }
    },
    /**
     * expand container when button clicked and shrink when close-Button clicked
     */
    _expand: function() {
        for (var i = 0; i < this._container.children.length; i++) {
            if (!this._showState) {
                (i == 0) ? this._container.children[i].style.display = "none": this._container.children[i].style.display = "block";
            } else {
                (i == 0) ? this._container.children[i].style.display = "block": this._container.children[i].style.display = "none";
            }
        }
        this._showState = !this._showState;
    },
    /*
     * Reset data
     */
    /*    _clearData: function() {
            this._data = null;
            this._dist = null;
            this._maxElevation = null;
        },*/
    /*
     * Reset data and display
     */
    /*    clear: function() {
            this._clearData();
            if (!this._areapath) {
                return;
            }
            // workaround for 'Error: Problem parsing d=""' in Webkit when empty data
            // https://groups.google.com/d/msg/d3-js/7rFxpXKXFhI/HzIO_NPeDuMJ
            // this._areapath.datum(this._data).attr("d", this._area);
            this._areapath.attr("d", "M0 0");
            this._x.domain([0, 1]);
            this._y.domain([0, 1]);
            this._updateAxis();
        },*/
    /**
     * reacts on changes in selection box and updates heightprofile
     * @param {integer} seletedOption
     */
    _selection: function(selectedOption) {
        var data = this._data;
        this._selectedOption === undefined ? this._selectedOption = 0 : this._selectedOption = selectedOption;
        if (selectedOption !== undefined) {
            if (this._svg != undefined) {
                //remove old graph
                this._svg.selectAll("*").remove();
            }
            // build new graph
            this._createBarChart();
            this._createLegend(this._svg);
        }
    },
    /**
     * Returns distance between each coordinate of Linestring
     */
    _calcDistances: function() {
        //new
        this._profile = {};
        this._profile.ids = {};
        this._profile.blockInfo = {};
        this._profile.elevationVals = {};
        this._profile.barDistances = {};
        this._profile.barAttributes = {};
        this._profile.coords = {};
        var data = this._data;
        for (var y = 0; y <= this._data.length; y++) {
            profile = {};
            this._profile.ids[y] = {
                id: y,
                text: (data[y] === undefined) ? "None" : data[y].properties.summary
            };
            var b = (data[y] === undefined) ? data[0] : data[y];
            profile.blockDistances = [];
            profile.blockDistancesOnce = [];
            profile.blockTypesOnce = [];
            profile.blockTypeVals = [];
            profile.elevationVals = [];
            profile.barDistances = [];
            profile.barAttributes = [];
            var featureLength = b.features.length;
            profile.coordsOfDist = [];
            for (var i = 0; i < featureLength; i++) {
                var coordLength = b.features[i].geometry.coordinates.length;
                var blockDistance = 0;
                for (var j = 0; j < coordLength - 1; j++) {
                    var g = new L.LatLng(b.features[i].geometry.coordinates[j][1], b.features[i].geometry.coordinates[j][0]);
                    var h = new L.LatLng(b.features[i].geometry.coordinates[j + 1][1], b.features[i].geometry.coordinates[j + 1][0]);
                    calc = g.distanceTo(h);
                    profile.barDistances.push(calc);
                    // calculate distances of specific block
                    blockDistance += calc;
                    profile.coordsOfDist.push([g, h]);
                    //save elevation values and attribute types related to blocks
                    profile.elevationVals.push(b.features[i].geometry.coordinates[j][2]);
                    profile.blockTypeVals.push(b.features[i].properties.attributeType);
                    profile.barAttributes.push(b.features[i].properties.attributeType);
                }
                profile.blockDistances.push(Array.apply(null, Array(coordLength - 1)).map(function() {
                    return blockDistance;
                }));
                profile.blockTypesOnce.push(b.features[i].properties.attributeType);
                profile.blockDistancesOnce.push(blockDistance)
            }
            // flatten again
            profile.blockDistances = [].concat.apply([], profile.blockDistances);
            this._profile.blockInfo[y] = {
                number: featureLength,
                blockDistancesOnce: profile.blockDistancesOnce,
                blockDistances: profile.blockDistances,
                blockTypesOnce: profile.blockTypesOnce,
                blockTypes: profile.blockTypeVals
            };
            this._profile.coords[y] = profile.coordsOfDist;
            this._profile.elevationVals[y] = profile.elevationVals;
            this._profile.barDistances[y] = profile.barDistances;
            this._profile.barAttributes[y] = profile.barAttributes;
        }
        this._profile.totalDistance = profile.barDistances.reduce(function(pv, cv) {
            return pv + cv;
        }, 0);
    },
    //new
    /**
     * Creates a legend list with the proportion of each type, color, and name of type
     */
    _createLegendList: function() {
        var profileCount = this._data.length;
        this._profile.legendList = {}
        //for each profile
        for (var i = 0; i < profileCount; i++) {
            this._profile.legendList[i] = []
            var dists = this._profile.blockInfo[i].blockDistancesOnce;
            var blockTypes = this._profile.blockInfo[i].blockTypesOnce;
            //remove duplicates
            var typesCleaned = blockTypes.filter(function(elem, index) {
                return index == blockTypes.indexOf(elem);
            });
            //parse string to int
            var types = typesCleaned.map(Number);
            //find max of types
            var maxTypes = d3.max(types);
            //create Array to be filled with added distances
            var distances = Array(maxTypes + 1).fill(0);
            //create random colours if not defined by user
            if (this._mappings === undefined) {
                this._profile.colorList = this._randomColors(typesCleaned);
            }
            for (var j = 0; j < dists.length; j++) {
                var value = parseInt(blockTypes[j]);
                distances[value] = distances[value] + dists[j];
            }
            for (var k in distances) {
                if (distances[k] != 0) {
                    this._profile.legendList[i].push({
                        type: k,
                        blockDistanceSum: distances[k],
                        proportion: Math.round(distances[k] / this._profile.totalDistance * 100),
                        text: (this._mappings === undefined) ? this._profile.colorList[k].text : this._mappings[this._profile.ids[i].text][k].text,
                        color: (this._mappings === undefined) ? this._profile.colorList[k].color : this._mappings[this._profile.ids[i].text][k].color,
                    });
                }
            }
            this._profile.legendList[i].sort(function(a, b) {
                return b.blockDistanceSum - a.blockDistanceSum;
            });
        }
        this._profile.legendList[profileCount] = {
            text: "",
            color: "None"
        };
    },
    /**
     * creates a range of different random colors for highlighting the bar (when no colors are predefined)
     */
    _randomColors: function(types) {
        var values = types;
        var colorList = [];
        for (var i = 0; i < values.length; i++) {
            colorList[values[i]] = {
                color: chroma.random(),
                text: values[i]
            };
        }
        return colorList;
    },
    //new
    /**
     * Creates a list with four x,y coords and other important infos for the bars drawn with d3
     */
    _createBarData: function() {
        this._profile.maxElevation = {};
        this._profile.minElevation = {};
        //starts at 0
        var x = [0];
        var list = {};
        //for each profile
        for (var i = 0; i < this._data.length; i++) {
            list[i] = [];
            //highest and lowest elevation Value
            this._profile.maxElevation[i] = d3.max(this._profile.elevationVals[i]);
            this._profile.minElevation[i] = d3.min(this._profile.elevationVals[i]);
            for (var j = 0; j < this._profile.elevationVals[i].length; j++) {
                //text and colour for each bar
                var text = this._mappings === undefined ? this._profile.colorList[i].text : this._mappings[this._profile.ids[i].text][this._profile.barAttributes[i][j]].text;
                var color = this._mappings === undefined ? this._profile.colorList[i].color : this._mappings[this._profile.ids[i].text][this._profile.barAttributes[i][j]].color;
                //added distance for each bar
                x[j + 1] = x[j] + this._profile.barDistances[i][j];
                list[i].push({
                    coords: [{
                        x: x[j],
                        y: this._profile.elevationVals[i][j]
                    }, {
                        x: x[(j + 1 == this._profile.elevationVals[i].length) ? j : j + 1],
                        y: this._profile.elevationVals[i][(j + 1 == this._profile.elevationVals[i].length) ? j : j + 1]
                    }, {
                        x: x[(j + 1 == this._profile.elevationVals[i].length) ? j : j + 1],
                        y: (this._profile.minElevation[i] - (this._profile.maxElevation[i] / 10))
                    }, {
                        x: x[j],
                        y: (this._profile.minElevation[i] - (this._profile.maxElevation[i] / 10))
                    }],
                    coords_maxElevation: [{
                        x: x[j],
                        y: this._profile.maxElevation[i]
                    }, {
                        x: x[(j + 1 == this._profile.elevationVals[i].length) ? j : j + 1],
                        y: this._profile.maxElevation[i]
                    }, {
                        x: x[(j + 1 == this._profile.elevationVals[i].length) ? j : j + 1],
                        y: (this._profile.minElevation[i] - this._profile.maxElevation[i] / 10)
                    }, {
                        x: x[j],
                        y: (this._profile.minElevation[i] - this._profile.maxElevation[i] / 10)
                    }],
                    type: this._profile.barAttributes[i][j],
                    text: text,
                    blockdist: this._profile.blockInfo[i].blockDistances[j],
                    color: color,
                    LatLng: this._profile.coords[i][j]
                })
            }
        }
        var none = list[0].slice();
        for (l in none) {
            none[l] = {
                text: "",
                color: "lightgrey",
                type: "",
                blockdist: none[l].blockdist,
                LatLng: none[l].LatLng,
                coords_maxElevation: none[l].coords_maxElevation,
                coords: none[l].coords
            }
        }
        list[this._data.length] = none;
        this._profile.maxElevation[this._data.length] = d3.max(this._profile.elevationVals[0]);
        this._profile.minElevation[this._data.length] = d3.min(this._profile.elevationVals[0]);
        this._profile.barData = list;
    },
    //
    /**
     * Creates a marker on the map while hovering
     * @param {FeatureCollection} lat lon: actual coordinates of the route
     * @param {float} height: actual height
     * @param {string} color: color of graph-segment
     * @param {string} text: value of graph-segment
     */
    _showMarker: function(segmentCenter, height, color, text) {
        var layerpoint = this._map.latLngToLayerPoint(segmentCenter);
        var normalizedY = layerpoint.y - 75;
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
        this._mouseHeightFocusLabel.append("rect").attr("x", layerpoint.x + 3).attr("y", normalizedY).attr("width", 75).attr("height", 30);
        this._mouseHeightFocusLabel.append("text").attr("x", layerpoint.x + 5).attr("y", normalizedY + 12).text(height + " m").attr("class", "tspan");
        this._mouseHeightFocusLabel.append("text").attr("x", layerpoint.x + 5).attr("y", normalizedY + 24).text(text).attr("class", "tspan");
    },
    /**
     * Creates the elevation profile with SVG
     */
    _createBarChart: function() {
        var y = this._selectedOption;
        var polygonData = this._profile.barData[y]; // this._polygonData ist in createBorderTopLine undefined... warum?
        var dynamicLegend = this._profile.legendList[y]; // this._dynamicLegend ist in createLegend undefined... warum?
        //SVG area
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        //Max and Min of heightvalues of graph
        var min = this._profile.minElevation[y];
        var max = this._profile.maxElevation[y];
        var yElevationMin = this._profile.yElevationMin = this._profile.minElevation[y] - (this._profile.maxElevation[y] / 10);
        var svg;
        var self = this;
        self._createScales();
        //create SVG area with all appended functions
        // if we switch options the svgSeg has already been generated
        if (this._svg === undefined) {
            svg = this._svg = d3.select(this._container).append("svg").attr("class", "background").attr("width", width + this._margin.left + this._margin.right).attr("height", height + this._margin.top + this._margin.bottom).append("g").attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");
        } else {
            svg = this._svg;
        }
        // append x grid
        this._svg.append("g").attr("class", "grid").attr("transform", "translate(0," + height + ")").call(self._make_x_axis().tickSize(-height, 0, 0).tickFormat(""));
        // append y grid
        this._svg.append("g").attr("class", "grid").call(self._make_y_axis().tickSize(-width, 0, 0).ticks(5).tickFormat(""));
        // axes and axes labels
        this._svg.append('g').attr("transform", "translate(0," + height + ")") // create a <g> element
            .attr('class', 'x axis') // specify classes
            .call(this._xAxis);
        this._svg.append('g').attr('class', 'y axis').call(this._yAxis);
        this._svg.append('g').attr('class', 'y axis').attr("transform", "translate(" + width + " ,0)").call(this._yEndAxis);
        // scale data (polygon-path)
        var polygon = d3.svg.line().x(function(d) {
            var x = self._x;
            return x(d.x);
        }).y(function(d) {
            var y = self._y;
            return y(d.y);
        });
        // bar chart as path
        this._svg.selectAll('hpath').data(this._profile.barData[y]).enter().append('path').attr('class', 'bars').attr('d', function(d) {
            return polygon(d.coords);
        }).attr('fill', function(d) {
            return (d.color);
        });
        // bar chart invisible for hover as path
        this._svg.selectAll('hpath').data(this._profile.barData[y]).enter().append('path').attr('class', 'bars-overlay').attr('d', function(d) {
            return polygon(d.coords_maxElevation);
        }).on('mouseover', self._handleMouseOver);
        this._svg.on('mouseleave', self._handleMouseLeave);
        self._createBorderTopLine(this._profile.barData[y], svg);
        self._createSelectionBox(svg);
        //self._createLegend(svg);
        self._createFocus();
    },
    // create focus Line and focus InfoBox while hovering
    _createFocus: function() {
        var self = this;
        var boxPosition = self._profile.yElevationMin - 88;
        var textPosition = boxPosition + 27;
        var textDistance = 35;
        this._focusWidth = 150;
        self._focus = self._svg.append("g").attr("class", "focus");
        self._focus.append("rect").attr("x", 3).attr("y", -self._y(boxPosition)).attr("width", this._focusWidth).attr("height", 62);
        self._focusDistance = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition)).attr("id", "distance").text('Distance:');
        self._focusHeight = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + textDistance)).attr("id", "height").text('Elevation:');
        if (self._selectedOption < self._data.length) {
            self._focusBlockDistance = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + 2 * textDistance)).attr("id", "blockdistance").text('Segment length:');
            self._focusType = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + 3 * textDistance)).attr("id", "type").text('Type:');
            this._BlockDistanceTspan = self._focusBlockDistance.append('tspan').attr("class", "tspan");
            this._TypeTspan = self._focusType.append('tspan').attr("class", "tspan");
        }
        self._focusLineGroup = self._svg.append("g").attr("class", "focusLine");
        self._focusLine = self._focusLineGroup.append("line").attr("y1", 0).attr("y2", self._y(self._profile.minElevation[self._selectedOption] - (self._profile.maxElevation[self._selectedOption] / 10)));
        this._DistanceTspan = self._focusDistance.append('tspan').attr("class", "tspan");
        this._HeightTspan = self._focusHeight.append('tspan').attr("class", "tspan");
    },
    /**
     * defines the ranges and format of x- and y- scales
     */
    _createScales: function() {
        var x, y, xAxis, yAxis;
        var yHeightmin = this._profile.yElevationMin;
        var max = this._profile.maxElevation[this._selectedOption];
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        this._x = d3.scale.linear().range([0, width]).domain([-80, this._profile.totalDistance]);
        this._y = d3.scale.linear().range([height, 0]).domain([yHeightmin - 2, max]);
        this._yEnd = d3.scale.linear().range([height, 0]).domain([yHeightmin, max]);
        this._xAxis = d3.svg.axis().scale(this._x).orient("bottom").tickFormat(function(d) {
            return d / 1000 + " km";
            // var prefix = d3.formatPrefix(d);
            // return prefix.scale(d) //+ prefix.symbol;
        });
        this._yAxis = d3.svg.axis().scale(this._y).orient("left").ticks(5).tickFormat(function(d) {
            return d + " m";
        });
        this._yEndAxis = d3.svg.axis().scale(this._yEnd).orient("right").ticks(0);
    },
    // gridlines in x axis function
    _make_x_axis: function() {
        return d3.svg.axis().scale(this._x).orient("bottom");
    },
    // gridlines in y axis function
    _make_y_axis: function() {
        return d3.svg.axis().scale(this._y).orient("left");
    },
    _createSelectionBox: function(svg) {
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        var jsonCircles = [{
            "x": 0,
            "y": height + 35,
            "color": "grey",
            "type": "triangle-up",
            "id": "leftArrowSelection"
        }, {
            "x": 80,
            "y": height + 35,
            "color": "grey",
            "type": "triangle-down",
            "id": "rightArrowSelection"
        }];
        var selectionSign = svg.selectAll('.selectSign').data(jsonCircles).enter().append('path').attr("class", "selectSign").attr("d", d3.svg.symbol().type(function(d) {
            return d.type;
        })).attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }).attr("id", function(d) {
            return d.id;
        }).style("fill", function(d) {
            return d.color;
        }).on("click", function(d) {
            if (d.id == "rightArrowSelection") arrowRight();
            if (d.id == "leftArrowSelection") arrowLeft();
        });
        var self = this;
        self._length = this._data.length;
        var id = this._selectedOption;
        chooseSelection(id);

        function arrowRight() {
            var counter = self._selectedOption += 1;
            if (counter == self._data.length + 1) {
                counter = 0
                self._selectedOption = 0;
            }
            self._selection(self._selectedOption);
            chooseSelection(counter);
        }

        function arrowLeft() {
            var counter = self._selectedOption -= 1;
            if (counter == -1) {
                counter = self._data.length;
                self._selectedOption = self._data.length;
            }
            chooseSelection(counter);
            self._selection(self._selectedOption);
        }

        function chooseSelection(id) {
            var type = self._profile.ids[id] //allProfileTypes[id];
            var data = [{
                "selection": type.text
            }];
            svg.selectAll('.text').data(data).enter().append('text').attr("x", 15).attr("y", height + 40).text(function(d) {
                return d.selection;
            }).attr("class", "legend-menu").attr("id", "selectionText");
        }
        this._selectedOption = self._selectedOption;
    },
    /**
     * create dynamic legend with d3
     */
    _createLegend: function(svg) {
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        var leg = [{
            "text": "Legend"
        }];
        var legendRectSize = 7;
        var legendSpacing = 7;
        var self = this;
        legendHover = svg.selectAll('.legend-hover').data(leg).enter().append('g').attr('class', 'legend-hover');
        var backgroundbox = svg.selectAll('.legend-hover').append('rect').attr('x', 450).attr('y', 0).attr('height', 150).attr('width', 170).attr('class', 'legend-box');
        //svg.selectAll('.legend-hover').append('text').text('hallo').attr('x', 450).attr('y', 20).attr('fill','white').attr('class','legend-newtext');
        var legend = svg.selectAll('.hlegend-hover').data(this._profile.legendList[this._selectedOption]).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * 2;
            var horz = legendRectSize - 15;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
        legend.append('rect').attr('class', 'legend-rect').attr('x', 465).attr('y', height - (2 * height / 3)).attr('width', 6).attr('height', 6).style('fill', function(d, i) {
            return d.color;
        });
        legend.append('text').attr('class', 'legend-text').attr('x', 475).attr('y', height - (2 * height / 3) + 7).text(function(d, i) {
            return d.text;
        });
        legend.append('text').attr('class', 'legend-text').attr('x', 575).attr('y', height - (2 * height / 3) + 7).text(function(d, i) {
            var textAdd = "(" + d.proportion + "%)";
            return textAdd;
        });
        legendHover.append('text').attr('class', 'legend-menu').attr("class", "no-select").attr('x', width - 50).attr('y', height + 40).text(function(d, i) {
            return d.text;
        }).on('mouseover', function() {
            d3.select('.legend-box')[0][0].style.display = "block";
            d3.select('.legend-box')[0][0].style.stroke = "#888";
            if (self._selectedOption >= 0) {
                var legend = d3.selectAll('.legend')[0];
                if (legend) {
                    for (var i = 0; i < legend.length; i++) {
                        for (var j = 0; j < legend[i].children.length; j++) {
                            legend[i].children[j].style.display = "block";
                        }
                    }
                }
            }
        }).on('mouseleave', function() {
            d3.selectAll('.legend-box')[0][0].style.display = "none";
            var legend = d3.selectAll('.legend')[0];
            if (legend) {
                for (var i = 0; i < legend.length; i++) {
                    for (var j = 0; j < legend[i].children.length; j++) {
                        legend[i].children[j].style.display = "none";
                    }
                }
            }
        });
    },
    /**
     * create top border line on graph 
     * @param {array} polygonData: coords with x,y values 
     * @param {array} svg: existing graph
     */
    _createBorderTopLine: function(polygonData, svg) {
        var self = this;
        var borderTopLine = d3.svg.line().x(function(d) {
            var x = self._x;
            return x(d.coords[0].x);
        }).y(function(d) {
            var y = self._y;
            return y(d.coords[0].y);
        }).interpolate("basis");
        svg.append("svg:path").attr("d", borderTopLine(polygonData)).attr('class', 'borderTop');
    },
    /**
     * creates Info-Boxes while hovering the graph
     * @param {FeatureCollection} d: contains coords, type, text, blockdistance
     * @param {integer} i: number of block
     */
    _handleMouseOver: function(d, i) {
        var self = window.hg;
        var x0 = self._x.invert(d3.mouse(this)[0]); //distance in m
        var d0 = d.coords[0].x,
            d1 = d.coords[1].x;
        var d2 = d1 - x0 > x0 - d0 ? 0 : 1; // shortest distance between mouse and coords of polygon
        var y0 = (Math.round(((d.coords[0].y + d.coords[1].y) / 2) * 100) / 100); //height
        var color = d.color;
        var text = d.text;
        var LatLngCoords = d.LatLng;
        var segmentCenter = L.latLngBounds(LatLngCoords[0], LatLngCoords[1]).getCenter();
        self._showMarker(segmentCenter, y0, color, text);
        var xPositionBox = self._x(x0) - (self._focusWidth + 5);
        var totalWidth = self._width - self._margin.left - self._margin.right;
        if (self._x(x0) + self._focusWidth < totalWidth) {
            self._focus.style("display", "initial").attr("transform", "translate(" + self._x(x0) + "," + (self.options.height - self.options.margins.top - self.options.margins.bottom - 30) + ")");
        }
        if (self._x(x0) + self._focusWidth > totalWidth) {
            self._focus.style("display", "initial").attr("transform", "translate(" + xPositionBox + "," + (self.options.height - self.options.margins.top - self.options.margins.bottom - 30) + ")");
        }
        self._DistanceTspan.text(" " + Math.round((x0 / 1000) * 100) / 100 + ' km');
        self._HeightTspan.text(" " + y0.toFixed(0) + ' m');
        if (d.text.length > 0) self._BlockDistanceTspan.text(" " + (d.blockdist / 1000).toFixed(2) + ' km');
        self._TypeTspan.text(" " + d.text);
        self._focusLine.style("display", "block").attr('x1', self._x(x0)).attr('x2', self._x(x0));
        if (self._mouseHeightFocus) {
            self._mouseHeightFocus.style("display", 'block');
            self._mouseHeightFocusLabel.style("display", 'block');
            self._pointG.style("display", 'block');
            self._focus.style('display', 'block');
            self._focusLine.style('display', 'block');
        }
    },
    /**
     * handles mouseLeave event with removing hover box and hover line
     */
    _handleMouseLeave: function() {
        var self = window.hg;
        if (self._mouseHeightFocus) {
            self._mouseHeightFocus.style("display", "none");
            self._mouseHeightFocusLabel.style("display", "none");
            self._pointG.style("display", "none");
            self._focus.style('display', 'none');
            self._focusLine.style('display', 'none');
        }
    }
});
L.control.heightgraph = function(options) {
    return new L.Control.Heightgraph(options);
};