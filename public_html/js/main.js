// enable tab navigation
$('#tabnav a').click(function(e) {
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
        results: [],
        currentArticle: {},
        remainingArticles: [],
        answeredArticles: [],
    };
    
    // mock data for design:
    state.results.push({
        p1: new google.maps.LatLng(33.7243396617476, 36.9140625),
        p2: new google.maps.LatLng(47.99659, 37.815894999999955)
    });
    state.results.push({
        p1: new google.maps.LatLng(8.059229627200192, -71.71875),
        p2: new google.maps.LatLng(38.76306, -90.2799)
    });
    state.results.push({
        p1: new google.maps.LatLng(3.1624555302378474, 19.6875),
        p2: new google.maps.LatLng(7.963092, 30.158930000000055)
    });
    state.results.push({
        p1: new google.maps.LatLng(22.268764039073965, 18.6328125),
        p2: new google.maps.LatLng(38.73899, -90.275375)
    });
    state.results.push({
        p1: new google.maps.LatLng(34.016241889667015, -91.0546875),
        p2: new google.maps.LatLng(38.76306, -90.2799)
    });
    state.answeredArticles = articles.splice(0,5);
}

/**
 * Get a score for the specified distance. Guesses close to the real value (small distance) get a better score, guesses further away get less points.
 * The maximum number of points is 100, minimum number 0.
 * @param distancee
 */
function score(distance) {
    if (distance < 0.1) {
        // less than 100m: full points
        return 100.0;
    } else if (distance > 100.0) {
        // more than 100km: 0 points
        return 0;
    } else {
        // normalize value to range 1..0:
        var val = (1 - ((distance - 0.1) / 100.0));
        // apply curve (TODO: balance):
        var val = val * val;
        // scale to range 100..0, round up:
        return Math.ceil(100.0 * val);
    }
}

function showArticle() {
    // update progress bar:
    $('#progress .progress-bar').css('width', state.answeredArticles.length * 20 + "%");
    // select random article from remaining:
    var i = Math.floor(Math.random() * state.remainingArticles.length);
    // extract and move to currentArticle
    state.currentArticle = state.remainingArticles.splice(i, 1)[0];
    //Initialize a new mapObj with the articles position for calculating the distance later
    p2 = new google.maps.LatLng(state.currentArticle.latitude, state.currentArticle.longitude);
    //Show the articles Picture
    $('#picture img').attr('src', state.currentArticle.imageUrl);
}

function showFinish() {
    // TODO: remove this - dummy content!
    state.answeredArticles = articles.slice(0, 5);
    // update score:
    $('#finish .resultoverview .points').text(state.points);
    // make sure the template is hidden:
    $('#finish .resultoverview .article.template').hide();
    // remove previous results:
    $('#finish .resultoverview .article').not('.template').remove();
    // create article divs for all answers
    $.each(state.answeredArticles, function(i, art) {
        console.log("generating one clone");
        // clone template div:
        var div = $('#finish .resultoverview .article.template').clone().removeClass('template');
        // fill text fields:
        div.find('.text .headline').text(art.articleTitle);
        div.find('.text .teasertext').text(art.teaser);
        div.find('.text a.more').prop('href', art.articleUrl);
        div.find('.bg-image').css('background', 'url(' + art.imageUrl + ') center center');
        // append to page:
        div.show();
        $('#finish .resultoverview').append(div);
    });
}

function renderArticle(article, domObjectId) {
    $('#finish .resultoverview .article.template').hide();
    // remove previous results:
    console.log(article);
    $(domObjectId + ' .article').not('.template').remove();
    console.log("generating Article: " + article.articleTitle + " and rendering to " + domObjectId);
    // clone template div:
    var div = $('#finish .resultoverview .article.template').clone().removeClass('template');
    // fill text fields:
    div.find('.text .headline').text(article.articleTitle);
    div.find('.text .teasertext').text(article.teaser);
    div.find('.text a.more').prop('href', article.articleUrl);
    div.find('.bg-image').css('background', 'url(' + article.imageUrl + ') center center');
    // append to selected domObj:
    div.show();
    $(domObjectId).append(div);
}
/**
 * Main game workflow function
 * @param state
 */
function switchGameState(gameState) {
    console.log("switching game state to " + gameState);
    switch (gameState) {
    case 'start':
        initState();
        $('#tabnav a[href="#start"]').tab('show');
        break;
    case 'game':
        if (state.answeredArticles.length < 5) {
            showArticle();
            $('#tabnav a[href="#game"]').tab('show');
        } else {
            switchGameState('finish');
        }
        break;
    case 'finish':
        showFinish();
        $('#tabnav a[href="#finish"]').tab('show');
        break;
    }
}

/**
 * init the "start" jumbotron
 */
function initJumboStart() {
    // extract unique categories from articles:
    var categories = [];
    $.each(articles, function(index, article) {
        if ($.inArray(article.kategorie, categories) == -1) {
            categories.push(article.kategorie);
        }
    });

    // dynamically generate category options:
    $.each(categories, function(i, category) {
        var opt = $('<option/>').val(category).text(category);
        $('#choosecategory').append(opt);
    });

    // handle clicks on category selection links:
    $('#choosecategory').change(function() {
        var category = $(this).val();
        // load article (sub-)set into state variable:
        if (!category) {
            return;
        } else if (category == 'any') {
            // all categories -> all articles
            state.remainingArticles = articles;
        } else {
            // selected category -> filter articles
            state.remainingArticles = $.grep(articles, function(art) {
                return art.kategorie == category
            }
            );
        }
        // start the gane by switching to state "game"
        switchGameState('game');
    });
}

function initJumboFinish() {
    $('#playagain').click(function() {
        switchGameState('start');
    });
}

$(document).ready(function() {
    // add code to run after page load here
    initJumboStart();
    initJumboFinish();

    // start the game:
    // switchGameState('start');
    switchGameState('finish');
});
