var width, height;

var nodes = [];
var tagTable = [];

var svg, g, node, text, link, img;
var liveLinks = [];
var liveNodes = [];
var liveTopics = [];
var liveFirsts = [];

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

var filter;
var topicNodes = [];
var locs = [];
var maxLoc;
const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i])
        if(dataset.nodes[i].first==1){ //if take this off, everything is connected
            topicNodes.push(dataset.nodes[i]) //it looks cool when they are all topic nodes
        }
    }

    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
        locs.push(dataset.tags[i].loc);
    }
    locs.sort(d3.ascending);
    return nodes;
}


var yScale = d3.scaleLinear()
var poScale = d3.scaleLinear()
var xScale = d3.scaleLinear()
var strokeScale = d3.scaleLinear()
var dashScale = d3.scaleLinear()
var symSize = d3.scaleLinear()
const processPrep = async(dataset, nodes) => {
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    maxLoc = d3.max(locs);




    symSize
        .domain([0, maxLoc])
        .range([symWidth*5, symWidth/5])
    yScale
        .domain(locs)
        .range([-290,-210])
    
    poScale
        .domain([0, maxLoc])
        .range([-100,100])

    xScale
        .domain([0,34])
        .range([-width/2,width/2])

    strokeScale
        .domain([0, maxLoc])
        .range([1, 10])
    dashScale
        .domain([0, maxLoc])
        .range([10, 1])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id)//.strength(0.01)
            .distance(2).strength(0.3))
        .force('center', d3.forceCenter(0,0))
        .force('charge', d3.forceManyBody(-100).strength(0))
        .force('collide', d3.forceCollide().radius(symWidth).strength(0))
        // .force('r', d3.forceRadial(function(d){
        //     return poScale(d.type) 
        // }).strength(0.9)) //.001

    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,-height/2, width, height]);

    img = svg.append('g')
        .selectAll('image');

    node = svg.append('g')
        .selectAll('circle');
    text = svg.append('g')
        .selectAll('text');
    link = svg.append('g')
        .selectAll('line');

    document.onkeydown = checkKey;
    function checkKey(e) {
        e = e || window.event;
        if (e.keyCode == '39') {
           // right arrow
           series();
        }
    }
    return svg;
}

function zoomed({ transform }) {
    svg.attr('transform', transform)
}

function series(){
    whichNum++;

    chooseData(whichNum)
        .then(liveNodes => linkUp(liveNodes, liveTopics))
        .then(liveLinks => restart(liveLinks, liveNodes, liveFirsts, whichNum))
}

const chooseData = async(whichNum)=>{
    for (var i = 0; i<topicNodes.length; i++){
        if(topicNodes[i].type == whichNum){  
            liveTopics.push(topicNodes[i])
        }
        if(topicNodes[i].type == whichNum && topicNodes[i].first==1){  
        // if(topicNodes[i].first==1){  
            liveFirsts.push(topicNodes[i])
        }
    }
    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].type == whichNum){  
            liveNodes.push(nodes[i])
        }
    }
    return liveNodes;
}
const linkUp = async(liveNodes, topicNodes)=>{
    for (var i = 0; i<liveNodes.length; i++){
        for(j=0; j<liveNodes[i].tags.length; j++){
            for (k=0; k<liveTopics.length; k++){
                if((liveNodes[i].tags[j]==liveTopics[k].tags) && (liveNodes[i].type == whichNum)){
                // if(liveNodes[i].tags[j]==liveTopics[k].tags){
                    liveLinks.push({
                        'source': liveNodes[i].id,
                        'sourceType': liveNodes[i].type,
                        'target': liveTopics[k].id,
                        'targetType': liveTopics[k].type,
                        'sourceSym': liveNodes[i].symb,
                        'targetSym': liveTopics[k].symb,                        
                        'sourceTags': liveNodes[i].tags,
                        'targetTags': liveTopics[k].tags,  
                        'id':liveNodes[i].id
                    })
                }
             }
        }
    }
    return liveLinks;
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

var photoWidth = 100;

var fillColor = 'black';
function restart(liveLinks, liveNodes, liveFirsts, whichNum){
    var opa = .6;
    var minOpa = .1;
    var maxOpa = .9;
    var minOpaNode = opa;

    node = node
        .data(liveNodes, function(d){
            return d.id;
        })
    node.exit()
        .remove();
    node = node.enter().append('image')
        .attr('class', function(d){
            return d.id}) //'sym')
        .attr('xlink:href', function(d){
            var max = d.symbNum;
            var initialRandom = Math.random();
            var multiplied = initialRandom * max;
            var answer = Math.floor(multiplied);
            return d.symb+'/'+answer+'.png';
        })
        .attr('transform','translate('+ -symWidth/2 +','+ -symHeight/2 +')')
        .attr('width', function(d){
            return symWidth+'px'
        })
        .attr('height', function(d){
            return symHeight+'px'
        })
        .merge(node);
 

    node
        .transition()
        .duration(4000)
        .attr('width', function(d){
            if(whichNum>1 && d.type!=whichNum && d.symb=='symb/clouds/low' && d.first!=1){
                return 0+'px'
            }
            if(d.type!=whichNum && d.symb=='symb/comms' && d.first!=1){
                return 0+'px'
            }
            if(d.type!=whichNum && d.symb=='symb/sensors' && d.first!=1){
                return 0+'px'
            }
            if(d.type!=whichNum && d.symb=='symb/storage' && d.first!=1){
                return 0+'px'
            }
            if(d.type!=whichNum && d.symb=='symb/process' && d.first!=1){
                return 0+'px'
            }
            else{
                return symWidth+'px';
            }
        })



    // text = text
    //     .data(liveFirsts, function(d){
    //         return d.id
    //     })
    // text.exit()
    //     .remove();
    // text = text.enter()
    //     .append('text')
    //     .attr('font-size','10px')
    //     .attr('fill',fillColor)
    //     .text(function(d){
    //         for(i=0; i<tagTable.length; i++){
    //             //only want 1 instance
    //             if(d.tags==tagTable[i].tagID && d.first==1){
    //                 return tagTable[i].tag.toUpperCase();
    //             }
    //         }
    //     })
    //     .merge(text); 



    link = link
        .data(liveLinks, function(d){
            return d.id;
        })
    link.exit()
        .remove()

    link = link.enter().append('path')
        .attr('class', 'link')
        .attr('stroke',fillColor)
        .attr('stroke-width',.3)
        .attr('stroke-opacity',.5)
        .attr('fill','none')
//add if not animating
        .attr('stroke-dasharray',function(d){
            var adjst;
            if(d.sourceTags.length==1){
                adjst = d.sourceTags-1;
            }else{
                adjst = (d.sourceTags[0])-1;
            }
            return strokeScale(dataset.tags[adjst].loc)+","+dashScale(strokeScale(dataset.tags[adjst].loc))
        })
        .attr('stroke-dashoffset','0')
        .merge(link);


//only if you are CO2 and other human made things?
    // drawOut()
    function drawOut(){
        //IF YOU ARE DEGRADING, THE LINKS WILL BE WEIRD
        //this is tied to the whichNum in terms of sequence
        //and tied to the symb in terms of topical focus
        link.attr('class',function(d){
            if(d.sourceType==whichNum){
                d3.select(this)
                    .transition()
                    .duration(5000)
                    .attr('stroke-dashoffset','450')
                    .attr('stroke-dasharray','1,450')
                    .on('end',drawIn)
            }else{
                d3.select(this)
                    .attr('stroke-dasharray','1,10')
                    .attr('stroke-dashoffset','0')
            }
        })        
    }

    function drawIn(){
        link.attr('class',function(d){
            if(d.sourceType==whichNum){
                d3.select(this)
                    .transition()
 //maybe duration could have more to do with 
 //the character of the item
                    .duration(6000)
                    .ease(d3.easeCubicInOut,1)
                    .ease(d3.easeElasticOut.amplitude(1).period(2))
                    .attr('stroke-dasharray','1,10')
                    .attr('stroke-dashoffset','0')
                    .on('end',drawOut)
            }else{
                d3.select(this)
                    .attr('stroke-dasharray','1,10')
                    .attr('stroke-dashoffset','0')
            }
        }) 
    }


    img = img
        .data(liveFirsts, function(d){
            return d;
        })
    img.exit()
        .remove();
    img = img.enter()
        .append('svg:image')
        .attr('class','backImg')
        .attr('xlink:href', function(d) {
                if(d.first==1){
                    return 'img/TOC/'+d.id+'.png';
                }else{}
        })
        .attr('width', function(d){
            return photoWidth+'px' 
        })
        .attr('clip-path', function(d){
            if(d.type==3){
                return 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)';
            }else{ return 'none' }
        })
        .merge(img);

    // node.attr('class',function(d){
    //     if(d.type==whichNum){
    //         d3.select(this)
    //             .transition()
    //             .duration(2000)
    //             .ease(d3.easeCubicInOut,1)
    //             .ease(d3.easeElasticOut.amplitude(1).period(2))
    //             .attr('width',function(d){
    //                 if(d.tags.length==1){
    //                     var adjst = d.tags-1;
    //                     return (symSize(dataset.tags[adjst].loc))+'px'
    //                 }else{
    //                     var adjst = (d.tags[0])-1;
    //                     return (symSize(dataset.tags[adjst].loc))+'px'
    //                 }
    //             })
    //             .attr('height',function(d){
    //                 if(d.tags.length==1){
    //                     var adjst = d.tags-1;
    //                     return (symSize(dataset.tags[adjst].loc))+'px'
    //                 }else{
    //                     var adjst = (d.tags[0])-1;
    //                     return (symSize(dataset.tags[adjst].loc))+'px'
    //                 }
    //             })
    //         }
    //     })


    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks);


    if(whichNum==1){
        //first simulation, nothing happening
        //can simulation get smaller the more clicks
        // simulation
        //     .force('y', d3.forceY(function(d){
        //         if(d.tags.length==1){
        //             var adjst = d.tags-1;
        //             return yScale(dataset.tags[adjst].loc)
        //         }else{
        //             var adjst = (d.tags[0])-1;
        //             return yScale(dataset.tags[adjst].loc)
        //         }
        //     }).strength(1)) 
    }

    if(whichNum>1 && whichNum<33){

        simulation
            .force('collide', d3.forceCollide().radius(function(d){
                if(d.first==1){
                    return symWidth*2;
                }
                else{
                    return symWidth;
                }
            }).strength(.8))
            .force('charge', d3.forceManyBody(function(d){
                if(d.symb=='symb/clouds/low'){
                    return -500;
                }else{ 
                    return -100 
                }}).strength(.5))
            .force('y', d3.forceY(function(d){
                if(d.tags.length==1){
                    var adjst = d.tags-1;
                    return yScale(dataset.tags[adjst].loc)
                }else{
                    var adjst = (d.tags[0])-1;
                    return yScale(dataset.tags[adjst].loc)
                }
            }).strength(1)) 
    }
    if(whichNum==34){
        simulation
            .force('collide', d3.forceCollide().radius(function(d){
                if(d.first==1){
                    return symWidth
                }else{
                    return symWidth/2;
                }
            }).strength(.8))
            .force('charge', d3.forceManyBody(function(d){
                if(d.symb=='symb/clouds/low'){
                    return -500;
                }else{
                    return -100;  
                }
            }).strength(.1))
            .force('x', d3.forceX(function(d){
                    return xScale(d.type)
            }).strength(1)) 
            .force('y', d3.forceY().strength(.1)) 
    }
    if(whichNum==35){
        simulation
            .force('link', d3.forceLink().id(d => d.id)//.strength(0.01)
                .distance(2).strength(0.3))
            .force('center', d3.forceCenter(0,0))
            .force('charge', d3.forceManyBody(-100).strength(0))
            .force('collide', d3.forceCollide().radius(symWidth).strength(0))
            .force('r', d3.forceRadial(function(d){
                return poScale(d.type) 
            }).strength(1))
            .force('x', d3.forceX().strength(0)) 
            .force('y', d3.forceY().strength(0)) 
    }
    simulation
        .alpha(.05)
        .on('tick', ticked)
        .restart()
}

function ticked() {
    img.attr('class', positionNodes);
    // text.attr('class', positionNodes);
    node.attr('class', positionNodes);
    link.attr('d', makeLinks)
}

function positionNodes(d) {
    img
        .attr('class', function(d){
            return 'img'
        }) 
        .attr('y', function(d,i) { 
            return d.y-photoWidth/2; 
        })
        .attr('x', function(d) {
            return d.x-photoWidth/2; 
        })
    // text
    //     .attr('class', function(d){
    //         return 'txt'
    //     }) 
    //     .attr('y', function(d,i) { 
    //         return d.y; 
    //     })
    //     .attr('x', function(d) {
    //         return d.x; 
    //     })
    node
        .attr('class', function(d){
            return d.id
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
        dr = Math.sqrt(dx * dx + dy * dy); //possible to play with this curve?
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
}

makeRequest()
    .then(dataset => getNodes(dataset))
    .then(nodes => processPrep(dataset, nodes))
