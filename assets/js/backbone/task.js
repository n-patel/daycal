TrelloCal.Models.Task = Backbone.Model.extend({
    initialize: function() {},

    defaults: {
        name: '',
        id: '',
        events: 0,
    }
});


TrelloCal.Collections.Tasks = Backbone.Collection.extend({
    model: TrelloCal.Models.Task,
});


TrelloCal.Views.Task = Backbone.View.extend({
    el: '#sidebar-list',
    template: _.template($("#sidebar-template").html()),

    initialize: function() {},

    render: function() {
        this.$el.append(this.template(this.model.attributes));
        return this;
    }
});

TrelloCal.Views.Tasks = Backbone.View.extend({
    el: '#sidebar',
    collection: null,

    events: {
        "click button": "clicked",
        "mouseenter button": "hover",
        "mouseleave button": "unhover",

        "click .color-button": "changeColor",
        "click .trash-button": "deleteTask"
    },

    clicked: function(e) {
        e.preventDefault();
        var id   = $(e.currentTarget).data("id");
        var task = this.collection.get(id);
        var name = task.get("name");
        var newEvent = new TrelloCal.Models.Event({name: name,
                                                   task: task,
                                                   sibling: task.get("events") });
        task.set("events", task.get("events") + 1);
        window.events.add(newEvent);        // TODO
    },

    hover: function(e) {
        var id = $(e.currentTarget).data("id");
        $("[data-id='" + id + "'] .hover-show").show();
    },

    unhover: function(e) {
        var id = $(e.currentTarget).data("id");
        $("[data-id='" + id + "'] .hover-show").hide();
    },

    changeColor: function(e) {
        e.stopImmediatePropagation();
        console.log("Change color.");
    },

    deleteTask: function(e) {
        e.stopImmediatePropagation();
        var id = $(e.currentTarget).parent().data("id");
        $("[data-id='" + id + "']").remove();
    },

    initialize: function(options) {
        this.collection = options.collection;
        this.collection.on('add', this.renderOne, this);
    },

    renderOne: function(task) {
        var taskView = new TrelloCal.Views.Task({model: task});
        taskView.render();
    },

    render: function() {
        d3.selectAll(".task").remove();
        this.collection.forEach(function(task) {
            // Should be replaced with this.renderOne(task);
            // which for some reason is erroring: 'this.renderOne is not a function'.
            var taskView = new TrelloCal.Views.Task({model: task});
            taskView.render();
        });
    },
});
