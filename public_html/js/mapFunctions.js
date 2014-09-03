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
var clickPosition;

$(document).ready(function() {
    //Initialize Map
    map = new GMaps({
        el: '#map',
        lat: -12.043333,
        lng: -77.028333,
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

    // Marker added
    GMaps.on('marker_added', map, function(marker) {
        $('#clickposition').html('<li><a href="#" class="pan-to-marker" data-marker-lat="' + marker.getPosition().lat() + '" data-marker-lng="' + marker.getPosition().lng() + '">' + marker.title + ' Lat:' + marker.getPosition().lat() + ' Lng:' + marker.getPosition().lng() + '</a></li>');
    });

    GMaps.on('click', map.map, function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        map.removeMarkers();
        map.addMarker({
            lat: lat,
            lng: lng,
            title: 'clickPosition'
        });
        clickPosition = JSON.parse('{"lat":"' + lat + '","lng":"' + lng + '"}');
    });
});

// Fix Map Resize on navigation
function resize() {
    mapObj = map;
    google.maps.event.trigger(mapObj.map, 'resize');
    
//        Center on first Marker on resize
//        
//        var ob = mapObj.map.markers.position.ob;
//        var pb = mapObj.map.markers.position.pb;
//        latLongShit = new google.maps.LatLng(ob, pb);
//        mapObj.map.setCenter(latLongShit);
}
$('a[href="#jumbogame"]').on('shown.bs.tab', function(e) {
    resize();
});
