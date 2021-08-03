//global variables
var width, height;

var keywords = [];
var uniqueKeywords;

var links = [];
var nodes = {};

var svg, vis;
var circ, path;

var radius = 2;
var simulation;

var padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 8;

var dataset;
var liveData;

// get the data
const makeRequest = async () => {
  try {
    dataset = await d3.csv("mini_train.csv");
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
    svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    vis = svg
        .append('svg:g')
        .attr("transform","translate("+ 0 + "," + 0 + ")");

    svg.on("click", function(){ 
        series();
    })
    circ = svg.append("g").selectAll(".circle")
    path = svg.append("g").selectAll(".path"); //?

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

    color = d3.scaleSequential(d3.interpolateRainbow)
        .domain(d3.range(m));

	links = [];
	for (i=0; i<dataset.length; i++){ //for the whole dataset
	    links.push({"source":dataset[i].id,"target":dataset[i].type,"title":dataset[i].name, "ty": dataset[i].ty}) //set them as sources and targets
	}
    return links;
}

function series(){
    index++;
    console.log(index+"series")

    chooseData(links, index)
        .then(liveData => makeNodes(liveData))
        .then(nodes => restart(liveData, nodes))
    // restart(chooseData(links, index));
}

var chooseData = async(links, whichNum) => {
    console.log(whichNum);
    liveData = [];
    // console.log(links);
    for (var i = 0; i<links.length; i++){
        if(links[i].ty==whichNum){ //the cluster to focus on
            liveData.push(links[i])
        }
    }
    console.log(liveData);
    return liveData;
}
function makeNodes(liveData){
    nodes = {};
    liveData.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = {sourceTitle: link.title, sourceId: link.source, sourceTY: link.ty});
      link.target = nodes[link.target] || (nodes[link.target] = {targetTitle: link.title, targetId: link.source, targetTY: link.ty});
    });  
    console.log(nodes);
    return nodes;  
}

function restart(liveData){

    console.log(liveData)

    simulation = d3.forceSimulation()
        .nodes(Object.values(nodes))
        .force("link", d3.forceLink(liveData))
        .force("charge", d3.forceManyBody().strength(-10))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .on("tick", ticked)

    // path = path.data(liveData);

    path.exit()
        .transition()
        .attr("fill","none")
        .remove();
    path = vis.selectAll("path").data(liveData)
        .enter().append("path")
        .attr("class", function(d){
            console.log(d.title)
            return d.title;
        })
        .attr("fill","grey")
        .merge(path);


    // circ = circ.data(Object.values(nodes));
    circ.exit()
        .transition()
        .attr("fill","none")
        .remove();

    circ = vis.selectAll("circle").data(Object.values(nodes))
        .enter().append("circle")
        .attr("class", "circle")
        .attr("r", 10)
        .attr("fill", function(d){
            console.log(d);
            return "pink"
        })
        .merge(circ);
}




function ticked() {
    path.attr("d", linkArc);
    circ.attr("transform", transform);
}
function transform(d) {
    d.x = Math.max(radius, Math.min(width - radius, d.x));
    d.y = Math.max(radius, Math.min(height - radius, d.y));   
    return "translate(" + d.x+ "," + d.y + ")";
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

