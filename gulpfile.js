/*
    Install
    composer    composer require --dev <package>
    gulp        npm install --save-dev <package>
    bower       bower install --dev <package> ???
*/
const gulp      = require('gulp'),
    clean       = require('gulp-clean'),
    copy        = require('gulp-copy'),
    livereload  = require('gulp-livereload'),
    composer    = require('gulp-composer'),
    bower       = require('gulp-bower'),
    connect     = require('gulp-connect-php'),
    concat      = require('gulp-concat'),
    sass        = require('gulp-sass'),
    minifyCSS   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    open        = require('open'),
    path        = require('path'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    ts          = require('gulp-typescript'),
    merge       = require('merge2'),
    browserify = require("browserify"),
    tsify = require("tsify"),
    source = require('vinyl-source-stream');

var tsProject   = ts.createProject('tsconfig.json');
var tsconf = {
    files  : 'src/**/ts/*.ts',
    entries: ['src/WhereGroup/ThemeBundle/Resources/ts/app.ts'],
    target: {
        dir: 'web/public/',
        file: 'metador.js'
    }
};
var conf = {
    assets: {
        js: [
            'web/assets/vendor/jquery/dist/jquery.min.js',
            'web/assets/vendor/proj4js/dist/proj4.js',
            'web/assets/vendor/OpenLayers/ol.js',
            'web/assets/vendor/jquery-form/dist/jquery.form.min.js'
        ],
        css: [
            'web/assets/vendor/normalize-css/normalize.css',
            'web/assets/vendor/OpenLayers/ol.css'
        ],
        copy: [
            'web/assets/vendor/zebra_datepicker/public/**/*'
        ],
        dest: 'web/public',
        filename: 'app.min'
    },
    watch: {
        files: [
            'src/**/*.{php,twig,js,css}',
            tsconf.target.dir + tsconf.target.file
        ]
    },
    clean: {
        folders: ['web/public', 'web/assets/vendor', 'var/cache', 'vendor']
    },
    sass: {
        files  : 'src/**/*.scss',
        dest   : '/../public/css/',
        options: {
            outputStyle  : 'compressed',
            includePaths : [] //'src/WhereGroup/ThemeBundle/Resources/styleguide'
        }
    },
    ts: tsconf
}

gulp.task('clean', () => {
    return gulp.src(conf.clean.folders, {read: false})
        .pipe(clean());
});

gulp.task('init', ['clean'], () => {
    composer({ "optimize-autoloader": true });
    return bower();
});

gulp.task('ts-old', function() {
    var tsResult = gulp.src(conf.ts.files)
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(''));
});

gulp.task('ts', function() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: conf.ts.entries,
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source(conf.ts.target.file))
        .pipe(gulp.dest(conf.ts.target.dir));
});

gulp.task('sass', function() {
    return gulp.src(conf.sass.files)
        .pipe(sass(conf.sass.options))
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function(path) {path.dirname += conf.sass.dest;}))
        .pipe(gulp.dest('src/'));
});

gulp.task('watch', () => {
    livereload.listen();

    gulp.watch(conf.sass.files, ['sass']);
    gulp.watch(conf.ts.files, ['ts']);
    gulp.watch(conf.watch.files).on('change', function(file) {
        livereload.changed(file.path);
        browserSync.reload();
    });
});

gulp.task('browser-sync', () => {
    connect.server({base: 'web'}, () => {
        browserSync({
            proxy: '127.0.0.1:8000',
            open: false
        });
    });

    gulp.watch(conf.watch.files).on('change', function(file) {
        browserSync.reload();
    });

    open('http://localhost:3000/app_dev.php');
});

gulp.task('default', ['watch'], () => {
    connect.server({base: 'web'});
    open('http://localhost:8000/app_dev.php');
});

gulp.task('transpile', ['sass'], () => {
    if (conf.assets.css.length > 0) {
        gulp.src(conf.assets.css)
            .pipe(minifyCSS())
            .pipe(concat(conf.assets.filename + '.css'))
            .pipe(gulp.dest(conf.assets.dest));
    }

    if (conf.assets.js.length > 0) {
        gulp.src(conf.assets.js)
            .pipe(uglify())
            .pipe(concat(conf.assets.filename + '.js'))
            .pipe(gulp.dest(conf.assets.dest));
    }

    if (conf.assets.copy.length > 0) {
        gulp.src(conf.assets.copy)
            .pipe(gulp.dest(conf.assets.dest));
    }
});
