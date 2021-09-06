var width, height;

var nodes = [];
var tagTable = [];

var svg, g, node, text, link;
var liveLinks = [];
var liveNodes = [];

var radius = 1;

var dataset;
var liveData = [];
var simulation;

var maxStrength = 0.25;
//hacky way to get the vis started well
var whichNum= -2;

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
var freq = [];
const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i])
        freq.push(dataset.nodes[i].frequency)
        if(dataset.nodes[i].answer==-1){
            topicNodes.push(dataset.nodes[i])
        }
    }

    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
    }
    return nodes;
}

var radScale = d3.scaleLinear()
    .range([radius*2, radius*50])
const processPrep = async(dataset, nodes) => {
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    var poScale = d3.scaleOrdinal()
        .domain(['e', 's', 'w', 'na'])
        .range([10, height/2])

    maxRad = d3.max(freq);
    minRad = d3.min(freq);
    radScale.domain([minRad, maxRad])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).strength(0.9)
            .distance(60).strength(0.3))
        .force('charge', d3.forceManyBody(-100))
        .force('collide', d3.forceCollide().radius(radius*20).strength(0.9))
        // .force('r', d3.forceRadial(function(d){
        //     return poScale(d.loc) //nodes are placed in relation to their halls
        // }).strength(0.3)) //.001
   
    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,-height/2, width, height]);
    node = svg.append('g')
        .selectAll('circle');
    text = svg.append('g')
        .selectAll('text');
    link = svg.append('g')
        .selectAll('line');
    //to trigger progression - this could be time based, for example
    svg.on("click", function(){ 
        series();
    })

    return svg;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    console.log(whichNum)

    //if the index of whichnum matches the question id, let's see those nodes - 
    //so we are progressively adding in q+a to the network
    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].questionID == whichNum){  
            liveNodes.push(nodes[i])
        }
    }

    for (var i = 0; i<liveNodes.length; i++){
        for(j=0; j<liveNodes[i].tags.length; j++){
            for (k=0; k<topicNodes.length; k++){
                if(liveNodes[i].tags[j]==topicNodes[k].tags && liveNodes[i].questionID == whichNum){
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

    node = node
        .data(liveNodes, function(d){
            return d.id;
        })
    node.exit()
        .remove();
    node = node.enter().append('circle')
        .attr('r',function(d){
            if(d.answer==-1){
                return radScale(d.frequency);
            }else {
                return radius*2;
            }
        })
        .attr('fill',function(d){
            if(d.answer==-1){
                //no color scale for main topic tags
                return 'none' 
            }else {
                if(d.loc=='e'){
                    if(d.type=='scale'){
                        var sat = (satScale(d.answer)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 100%)')
                    }
                    if(d.type=='scale-cat'){
                        var sat = (satScale(d.answer*2)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 100%)')
                    }
                    else{
                        return d3.lab('hsl('+yellow+',100%, 100%)')
                    }
                }
            }
        })
        .attr('stroke', function(d){
            if(d.answer==-1){
                return 'white'
            }
            else {
                if(d.loc=='e'){
                    if(d.type=='scale'){
                        var sat = (satScale(d.answer)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 100%)')
                    }
                    if(d.type=='scale-cat'){
                        var sat = (satScale(d.answer*2)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 100%)')
                    }
                    else{
                        return d3.lab('hsl('+yellow+',100%, 100%)')
                    }
                }
            }
        })
        .attr('stroke-width', 1)
        .attr('stroke-opacity', function(d){
            // if(d.answer==-1){
                return opacityScale(d.frequency);
            // }else{
                // return 1;
            // }
        })
        .merge(node);

    text = text
        .data(topicNodes, function(d){
            return d.id
        })
    text.exit()
        .remove();       
    
    text = text.enter()
        .append('text')
        .attr('dy', '.31em') 
        .attr('dx', '.41em') 
        .attr('font-size','8px')
        .attr('fill','white')
        .text(function(d){
            for(i=0; i<tagTable.length; i++){
                if(d.tags==tagTable[i].tagID){
                    return tagTable[i].tag.toUpperCase();
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
        .attr('fill-opacity',.001)
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
    text.attr('x', positionNodes)
}

function positionNodes(d) {
    node
        .attr('class', function(d){
            return 'n'+d.id;
        })
        .attr('cy', function(d) { 
            return d.y;  
        })
        .attr('cx', function(d) {
            return d.x; 
        })
    
    text
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
