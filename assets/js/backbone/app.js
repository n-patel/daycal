window.TrelloCal = {
    Models: {},
    Collections: {},
    Views: {}
};

TrelloCal.Models.Task = Backbone.Model.extend({
    initialize: function() {},

    defaults: {
        name: '',
        id: '',
        start: '',
        end: '',
        inCalendar: false
    }
});

TrelloCal.Collections.Tasks = Backbone.Collection.extend({
    model: TrelloCal.Models.Task
});

TrelloCal.Views.Task = Backbone.View.extend({
    el: '#sidebar-list',

    template: _.template($("#sidebar-template").html()),

    initialize: function() {},

    render: function() {
        if (this.model.attributes.inCalendar) {
            createEvent(this.model.attributes.name, new Time("9:00", 0), new Time("11:00", 0));
        } else {
            this.$el.append(this.template(this.model.attributes));
        }
        return this;
    }
});

TrelloCal.Views.Tasks = Backbone.View.extend({
    el: '#sidebar',

    collection: null,

    events: {
        "click button": "clicked"
    },

    clicked: function(e) {
        e.preventDefault();
        var id = $(e.currentTarget).data("id");
        var task = this.collection.get(id);
        var name = task.get("name");
        task.attributes.inCalendar = true;
        (new TrelloCal.Views.Task({model: task})).render();
    },

    initialize: function(options) {
        this.collection = options.collection;
        this.collection.on('reset', this.render, this);

        this.collection.forEach(function(task) {
            var taskView = new TrelloCal.Views.Task({model: task});
            taskView.render();
        });
    }
});
