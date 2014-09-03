/* 
 * Copyright 2014 X201.
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

$(document).ready(function() {
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

// Fix Map Resize on navigation
function resize() {
    mapObj = map;
    google.maps.event.trigger(mapObj.map, 'resize');
}
//Places a marker
function placeMarker(position) {
    if (mapZoom == map.getZoom()) {
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
    }
}
//Register show map tab event
$('a[href="#game"]').on('shown.bs.tab', function(e) {
    resize();
});

//calculates distance between two points in km's
function calcDistance(p1, p2) {
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

//creates a new path to draw
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
//actually shows the path on the map
function addLine(map) {
    flightPath.setMap(map.map);
}

//removes the line on the map
function removeLine() {
    flightPath.setMap(null);
}
//Showing Result overlay
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
        $('#distanceAway').text(calcDistance(p1, p2));
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
        //Render current Article
        renderArticle(state.currentArticle, '#currentResultArticle');
    });
// Submit button clickHandler
$('#nextButton').on('click', function(event) {
    $('#resultMap').empty(); //Remove resultMap to get rid of the lines
});
