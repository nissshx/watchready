const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();


const UPLOADS_DIR = path.join(__dirname, 'uploads');


router.post('/delete', (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'No video URL provided' });
  }

  // Extract the filename from the URL
  const fileName = path.basename(videoUrl);

  // Construct the full path to the file
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error deleting video' });
      }

      // Send a success response
      res.status(200).json({ message: 'Video deleted successfully' });
    });
  });
});

module.exports = router;
