(function() {
/**
 * Return the event model with the given uid.
 */
var getEvent = function(uid) {
    return window.events.get(uid);
};


/**
 * Remove the event model with the given uid.
 */
var destroyEvent = function(uid) {
    window.events.remove(getEvent(uid));
};


/**
 * Update start and end properties of the specified event model.
 */
var updateEventTimes = function(uid, startTime, endTime) {
    getEvent(uid).set({ start: startTime,
                        end:   endTime  });
};


/**
 * Return the start and end properties of the specified event model.
 */
var getEventTimes = function(uid) {
    return {start: getEvent(uid).attributes.start,
            end:   getEvent(uid).attributes.end };
};


/**
 * Return a formatted string (start - end) for user-facing event duration.
 */
var getEventTimesString = function(uid) {
    return getEventTimes(uid).start.getTimeString() + " - " + getEventTimes(uid).end.getTimeString()
};


/**
 * Return the y-value from the transform SVG attribute.
 */
var getYFromTranslate = function(translate) {
    return parseFloat(translate.replace(/translate\([0-9]+,/, '').replace(')', ''));
};


var validYPositions = [];

/**
 * Populate the validYPositions array with... well, the valid y positions.
 */
var populateValidYPositions = function() {
    var tickYs = [];
    var ticks = d3.selectAll(".tick").each(function() {
        tickYs.push(getYFromTranslate(d3.select(this).attr("transform")));
    });

    var tickDeltaY = tickYs[1] - tickYs[0];
    var validYs = [];
    var i, j;
    for (i = 0; i < tickYs.length; i++) {
        var offset = tickDeltaY / 4;
        for (j = 0; j < 4; j++) {
            validYs.push(tickYs[i] + j * offset);
        }
    }
    return validYs;
};


/**
 * Given a value, returns the closest element in an array and its index.
 */
var getClosest = function(value, array) {
    var closest = array[0];
    var closestIndex = 0;
    for (i = 1; i < array.length; i++) {
        if (Math.abs(array[i] - value) < Math.abs(closest - value)) {
            closest = array[i];
            closestIndex = i;
        }
    }
    return [closest, closestIndex];
};


/**
 * Takes a y and rounds it to the y value of the nearest valid position.
 */
var roundY = function(y) {
    return getClosest(y, validYPositions)[0];
};


/**
 * Given a y-value, return the Date where it falls on the y-axis.
 */
function getDateFromY(value) {
    return yScale.invert(value);
};


/**
 * Given a Date, return the Time.
 */
function getTimeFromDate(date) {
    return new Time(date.getHours() + ":" + date.getMinutes(), 0);
};


/**
 * Creates an event box in the calendar.
 */
var createEvent = function(name, startTime, endTime, uid) {
    var startY = yScale(startTime.getDateObject()),
        endY   = yScale(endTime.getDateObject()),
        height = Math.abs(startY - endY),
        width  = height * 2
        spacing = 2;

    var dragbarHeight = 10;
    var minEventHeight = 0; //yScale(new Time("9:15", 0).getDateObject()) - yScale(new Time("9:00", 0).getDateObject());

    function resizeEvent(d) {
        d.y += d3.event.dy;
        var selectedEventGroup = d3.select("g.event-group.event-" + d.uid);
        var selectedEvent = d3.select(".event-rect.event-" + d.uid);

        var newHeight = (roundY(d.y) - selectedEvent.attr("y"))
        if (newHeight >= minEventHeight) {
            // move dragbar
            d3.select(this).attr("transform", "translate(" + d.x + "," + (roundY(d.y) - dragbarHeight) + ")");

            // resize event rect
            selectedEvent.attr("height", newHeight);

            // update event model
            var startY = getYFromTranslate(selectedEventGroup.attr("transform"));
            var endY   = startY + parseFloat(selectedEvent.attr("height"));
            updateEventTimes(d.uid,
                             getTimeFromDate(getDateFromY(startY)),
                             getTimeFromDate(getDateFromY(endY + spacing)));

            // update time listing
            selectedEventGroup.select("text").text(getEventTimesString(d.uid));

            // move text if box becomes too small/large enough to accommodate.
            var rectBBox = parseFloat(selectedEventGroup.select("rect.event-rect").attr("height"));
            var textBBox = parseFloat(selectedEventGroup.select("text").attr("y"));

            if (textBBox > rectBBox) {
                selectedEventGroup.selectAll("text").attr("y", selectedEventGroup.select("text").node().getBBox().height);
            } else {
                selectedEventGroup.selectAll("text").attr("y", selectedEventGroup.select("text").node().getBBox().height + eventPadding.top);
            }
        }

    }

    function dragging(d) {
        d.y += d3.event.dy;
        d3.select(this).attr("transform", "translate(" + d.x + "," + roundY(d.y) + ")");

        // update event model
        var startY = getYFromTranslate(d3.select(this).attr("transform"));
        var endY   = startY + parseFloat(d3.select(this).select(".event-rect").attr("height"));
        updateEventTimes(d.uid,
                         getTimeFromDate(getDateFromY(startY)),
                         getTimeFromDate(getDateFromY(endY + spacing)));

        // update time listing
        d3.select(this).select("text").text(getEventTimesString(d.uid));
    }

    function dragStart() {
        d3.select(this).select(".event-rect").attr("opacity", "1.0");
    }

    function dragEnd() {
        d3.select(this).select(".event-rect").attr("opacity", "0.4");
    }

    var eventPadding = {top: 5, bottom: 20, left: 10, right: 10};

    var eventGroup = svg.append("g")
                        .data([{ x: 0, y: 0, uid: uid}])
                        .attr("class", "event event-group event-" + uid)
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        })
                        .call(d3.drag().on("start", dragStart)
                                       .on("drag", dragging)
                                       .on("end", dragEnd))
                        .on("contextmenu", function(d) {
                            destroyEvent(d.uid);
                            d3.event.preventDefault();
                            d3.select(this).remove();
                        });
                        // TODO: uncomment this after testing.

    var event = eventGroup.append("rect")
                          .attr("class", "event event-rect event-" + uid)
                          .attr("width", calBackground.attr("width"))
                          .attr("height", height - spacing)  /* add spacing between */
                          .attr("y", startY + spacing)       /* consecutive events. */
                          .attr("x", 0)
                          .attr("rx", "0")
                          .attr("ry", "0")
                          .attr("cursor", "move")
                          .attr("opacity", "0.4");

    var eventTimeText = eventGroup.append("text")
                                  .text(getEventTimesString(uid))
                                  .attr("class", "event event-text event-text-time event-" + uid)
                                  .attr("text-anchor", "end")
                                  .attr("x", event.attr("width") - eventPadding.left);
                     eventTimeText.attr("y", eventTimeText.node().getBBox().height + eventPadding.top);

    var eventNameText = eventGroup.append("text")
                                  .text(name)
                                  .attr("class", "event event-text event-text-name event-" + uid)
                                  .attr("text-anchor", "start")
                                  .attr("x", eventPadding.right);
                     eventNameText.attr("y", eventNameText.node().getBBox().height + eventPadding.top);

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
};
window.createEvent = createEvent;


/**
 * Set up calendar SVG.
 */


// "padding" inside the SVG
// 10px on the right should be just enough for native browser scrollbars.
var margin = {top: 30, bottom: 30, left: 50, right: 10};

var graphWidth  = $('#calendar').width() - margin.left - margin.right,
    graphHeight = (window.innerHeight * 2) - margin.top - margin.bottom;

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

var earliestTick = new Time("9:00", 0).getDateObject(),
    latestTick   = new Time("2:00", 1).getDateObject();

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
})();
