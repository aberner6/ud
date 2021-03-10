//global variables
var width, height;

var keywords = [];
var uniqueKeywords;

var links = [];
var nodes = {};

var svg, g, node, link;

var radius = 2;
var simulation;

var padding = 1.5,
    clusterPadding = 6,
    maxRadius = 8;

var dataset;
var liveData;
var simulation;
// get the data
const makeRequest = async () => {
  try {
    dataset = await d3.csv("mini_train.csv");
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error("Failed to load data")
  }
}

var index = 0;
var whichNum = 0;
const processPrep = async(dataset) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    simulation = d3.forceSimulation()
        .nodes(Object.values(nodes))
        .force("link", d3.forceLink(liveData).distance(200))
        .force("charge", d3.forceManyBody().strength(-10))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alphaTarget(1)
        .on("tick", ticked);

    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
    
    g = svg.append("g")
        // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),

    node = g.append("g")
        .selectAll(".node");

    link = g.append("g")
        .selectAll(".link");

    svg.on("click", function(){ 
        series();
    })

    for (var i = 0;i<dataset.length; i++){ //this is a for loop and goes through the whole dataset
        keywords.push(dataset[i].name);
    };
    uniqueKeywords = keywords.filter(onlyUnique); //find unique keywords
    //magic function to return only unique values
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    return uniqueKeywords;
}


var n, m, color;
async function makeLinks(uniqueKeywords){

    n = dataset.length; // total number of nodes
    m = uniqueKeywords.length; // number of distinct clusters
    clusters = new Array(m);
    console.log(m);
    console.log(m+uniqueKeywords);

    color = d3.scaleSequential(d3.schemeBlues[m])
        .domain([0, m]);

	links = [];
	for (i=0; i<dataset.length; i++){ //for the whole dataset
	    links.push({"source":dataset[i].id,"target":dataset[i].cnct,"title":dataset[i].name, "type": dataset[i].type}) //set them as sources and targets
	}
    return links;
}

function series(){
    index++;
    console.log(index+"series")

    chooseData(links, index)
        .then(liveData => makeNodes(liveData))
        .then(nodes => restart(liveData, nodes))
}

var chooseData = async(links, whichNum) => {
    console.log(whichNum);
    liveData = [];
    // console.log(links);
    for (var i = 0; i<links.length; i++){
        if(links[i].type==whichNum){ //the cluster to focus on
            console.log("yes");
            liveData.push(links[i])
        }
    }
    console.log(liveData);
    return liveData;
}
function makeNodes(liveData){
    nodes = {};
    liveData.forEach(function(link) {
        console.log(link);
      link.source = nodes[link.source] || (nodes[link.source]= {name: link.source});
      link.target = nodes[link.target] || (nodes[link.target]= {name: link.target});
      //MAYBE JUST ADD IN THE OTHER RELEVANT DATA?
    });  
    console.log(nodes);
    return nodes;  
}

function restart(liveData, nodes){
    var t = d3.transition()
        .duration(750);

    node = node.data(Object.values(nodes), function(d) { return d;});
    node.exit()
        .transition(t)
        .attr("fill","none")
        .attr("r", 1e-6)
        .remove();
    node
        .transition(t)
        .attr("fill",function(d){
            return color(parseInt(d.name))
        })
        .attr("r", function(d){ return parseInt(d.name)*5; });
    node = node.enter().append("circle")
        .attr("r", function(d){ return parseInt(d.name)*5 })
        .attr("fill",function(d){
            return color(parseInt(d.name))
        })
        .merge(node);


    link = link.data(liveData, function(d){ return d; })
    link.exit()
        .transition(t)
        .attr("fill", "none")
        .remove();
    link
        .transition(t)
        .attr("fill",function(d){
            return color(d.type)
        })
    link = link.enter().append("path")
        .attr("fill",function(d){
            return color(d.type)
        })
        .merge(link);

    simulation
        .nodes(Object.values(nodes))
    simulation
        .force("link", d3.forceLink(liveData))
    simulation.alpha(1).restart();
}




function ticked() {
    link.attr("d", linkArc);
    node.attr("transform", transform);
}
function transform(d) {
    node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
    // d.x = Math.max(radius, Math.min(width - radius, d.x));
    // d.y = Math.max(radius, Math.min(height - radius, d.y));   
    // return "translate(" + d.x+ "," + d.y + ")";
}

function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

makeRequest()
    .then(dataset => processPrep(dataset))
    .then(uniqueKeywords => makeLinks(uniqueKeywords))

