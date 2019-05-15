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

function max_of(data_array, key){
  // Get the absolute max of the dataset, fixed axises for more clairity
  var keyss = Object.keys(data_array);
  var array = []
  for (let i = 0; i < keyss.length; i++){
    array.push(d3.max(data_array[keyss[i]], function(d) { return +d[key];} ))
  }
  var max = Math.max.apply(null, array);
  return max;
}

function make_options(years){
  // Make the select buttons, this makes it easy to remove and add years
    for (let i = 0; i < years.length; i++){
      var option = document.createElement("option");
      option.text = years[i];
      option.value = years[i];
      var select = document.getElementById("options");
      select.appendChild(option);
    }
};

function return_common(list_of, count) {
  // Retrive the countries which occur "count" amount of times
    var d = {}
    var common_list = []
    for (let i = 0; i < list_of.length; i++){
      if (list_of[i] in d){
        d[list_of[i]] +=1
        if (d[list_of[i]] == count){
          common_list.push(list_of[i])
        }
      }
      else {
        d[list_of[i]] = 1
      }
    }
    return common_list
}

function make_plot(jdata, countries_used, AUTO){

        // Get meta_data from json
        const max_gdp = max_of(jdata, 'gdp');
        const max_teen = max_of(jdata, 'teen');
        const max_area = max_of(jdata, 'area');

        const cir_size = [3, 10];

        // Get lenght of y-axis
        const data_len = jdata.length;

        // Determine margins
        var margin = {top: 80, right: 80, bottom: 80, left: 80},
            width = 900 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        // New plot, new Scales.
        // Log is used for the large data set
        var x = d3.scaleLinear().domain([0, max_gdp]).range([0, width]);
        var y = d3.scaleLinear().domain([0, max_teen]).range([height, 0]);
        var r = d3.scaleLinear().domain([0, max_area]).range(cir_size);

        // Add colors to the different points
        var c_code = d3.scaleOrdinal()
                        .domain(countries_used)
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
            .text("GDP [total, US dollars/capita]");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left/2)
            .attr("x",0 - (height / 2))
            .style("text-anchor", "middle")
            .attr("class", "changey")
            .text("Teen Pregnancies [per 1000]");

        // Add Title
        svg.append("text")
            .attr("y", 0 )
            .attr("x", width / 2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Scatter plot by Floris Fok (12503668)")
            .attr("class", "title");

        svg.append("line")
            .append("line")


        // Scales for the mouse coordianates
        var mx = d3.scaleLinear().domain([0, width]).range([0, max_gdp]);
        var my = d3.scaleLinear().domain([height, 0]).range([0, max_teen]);
        // When the mouse moves on the SVG, track it
        svg.on('mousemove', function() {
          const coords = d3.mouse(this);
          if (coords[0] > width || coords[1] > height){
            return;
          }
          // Mouse tracer, but for some reason its 70 off? can you tell me why...
          // It rewrites the line every time it moves!
          let spooky_offset = 70
          svg.selectAll("line")
              .data([{'x':coords[0],
                      'y':coords[1] - height,
                      'y2':coords[1] - height,
                      'x2':0},
                     {'x':coords[0] - spooky_offset,
                      'y':coords[1] - height,
                      'y2':0,
                      'x2':coords[0] - spooky_offset}
                    ])
              .attr("x1", function(d) { return d.x;})
              .attr("y1", function(d) { return d.y;})
              .attr("x2", function(d) { return d.x2;})
              .attr("y2", function(d) { return d.y2;});

          // Round the coords to multiple of 5 and place the Coords in the label
          var y1 = Math.round(my(coords[1]));
          document.querySelector('text.changey').innerHTML = `Teen Pregnancies [per 1000] = ${y1}`;
          // Same for X
          var x1 = Math.round(mx(coords[0])/1000) * 1000;
          document.querySelector('text.changex').innerHTML = `GDP [total, US dollars/capita] = ${x1}`;
          return;
        });

        // Add the data to the circles to come
        var circ = svg.selectAll("circle")
                    .data(jdata[AUTO])
                    .enter()
                    .append("circle")

        // Need some sort of spacer
        let stroke_width = margin.top/4;

        // Create a scale for the legend text positions (y direction)
        var pos = d3.scaleBand().domain(countries_used).range([stroke_width, height]);

        // Create legend element
        var legend = svg.selectAll("legend")
                    .data(countries_used)
                    .enter()

        // Add the names of the categories to the legend to the right positions
        legend.append("text").attr("x", width + stroke_width*2)
                  .attr("y", function(d) { return pos(d);})
                  .text(function(d) { return (d);})
                  .attr('class', function(d) { return (d.replace(/ /g,"_"));})

        // Add some circles to the legend
        const legCirRad = 5
        legend.append("circle").attr("cx", width + stroke_width)
                    .attr("cy", function(d) { return pos(d) - legCirRad; })
                    .attr("r", legCirRad)
                    .attr('fill', function(d) { return (c_code(d)); });

        // floating numbers of the area
        svg.selectAll("text2")
                    .data(jdata[AUTO])
                    .enter()
                    .append("text")
                    .attr("x", function(d) { return x(d.gdp) + r(d.area); })
                    .attr("y", function(d) { return y(d.teen) - r(d.area); })
                    .text( function(d) { return (d.area); })
                    .attr('style', 'font-size:0;')
                    .attr('id', 'change')
                    .attr('class', function(d) {
                      return (d.country.replace(/ /g,"_"))+'2';
                    });


        // Scatter the circles, give right coords and color and size
        circ.attr("x", function(d) { return x(d.gdp); })
                    .attr("cx", function(d) { return x(d.gdp); })
                    .attr("cy", function(d) { return y(d.teen); })
                    .attr("r", function(d) { return r(d.area); })
                    .attr('fill', function(d) { return (c_code(d.country)); })
                    // Addd the hover fucntion, by changing style properties
                    .on('mouseover', function(d){
                      document.querySelector(`text.${d.country.replace(/ /g,"_")}`)
                      .style = 'font-size:20; fill:red';
                      document.querySelector(`text.${d.country.replace(/ /g,"_")}2`)
                      .style = 'font-size:10;';
                    })
                    // revert everything, by changing style properties
                    .on('mouseout', function(d){
                      document.querySelector(`text.${d.country.replace(/ /g,"_")}`)
                      .style = 'font-size:12; fill:black';
                      document.querySelector(`text.${d.country.replace(/ /g,"_")}2`)
                      .style = 'font-size:0;';
                    })

        // Add last Label of review
        // Create a scale for the legend text positions (y direction)
        let array = [0,1,2,3,4,5,6,7,8,9]
        var pos = d3.scaleBand().domain(array).range([stroke_width, height/2]);
        var r2 = d3.scaleLinear().domain([stroke_width, height/2]).range(cir_size);
        var text = d3.scaleLinear().domain(array).range([0,max_area]);

        // Create legend element
        var legend = svg.selectAll("legend")
                    .data(array)
                    .enter()

        // Add the names of the categories to the legend to the right positions
        legend.append("text").attr("x", width + stroke_width*2 + width/4)
                  .attr("y", function(d) { return pos(d)+ stroke_width})
                  .text( function(d) {return Math.round(text(d)/10)})

        // Add some circles to the legend
        legend.append("circle").attr("cx", width + stroke_width + width/4)
                    .attr("cy", function(d) { return pos(d) + stroke_width - legCirRad; })
                    .attr("r", function(d) { return r2(pos(d))})
                    .attr('fill', 'black');

        // Add the name of the variable
        svg.append("text")
            .attr("y", 0 )
            .attr("x", width + width/3)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Childeren in Violent Area [%]")
            .attr("class", "right_text");

        // Listen to chnages, and select the right option for change
        document.querySelector('#options').onchange = function(){
          const option = document.querySelector('#options').value;
          // Chnage the locations of the circles
          svg.selectAll("circle")
                .data(jdata[option])
                .transition()
                .duration(1000)
                .attr("cx", function(d) { return x(d.gdp); })
                .attr("cy", function(d) { return y(d.teen); })
                .attr("r", function(d) { return r(d.area); })
                .attr('fill', function(d) { return (c_code(d.country)); })
          // Change all the text of the floating labels
          svg.selectAll("text#change")
                .data(jdata[option])
                .attr("x", function(d) { return x(d.gdp) + r(d.area); })
                .attr("y", function(d) { return y(d.teen) - r(d.area); })
                .text( function(d) { return (d.area); })
                .attr('style', 'font-size:0;')
                .attr('class', function(d) {
                  return (d.country.replace(/ /g,"_"))+'2';
                });
       };
};
