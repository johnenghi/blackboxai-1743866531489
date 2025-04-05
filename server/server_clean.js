const express = require('express');
const app = express();
const port = 3000;

// Minimal configuration
app.disable('x-powered-by');

// Test route
app.get('/test.js', (req, res) => {
  console.log('Serving test.js');
  res.type('js').send('console.log("Test successful");');
});

// Start server
const server = app.listen(port, () => {
  console.log(`Clean test server running on port ${port}`);
});

// Export for testing
module.exports = server;