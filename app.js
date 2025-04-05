// WhatsApp Status Compressor - Client Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized successfully');
    
    // Get DOM elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const previewVideo = document.getElementById('previewVideo');
    
    // Basic functionality test
    if (dropzone && fileInput && previewVideo) {
        console.log('All required elements found');
        dropzone.addEventListener('click', () => {
            console.log('Dropzone clicked');
            fileInput.click();
        });
    } else {
        console.error('Missing required elements');
    }
});