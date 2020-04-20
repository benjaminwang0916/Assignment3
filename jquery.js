 var map;

 //initialize the map: 
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 43.6579, lng: -79.3791},
          zoom: 13
        });
//create info window for the kml points 
        var kml_infowindow = new google.maps.InfoWindow();
//add kml file to the map, use suppressInfoWindows to use the infowindow that we create   
        var subwaypoints = new google.maps.KmlLayer({
          url: 'https://raw.githubusercontent.com/benjaminwang0916/Assignment3/master/TTC%20Station%20points%20(1).kml',
          suppressInfoWindows: true,
          map: map,
        });
//add event when clicked on kml marker. Returns name of station and lat long coordinates.
        subwaypoints.addListener("click", function(event) {
          
          kml_infowindow.setContent(event.featureData.infoWindowHtml + event.latLng.toUrlValue(6));
          kml_infowindow.setPosition(event.latLng);
          kml_infowindow.open(map, subwaypoints);

        });
//add another event, when another marker is clicked, the previous marker will close.
        google.maps.event.addListener(map, 'click', function(event) {
          kml_infowindow.close();
        });

// Get the users current location. Requires the user to have pop-up enabled and to allow for geolocation 
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            var infowindow = new google.maps.InfoWindow({
              content: 'Your Location!'
            });
//add marker to geolocated position
            var marker = new google.maps.Marker({
              position: pos,
              map: map,
              title: 'Your Location!'
            });
//event listener for when the marker is clicked, returns "Your Location!" and closes marker when clicked away
            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });

            map.addListener('click', function(event) {
              infowindow.close();
            });
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }

//If geolocation isnt supported or failed, reutrns these messages.
      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
//Directions handler
        new AutocompleteDirectionsHandler(map);
      }


//make variables accessible to other functions, initialize the travel mode as walking, set directionsRenderer to display results into the div "directions"
      function AutocompleteDirectionsHandler(map) {
        this.map = map;
        this.originPlaceId = null;
        this.destinationPlaceId = null;
        this.travelMode = 'WALKING';
        this.directionsService = new google.maps.DirectionsService;
        this.directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          panel: document.getElementById('directions')
        });
        this.directionsRenderer.setMap(map);
//get input values from user, autocomplete addresses that are typed into the input (starting) and output(destination)
        var originInput = document.getElementById('origin-input');
        var destinationInput = document.getElementById('destination-input');
        var modeSelector = document.getElementById('mode-selector');
        var originAutocomplete = new google.maps.places.Autocomplete(originInput);
        originAutocomplete.setFields(['place_id']);
        var destinationAutocomplete =
            new google.maps.places.Autocomplete(destinationInput);
        destinationAutocomplete.setFields(['place_id']);
//change transportation modes. Gets the values from the input, to be used for the directionsService variable 
        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');
        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
// positioning of div elements for adress entry bar/travel mode selector
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            destinationInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
      }


      AutocompleteDirectionsHandler.prototype.setupClickListener = function(
          id, mode) {
        var radioButton = document.getElementById(id);
        var me = this;
        radioButton.addEventListener('click', function() {
          me.travelMode = mode;
          me.route();
        });
      };

      AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(
          autocomplete, mode) {
        var me = this;
        autocomplete.bindTo('bounds', this.map);

        autocomplete.addListener('place_changed', function() {
          var place = autocomplete.getPlace();

          if (!place.place_id) {
            window.alert('Please select an option from the dropdown list.');
            return;
          }
          if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
          } else {
            me.destinationPlaceId = place.place_id;
          }
          me.route();
        });
      };
      AutocompleteDirectionsHandler.prototype.route = function() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
          return;
        }
        var me = this;
// direction request created for input starting location and input destination location. 
        this.directionsService.route(
            {
              origin: {'placeId': this.originPlaceId},
              destination: {'placeId': this.destinationPlaceId},
              travelMode: this.travelMode
            },
            function(response, status) {
              if (status === 'OK') {
                me.directionsRenderer.setDirections(response);
              } else {
                window.alert('Directions request failed due to ' + status);
              }
            });

        }
    
