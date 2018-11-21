var postcss = require("gulp-postcss"),
    gulp = require("gulp"),
    del = require('del'),
    handlebars = require('handlebars'),
    convert = require('gulp-convert'),
    mkdirp = require('mkdirp'),
    sourcemaps = require("gulp-sourcemaps"),
    gutil = require('gulp-util'),
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
    jsonmin = require('gulp-jsonmin'),
    dataConfig = require('./data/config/data.json'),
    siteConfig = require('./data/config/site.json');



gulp.task('default', ['watch', 'browser-sync']);
gulp.task('build', ['css', 'js-app', 'template', 'move']);


// Live reload server
gulp.task('browser-sync', function () {
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
});

// JavaScript
gulp.task('js-app', function () {
    _.each(['main.js'], function (file) {
        browserify(`./app/js/${file}`)
            .transform(babelify)
            .transform(rollupify)
            .bundle()
            .pipe(source(file))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
            .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./public/js/'));
    });
});

// CSS
gulp.task("css", function () {
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

gulp.task('template', function (cb) {
    var meta = filterMeta();
    var categories = [];
    _.each(dataConfig, function (el) {
        if (categories.indexOf(el.category) === -1) {
            categories.push(el.category);
        }
    });

    var source = fs.readFileSync('./app/index.html', 'utf-8').toString();
    var data = {
        cachebuster: Math.floor((Math.random() * 100000) + 1),
        siteConfig: siteConfig,
        description: meta,
        dataConfig: dataConfig,
        categories: categories
    };

    handlebars.registerHelper('ifCond', function (v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    handlebars.registerHelper('desc', function (m) {
        return data.description['m' + m];
    });

    handlebars.registerHelper('fancyURL', function (url) {
        url = url.replace('http://', '').replace('https://', '');
        if (url[url.length - 1] === '/') {
            url = url.substring(0, url.length - 1);
        }
        return url;
    });

    var template = handlebars.compile(source);
    var html = template(data);
    fs.writeFileSync(path.join('./public/', 'index.html'), html);
    cb();
});

// Get short description from meta into JSON array for SWIG
function filterMeta() {
    var meta = {};
    _.each(dataConfig, function (m) {
        var str = fs.readFileSync(`./data/meta/m${m.metric}.md`).toString();
        str = str.substring(str.indexOf("\n"), str.indexOf("###"));
        str = str.replace(/\r\n|\r|\n/g, '');
        meta['m' + m.metric] = str.trim();
    });
    return meta;
}


gulp.task('meta', function (cb) {
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
    for (var i = 0; i < jsonArray.length; i++) {
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
