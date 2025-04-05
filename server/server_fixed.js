const express = require('express');
const path = require('path');
const { compressVideo } = require('./convert');

const app = express();
const port = 3000;

// Basic configuration
app.disable('x-powered-by');
app.use(express.json());

// Serve static files from root
app.use(express.static(path.join(__dirname, '../')));

// Explicit JavaScript route
app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../app.js'), {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache'
    }
  });
});

// Video compression endpoint
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    const outputPath = path.join('/tmp', `compressed_${Date.now()}.mp4`);
    const resultPath = await compressVideo(req.file.buffer, outputPath);
    res.json({ status: 'success', filename: path.basename(resultPath) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Fixed server running on port ${port}`);
});