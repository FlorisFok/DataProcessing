// var fileName = "data2.json";
// var txtFile = new XMLHttpRequest();
//
// txtFile.onreadystatechange = function()
// {
//     if (txtFile.readyState === 4 && txtFile.status == 200)
//       {
//         const data = JSON.parse(txtFile.responseText);
//         console.log(data);
//
//         var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
//                 11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
//
//         d3.select("body").selectAll("div")
//             .data(dataset)
//             .enter()
//             .append("div")
//             .attr("class", "bar")
//             .style("height", function(d) {
//                 var barHeight = d * 5;
//                 return barHeight + "px";
//             });
//     }
//
// };
// var svgWidth = 800;
// var svgHeight = 600;
//
// txtFile.open("GET", fileName);
// txtFile.send();

console.log(this)
var data = [
    {key: "Glazed",     value: 132},
    {key: "Jelly",      value: 71},
    {key: "Holes",      value: 337},
    {key: "Sprinkles",  value: 93},
    {key: "Crumb",      value: 78},
    {key: "Chocolate",  value: 43},
    {key: "Coconut",    value: 20},
    {key: "Cream",      value: 16},
    {key: "Cruller",    value: 30},
    {key: "Éclair",     value: 8},
    {key: "Fritter",    value: 17},
    {key: "Bearclaw",   value: 21}
];
var w = 800;
var h = 450;
var margin = {
    top: 58,
    bottom: 100,
    left: 80,
    right: 40
};
var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

var x = d3.scaleBand()
        .domain(data.map(function(entry){
            return entry.key;
        }))
        .range([0, width])
var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d){
            return d.value;
        })])
        .range([height, 0]);

var linearColorScale = d3.scaleLinear()
                        .domain([0,data.length])
                        .range(["red","green"]);

// var ordinalColorScale = d3.scaleOrdinal(d3.schemeCategory20);
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);
var yGridLines = d3.axisLeft(y)
                  .tickSize(-width)
                  .tickFormat("");

var svg = d3.select("svg")
            .attr("width", w)
            .attr("height", h);

var chart = svg.append("g")
            .classed("display", true)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var controls = d3.select('body')
                  .append("div")
                  .attr("id","controls");

var sort_btn = controls.append("button")
               .html("Sort data: acending")
               .attr("state",0)
function drawAxis(params){

  if(params.initialize){
    //Draw the gridlines and axes
    //Draw the gridlines
    this.append("g")
      .call(params.gridlines)
      .classed("gridline",true)
      .attr("transform","translate(0,0)")
  //This is the x axis
    this.append("g")
      .classed("x axis", true)
      .attr("transform","translate("+ 0 + ","+ height +")")
      .call(params.axis.x)
  			.selectAll("text")
        .classed("x-axis-label", true)
			    .style("text-anchor", "end")
		      .attr("dx", -8)
			    .attr("dy", 8)
			    .attr("transform", "translate(0,0) rotate(-45)");
  //This is the y axis
    this.append("g")
        .classed("y axis", true)
        .attr("transform", "translate(0,0)")
        .call(params.axis.y)

   // This is the y label
    this.select(".y.axis")
      .append("text")
      .style("stroke", "black")
      .style("font-size", "18px")
      .attr("x", 0)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(-50," + height/2 + ") rotate(-90)")
      .text("Units sold");

  // This is the x label
    this.select(".x.axis")
      .append("text")
      .style("stroke", "black")
      .style("font-size", "18px")
      .attr("x", 0)
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + width/2 + ",80)")
      .text("Donut type");
  } else if(params.initialize === false){
    //Update info
		this.selectAll("g.x.axis")
			.call(params.axis.x);
		this.selectAll(".x-axis-label")
			.style("text-anchor", "end")
			.attr("dx", -8)
			.attr("dy", 8)
			.attr("transform", "translate(0,0) rotate(-45)");
		this.selectAll("g.y.axis")
			.call(params.axis.y);
  }

}

function plot(params){
  x.domain(params.data.map(function(entry){
      return entry.key;
    }));
  y.domain([0, d3.max(params.data, function(d){
      return d.value;
    })]);

  drawAxis.call(this, params)

  //enter()
  this.selectAll(".bar")
      .data(params.data)
      .enter()
          .append("rect")
          .classed("bar", true)
      .on("mouseover", function(d,i){
        d3.select(this).style("fill", "black");
      })
      .on("mouseout", function(d,i){
        d3.select(this).style("fill",  'red');
      });

  this.selectAll(".bar-label")
      .data(params.data)
      .enter()
        .append("text")
        .classed("bar-label", true);

  //update
  this.selectAll(".bar")
      .transition()
      .attr("x", function(d,i){
      return x(d.key)
      })
      .attr("y", function(d,i){
      return y(d.value);
      })
      .attr("height", function(d,i){
      return height - y(d.value)
      })
      .attr("width", function(d){
      return x.bandwidth()
      })
      .style("fill", function(d,i){
      // return linearColorScale(i)
      return 'red'
      });

  this.selectAll(".bar-label")
    .transition()
    .attr("x", function(d,i){
    return x(d.key) + (x.bandwidth() / 2)
    })
    .attr("dx", -3)
    .attr("y", function(d,i){
    return y(d.value);
    })
    .attr("dy", -2)
    .text(function(d){
    return d.value;
    })

  //exit()
  this.selectAll(".bar")
      .data(params.data)
      .exit()
      .remove();
  this.selectAll(".bar-label")
      .data(params.data)
      .exit()
      .remove()

}

sort_btn.on("click", function(){
	var self = d3.select(this);
  var ascending = function(a,b){
    return a.value - b.value
  };
  var descending = function(a,b){
    return b.value - a.value
  }
	var state = +self.attr("state");
	var txt = "Sort data: ";
	if(state === 0){
    data.sort(ascending)
		state = 1;
		txt += "descending";
	} else if(state === 1){
    data.sort(descending)
		state = 0;
		txt += "ascending";
	}
	self.attr("state", state);
	self.html(txt);
  plot.call(chart, {
    data: data,
    axis:{
      x: xAxis,
      y: yAxis
    },
    gridlines: yGridLines,
    initialize: false
  });
});


plot.call(chart, {
	data: data,
	axis:{
		x: xAxis,
		y: yAxis
	},
	gridlines: yGridLines,
  initialize: true
});
