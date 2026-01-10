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
        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());
            data.distance = document.getElementById('distance').textContent;

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
                }
            } catch (error) {
                console.error('Error submitting quote form:', error);
                alert('An unexpected error occurred. Please try again.');
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
