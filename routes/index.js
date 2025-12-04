var express = require('express');
var router = express.Router();

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: function(req, file, cb) {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ được phép upload ảnh PNG và kích thước nhỏ hơn 1MB!'));
        }
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/upload', function(req, res, next) {
    res.render('upload', { title: 'File upload', error: null, files: [] });
});

router.post('/upload', function(req, res) {
    upload.array('upload')(req, res, function(err) {
        if (err) {
            return res.status(400).render('upload', {
                title: 'File upload',
                error: err.message,
                files: []
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).render('upload', {
                title: 'File upload',
                error: 'Vui lòng chọn ít nhất một ảnh PNG nhỏ hơn 5MB!',
                files: []
            });
        }

        const files = req.files.map(function(file) {
            return '/uploads/' + file.filename;
        });

        res.render('upload', {
            title: 'File upload',
            error: null,
            files: files
        });
    });
});
module.exports = router;
