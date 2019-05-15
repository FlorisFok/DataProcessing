var teensInViolentArea = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB11/all?startTime=2010&endTime=2017"
var teenPregnancies = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB46/all?startTime=1960&endTime=2017"
var GDP = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EU28+EU15+OECDE+OECD+OTF+NMEC+ARG+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+ROU+RUS+SAU+ZAF+FRME+DEW.B1_GE.HCPC/all?startTime=2012&endTime=2018&dimensionAtObservation=allDimensions"
var requests = [d3.json(GDP), d3.json(teenPregnancies)]//, d3.json(teenPregnancies)];

Promise.all(requests).then(function(response) {
    var data_gdp = transformResponsegdp(response[0]);
    var data_teen = transformResponseteen(response[1]);
    console.log(data_gdp)
    console.log(data_teen)
    var countries = Object.keys(data_teen);
    var len = countries.length;
    console.log(len);

    var data_array = {2015:[], 2016:[], 2014:[]};

    var fails = 0;
    for (let i = 0; i < len; i++){
      country = countries[i];
      var count = 0;
      for (let j = 0; j < data_gdp[country].length; j++){
        let inner_data = data_gdp[country][j]
        if (inner_data['Year'] == 2015) {
          data_array[2015].push({'gdp': inner_data['Datapoint']})
          count++
        }
        else if (inner_data['Year'] == 2016) {
          data_array[2016].push({'gdp': inner_data['Datapoint']})
          count++
        }
        else if (inner_data['Year'] == 2014) {
          data_array[2014].push({'gdp': inner_data['Datapoint']})
          count++
        }
      }
      for (let j = 0; j < data_teen[country].length; j++){
        let inner_data = data_teen[country][j]
        if (inner_data['Time'] == 2015) {
          data_array[2015][i - fails]['teen'] = inner_data['Datapoint'];
          count++;
        }
        else if (inner_data['Time'] == 2016) {
          data_array[2016][i - fails]['teen'] = inner_data['Datapoint'];
          count++;
        }
        else if (inner_data['Time'] == 2014) {
          data_array[2014][i - fails]['teen'] = inner_data['Datapoint'];
          count++;
        }
      }
      if (!(count == 6)){
        data_array[2014].pop();
        data_array[2015].pop();
        data_array[2016].pop();
        fails++;
        console.log('pop', i);
      }
    }
    console.log('this')
    console.log(data_array)

}).catch(function(e){
    throw(e);
});

function transformResponseteen(data){

    // Save data
    let originalData = data;

    // access data property of the response
    let dataHere = data.dataSets[0].series;

    // access variables in the response and save length for later
    let series = data.structure.dimensions.series;
    let seriesLength = series.length;

    // set up array of variables and array of lengths
    let varArray = [];
    let lenArray = [];

    series.forEach(function(serie){
        varArray.push(serie);
        lenArray.push(serie.values.length);
    });

    // get the time periods in the dataset
    let observation = data.structure.dimensions.observation[0];

    // add time periods to the variables, but since it's not included in the
    // 0:0:0 format it's not included in the array of lengths
    varArray.push(observation);

    // create array with all possible combinations of the 0:0:0 format
    let strings = Object.keys(dataHere);

    // set up output object, an object with each country being a key and an array
    // as value
    let dataObject = {};

    // for each string that we created
    strings.forEach(function(string){
        // for each observation and its index
        observation.values.forEach(function(obs, index){
            let data = dataHere[string].observations[index];
            if (data != undefined){

                // set up temporary object
                let tempObj = {};

                let tempString = string.split(":").slice(0, -1);
                tempString.forEach(function(s, indexi){
                    tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;
                });

                // every datapoint has a time and ofcourse a datapoint
                tempObj["Time"] = obs.name;
                tempObj["Datapoint"] = data[0];
                tempObj["Indicator"] = originalData.structure.dimensions.series[1].values[0].name;

                // Add to total object
                if (dataObject[tempObj["Country"]] == undefined){
                  dataObject[tempObj["Country"]] = [tempObj];
                } else {
                  dataObject[tempObj["Country"]].push(tempObj);
                };
            }
        });
    });

    // return the finished product!
    return dataObject;
}

function transformResponsegdp(data){

    // Save data
    let originalData = data;

    // access data
    let dataHere = data.dataSets[0].observations;

    // access variables in the response and save length for later
    let series = data.structure.dimensions.observation;
    let seriesLength = series.length;

    // get the time periods in the dataset
    let observation = data.structure.dimensions.observation[0];

    // set up array of variables and array of lengths
    let varArray = [];
    let lenArray = [];

    series.forEach(function(serie){
        varArray.push(serie);
        lenArray.push(serie.values.length);
    });

    // add time periods to the variables, but since it's not included in the
    // 0:0:0 format it's not included in the array of lengths
    varArray.push(observation);

    // create array with all possible combinations of the 0:0:0 format
    let strings = Object.keys(dataHere);

    // set up output array, an array of objects, each containing a single datapoint
    // and the descriptors for that datapoint
    let dataObject = {};

    // for each string that we created
    strings.forEach(function(string){
        observation.values.forEach(function(obs, index){
            let data = dataHere[string];
            if (data != undefined){

                // set up temporary object
                let tempObj = {};

                // split string into array of elements seperated by ':'
                let tempString = string.split(":")
                tempString.forEach(function(s, index){
                    tempObj[varArray[index].name] = varArray[index].values[s].name;
                });

                tempObj["Datapoint"] = data[0];

                // Add to total object
                if (dataObject[tempObj["Country"]] == undefined){
                  dataObject[tempObj["Country"]] = [tempObj];
                } else if (dataObject[tempObj["Country"]][dataObject[tempObj["Country"]].length - 1]["Year"] != tempObj["Year"]) {
                    dataObject[tempObj["Country"]].push(tempObj);
                };

            }
        });
    });

    // return the finished product!
    return dataObject;
}

// Open file

var fileName = "data2.json";
var txtFile = new XMLHttpRequest();

// When file is ready, parse data
txtFile.onreadystatechange = function()
{
    if (txtFile.readyState === 4 && txtFile.status == 200)
    {
        const jdata = JSON.parse(txtFile.responseText);
        // console.log(jdata)

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
