//global variables
//"var" could also be "let" - can be redefined locally
var width, height;

var keywords = [];

var uniqueKeywords;

var links = [];
var nodes = [];
var svg, vis;
var circle, path;

var rad = 8;
var simulation;

var padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 8;

var simpleNodes;
var data;

// get the data
const makeRequest = async () => {
  try {
    data = await d3.csv("data_structure.csv");
    return data;
  } catch (err) {
    console.log(err)
    throw Error("Failed to load data")
  }
}


const processPrep = async(data) => {
// async function processPrep(data){
    width = 960;
    height = 500;
    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    for (var i = 0;i<data.length; i++){ //this is a for loop and goes through the whole dataset
        keywords.push(data[i].name);
    };
    uniqueKeywords = keywords.filter(onlyUnique); //find unique keywords
    //magic function to return only unique values
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    return uniqueKeywords;
}

async function drawNodes(uniqueKeywords){

    var n = data.length; // total number of nodes
    var m = uniqueKeywords.length; // number of distinct clusters
    var clusters = new Array(m);
    console.log(n);
    console.log(m+uniqueKeywords);

    var color = d3.scaleSequential(d3.interpolateRainbow)
        .domain(d3.range(m));

    for (var j=0; j<data.length; j++){
        var i = parseInt(data[j].ty),
            r = rad,
            d = {
                cluster: i,
                radius: r,
                x: Math.cos(i / m * 2 * Math.PI) * 150 + width / 2,
                y: Math.sin(i / m * 2 * Math.PI) * 150 + height / 2
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        nodes.push(d);
    }


    var maxStrength = 0.25;
    var simulation = d3.forceSimulation()

        // pull toward mouse (see 'mousemove' handler below)
        // .force('attract', d3.forceAttract()
        //     .target([width/2, height/2])
        //     .strength(function (d) { return Math.pow((d.radius / rad) * maxStrength, 2); })) //.001

        // use center force to keep normal
        // .force('center', d3.forceCenter(width/2, height/2))

        // always cluster by section
        .force('cluster', d3.forceCluster()
            .centers(function (d) { 
                return clusters[d.cluster]; })
            .strength(0.75)
            .centerInertia(0.1))

        // always apply collision with padding
        .force('collide', d3.forceCollide(function (d) { 
            return d.radius + padding; })
            .strength(0))

        .on('tick', layoutTick)
        .nodes(nodes);

    var node = svg.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .style("fill", function(d){
        return color(d.cluster/10)
      })   
      .style("opacity",.5)

    //will only work if we start with the force of attraction
    svg.on('mousemove', function () {
        simulation.force('attract')
            .target([300*Math.random(), 300*Math.random()]);
        simulation
          .alphaTarget(0.3)
          .restart();
    });

      
    // ramp up collision strength to provide smooth transition
    var transitionTime = 3000;
    var t = d3.timer(function (elapsed) {
      var dt = elapsed / transitionTime;
      simulation.force('collide').strength(Math.pow(dt, 2) * 0.7);
      if (dt >= 1.0) t.stop();
    });
      
    function layoutTick (e) {
      node
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; })
        .attr('r', function (d) { return d.radius; });
    }
}



makeRequest()
    .then(data => processPrep(data))
    .then(uniqueKeywords => drawNodes(uniqueKeywords));



