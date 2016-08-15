var Task = Backbone.Model.extend({
    initialize: function() {
        console.log("Task was created.");
    },
    defaults: {
        name: '',
        start: '',
        end: '',
        listed: true
    }
});

var TasksCollection = Backbone.Collection.extend({
    model: Task
});

var TaskView = Backbone.View.extend({
    el: '#sidebar',

    template: _.template($("#sidebar-template").html()),

    initialize: function() {
        console.log("loaded");
    },

    render: function() {
        this.$el.append(this.template(this.model.attributes));
        return this;
    }
});

var TasksView = Backbone.View.extend({
    el: '#sidebar',

    collection: null,

    initialize: function(options) {
        this.collection = options.collection;

        this.collection.forEach(function(task) {
            var taskView = new TaskView({model: task});
            taskView.render();
        });
    }

});
