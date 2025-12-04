var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Multer configuration
const multer = require('multer');
const consele = require("debug");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        console.log(file.originalname);
        console.log(file.mimetype);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function(req, file, cb) {
        // Chấp nhận file ảnh, video và mp3
        if(file.mimetype.startsWith('image') ||
            file.mimetype.startsWith('video') ||
            file.mimetype === 'audio/mpeg' ||
            file.mimetype === 'audio/mp3') {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh, video hoặc mp3!'), false);
        }
    }
});

// Error handling middleware for multer
app.use(function(err, req, res, next) {
    if(err instanceof multer.MulterError){
        // Lỗi từ Multer (vd: file quá lớn)
        if(err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File quá lớn! Tối đa 5MB');
        }
        return res.status(400).send('Lỗi upload: ' + err.message);
    } else if(err) {
        // Lỗi khác (vd: từ fileFilter)
        return res.status(400).send(err.message);
    }
    next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
