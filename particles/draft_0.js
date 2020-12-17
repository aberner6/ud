

async function drawLineChart() {

    let dimensions = {
        width: window.innerWidth * 0.9,
        height: 400,
        margin: {
          top: 15,
          right: 15,
          bottom: 40,
          left: 60,
        },
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

    //draw canvas
    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    var nodes_data =  [
        {"name": "Travis", "sex": "M"},
        {"name": "Diana", "sex": "F"},
        {"name": "Ana", "sex": "F"},
        {"name": "Juan", "sex": "M"},
        ]

    var simulation = d3.forceSimulation()
        .nodes(nodes_data); 
                        
    //add forces
    simulation
        .force("center_force", d3.forceCenter(dimensions.width / 2, dimensions.height / 2)); 


    //draw circles for the nodes 
    var node = bounds.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes_data)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", "red");  


            
    //add tick instructions: 
    simulation.on("tick", tickActions );

    //create links data 
    var links_data = [
        {"source": "Travis", "target": "Diana"},
        {"source": "Diana", "target": "Ana"},
        {"source": "Diana", "target": "Juan"},
        {"source": "Ana", "target": "Travis"},
    ]

    //create the link force 
    var link_force =  d3.forceLink(links_data)
        .id(function(d) { return d.name; })

    //add a links force to the simulation
    simulation.force("links",link_force)

    //draw lines for the links 
    var link = bounds.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links_data)
        .enter().append("line")
        .attr("stroke","none");                    
                    
    function tickActions() {
        //update circle positions each tick of the simulation 
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
            
        //update link positions 
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

    }                    
}
drawLineChart()

