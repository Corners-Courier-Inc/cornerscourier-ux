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

    const quoteForm = document.getElementById('quote');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            const form = event.target;
            const formData = new FormData(form);
            const formspreeEndpoint = form.action;

            // Formulate subject and message as before, then append to formData
            const name = form.querySelector('input[name="name"]').value;
            const phone = form.querySelector('input[name="phone"]').value;
            const email = form.querySelector('input[name="email"]').value; // Added email field
            const serviceType = form.querySelector('select[name="service_type"]').value;
            const pickupStreet = form.querySelector('input[name="pickup_street_address"]').value;
            const pickupCity = form.querySelector('input[name="pickup_city"]').value; // Corrected name
            const pickupState = form.querySelector('input[name="pickup_state"]').value; // Corrected name
            const pickupZip = form.querySelector('input[name="pickup_zip"]').value; // Corrected name
            const deliveryStreet = form.querySelector('input[name="delivery_street_address"]').value;
            const deliveryCity = form.querySelector('input[name="delivery_city"]').value; // Corrected name
            const deliveryState = form.querySelector('input[name="delivery_state"]').value; // Corrected name
            const deliveryZip = form.querySelector('input[name="delivery_zip"]').value; // Corrected name
            const message = form.querySelector('textarea[name="message"]').value;
            const otherServiceDescriptionField = document.getElementById('other_service_description');
            const otherServiceDescription = otherServiceDescriptionField ? otherServiceDescriptionField.value : '';

            const formattedSubject = `New Quote Request - ${serviceType} - ${name}`;
            // Construct the formatted message body
            let formattedMessage = `Client Information:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nShipment Details:\nService Type: ${serviceType}`;

            if (serviceType === 'Other' && otherServiceDescription) {
                formattedMessage += ` (${otherServiceDescription})`;
            }

            formattedMessage += `\n\nPickup Address:\n${pickupStreet}\n${pickupCity}, ${pickupState} ${pickupZip}\n\nDelivery Address:\n${deliveryStreet}\n${deliveryCity}, ${deliveryState} ${deliveryZip}\n\nClient Message:\n${message}`.trim();

            // Append these to the FormData object
            formData.set('_subject', formattedSubject);
            formData.set('message', formattedMessage); // Overwrite if already present, or add

            try {
                const response = await fetch(formspreeEndpoint, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    window.location.href = '/thank-you'; // Changed to /thank-you
                } else {
                    const errorData = await response.json();
                    console.error('Formspree submission error:', errorData);
                    alert('There was an error submitting your quote request. Please try again.');
                }
            } catch (error) {
                console.error('Network or other error:', error);
                alert('There was a problem connecting to the server. Please check your internet connection and try again.');
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