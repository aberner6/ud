//global variables
//"var" could also be "let" - can be redefined locally
var keywords = [];
var uniqueKeywords;

var links = [];
var nodes = {};
var svg;
var vis;
var circle;
var path;

var rMap;
var radius = 2;
var simulation;

var dataset;

var padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 8;

async function drawData() {
/*step 1: get the data and see one piece of it*/	
	dataset = await d3.csv("mini_train.csv");
	const accessOnePiece = dataset[0];

/*step 2: basic dimensions, setting up canvas*/    
    var width = window.innerWidth*.99;
    var height = window.innerHeight*.99;

    svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
    vis = svg
        .append('svg:g')
        .attr("transform","translate("+ 0 + "," + 0 + ")");

/*step 3: data processing, parsing, counting, creating relationships among the data pieces    */
    for (i = 0;i<dataset.length; i++){ //this is a for loop and goes through the whole dataset
        keywords.push(dataset[i].name);
    };
    uniqueKeywords = keywords.filter(onlyUnique); //find unique keywords
    //magic function to return only unique values
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

  
    var n = dataset.length, // total number of nodes
    m = uniqueKeywords.length; // number of distinct clusters
    var clusters = new Array(m);


    createLinks();
	function createLinks(){
	    links = [];
	        for (i=0; i<dataset.length; i++){ //for the whole dataset
	           links.push({"source":dataset[i].id,"target":dataset[i].type,"title":dataset[i].name}) //set them as sources and targets
	        }

	   simpleNodes();
	}
    function simpleNodes(){

        var thisWeight = [];
        var maxWeight;

        links.forEach(function(link) {
          // link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, title: link.title});
          // link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});

          link.source = nodes[link.source] || (nodes[link.source] = {sourceTitle: link.title, sourceId: link.source});
          link.target = nodes[link.target] || (nodes[link.target] = {targetTitle: link.title, sourceId: link.source});
        });

        console.log(links)

        simulation = d3.forceSimulation()
            .nodes(Object.values(nodes))
            .force("link", d3.forceLink(links))
            .force("charge", d3.forceManyBody().strength(-10))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", ticked)


        path = vis.selectAll("path")
            .data(links)
            .enter().append("path")
            .attr("class", function(d){
                return d;
            })
            .attr("fill","#e6e6e3");

        circle = vis.selectAll("node")
            .data(simulation.nodes())
            .enter().append("circle")
            .attr("class", function(d){
                console.log(d)
                return d.title;
            })
            .attr("r", radius)
            .attr("fill", function(d){
                // if(d."pink"
            })

        function ticked() {
          path.attr("d", linkArc);
          circle.attr("transform", transform);
        }
        function transform(d) {
          d.x = Math.max(radius, Math.min(width - radius, d.x));
          d.y = Math.max(radius, Math.min(height - radius, d.y));   
          return "translate(" + d.x+ "," + d.y + ")";
        }

        function linkArc(d) {
          var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        }
    }
}
drawData();


