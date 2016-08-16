// "padding" inside the SVG
var margin = {top: 30, bottom: 30, left: 50, right: 320};

/**
 * Returns an array containing the Dates for each tick mark.
 * Can be associated with the array from getTickPositions().
 */
var getTickTimes = function() {
    return y.ticks();
}

/* Returns an array containing the y-coordinates for each tick mark.
 * Can be associated with the array from getTickTimes().
 */
var getTickPositions = function() {
    function getYFromTranslate(translate) {
        return translate.replace(/translate\([0-9]+,/, '').replace(')', '');
    }

    var tickPositions = [];
    var ticks = d3.selectAll(".tick").each(function() {
        tickPositions.push(getYFromTranslate(d3.select(this).attr("transform")));
    });

    return tickPositions;
}

function roundX(x) {
    return 1;
}

/**
 * Takes a y and rounds it to the y value of the nearest hour.
 */
var roundY = function(y) {
    var validYs = getTickPositions();

    function getClosest() {
        var closest = validYs[0];
        for (i = 1; i < validYs.length; i++) {
            if (Math.abs(validYs[i] - y) < Math.abs(closest - y)) {
                closest = validYs[i];
            }
        }
        return closest;
    }

    return getClosest();
}

/**
 * Returns a native Date object from a string of form "HH:mm".
 * Time "objects" are meant to be relative, therefore the date doesn't matter.
 */
function Time(time, dayOffset) {
    var splitTime = time.split(":");
    return new Date(2016, 0, 1 + dayOffset, splitTime[0], splitTime[1]);
}

/**
 * Creates an event box in the calendar.
 */
var createEvent = function(name, startTime, endTime, id) {
    var startY = y(startTime),
        endY   = y(endTime),
        height = Math.abs(startY - endY),
        width  = height * 2
        spacing = 2;

    var dragbarHeight = 20;
    var minEventHeight = 40;

    function resizeEvent(d) {
        d.y += d3.event.dy;
        var selectedEvent = d3.select(".event-group .event-" + d.id)

        var newHeight = (roundY(d.y) - selectedEvent.attr("y"))
        if (newHeight > minEventHeight) {
            // move dragbar
            d3.select(this).attr("transform", "translate(" + d.x + "," + (roundY(d.y) - dragbarHeight) + ")");

            // resize event rect
            selectedEvent.attr("height", newHeight);
        }
    }

    function dragging(d) {
        d.y += d3.event.dy;
        d3.select(this).attr("transform", "translate(" + d.x + "," + roundY(d.y) + ")")
    }

    function dragStart() {
        d3.select(this).select(".event-rect").attr("opacity", "1.0");
    }

    function dragEnd() {
        d3.select(this).select(".event-rect").attr("opacity", "0.4");
    }

    var eventGroup = svg.append("g")
                        .data([{ x: 0, y: 0, id: id}])
                        .attr("class", "event event-group event-" + id)
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        })
                        .call(d3.drag().on("start", dragStart)
                                       .on("drag", dragging)
                                       .on("end", dragEnd))
                        // .on("contextmenu", function() {
                        //     d3.event.preventDefault();
                        //     d3.select(this).remove();
                        // });
                        // TODO: uncomment this after testing.

    var event = eventGroup.append("rect")
                          .attr("class", "event event-rect event-" + id)
                          .attr("width", height * 2)
                          .attr("height", height - spacing)  /* add spacing between */
                          .attr("y", startY + spacing)       /* consecutive events. */
                          .attr("x", 0)
                          .attr("rx", "0")
                          .attr("ry", "0")
                          .attr("cursor", "move")
                          .attr("opacity", "0.4");

    var eventText = eventGroup.append("text")
                               .text(name)
                               .attr("class", "event event-text event-" + id)
                               .attr("x", event.attr("width") / 2)
                               .attr("y", 30)
                               .attr("text-anchor", "middle")
                               .attr("font-size", "14px");

    var dragbarBottom = eventGroup.append("rect")
                                   .data([{ x: event.attr("rx"),
                                            y: event.attr("height") - dragbarHeight + spacing,
                                            id: id}])
                                   .attr("transform", function(d) {
                                       return "translate(" + d.x + "," + d.y + ")";
                                    })
                                   .attr("class", "event event-dragbar event-" + id)
                                   .attr("width", event.attr("width") - 2 * event.attr("rx"))
                                   .attr("height", dragbarHeight)
                                   .attr("cursor", "ns-resize")
                                   .call(d3.drag().on("drag", resizeEvent));

}

var graphWidth  = $('body').width() - margin.left - margin.right,
    graphHeight = window.innerHeight - margin.top - margin.bottom;

var svg = d3.select("#calendar").append("svg")
                                  .attr("width", graphWidth + margin.left)
                                  .attr("height", graphHeight + margin.top + margin.bottom)
                                .append("g")
                                  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var calBackground = svg.append("rect")
                  .attr("class", "calendar-background")
                  .attr("width", graphWidth)
                  .attr("height", graphHeight)
                  .attr("x", 0)
                  .attr("y", 0);

// var rightLine = svg.append("line")
//                    .class("calendar-background-line")
//                    .attr("x1", calBackground.attr("x"))
//                    .attr("x2". calBackground.attr("width"))
//                    .attr("y1", calBackground.attr("y"))
//                    .attr("y2", calBackground.attr("height"));

var earliestTick = new Time("9:00", 0),
    latestTick   = new Time("2:00", 1);

var y = d3.scaleTime()
          .domain([earliestTick, latestTick])
          .range([0, graphHeight]);
var yAxis = d3.axisLeft()
              .scale(y)
              .ticks(20)
              .tickFormat(d3.timeFormat("%_I %p"))
              .tickSize(-calBackground.attr("width"));
var yGroup = svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis)

// var event = createEvent("none", earliestTick, new Date(2016, 7, 13, 12));

var getEventTimes = function(event) {
    console.log(event);
}
