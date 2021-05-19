const gulp = require("gulp"),
    RevAll = require("gulp-rev-all"),
    useref = require("gulp-useref"),
    gulpif = require("gulp-if"),
    path = require('path'),
    resources = require("gulp-resources"),
    minifyJs = require("gulp-uglify"),
    minifyCss = require("gulp-csso"),
    argv = require('yargs').argv,
    browserify = require('browserify'),
    vueify = require('vueify'),
    babelify = require('babelify'),
    gutil = require('gulp-util'),
    through = require('through2'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    envify = require('envify/custom'),
    buffer = require('vinyl-buffer');


const output = argv.output;

gulp.task("clean", function() {
    const del = require("del");
    return del(output, {force: true});
});

gulp.task("release", ["clean"], function() {
    return gulp.src(["favicon.ico",
        "robots.txt",
        "WEB-INF/templates/*.html",
        "static/css/*.woff",
        "static/css/*.woff2",
        "static/img/*",
        "static/img/**/*"], {allowEmpty: true})
        .pipe(resources({skipNotExistingFiles: true}))
        .pipe(gulpif("*.js", through.obj(function(file, encoding, next) {
            bundle = browserify({
                entries: path.relative(file.cwd, file.path),
                debug: true
            })
                .transform(vueify)
                .transform(
                    {global: true},
                    envify({NODE_ENV: 'production'})
                )
                .transform("babelify", {presets: ["es2015"]});

            bundle.bundle((err, buf) => {
                if (err) throw err;
                this.push(new gutil.File({
                    path: file.path,
                    contents: buf
                }));
                next();
            });
        })))
        .pipe(gulpif("*.html", useref()))
        .pipe(RevAll.revision({
            hashLength: 4,
            dontRenameFile: [/^\/favicon.ico$/g, /^\/robots.txt$/g, ".html", ".jpg"]
        }))
        .pipe(gulpif("*.js" && !"lib.js", minifyJs()))
        .pipe(gulpif("*.css", minifyCss()))
        .pipe(gulpif("*.jpg", gulp.dest(output+"/WEB-INF")))
        .pipe(gulp.dest(output));
});

gulp.task("watch", ["clean"], function() {
    return gulp.src(["favicon.ico",
        "robots.txt",
        "WEB-INF/templates/*.html",
        "static/css/*.woff",
        "static/css/*.woff2",
        "static/img/*",
        "static/img/**/*"], {allowEmpty: true})
        .pipe(resources({skipNotExistingFiles: true}))
        .pipe(gulpif("*.js", through.obj(function(file, encoding, next) {
            const filePath = path.relative(file.cwd, file.path);
            const browserifyBunndle = watchify(browserify(Object.assign({}, watchify.args, {
                cache: {}, // required for watchify
                packageCache: {}, // required for watchify
                entries: filePath,
                debug: true
            }))).transform(vueify)
                .transform("babelify", {presets: ["es2015"]});
            browserifyBunndle
                .bundle((err, buf) => {
                    if (err) throw err;
                    this.push(new gutil.File({
                        path: file.path,
                        contents: buf
                    }));
                    next();
                });
            browserifyBunndle.on('update', () => bundleFn(browserifyBunndle));
        })))
        .pipe(gulpif("*.html", useref()))
        .pipe(RevAll.revision({
            hashLength: 4,
            dontRenameFile: [/^\/favicon.ico$/g, /^\/robots.txt$/g, ".html", ".jpg"]
        }))
        .pipe(gulpif("*.jpg", gulp.dest(output+"/WEB-INF")))
        .pipe(gulp.dest(output));
});


const bundleFn = (browserifyBunndle) => {
    const t = new Date().getMilliseconds();
    gulp.src(["favicon.ico",
        "robots.txt",
        "WEB-INF/templates/*.html",
        "static/css/*.woff",
        "static/css/*.woff2",
        "static/img/*",
        "static/img/**/*"], {allowEmpty: true})
        .pipe(resources({skipNotExistingFiles: true}))
        .pipe(gulpif("*.js", through.obj(function(file, encoding, next) {
            browserifyBunndle
                .bundle((err, buf) => {
                    if (err) throw err;
                    this.push(new gutil.File({
                        path: file.path,
                        contents: buf
                    }));
                    next();
                });
        })))
        .pipe(gulpif("*.html", useref()))
        .pipe(RevAll.revision({
            hashLength: 4,
            dontRenameFile: [/^\/favicon.ico$/g, /^\/robots.txt$/g, ".html", ".jpg"]
        }))
        .pipe(gulpif("*.jpg", gulp.dest(output+"/WEB-INF")))
        .pipe(gulp.dest(output));

    gutil.log(`Updated in ${new Date().getMilliseconds() - t}ms`);

}