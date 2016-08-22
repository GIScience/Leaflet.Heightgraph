var legendData = [{
    '-5': {
        text: '16%+',
        color: '#028306'
    }
}, {
    '-4': {
        text: '10-15%',
        color: '#2AA12E'
    }
}, {
    '-3': {
        text: '7-9%',
        color: '#53BF56'
    }
}, {
    '-2': {
        text: '4-6%',
        color: '#7BDD7E'
    }
}, {
    '-1': {
        text: '1-3%',
        color: '#A4FBA6'
    }
}, {
    '0': {
        text: '0%',
        color: '#ffcc99'
    }
}, {
    '1': {
        text: '1-3%',
        color: '#F29898 '
    }
}, {
    '2': {
        text: '4-6%',
        color: '#E07575'
    }
}, {
    '3': {
        text: '7-9%',
        color: '#CF5352'
    }
}, {
    '4': {
        text: '10-15%',
        color: '#BE312F'
    }
}, {
    '5': {
        text: '16%+',
        color: '#AD0F0C'
    }
}];
/**
 * Returns distance between each coordinate of Linestring
 * @param {FeatureCollection} a
 * @returns {Number|Array| Object} Object that contains distances between coordinates and sum of distances as totaldistance 
 */
var calcDistances = function(a) {
    distances = {};
    var first, calc;
    //var wpList=[];
    distances.distance = [];
    distances.wpDistance= [];
    var featureLength = a.features.length;
    console.log(featureLength)
    for (var i = 0; i < featureLength; i++) {
        var coordLength = a.features[i].geometry.coordinates.length;
        console.log('coordLength', coordLength)
        for (var j = 0; j < coordLength - 1; j++) {
            // if (typeof(a.features[i].properties.waypoint_coordinates[i])!=="undefined"){
                
            //         var wp= new L.LatLng(a.features[i].properties.waypoint_coordinates[k][0],a.features[i].properties.waypoint_coordinates[k][1]));
            //     }
            // }
            var g = new L.LatLng(a.features[i].geometry.coordinates[j][0], a.features[i].geometry.coordinates[j][1]);
            // catch steps between features
            if (j == 0 && i > 0) {
                calc = last.distanceTo(g);
                distances.distance.push(calc);
            }
            var h = new L.LatLng(a.features[i].geometry.coordinates[j + 1][0], a.features[i].geometry.coordinates[j + 1][1]);
            calc = g.distanceTo(h);
            distances.distance.push(calc);
            // save last
            if (j == coordLength - 2) {
                last = h;
            }
        }// Waypoints - Distance
        if (typeof(a.features[i].properties.waypoint_coordinates)!=="undefined"){
            for (var l=0; l<a.features[i].properties.waypoint_coordinates.length; l++){
                if (new L.LatLng(a.features[i].properties.waypoint_coordinates[l][0],a.features[i].properties.waypoint_coordinates[l][1])==g)
                distances.wpDistance.push(distances.distance.reduce(function(pv, cv) { return pv + cv; }, 0));
            }
        }
    }
    distances.totaldistance = distances.distance.reduce(function(pv, cv) { return pv + cv; }, 0);
    console.log(distances);
    return distances;
};
/**
 * Returns the values (height, steepness) of the FeatureCollection as Array in list
 * @param {FeatureCollection} a
 * @returns {Number|Array|Object} list with height values and steepness values as array
 */
var calculateHeightSteep = function(a) {
    var height = [];
    var steep = [];
    for (var i = 0; i < a.features.length; i++){ 
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
};
/**
 * Returns list with four x and y coordinates for svg-path (Polygon) and steepness type
 * @param {Array} a: heightvalue
 * @param {Array} steepness
 * @returns {Number|Array|Object} list with coordinates and steepness values as array
 */
var updateBarData = function(a, steepness) {
    var list = [];
    var wplist= [];
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
            steepness: steepness[i]
        });
        
    }
    return list;
};
/**
 * @param {Object} polygonData: (x,y-coords, steepness)
 * @param {Object} options: size-options for barChart, div for barChart
 * @param {Array} heightvalue: heightvalue of each coordinate
 */
var createBarChart = function(polygonData, options, heightvalue) {
    //SVG area
    var margin = options.margins,
        width = 1000 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var x = d3.scale.linear().range([0, width]).domain([0, distances.totaldistance]);
    var y = d3.scale.linear().range([height, 0]).domain(d3.extent(heightvalue, function(d) {
        return d;
    }));
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    //.ticks(1);
    var yAxis = d3.svg.axis().scale(y).orient("left");
    var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
        return ((Math.round(((d.coords[0].y + d.coords[1].y) / 2) * 100) / 100) + " m");
    });
    var tipDist = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
        return (d);
    });
    var svgSec = d3.select(options.div).append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svgSec.call(tip);
    var focus = svgSec.append("g").attr("class", "focus").style("display", "none");
    focus.append("circle").attr("r", 3);
    focus.append("text").attr("x", 5).attr("font-size", "12px").attr("font-family", "calibri").attr("dy", ".35em").style("background", "black");
    var focusLineGroup = svgSec.append("g").attr("class", "focusLine");
    var focusLine = focusLineGroup.append("line").attr("stroke-width", 2).attr("stroke", "black").attr("x1", 10).attr("x2", 10).attr("y1", y(d3.max(heightvalue))).attr("y2", y(d3.min(heightvalue))).style("display", "none");
    svgSec.append('g').attr("transform", "translate(0," + height + ")") // create a <g> element
        .attr('class', 'x axis') // specify classes
        .call(xAxis).append("text")
        //.attr("transform", "rotate(-90)")
        .attr("x", width - 60).attr("y", y(d3.max(heightvalue)) - 5).style("font-size", "12px").attr("font-family", "calibri").style("text-anchor", "initial").text("Distance [m]");
    svgSec.append('g').attr('class', 'y axis').call(yAxis).append("text").attr("transform", "rotate(-90)").attr("x", -50).attr("y", 4).attr("dy", ".71em").style("font-size", "12px").attr("font-family", "calibri").style("text-anchor", "initial").text("Height [m]");
    svgSec.selectAll('.axis line, .axis path').style({
        'stroke': 'Black',
        'fill': 'none',
        'stroke-width': '1'
    });
    var legendRectSize = 7;
    var legendSpacing = 7;
    var legend = svgSec.selectAll('.legend').data(legendData).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = height * 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
    });
    legend.append('rect').attr('width', legendRectSize).attr('height', legendRectSize).attr('x', 30).attr('y', 30).style('fill', function(d, i) {
        return (d[i - 5].color);
    });
    legend.append('text').attr('x', 40).attr('y', 36).style('font-size', 10).style('font-family', 'calibri').text(function(d, i) {
        return d[i - 5].text;
    });
    //bars as polygons (path)
    var polygon = d3.svg.line().x(function(d) {
        return x(d.x);
    }).y(function(d) {
        return y(d.y);
    });
    svgSec.selectAll('hpath').data(polygonData).enter().append('path')
        //.attr('leafletId', id)
        .attr('d', function(d) {
            return polygon(d.coords);
        })
        //.attr("data-legend",function(d) { return d.steepness})
        .attr("fill-opacity", 0.6).attr('fill', function(d) {
            return (d.steepness - 5 == -5 ? '#028306' : d.steepness - 5 == -4 ? '#2AA12E' : d.steepness - 5 == -3 ? '#53BF56' : d.steepness - 5 == -2 ? '#7BDD7E' : d.steepness - 5 == -1 ? '#A4FBA6' : d.steepness - 5 == 0 ? '#ffcc99' : d.steepness - 5 == 1 ? '#F29898 ' : d.steepness - 5 == -2 ? '#E07575' : d.steepness - 5 == 3 ? '#CF5352' : d.steepness - 5 == 4 ? '#BE312F' : d.steepness - 5 == 5 ? '#AD0F0C' : '#AD0F0C');
        }).on('mouseover', handleMouseOver).on("mouseout", handleMouseOut).on("mousemove", mousemove);
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

    function mousemove(d) {
        var x0 = x.invert(d3.mouse(this)[0]); //distance in m   
        var d0 = d.coords[0].x,
            d1 = d.coords[1].x;
        var d2 = d1 - x0 > x0 - d0 ? 0 : 1; // shortest distance between mouse and coords of polygon
        var y0 = d.coords[d2].y;
        focus.style("display", "initial").attr("transform", "translate(" + x(x0) + "," + y(d3.min(heightvalue)) + ")");
        focus.select("text").text(Math.round((x0 / 1000) * 100) / 100 + ' km'); //text in km
        focusLine.style("display", "initial").attr('x1', x(x0)).attr('y1', y(y0)).attr('x2', x(x0));
    }
};
/**
 * @param {FeatureCollection} data
 * @param {Object} options: size-options for barChart, div for barChart
 */
var heightprofile = function(data, options) {
    //remove previous chart
    d3.select("svg").remove();
    var distances = calcDistances(data);
    var heightvalue = calculateHeightSteep(data).height;
    var steepness = calculateHeightSteep(data).steep;
    var waypointPosition = calculateHeightSteep(data).wpFeatPos;
    var polygonData = updateBarData(heightvalue, steepness);
    var createSVG = createBarChart(polygonData, options, heightvalue);
};