var tasksList = new TrelloCal.Collections.Tasks();
var tasksListView;

var importCards = function(cards) {
    $.each(cards, function(key, value) {
        tasksList.add(new TrelloCal.Models.Task({ name: value.name,
                                                  id:   value.id  }) );
    });

    tasksListView = new TrelloCal.Views.Tasks({ collection: tasksList });
    tasksListView.render();
}

var loadCards = function() {
    var myList = "55dbffbe1ddddab4372dbc3c";
    var response = Trello.get('/lists/' + myList + '/cards',
                              importCards,
                              function() { console.log("Failed to load cards."); });
}


function authWithTrello() {

    var authenticationFailure = function() { console.log('Failed authentication'); };

    Trello.authorize({
        type: "redirect",
        name: "Trello Daily Scheduler",
        scope: {
            read: true,
            write: true },
        expiration: "never",
        success: loadCards,
        error: authenticationFailure
    });
}
