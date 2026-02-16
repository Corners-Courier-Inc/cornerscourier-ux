document.addEventListener('DOMContentLoaded', function () {

    const sliderContainer = document.getElementById('hero-slider-container');
    if (sliderContainer) {
        const images = sliderContainer.querySelectorAll('img');
        let currentImageIndex = 0;

        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            sliderContainer.style.transform = `translateX(-${currentImageIndex * 100}%)`;
        }

        setInterval(showNextImage, 5000); // Change image every 5 seconds
    }

    const quoteForm = document.getElementById('quote-form');
    if (quoteForm) {
        // Set form timestamp on load
        const formTimestampField = document.getElementById('form_timestamp_quote');
        if (formTimestampField) {
            formTimestampField.value = Date.now();
        }

        // Helper function to geocode an address string using Nominatim
        const geocodeAddress = async (address) => {
            const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(address)}`;
            try {
                const res = await fetch(apiUrl);
                const data = await res.json();
                if (data && data.length > 0) {
                    return {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon)
                    };
                }
                return null;
            } catch (error) {
                console.error('Geocoding error:', error);
                return null;
            }
        };

        // Helper function to calculate distance
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
            submitButton.innerHTML = 'Submitting...';

            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());
            let distance = document.getElementById('distance').textContent;

            // If distance wasn't calculated via autocomplete, try to calculate it now
            if (distance === '--') {
                submitButton.innerHTML = 'Calculating Distance...';
                const pickupAddress = `${data.pickup_street_address}, ${data.pickup_city}, ${data.pickup_state} ${data.pickup_zip}`;
                const deliveryAddress = `${data.delivery_street_address}, ${data.delivery_city}, ${data.delivery_state} ${data.delivery_zip}`;

                const [pickupCoords, dropoffCoords] = await Promise.all([
                    geocodeAddress(pickupAddress),
                    geocodeAddress(deliveryAddress)
                ]);

                if (pickupCoords && dropoffCoords) {
                    distance = calculateHaversineDistance(pickupCoords, dropoffCoords);
                    document.getElementById('distance').textContent = distance; // Update display
                } else {
                    distance = 'Could not calculate'; // Set fallback text instead of blocking
                }
            }
            
            data.distance = distance;
            submitButton.innerHTML = 'Submitting...';

            try {
                const response = await fetch('/api/send-quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    window.location.href = '/thank-you.html';
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
                    otherServiceDescriptionInput.value = ''; // Clear value when hidden
                }
            });
        }
    }

    const trackButton = document.getElementById('track-button');
    if (trackButton) {
        trackButton.addEventListener('click', function() {
            const trackingId = document.getElementById('tracking-id').value;
            if (trackingId) {
                window.location.href = `contact.html?trackingId=${trackingId}#contact`;
            }
        });
    }

    const mobileTrackButton = document.getElementById('mobile-track-button');
    if (mobileTrackButton) {
        mobileTrackButton.addEventListener('click', function() {
            const trackingId = document.getElementById('mobile-tracking-id').value;
            if (trackingId) {
                window.location.href = `contact.html?trackingId=${trackingId}#contact`;
            }
        });
    }


});
