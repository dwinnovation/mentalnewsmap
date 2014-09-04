/* 
 * Copyright 2014 Milan Burgmann.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var map; //The map Obj.
var clickPosition; //Holds the current lat, lng for the clicked point on the map
var p1; //Position the player clicked
var p2; //Position where the picture was taken
var location; //current position
var mapZoom; //Saves the current map zoom to prevent doubleclick-marker-placement
var flightPath; //Saves the direct line between the two points
var myScore; //The score achieved with the last click


$(document).ready(function() {
    $('#submitguess').prop('disabled', true); //prevent modal from opening until user adds a position
    //Initialize Map
    map = new GMaps({
        el: '#map',
        lat: 72.91963546581482,
        lng: -75.05859375,
        zoom: 2,
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

    // Click handler for the map
    GMaps.on('click', map.map, function(event) {
        position = event.latLng;
        mapZoom = map.getZoom();
        setTimeout("placeMarker(position)", 600);
    });
});

/**
 * Resizes the map 'm' to its window
 * This was needed because the maps are changing in size after switching to the
 * containing bootstrap tab and were displayed too small
 * @param m is a Gmaps.js map object
 */
function resize(m) {
    mapObj = m;
    google.maps.event.trigger(mapObj.map, 'resize');
}

/**
 * Places a Marker at 'position'
 * @param position expects a 'Google.maps.LatLng' Object
 */
function placeMarker(position) {
    if (mapZoom === map.getZoom()) {
        var lat = position.lat();
        var lng = position.lng();
        clickPosition = JSON.parse('{"lat":"' + lat + '","lng":"' + lng + '"}');
        p1 = new google.maps.LatLng(clickPosition.lat, clickPosition.lng);
        map.removeMarkers(); //remove existing markers before adding the new one
        if (typeof (flightPath) !== 'undefined') {
            removeLine(); //remove existing lines on the map
        }
        map.addMarker({
            lat: p1.lat(),
            lng: p1.lng(),
            title: 'clickPosition',
            icon: "img/marker_pink.png"
        });
        $('#submitguess').prop('disabled', false); //enable the submit button
    }
}
//This resizes the Map once the game is shown
$('a[href="#game"]').on('shown.bs.tab', function(e) {
    resize(map);
});

/**
 * Calculates the distance between two points 'p1' and 'p2'
 * @param {google.maps.LatLng} p1 The first location
 * @param {google.maps.LatLng} p2 The second location
 * @returns {Float} the distance in km
 */
function calcDistance(p1, p2) {
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

//creates a new path to draw
/**
 * Draws a line between two given locations on a given map
 * and sets the boundaries of the map to show the two locations in the window
 * @param {GMAPS.map} map expects a GMAPS.map Object containing a map
 * @param {google.maps.LatLng} p1 the first location
 * @param {google.maps.LatLng} p2 the second location
 */
function drawPath(map, p1, p2) {
    path = [p1, p2];
    flightPath = new google.maps.Polyline({
        path: path,
        strokeColor: '#131540',
        strokeOpacity: 1,
        strokeWeight: 4
    });
    map.fitLatLngBounds([p1, p2]);
    addLine(map);
}

/**
 * Adds a line created by drawPath() to a given map
 * @param {GMAPS.map} map expects a GMAPS.map Object
 */
function addLine(map) {
    flightPath.setMap(map.map);
}

//removes the line on the map
/**
 * Removes the line created with drawPath() from the map it is currently on
 */
function removeLine() {
    flightPath.setMap(null);
}

//Showing Result overlay after submitting a guess
//It shows you your score this round and the map with both locations
//Wait for the overlay to load before showing the map
$('#myModal').on('shown.bs.modal', function() {
    resultMap = new GMaps({
        el: '#resultMap',
        lat: p2.lat(),
        lng: p2.lng(),
        zoom: 2,
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
    var distance = calcDistance(p1, p2);
    myScore = score(distance);
    $('#distanceAway').text(distance);
    $('#overlayPoints').text(myScore);
    drawPath(resultMap, p1, p2);
    resultMap.addMarker({
        lat: p2.lat(),
        lng: p2.lng(),
        title: 'articlePosition',
        icon: "img/marker_blue.png"
    });
    resultMap.addMarker({
        lat: p1.lat(),
        lng: p1.lng(),
        title: 'clickPosition',
        icon: "img/marker_pink.png"
    });
    //Render current Article to the result overlay
    renderArticle(state.currentArticle, '#currentResultArticle');
});

// Next button clickHandler
$('#nextButton').on('click', function(event) {
    $('#resultMap').empty(); //Remove resultMap to get rid of the lines
    map.removeMarkers(); //remove the old Marker from the Map
    // save result:
    state.results.push({
        p1: p1,
        p2: p2,
        score: myScore
    });
    // add points:
    state.points += myScore;
    // move current article to set of answered articles
    state.answeredArticles.push(state.currentArticle);
    state.currentArticle = null;

    $('#submitguess').prop('disabled', true); //Disable the button until the user adds another Marker
    // trigger game workflow for next question/finish
    switchGameState('game');
});
