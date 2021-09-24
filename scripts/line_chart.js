(function() {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = d3.select("#line_chart").node().getBoundingClientRect().width - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#line_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%Y-%m-%d");

    //Read the data
    d3.csv("data/line_chart.csv").then(function(data) {

        // format the data
        data.forEach(function(d) {
            d.date = parseTime(d.date);
            d.Column = +d.Column
        });

        // group the data: I want to draw one line per group
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.type; })
            .entries(data);

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.date; }))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(window.innerWidth / 150));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.Column; })])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(x)
                .ticks(5)
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(y)
                .ticks(5)
        }

        // add the X gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        svg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )

        // color palette
        var res = sumstat.map(function(d) { return d.key }) // list of group names       

        var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c', '#377eb8'])


        var glines = svg.selectAll('.line-group')
            .data(sumstat).enter()
            .append('g')
            .attr('class', 'line-group');

        /* countries lines */
        glines
            .append('path')
            .attr('class', 'line-interactive')
            .attr("fill", "none")
            .attr("stroke", function(d) {
                return color(d.key)
            })
            .attr("stroke-width", 1.5)
            .attr("d", function(d) {
                return d3.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(+d.Column); })
                    (d.values)
            })





        /* tooltips */
        var mouseG = glines.append("g") // black vertical line
            .attr("class", "mouse-over-effects");

        mouseG.append("path")
            .attr("class", "mouse-line")
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var mousePerLine = mouseG
            .append("g")
            .attr("class", "mouse-per-line");

        mousePerLine.append("circle")
            .attr("r", 7)
            .style("stroke", function(d) {
                return color(d.key);
            })
            .style("fill", "none")
            .style("stroke-width", "1px")
            .style("opacity", "1");

        mousePerLine.append("text")
            .attr("transform", "translate(10,3)");

        var lines = document.getElementsByClassName("line-interactive");

        mouseG.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mouseout", function() {
                d3.select(".mouse-line").style("opacity", "0");
                d3.selectAll(".mouse-per-line circle").style("opacity", "0");
                d3.selectAll(".mouse-per-line text").style("opacity", "0")
            })
            .on("mouseover", function() {
                d3.select(".mouse-line").style("opacity", "1");
                d3.selectAll(".mouse-per-line circle").style("opacity", "1");
                d3.selectAll(".mouse-per-line text").style("opacity", "1")
            })
            .on("mousemove", function() {
                var bisect = d3.bisector(function(d) { return d.date; }).right;
                var mouse = d3.mouse(this);
                var xDate = x.invert(mouse[0]);
                d3.select(".mouse-line")
                    .attr("d", function() {
                        var d = "M" + mouse[0] + "," + height;
                        d += " " + mouse[0] + "," + 0;
                        return d;
                    });

                d3.selectAll(".mouse-per-line")
                    .attr("transform", function(d, i) {
                        var idx = bisect(d.values, xDate);
                        var beginning = 0,
                            end = lines[i].getTotalLength(),
                            target = null;

                        while (true) {
                            target = Math.floor((beginning + end) / 2);
                            pos = lines[i].getPointAtLength(target);
                            if ((target === end || target == beginning) && pos.x !== mouse[0]) {
                                break;
                            }
                            if (pos.x > mouse[0]) end = target;
                            else if (pos.x < mouse[0]) beginning = target;
                            else break; // position found
                        }

                        d3.select(this)
                            .select("text")
                            .text(function() {
                                var textValue = d.values.filter(function(k) {
                                    //витягуємо з повернутої bisect дати:
                                    // - рік (додаємо до нього 1900, щоб він виглядав нормально)  
                                    // -місяць
                                    // -дату ставимо вручну такою, що дорівнює 1 числу                        
                                    let target_date = new Date(xDate.getYear() + 1900, xDate.getMonth(), 01)


                                    //порівнюємо штучну дату в датасеті зі штучно скомпановою вище - вуаля
                                    return k.date.getTime() === target_date.getTime()
                                });
                                if (textValue.length > 0) {
                                    return textValue[0].Column;
                                }
                            })
                            .style("fill", function(d) {
                                return color(d.key)
                            })

                        return "translate(" + mouse[0] + "," + (pos.y) + ")";
                    })

            });


        //var bisect = d3.bisector(function(d) { return d.date; }).left;

        /* 



                // Create the circle that travels along the curve of chart
                var focus = svg
                    .append('g')
                    .append('circle')
                    .style("fill", "none")
                    .attr("stroke", "black")
                    .attr('r', 8.5)
                    .style("opacity", 0)

                //Create the text that travels along the curve of chart
                var focusText = svg
                    .append('g')
                    .append('text')
                    .style("opacity", 0)
                    .attr("text-anchor", "left")
                    .attr("alignment-baseline", "middle")

                // Create a rect on top of the svg area: this rectangle recovers mouse position
                svg
                    .append('rect')
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .attr('width', width)
                    .attr('height', height)
                    .on('mouseover', mouseover)
                    .on('mousemove', mousemove)
                    .on('mouseout', mouseout);

                // What happens when the mouse move -> show the annotations at the right positions.
                function mouseover() {
                    focus.style("opacity", 1)
                    focusText.style("opacity", 1)
                }

                function mousemove() {
                    // recover coordinate we need
                    var x0 = x.invert(d3.mouse(this)[0]);
                    var i = bisect(data, x0, 1);
                    selectedData = data[i]
                    focus
                        .attr("cx", x(selectedData.date))
                        .attr("cy", y(selectedData.Column))
                    focusText
                        .html("x:" + d3.timeFormat("%Y-%m-%d")(selectedData.date) + "  -  " + "y:" + selectedData.Column + "type: " + selectedData.type)
                        .attr("x", x(selectedData.date) + 15)
                        .attr("y", y(selectedData.Column))
                }

                function mouseout() {
                    focus.style("opacity", 0)
                    focusText.style("opacity", 0)
                } */







    })
})();