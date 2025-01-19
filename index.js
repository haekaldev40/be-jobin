const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv").config();
const authRoutes = require('./routes/authRoutes')
const jobRoutes = require('./routes/jobRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const applyJobRoutes = require('./routes/applyRoutes')
const applicantRoutes = require('./routes/applicantRoutes')
const path = require('path');

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.use('/api/auth', authRoutes)
app.use('/api/recruiter', recruiterRoutes)
app.use('/api/applicant', applicantRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/apply', applyJobRoutes)

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
