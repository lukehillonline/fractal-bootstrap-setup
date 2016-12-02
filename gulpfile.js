/*
 * Require all gulp packages.
 */
var gulp = require('gulp'),
    open = require('gulp-open'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    runSequence = require('run-sequence'),
    sourceMaps = require('gulp-sourcemaps'),
    tinypngcomp = require('gulp-tinypng-compress');

/*
 * Import the Fractal instance configured in the fractal.js file.
 */
const fractal  = require('./fractal.js');

/*
 * Make use of Fractal's console object for logging.
 */
const logger = fractal.cli.console;

/*
 * Base urls.
 */
var src = 'assets/src/',
    dist = 'assets/dist/',
    images = 'assets/images/';

/*
 * Watched urls.
 */
var htmlSources = ['**/*.html'],
    jsSources = [src+'js/**/*.js'],
    cssSources = [src+'scss/**/*.scss'];

/*
 * Starts a Fractal development server.
 */
gulp.task('fractal:start', function(){
    const server = fractal.web.server({
        sync: true
    });
    server.on('error', err => logger.error(err.message));
    return server.start().then(() => {
        logger.success(`Fractal server is now running at ${server.urls.sync.local}`);
    });
});

/*
 * Runs a static HTML export of the web UI.
 */
gulp.task('fractal:build', function(){
    const builder = fractal.web.builder();
    builder.on('progress', (completed, total) => logger.update(`Exported ${completed} of ${total} items`, 'info'));
    builder.on('error', err => logger.error(err.message));
    return builder.build().then(() => {
        logger.success('Fractal build completed!');
    });
});

/*
 * Opens the fractal server in your default browser.
 */
gulp.task('open', function() {
    gulp.src('./')
    .pipe(open({
        uri: 'http://localhost:3000'
    }))
})

/*
 * watches for file changes and runs tasks depending on what has changed.
 */
gulp.task('watch', ['scss:website', 'scss:styleguide', 'scripts:main', 'scripts:libs'], function() {
    gulp.watch(src+'scss/**/*.scss', ['scss:website']);
    gulp.watch('styleguide/**/*.scss', ['scss:styleguide']);
    gulp.watch(src+'js/**/*.js', ['scripts:main', 'scripts:libs']);
});

/*
 * Compiles SCSS and exports CSS to dist folder. 
 */
gulp.task('scss:website', function() {
    return gulp.src(src+'scss/global.scss')
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(dist+'css'));
});

/*
 * Compiles SCSS and exports CSS to dist folder. 
 */
gulp.task('scss:styleguide', function() {
    return gulp.src('styleguide/assets/styleguide.scss')
        .pipe(sourceMaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(dist+'css'));
});

/*
 * Compiles all main scritps into 'main.min.js' and exports to the dist folder.
 * JS files that need to be compiled are managed manually below. 
 */
gulp.task('scripts:main', function() {
    return gulp.src([
            src+'js/app.js',
            src+'js/main.js',
            src+'js/features/feature.js',
        ])
        .pipe(sourceMaps.init())
        .pipe(concat('main.min.js'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(dist+'js'));
});

/*
 * Compiles all lins scritps into 'libs.min.js' and exports to the dist folder.
 * JS files that need to be compiled are managed manually below.
 * 
 * All Bootstrap libs have already been added, this is becuase Bootstrap recommends they be loaded
 * in this order, just uncomment the file you need when adding new features.
 */
gulp.task('scripts:libs', function() {
    return gulp.src([
            src+'js/libs/jquery.js'
            // src+'js/libs/bootstrap/transition.js',
            // src+'js/libs/bootstrap/alert.js',
            // src+'js/libs/bootstrap/button.js',
            // src+'js/libs/bootstrap/carousel.js',
            // src+'js/libs/bootstrap/collapse.js',
            // src+'js/libs/bootstrap/dropdown.js',
            // src+'js/libs/bootstrap/modal.js',
            // src+'js/libs/bootstrap/tooltip.js',
            // src+'js/libs/bootstrap/popover.js',
            // src+'js/libs/bootstrap/scrollspy.js',
            // src+'js/libs/bootstrap/tab.js',
            // src+'js/libs/bootstrap/affix.js'
        ])
        .pipe(sourceMaps.init())
        .pipe(concat('libs.min.js'))
        .pipe(sourceMaps.write())
        .pipe(gulp.dest(dist+'js'));
});

/*
 * Uses https://tinypng.com/ API to compress all images and overwrite old with new.
 * sigFile is used to keep track of which files have already been compressed so they are not
 * compressed repeatedly.
 */
gulp.task('tinypng',  function() {
    gulp.src(images+'*')
    .pipe(tinypngcomp({
        key: 'ySRPJKYeJmVOP4diqIF5Xw3wfW9IhoWk',
        sigFile: images+'.tinypng-sigs',
        sameDest: true,
        log: true
    }))
    .pipe(gulp.dest(images));
});

/*
 * Minifies the compiled CSS.
 */
gulp.task('uglify:css', function() {
  return gulp.src(dist+'css/global.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist+'css'));
});

/*
 * Minifies the compiled JS.
 */
gulp.task('uglify:js', function() {
    gulp.src([dist+'js/libs.min.js', dist+'js/main.min.js'])
    .pipe(uglify({
        preserveComments: 'license'
    }))
    .pipe(gulp.dest(dist+'js'));
});

// tasks for local development.
// gulp serve  - runs a fractal server under http://localhost:3000 and watches for changes.
// gulp watch  - watches for changes.
// gulp js     - compiles all JS.
// gulp scss   - compiles all SCSS.
gulp.task('serve', function() {
    runSequence('fractal:start', ['open', 'watch']);
});
gulp.task('js', ['scripts:main', 'scripts:libs']);

// deployment tasks.
// gulp deploy:test  - sets up code and images for QA and UAT.
// gulp deploy:live  - sets up code and images for LIVE.
gulp.task('deploy:test', function() {
    runSequence(['scss:website', 'scss:styleguide', 'scripts:main', 'scripts:libs', 'tinypng'], ['uglify:css', 'uglify:js'], ['fractal:build']);
});
gulp.task('deploy:live', function() {
    runSequence(['scss:website', 'scripts:main', 'scripts:libs', 'tinypng'], ['uglify:css', 'uglify:js']);
});