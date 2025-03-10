const express = require('express');
const upload = require('./config/multer');
const cloudinary = require('./config/cloudnari');

const router = express.Router();

// 📌 رفع الصور
router.post('/upload-image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'يرجى رفع صورة' });

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'image' }, //النوع
      (error, result) => { //كول باك ترحع الضوره او الايرور
        if (error) return res.status(500).json({ error: error.message });
        res.json({ imageUrl: result.secure_url });
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 رفع الفيديوهات
router.post('/upload-video', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'يرجى رفع فيديو' });

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'video' },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ videoUrl: result.secure_url });
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
