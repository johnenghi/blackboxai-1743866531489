const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressVideo } = require('./convert_fixed');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Explicit app.js route
// In-memory app.js content
const appJSContent = `
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
`;

// Test endpoint
app.get('/test.js', (req, res) => {
  console.log('Serving test.js');
  res.set({
    'Content-Type': 'application/javascript'
  }).send('console.log("Test endpoint working");');
});

app.get('/app.js', (req, res) => {
  console.log('Serving app.js from memory');
  res.set({
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }).send(appJSContent);
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Compression endpoint
app.post('/api/compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const outputPath = path.join(__dirname, '../compressed.mp4');
        await compressVideo(req.file.buffer, outputPath);

        res.json({ 
            status: 'success',
            filename: 'compressed.mp4',
            downloadUrl: '/api/download/compressed.mp4'
        });
    } catch (error) {
        console.error('Compression error:', error);
        const errorMessage = error.message.includes('Invalid video file format') 
            ? 'Please upload a valid MP4 video file' 
            : 'Compression failed. Please try another file';
        res.status(500).json({ 
            error: errorMessage,
            details: error.message 
        });
    }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../', req.params.filename);
    res.download(filePath);
});

// Static files
app.use(express.static(path.join(__dirname, '../')));

// Test download endpoint
app.get('/test-download', (req, res) => {
    res.download(path.join(__dirname, '../test.pdf'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});