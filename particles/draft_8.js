var width, height;

var keywords = [];
var uniqueKeywords;
var keytypes = [];
var uniqueTypes;

var links = [];
var nodes = [];

var svg, g, node, link, img, defs;
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
        .force("link", d3.forceLink().id(d => d.id).distance(100).strength(0.1))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX(width/2).strength(1))
        .force("center", d3.forceCenter(width / 2, height / 2))

    svg = d3.select("body").append("svg")
        .attr("viewBox", [0,0, width, height])
    img = svg.append("g")
        .selectAll("image");
    node = svg.append("g")
        .selectAll("circle");
    link = svg.append("g")
        .selectAll("line");

    defs = svg.append('defs').selectAll("masks")

    svg.on("click", function(){ 
        series();
    })

    //KEYWORDS
    for (var i = 0;i<nodes.length; i++){ 
        keywords.push(nodes[i].name);

        if(nodes[i].type.length>0){
            for(j=0; j<nodes[i].type.length; j++){
                keytypes.push(nodes[i].type[j])
            }
        } else{
            keytypes.push(nodes[i].type)
        }
    };
    uniqueKeywords = keywords.filter(onlyUnique);
    uniqueTypes = keytypes.filter(onlyUnique);
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    uk = uniqueKeywords.length;
    utMax = d3.max(uniqueTypes);
    utMin = d3.min(uniqueTypes);
    // color = d3.scaleSequential(d3.schemeBlues[uk])
        // .domain([0, uk]);
    yScale = d3.scaleLinear()
        .domain([utMin, utMax])
        .range([10,height/2])
    uniqueKeywords = ["bla"]
    return uniqueKeywords;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    console.log(whichNum)
    // liveLinks = [];
    // liveNodes = [];
    
//option to do it one by one
    // for (var i = 0; i<links.length; i++){
    //     if(links[i].type==whichNum || links[i].type==whichNum-1){ //only the one before
    //         liveLinks.push(links[i])
    //     }
    //     if(links[i].type.length>0){
    //         for(j=0; j<links[i].type.length; j++){
    //             if(links[i].type[j]==whichNum || links[i].type[j]==whichNum-1){ // access only one before or ones before with same types
    //                 liveLinks.push(links[i]);
    //             }
    //         }
    //     }
    // }
//option to do it as adding on to all previous
    for (var i = 0; i<links.length; i++){
        if(links[i].type==whichNum){
            liveLinks.push(links[i])
        }
        if(links[i].type.length>0){
            if(links[i].type[0]==whichNum){
                liveLinks.push(links[i]);
            }
        }
    }
    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].type==whichNum){ 
            liveNodes.push(nodes[i]);
        }
        if(nodes[i].type.length>0){
            if(nodes[i].type[0]==whichNum){
                liveNodes.push(nodes[i]);
            }
        }
    }
//all immediately on click
// liveLinks = links;
// liveNodes = nodes;
    restart(liveLinks, liveNodes, whichNum);
}

var imgWidth = 50;
var imgHeight = 50;
function restart(liveLinks, liveNodes, whichNum){
    console.log("restart")
    console.log(liveNodes);

    node = node
        .data(liveNodes, function(d){
            return d.id;
        });
    node.exit()
        .remove();
    // node = node.enter().append("circle")
    //     .attr("r", radius)
    //     .attr("fill","white")
    //     .attr("class", function(d){
    //         return d.id+"_"+d.type;
    //     })
    //     .merge(node);
    node = node.enter().append("image")
        .attr("class", function(d){
            return d.id+"_"+d.type;
        })
        .attr("xlink:href", function(d){
            return d.symb;
        })
        .attr("width", "20px")
        .attr("height", "20px")
        .merge(node);

    link = link.data(liveLinks, function(d){
        return d.id;
    })
    link.exit()
        .remove();       
    link = link.enter().append("path")
        .attr("stroke","white")
        .attr("fill","none")
        .merge(link);

    simulation
        .nodes(liveNodes)
        .force("link").links(liveLinks)

    simulation
        .force("y", d3.forceY(function(d){
            if(d.type.length>0){
                return yScale(d.type[0])
            }
            if(d.type.length==undefined){
                return yScale(d.type)
            }
        }).strength(1))

    simulation
        .alpha(.09)
        .on("tick", ticked)
        .restart()




    // define the clipPath
    // defs = defs.data(liveNodes, function(d){
    //     return d;
    // }).enter().append("clipPath")
    //     .filter(function(d) { 
    //         if(d.img==undefined){ } 
    //         if(d.img!=undefined){ return d }
    //     })
    //     .attr('id', 'circle-clip') // give the clipPath an ID
    //     .append('circle')
    //     .attr('cx', 100)
    //     .attr('cy', function(d){
    //         console.log(d.y)
    //         return d.y;
    //     })
    //     .attr('r', 100)

    img = img
        .data(liveNodes, function(d){
            return d.img;
        })
        .attr("opacity", function (d){
            if(d.type.length>0){
                if(d.type[0]==whichNum){
                    return .5;
                }else{
                    return .2;
                }
            }
            if(d.type.length==undefined){
                if(d.type==whichNum){
                    return .5;
                }else{
                    return .2;
                }
            }
        })
        // .attr("y", function(d){
        //     return 0;
        // })
        // .attr("clip-path", "url(#circle-clip)")

    img.exit() //.transition().attr("opacity",.1)
        .remove();
    img = img.enter().append("svg:image")
        .attr("xlink:href", function(d) {
            return d.img;
        })
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 1200+'px')
        .attr("height", 1000+'px')
        .attr("opacity",.5)
        // .attr("clip-path","none")
        .merge(img);
}

function ticked() {
    node.attr("transform", transform);
    link.attr("d", linkArc);
}

function transform(d) {
    node
        .attr("y", function(d) { 
            return d.y; 
        })
        .attr("x", function(d) { return d.x; })
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

