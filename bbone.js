window.TrelloCal = {
    Models: {},
    Collections: {},
    Views: {}
};

TrelloCal.Models.Task = Backbone.Model.extend({
    initialize: function() {},

    defaults: {
        name: '',
        start: '',
        end: '',
        inCalendar: false
    }
});

TrelloCal.Collections.Tasks = Backbone.Collection.extend({
    model: TrelloCal.Models.Task
});

TrelloCal.Views.Task = Backbone.View.extend({
    el: '#sidebar',

    template: _.template($("#sidebar-template").html()),
    templateCalendar: _.template($("#event-template").html()),

    initialize: function() {},

    render: function() {
        if (this.model.attributes.inCalendar) {
            createEvent(this.model.attributes.name, new Date(2016, 7, 13, 9), new Date(2016, 7, 13, 12));
        } else {
            this.$el.append(this.template(this.model.attributes));
        }
        return this;
    }
});

TrelloCal.Views.Tasks = Backbone.View.extend({
    el: '#sidebar',

    collection: null,

    initialize: function(options) {
        this.collection = options.collection;

        this.collection.forEach(function(task) {
            var taskView = new TrelloCal.Views.Task({model: task});
            taskView.render();
        });
    }
});
