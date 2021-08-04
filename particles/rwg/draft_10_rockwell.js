var width, height;

var nodes = [];

var svg, g, node, answerNode, link;
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
    dataset = await d3.json('rwg/rwg_full.json');
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
    return nodes;
}

const processPrep = async(dataset, nodes) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    var poScale = d3.scaleOrdinal()
        .domain(['e', 's', 'w', 'na'])
        .range([0, height/4])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id) //.strength(0.00001))
            .distance(20).strength(0.1))
        .force('charge', d3.forceManyBody(-200))
        // .force('center', d3.forceCenter(0,height/2)) 
        .force('collide', d3.forceCollide().radius(radius).iterations(2).strength(0.1))
        // .force('r', d3.forceRadial(function(d){
        //     console.log(poScale(d.loc));
        //     return poScale(d.loc)
        // }).strength(0.1))
   
    svg = d3.select('body').append('svg')
        .attr('viewBox', [-width/2,-height/2, width, height])
        .style('background-color','#000000e6')

    node = svg.append('g')
        .selectAll('circle');
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
                return 'none'
            }else {
                return 'white'
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
        .attr('fill-opacity',.01)
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

