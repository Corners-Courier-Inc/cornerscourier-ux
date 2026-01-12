let pickupCoords = null;
let dropoffCoords = null;

const pickupStreetInput = document.querySelector('input[name="pickup_street_address"]');
const pickupResultsDiv = document.getElementById('pickup-results');
const pickupCityInput = document.querySelector('input[name="pickup_city"]');
const pickupStateInput = document.querySelector('input[name="pickup_state"]');
const pickupZipInput = document.querySelector('input[name="pickup_zip"]');
// Removed pickupAutofillContainer as it's no longer needed for wrapping the full address input

const dropoffStreetInput = document.querySelector('input[name="delivery_street_address"]');
const dropoffResultsDiv = document.getElementById('dropoff-results');
const dropoffCityInput = document.querySelector('input[name="delivery_city"]');
const dropoffStateInput = document.querySelector('input[name="delivery_state"]');
const dropoffZipInput = document.querySelector('input[name="delivery_zip"]');
// Removed dropoffAutofillContainer as it's no longer needed for wrapping the full address input

const distanceDisplay = document.getElementById('distance');


/* ---------- AUTOCOMPLETE ---------- */
async function searchAddress(query, resultBox, setCoords, targetStreet, targetCity, targetState, targetZip) {
  if (query.length < 2) {
    resultBox.innerHTML = '';
    return;
  }

  let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&q=${encodeURIComponent(query)}`;

  // Attempt to get user's current location for biasing results
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        // Bias results towards user's location
        apiUrl += `&lat=${userLat}&lon=${userLon}`;
        performNominatimSearch(apiUrl, resultBox, setCoords, targetStreet, targetCity, targetState, targetZip);
      },
      (error) => {
        console.warn('Geolocation failed:', error.message);
        // If geolocation fails, proceed without biasing
        performNominatimSearch(apiUrl, resultBox, setCoords, targetStreet, targetCity, targetState, targetZip);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
    );
  } else {
    // Geolocation not supported, proceed without biasing
    performNominatimSearch(apiUrl, resultBox, setCoords, targetStreet, targetCity, targetState, targetZip);
  }
}

async function performNominatimSearch(apiUrl, resultBox, setCoords, targetStreet, targetCity, targetState, targetZip) {
  const res = await fetch(apiUrl, {
    headers: { 'Accept': 'application/json' }
  });
  const data = await res.json();

  resultBox.innerHTML = '';
  
  const allowedStates = ['Georgia', 'South Carolina', 'North Carolina', 'Alabama', 'Tennessee', 'Florida', 'GA', 'SC', 'NC', 'AL', 'TN', 'FL']; // Include both full names and abbreviations

  data.filter(place => {
    // Check if the state in the address details is in our allowed list
    const state = place.address.state;
    return state && allowedStates.includes(state);
  }).forEach(place => {
    const li = document.createElement('li');
    li.textContent = place.display_name;
    li.className = 'p-2 cursor-pointer hover:bg-gray-100'; // Add some styling
    li.onclick = () => {
      // Set coordinates
      setCoords({
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon)
      });

      // Populate granular fields
      let streetNum = place.address.house_number || '';
      let streetName = place.address.road || place.address.street || '';
      if (targetStreet) {
        targetStreet.value = (streetNum + ' ' + streetName).trim();
      }

      if (targetCity) targetCity.value = place.address.city || place.address.town || place.address.village || '';
      if (targetState) targetState.value = place.address.state || '';
      if (targetZip) targetZip.value = place.address.postcode || '';
      
      resultBox.innerHTML = ''; // Clear results
      calculateDistance(); // Recalculate distance
    };
    resultBox.appendChild(li);
  });
}

/* ---------- DISTANCE (Haversine) ---------- */
function calculateDistance() {
  if (!pickupCoords || !dropoffCoords) {
    distanceDisplay.textContent = '--';
    return;
  }

  const R = 3958.8; // miles
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

function toRad(value) {
  return (value * Math.PI) / 180;
}




/* ---------- EVENT LISTENERS ---------- */
pickupStreetInput.addEventListener('input', e => {
  searchAddress(
    e.target.value,
    pickupResultsDiv,
    coords => { pickupCoords = coords; },
    pickupStreetInput,
    pickupCityInput,
    pickupStateInput,
    pickupZipInput
  );
});

dropoffStreetInput.addEventListener('input', e => {
  searchAddress(
    e.target.value,
    dropoffResultsDiv,
    coords => { dropoffCoords = coords; },
    dropoffStreetInput,
    dropoffCityInput,
    dropoffStateInput,
    dropoffZipInput
  );
});

// Clear results when clicking outside
document.addEventListener('click', (e) => {
  if (!pickupStreetInput.contains(e.target) && !pickupResultsDiv.contains(e.target)) {
    pickupResultsDiv.innerHTML = '';
  }
  if (!dropoffStreetInput.contains(e.target) && !dropoffResultsDiv.contains(e.target)) {
    dropoffResultsDiv.innerHTML = '';
  }
});

// Initial distance calculation on load (if coords somehow present)
calculateDistance();