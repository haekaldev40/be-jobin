const express = require('express');
const { authToken, checkRole } = require('../middleware/authMiddleware');
const { getRecruiterProfile, updateRecruiterProfile, getCompanyByName, getApplicantsAfterApply, updateApplicationStatus, getDashboardOverview } = require('../controllers/recruiterController');


const router = express.Router();


router.get('/companies/:companyName', getCompanyByName)

router.get('/overview', authToken, getDashboardOverview)
router.get('/applicants/apply-job', authToken, getApplicantsAfterApply)
router.get('/profile', authToken, getRecruiterProfile);
router.put('/profile', authToken, updateRecruiterProfile);
router.patch('/applicants/:applicationId/status', authToken, updateApplicationStatus)

module.exports = router;