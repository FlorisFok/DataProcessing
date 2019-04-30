function axis(item, max_item, true_max)
{
  true_item = (true_max/max_item) * (item - 1);
  return true_item;
};

function yaxis(item, max_item, true_max)
{
  true_item = true_max - (true_max/max_item) * (item - 1) + TOP_PADDING;
  return true_item;
};

var fileName = "data.json";
var txtFile = new XMLHttpRequest();

txtFile.onreadystatechange = function()
{
    if (txtFile.readyState === 4 && txtFile.status == 200)
    {
        const data = JSON.parse(txtFile.responseText);
        console.log(data);

        // Select canvas
        const canvas = document.querySelector('#my-house');
        const ctx = canvas.getContext('2d');

        // Set graph bounderies
        MAX_HEIGHT = 400
        MAX_WIDTH = 800
        LINE_DINSTANCE = 20
        TOP_PADDING = 20

        const max_x = Math.max.apply(null, data.day)
        const max_y = Math.max.apply(null, data.average_high)

        // lines and y axis
        ctx.beginPath()
        ctx.lineWidth=3.0;
        let y = LINE_DINSTANCE;

        while (y < MAX_HEIGHT)
        {
          ctx.moveTo(0, y);
          ctx.lineTo(MAX_WIDTH, y);

          y += LINE_DINSTANCE
          ctx.font = "15px Arial";

          axis_text = ((MAX_HEIGHT - y)/MAX_HEIGHT) * max_y;
          axis_text = Math.round(axis_text * 100) / 100

          ctx.fillText(axis_text + 10, MAX_WIDTH, y - LINE_DINSTANCE + 10);
        }

        // x axis notation
        for (let i = 0; i < data.day.length; i++)
        {
          let x = axis(data.day[i], max_x, MAX_WIDTH);

          ctx.font = "15px Arial";
          ctx.textAlign = 'center';

          ctx.fillText(data.day[i], x, MAX_HEIGHT);
        }


        // Titles and var names
        ctx.font = "25px Arial bold";
        ctx.fillText("Days []", (1/2)*MAX_WIDTH, MAX_HEIGHT + TOP_PADDING);
        //
        ctx.rotate(90 * Math.PI / 180);
        ctx.translate((1/2)*MAX_HEIGHT, -MAX_WIDTH - TOP_PADDING)
        ctx.textAlign = 'center';
        ctx.fillText("Wind speed [m/s]",0,0)
        //
        ctx.translate(-(1/2)*MAX_HEIGHT, +MAX_WIDTH + TOP_PADDING)
        ctx.rotate(- 90 * Math.PI / 180);

        ctx.stroke();
        // High wind speeds
        ctx.beginPath()
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 6.0;
        for (let i = 0; i < data.day.length; i++)
        {
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

        for (let i = 0; i < data.day.length; i++)
        {
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

    }
}
txtFile.open("GET", fileName);
txtFile.send();

document.addEventListener("DOMContentLoaded", function() {

});
