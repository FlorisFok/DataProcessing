document.addEventListener('DOMContentLoaded', () => {
   // counter for file name
   var counter = 0;
   // classes
   var class_count = 0;
   var class_list = [];

   let draw = false;
   var style = document.querySelector("#style").value;

   var points = [];
   var lines = [];
   var svg = null;

   document.querySelector("#style").onchange = function() {
     style = document.querySelector("#style").value;
     render(style);
   }

   function render(style) {
     const svg = d3.select("#main-img");

     if (style === 'draw'){
       svg.on("mousedown", function() {
         draw = true;
         const coords = d3.mouse(this);
         draw_point(coords[0], coords[1], false);
       });

       svg.on("mouseup", function() {
         draw = false;
       })

       svg.on('mousemove', function() {
         if (draw === true)
         {
           var style = document.querySelector("#style").value;
           const coords = d3.mouse(this);
           draw_point(coords[0], coords[1], true);
         }
         return;
       })
     }
     else if (style === 'line'){
       let draw = false;
       let line = false;
       var beginx = 0;
       var beginy = 0;
       svg.on("mousedown", function() {
         draw = true;
         const coords = d3.mouse(this);
         beginx = coords[0];
         beginy = coords[1];
         draw_line(coords[0], coords[1], beginx, beginy, false);
       });

       svg.on("mouseup", function() {
         const coords = d3.mouse(this);
         draw_line(coords[0], coords[1], beginx, beginy, true);
         draw = false;
       })

       svg.on('mousemove', function() {
         if (draw && line) {
           let j = lines.length - 1;
           lines[j].remove();
           lines.pop()
           let coords = d3.mouse(this);
           draw_line(coords[0], coords[1], beginx, beginy, false);
         }
         else if (draw) {
           line = true;
           let coords = d3.mouse(this);
           draw_line(coords[0], coords[1], beginx, beginy, false);
         }
         else {
           line = false;
         }
       })
     }
    else if (style === 'circle'){
       let draw = false;
       let line = false;
       var beginx = 0;
       var beginy = 0;
       svg.on("mousedown", function() {
         draw = true;
         const coords = d3.mouse(this);
         beginx = coords[0];
         beginy = coords[1];
         draw_line(coords[0], coords[1], beginx, beginy, false);
       });

       svg.on("mouseup", function() {
         const coords = d3.mouse(this);
         draw_circle(coords[0], coords[1], beginx, beginy, true);
         draw = false;
       })

       svg.on('mousemove', function() {
         if (draw && line) {
           let j = lines.length - 1;
           lines[j].remove();
           lines.pop()
           let coords = d3.mouse(this);
           draw_circle(coords[0], coords[1], beginx, beginy, false);
         }
         else if (draw) {
           line = true;
           let coords = d3.mouse(this);
           draw_circle(coords[0], coords[1], beginx, beginy, false);
         }
         else {
           line = false;
         }
       })
     }
     else if (style === 'square'){
       let draw = false;
       let line = false;
       var beginx = 0;
       var beginy = 0;
       svg.on("mousedown", function() {
         draw = true;
         const coords = d3.mouse(this);
         beginx = coords[0];
         beginy = coords[1];
         draw_square(coords[0], coords[1], beginx, beginy, false);
       });

       svg.on("mouseup", function() {
         const coords = d3.mouse(this);
         draw_square(coords[0], coords[1], beginx, beginy, true);
         draw = false;
       })

       svg.on('mousemove', function() {
         if (draw && line) {
           let j = lines.length - 1;
           lines[j].remove();
           lines.pop()
           let coords = d3.mouse(this);
           draw_square(coords[0], coords[1], beginx, beginy, false);
         }
         else if (draw) {
           line = true;
           let coords = d3.mouse(this);
           draw_square(coords[0], coords[1], beginx, beginy, false);
         }
         else {
           line = false;
         }
       })
     }
     document.querySelector("#erase").onclick = () => {
       for (let i = 0; i < points.length; i++){
         points[i].remove();
       }
       for (let i = 0; i < lines.length; i++){
         lines[i].remove();
       }
       points = [];
       lines = [];
     }
     document.querySelector("#undo").onclick = () => {
       if (lines.length > 0)
       {
          let j = lines.length - 1;
          lines[j].remove();
          lines = lines.slice(0, j);
        }
       if (points.length > 1)
       {
          let i = points.length - 1;
          points[i].remove();
          points = points.slice(0, i);
          i = points.length - 1;
          points[i].remove();
          points = points.slice(0, i);
       }
     }

     function draw_point(x, y, connect) {

         const color = document.querySelector("#color").value;
         const thicc = document.querySelector("#size").value;

         if (connect){
           const last_point = points[points.length - 1]
           const line = svg.append('line')
                           .attr('x1', last_point.attr('cx'))
                           .attr('y1', last_point.attr('cy'))
                           .attr('x2', x)
                           .attr('y2', y)
                           .attr('stroke-width', thicc*2)
                           .style('stroke', color);
           lines.push(line);
         }


          const point = svg.append("circle")
                           .attr('cx', x)
                           .attr('cy', y)
                           .attr('r', thicc)
                           .style('fill', color);

          points.push(point);
     }
     function draw_line(x, y, beginx, beginy, first) {

         const color = document.querySelector("#color").value;
         const thicc = document.querySelector("#size").value;

         if (!(first)){
           const last_point = points[points.length - 1]
           const line = svg.append('line')
                           .attr('x1', beginx)
                           .attr('y1', beginy)
                           .attr('x2', x)
                           .attr('y2', y)
                           .attr('stroke-width', thicc*2)
                           .style('stroke', color);
           lines.push(line);
         }
         else {
           const point = svg.append("circle")
                             .attr('cx', x)
                             .attr('cy', y)
                             .attr('r', thicc)
                             .style('fill', color);

           points.push(point);
        }
     }
     function draw_circle(x, y, beginx, beginy, first) {

         const color = document.querySelector("#color").value;
         const thicc = document.querySelector("#size").value;

         if (!(first)){
           const last_point = points[points.length - 1]
           let total_len = ((beginx-x)**2+(beginy-y)**2)**0.5;
           const line = svg.append('circle')
                           .attr('cx', beginx)
                           .attr('cy', beginy)
                           .attr('r', total_len)
                           .style('fill', color);
           lines.push(line);
         }
         else {
           const point = svg.append("circle")
                           .attr('cx', x)
                           .attr('cy', y)
                           .attr('r', 0)
                           .style('fill', color);

           points.push(point);
        }
     }
     function draw_square(x, y, beginx, beginy, first) {

         const color = document.querySelector("#color").value;
         const thicc = document.querySelector("#size").value;

         if (!(first)){
           let width = beginx - x;
           let height = beginy - y;

           if (width < 0 && height < 0) {
             var xx = beginx;
             var yy = beginy;
           }
           else if (width < 0 && height > 0) {
              var xx = beginx;
              var yy = y
           }
           else if (width > 0 && height < 0) {
              var yy = beginy;
              var xx = x;
           }
           else {
             var xx = x;
             var yy = y;
           }
           const square = svg.append('rect')
                           .attr('x', xx)
                           .attr('y', yy)
                           .attr('width', Math.abs(width))
                           .attr('height', Math.abs(height))
                           .style('fill', color);
           lines.push(square);
         }
         const point = svg.append("circle")
                           .attr('cx', x)
                           .attr('cy', y)
                           .attr('r', 0)
                           .style('fill', color);

         points.push(point);
     }
   }
 render(style);


 document.querySelectorAll("#resize").forEach(function(button) {
    button.onclick = function() {
      let image = document.querySelector("#main-img");
      if (button.value === 'square')
      {
        image.style = "width:400px;height:400px;";
      }
      else
      {
        image.style = "width:600px;height:400px;";
      }
    }
  });
});
