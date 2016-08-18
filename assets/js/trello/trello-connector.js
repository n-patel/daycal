// (function() {
var tasksList = new TrelloCal.Collections.Tasks();
var tasksListView = new TrelloCal.Views.Tasks({ collection: tasksList })

/**
 * Import cards into backbone model.
 */
var importCards = function(cards) {
    tasksList.reset();
    $.each(cards, function(key, value) {
        tasksList.add(new TrelloCal.Models.Task({ name: value.name,
                                                  id:   value.id  }) );
    });

    // tasksListView ;
    tasksListView.render();
};


/**
 * Load cards from the given list id.
 * TODO: make list id a method argument.
 */
var loadCards = function() {
    var myList = "55dbffbe1ddddab4372dbc3c";
    var response = Trello.get('/lists/' + myList + '/cards',
                              importCards,
                              function() { console.log("Failed to load cards."); });
};
window.loadCards = loadCards;


/**
 * Authenticate with Trello using its API.
 */
var authWithTrello = function() {

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
};
window.authWithTrello = authWithTrello;

// })();
