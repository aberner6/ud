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

var padding = 1,//1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 8;

var data;

// get the data
const makeRequest = async () => {
  try {
    // data = await d3.csv("data_structure.csv");
    data = await d3.csv("mini_train.csv");
    return data;
  } catch (err) {
    console.log(err)
    throw Error("Failed to load data")
  }
}

var index = 0;
var howMuch = 0;
var whichNum = 0;
const processPrep = async(data) => {
// async function processPrep(data){

    width = 960;
    height = 500;
    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.on("click", function(){ 
        series();
    })
    node = svg.append("g").selectAll(".node");

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

var clusters;
var node;
var n, m, color;
async function makeNodes(uniqueKeywords){

    n = data.length; // total number of nodes
    m = uniqueKeywords.length; // number of distinct clusters
    clusters = new Array(m);
    console.log(m);
    console.log(m+uniqueKeywords);

    color = d3.scaleSequential(d3.interpolateRainbow)
        .domain(d3.range(m));


    for (var j=0; j<data.length; j++){
        var i = parseInt(data[j].ty),
            r = parseInt(data[j].age)/4,
            d = {
                id: data[j].id,
                cluster: i,
                name: data[j].name,
                radius: r,
                x: Math.cos(i / m * 2 * Math.PI) * 150 + width / 2,
                y: Math.sin(i / m * 2 * Math.PI) * 150 + height / 2
            };
        if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
        nodes.push(d);
    }
    return nodes;
}

function series(){
    index++;
    console.log(index+"series")
    restart(chooseData(nodes, index));
}

function chooseData(nodes, whichNum){
    console.log(whichNum)
    var liveData = [];
        for (var i = 0; i<nodes.length; i++){
            if(nodes[i].cluster==whichNum){ //the cluster to focus on
                liveData.push(nodes[i])
            }
        }
    return liveData;
}
function restart(liveData){

    // console.log(liveData);
    // transition
    var t = d3.transition()
      .duration(700);    

    node = node.data(liveData, function(d){ return d.cluster; });
    node.exit()
    .transition(t)
        .style("fill","grey")
      .attr("r", 1e-6)
      .remove();

    node
      .transition(t)
        .attr("r", function(d){ return d.radius });


    node = node.enter().append("circle")
      .style("fill", function(d){
        return color(d.cluster/10)
      })
      .style("opacity",.5)
      .attr("r", function(d){ return d.radius })
      .attr("class", function(d){
        return d.id+" "+d.cluster;
      })
      .merge(node);



    simulation = d3.forceSimulation(liveData)
        .nodes(liveData)
        // always cluster by section
        .force('cluster', d3.forceCluster()
            .centers(function (d) { 
                return clusters[d.cluster]; })
            .strength(0.75)
            .centerInertia(0.1))
        // always apply collision with padding
        .force('collide', d3.forceCollide(function (d) { 
            return d.radius + padding; })
            .strength(0).radius(function(d){ return d.radius; }).iterations(1))
        .on("tick", layoutTick);


      
    // ramp up collision strength to provide smooth transition
    var transitionTime = 3000;
    var t = d3.timer(function (elapsed) {
      var dt = elapsed / transitionTime;
      simulation.force('collide').strength(Math.pow(dt, 2) * 0.7);
      if (dt >= 1.0) t.stop();
    });
}

  
function layoutTick (e) {
  node
    .attr('cx', function (d) { return d.x; })
    .attr('cy', function (d) { return d.y; })
    .attr('r', function (d) { return d.radius; });
}

makeRequest()
    .then(data => processPrep(data))
    .then(uniqueKeywords => makeNodes(uniqueKeywords))
    // .then(nodes => makeForce(nodes))


