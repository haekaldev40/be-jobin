const express = require('express');
const { getApplicantProfile, updateApplicantProfile } = require('../controllers/applicantProfile');
const { authToken } = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/profile', authToken, getApplicantProfile);
router.put('/profile', authToken, updateApplicantProfile)


module.exports = router