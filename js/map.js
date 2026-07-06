let pickupCoords = null;
let dropoffCoords = null;
let pickupAutocomplete = null;
let dropoffAutocomplete = null;

// Initialize Google Maps Autocomplete
function initAutocomplete() {
  if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
    console.warn("Google Maps API not yet loaded.");
    return;
  }

  const options = {
    types: ['address'],
    componentRestrictions: { country: 'us' }
  };

  const pickupStreetInput = document.querySelector('input[name="pickup_street_address"]');
  const dropoffStreetInput = document.querySelector('input[name="delivery_street_address"]');

  if (pickupStreetInput) {
    pickupAutocomplete = new google.maps.places.Autocomplete(pickupStreetInput, options);
    pickupAutocomplete.addListener('place_changed', () => fillAddressFields(pickupAutocomplete, 'pickup'));
  }

  if (dropoffStreetInput) {
    dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffStreetInput, options);
    dropoffAutocomplete.addListener('place_changed', () => fillAddressFields(dropoffAutocomplete, 'delivery'));
  }
}

// Extract address components from Google Places result and autofill form fields
function fillAddressFields(autocomplete, type) {
  const place = autocomplete.getPlace();
  
  if (!place.geometry || !place.geometry.location) {
    console.warn("No geometry returned for place: " + place.name);
    return;
  }

  const coords = {
    lat: place.geometry.location.lat(),
    lon: place.geometry.location.lng()
  };

  if (type === 'pickup') {
    pickupCoords = coords;
  } else {
    dropoffCoords = coords;
  }

  let streetNumber = '';
  let route = '';
  let city = '';
  let state = '';
  let zip = '';

  if (place.address_components) {
    for (let i = 0; i < place.address_components.length; i++) {
      const component = place.address_components[i];
      const addressType = component.types[0];

      if (addressType === 'street_number') {
        streetNumber = component.long_name;
      } else if (addressType === 'route') {
        route = component.long_name;
      } else if (addressType === 'locality') {
        city = component.long_name;
      } else if (addressType === 'administrative_area_level_1') {
        state = component.short_name; // Use short code (e.g. GA)
      } else if (addressType === 'postal_code') {
        zip = component.long_name;
      }
    }
  }

  const streetAddress = `${streetNumber} ${route}`.trim();

  if (type === 'pickup') {
    const stInput = document.querySelector('input[name="pickup_street_address"]');
    const cInput = document.querySelector('input[name="pickup_city"]');
    const sInput = document.querySelector('input[name="pickup_state"]');
    const zInput = document.querySelector('input[name="pickup_zip"]');

    if (stInput && streetAddress) stInput.value = streetAddress;
    if (cInput) cInput.value = city;
    if (sInput) sInput.value = state;
    if (zInput) zInput.value = zip;
  } else {
    const stInput = document.querySelector('input[name="delivery_street_address"]');
    const cInput = document.querySelector('input[name="delivery_city"]');
    const sInput = document.querySelector('input[name="delivery_state"]');
    const zInput = document.querySelector('input[name="delivery_zip"]');

    if (stInput && streetAddress) stInput.value = streetAddress;
    if (cInput) cInput.value = city;
    if (sInput) sInput.value = state;
    if (zInput) zInput.value = zip;
  }

  calculateDistance();
}

// Calculate distance via Haversine Formula
function calculateDistance() {
  const distanceDisplay = document.getElementById('distance');
  if (!distanceDisplay) return;

  if (!pickupCoords || !dropoffCoords) {
    distanceDisplay.textContent = '--';
    return;
  }

  const R = 3958.8; // Radius of the Earth in miles
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(dropoffCoords.lat - pickupCoords.lat);
  const dLon = toRad(dropoffCoords.lon - pickupCoords.lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickupCoords.lat)) *
      Math.cos(toRad(dropoffCoords.lat)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  distanceDisplay.textContent = distance.toFixed(2);
}

// Trigger initialization if Google Maps library is already loaded
window.addEventListener('load', () => {
  if (typeof google !== 'undefined' && google.maps) {
    initAutocomplete();
  }
});