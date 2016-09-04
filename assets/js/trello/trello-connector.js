(function() {
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

    tasksListView.render();
};


/**
 * Load cards from the given list id.
 */
var loadCards = function(listId) {
    var response = Trello.get('/lists/' + listId + '/cards',
                              importCards,
                              function() { console.log("Failed to load cards."); });
};
window.loadCards = loadCards;


var populateLists = function(boardId) {
    window.lists = {};
    d3.select(".modal-list").html("");
    var response = Trello.get('/boards/' + boardId + '/lists/', function(lists) {
        $.each(lists, function(key, value) {
            window.lists[value.name] = value.id;
            d3.select(".modal-list").append("li")
                                    .text(value.name)
                                    .attr("class", "list-group-item")
                                    .attr("data-id", value.id)
                                    .on("click", function() {
                                        loadCards(value.id);
                                        saveToLocalStorage("selected-list", value.id);
                                    });
        });
    });
};
window.populateLists = populateLists;


var populateBoards = function(boards) {
    window.boards = {};
    d3.select(".modal-list").html("");
    $.each(boards, function(key, value) {
        if (!value.closed) {
            window.boards[value.name] = value.id;
            d3.select(".modal-list").append("li")
                                    .text(value.name)
                                    .attr("class", "list-group-item")
                                    .attr("data-id", value.id)
                                    .on("click", function() {
                                        populateLists(d3.select(this).attr("data-id"));
                                    });
        };
    });
};
window.populateBoards = populateBoards;


var getBoards = function() {
    var selectedList = getFromLocalStorage("selected-list");
    if (selectedList != null) {
        loadCards(selectedList);
    }
    var response = Trello.get('/members/me/boards', populateBoards);
};


/**
 * Authenticate with Trello using its API.
 */
var authWithTrello = function() {

    var authenticationFailure = function() { console.log('Failed authentication'); };

    Trello.authorize({
        type: "redirect",
        name: "DayCal.io",
        scope: {
            read: true,
            write: true },
        expiration: "never",
        success: getBoards,
        error: authenticationFailure
    });
};
window.authWithTrello = authWithTrello;

})();
