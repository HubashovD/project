(function() {
    // create 2 data_set

    Promise.all([
        d3.csv("data/courts.csv"),
        d3.csv("data/regions.csv")
    ]).then(function(data) {

        data[0].forEach(function(d) {
            d.short_name = d.short_name.toString();
            d.ide = +d.ide;
        });

        data[1].forEach(function(d) {
            d.short_name = d.short_name.toString();
            d.ide = +d.ide;
        });

        update(data[1]);
        d3.select("#var-2").style("background-color", "black");
        d3.select("#var-2").style("color", "white");

        d3.select("#var-1").on("click", function() {
            update(data[0]);
            d3.select("#var-1").style("background-color", "black");
            d3.select("#var-1").style("color", "white");
            d3.select("#var-2").style("background-color", "white");
            d3.select("#var-2").style("color", "black");
        });

        d3.select("#var-2").on("click", function() {
            update(data[1]);
            d3.select("#var-1").style("background-color", "white");
            d3.select("#var-1").style("color", "black");
            d3.select("#var-2").style("background-color", "black");
            d3.select("#var-2").style("color", "white");
        });
    });


    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 30, bottom: 0, left: 120 },
        width = d3.select("#courts_regions").node().getBoundingClientRect().width - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#courts_regions")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Initialize the X axis


    var yAxis = svg.append("g")
        // .attr("transform", "translate(0," + width + ")")


    // Initialize the Y axis
    var x = d3.scaleLinear()
        .range([0, width - 20]);

    var xAxis = svg.append("g")
        .attr("class", "myXaxis")
        .style("display", "none");

    // A function that create / update the plot for a given variable:
    function update(data) {

        var y = d3.scaleBand()
            .range([0, height])
            .padding(0.2);

        // Update the X axis
        y.domain(data.map(function(d) { return d.short_name; }))
            .range([0, 25 * data.length])
            .padding([0.2])

        d3.select("#regulator_raiting").select("svg")
            .attr("height", 25 * data.length + 50)


        yAxis.call(d3.axisLeft(y))
            .selectAll("text")
            .attr("transform", "translate(0,0)")
            .style("text-anchor", "end")


        // Update the Y axis
        x.domain([0, d3.max(data, function(d) { return d.ide })]);
        xAxis.transition().duration(1000).call(d3.axisTop(x));


        // ----------------
        // Create a tooltip
        // ----------------
        var tooltip = d3.select("#courts_regions")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")

        // Three function that change the tooltip when user hover / move / leave a cell
        var showTooltip = function(d) {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 1)
            tooltip
                .html("<b>" + d.long_name + "</b>" + "<br>" + "Прийнятих рішень та вироків: " + d.ide)
                .style("left", (d3.mouse(this)[0] - 100) + "px")
                .style("top", (d3.mouse(this)[1]) + 19 + "px")
                .style("width", 185 + "px")
        }
        var moveTooltip = function(d) {
                tooltip
                    .style("left", (d3.mouse(this)[0] - 100) + "px")
                    .style("top", (d3.mouse(this)[1]) + 19 + "px")
                    .style("width", 185 + "px")
            }
            // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        var hideTooltip = function(d) {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        }


        // Create the u variable
        var u = svg.selectAll("rect")
            .data(data);

        u
            .enter()
            .append("rect") // Add a new rect for each new elements
            .attr("class", "bar")
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)
            .merge(u) // get the already existing elements as well
            .transition() // and apply changes to all of them
            .duration(1000)
            .attr("x", 0)
            .attr("y", function(d) { return y(d.short_name); })
            .attr("height", 20)
            .attr("width", function(d) { return x(d.ide); })
            .attr("fill", "#4562AB")
            .attr("rx", 6)
            .attr("ry", 6)


        // If less group in the new dataset, I delete the ones not in use anymore
        u
            .exit()
            .remove()
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        var label = svg.selectAll(".bar-labels")
            .data(data)

        label
            .enter()
            .append("text")
            .attr("class", "bar-labels")
            .merge(label)
            .transition() // and apply changes to all of them
            .duration(1000)
            .attr("x", function(d) { return x(d.ide); })
            .attr("y", function(d) { return y(d.short_name) + 10; })
            .text(function(d) { return d.ide; });

        label
            .exit()
            .remove()
    }



})();