var postcss = require("gulp-postcss"),
    gulp = require("gulp"),
    del = require('del'),
    handlebars = require('handlebars'),
    convert = require('gulp-convert'),
    mkdirp = require('mkdirp'),
    sourcemaps = require("gulp-sourcemaps"),
    gutil = require('gulp-util'),
    imagemin = require('gulp-imagemin'),
    browserSync = require('browser-sync'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babelify = require('babelify'),
    rollupify = require('rollupify'),
    uglify = require('gulp-uglify'),
    nano = require('gulp-cssnano'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    jsoncombine = require("gulp-jsoncombine"),
    jsonmin = require('gulp-jsonmin'),
    dataConfig = require('./data/config/data.js'),
    siteConfig = require('./data/config/site.js');



gulp.task('datagen', ['clean', 'convert', 'transform', 'merge-json']);
gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['css', 'js-app', 'template', 'imagemin', 'move']);


// Live reload server
gulp.task('browser-sync', function() {
    browserSync(['./public/**/*'], {
        server: {
            baseDir: "./public"
        }
    });
});

// watch tasks
gulp.task('watch', function () {
    gulp.watch(['./app/*.html'], ['template']);
    gulp.watch(['./app/css/**/*.css'], ['css']);
    gulp.watch(['./app/js/**/*.js'], ['js-app']);
    gulp.watch('./app/img/**/*', ['imagemin']);
});

// JavaScript
gulp.task('js-app', function () {
    _.each(['main.js'], function(file) {
        browserify(`./app/js/${file}`)
          .transform(babelify)
          .transform(rollupify)
          .bundle()
          .pipe(source(file))
          .pipe(buffer())
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
          .on('error', gutil.log)
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest('./public/js/'));
    });
});

// CSS
gulp.task("css", function() {
    return gulp.src(['./app/css/main.css'])
        .pipe(sourcemaps.init())
        .pipe(postcss([
            require("postcss-import")(),
            require("postcss-nested"),
            require("autoprefixer")({
                'browers': ['last 2 version']
            })
        ]))
        .pipe(gutil.env.type === 'production' ? nano() : gutil.noop())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'));
});

// image minification
gulp.task('imagemin', function() {
    return gulp.src('./app/img/*')
        .pipe(imagemin({
            optimizationLevel: 5,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest('public/img'));
});


gulp.task('template', function(cb) {
    var meta = filterMeta();
    var categories = [];
    _.each(dataConfig, function(el) {
        if (categories.indexOf(el.category) === -1) { categories.push(el.category); }
    });

    var source = fs.readFileSync('./app/index.html', 'utf-8').toString();
    var data = {
        cachebuster: Math.floor((Math.random() * 100000) + 1),
        siteConfig: siteConfig,
        description: meta,
        dataConfig: dataConfig,
        categories: categories
    };

    handlebars.registerHelper('ifCond', function(v1, v2, options) {
        if(v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    handlebars.registerHelper('desc', function(m) {
        return data.description['m' + m];
    });

    var template = handlebars.compile(source);
    var html = template(data);
    fs.writeFileSync(path.join('./public/', 'index.html'), html);
    cb();
});


// move stuff from app to public
gulp.task('move', function() {
    gulp.src('./app/fonts/*.*')
        .pipe(gulp.dest('./public/fonts/'));
});


// Get short description from meta into JSON array for SWIG
function filterMeta() {
    var meta = {};
    _.each(dataConfig, function(m) {
        var str = fs.readFileSync(`./data/meta/m${m.metric}.md`).toString();
        str = str.substring(str.indexOf("\n"), str.indexOf("###"));
        str = str.replace(/\r\n|\r|\n/g,'');
        meta['m' + m.metric] = str.trim();
    });
    return meta;
}


gulp.task('meta', function(cb) {
    var meta = filterMeta();
    cb();
});


// return true if convertable to number
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
    var jsonOut = {};
    for(var i = 0; i < jsonArray.length; i++) {
        jsonOut[jsonArray[i]["id"]] = {};
        var keys = Object.keys(jsonArray[i]);
        var key = keys[keys.length - 1];
        if (isNumeric(jsonArray[i][key])) {
            jsonOut[jsonArray[i]["id"]][key] = Number(jsonArray[i][key]);
        } else {
            jsonOut[jsonArray[i]["id"]][key] = null;
        }
    }
    return jsonOut;
}


// merge json
gulp.task('merge-json', ['clean', 'convert', 'transform'], function() {
    return gulp.src("tmp/pre/*.json")
        .pipe(jsoncombine("data.json", function(data){ return new Buffer(JSON.stringify(data)); }))
        .pipe(jsonmin())
        .pipe(gulp.dest("public/data/metric"));
});

// clean junk before build
gulp.task('clean', function(cb) {
    del(['tmp/**']).then(cb());
});


// csv to jxon
gulp.task('convert', ['clean'], function() {
    mkdirp('./data/metric');
    return gulp.src('data/metric/*.csv')
        .pipe(convert({
            from: 'csv',
            to: 'json'
        }))
        .pipe(gulp.dest('tmp/'));
});

// convert/move json files
gulp.task('transform', ['clean', 'convert'], function(cb) {
    var dest = "./tmp/pre";
    var config = dataConfig;

    mkdirp(dest);

    _.each(config, function(m) {
        if (m.type === "sum") {
            let r = require('./tmp/r' + m.metric + '.json');
            fs.writeFileSync(path.join(dest, `r${m.metric}.json`), JSON.stringify(jsonTransform(r), null, '  '));
        }
        if (m.type === "mean") {
            let r = require('./tmp/r' + m.metric + '.json');
            fs.writeFileSync(path.join(dest, `r${m.metric}.json`), JSON.stringify(jsonTransform(r), null, '  '));
        }
        if (m.type === "weighted") {
            let r = require('./tmp/r' + m.metric + '.json');
            var d = require('./tmp/d' + m.metric + '.json');
            fs.writeFileSync(path.join(dest, `r${m.metric}.json`), JSON.stringify(jsonTransform(r), null, '  '));
            fs.writeFileSync(path.join(dest, `w${m.metric}.json`), JSON.stringify(jsonTransform(d), null, '  '));
        }
    });

    cb();
});
