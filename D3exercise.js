window.onload = function () {
    var svgCanvas = d3.select("svg")
        .attr("width", 960)
        .attr("height", 540)
        .attr("class", "svgCanvas");
    
    //tooltip description
    var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
	.style("visibility", "hidden")
    
    //read data in d3
    d3.json("data.json", function(myData){
        console.log(myData); 
        var dnodes = myData.nodes;
        var dlinks = myData.links;
        
        //put (x1, y1) and (x2, y2) to the array
        dlinks.forEach(function(eachLine){
        dnodes.forEach(function(eachNode){
            if (eachNode.id == eachLine.node01){
                eachLine["x1"] = eachNode.x;
                eachLine["y1"] = eachNode.y;
            };
            if (eachNode.id == eachLine.node02){
                eachLine["x2"] = eachNode.x;
                eachLine["y2"] = eachNode.y;
            };
        })
    });
        
        //add amount for node01
        var radiusValue = d3.nest()
            .key(function(d) { return d.node01 })
            .rollup(function(v) { return d3.sum(v, function(d) {return d.amount}) })
            .entries(dlinks);

        console.log(radiusValue);
        
        //add amount for node02
        var radius = d3.nest()
            .key(function(d) { return d.node02 })
            .rollup(function(v) { return d3.sum(v, function(d) {return d.amount}) })
            .entries(dlinks);
        console.log(radius);
        
        //merge node01 and node02 into one array and distinct the site
        var result = d3.merge([radiusValue, radius]);
        var test = d3.nest().key(function(d) {return d.key;})
            .rollup(function(d) {return d3.sum(d, function(g) {return g.value;});})
            .entries(result);
        console.log(test);
        
        var final = d3.merge([test, dnodes]);
        console.log(final);
        
        //
        dnodes.forEach(function(node) {
           var result = test.filter(function(g) {
               return g.key == node.id;
           });
            node.amount = result[0].value;
        });
        console.log(dnodes);

    var line = svgCanvas.selectAll("line").data(dlinks).enter()
        .append("line")
        .attr("x1", function(d){return d.x1})
        .attr("y1", function(d){return d.y1})
        .attr("x2", function(d){return d.x2})
        .attr("y2", function(d){return d.y2})
        .attr("stroke", "black")
        .attr("stroke-width", function(d){return d.amount/200});
        
    var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
    var circle = svgCanvas.selectAll("circle").data(dnodes).enter()
        .append("circle")
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return d.y;})
        .attr("r", function(d){return d.amount/60;})
        .attr("fill", function(d){return colorScale(d.id)})
        .on("mouseover", function(d){svgCanvas.selectAll("circle, line").attr("opacity", 0.1);
                                    d3.select(selectLines(d))
                                    return tooltip.html(format_description(d)).style("visibility", "visible")})
        .on("mousemove", mousemoved)
        .on("mouseout", function(d){svgCanvas.selectAll("circle, line").attr("opacity", 1)
                                    return tooltip.style("visibility", "hidden");});
    
    function mousemoved(d){
        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    }
    
    function selectLines(d) {
        line.attr("opacity", function(l){if (l.node01 == d.id || l.node02 == d.id) return 1;
                                        else return 0.1;});
        circle.attr("opacity", function(c){if (c == d) return 1;
                                          else return 0.1;});
    }
        
    function format_description(d) {
        return  '<b>' + d.id + '</b><br>'+ format_number(d) + ' connected locations' + '<br>Amount: ' + '('+ d.amount + ')';
    }
        
    function format_number(d){
        var count = 0
        for (var i=0; i<dlinks.length; i++){
            if(dlinks[i].node01 == d.id) count++
            if(dlinks[i].node02 == d.id) count++
        }
        return count
    }
        
    });
}