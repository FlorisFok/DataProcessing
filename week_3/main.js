

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

        SCALE_WINDS = 3;
        SCALE_TRAFFIC = 0.006;

        WIND_TRANSFORM = 250

        function transform(x, y)
        {
          true_y = (MAX_HEIGHT - y) - PADDING;
          true_x = PADDING + (x);

          return true_x, true_y;
        };

        data_points = data.wind.length;
        translation_x = (MAX_WIDTH - PADDING)/data_points;

        var x_axis = [];
        for (var i = 1; i <= data_points; i++) {
          x_axis.push(i*translation_x);
        };

        ctx.beginPath()
        ctx.lineWidth=3.0;

        for (let i = 0; i < data_points; i++)
        {
          let x = x_axis[i];
          let point = data.wind[i];
          let y = (point*SCALE_WINDS) + WIND_TRANSFORM;

          x,y = transform(x, y)

          if (i === 0){
            ctx.moveTo(x, y);
          }
          else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        ctx.beginPath()
        ctx.lineWidth=1;
        ctx.strokeStyle = 'yellow';
        for (let i = 0; i < data_points; i++)
        {
          let x = x_axis[i];
          let point = data.data[i];
          let height = (point*SCALE_TRAFFIC);

          let y;
          x, y = transform(x, 0)

          ctx.rect(x, MAX_HEIGHT - PADDING, 1, -height);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth=0.5;
        ctx.strokeStyle = 'black';
        for (let i = 0; i < data_points/3; i++)
        {
          let x = x_axis[i*3];
          if (i%4 == 0){
            ctx.moveTo(x, PADDING/2);
          }
          else {
            ctx.moveTo(x, PADDING);
          }
          ctx.lineTo(x, MAX_HEIGHT - PADDING);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth=0.5;
        ctx.font = "10px Arial bold";
        let year = 1992
        for (let i = 0; i < data_points/3; i++)
        {
          let x = x_axis[i*3];

          ctx.fillText(data.month[i*3][0],x,PADDING)
          if (i%4 == 0) {
            ctx.font = "15px Arial bold";
            ctx.fillText(year,x,PADDING/2)
            ctx.font = "10px Arial bold";
            year += 1
          }
        }
        ctx.stroke();


    }
}
txtFile.open("GET", fileName);
txtFile.send();
