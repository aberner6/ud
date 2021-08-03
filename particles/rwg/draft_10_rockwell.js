var width, height;

var keywords = [];
var uniqueKeywords;
var uk;

var links = [];
var nodes = [];

var svg, g, node, link, img;
var liveLinks = [];
var liveNodes = [];

var radius = 1;

var dataset;
var liveData = [];
var simulation;

var whichNum = 0;
var maxStrength = 0.25;

var symWidth = 10;
var symHeight = 10;

const makeRequest = async () => {
  try {
    dataset = await d3.json('rwg/rwg.json');
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error('Failed to load data')
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
        .force('link', d3.forceLink().id(d => d.id))//.distance(400).strength(0.1))
        // .force('charge', d3.forceManyBody(-10))
        // .force('x', d3.forceX(0).strength(.1))
        .force('center', d3.forceCenter(0,height/2)) 
        // .force('collide', d3.forceCollide().radius(radius).strength(0.001))

    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,0, width, height])
        .style('background-color','#000000e6')

    node = svg.append('g')
        .selectAll('circle');
    link = svg.append('g')
        .selectAll('line');

    return svg;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}
function chooseData(whichNum){
    console.log(whichNum)
    for (var i = 0; i<links.length; i++){
        liveLinks.push(links[i]);
    }

    for (var i = 0; i<nodes.length; i++){
        liveNodes.push(nodes[i])
    }
    restart(liveLinks, liveNodes, whichNum);
}

function restart(liveLinks, liveNodes, whichNum){
    console.log('restart')
    console.log(liveNodes);

    node = node
        .data(liveNodes, function(d){
            return d.id;
        })
    node.exit()
        .remove();

    node = node.enter().append('circle')
        .attr('class', function(d){
            return 'c'+d.id;
        })
        .attr('r',radius)
        .attr('fill','white')
        .merge(node);

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
        .attr('fill-opacity',.1)
        .merge(link);

    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks)

    simulation
        .alpha(.09)
        .on('tick', ticked)
        .restart()
}

function ticked() {
    node.attr('class', transform);
    link.attr('d', linkArc);
}

function transform(d) {
    node
        .attr('cy', function(d) { 
            return d.y;  
        })
        .attr('cx', function(d) {
            return d.x; 
        })
}
function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
}

makeRequest()
    .then(dataset => nodesLinks(dataset))
    .then(nodes => processPrep(dataset, nodes, links))
    .then(svg => series())

