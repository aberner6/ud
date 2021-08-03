
    // var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    var width = window.innerWidth,
        height = window.innerHeight;

    var nodes = randomizeData(0);

    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-150))
        .force("forceX", d3.forceX().strength(.1))
        .force("forceY", d3.forceY().strength(.1))
        .force("center", d3.forceCenter())
        .alphaTarget(1)
        .on("tick", ticked);

    var svg = d3.select("body").append("svg").attr("width", width).attr("height", height)
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
        node = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5).selectAll(".node");

    d3.interval(function(){
        var whichPiece = 0; //Math.floor(Math.random()*3);
        var howMany = 2;
        restart(randomizeData(whichPiece, howMany))
    }, 2000);

    function restart(nodes) {
        console.log(nodes);
      // transition
      var t = d3.transition()
          .duration(750);

      // Apply the general update pattern to the nodes.
      node = node.data(nodes, function(d) { return d ;});

      node.exit()
          .style("fill", "#b26745")
        .transition(t)
          .attr("r", 1e-6)
          .remove();

      node
          .transition(t)
            .style("fill", "#3a403d")
            .attr("r", function(d){ return d.ty });

      node = node.enter().append("circle")
          .style("fill", "#45b29d")
          .attr("r", function(d){ return d.ty })
          .merge(node);

      // Update and restart the simulation.
      simulation.nodes(nodes)
        .force("collide", d3.forceCollide().strength(1).radius(function(d){ return 10; }).iterations(1));

    }

    function ticked() {
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; })

    }

    function randomizeData(whichPiece, howMany){
      var totalData = [
        {
        id: 1,
        name: "High Clouds",
        ty: 10,
        age: 29},
        {
        id: 2,
        name: "Low Clouds",
        ty: 50,
        age: 29},
        {
        id: 3,
        name: "Mid Clouds",
        ty: 30,
        age: 29},
        {
        id: 1,
        name: "High Clouds",
        ty: 4,
        age: 29},
        ]
        //choose sections of the data:
        var liveData = [];
        for (var i = 0; i<totalData.length; i++){
            if(totalData[i].name=="High Clouds"){
                liveData.push(totalData[i])
            }
        }
        //or choose your own data:
        // var liveData = [];
        // liveData.push(totalData[whichPiece]);
      return liveData;
    }