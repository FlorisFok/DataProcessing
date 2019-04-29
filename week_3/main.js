var fileName = "data.json";
var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {
        const data = JSON.parse(txtFile.responseText);
        console.log(data);

        // Select canvas
        const canvas = document.querySelector('#my-house');
        const ctx = canvas.getContext('2d');

        // Set graph bounderies
        MAX_HEIGHT = 400
        MAX_WIDTH = 800
        LINE_DINSTANCE = 25

        const max_x = Math.max.apply(null, data.day)
        const max_y = Math.max.apply(null, data.average_high)


        // Wall
        // ctx.beginPath()
        // ctx.lineWidth = 6.0;
        // ctx.strokeStyle = 'black';
        // ctx.strokeRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
        // ctx.stroke();

        // lines
        ctx.beginPath()
        ctx.lineWidth=3.0;
        let y = 0;
        while (y < MAX_HEIGHT){
          ctx.moveTo(0, y);
          ctx.lineTo(MAX_WIDTH, y);
          y += LINE_DINSTANCE
          ctx.font = "15px Arial";
          axis_text = ((MAX_HEIGHT-y)*(MAX_HEIGHT/max_y))/10;
          ctx.fillText(axis_text, MAX_WIDTH, y);
        }
        ctx.stroke();

        function axis(item, max_item, true_max) {
          true_item = (true_max/max_item) * (item - 1);
          return true_item;
        };

        function yaxis(item, max_item, true_max) {
          true_item = true_max -(true_max/max_item) * (item - 1);
          return true_item;
        };

        // High wind speeds
        ctx.beginPath()
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6.0;
        for (let i = 0; i < data.day.length; i++) {

          let x = axis(data.day[i], max_x, MAX_WIDTH);
          let y = yaxis(data.average_high[i], max_y, MAX_HEIGHT);

          if (i === 0){
            ctx.moveTo(x, y);
          }
          else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Low wind speeds
        ctx.beginPath()
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3.0;

        for (let i = 0; i < data.day.length; i++) {

          let x = axis(data.day[i], max_x, MAX_WIDTH);
          let y = yaxis(data.average_low[i], max_y, MAX_HEIGHT);

          if (i === 0){
            ctx.moveTo(x, y);
          }
          else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Lower axis notation
        for (let i = 0; i < data.day.length; i++) {
          let x = axis(data.day[i], max_x, MAX_WIDTH);
          ctx.font = "15px Arial";
          ctx.fillText(data.day[i], x, MAX_HEIGHT);

        }

    }
}
txtFile.open("GET", fileName);
txtFile.send();



function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0];
    var domain_max = domain[1];
    var range_min = range[0];
    var range_max = range[1];

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min);
    var beta = range_max - alpha * domain_max;

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    };
}

document.addEventListener("DOMContentLoaded", function() {

});
