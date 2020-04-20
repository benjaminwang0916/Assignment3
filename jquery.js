 var map;
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 43.6579, lng: -79.3791},
          zoom: 13
        });

        var kml_infowindow = new google.maps.InfoWindow();
        
        var subwaypoints = new google.maps.KmlLayer({
          url: 'https://raw.githubusercontent.com/benjaminwang0916/Assignment3/master/TTC%20Station%20points.kml',
          preserveViewport: false,
          suppressInfoWindows: true,
          map: map,
        });
        subwaypoints.addListener("click", function(event) {
          
          kml_infowindow.setContent(event.featureData.infoWindowHtml + event.latLng.toUrlValue(6));
          kml_infowindow.setPosition(event.latLng);
          kml_infowindow.open(map, subwaypoints);

        });

        google.maps.event.addListener(map, 'click', function(event) {
          kml_infowindow.close();
        });

      
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            var infowindow = new google.maps.InfoWindow({
              content: 'Your Location!'
            });

            var marker = new google.maps.Marker({
              position: pos,
              map: map,
              title: 'Your Location!'
            });

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

      
      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
        new AutocompleteDirectionsHandler(map);
      }

      /**
       * @constructor
       */
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

        var originInput = document.getElementById('origin-input');
        var destinationInput = document.getElementById('destination-input');
        var modeSelector = document.getElementById('mode-selector');

        var originAutocomplete = new google.maps.places.Autocomplete(originInput);
        // Specify just the place data fields that you need.
        originAutocomplete.setFields(['place_id']);

        var destinationAutocomplete =
            new google.maps.places.Autocomplete(destinationInput);
        // Specify just the place data fields that you need.
        destinationAutocomplete.setFields(['place_id']);

        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            destinationInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
      }

      // Sets a listener on a radio button to change the filter type on Places
      // Autocomplete.
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
    
