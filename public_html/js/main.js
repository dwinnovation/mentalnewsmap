// enable tab navigation
$('#tabnav a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})

var state = {};

/**
 * reset the game state:
 */
function initState() {
    state = {
        points: 0,
        remainingArticles: [],
        answeredArticles: [],
    };
}

function showArticle() {
    // activate "game" tab:
    $('#tabnav a[href="#game"]').tab('show');
    // load question to view:
    // TODO
}

/**
 * Main game workflow function
 * @param state
 */
function switchGameState(state) {
    switch (state) {
    case 'start':
        initState();
        break;
    case 'game':
        showArticle();
        break;
    case 'result':
        // TODO
        break;
    case 'finish':
        // TODO
        break;
    }
}

/**
 * init the "start" jumbotron
 */
function initJumboStart() {
    // handle clicks on category selection links:
    $('#start .category a').click(function(){
        var category = $(this).data('category');
        // load article (sub-)set into state variable:
        if (typeof category == 'undefined') {
            // all categories -> all articles
            state.remainingArticles = articles;
        } else {
            // selected category -> filter articles
            state.remainingArticles = $.grep(articles, function(art){
                return art.kategorie == category}
            );
        }
        // start the gane by switching to state "game"
        switchGameState('game');
    });
}

$( document ).ready(function(){
    // add code to run after page load here
    initJumboStart();
    
    // start the game:
    switchGameState('start');
});