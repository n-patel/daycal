var tasksList = new TrelloCal.Collections.Tasks();

var importCards = function(cards) {
    $.each(cards, function(key, value) {
        tasksList.add( new TrelloCal.Models.Task({ name: value.name }) );
    });

    new TrelloCal.Views.Tasks({ collection: tasksList });
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
