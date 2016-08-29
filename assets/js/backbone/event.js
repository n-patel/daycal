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
    localStorage: new Backbone.LocalStorage("EventsList"),
});


TrelloCal.Views.Event = Backbone.View.extend({
    render: function() {
        createEvent(this.model.attributes.name,
                    this.model.attributes.start,
                    this.model.attributes.end,
                    this.model.attributes.uid);
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
    },

    destroyEvent: function(event) {
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


window.events = new TrelloCal.Collections.Events();
window.eventsView = new TrelloCal.Views.Events({collection: window.events});
