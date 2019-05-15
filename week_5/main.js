var teensInViolentArea = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB11/all?startTime=2010&endTime=2017"
var teenPregnancies = "https://stats.oecd.org/SDMX-JSON/data/CWB/AUS+AUT+BEL+BEL-VLG+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+OAVG+NMEC+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+PER+ROU+RUS+ZAF.CWB46/all?startTime=1960&endTime=2017"
var GDP = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EU28+EU15+OECDE+OECD+OTF+NMEC+ARG+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+ROU+RUS+SAU+ZAF+FRME+DEW.B1_GE.HCPC/all?startTime=2012&endTime=2018&dimensionAtObservation=allDimensions"
var requests = [d3.json(GDP), d3.json(teenPregnancies), d3.json(teensInViolentArea)]//, d3.json(teenPregnancies)];


document.addEventListener('DOMContentLoaded', (event) => {
  Promise.all(requests).then(function(response) {

      var data_gdp = transformResponsegdp(response[0]);
      var data_teen = transformResponseteen(response[1]);
      var data_area = transformResponseteen(response[2])

      var c_list = Object.keys(data_teen).concat(
                   Object.keys(data_area)).concat(
                   Object.keys(data_gdp));

      const variables = 3;
      const YEARS = [2012, 2013, 2014, 2015, 2016];
      var AUTO = 2012;

      var countries = return_common(c_list, variables);
      var len = countries.length;

      make_options(YEARS)

      var data_array = {}
      for (let i =0; i < YEARS.length; i++){
        data_array[YEARS[i]] = []
      }

      var countries_used = []

      var fails = 0;
      for (let i = 0; i < len; i++){
        var country = countries[i];
        var count = 0;
        for (let j = 0; j < data_gdp[country].length; j++){
          let inner_data = data_gdp[country][j]
          if (YEARS.includes( parseInt(inner_data['Year']))) {
            data_array[parseInt(inner_data['Year'])].push({'gdp': inner_data['Datapoint']});
            count++;
          }
        }
        for (let j = 0; j < data_teen[country].length; j++){
          let inner_data = data_teen[country][j]
          if (YEARS.includes( parseInt(inner_data['Time']))) {
            data_array[parseInt(inner_data['Time'])][i - fails]['teen'] = inner_data['Datapoint'];
            count++;
          }
        }
        for (let j = 0; j < data_area[country].length; j++){
          let inner_data = data_area[country][j]
          if (YEARS.includes( parseInt(inner_data['Time']))) {
            data_array[parseInt(inner_data['Time'])][i - fails]['area'] = inner_data['Datapoint'];
            count++;
          }
        }

        if (!(count == (YEARS.length* variables ))){
          var keys = Object.keys(data_array);
          for (let i = 0; i < keys.length; i++){
            data_array[keys[i]].pop();
          }
          fails++;
        }
        else{
          var keys = Object.keys(data_array);
          for (let j = 0; j < keys.length; j++){
            data_array[parseInt(keys[j])][i - fails]['country'] = country;
          }
          countries_used.push(country);
        }
      }

  console.log(data_array)
  make_plot(data_array, countries_used, AUTO);

  }).catch(function(e){
      throw(e);
  });

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

          var mx = d3.scaleLinear().domain([0, width]).range([0, max_gdp]);
          var my = d3.scaleLinear().domain([height, 0]).range([0, max_teen]);
          // When the mouse moves on the SVG, track it
          svg.on('mousemove', function() {
            const coords = d3.mouse(this);
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

          // floating numbers
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
                      .on('mouseover', function(d){
                        document.querySelector(`text.${d.country.replace(/ /g,"_")}`)
                        .style = 'font-size:20; fill:red';
                        document.querySelector(`text.${d.country.replace(/ /g,"_")}2`)
                        .style = 'font-size:10;';
                      })
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
            svg.selectAll("circle")
                  .data(jdata[option]) // Update with new data
                  .transition()
                  .duration(1000)
                  .attr("cx", function(d) { return x(d.gdp); })
                  .attr("cy", function(d) { return y(d.teen); })
                  .attr("r", function(d) { return r(d.area); })
                  .attr('fill', function(d) { return (c_code(d.country)); })
            svg.selectAll("text#change")
                  .data(jdata[option])
                  .attr("x", function(d) { return x(d.gdp) + r(d.area); })
                  .attr("y", function(d) { return y(d.teen) - r(d.area); })
            	    .text( function(d) { return (d.area); })
                  .attr('style', 'font-size:0;')
                  .attr('class', function(d) {
                    return (d.country.replace(/ /g,"_"))+'2';
                  });
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
});
