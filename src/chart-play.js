var pitches = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

var data = [
    {
     pitch: 'C',
     tstart: 0,
     tend: 4
    },
    {
     pitch: 'E',
     tstart: 4,
     tend: 6
    },
    {
     pitch: 'G',
     tstart: 7,
     tend: 10
    }
]

var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 760 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var x = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.tend; })])
    .range([0, width]);

var y = d3.scaleBand()
    .domain(pitches)
    .range([height, 0]);

var colors = d3.scaleOrdinal(d3.schemeCategory10).domain(pitches);

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function make_y_axis() {        
    return d3.axisLeft()
        .scale(y)
        .ticks(5)
}

var bar = chart.selectAll("g")
    .data(data)
  .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + x(d.tstart) + "," + y(d.pitch) + ")"; });

bar.append("rect")
    .attr("width", function(d) { return x(d.tend - d.tstart); })
    .attr("height", y.bandwidth())
    .attr("fill", function(d) { return colors(d.pitch); });

bar.append("text")
    .attr("x", function(d) { return x(d.tend - d.tstart) - 3; })
    .attr("y", y.bandwidth() / 2)
    .attr("dy", ".35em")
    .text(function(d) { return d.pitch; });

chart.append("g")         
    .attr("class", "grid")
    .attr("transform", "translate(0," + y.bandwidth() / 2 + ")")
    .call(make_y_axis()
        .tickSize(-width, 0, 0)
    )

var timeline = d3.select(".timeline")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 50 + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xTime = d3.scaleLinear()
    .domain([0, 20])
    .range([0, width]);

var xAxis = d3.axisBottom()
    .scale(xTime);

var notes = []
var timebars = [
    {
      pointer: 0
    }
]

var startTime, currentTime

function updateTimeline() {
    if (startTime) {
        currentTime = new Date();
        var timeMs = (currentTime - startTime) / 1000;
        timebars[0].pointer = Math.round(timeMs * 100) / 100;

        if (timebars[0].pointer > 20) {
            timebars[0].pointer = 20;
            clearInterval(updateInterval);
        }

        if (currentNote) {
          currentNote.tend = timebars[0].pointer;
        }
    }

var notebar = timeline.selectAll("g.notebar")
  .data(notes);

notebar = notebar.enter().append("g")
    .attr("class", "notebar")
    .merge(notebar)
    .attr("transform", function(d, i) { return "translate(" + xTime(d.tstart) + ", 5)"; })
    .append("rect")
    .attr("width", function(d) { return xTime(d.tend - d.tstart); })
    .attr("height", 20);

var timebar = timeline.selectAll("g.timebar")
  .data(timebars)
  .attr("transform", function(d, i) { return "translate(" + xTime(d.pointer) + ", 0)"; });

timebar.select("text")
  .text(function(d) { return Math.round(d.pointer * 10) / 10; });

timebar = timebar.enter().append("g")
  .attr("class", "timebar");

timebar.append("text")
    .attr("x", 0)
    .attr("y", -5)
    .text(function(d) { return Math.round(d.pointer * 10) / 10; });
    
timebar.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 28);
timebar.append("polygon").attr("points", "-5,37 0,32 5,37");
}

updateTimeline();

var updateInterval = null;
function play() {
  stop();
  timebars[0].pointer = 0;
  startTime = new Date();
  updateInterval = window.setInterval(updateTimeline, 20);
}

function pause() {
  if (updateInterval) {
      clearInterval(updateInterval);
  }
} 

function stop() {
  if (updateInterval) {
      clearInterval(updateInterval);
  }
}

timeline.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + 30 + ")")
    .call(xAxis);

var currentNote = null
document.addEventListener('keydown', (event) => {
  if (event.keyCode == 32) {
      if (!currentNote) {
      currentNote = {
          tstart: timebars[0].pointer
      };
      notes.push(currentNote);
       }
  }
}, false);

document.addEventListener('keyup', (event) => {
  if (event.keyCode == 32 && currentNote) {
    currentNote.tend = timebars[0].pointer; 
    currentNote = null;
  }
}, false);
