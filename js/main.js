document.addEventListener('DOMContentLoaded', function () {

    // Hero Slider Animation
    const sliderContainer = document.getElementById('hero-slider-container');
    if (sliderContainer) {
        const slides = sliderContainer.querySelectorAll('[data-slide]');
        let currentImageIndex = 0;

        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % slides.length;
            sliderContainer.style.transform = `translateX(-${currentImageIndex * 100}%)`;
        }

        setInterval(showNextImage, 5000); // Change image every 5 seconds
    }

    // Quote Form Handling
    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        // Set form timestamp to prevent bots
        const formTimestampField = document.getElementById('form_timestamp_quote');
        if (formTimestampField) {
            formTimestampField.value = Date.now();
        }

        // Helper function to geocode address (Fallback to Nominatim if autocomplete missed it)
        const geocodeAddress = async (address) => {
            // If google maps geocoder is available, use it
            if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
                const geocoder = new google.maps.Geocoder();
                return new Promise((resolve) => {
                    geocoder.geocode({ address: address, componentRestrictions: { country: 'US' } }, (results, status) => {
                        if (status === 'OK' && results[0] && results[0].geometry) {
                            resolve({
                                lat: results[0].geometry.location.lat(),
                                lon: results[0].geometry.location.lng()
                            });
                        } else {
                            resolve(null);
                        }
                    });
                });
            }

            // Otherwise, fall back to OpenStreetMap Nominatim
            const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(address)}`;
            try {
                const res = await fetch(apiUrl, { headers: { 'User-Agent': 'CornersCourierRedesign' } });
                const data = await res.json();
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                    };
                }
                return null;
            } catch (error) {
                console.error('Fallback geocoding error:', error);
                return null;
            }
        };

        // Helper to calculate Haversine distance
        const calculateHaversineDistance = (coords1, coords2) => {
            const toRad = (value) => (value * Math.PI) / 180;
            const R = 3958.8; // miles
            const dLat = toRad(coords2.lat - coords1.lat);
            const dLon = toRad(coords2.lon - coords1.lon);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return (R * c).toFixed(2);
        };

        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = quoteForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Calculating...</span>';

            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());
            let distance = document.getElementById('distance').textContent;

            // If distance was not calculated via autocomplete, calculate it now
            if (distance === '--' || distance === '') {
                const pickupAddress = `${data.pickup_street_address}, ${data.pickup_city}, ${data.pickup_state} ${data.pickup_zip}`;
                const deliveryAddress = `${data.delivery_street_address}, ${data.delivery_city}, ${data.delivery_state} ${data.delivery_zip}`;

                const [pickupCoords, dropoffCoords] = await Promise.all([
                    geocodeAddress(pickupAddress),
                    geocodeAddress(deliveryAddress)
                ]);

                if (pickupCoords && dropoffCoords) {
                    distance = calculateHaversineDistance(pickupCoords, dropoffCoords);
                    document.getElementById('distance').textContent = distance;
                } else {
                    distance = 'Could not calculate';
                }
            }
            
            data.distance = distance;
            submitButton.innerHTML = '<span class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Submitting Quote...</span>';

            try {
                const response = await fetch('/api/send-quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    window.location.href = '/thank-you';
                } else {
                    const errorData = await response.json();
                    alert(`Failed to send quote request: ${errorData.message || 'Unknown error'}`);
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            } catch (error) {
                console.error('Error submitting quote form:', error);
                alert('An unexpected error occurred. Please try again.');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });

        // Toggle "Other" description input dynamically
        const serviceTypeSelect = document.getElementById('service_type');
        const otherServiceDescriptionContainer = document.getElementById('other_service_description_container');
        const otherServiceDescriptionInput = document.getElementById('other_service_description');

        if (serviceTypeSelect && otherServiceDescriptionContainer && otherServiceDescriptionInput) {
            serviceTypeSelect.addEventListener('change', function() {
                if (serviceTypeSelect.value === 'Other') {
                    otherServiceDescriptionContainer.classList.remove('hidden');
                    otherServiceDescriptionInput.required = true;
                    otherServiceDescriptionInput.disabled = false;
                } else {
                    otherServiceDescriptionContainer.classList.add('hidden');
                    otherServiceDescriptionInput.required = false;
                    otherServiceDescriptionInput.disabled = true;
                    otherServiceDescriptionInput.value = '';
                }
            });
        }
    }

    // Tracking Button Logic
    const trackButton = document.getElementById('track-button');
    if (trackButton) {
        trackButton.addEventListener('click', function() {
            const trackingId = document.getElementById('tracking-id').value;
            if (trackingId) {
                window.location.href = `/contact?trackingId=${encodeURIComponent(trackingId)}#contact`;
            }
        });
    }

    const mobileTrackButton = document.getElementById('mobile-track-button');
    if (mobileTrackButton) {
        mobileTrackButton.addEventListener('click', function() {
            const trackingId = document.getElementById('mobile-tracking-id').value;
            if (trackingId) {
                window.location.href = `/contact?trackingId=${encodeURIComponent(trackingId)}#contact`;
            }
        });
    }
});
