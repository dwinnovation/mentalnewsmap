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
        remainingQuestions: [],
        answeredQuestions: [],
    };
}

/**
 * init the "start" jumbotron
 */
function initJumboStart() {
    $('#jumbostart .category a').click(function(){
        var category = $(this).data('category');
        if (typeof category == 'undefined') {
            // all categories
        } else {
            // selected category
        }
    });
}

$( document ).ready(function(){
    // add code to run after page load here
    initJumboStart();
    initState();
});