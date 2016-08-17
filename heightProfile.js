var heightprofile = function (data, div){
  //Abfrage ob Steepness vorhanden
  if (typeof(data.features[0].properties.steepness) !== 'undefined'){

    //var pathData = updateBarData(data);
    //function updateBarData(data){
      //distance: distance between start and endpoint of a linestring (=width of a bar)
      //last and first: distance between last coordinate with same steepness to first coordinate with different steepness 
      //polygonData: Data for d3.path (x1, y1; x2, y2; x3,y3; x4,y4) (Polygon as bar)    
      //var dataDistance = function(data){
        var distance= [], steepness=[], heightvalue=[];
        var first;
        var featureLength = data.features.length;
        var polygonData=[];
        var adddist=[0];
        var list = [];

        for (var i=0; i<featureLength; i++){
          var coordLength = data.features[i].geometry.coordinates.length;
          for(var j=0; j<coordLength-1; j++){
            var g = new L.LatLng(data.features[i].geometry.coordinates[j][1], data.features[i].geometry.coordinates[j][0]);
            var h = new L.LatLng(data.features[i].geometry.coordinates[j+1][1], data.features[i].geometry.coordinates[j+1][0]);
            var calc = g.distanceTo(h);
            distance.push(calc);
            heightvalue.push(data.features[i].geometry.coordinates[j][2]);
            steepness.push(data.features[i].properties.steepness);
            if (j+1 == coordLength-1){
              heightvalue.push(data.features[i].geometry.coordinates[j+1][2]);
              steepness.push(data.features[i].properties.steepness);
            }
          }
          var last =new L.LatLng(data.features[i].geometry.coordinates[coordLength-1][1], data.features[i].geometry.coordinates[coordLength-1][0]);
          if (i>0){
            first = new L.LatLng(data.features[i].geometry.coordinates[0][1], data.features[i].geometry.coordinates[0][0]);
            calc= last.distanceTo(first);
            distance.push(calc);
          }
        }
        var totaldistance = distance.reduce(function(a, b) { return a + b; }, 0);

        //Data for svg-line-path
        var count= heightvalue.length;
        for (var i=0;i<count;i++){
          adddist[i+1]=adddist[i]+distance[i];
          polygonData.push({coords:[
            {x:adddist[i], y:heightvalue[i]},
            {x:adddist[(i+1==count)?i:i+1], y:heightvalue[(i+1==count)?i:i+1]},
            {x:adddist[(i+1==count)?i:i+1], y:d3.min(heightvalue)},
            {x:adddist[i], y:d3.min(heightvalue)}], 
            steepness:steepness[i]});
        }
      //   list.push({
      //       totaldistance: totaldistance,
      //       heightvalue:heightvalue,
      //       distance: distance,
      //       polygonData: polygonData
      //   });

      //   console.log(list);
      //   return list;
      // } 
      //   console.log(polygonData)
 


      //SVG area
      var margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

      //domain = data space
      //range = screen space
      var x = d3.scale.linear()
        .range([0, width])
        .domain([0, totaldistance]);

      var y = d3.scale.linear()
        .range([height, 0])
        .domain(d3.extent(heightvalue, function(d) { return d }));

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        //.ticks(1);

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      //tooltips with height
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return  ((d.coords[0].y+d.coords[1].y)/2 + " m") ;
        });

      var tipDist = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return  (d) ;
        });


      var svgSec = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

      svgSec.call(tip);

      var focus = svgSec.append("g")
        .attr("class", "focus")
        //.style("display", "none");

      focus.append("circle")
          .attr("r", 3);

      focus.append("text")
          .attr("x", 5)
          .attr("font-size", "8px")
          .attr("font-family", "calibri")
          .attr("dy", ".35em");

      svgSec.append('g')      
        .attr("transform", "translate(0," + height + ")")      // create a <g> element
        .attr('class', 'x axis') // specify classes
        .call(xAxis)
        .append("text")
            //.attr("transform", "rotate(-90)")
            .attr("x", width-40)
            .attr("dy", ".0em")
            .style("font-size", "8px")
            .attr("font-family", "calibri")
            .style("text-anchor", "initial")
            .text("Distance [m]");

      svgSec.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -35)
            .attr("y", 5)
            .attr("dy", ".71em")
            .style("font-size", "8px")
            .attr("font-family", "calibri")
            .style("text-anchor", "initial")
            .text("Height [m]");

      svgSec.selectAll('.axis line, .axis path')
       .style({'stroke': 'Black', 'fill': 'none', 'stroke-width': '1'});

      var legendData = [{steepness:'15%', color:'red'}, {steepness:'10%', color:'orange'}, {steepness:'5%', color:'yellow'},{steepness:'0%', color:'greenyellow'}];
      var legendRectSize = 7;
      var legendSpacing = 7;

      var legend = svgSec.selectAll('.legend')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          var height = legendRectSize + legendSpacing;
          var offset =  height * 2;
          var horz = -2 * legendRectSize;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('x', 30)
        .attr('y', 30)
        .style('fill', function(d){
             return ( d.color);});

      legend.append('text')
      .attr('x', 40)
      .attr('y', 36)
      .style('font-size', 10)
      .style('font-family', 'calibri')
      .text(function(d) { return d.steepness; });

      //bars as polygons (path)
      var polygon = d3.svg.line()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); });

      svgSec.selectAll('hpath')
       .data(polygonData)
       .enter()
       .append('path')
       //.attr('leafletId', id)
       .attr('d', function(d) {return polygon(d.coords);})
       //.attr("data-legend",function(d) { return d.steepness})
       .attr("fill-opacity", 0.6)
       .attr('fill', function(d){
         return ( d.steepness ==-2 ?
             "red" : d.steepness ==-1 ? 
             "orange": d.steepness == 0 ? 
             "yellow" : d.steepness == 1 ? 
             "greenyellow" : "greenyellow")
        })
        .on('mouseover', handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("mousemove", mousemove);

    // Create Event Handlers for mouse
      function handleMouseOver(d, i) {                
            // Use D3 to select element, change color and size
        tip.show(d);
          d3.select(this)
          .style({"fill": "black"
          })
          .attr("fill-opacity", 1);

        focus.style("display", null);               
      }

      function handleMouseOut(d, i) {
        // Use D3 to select element, change color back to normal
        tip.hide(d);
        d3.select(this)
        .style("fill", function(d) {
          var returncolor;
          if (d.steepness == -2){
            returncolor ="red";
          } else if (d.steepness == -1){
              returncolor ="orange";
          } else if (d.steepness == 0){
              returncolor ="yellow";
          } else if (d.steepness == 1){
              returncolor ="greenyellow";
          } else if (d.steepness == -1){
              returncolor ="green";
          }
          return returncolor;
          })
          .attr("fill-opacity", 0.6);

        focus.style("display", "none");
      }

      function mousemove(d) {
        var x0 = x.invert(d3.mouse(this)[0]); //distance in m   
        var d0 = d.coords[0].x, d1 = d.coords[1].x;  
        var d2 = d1 - x0 > x0 - d0 ? 0 : 1; // shortest distance between mouse and coords of polygon
        var y0=d.coords[d2].y;
        focus.attr("transform", "translate(" +  x(x0)+ "," + y(d3.min(heightvalue)) + ")");
        focus.select("text").text(Math.round((x0/1000)*100)/100 + ' km');//text in km
      }
    }
};