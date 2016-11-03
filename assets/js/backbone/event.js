TrelloCal.Models.Event = Backbone.Model.extend({
    initialize: function(options) {
        this.set('uid', options.task.id + "_" + options.sibling);
    },

    idAttribute: 'uid',

    defaults: {
        name: '',
        task: '',
        sibling: 0,     // how many events of this task already exist
        uid: '',        // computed id: {task}_{sibling}
        start: new Time("9:00", 0),
        end: new Time("11:00", 0),
    },

});


TrelloCal.Collections.Events = Backbone.Collection.extend({
    model: TrelloCal.Models.Event,
    localStorage: new Backbone.LocalStorage("events-list"),
});


TrelloCal.Views.Event = Backbone.View.extend({
    render: function() {
        createEvent(this.model.get('name'),
                    this.model.get('start'),
                    this.model.get('end'),
                    this.model.get('uid'));
    },
});


TrelloCal.Views.Events = Backbone.View.extend({
    collection: null,

    initialize: function(options) {
        this.collection = options.collection;
        this.collection.on("add", this.eventAdded, this);
        // this.collection.on("reset", this.render);
        this.collection.on("remove", this.destroyEvent);
        this.collection.on("change", this.changed);
    },

    changed: function(event) {
        event.save();
    },

    eventAdded: function(event) {
        this.renderOne(event);
        event.save();
        window.events.add(event);
    },

    destroyEvent: function(event) {
        window.events.remove(event);
        event.destroy();
    },

    renderOne: function(event) {
        var eventView = new TrelloCal.Views.Event({model: event});
        eventView.render();
    },

    render: function() {
        console.log("rendering");
        window.events.forEach(function(event) {
            this.renderOne(event);
        });
    },
});


window.events     = new TrelloCal.Collections.Events();
window.eventsView = new TrelloCal.Views.Events({collection: window.events});


function loadEvents(events) {
    _.each(events, function(eventJSON) {
        console.log(eventJSON);
        var event = new TrelloCal.Models.Event({name: eventJSON.name,
                                                sibling: eventJSON.sibling,
                                                uid: eventJSON.uid,
                                                task: new TrelloCal.Models.Task({
                                                    name: eventJSON.task.name,
                                                    id: eventJSON.task.id,
                                                    events: eventJSON.task.event }),
                                                start: new Time(eventJSON.start.hour + ":" + eventJSON.start.minute),
                                                end: new Time(eventJSON.end.hour + ":" + eventJSON.end.minute) });
        window.events.add(event);
    });
}

function saveCurrentToTemplate(templateName) {
    localStorage.setItem("template-" + templateName, JSON.stringify(window.events));

    var existingTemplates = localStorage.getItem("templates");
    if (existingTemplates == null) {
        existingTemplates = "";
    } else {
        existingTemplates += ",";
    }

    localStorage.setItem("templates", existingTemplates + "template-" + templateName);
}

function loadFromTemplate(templateName) {
    console.log(templateName);
    var loaded = JSON.parse(localStorage.getItem("template-" + templateName));
    console.log(loaded);
    loadEvents(loaded);
}

function getTemplateList() {
    var templates = [];
    $.each(localStorage, function(key, value) {
        templates.push(key);
    });
    return templates;
}
