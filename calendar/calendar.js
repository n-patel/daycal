var eventCounter = 0;

// "padding" inside the SVG
var margin = {top: 30, bottom: 30, left: 50, right: 300};

function roundX(x) {
    return 1;
}

/**
 * Takes a y and rounds it to the y value of the nearest hour.
 */
var roundY = function(y) {
    function getYFromTranslate(translate) {
        return translate.replace(/translate\([0-9]+,/, '').replace(')', '');
    }

    var validYs = [];
    var ticks = d3.selectAll(".tick").each(function() {
        validYs.push(getYFromTranslate(d3.select(this).attr("transform")));
    });

    function getClosest() {
        var closest = validYs[0];
        for (i = 1; i < validYs.length; i++) {
            if (Math.abs(validYs[i] - y) < Math.abs(closest - y)) {
                closest = validYs[i];
            }
        }
        return closest
    }

    return getClosest();
}

/**
 * Creates an event box in the calendar.
 */
var createEvent = function(startTime, endTime, svg) {
    var startY = y(startTime),
        endY   = y(endTime),
        height = Math.abs(startY - endY),
        width  = height * 2;

    var dragbarHeight = 20;
    var minEventHeight = 40;

    function resizeEvent(d) {
        var obj = d3.select(this);
        // d.x += d3.event.dx;
        d.y += d3.event.dy;
        var selectedEvent = d3.select(".event-group .event-" + d.number)

        var newHeight = (roundY(d.y) - selectedEvent.attr("y"))

        if (newHeight > minEventHeight) {
            // move dragbar
            obj.attr("transform", "translate(" + d.x + "," + (roundY(d.y) - dragbarHeight) + ")");

            // resize event rect
            selectedEvent.attr("height", newHeight);
        }
    }

    function dragging(d) {
        var obj = d3.select(this);
        // d.x += d3.event.dx;
        d.y += d3.event.dy;
        obj.attr("transform", "translate(" + d.x + "," + roundY(d.y) + ")")
    }

    function dragStart() {
        d3.select(this).attr("opacity", "0.7");
    }

    function dragEnd() {
        d3.select(this).attr("opacity", "1.0");
    }

    var eventGroup = svg.append("g")
                        .data([{ x: 0, y: 0, number: eventCounter}])
                        .attr("class", "event event-group event-" + eventCounter)
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        })
                        .call(d3.drag().on("start", dragStart)
                                       .on("drag", dragging)
                                       .on("end", dragEnd));

    var event = eventGroup.append("rect")
                          .attr("class", "event event-rect event-" + eventCounter)
                          .attr("width", height * 2)
                          .attr("height", height)
                          .attr("x", 1)
                          .attr("y", startY)
                          .attr("rx", "20")
                          .attr("ry", "20")
                          .attr("cursor", "move")
                          .style("fill", "#666666")

    var eventText = eventGroup.append("text")
                               .text("Event #" + eventCounter)
                               .attr("class", "event event-text event-" + eventCounter)
                              .attr("x", event.attr("width") / 2)
                              .attr("y", 30)
                              .attr("text-anchor", "middle")
                              .attr("font-size", "20px");


    var dragbarBottom = eventGroup.append("rect")
                                   .data([{ x: event.attr("rx"),
                                            y: event.attr("y") + event.attr("height") - dragbarHeight,
                                            number: eventCounter}])
                                   .attr("transform", function(d) {
                                       return "translate(" + d.x + "," + d.y + ")";
                                    })
                                   .attr("class", "event event-dragbar event-" + eventCounter)
                                   .attr("width", event.attr("width") - 2 * event.attr("rx"))
                                   .attr("height", dragbarHeight)
                                   .attr("cursor", "ns-resize")
                                   .style("fill", "rgb(130,130,130)")
                                   .call(d3.drag().on("drag", resizeEvent));

    eventCounter += 1;
}

var graphWidth  = window.innerWidth - margin.left - margin.right,
    graphHeight = window.innerHeight - margin.top - margin.bottom;

var svg = d3.select("#calendar").append("svg")
                               .attr("width", graphWidth + margin.left)
                               .attr("height", graphHeight + margin.top + margin.bottom)
                               .style("border", "2px solid red")
                            .append("g")
                               .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var innerCal = svg.append("rect")
                  .attr("width", graphWidth)
                  .attr("height", graphHeight)
                  .attr("x", 0)
                  .attr("y", 0)
                  .style("fill", "#eeeeee");

var earliestTick = new Date(2016, 7, 13, 9),
    latestTick   = new Date(2016, 7, 14, 2);

var y = d3.scaleTime()
          .domain([earliestTick, latestTick])
          .range([0, graphHeight]);
var yAxis = d3.axisLeft()
          .scale(y)
          .ticks(20)
          .tickSize(-innerCal.attr("width"));
var yGroup = svg.append("g")
                .call(yAxis)

var event = createEvent(earliestTick, new Date(2016, 7, 13, 12), svg);
