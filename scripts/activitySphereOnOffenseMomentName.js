    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 0, bottom: 50, left: 200 },
        width = d3.select("#activitySphereOnOffenseMomentName").node().getBoundingClientRect().width - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#activitySphereOnOffenseMomentName")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/activitySphereOnOffenseMomentName.csv").then(function(data) {

        data.forEach(function(d) {
            d.Column = +d.Column;
        });

        // List of groups (here I have one group per column)
        var allGroup = d3.map(data, function(d) { return (d.activitySphereOnOffenseMomentName) }).keys()

        // add the options to the button
        d3.select("#selectButton")
            .selectAll('myOptions')
            .data(allGroup)
            .enter()
            .append('option')
            .text(function(d) { return d; }) // text showed in the menu
            .attr("value", function(d) { return d; }); // corresponding value returned by the button

        var yAxis = svg.append("g")
            // .attr("transform", "translate(0," + width + ")")

        var y = d3.scaleBand()
            .range([0, height])
            .padding(0.2);

        var x = d3.scaleLinear()
            .range([0, width - 70]);

        var xAxis = svg.append("g")
            .attr("class", "myXaxis")
            .style("display", "none");

        function update(f) {

            var filtered = data.filter(function(d) { return d.activitySphereOnOffenseMomentName === f })

            // Update the X axis
            y.domain(filtered.map(function(d) { return d.short_name; }))
                .range([0, 25 * filtered.length])
                .padding([0.2])

            yAxis.call(d3.axisLeft(y))
                .selectAll("text")
                .attr("transform", "translate(-10,0)")
                .style("text-anchor", "end")

            d3.select("#activitySphereOnOffenseMomentName").select("svg")
                .attr("height", 25 * filtered.length + 50)


            // Update the Y axis
            x.domain([0, d3.max(filtered, function(d) { return d.Column })]);
            xAxis.transition().duration(1000).call(d3.axisTop(x));

            // ----------------
            // Create a tooltip
            // ----------------
            var tooltip = d3.select("#activitySphereOnOffenseMomentName")
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
                    .html("<b>" + "Порушення: " + "</b>" + d.codexArticle_name + "<br>" + "<b>" + "Кількість порушень: " + "</b>" + d.Column)
                    .style("left", (d3.mouse(this)[0] + 90) + "px")
                    .style("top", (d3.mouse(this)[1] - 90) + "px")
            }
            var moveTooltip = function(d) {
                    tooltip
                        .style("left", (d3.mouse(this)[0] + 90) + "px")
                        .style("top", (d3.mouse(this)[1] - 90) + "px")
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
                .data(filtered);

            u
                .enter()
                .append("rect") // Add a new rect for each new elements
                .attr("class", "bar")
                .on("mouseover", showTooltip)
                .on("mousemove", moveTooltip)
                .on("mouseleave", hideTooltip)
                .merge(u) // get the already existing elements as well               
                .attr("y", function(d) { return y(d.short_name) })
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("x", 0)
                .attr("y", function(d) { return y(d.short_name); })
                .attr("height", 20)
                .attr("width", function(d) { return x(d.Column); })
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
                .data(filtered)

            label
                .enter()
                .append("text")
                .attr("class", "bar-labels")
                .merge(label)
                .attr("y", function(d) { return y(d.short_name) + 10; })
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("x", function(d) { return x(d.Column); })
                .attr("y", function(d) { return y(d.short_name) + 10; })
                .text(function(d) { return d.Column; });

            label
                .exit()
                .remove()

        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
                // run the updateChart function with this selected option
            update(selectedOption)

        })

        update("Депутат місцевої ради")
    })