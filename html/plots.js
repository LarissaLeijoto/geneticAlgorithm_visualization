
  // Set the stage
  var width = 960;
  var height = 480;
  var legendSpacing = 4;
  var legendElementWidth = 50;

  var margin = {top: 20, right: 40, bottom: 50, left: 50},
    w = width - margin.left - margin.right,
    h = height - margin.top - margin.bottom;
    colors = ['#ADD8E6','#1E90FF','#0000FF','#191970', '#EE0000'];

  var currentPlot = 1;

  // Stage used only by the linechart:
  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);
     
  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.temperature); });

  // Stage used only by the scatter plot:
  var i=0;
  var pause=false;
  var expName = 'data1'

  var _step=5;

  // Start drawing:
  drawMenu();

  // Start scatter plot animation:
  next();
  //drawLineChart();

  /* * * * * * * * * * Scatter Plot Functions: * * * * * * * * * */ 

  function next() {
    var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("border", "2px solid black")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var name = expName + '/gen_' + i + '.json';
    try {
      // Read the json data:
      d3.json(name, function(error, data) {
        if(pause) return;
        if(svg) {
          d3.selectAll('circle').filter(function(d, i) { 
            return d[3] == 0;
          }).remove()

          d3.selectAll('circle').filter(function(d, i) {
            return d[3]--;
          }).style("fill", function(d) {
              return colors[d[3]]
          ;})
        }

        svg = draw(data)

        // Update the number of the
        // generations diplayed on the legend.
        redrawColorCaption(i)

        setTimeout(next, 80);
      });
      i += _step
    } catch(e) {
      i=0;
      pause=true;
    }
  }

  function togglePlay() {
    if(pause) {
      pause=false;
      next();
      document.getElementById("pause").innerHTML = "<b>Pause</b>"
    } else {
      pause=true;
      document.getElementById("pause").innerHTML = "<b>Play</b>"
    }
  }

  function togglePlot() {
    currentPlot *= -1;

    // If on line plot:
    if(currentPlot==-1) {
      togglePlay()
      d3.select('svg').remove();
      d3.select('#svg_td').append('svg');
      drawLineChart();
      document.getElementById("toggle").innerHTML = "<b>See Scatter Plot</b>"
    } else {
      pause=true;
      d3.select('svg').remove();
      d3.select('#svg_td').append('svg');
      togglePlay()
      document.getElementById("toggle").innerHTML = "<b>See Line Plot</b>"
    }
  }

  function clean() {
    d3.selectAll('circle').remove()
  }

  function updateData() {
    var val = document.getElementById("experimento").value;
    expName = 'data' + val;

    // If on line plot:
    if(currentPlot==-1) {
      d3.select('svg').remove();
      d3.select('#svg_td').append('svg');
      drawLineChart();
    }
  }

  function draw(data) {

    data.sort(function(a, b) { return a[2]-b[2] })
    max = data[data.length-1][2]

    for (var j = 0; j < data.length; j++)
      data[j].push(3);

    var div = d3.select("body").append("div")   
      .attr("class", "tooltip")               
      .style("opacity", 0);

    var xScale = d3.scale.linear()
      .domain([0, 1])
      .range([0, width]);
  
    var yScale = d3.scale.linear()
      .domain([0, 1])
      .range([height, 0]);
  
    var colorScale = d3.scale.quantile()
      .domain([0, 1, 2, 3])
      .range(colors);
  
    // Get SVG element
    var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("border", "2px solid black")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    svg.selectAll("circle")
      .data(data).enter().append("circle")
      .attr("cx", function(d) {
        //return xScale(d[0]); // X calculado com as matrizes
        return xScale(d[0]);
      })
      .attr("cy", function(d) {
        return yScale(d[1]); // Y calculado com as matrizes
      })
      .attr("r", function(d) { return 15*d[2]; })
      .style("fill", function(d) {
        if(max==d[2])
          return colors[4]
        else
          return colors[3]
      })
      .on("mouseover", function(d) {      
        if(!pause) return;
        div.transition()
          .duration(200)
          .style("opacity", 1)
          .style("background", "#FFFFFF")
  
        div.html("<b>Fitness:<br>" + (d[2]+"").substr(0,4) + "</b>")
          .style("left", d3.select(this).attr("cx") + "px")
          .style("top", d3.select(this).attr("cy") -10  + "px")
          .style("halign", "center")
          .style("padding-left", "5px")
          .style("border", "1px solid black")
      })
      .on("mouseout", function(d) {       
        div.transition()
          .duration(500)      
          .style("opacity", 0);   
      })
  
    return svg;
 }

  function drawMenu() {
    d3.select("#color_scale").append("div").selectAll("div")
      .data(colors)
      .enter()
      .append("div")
      .style("background", function(d){return d;})
      .style("height", "30px")
      .style("width", "30px")

    d3.select("#color_caption").append("div").selectAll("div")
      .data(colors)
      .enter()
      .append("div")
      .attr("id", function(d, i){return ("color_tbox_"+i);})
      .style("line-height", "30px")
      .style("width", "30px")
  }

  function redrawColorCaption(idx) {
    for (var j = 0; j < 4; j++) {
      var num = idx-3+j;
      document.getElementById("color_tbox_" + j)
        .innerHTML = (num>=0?num:"-") + "";
    }
    document.getElementById("color_tbox_" + j).innerHTML = "<b>Best</b>"
  }

  /* * * * * * * * * * Line Chart Functions * * * * * * * * * */

function drawLineChart() {

  // Get svg element:
  var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("border", "2px solid black")
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.tsv("csv/" + expName + ".csv", function(error, data) {
    if (error) throw error;

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    // This table is a list of dicts
    // Each dict contains the column name and a list of values.
    var table = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, temperature: +d[name]};
        })
      };
    });

    for(var i in table)
      if(table[i].name == 'stdev') {
        table[i] = table[table.length-1]
        table.pop();
      }

    x.domain(d3.extent(data, function(d) { return d.date; }));
  
    y.domain([
      d3.min(table, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
      d3.max(table, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
    ]);
  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
  
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Fitness");
  
    var item = svg.selectAll(".item")
        .data(table)
        .enter().append("g")
        .attr("class", "item");
  
    item.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });
  
    item.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });
  });
}

  
