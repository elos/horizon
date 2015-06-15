// --- Setup Dependencies {{{
var gulp = require('gulp');
// --- }}}

// Babel the code --- {{{
var babelify = require('babelify'),
    browserify = require('browserify'),
    transform = require('vinyl-transform');

var browserified = transform(function(filename) {
    return browserify(filename, {
        debug: true,
        transform: [
            babelify.configure({ ignore: "bower_components" })
        ]
    }).bundle();
});
// --- }}}

// --- Main Tasks {{{
// Default, run development build and server.
gulp.task('default',
    [ 'clean', 'lint', 'watch', 'compile', 'connect' ]
);

// Create a production ready build.
gulp.task('build',
    [ 'clean', 'lint', 'compile-dist' ]
);

// Run a test against a clean (linted) build
gulp.task('test',
    [ 'clean', 'lint', 'tests' ]
);
// --- }}}

// --- Lint {{{
gulp.task('lint', function() {
    var eslint = require('gulp-eslint'),
        flow = require('gulp-flowtype'),
        jscs = require('gulp-jscs');

    // Lint all JavaScript and check style
    gulp.src([ './app/**/*.js', './assets/js/**/*.js' ])
        .pipe(flow())
        .pipe(jscs({
            "esnext": true,
            "esprima": "babel-jscs"
        }))
        .pipe(eslint())
        .pipe(eslint.format())

    // Lint all SCSS
    var scsslint = require('gulp-scsslint');

    gulp.src('./assets/scss/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.reporter())
        .pipe(scsslint.reporter('fail'));

    // Lint HTML
    var htmlhint = require('gulp-htmlhint');

    gulp.src('./index.html')
        .pipe(htmlhint())
        .pipe(htmlhint.failReporter())

    gulp.src('./app/**/*.html')
        .pipe(htmlhint({ 'doctype-first': false }))
        .pipe(htmlhint.failReporter())
});
// --- }}}

// --- Clean {{{
gulp.task('clean', function() {
    var del = require('del');

    del.sync([
        './dist/*', './bundled.js', './bundled.css', '!./dist/.gitkeep'
    ]);
});
// --- }}}

// --- Watch {{{
gulp.task('watch', function() {
    gulp.watch([
        './app/**/*.js',
        './app/**/*.html',
        './index.html',
        './assets/**/*.js',
        './assets/**/*.scss'
    ], [ 'lint', 'compile' ]);
});
// --- }}}

// --- Connect {{{
gulp.task('connect', function() {
    var connect = require('gulp-connect');

    connect.server({ port: 9393 });
});
// --- }}}

// --- Tests {{{
gulp.task('tests', function () {
    var karma = require('karma-as-promised');

    return karma.server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    });
});
// --- }}}

// --- Compile {{{
gulp.task('compile', function() {
    // Compile and minify JavaScript
    var concat = require('gulp-concat');

    gulp.src([ 'app/main.js' ])
        .pipe(browserified)
        .pipe(concat('bundled.js'))
        .pipe(gulp.dest('./'))

    // Compile and minify SCSS to CSS
    var sass = require('gulp-sass'),
        minifyCSS = require('gulp-minify-css');

    gulp.src('./assets/scss/*.scss')
        .pipe(sass())
        .pipe(concat('bundled.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./'));
});
// --- }}}

// --- Compile Dist {{{
gulp.task('compile-dist', function() {
    var concat = require('gulp-concat'),
        stripDebug = require('gulp-strip-debug'),
        uglify = require('gulp-uglify');

    gulp.src([ 'app/main.js' ])
        .pipe(browserified)
        .pipe(concat('bundled.js'))
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest('./dist/'))

    // Compile and minify SCSS to CSS
    var sass = require('gulp-sass'),
        minifyCSS = require('gulp-minify-css');

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

    gulp.src([ './assets/img/**/*', '!./assets/img/.gitkeep' ])
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

    connect.server({ root: './dist/', port: 8000 });
});
// --- }}}
