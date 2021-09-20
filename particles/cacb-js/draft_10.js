var width, height;

var nodes = [];
var tagTable = [];

var svg, g, node, text, link;
var liveLinks = [];
var liveNodes = [];
var liveTopics = [];

var radius = 30;
var symWidth = radius;
var symHeight = radius;

var dataset;
var liveData = [];
var simulation;

var maxStrength = 0.25;
//hacky way to get the vis started well
var whichNum= 0;

const makeRequest = async () => {
  try {
    dataset = await d3.json('cacb-data/sep6.json');
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error('Failed to load data')
  }
}

var topicNodes = [];
var types = [];
const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i])
        // if(dataset.nodes[i].first==0){
            topicNodes.push(dataset.nodes[i]) //it looks cool when they are all topic nodes
        // }
    }

    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
        types.push(dataset.tags[i].type);
    }
    return nodes;
}


var poScale = d3.scaleOrdinal()

const processPrep = async(dataset, nodes) => {
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    poScale
        .domain(types)
        .range([10, height/2])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).strength(0.01)
            .distance(height/2).strength(0.3))
        // .force('charge', d3.forceManyBody(-100))
        // .force('collide', d3.forceCollide().radius(radius*2).strength(0.1))
        // .force('r', d3.forceRadial(function(d){
        //     return poScale(d.type) //nodes are placed in relation to their halls
        // }).strength(0.9)) //.001
   
    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,-height/2, width, height]);
    node = svg.append('g')
        .selectAll('circle');
    text = svg.append('g')
        .selectAll('text');
    link = svg.append('g')
        .selectAll('line');
    svg.on("click", function(){ 
        series();
    })

    return svg;
}

function zoomed({ transform }) {
    svg.attr('transform', transform)
}

function series(){
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    console.log(whichNum)

    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].type == whichNum){  
            liveNodes.push(nodes[i])
        }
    }
    for (var i = 0; i<topicNodes.length; i++){
        if(topicNodes[i].type == whichNum){  
            liveTopics.push(topicNodes[i])
        }
    }

    for (var i = 0; i<liveNodes.length; i++){
        for(j=0; j<liveNodes[i].tags.length; j++){
            for (k=0; k<topicNodes.length; k++){
                if(liveNodes[i].tags[j]==topicNodes[k].tags && liveNodes[i].type == whichNum){
                    liveLinks.push({
                        "source": liveNodes[i].id,
                        "target": topicNodes[k].id,
                        "id":liveNodes[i].id
                    })
                }
             }
        }
    }

    restart(liveLinks, liveNodes, whichNum);
}


const opacityScale = d3.scaleLinear()
    .domain([0,100])
    .range([0, 1])
const satScale = d3.scaleLinear()
    .domain([1,10])
    .range([255, 255])
const rad2Scale = d3.scaleLinear()
    .domain([1,10])
    .range([1, 50])
const yellow = 255;
function restart(liveLinks, liveNodes, whichNum){
    console.log('restart')

    // node = node
    //     .data(liveNodes, function(d){
    //         return d.id;
    //     })
    // node.exit()
    //     .remove();
    // node = node.enter().append('circle')
    //     .attr('r',function(d){
    //         return radius; //to be changed to be in accordance with is this first or not
    //     })
    //     .attr('fill',function(d){
    //         if(d.tags.length>1){
    //             return 'pink'
    //         }else{
    //             return 'white'; //to be changed to be in accordance with is this first or not  
    //         }
    //     })
    //     .attr('opacity',.5)
    //     .merge(node);
    node = node
        .data(liveNodes, function(d){
            return d.id;
        })
    node.exit()
        .remove();

    node = node.enter().append('image')
        .attr('class', function(d){
            return 'n'+d.id;
        })
        .attr("xlink:href", function(d){
            var max = d.symbNum;
            var initialRandom = Math.random();
            var multiplied = initialRandom * max;
            var answer = Math.floor(multiplied);

            return d.symb+'/'+answer+'.png';
        })
        .attr("transform","translate("+ -symWidth/2 +","+ -symHeight/2 +")")
        .attr("width", symWidth+"px")
        .attr("height", symHeight+"px")
        .merge(node);


    // img = img
    //     .data(liveNodes, function(d){
    //         return d;
    //     })
    //     .attr("opacity", function (d){
    //             if(d.type==whichNum){
    //                 return .4;
    //             }else{
    //                 return .2;
    //             }
    //     })
    // img.exit()
    //     .remove();
    // img = img.enter()
    //     .filter(function(d) { 
    //         if(d.img!=undefined && d.first ==1){
    //             if(d.type==whichNum){
    //                 return d;
    //             }
    //         }
    //     })
    //     .append("svg:image")
    //     .attr("xlink:href", function(d) {
    //         return d.img;
    //     })
    //     .attr("x", -width/2)
    //     .attr("y", -100)
    //     .attr("width", 1200+'px')
    //     .attr("height", 1000+'px')
    //     .attr("opacity",.4)
    //     .merge(img);

    text = text
        .data(liveTopics, function(d){
            return d.id
        })
    text.exit()
        .remove();       
    
    text = text.enter()
        .append('text')
        .attr('dy', '.31em') 
        .attr('dx', '.41em') 
        .attr('font-size','1px')
        .attr('fill','white')
        .text(function(d){
            for(i=0; i<tagTable.length; i++){
                if(d.tags==tagTable[i].tagID){
                    return tagTable[i].tag.toUpperCase();
                }
                if(d.tags.length>1){
                    for(j=0; j<d.tags.length; j++){
                        if(d.tags[j] == tagTable[i].tagID){
                            return tagTable[i].tag.toUpperCase();                            
                        }
                    }
                }
            }
        })
        .merge(text);    

    link = link
        .data(liveLinks, function(d){
            return d.id;
        })
    link.exit()
        .remove();       
    link = link.enter().append('path')
        .attr('class', function(d){
            return 'l'+d.id;
        })
        .attr('stroke','white')
        .attr('stroke-width',.1)
        .attr('fill','white')
        .attr('fill-opacity',.09)
        .merge(link);


    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks)
    // if (whichNum==5){
    //     simulation
    //         .force("y", d3.forceY(function(d){
    //             return yScale(d.type)
    //         }).strength(.1)) 
    // }else{
    //     simulation
    //         .force("y", d3.forceY(function(d){
    //             if (whichNum==3 && d.type==2){
    //                 return yScale(1);
    //             }
    //             else{
    //                 return yScale(d.type)
    //             }
    //         }).strength(1)) 
    // }
    simulation
        .alpha(.09)
        .on('tick', ticked)
        .restart()
}

function ticked() {
    node.attr('class', positionNodes);
    link.attr('d', makeLinks);
    text.attr('class', positionNodes)
}

function positionNodes(d) {
    node
        .attr('class', function(d){
            return 'n'+d.id;
        })
        .attr('y', function(d) { 
            return d.y;  
        })
        .attr('x', function(d) {
            return d.x; 
        })
    
    text
        .attr('class', function(d){
            return 't'+d.id;
        })
        .attr('y', function(d) { 
            return d.y;  
        })
        .attr('x', function(d) {
            return d.x; 
        })
}
function makeLinks(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
}

makeRequest()
    .then(dataset => getNodes(dataset))
    .then(nodes => processPrep(dataset, nodes))
