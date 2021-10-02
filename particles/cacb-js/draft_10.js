var width, height;

var nodes = [];
var tagTable = [];

var svg, g, node, text, link, img;
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
var locs = [];
const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i])
        // if(dataset.nodes[i].first==1){
            topicNodes.push(dataset.nodes[i]) //it looks cool when they are all topic nodes
        // }
    }

    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
        locs.push(dataset.tags[i].loc);
    }
    locs.sort(d3.ascending)
    return nodes;
}


var yScale = d3.scaleLinear()

const processPrep = async(dataset, nodes) => {
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    yScale
        .domain(locs)
        .range([-290,-210])

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id)//.strength(0.01)
            .distance(2).strength(0.3))
        // .force('charge', d3.forceManyBody(-100))
        .force('collide', d3.forceCollide().radius(symWidth).strength(0.1))
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
    img = svg.append('g')
        .selectAll('image');

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
        .then(liveLinks => restart(liveLinks, liveNodes, whichNum))
}

const chooseData = async(whichNum)=>{
    for (var i = 0; i<topicNodes.length; i++){
        if(topicNodes[i].type == whichNum){  
            liveTopics.push(topicNodes[i])
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
                if((liveNodes[i].tags[j]==liveTopics[k].tags) && (liveNodes[i].type == whichNum)){//place to change if all
                    liveLinks.push({
                        "source": liveNodes[i].id,
                        "sourceType": liveNodes[i].type,
                        "target": liveTopics[k].id,
                        "targetType": liveTopics[k].type,
                        "id":liveNodes[i].id
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

function restart(liveLinks, liveNodes, whichNum){
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
        .attr('transform',"translate("+ -symWidth/2 +","+ -symHeight/2 +")")
        .attr('width', function(d){
            return symWidth+'px'
        })
        .attr('height', function(d){
            return symHeight+'px'
        })
        .attr('opacity',opa)
        .merge(node);
 

    link = link
        .data(liveLinks, function(d){
            return d.id;
        })
    link.exit()
        .remove()

    link = link.enter().append('path')
        .attr('class', 'link')
        .attr('stroke','white')
        .attr('stroke-opacity',.01)
        .attr('fill','none')
        .merge(link);


//only if you are CO2 and other human made things?
    // drawOut()
    function drawOut(){
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


    //can simulation get smaller the more clicks
    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks)
        simulation
        .force("y", d3.forceY(function(d){
            if(d.tags.length==1){
                var adjst = d.tags-1;
                return yScale(dataset.tags[adjst].loc)
            }else{
                var adjst = (d.tags[0])-1;
                return yScale(dataset.tags[adjst].loc)
            }
        }).strength(1)) 

    simulation
        .alpha(.05)
        .on('tick', ticked)
        .restart()
}

function ticked() {
    node.attr('class', positionNodes);
    link.attr('d', makeLinks)
}

function positionNodes(d) {

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
