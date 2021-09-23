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

        console.log(data)

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
        var res = sumstat.map(function(d) { return d.type }) // list of group names

        var color = d3.scaleOrdinal()
            .domain(res)
            .range(["red", "green"])

        // Draw the line
        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d) { return color(d.type) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d) {
                return d3.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(+d.Column); })
                    (d.values)
            })

    })
})();