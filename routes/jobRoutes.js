const express = require('express');
const { createJob, getRecruiterJobs, updateJob, getJobById, deleteJob, getAllJobs, getJobByIdPublic } = require('../controllers/jobController');
const {authToken, checkRole} = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/public', getAllJobs)
router.get('/public/:jobId', getJobByIdPublic);

router.post('/', authToken, createJob)
router.get('/', authToken, getRecruiterJobs)
router.get('/:jobId', authToken, getJobById)
router.put('/:jobId', authToken, updateJob)
router.delete('/:jobId', authToken, deleteJob)


module.exports = router;