// const multer = require('multer')
// const path = require('path')

// // Tentukan tempat penyimpanan dan penamaan file
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/') // Buat folder 'uploads/logos' jika belum ada
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, uniqueSuffix + file.originalname) // simpan dengan unique name
//   },
// })

// const upload = multer({ storage: storage })

// module.exports = upload

const multer = require('multer')
const path = require('path')
const fs = require('fs');

const uploadDirectory = 'public/uploads';
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory)
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname)
        cb(null, uniqueName)
    }
})

module.exports = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } })
