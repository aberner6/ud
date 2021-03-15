var width, height;

var keywords = [];
var uniqueKeywords;

var links = [];
var nodes = [];

var svg, g, node, link;
var liveLinks = [];
var liveNodes = [];

var radius = 2;

var dataset;
var liveData = [];
var simulation;

const makeRequest = async () => {
  try {
    dataset = await d3.json("newFormat.json");
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error("Failed to load data")
  }
}

const nodesLinks = async(dataset)=>{
    for (var i = 0; i<dataset.links.length; i++){
        links.push(dataset.links[i]);
    }
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i]);
    }
    console.log(nodes);
    return nodes;
}

var n, m, color;
var whichNum = 0;
var maxStrength = 0.25;
const processPrep = async(dataset, nodes, links) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaTarget(.09)
        .on("tick", ticked);

    svg = d3.select("body").append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("fill","grey")
    node = svg.append("g")
        .selectAll("circle");
    link = svg.append("g")
        .selectAll("line");

    svg.on("click", function(){ 
        series();
    })


    //KEYWORDS
    for (var i = 0;i<nodes.length; i++){ 
        keywords.push(nodes[i].name);
    };
    uniqueKeywords = keywords.filter(onlyUnique);
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    n = dataset.length;
    m = uniqueKeywords.length;
    color = d3.scaleSequential(d3.schemeBlues[m])
        .domain([0, m]);

    return uniqueKeywords;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    liveLinks = [];
    liveNodes = [];
    for (var i = 0; i<links.length; i++){
        if(whichNum==1){ 
            liveLinks.push(links[i])
        }
        if(whichNum==2){ 
            if(links[i].type==whichNum){ 
                liveLinks.push(links[i])
            }
            if(links[i].type.length>0){
                for(j=0; j<links[i].type.length; j++){
                    if(links[i].type[j]==whichNum){
                        liveLinks.push(links[i]);
                    }
                }
            }
        }
        if(whichNum==3){ 
            liveLinks.push(links[i])
        }
    }
    for (var i = 0; i<nodes.length; i++){
        if(whichNum==1){ 
            liveNodes.push(nodes[i])
        }
        if(whichNum==2){
            if(nodes[i].type==whichNum){ 
                liveNodes.push(nodes[i]);
            }
            if(nodes[i].type.length>0){
                for(j=0; j<nodes[i].type.length; j++){
                    if(nodes[i].type[j]==whichNum){
                        liveNodes.push(nodes[i]);
                    }
                }
            }
        }
        if(whichNum==3){ 
            liveNodes.push(nodes[i]);
        }
    }
    restart(liveLinks, liveNodes);
}

function restart(liveLinks, liveNodes){
    console.log("restart")

    node = node
        .data(liveNodes, function(d){
            return d.id;
        });
    node.exit()
        .remove();
    node = node.enter().append("circle")
        .attr("r", 5)
        .merge(node);


    link = link.data(liveLinks, function(d){
        return d;
    })
    link.exit()
        .remove();       
    link = link.enter().append("path")
        .attr("stroke","grey")
        .attr("fill","none")
        .merge(link);

    simulation.nodes(liveNodes);
    simulation.force("link").links(liveLinks);
    simulation.alpha(.09)
    // .restart();
    .on("tick", ticked)
    .restart();
}



function ticked() {
    node.attr("transform", transform);
    link.attr("d", linkArc);
}
function transform(d) {
    if(whichNum==2){
        if(d.type.length>0){
            for(i=0; i<d.type.length; i++){
                if(d.type[i]==whichNum){
                    d.y = height/2;
                }
            }
        } 
    }
    node.attr("cy", function(d) { return d.y; })
        .attr("cx", function(d) { return d.x; })
}
function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

makeRequest()
    .then(dataset => nodesLinks(dataset))
    .then(nodes => processPrep(dataset, nodes, links))

