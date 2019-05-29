
function valueFormat(d) {
  if (d > 1000000000) {
    return Math.round(d / 1000000000 * 10) / 10 + "B";
  } else if (d > 1000000) {
    return Math.round(d / 1000000 * 10) / 10 + "M";
  } else if (d > 1000) {
    return Math.round(d / 1000 * 10) / 10 + "K";
  } else {
    return d;
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function(_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function() {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function update_circle1(data){
      var width = 600,
      		height = 300,
      		radius = Math.min(width/2, height) / 2,
          padding = 50;

      height += padding*2;

      var sum_of_array = parseInt(data[0])+parseInt(data[1])+parseInt(data[2])
      document.querySelector('#upd_rev')
                .innerHTML = `Revenue: $${valueFormat(sum_of_array-3)}`

    	var color = d3.scaleOrdinal()
    			.range(["#003f5c", "#bc5090", "#ffa600"]);

    	var arc = d3.arc()
    			.outerRadius(radius - 10)
    			.innerRadius(0);

    	var labelArc = d3.arc()
    			.outerRadius(radius - 40)
    			.innerRadius(radius - 40);

    	var pie = d3.pie()
    			.sort(null)
    			.value(function(d) { return d; });

    	var svg = d3.select('#circle1')
    			.append("g")
    			.attr("transform", "translate(" + width / 4 + "," + (height / 2) + ")");

    		var g = svg.selectAll(".arc")
    				.data(pie(data))
    			.enter().append("g")
    				.attr("class", "arc");

    		g.append("path")
    				.attr("d", arc)
    				.style("fill", function(d) { return color(d.data); });
        if (data[0]  == 1){
          var name = d3.scaleOrdinal()
        		  .range(['No data','No data','No data']);
        }
        else{
          var name = d3.scaleOrdinal()
        		  .range(['Local','State','Federal']);
        }
    		g.append("text")
    				.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
    				.attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px" )
    				.text(function(d) { return name(d.data); });
};

function update_circle2(data){
  var width = 600,
  		height = 300,
  		radius = Math.min(width/2, height) / 2,
      padding = 50;

  height += padding*2

  var sum_of_array = parseInt(data[0])+parseInt(data[1])+parseInt(data[2])
  document.querySelector('#upd_exp')
            .innerHTML = `Expenses: $${valueFormat(sum_of_array-3)}`

	var color = d3.scaleOrdinal()
			.range(["#003f5c", "#bc5090", "#ffa600"]);

	var arc = d3.arc()
			.outerRadius(radius - 10)
			.innerRadius(0);

	var labelArc = d3.arc()
			.outerRadius(radius - 40)
			.innerRadius(radius - 40);

	var pie = d3.pie()
			.sort(null)
			.value(function(d) { return d; });

	var svg = d3.select('#circle1')
			.append("g")
			.attr("transform", "translate(" + (width / 4)*3 + "," + (height / 2) + ")");

		var g = svg.selectAll(".arc")
				.data(pie(data))
			.enter().append("g")
				.attr("class", "arc");

		g.append("path")
				.attr("d", arc)
				.style("fill", function(d) { return color(d.data); });
    if (data[0]  == 1){
      var name = d3.scaleOrdinal()
    		  .range(['No data','No data','No data']);
    }
    else {
      var name = d3.scaleOrdinal()
    		  .range(['Instruction','Support','Capital','Other']);
    }

		g.append("text")
				.attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
				// .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px" )
				.text(function(d) { return name(d.data); });
};

function update_hist(data){
  SCALE = 100000;

  d3.selectAll("#remove_me").remove()

  var margin = {top: 20, right: 160, bottom: 35, left: 30};

  var width = 600 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  var svg = d3.select("#hist1")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

  var x = d3.scale.ordinal()
    .domain(['AM','AS','HI','BL','WH','HP', 'TR'])
    .rangeRoundBands([10, width-10], 0.02);

  var y = d3.scale.linear()
    .domain([0, 25])
    .range([height, 0]);

  // Transpose the data into layers
  var dataset = d3.layout.stack()(["male", "female","white_space"].map(function(gender) {
    return data.map(function(d) {
      return {x: d.year, y: +d[gender]/SCALE};
    });
  }));



  // Create groups for each series, rects for each segment
  var groups = svg.selectAll("g.cost")
    .data(dataset)
    .enter().append("g")
    .attr("class", "cost")
    .attr("id", 'remove_me')
    .style("fill", function(d, i) { return colors[i]; });

  var rect = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("id", 'remove_me')
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) {if (d.y){return y(d.y0 + d.y)}; })
    .attr("height", function(d) {if (d.y){return y(d.y0) - y(d.y0 + d.y)}; })
    .attr("width", x.rangeBand())
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 15;
      var yPosition = d3.mouse(this)[1] - 25;
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text(Math.round(d.y*SCALE))
              .attr('dx','1em');
    });


  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append("g")
    .attr("id", 'remove_me')
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip.append("text")
    .attr("x", 15)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
}
