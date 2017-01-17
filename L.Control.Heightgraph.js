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
        var buttonContainer = this._button = L.DomUtil.create('div', "heightgraph-toggle", controlDiv);
        var link = L.DomUtil.create('a', "heightgraph-toggle-icon", buttonContainer);
        link.href = '#';
        var closeButton = this._closeButton = L.DomUtil.create('a', "heightgraph-close-icon", controlDiv);
        /*        var extendButton = this._extendButton = L.DomUtil.create('button', 'extent-container', controlDiv);
                var selectionArea = this._selectionArea = L.DomUtil.create('textarea', "selection-area", controlDiv);
                this._extendButton.value = "<<";
                this._extendButton.value = "waytypes";*/
        this._showState = false;
        this._map = map;
        this._initToggle();
        this._cont = d3.select(controlDiv);
        // size for heightgraph box (svg)
        this._margin = this.options.margins;
        this._width = this.options.width - this._margin.left - this._margin.right;
        this._height = this.options.height - this._margin.top - this._margin.bottom;
        return controlDiv;
    },
    onRemove: function(map) {
        this._container = null;
        this._svg = undefined;
    },
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
        this._findProfileTypes(data);
        this._selection();
        this._calcDistances();
        this._calculateHeightType();
        this._updateLegend();
        this._updateBarData();
        this._createBarChart();
        this._createLegend(this._svg);
    },
    _initToggle: function() {
        /* inspired by L.Control.Layers */
        if (!L.Browser.touch) {
            L.DomEvent.disableClickPropagation(this._container);
            //.disableScrollPropagation(container);
        } else {
            L.DomEvent.on(this._container, 'click', L.DomEvent.stopPropagation);
        }
        if (!L.Browser.android) {
            L.DomEvent.on(this._button, 'click', this._expand, this);
            L.DomEvent.on(this._closeButton, 'click', this._expand, this);
        }
    },
    /*
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
    /*find all existing ProfileTypes of data for creating dynamic legend
     * @param {FeatureCollection} data
     */
    _findProfileTypes: function(data) {
        var length = this._dataLength = data.length;
        var allProfileTypes = [];
        //var shownText;
        for (var i = 0; i < length; i++) {
            var type = data[i].properties.summary;
            allProfileTypes.push({
                text: type,
                type: type,
                id: i
            });
        }
        allProfileTypes.push({
            text: "None",
            type: "None",
            id: -1
        });
        this._allProfileTypes = allProfileTypes;
    },
    /* reacts on changes in selection box and updates heightprofile
     * @param {FeatureCollection} data
     */
    _selection: function(selectedOption) {
        var data = this._data;
        this._selectedData = data[0];
        this._selectedOption == undefined ? this._selectedOption = 0 : this._selectedOption = selectedOption;
        if (selectedOption != undefined) {
            this._svg.selectAll("*").remove();
            this._profileType = this._selectedOption;
            this._profileType == -1 ? this._selectedData = data[0] : this._selectedData = data[this._profileType];
            //this._profileType == 3 ? this._selectedData = data[0] : this._selectedData = data[this._profileType];
            this._calcDistances();
            this._calculateHeightType();
            this._updateLegend();
            this._updateBarData();
            this._createBarChart();
            this._createLegend(this._svg);
        }
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
        distances.blockDistancesOnce = [];
        distances.blockTypes = [];
        distances.blockTypesOnce = [];
        distances.blocks = [];
        var featureLength = this._featureLength = a.features.length;
        distances.coordsOfDist = [];
        for (var i = 0; i < featureLength; i++) {
            var coordLength = a.features[i].geometry.coordinates.length;
            var blockDistance = 0;
            for (var j = 0; j < coordLength - 1; j++) {
                var g = new L.LatLng(a.features[i].geometry.coordinates[j][1], a.features[i].geometry.coordinates[j][0]);
                var h = new L.LatLng(a.features[i].geometry.coordinates[j + 1][1], a.features[i].geometry.coordinates[j + 1][0]);
                calc = g.distanceTo(h);
                distances.distance.push(calc);
                //save types related to blockDistances
                var t = a.features[i].properties.attributeType[0];
                distances.blockTypes.push(t);
                // calculate distances of specific block
                blockDistance += calc;
                distances.coordsOfDist.push([g, h]);
            }
            distances.blockDistances.push(Array.apply(null, Array(coordLength - 1)).map(function() {
                return blockDistance;
            }));
            distances.blockTypesOnce.push(t);
        }
        //save block types and
        for (var g = 0; g < distances.blockDistances.length; g++) {
            distances.blocks.push({
                blockType: distances.blockTypesOnce[g],
                distance: distances.blockDistances[g][0]
            });
        }
        // flatten again
        distances.blockDistances = [].concat.apply([], distances.blockDistances);
        distances.blockDistancesOnce = distances.blockDistances.filter(function(elem, index) {
            return index == distances.blockDistances.indexOf(elem);
        });
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
        var values = [];
        for (var i = 0; i < this._featureLength; i++) {
            var coordNumber = a.features[i].geometry.coordinates.length;
            // ignore first entry
            for (var j = 1; j < coordNumber; j++) {
                heights.push(a.features[i].geometry.coordinates[j][2]);
                values.push(a.features[i].properties.attributeType);
            }
        }
        this._heightvalues = heights;
        this._values = values;
    },
    /**
     * Calculates the proportion of each Type to be displayed in the legend
     * 
     * @returns {Number|Array|Object} list with
     */
    _calculateTypeRate: function() {
        //doppelte typen zusammenrechnen --> in propfunct
        var typesString = this._cleanList;
        //console.log(typesString);
        var types = typesString.map(Number);
        var maxTypes = d3.max(types);
        var totaldistance = this._distances.totaldistance;
        console.log(totaldistance)
        var a = this._distances.blocks;
        console.log(a)
        var distances = Array(maxTypes + 1).fill(0);
        this._blockList = [];
        for (var i = 0; i < a.length; i++) {
            type = parseInt(a[i].blockType);
            distances[type] = distances[type] + a[i].distance;
        }
        //console.log(distances)
        for (var j in distances) {
            this._blockList.push({
                type: j,
                blockDistanceSum: distances[j],
                proportion: "(" + Math.round(distances[j] / totaldistance * 100) + "%)"
            });
        }
        //proportion: (b[i] / a) * 100
        //console.log(this._blockList);
    },
    /**
     * Returns values of profileType-option as Array without duplicates 
     * @param {Array} a: values of profileType (steepness, speed, watypes,...) of all coords
     * @param {String} b: profileType(steepness, speed, waytypes)
     * @returns {Array} list with steepness color and text as array
     */
    _updateLegend: function() {
        var a = this._values;
        var b = (this._selectedOption != -1) ? this._allProfileTypes[this._selectedOption].text : "None";
        var c = (this._selectedOption != -1) ? this._allProfileTypes[this._selectedOption].type : "None";
        var legendList = [];
        var text = [];
        var color = [];
        var self = this;
        //console.log(a);
        //remove duplicates
        this._cleanList = a.filter(function(elem, index) {
            return index == a.indexOf(elem);
        });

        function sortNumber(a, b) {
            return a - b;
        }
        //Calculate Proportion of each Block in relation to totaldistance
        self._calculateTypeRate();
        //create random colors for undefined types
        if (mappings[c] === undefined) {
            this._colorList = self._createRandomColors();
        }
        for (var i = 0; i < this._cleanList.length; i++) {
            //if None-Profile is selected
            if (this._selectedOption == -1) {
                legendList[i] = {
                    text: "",
                    color: "None"
                };
            } else {
                console.log(self._blockList);
                legendList[i] = {
                    text: (mappings[c] === undefined) ? this._colorList[this._cleanList[i]].text : mappings[c][this._cleanList[i]].text,
                    color: (mappings[c] === undefined) ? this._colorList[this._cleanList[i]].color : mappings[c][this._cleanList[i]].color,
                    type: this._cleanList[i],
                    proportion: self._blockList[this._cleanList[i]].proportion
                };
            }
        }
        this._dynamicLegend = legendList;
    },
    /**creates a range of different colors for highlighting the bar
     * @param ainteger
     */
    _createRandomColors: function() {
        var values = this._cleanList;
        var colorList = [];
        for (var i = 0; i < this._cleanList.length; i++) {
            colorList[values[i]] = {
                color: chroma.random(),
                text: values[i]
            };
        }
        return colorList;
    },
    /**
     * Returns list with four x and y coordinates for svg-path (Polygon) and type,text, blockDistance, color, LatLng
     * @param {Array} a: heightvalue
     * @param {Array} type of profile(steepness, speed, waytypes)
     * @param {FeatureCollection}: data 
     * @returns {Number|Array|Object} list with coordinates and other informtions as array
     */
    _updateBarData: function() {
        //var b = (this._selectedOption != -1) ? this._allProfileTypes[this._selectedOption].text : "None";
        var c = (this._selectedOption != -1) ? this._allProfileTypes[this._selectedOption].type : "None";
        var count = this._heightvalues.length;
        var color, text, list = [];
        var adddist = [0];
        this._maxHeight = d3.max(this._heightvalues);
        this._minHeight = d3.min(this._heightvalues);
        for (var i = 0; i < count; i++) {
            adddist[i + 1] = adddist[i] + this._distances.distance[i];
            if (this._selectedOption == -1) {
                text = "";
                color = "lightgrey";
            } else {
                text = mappings[c] === undefined ? this._colorList[this._values[i]].text : mappings[c][this._values[i]].text;
                color = mappings[c] === undefined ? this._colorList[this._values[i]].color : mappings[c][this._values[i]].color;
            }
            list.push({
                coords: [{
                    x: adddist[i],
                    y: this._heightvalues[i]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: this._heightvalues[(i + 1 == count) ? i : i + 1]
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: (this._minHeight - (this._maxHeight / 10))
                }, {
                    x: adddist[i],
                    y: (this._minHeight - (this._maxHeight / 10))
                }],
                coords_maxheight: [{
                    x: adddist[i],
                    y: this._maxHeight
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: this._maxHeight
                }, {
                    x: adddist[(i + 1 == count) ? i : i + 1],
                    y: (this._minHeight - this._maxHeight / 10)
                }, {
                    x: adddist[i],
                    y: (this._minHeight - this._maxHeight / 10)
                }],
                type: this._values[i],
                text: text,
                blockdist: this._distances.blockDistances[i],
                color: color,
                LatLng: this._distances.coordsOfDist[i]
            });
        }
        this._polygonData = list;
    },
    /**
     * Creates a marker on the map while hovering
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
     * Creates the height profile with SVG
     */
    _createBarChart: function() {
        var polygonData = this._polygonData; // this._polygonData ist in createBorderTopLine undefined... warum?
        var dynamicLegend = this._dynamicLegend; // this._dynamicLegend ist in createLegend undefined... warum?
        //SVG area
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        //Max and Min of heightvalues of graph
        var min = this._minHeight;
        var max = this._maxHeight;
        var yHeightmin = this._yHeightmin = this._minHeight - (this._maxHeight / 10);
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
            //if (maxheight) return 
            var x = self._x;
            return x(d.x);
        }).y(function(d) {
            var y = self._y;
            return y(d.y);
        });
        // bar chart as path
        this._svg.selectAll('hpath').data(this._polygonData).enter().append('path').attr('class', 'bars').attr('d', function(d) {
            return polygon(d.coords);
        }).attr('fill', function(d) {
            return (d.color);
        });
        // bar chart invisible for hover as path
        this._svg.selectAll('hpath').data(this._polygonData).enter().append('path').attr('class', 'bars-overlay').attr('d', function(d) {
            return polygon(d.coords_maxheight);
        }).on('mouseover', self._handleMouseOver);
        this._svg.on('mouseleave', self._handleMouseLeave);
        this._svg.on('mouseenter', self._handleMouseEnter);
        self._createSelectionBox(svg);
        self._createLegendHoverBox(svg);
        self._createBorderTopLine(polygonData, svg);
        self._createFocus();
    },
    // create focus Line and focus InfoBox while hovering
    _createFocus: function() {
        var self = this;
        var boxPosition = self._yHeightmin - 88;
        var textPosition = boxPosition + 27;
        var textDistance = 35;
        this._focusWidth = 150;
        self._focus = self._svg.append("g").attr("class", "focus");
        self._focus.append("rect").attr("x", 3).attr("y", -self._y(boxPosition)).attr("width", this._focusWidth).attr("height", 62);
        self._focusDistance = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition)).attr("id", "distance").text('Distance:');
        self._focusHeight = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + textDistance)).attr("id", "height").text('Elevation:');
        self._focusBlockDistance = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + 2 * textDistance)).attr("id", "blockdistance").text('Segment length:');
        self._focusType = self._focus.append("text").attr("x", 7).attr("y", -self._y(textPosition + 3 * textDistance)).attr("id", "type").text('Type:');
        self._focusLineGroup = self._svg.append("g").attr("class", "focusLine");
        self._focusLine = self._focusLineGroup.append("line").attr("y1", 0).attr("y2", self._y(this._minHeight - (this._maxHeight / 10)));
        this._DistanceTspan = self._focusDistance.append('tspan').attr("class", "tspan");
        this._HeightTspan = self._focusHeight.append('tspan').attr("class", "tspan");
        this._BlockDistanceTspan = self._focusBlockDistance.append('tspan').attr("class", "tspan");
        this._TypeTspan = self._focusType.append('tspan').attr("class", "tspan");
    },
    /**
     * defines the ranges and format of x- and y- scales
     */
    _createScales: function() {
        var x, y, xAxis, yAxis;
        var yHeightmin = this._yHeightmin;
        var max = this._maxHeight;
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        this._x = d3.scale.linear().range([0, width]).domain([-80, distances.totaldistance]);
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
            "x": width / 10,
            "y": height + 35,
            "color": "grey",
            "type": "triangle-up",
            "id": "leftArrowSelection"
        }, {
            "x": width / 10 + 80,
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
        }).
        on("click", function(d) {
            if (d.id == "rightArrowSelection") arrowRight();
            if (d.id == "leftArrowSelection") arrowLeft();
        });
        var self = this;
        self._length = this._allProfileTypes.length;
        var id = this._selectedOption == -1 ? this._allProfileTypes.length - 1 : this._selectedOption;
        chooseSelection(id);

        function arrowRight() {
            var counter = self._selectedOption += 1;
            if (counter == self._allProfileTypes.length - 1) {
                self._selectedOption = -1;
            }
            self._selection(self._selectedOption);
            chooseSelection(counter);
        }

        function arrowLeft() {
            var counter = self._selectedOption -= 1;
            if (counter == -1) {
                counter = self._allProfileTypes.length - 1;
                self._selectedOption = -1;
            }
            if (counter < -1) {
                counter = self._allProfileTypes.length - 2;
                self._selectedOption = self._allProfileTypes.length - 2;
            }
            chooseSelection(counter);
            self._selection(self._selectedOption);
        }

        function chooseSelection(id) {
            var type = self._allProfileTypes[id];
            var data = [{
                "selection": type.text
            }];
            svg.selectAll('.text').data(data).enter().append('text').attr("x", width / 10 + 15).attr("y", height + 40).text(function(d) {
                return d.selection;
            })
            .attr("class", "text")
            .attr("id", "selectionText")
            .attr("text", 'ROFL');
        }
        this._selectedOption = self._selectedOption;
    },
    _createLegendHoverBox: function(svg) {
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        var leg = [{
            "text": "Legend"
        }];
        var self = this;
        legendHover = svg.selectAll('.legend-hover').data(leg).enter().append('g').attr('class', 'legend-hover');
        legendHover.append('text').attr('class', 'legend-menu').attr('x', width / 10 + 120).attr('y', height + 40).text(function(d, i) {
            return d.text;
        }).on('mouseover', function() {
            var legend = d3.selectAll('.legend')[0];
            if (legend) {
                for (var i = 0; i < legend.length; i++) {
                    for (var j = 0; j < legend[i].children.length; j++) {
                        legend[i].children[j].style.display = "block";
                    }
                }
            }
        }).on('mouseleave', function() {
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
    /* create dynamic legend
     */
    _createLegend: function(svg) {
        //console.log(box)
        var margin = this._margins,
            width = this._width - this._margin.left - this._margin.right,
            height = this._height - this._margin.top - this._margin.bottom;
        var legendRectSize = 7;
        var legendSpacing = 7;
        var legend = svg.selectAll('.g').data(this._dynamicLegend).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * 2;
            var horz = legendRectSize - 15;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
        legend.append('rect').attr('class', 'legend-rect').attr('x', width / 10 + 160).attr('y', height - (2 * height / 3)).attr('width', 6).attr('height', 6).style('fill', function(d, i) {
            return d.color;
        });
        legend.append('text').attr('class', 'legend-text').attr('x', width / 10 + 170).attr('y', height - (2 * height / 3) + 7).text(function(d, i) {
            return d.text;
        });
        legend.append('text').attr('class', 'legend-text').attr('x', width / 10 + 270).attr('y', height - (2 * height / 3) + 7).text(function(d, i) {
            return d.proportion;
        });
    },
    /*create top border line on graph
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
    /*creates Info-Boxes while hovering the graph
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
            self._focus.style("display", "initial").attr("transform", "translate(" + self._x(x0) + "," + (self.options.height - self.options.margins.top - self.options.margins.bottom - 5) + ")");
        }
        if (self._x(x0) + self._focusWidth > totalWidth) {
            self._focus.style("display", "initial").attr("transform", "translate(" + xPositionBox + "," + (self.options.height - self.options.margins.top - self.options.margins.bottom - 5) + ")");
        }
        self._DistanceTspan.text(" " + Math.round((x0 / 1000) * 100) / 100 + ' km');
        self._HeightTspan.text(" " + y0.toFixed(0) + ' m');
        if (d.text.length > 0) self._BlockDistanceTspan.text(" " + (d.blockdist / 1000).toFixed(2) + ' km');
        self._TypeTspan.text(" " + d.text);
        //self._focus.select("#distance").text('Distance: ' + Math.round((x0 / 1000) * 100) / 100 + ' km');
        //self._focus.select("#height").text('Height: ' + y0.toFixed(0) + ' m');
        //self._focus.select("#type").text('Value: ' + d.text);
        //if (d.text.length > 0) self._focus.select("#blockdistance").text('Segment length: ' + (d.blockdist / 1000).toFixed(2) + ' km');
        self._focusLine.style("display", "initial").attr('x1', self._x(x0)).attr('x2', self._x(x0));
    },
    _handleMouseLeave: function() {
        if (self._mouseHeightFocus) {
            self._mouseHeightFocus.style("display", "none");
            self._mouseHeightFocusLabel.style("display", "none");
            self._pointG.style("display", "none");
            self._focus.style('display', 'none');
            self._focusLine.style('display', 'none');
        }
    },
    _handleMouseEnter: function() {
        if (self._mouseHeightFocus) {
            self._mouseHeightFocus.style("display", 'block');
            self._mouseHeightFocusLabel.style("display", 'block');
            self._pointG.style("display", 'block');
            self._focus.style('display', 'block');
            self._focusLine.style('display', 'block');
        }
    },
    _handleMouseClick: function() {
        console.log('hi');
    }
});
L.control.heightgraph = function(options) {
    return new L.Control.Heightgraph(options);
};