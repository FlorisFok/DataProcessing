
d3.csv("states_data.csv", function(err, data) {

  // Config csv names to vars
  var config = {
                "stateDataColumn":"states",
                "valueDataColumn":"value",
                "fed_rev":"fed_r",
                "loc_rev":"local_r",
                "state_rev":"sta_r",
                "instruction_expenditure":"ins_ex",
                "support_services_expenditure":"sup_ex",
                "other_expenditure":"oth_ex",
                "capital_outlay_expenditure":"cap_ex",
              }

  // random vars
  var WIDTH = 600, HEIGHT = 400;
  var COLOR_COUNTS = 9;
  var SCALE = 0.7;
  var COLOR_FIRST = "#d3e5ff", COLOR_LAST = "#08306B";
  var rgb = hexToRgb(COLOR_FIRST);
  var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
  rgb = hexToRgb(COLOR_LAST);
  var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

  var MAP_STATE = config.stateDataColumn;
  var MAP_VALUE = config.valueDataColumn;
  var MAP_STAR = config.state_rev;
  var MAP_LOCR = config.loc_rev;
  var MAP_FEDR = config.fed_rev;
  var MAP_INST = config.instruction_expenditure;
  var MAP_SERV = config.support_services_expenditure;
  var MAP_EXPE = config.other_expenditure;
  var MAP_CAPI = config.capital_outlay_expenditure;

  var width = WIDTH,
      height = HEIGHT;

  // Mapping for the countrie names
  var valueById = d3.map();

  // Color assignment
  var startColors = COLOR_START.getColors(),
      endColors = COLOR_END.getColors();
  var colors = [];

  // Color range for the states
  for (var i = 0; i < COLOR_COUNTS; i++) {
    var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
    var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
    var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
    colors.push(new Color(r, g, b));
  }

  // Color scale
  var quantize = d3.scale.quantize()
      .domain([0, 1.0])
      .range(d3.range(COLOR_COUNTS).map(function(i) { return i }));


  var path = d3.geo.path();

  // Make first svg
  var svg = d3.select("#canvas-svg").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Load data
  d3.tsv("https://s3-us-west-2.amazonaws.com/vida-public/geo/us-state-names.tsv", function(error, names) {

  name_id_map = {};
  id_name_map = {};
  id_pie_data = {};
  id_pie_data2 = {};
  all_eths = {};
  scores = {}

  // Parse data to mapping
  for (var i = 0; i < names.length; i++) {
    name_id_map[names[i].name] = names[i].id;
    id_name_map[names[i].id] = names[i].name;
  }

  // Data parse to dict corresponding to the ids
  for (let i = 0; i < data.length; i++){
    var id = name_id_map[data[i][MAP_STATE]];

    // Pie 1 data
    id_pie_data[id] = [data[i][MAP_LOCR],
                       data[i][MAP_STAR],
                       data[i][MAP_FEDR]];

    // Pie 2 data
    id_pie_data2[id] = [data[i][MAP_INST],
                        data[i][MAP_SERV],
                        data[i][MAP_CAPI]];

    // Histogram data
    all_eths[id] = [{year:'AM', male:data[i]['maleAM'], female:data[i]['femaleAM']},
                    {year:'AS', male:data[i]['maleAS'], female:data[i]['femaleAS']},
                    {year:'HI', male:data[i]['maleHI'], female:data[i]['femaleHI']},
                    {year:'BL', male:data[i]['maleBL'], female:data[i]['femaleBL']},
                    {year:'WH', male:data[i]['maleWH'], female:data[i]['femaleWH']},
                    {year:'HP', male:data[i]['maleHP'], female:data[i]['femaleHP']},
                    {year:'TR', male:data[i]['maleTR'], female:data[i]['femaleTR']}];

    // Extra map data
    scores[id] = [data[i]['read'],data[i]['math']];
  }

  // Link map to data
  data.forEach(function(d) {
    var id = name_id_map[d[MAP_STATE]];
    valueById.set(id, +d[MAP_VALUE]);
  });

  quantize.domain([d3.min(data, function(d){ return +d[MAP_VALUE] }),
    d3.max(data, function(d){ return +d[MAP_VALUE] })]);

  // Geo Json loading
  d3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/us.json", function(error, us) {
    svg.append("g")
        .attr("class", "states-choropleth")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
        .attr("transform", "scale(" + SCALE + ")")
        .style("fill", function(d) {
          if (valueById.get(d.id)) {
            var i = quantize(valueById.get(d.id));
            var color = colors[i].getColors();
            return "rgb(" + color.r + "," + color.g +
                "," + color.b + ")";
          } else {
            return "";
          }
        })
        .attr("d", path)
        .on("click", function(d) {
            var html = "";

            html += "<div class=\"tooltip_kv\">";
            html += "<span class=\"tooltip_key\">";
            html += id_name_map[d.id];
            html += "</span>";
            html += "<span class=\"tooltip_value\">";
            html += `<p>Students: ${valueFormat(valueById.get(d.id))}</p>`;
            html += `<p>Math Score: ${Math.round((scores[d.id][1]/500)*100)}%</p>`;
            html += `<p>Read Score: ${Math.round((scores[d.id][0]/500)*100)}%</p>`;
            html += "</span>";
            html += "</div>";

            update_circle1(id_pie_data[(d.id)])
            update_circle2(id_pie_data2[(d.id)])
            update_hist(all_eths[d.id])

            if (!($("#tooltip-container").text().substr(0,4) ==
                    id_name_map[d.id].substr(0,4))){
                $("#tooltip-container").html(html);
                $(this).attr("fill-opacity", "0.8");
                $("#tooltip-container").show();
            }
            else{
              $(this).attr("fill-opacity", "1.0");
              $("#tooltip-container").hide();
            }

            var coordinates = d3.mouse(this);

            var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;

            if (d3.event.layerX < map_width / 2) {
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX + 15) + "px");
            } else {
              var tooltip_width = $("#tooltip-container").width();
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
        });

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("transform", "scale(" + SCALE + ")")
        .attr("d", path);

    svg.append("text")
        .attr("y", 0 )
        .attr("x", width / 2)
        .style("text-anchor", "middle")
        .text("Student info per state (CLICK ME)")
        .attr("class", "title")
        .attr("dy", "1em");
  });

  });

});

var width = 600,
		height = 300,
		radius = Math.min(width/2, height) / 2,
    padding = 50;

height += padding*2

var svg = d3.select("#my_dataviz").append("svg")
		.attr("width", width)
		.attr("height", height+padding)
		.attr('id','circle1')

svg.append("text")
    .attr("transform", "translate("+width/4+", 30 )")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "20px" )
    .attr('id', 'upd_rev')
    .text('Revenue: 0');

svg.append("text")
    .attr("transform", "translate("+(width/4)*3+", 30 )")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("font-size", "20px" )
    .attr('id', 'upd_exp')
    .text('Expenses: 0');




var data = [1, 1, 1];
var title = 'No data';
update_circle1(data);
update_circle2(data);

var margin = {top: 20, right: 160, bottom: 35, left: 30};

var width = 600 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var svg = d3.select("#bargraph")
  .append("svg")
  .attr('id', 'hist1')
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set x, y and colors
var x = d3.scale.ordinal()
  .domain(['AM','AS','HI','BL','WH','HP', 'TR'])
  .rangeRoundBands([10, width-10], 0.02);

var y = d3.scale.linear()
  .domain([0, 25])
  .range([height, 0]);

var colors = ["blue", "pink"];


// Define and draw axes
var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);

svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate("+ margin.left/2 +",0)")
  .call(yAxis);

svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate("+margin.left+"," + height + ")")
  .call(xAxis)


svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left/2)
    .attr("x",0 - (height / 2))
    .style("text-anchor", "middle")
    .attr("class", "changey")
    .text("Number of student X 100.000");

svg.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," +
                         (height + margin.top + margin.bottom) + ")")
    .style("text-anchor", "middle")
    .attr("class", "changex")
    .text("Ethnicity")
    .attr('dy', '-1.5em');

svg.append("text")
    .attr("y", 0 )
    .attr("x", width / 2)
    .style("text-anchor", "middle")
    .text("Race and gender distribution")
    .attr("class", "title");


// Draw legend
var legend = svg.selectAll(".legend")
  .data(colors)
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

legend.append("rect")
  .attr("x", width - 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", function(d, i) {return colors.slice().reverse()[i];});

legend.append("text")
  .attr("x", width + 5)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(function(d, i) {
    switch (i) {
      case 0: return "Male";
      case 1: return "Female";
    }
  });


// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");

tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");
