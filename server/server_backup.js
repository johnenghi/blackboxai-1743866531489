const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { compressVideo } = require('./convert');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
const staticPath = path.join(__dirname, '../');
console.log('Static files directory:', staticPath);
console.log('Directory contents:', fs.readdirSync(staticPath));

app.use((req, res, next) => {
  console.log('Incoming request for:', req.url);
  next();
});

app.use(express.static(staticPath, {
  setHeaders: (res, path) => {
    console.log('Serving static file:', path);
  }
}));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/video\/(mp4|quicktime)/)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4/MOV videos allowed'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Video compression endpoint
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const outputPath = path.join('/tmp', `compressed_${Date.now()}.mp4`);
    const resultPath = await compressVideo(req.file.buffer, outputPath);
    
    res.json({
      status: 'success',
      filename: path.basename(resultPath),
      message: 'Video compressed successfully'
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: 'Compression failed', details: error.message });
  }
});

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join('/tmp', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, () => fs.unlinkSync(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Clean up old files every 30 minutes
setInterval(() => {
  fs.readdir('/tmp', (err, files) => {
    files.forEach(file => {
      if (file.startsWith('compressed_')) {
        const filePath = path.join('/tmp', file);
        const stats = fs.statSync(filePath);
        if (Date.now() - stats.mtimeMs > 30 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      }
    });
  });
}, 30 * 60 * 1000);