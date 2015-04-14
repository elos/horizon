// --- Setup Dependencies {{{
var gulp = require('gulp');
// --- }}}

// --- Main Tasks {{{
// Default, run development build and server.
gulp.task('default',
    ['clean', 'lint', 'compile', 'watch', 'connect']
);

// Create a production ready build.
gulp.task('build',
    ['clean', 'lint', 'compile-dist']
);

// Run a test against a clean (linted) build
gulp.task('test',
    ['clean', 'lint', 'tests']
);
// --- }}}

// --- Helper Tasks {{{
// Runs code against jshint.
gulp.task('lint', function() {
    var jshint = require('gulp-jshint');

    // Lint all generic code
    gulp.src(['./assets/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));

    // Lint all app code
    gulp.src(['./app/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));

    // Lint all SCSS
    var scsslint = require('gulp-scsslint');

    gulp.src('./assets/scss/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.reporter())
        .pipe(scsslint.reporter('fail'));
});

// Cleans up all generated build files.
gulp.task('clean', function() {
    var del = require('del');

    del.sync(['./dist/*', './bundled.js', './bundled.css', '!./dist/.gitkeep']);
});

gulp.task('connect', function () {
    var connect = require('gulp-connect');

    connect.server({port: 8000});
});

gulp.task('watch', function() {
    gulp.watch([
        './app/**/*.js',
        './app/**/*.html',
        './index.html',
        './assets/**/*.scss'
    ], ['lint', 'compile']);
});

gulp.task('tests', function () {
    var karma = require('karma-as-promised');

    return karma.server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    });
});

// Development Only
gulp.task('compile', function() {
    // Compile and minify JavaScript
    var browserify = require('gulp-browserify'),
        concat = require('gulp-concat');

    gulp.src(['app/main.js'])
        .pipe(browserify({
            debug: true
        }))
        .pipe(concat('bundled.js'))
        .pipe(gulp.dest('./'))

    // Compile and minify SCSS to CSS
    var sass = require('gulp-sass');
    var minifyCSS = require('gulp-minify-css');

    gulp.src('./assets/scss/*.scss')
        .pipe(sass())
        .pipe(concat('bundled.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./'));
});

// Production quality, uglifies and does not include any
// debugging information.
gulp.task('compile-dist', function() {
    var browserify = require('gulp-browserify'),
        concat = require('gulp-concat'),
        stripDebug = require('gulp-strip-debug'),
        uglify = require('gulp-uglify');

    gulp.src(['app/main.js'])
        .pipe(browserify({
            debug: false
        }))
        .pipe(concat('bundled.js'))
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest('./dist/'))

    // Compile and minify SCSS to CSS
    var sass = require('gulp-sass');
    var minifyCSS = require('gulp-minify-css');

    gulp.src('./assets/scss/*.scss')
        .pipe(sass())
        .pipe(concat('bundled.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./dist'));

    // Copy HTML files
    gulp.src('./index.html')
        .pipe(gulp.dest('./dist/'));
    gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./dist/app'));

    // Optimize image assets
    var imageop = require('gulp-image-optimization');

    gulp.src(['./assets/img/**/*', '!./assets/img/.gitkeep'])
        .pipe(imageop({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('./dist/assets/img/'))
        .on('end', function () {
            console.log('Finished image optimization!');
        })
        .on('error', function () {
            console.log('Error: Image optimization error!');
        });

    // Startup a test server for the build
    var connect = require('gulp-connect');

    connect.server({root: './dist/', port: 8000});
});
// --- }}}
