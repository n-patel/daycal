TrelloCal.Models.Event = Backbone.Model.extend({
    initialize: function() {},

    defaults: {
        name: '',
        task: '',       // id of associated task
        start: '',
        end: '',
    }
});


TrelloCal.Collections.Events = Backbone.Collection.extend({
    model: TrelloCal.Models.Event,
});


TrelloCal.Views.Event = Backbone.View.extend({
    render: function() {
        createEvent(this.model.attributes.name, new Time("9:00", 0), new Time("11:00", 0));
    },
});


TrelloCal.Views.Events = Backbone.View.extend({
    collection: null,

    initialize: function(options) {
        this.collection = options.collection
        this.collection.on("add", this.renderOne, this);
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
new TrelloCal.Views.Events({collection: window.events});
