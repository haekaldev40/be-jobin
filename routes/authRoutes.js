const express = require('express')
const { registerApplicant, registerRecruiter, loginUser } = require('../controllers/authController')
const upload = require('../middleware/uploadMiddleware')



const router = express.Router()

// Register Route
router.post('/register/applicant', registerApplicant)
router.post('/register/recruiter', upload.single('companyLogo'), registerRecruiter)
router.post('/login', loginUser)

module.exports = router