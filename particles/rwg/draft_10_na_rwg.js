var width, height;

var keywords = [];
var eachKeyword = [];
var uniqueKeywords;
var totalKeywords = [];
var filterNum = .9;
var focusKeywords = [];
var mostKeyed;
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
    dataset = await d3.json('rwg.json');
    console.log(dataset)
    return dataset;
  } catch (err) {
    console.log(err)
    throw Error('Failed to load data')
  }
}

const nodesLinks = async(dataset)=>{
    // for (var i = 0; i<dataset.links.length; i++){
    //     links.push(dataset.links[i]);
    // }
    for (var i = 0; i<dataset.nodes.length; i++){
        nodes.push(dataset.nodes[i]);
    }
    console.log(nodes);
    return nodes;
}


const processPrep = async(dataset, nodes) => {
    
    width = window.innerWidth*.99;
    height = window.innerHeight*.99;

    simulation = d3.forceSimulation()
        // .force('link', d3.forceLink().id(d => d.id))//.distance(400).strength(0.1))
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

    //KEYWORDS
    for (var i = 0;i<nodes.length; i++){ 
        keywords[i]=nodes[i].tag.split(",")
        // 1 array with all the keywords
        for (j = 0; j < keywords[i].length; j++) {
            eachKeyword.push(keywords[i][j]);
        }
    }

    for (i = 0; i < eachKeyword.length; i++) {
        //count the number of times a keyword has been used
        totalKeywords[i] = keyConsolidation(eachKeyword[i])
        
        //find the max used keyword
        mostKeyed = d3.max(totalKeywords);

        //each keyword has a number of times it has been used at the same position in the array
        //so we can run through and say if this is a "frequent" keyword
        //let's mark it as special in our "focus keywords" array
        if (totalKeywords[i] > mostKeyed * filterNum) {
            focusKeywords.push(eachKeyword[i]);
        } else {
            console.log("nope")
        }
    }

    uniqueKeywords = focusKeywords.filter(onlyUnique);
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    function keyConsolidation(givenKey, i) {
        var total = 0;
        for (i = 0; i < eachKeyword.length; i++) {
            if (eachKeyword[i] == givenKey) {
                total++;
            }
        }
        return total;
    }
    uk = uniqueKeywords.length;
    return uniqueKeywords;
}

function series(){
    whichNum++;
    chooseData(whichNum)
}
function chooseData(whichNum){
    console.log(whichNum)
        for (i = 0; i < dataset.nodes.length; i++) {
            for (j = 0; j < uniqueKeywords.length; j++) {
                if (keywords[i].indexOf(uniqueKeywords[j]) != -1) {
                    liveLinks.push({
                        "source": keywords[i],
                        "target": uniqueKeywords[j]
                    })
                }
            }
        }

    // for (var i = 0; i<links.length; i++){
    //     liveLinks.push(links[i]);
    // }
    

        // if(liveNodes[i].tags.length>1){
            
        //     console.log(liveNodes[i].tags)
        //     if(liveNodes[i].tags==mainTag)
        // }
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {
            name: link.source
        });
        link.target = nodes[link.target] || (nodes[link.target] = {
            name: link.target
        });

    });
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
            return 'c';
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
    .then(nodes => processPrep(dataset, nodes))
    .then(uniqueKeywords => series())

