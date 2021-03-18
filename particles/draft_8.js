var width, height;

var keywords = [];
var uniqueKeywords;
var keytypes = [];
var uniqueTypes;

var links = [];
var nodes = [];

var svg, g, node, link;
var liveLinks = [];
var liveNodes = [];

var radius = 5;

var dataset;
var liveData = [];
var simulation;

var uk, ut, color, yScale;
var whichNum = 0;
var maxStrength = 0.25;

const makeRequest = async () => {
  try {
    dataset = await d3.json("goalData.json");
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


const processPrep = async(dataset, nodes, links) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2))
        // .alphaTarget(.09) //makes it keep moving endlessly
        // .on("tick", ticked)
        // .stop() //just in case it doesnt stop

    svg = d3.select("body").append("svg")
        .attr("viewBox", [0,0, width, height])
    node = svg.append("g")
        .selectAll("circle");
    link = svg.append("g")
        .selectAll("line");

    svg.on("click", function(){ 
        series();
    })

    //KEYWORDS
    // for (var i = 0;i<nodes.length; i++){ 
    //     keywords.push(nodes[i].name);
    //     keytypes.push(nodes[i].type)
    // };
    // uniqueKeywords = keywords.filter(onlyUnique);
    // uniqueTypes = keytypes.filter(onlyUnique);
    // function onlyUnique(value, index, self) {
    //     return self.indexOf(value) === index;
    // }

    // uk = uniqueKeywords.length;
    // ut = uniqueTypes.length;
    
    // color = d3.scaleSequential(d3.schemeBlues[uk])
    //     .domain([0, uk]);
    // yScale = d3.scaleLinear()
    //     .domain([0, ut])
    //     .range([0,height-100])
    uniqueKeywords = ["bla"]
    return uniqueKeywords;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    // liveLinks = [];
    // liveNodes = [];
    
//PROBLEM IS IT IS ADDING ON IN WEIRD WAYS
    for (var i = 0; i<links.length; i++){
        if(links[i].type==whichNum || links[i].type==whichNum-1){ 
            liveLinks.push(links[i])
        }
        if(links[i].type.length>0){
            for(j=0; j<links[i].type.length; j++){
                if(links[i].type[j]==whichNum || links[i].type[j]==whichNum-1){
                    liveLinks.push(links[i]);
                }
            }
        }
    }
    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].type==whichNum || nodes[i].type==whichNum-1){ 
            liveNodes.push(nodes[i]);
        }
        if(nodes[i].type.length>0){
            for(j=0; j<nodes[i].type.length; j++){
                if(nodes[i].type[j]==whichNum || nodes[i].type[j]==whichNum-1){
                    liveNodes.push(nodes[i]);
                }
            }
        }
    }

    restart(liveLinks, liveNodes);
}

function restart(liveLinks, liveNodes){
    console.log("restart")

    console.log(liveNodes);
    node = node
        .data(liveNodes, function(d){
            return d.id;
        });
    node.exit()
        .remove();
    node = node.enter().append("circle")
        .attr("r", radius)
        .attr("class", function(d){
            return d.type
        })
        .merge(node);


    link = link.data(liveLinks, function(d){
        return d.id;
    })
    link.exit()
        .remove();       
    link = link.enter().append("path")
        .attr("stroke","grey")
        .attr("fill","none")
        .merge(link);

    simulation
        .nodes(liveNodes)
        .force("link").links(liveLinks)

    // simulation
    //     .force("y", d3.forceY(function(d){return yScale(d.type)}))
    // simulation.force("link", d3.forceLink().distance(function(d){
    //         return yScale(d.type);
    //     }).strength(100))

    simulation
        .alpha(.09)
        .on("tick", ticked)
        .restart();
}



function ticked() {
    node.attr("transform", transform);
    link.attr("d", linkArc);
}

function transform(d) {
    // node.attr("transform", function(d){
    //     return "translate(60, 100)"
    // })
    // if(whichNum==2){
        // if(d.type.length>0){
        //     for(i=0; i<d.type.length; i++){
        //         // if(d.type[i]==whichNum){
        //             d.y = d.y+(yScale(d.type[i]));
        //         // }
        //     }
        // } else {
        // if(whichNum = d.type){
            // d.y = yScale(d.type);
            ////WILL HAVE TO DO THIS WITH NESTED LOOPS AND CHOOSE THE FIRST TYPE IN ARRAY
        // } 
    // }
    node
        .attr("cy", function(d) { 
            return d.y; 
        })
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

