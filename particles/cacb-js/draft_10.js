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
var types = [];
const getNodes = async(dataset)=>{
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i])
        // if(dataset.nodes[i].first==0){
            topicNodes.push(dataset.nodes[i]) //it looks cool when they are all topic nodes
        // }
        types.push(dataset.nodes[i].type);
    }

    uniqueTypes = types.filter(onlyUnique);
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    for (var i = 0; i<dataset.tags.length; i++){
        tagTable.push(dataset.tags[i]);
        // types.push(dataset.tags[i].tagID);
    }
    return nodes;
}


var yScale = d3.scaleOrdinal()

const processPrep = async(dataset, nodes) => {
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    yScale
        .domain(uniqueTypes)
        .range([-height/4, height/4])

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
    //HOW TO MAKE SYMBOLS DEGRADE?
    //need to make low clouds degrade
    //comms 18 degrades?
    //servers 7 degrades
    //symb/clouds/low degrades
    //comms 20
    //also need to make it so the 1-13 initial symbols pop up correctly in order
    //as in, the live topics
    //tech only shows up once (this is my plan)
    //make it so that the locations of the nodes make more sense in the yscale
    whichNum++;
    chooseData(whichNum)
}

function chooseData(whichNum){
    console.log(whichNum)
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
    linkUp(liveNodes, topicNodes) 
}
function linkUp(liveNodes, topicNodes){
    for (var i = 0; i<liveNodes.length; i++){
        for(j=0; j<liveNodes[i].tags.length; j++){
            for (k=0; k<topicNodes.length; k++){
                if(liveNodes[i].tags[j]==topicNodes[k].tags && liveNodes[i].type == whichNum){ //place to change if all
                    liveLinks.push({
                        "source": liveNodes[i].id,
                        "sourceType": liveNodes[i].type,
                        "target": topicNodes[k].id,
                        "targetType": topicNodes[k].type,
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

function restart(liveLinks, liveNodes, whichNum){
    console.log('restart')
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
        .attr('class', 'symbImg')
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
        .attr('opacity',minOpa)
        .merge(node);
    node
        .transition().duration(2000)
        .attr('opacity',function(d){
            if(d.type==whichNum){
                return maxOpa;
            }else{
                return minOpaNode; //or maybe this should disintegrate?
            }   
        })   


    link = link
        .data(liveLinks, function(d){
            return d.id;
        })
    link.exit()
        .remove()

    link = link.enter().append('path')
        .attr('class', function(d){
            return 'l'+d.id;
        })
        .attr('stroke','white')
        .attr('stroke-width',.5)
        .attr('stroke-opacity',.1)
        .attr('fill','none')
        .merge(link);

    link
        .transition().duration(4000)
        .attr('stroke-opacity',function(d){
            if(d.sourceType==whichNum && d.targetType==whichNum){
                return opa;
            }else{
                return minOpa;
            }
        })
        // .attr('d',function(d){
        //     return //MAKE IT GET SMALLER AND GO AWAY TOWARDS ITS TARGET?
        // })



    //can simulation get smaller the more clicks
    simulation
        .nodes(liveNodes)
        .force('link').links(liveLinks)
        simulation
        .force("y", d3.forceY(function(d){
            return yScale(d.type)
        }).strength(1)) 

    simulation
        .alpha(.09)
        .on('tick', ticked)
        .restart()
}

function ticked() {
    node.attr('class', positionNodes);
    link.attr('d', makeLinks);
    // text.attr('class', positionNodes)
}

function positionNodes(d) {
    node
        .attr('class','symbImg')
        .attr('y', function(d) { 
            return d.y;  
        })
        .attr('x', function(d) {
            return d.x; 
        })
    
    // text
    //     .attr('class', function(d){
    //         return 't'+d.id;
    //     })
    //     .attr('y', function(d) { 
    //         return d.y;  
    //     })
    //     .attr('x', function(d) {
    //         return d.x; 
    //     })
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
