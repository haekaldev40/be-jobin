const express = require('express');
const { authToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { applyJob, getHistoryJob } = require('../controllers/applyJobController');

const router = express.Router();

router.get('/history-apply', authToken, getHistoryJob)
router.post('/apply-job', authToken, upload.single('cvResume'), applyJob)



module.exports = router