// Calendar-Event Connector: connects hourly-calendar with Backbone event.js.
var updateEventTimes = function(uid, startTime, endTime) {
    window.events.get(uid).set({ start: startTime,
                                   end: endTime  });
}

// "padding" inside the SVG
var margin = {top: 30, bottom: 30, left: 50, right: 30};

var validYPositions = [];

/**
 * Returns an array containing the Dates for each tick mark.
 * Can be associated with the array from getTickPositions().
 */
var getTickTimes = function() {
    return y.ticks();
}

function getYFromTranslate(translate) {
    return parseFloat(translate.replace(/translate\([0-9]+,/, '').replace(')', ''));
}

var populateValidYPositions = function() {
    var tickYs = [];
    var ticks = d3.selectAll(".tick").each(function() {
        tickYs.push(getYFromTranslate(d3.select(this).attr("transform")));
    });

    var tickDeltaY = tickYs[1] - tickYs[0];
    var validYs = [];
    for (i = 0; i < tickYs.length; i++) {
        var offset = tickDeltaY / 4;
        for (j = 0; j < 4; j++) {
            validYs.push(tickYs[i] + j * offset);
        }
    }
    return validYs;
}

function roundX(x) {
    return 1;
}


/**
 * Returns
 */
function getClosest(value, array) {
    var closest = array[0];
    var closestIndex = 0;
    for (i = 1; i < array.length; i++) {
        if (Math.abs(array[i] - value) < Math.abs(closest - value)) {
            closest = array[i];
            closestIndex = i;
        }
    }
    return [closest, closestIndex];
}

/**
 * Takes a y and rounds it to the y value of the nearest hour.
 */
var roundY = function(y) {
    return getClosest(y, validYPositions)[0];
}

/**
 * Returns a native Date object from a string of form "HH:mm".
 * Time "objects" are meant to be relative, therefore the date doesn't matter.
 */
function Time(time, dayOffset) {
    var splitTime = time.split(":");
    return new Date(2016, 0, 1 + dayOffset, splitTime[0], splitTime[1]);
}

function getTimeFromY(value) {
    return yScale.invert(value);
}

/**
 * Creates an event box in the calendar.
 */
var createEvent = function(name, startTime, endTime, uid) {
    var startY = yScale(startTime),
        endY   = yScale(endTime),
        height = Math.abs(startY - endY),
        width  = height * 2
        spacing = 2;

    var dragbarHeight = 10;
    var minEventHeight = yScale(new Time("9:15", 0)) - yScale(new Time("9:00", 0));
    console.log(minEventHeight);

    function resizeEvent(d) {
        d.y += d3.event.dy;
        var selectedEventGroup = d3.select("g.event-group.event-" + d.uid);
        var selectedEvent = d3.select(".event-rect.event-" + d.uid);

        var newHeight = (roundY(d.y) - selectedEvent.attr("y"))
        if (newHeight > minEventHeight) {
            // move dragbar
            d3.select(this).attr("transform", "translate(" + d.x + "," + (roundY(d.y) - dragbarHeight) + ")");

            // resize event rect
            selectedEvent.attr("height", newHeight);
            // console.log(selectedEvent);

            var startY = getYFromTranslate(selectedEventGroup.attr("transform"));
            var endY   = startY + parseFloat(selectedEvent.attr("height"));
            updateEventTimes(d.uid, getTimeFromY(startY), getTimeFromY(endY + spacing));
        }

    }

    function dragging(d) {
        d.y += d3.event.dy;
        d3.select(this).attr("transform", "translate(" + d.x + "," + roundY(d.y) + ")");

        var startY = getYFromTranslate(d3.select(this).attr("transform"));
        var endY   = startY + parseFloat(d3.select(this).select(".event-rect").attr("height"));
        updateEventTimes(d.uid, getTimeFromY(startY), getTimeFromY(endY + spacing));
    }

    function dragStart() {
        d3.select(this).select(".event-rect").attr("opacity", "1.0");
    }

    function dragEnd() {
        d3.select(this).select(".event-rect").attr("opacity", "0.4");
    }

    var eventGroup = svg.append("g")
                        .data([{ x: 0, y: 0, uid: uid}])
                        .attr("class", "event event-group event-" + uid)
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
                          .attr("class", "event event-rect event-" + uid)
                          .attr("width", height * 2)
                          .attr("height", height - spacing)  /* add spacing between */
                          .attr("y", startY + spacing)       /* consecutive events. */
                          .attr("x", 0)
                          .attr("rx", "0")
                          .attr("ry", "0")
                          .attr("cursor", "move")
                          .attr("opacity", "0.4");

    var eventNameText = eventGroup.append("text")
                                  .text(name)
                                  .attr("class", "event event-text event-" + uid)
                                  .attr("x", event.attr("width") / 2)
                                  .attr("y", 30)
                                  .attr("text-anchor", "middle")
                                  .attr("font-size", "14px");

    var dragbarBottom = eventGroup.append("rect")
                                   .data([{ x: event.attr("rx"),
                                            y: event.attr("height") - dragbarHeight + spacing,
                                            uid: uid}])
                                   .attr("transform", function(d) {
                                       return "translate(" + d.x + "," + d.y + ")";
                                    })
                                   .attr("class", "event event-dragbar event-" + uid)
                                   .attr("width", event.attr("width") - 2 * event.attr("rx"))
                                   .attr("height", dragbarHeight)
                                   .attr("cursor", "ns-resize")
                                   .call(d3.drag().on("drag", resizeEvent));

}

var graphWidth  = $('#calendar').width() - margin.left - margin.right,
    graphHeight = (window.innerHeight * 1.5) - margin.top - margin.bottom;

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

var yScale = d3.scaleTime()
               .domain([earliestTick, latestTick])
               .range([0, graphHeight]);
var yAxis = d3.axisLeft()
              .scale(yScale)
              .ticks(20)
              .tickFormat(d3.timeFormat("%_I %p"))
              .tickSize(-calBackground.attr("width"));
var yGroup = svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis);

validYPositions = populateValidYPositions();
