

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
        MAX_HEIGHT = 700;
        MAX_WIDTH = 1200;
        LINE_DINSTANCE = 20;
        PADDING = 100;
        SMALL_PADDING = 50;

        SCALE_WINDS = 4;
        SCALE_TRAFFIC = 0.005;

        WIND_TRANSFORM = 200
        START_YEAR = 1992

        // transform x and y coordinates
        function transform(x, y)
        {
          true_y = (MAX_HEIGHT - y) - PADDING;
          true_x = PADDING + (x);

          return true_x, true_y;
        };

        // usefull variables
        let data_points = data.wind.length;
        let translation_x = (MAX_WIDTH - PADDING)/data_points;

        // x_axis mapping array
        var x_axis = [];
        for (let i = 1; i <= data_points; i++)
        {
          x_axis.push(i*translation_x);
        };

        // Display wind data
        ctx.beginPath()
        ctx.lineWidth=3.0;
        for (let i = 0; i < data_points; i++)
        {
          // Get values, and true coordinates
          let x = x_axis[i];
          let point = data.wind[i];
          let y = (point*SCALE_WINDS) + WIND_TRANSFORM;
          x,y = transform(x, y)

          // Draw line, first point is begining of line
          if (i === 0){
            ctx.moveTo(x, y);
          }
          else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Display traffic data
        ctx.beginPath()
        ctx.lineWidth=1;
        ctx.strokeStyle = 'yellow';
        for (let i = 0; i < data_points; i++)
        {
          // Get values, and true coordinates
          let x = x_axis[i];
          let point = data.data[i];
          let height = (point*SCALE_TRAFFIC);
          let y;
          x, y = transform(x, 0)

          // Draw bars
          ctx.rect(x, MAX_HEIGHT - PADDING, 1, -height);
        }
        ctx.stroke();

        // Drawgrid lines
        ctx.beginPath();
        ctx.lineWidth=0.5;
        ctx.strokeStyle = 'black';
        for (let i = 0; i < data_points/3; i++)
        {
          // True coordinate
          let x = x_axis[i*3];

          // Longer lines for each year, short for others
          if (i%4 == 0){
            ctx.moveTo(x, PADDING/2);
          }
          else {
            ctx.moveTo(x, PADDING);
          }
          // Always end at same point
          ctx.lineTo(x, MAX_HEIGHT - PADDING);
        }
        ctx.stroke();

        // Draw year and month
        ctx.beginPath();
        ctx.lineWidth=0.5;
        ctx.font = "10px Arial bold";
        let year = START_YEAR
        for (let i = 0; i < data_points/3; i++)
        {
          // Get true coordinate
          let x = x_axis[i*3];

          // Place month letter
          ctx.fillText(data.month[i*3][0],x,PADDING)
          if (i%4 == 0) {
            // Place year notation
            ctx.font = "15px Arial bold";
            ctx.fillText(year,x,PADDING/2)
            ctx.font = "10px Arial bold";
            year += 1
          }
        }
        ctx.stroke();

        // Vertical notations boundaries
        ctx.beginPath();

        const max_traf = Math.max.apply(null, data.data)
        const max_wind = Math.max.apply(null, data.wind)

        var wind = max_wind;
        var traf = max_traf/1000;

        // Vertical notations
        ctx.font = "15px Arial bold";
        ctx.textAlign = 'left';
        for (let i = PADDING; i < (MAX_HEIGHT - PADDING); i += 20)
        {
          if (i < MAX_HEIGHT/2)
          {
            ctx.fillText(`- ${wind}`, MAX_WIDTH - 100 + 10 , i)
            wind -= 5; // Sorry hard coded
          }
          else
          {
            ctx.fillStyle = "#ff0000"
            traf_round = Math.round(traf * 1) / 1
            ctx.fillText(`- ${traf_round}`, MAX_WIDTH - 100 + 10 , i)
            traf -= 4; // Sorry hard coded
          }
        };
        ctx.stroke();


        // Vertical text
        ctx.beginPath();
        ctx.font = "20px Arial bold";
        ctx.translate(MAX_WIDTH - SMALL_PADDING, MAX_HEIGHT*(3/4) - SMALL_PADDING)
        ctx.rotate(90 * Math.PI / 180);

        ctx.textAlign = 'center';
        ctx.fillText("Flights [x1000]",0,0)

        ctx.fillStyle = "#000000"
        ctx.translate(-(1/3) * MAX_HEIGHT, 0)
        ctx.fillText("Windspeed [m/s]",0,0)

        ctx.stroke();

    }
}
txtFile.open("GET", fileName);
txtFile.send();
