/**
 * Time objects are meant to be relative, therefore the date doesn't matter.
 * DO NOT use array access notation (i.e., ["hour"] or ["minute"]). Instead,
 * use the provided getters.
 */
function Time(time) {

    if (_.isString(time)) {
        var splitTime = time.split(":");
        this.hour = splitTime[0];
        this.minute = splitTime[1];
    } else {
        this.hour = time.hour;
        this.minute = time.minute;
    };

    this.getHour = function() {
        return this.hour;
    };
    this.getMinute = function() {
        return this.minute;
    };
    this.getTimeString = function() {
        return this.getHour() + ":" + this.getMinute();
    };
    this.getPrettyTimeString = function() {
        var timeString = "";

        var hr = parseFloat(this.hour) % 12;
        if (hr == 0) {
            timeString += "12";
        } else {
            timeString += hr;
        }

        timeString += ":";

        var min = this.minute;
        if (min == "0") {
            timeString += "00";
        } else {
            timeString += min;
        }

        var ampm = (this.hour < 12) ? " AM" : " PM";

        timeString += ampm;
        return timeString;

    };
    this.getDateObject = function() {
        var dayOffset = 0;
        if (this.hour > 23 || this.hour < 9) {
            dayOffset = 1;
        }
        return new Date(2016, 0, 1 + dayOffset, this.hour, this.minute);
    };
    return this;
}


/**
 * Get a "pretty" string of today's date.
 *   e.g. Monday, January 1
 */
function getTodayPrettyString() {
    var days   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = new Date(Date.now()),
        day   = days[today.getDay()],
        date  = today.getDate(),
        month = months[today.getMonth()];
    return day + ", " + month + " " + date;
}
