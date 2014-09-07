var state = {};
var articles = [];

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
}

/**
 * Get a score for the specified distance. Guesses close to the real value (small distance) get a
 * better score, guesses further away get less points. The maximum number of points is 100,
 * minimum number 0.
 * @param distance
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
    $('#progress .progress-bar').css('width', (state.answeredArticles.length / config.numQuestions) * 100 + '%');
    // select random article from remaining:
    var i = Math.floor(Math.random() * state.remainingArticles.length);
    // extract and move to currentArticle
    state.currentArticle = state.remainingArticles.splice(i, 1)[0];
    //Initialize a new mapObj with the articles position for calculating the distance later
    p2 = new google.maps.LatLng(state.currentArticle.Latitude, state.currentArticle.Longitude);
    //Show the articles Picture
    $('#picture img').attr('src', state.currentArticle.Image_URL);
}

function showFinish() {
    // update score:
    $('#finish .resultoverview .points').text(state.points);
    // make sure the template is hidden:
    $('#finish .resultoverview .article.template').hide();
    // remove previous results:
    $('#finish .resultoverview .article').not('.template').remove();
    // create article divs for all answers
    $.each(state.answeredArticles, function(i, art) {
        // clone template div:
        var div = $('#finish .resultoverview .article.template').clone().removeClass('template');
        // fill text fields:
        div.find('.text .headline').text(art.Artikel_Titel);
        div.find('.text .teasertext').text(art.Teaser);
        div.find('.text a.more').prop('href', art.Artikel_URL);
        div.find('.bg-image').css('background', 'url(' + art.Image_URL + ') center center');
        // append to page:
        div.show();
        $('#finish .resultoverview').append(div);
    });
}

function renderArticle(article, domObjectId) {
    $('#finish .resultoverview .article.template').hide();
    // remove previous results:
    $(domObjectId + ' .article').not('.template').remove();
    // clone template div:
    var div = $('#finish .resultoverview .article.template').clone().removeClass('template');
    // fill text fields:
    div.find('.text .headline').text(article.Artikel_Titel);
    div.find('.text .teasertext').text(article.Teaser);
    div.find('.text a.more').prop('href', article.Artikel_URL);
    div.find('.bg-image').css('background', 'url(' + article.Image_URL + ') center center');
    // append to selected domObj:
    div.show();
    $(domObjectId).append(div);
}

/**
 * Main game workflow function
 * @param gameState
 */
function switchGameState(gameState) {
    switch (gameState) {
        case 'start':
            initState();
            $('#tabnav a[href="#start"]').tab('show');
            break;
        case 'game':
            if (state.answeredArticles.length < config.numQuestions) {
                showArticle();
                $('#tabnav a[href="#game"]').tab('show');
            } else {
                switchGameState('finish');
            }
            break;
        case 'finish':
            showFinish();
            $('#tabnav a[href="#finish"]').tab('show');
            updateEndResults();
            break;
    }
}

function importArticles(articleData) {
    articles = articleData;
    
    // extract unique categories from articles:
    var categories = [];
    $.each(articles, function(index, article) {
        if ($.inArray(article.Kategorie, categories) == -1) {
            categories.push(article.Kategorie);
        }
    });

    // dynamically generate category options:
    $.each(categories, function(i, category) {
        var opt = $('<option/>').val(category).text(category);
        $('#choosecategory').append(opt);
    });
}

/**
 * init the "start" jumbotron
 */
function initJumboStart() {
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
                return art.Kategorie == category
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
    $('#link-twitter').click(function() {
        var text='Ich habe ' + state.points + ' von ' + (config.numQuestions * 100) + ' Punkten bei #TheMentalNewsMap erreicht. Weißt Du mehr? http://bit.ly/scoophack';
        window.location.href='http://twitter.com/share?text='+encodeURIComponent(text);
    });
}

function updateEndResults() {
    endResultMap = new GMaps({
        el: '#endResultMap',
        lat: 72.91963546581482,
        lng: -75.05859375,
        zoom: 10,
        zoomControl: true,
        zoomControlOpt: {
            style: 'SMALL',
            position: 'TOP_LEFT'
        },
        panControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        overviewMapControl: false
    });
    if (typeof (state.results) !== 'undefined') {
        $('.points').text(state.points);
        var bounds = []; // Map boundaries
        $.each(state.results, function(index, point) {
            endResultMap.addMarker({
                lat: point.p1.lat(),
                lng: point.p1.lng(),
                title: 'clickPosition',
                icon: "img/marker_pink.png"
            });
            endResultMap.addMarker({
                lat: point.p2.lat(),
                lng: point.p2.lng(),
                title: 'articlePosition',
                icon: "img/marker_blue.png"
            });
            drawPath(endResultMap, point.p1, point.p2);
            bounds.push(point.p1);
            bounds.push(point.p2);
        });
        resize(endResultMap);
        endResultMap.fitLatLngBounds(bounds);
    }
}

var easteregg;
$(document).ready(function() {
    
    // code to run after page load

    // load the article data
    importCsv(function(articleData){
       importArticles(articleData);
    });

    // enable (hidden) tab navigation
    $('#tabnav a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });    
    
    // init the click-handlers for start- and finish-pages
    initJumboStart();
    initJumboFinish();

    // easteregg
    easteregg = new Konami();
    easteregg.code = function() {
        nyancat_start();
    };
    easteregg.load();

    // start the game:
    switchGameState('start');
});
