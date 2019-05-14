// Open file
var fileName = "data2.json";
var txtFile = new XMLHttpRequest();

// When file is ready, parse data
txtFile.onreadystatechange = function()
{
    if (txtFile.readyState === 4 && txtFile.status == 200)
    {
        const jdata = JSON.parse(txtFile.responseText);
        console.log(jdata)

        // Get meta_data from json
        const MAX =  jdata.meta_data.max;
        const MAX_i = jdata.meta_data.max_i;
        const MAX_r = jdata.meta_data.max_r;

        // Get lenght of y-axis
        const data_len = jdata.data.length;

        // Determine margins
        var margin = {top: 80, right: 80, bottom: 80, left: 80},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Determine X scale
        var xt = d3.scaleBand()
            	         .domain(jdata.meta_data.names)
                       .range([0, width]);

        // Estimate the BAR_WIDTH
        var BAR_WIDTH = xt.bandwidth()/2 * 0.90;
        const log_start = 100000;

        // Determine the Y scales
        var y = d3.scaleLinear().domain([0, MAX]).range([height, 0]);
        var y2 = d3.scaleLinear().domain([0, MAX_i]).range([height, 0]);

        // Make the axises
        var x_axis = d3.axisBottom().scale(xt);
        var y_axis = d3.axisLeft().scale(y);
        var y_axis_l = d3.axisRight().scale(y2);

        // Create a new SVG in the body, move the entige SVG out of the margins
        var svg = d3.select(".two").append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                      .attr("class", "graph")
                      .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");

        // Make the axis as g element and Call, Three times
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis);

        svg.append("g")
            .attr("class", "y axis axisLeft")
            .attr("transform", "translate(0,0)")
            .call(y_axis)

        svg.append("g")
          .attr("class", "y axis axisRight")
          .attr("transform", "translate( "+ width + ",0)")
          .call(y_axis_l)

        // Add label X, transforms it to the middle of the bottom
        svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                                 (height + margin.top/2) + ")")
            .style("text-anchor", "middle")
            .text("Categories")
            .attr("class", "bottom_text");

        // Add Label Y, transforms it to the the right side and turns it 90*
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left/2)
            .attr("x",0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Rating")
            .attr("class", "left_text");

        // Add Label Y, transforms it to the the left side and turns it 90*
        svg.append("text")
            .attr("transform", "translate( "+ (width+margin.left+margin.right) + ",0)")
            .attr("y", -margin.left/2)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("#installs")
            .attr("class", "right_text");

        // Add Title
        svg.append("text")
            .attr("y", 0 )
            .attr("x", width / 2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Top 10 categories of Play store ")
            .attr("class", "title");

        // Add data to the upcomming bars
        var bars = svg.selectAll("rect")
                  .data(jdata.data)
                  .enter()

        // Create the first bars of the rating
        bars.append("rect").attr("x", function(d) {
                      return xt(d.name) + xt.bandwidth()/2 - BAR_WIDTH;
                    })
                  .attr("width", BAR_WIDTH)
                  .attr("y", function(d) { return y(d.mean); })
            	    .attr("height", function(d) { return height - y(d.mean); })
                  .attr("class", "bar");

        // Place the text in the bar, so it hides there, also round the numbers
        bars.append("text")
                  .attr("y", function(d) { return y(d.mean); })
                  .attr("x", function(d) {
                      return xt(d.name) + xt.bandwidth()/2 - BAR_WIDTH/2;
                    })
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(function(d) {return Math.round((d.mean)*10)/10});

        // Make the installs bars
        bars.append("rect").attr("x", function(d) {
                      return xt(d.name) + xt.bandwidth()/2;
                    })
                  .attr("width", BAR_WIDTH)
                  .attr("y", function(d) { return y2(d.mean_i); })
            	    .attr("height", function(d) { return height - y2(d.mean_i); })
                  .attr("class", "bar2")

        // Make the text labels on top of the bars
        bars.append("text")
                  .attr("y", function(d) { return y2(d.mean_i); })
                  .attr("x", function(d) {
                      return xt(d.name) + xt.bandwidth()/2 + BAR_WIDTH/2;
                    })
                  .attr("dy", "-1em")
                  .style("text-anchor", "middle")
                  .text(function(d) {return `${Math.round((d.mean_i)/10000)/100}M`});

        // part two ////////////////////////////////////////////////////////
        // Make the plot smaller
        width = width/2;
        // const rating_start = MAX/2;

        // New plot, new Scales.
        // Log is used for the large data set
        var x = d3.scaleLinear().domain([0, MAX]).range([0, width]);
        var y = d3.scaleLog().domain([log_start, MAX_i]).range([height, 0]);
        var r = d3.scaleLinear().domain([0, MAX_r]).range([3, 10]);

        // Add colors to the different points
        var c_code = d3.scaleOrdinal()
                        .domain(jdata.meta_data.names)
                        .range(d3.schemePaired);

        // Make axises from the scales
        var xAxis = d3.axisBottom().scale(x);
        var yAxis = d3.axisLeft().scale(y);

        // Select the body to create a new svg element
        var svg = d3.select(".one").append("svg")
                    .attr("width", width*2 + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("class", "graph2")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add white background for better mouse tracking
        svg.append('rect')
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", 'white');

        // Append axises to the svg
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
        	  .attr("class", "y axis axisLeft")
        	  .attr("transform", "translate(0,0)")
        	  .call(yAxis)

        // Place the Labels on the right place
        svg.append("text")
            .attr("transform",
                  "translate(" + (width/2) + " ," +
                                 (height + margin.top/2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "changex")
            .text("Rating");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left/2)
            .attr("x",0 - (height / 2))
            .style("text-anchor", "middle")
            .attr("class", "changey")
            .text("Installs");

        // Add Title
        svg.append("text")
            .attr("y", 0 )
            .attr("x", width / 2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Top 10 categories of Play store")
            .attr("class", "title");

        // When the mouse moves on the SVG, track it
        svg.on('mousemove', function() {
          const coords = d3.mouse(this);
          // Round the coords to multiple of 5 and place the Coords in the label
          var y = Math.round(coords[1]/5) * 5;
          document.querySelector('text.changey').innerHTML = `Installs Y=${y}`;
          // Same for X
          var x = Math.round(coords[0]/5) * 5;
          document.querySelector('text.changex').innerHTML = `Rating X=${x}`;
          return;
        });

        // Add the data to the circles to come
        var circ = svg.selectAll("circle")
                    .data(jdata.data) ////////////////////////////////////////
                    .enter()
                    .append("circle")

        // Scatter the circles, give right coords and color and size
        circ.attr("x", function(d) { return x(d.mean); })
                    .attr("cx", function(d) { return x(d.mean); })
                    .attr("cy", function(d) { return y(d.mean_i); })
              	    .attr("r", function(d) { return r(d.mean_r); })
                    .attr('fill', function(d) { return (c_code(d.name)); });

        // Need some sort of spacer
        let stroke_width = margin.top/4;

        // Create a scale for the legend text positions (y direction)
        var pos = d3.scaleBand().domain(jdata.meta_data.names).range([stroke_width, height/2]);

        // Create legend element
        var legend = svg.selectAll("legend")
                    .data(jdata.data) /////////////////////////////////////////
                    .enter()

        // Add the names of the categories to the legend to the right positions
        legend.append("text").attr("x", width + stroke_width*2)
                  .attr("y", function(d) { return pos(d.name);})
                  .text(function(d) { return (d.name);})

        // Make a ugly box
        legend.append("rect").attr("x", width)
                  .attr("width", width/3)
                  .attr("y", 0)
            	    .attr("height", height/2)
                  .attr('fill-opacity', 0.0)
                  .attr('stroke', 'black');

        // Add some circles to the legend
        const legCirRad = 5
        legend.append("circle").attr("cx", width + stroke_width)
                    .attr("cy", function(d) { return pos(d.name) - legCirRad; })
              	    .attr("r", legCirRad)
                    .attr('fill', function(d) { return (c_code(d.name)); });

        // Add last Label of review
        // Create a scale for the legend text positions (y direction)
        var pos = d3.scaleBand().domain(jdata.meta_data.names).range([stroke_width, height-stroke_width]);
        var r2 = d3.scaleLinear().domain([0, height-stroke_width]).range([3, 10]);

        // Create legend element
        var legend = svg.selectAll("legend")
                    .data(jdata.data)
                    .enter()

        // Makes it possible to remap the values of the radius to the
        function remap(radius){
           return Math.round((radius-3)*MAX_r/7*0.00001)*100000;
        }

        // Add the names of the categories to the legend to the right positions
        legend.append("text").attr("x", width + stroke_width*2 + width/3)
                  .attr("y", function(d) { return pos(d.name)+ stroke_width})
                  .text( function(d) { return insertpoints(remap(r2(pos(d.name))))})

        // Make a ugly box number 2
        legend.append("rect").attr("x", width + width/3)
                  .attr("width", width/3)
                  .attr("y", 0)
            	    .attr("height", height)
                  .attr('fill-opacity', 0.0)
                  .attr('stroke', 'black');

        // Add some circles to the legend
        legend.append("circle").attr("cx", width + stroke_width + width/3)
                    .attr("cy", function(d) { return pos(d.name) + stroke_width - legCirRad; })
              	    .attr("r", function(d) { return r2(pos(d.name))})
                    .attr('fill', 'black');

        svg.append("text")
            .attr("y", 0 )
            .attr("x", width + width/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Reviews")
            .attr("class", "right_text");

        // Listen to chnages, and select the right option for change
        document.querySelector('#button').onchange = function(){
          const option = document.querySelector('#button').value;
          console.log(option)
          if (option == 2){
            svg.selectAll("circle")
                .data(jdata.data2) // Update with new data
                .transition()
                .duration(1000)
                .attr("x", function(d) { return x(d.mean); })
                .attr("cx", function(d) { return x(d.mean); })
                .attr("cy", function(d) { return y(d.mean_i); })
          	    .attr("r", function(d) { return r(d.mean_r); })
                .attr('fill', function(d) { return (c_code(d.name)); });
          }
          if (option == 1){
            svg.selectAll("circle")
                .data(jdata.data) // Update with new data
                .transition()
                .duration(1000)
                .attr("x", function(d) { return x(d.mean); })
                .attr("cx", function(d) { return x(d.mean); })
                .attr("cy", function(d) { return y(d.mean_i); })
          	    .attr("r", function(d) { return r(d.mean_r); })
                .attr('fill', function(d) { return (c_code(d.name)); });
          }
          if (option == 3){
            svg.selectAll("circle")
                .data(jdata.data3) // Update with new data
                .transition()
                .duration(1000)
                .attr("x", function(d) { return x(d.mean); })
                .attr("cx", function(d) { return x(d.mean); })
                .attr("cy", function(d) { return y(d.mean_i); })
          	    .attr("r", function(d) { return r(d.mean_r); })
                .attr('fill', function(d) { return (c_code(d.name)); });
          }
       }
    }
}

function insertpoints(num) {
  // Add points to the numbers
  if (num >= 1000 && num < 1000000){
    var str = `${Math.floor(num/1000)}.000`;
  }
  else if (num >= 1000000) {
    var str = `${Math.floor(num/1000000)}.
               ${Math.round((num%1000000)/100000)}00.000`;
  }
  else {
    return num
  }
   return str
}

// Send the GET request
txtFile.open("GET", fileName);
txtFile.send();
