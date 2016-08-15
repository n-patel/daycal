/*
var getCardTitles = function(cards) {
    $.each(cards, function(key, value) {
        titles.push( new Task({ name: value.name }) );
    })
    // d3.select("#sidebar").selectAll("p").data(cardTitles).enter().append("p").text(function(d) {
    //     return d;
    // });
    // console.log(titles);
    // tasks = new Tasks(titles);
}
*/

var tasksList = new TasksCollection();

var getCardTitles = function(cards) {
    $.each(cards, function(key, value) {
        tasksList.add( new Task({ name: value.name }) );
    });

    new TasksView({collection: tasksList});
}

var loadCards = function() {
    var myList = "55dbffbe1ddddab4372dbc3c";
    var response = Trello.get('/lists/' + myList + '/cards',
                              getCardTitles,
                              function() { console.log("Failed to load cards."); });
    console.log(typeof(response));
}

function authWithTrello() {
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

var authenticationFailure = function() { console.log('Failed authentication'); };
