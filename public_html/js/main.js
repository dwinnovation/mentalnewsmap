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
        currentArticle: {},
        remainingArticles: [],
        answeredArticles: [],
    };
}

function showArticle() {
    // activate "game" tab:
    $('#tabnav a[href="#game"]').tab('show');
    // select random article from remaining:
    var i = Math.floor(Math.random() * state.remainingArticles.length);
    // extract and move to currentArticle
    state.currentArticle = state.remainingArticles.splice(i, 1);
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
    // extract unique categories from articles:
    var categories = [];
    $.each(articles, function(index, article){
        if ($.inArray(article.kategorie, categories)==-1) {
            categories.push(article.kategorie);
        }
    });
    
    // dynamically generate category links:
    $.each(categories, function(index, category){
        // each element should look like this: <li class="category"><a data-category="Sport">Sport</a></li>
        var li = $('<li/>').addClass('category').append(
            $('<a />').data('category', category).text(category)
        );
        $('#start .choosecategory').append(li);
    });
    
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