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
var whichNum=0;

const makeRequest = async () => {
  try {
    dataset = await d3.json('rwg/rwg_qtypes.json');
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error('Failed to load data')
  }
}

const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i]);
    }
    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
    }
    return nodes;
}

const processPrep = async(dataset, nodes) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    var poScale = d3.scaleOrdinal()
        .domain(['e', 's', 'w', 'na'])
        .range([10, height/2])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).strength(0.100001))
            // .distance(20).strength(0.1))
        .force('charge', d3.forceManyBody(-100))
        // .force('center', d3.forceCenter(0,height/2)) 
        .force('collide', d3.forceCollide().radius(radius).strength(0.1))
        .force('r', d3.forceRadial(function(d){
            return poScale(d.loc) //nodes are placed in relation to their halls
        }).strength(0.01))
   
    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,-height/2, width, height]);

    node = svg.append('g')
        .selectAll('circle');
    text = svg.append('g')
        .selectAll('text');
    link = svg.append('g')
        .selectAll('line');

    return svg;
}

var mainNodes = [];
var answerNodes = [];
function chooseData(){
    console.log(whichNum)

    for (var i = 0; i<nodes.length; i++){
        liveNodes.push(nodes[i])
    }

    for (var i = 0; i<nodes.length; i++){
        if(nodes[i].answer==-1){
            mainNodes.push(nodes[i]);
        }else{
            answerNodes.push(nodes[i]);
        }
    }

    for (var i = 0; i<answerNodes.length; i++){
        for(j=0; j<answerNodes[i].tags.length; j++){
            for (k=0; k<mainNodes.length; k++){
                if(answerNodes[i].tags[j]==mainNodes[k].tags){
                    liveLinks.push({
                        "source": answerNodes[i].id,
                        "target": mainNodes[k].id
                    })
                }
             }
        }
    }

    restart(liveLinks, liveNodes, whichNum);
}


function restart(liveLinks, liveNodes, whichNum){
    console.log('restart')
    
    var satScale = d3.scaleLinear()
        .domain([1,10])
        .range([0, 100])
    var yellow = 60;

    node = node
        .data(liveNodes, function(d){
            return d.id;
        })
    node.exit()
        .remove();
    node = node.enter().append('circle')
        .attr('r',function(d){
            if(d.answer==-1){
                return radius*5
            }else {
                return radius
            }
        })
        .attr('fill',function(d){
            if(d.answer==-1){
                return 'none' //no color scale for main topic tags
            }else {
                if(d.loc=='e'){
                    if(d.type=='scale'){
                        var sat = (satScale(d.answer)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 50%)')
                    }
                    if(d.type=='scale-cat'){
                        var sat = (satScale(d.answer*2)).toString()
                        return d3.lab('hsl('+yellow+','+sat+'%, 50%)')
                    }
                    else{
                        return d3.lab('hsl('+yellow+',100%, 50%)')
                    }
                }
            }
        })
        .attr('stroke',function(d){
            if(d.answer==-1){
                return 'white'
            }else {
                return 'none'
            }
        })
        .merge(node);

    text = text
        .data(liveNodes, function(d){
            return d.id;
        })
    text.exit()
        .remove();       
    text = text.enter()
        .filter(function(d) { 
            if(d.answer==-1){
                return d;
            }
        })
        .append('text')
        .attr('dy', '.31em') 
        .attr('dx', '.41em') 
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
        .attr('stroke','white')
        .attr('stroke-width',.1)
        .attr('fill','white')
        .attr('fill-opacity',.001)
        .merge(link);


    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks)

    simulation
        .alpha(.6)
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
    .then(svg => chooseData())

