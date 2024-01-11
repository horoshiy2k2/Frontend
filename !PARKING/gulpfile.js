import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch} = pkg

import browserSync   from 'browser-sync'
import gulpSass      from 'gulp-sass'
import dartSass      from 'sass'
import postCss       from 'gulp-postcss'
import cssnano       from 'cssnano'
const  sassfn        = gulpSass(dartSass)
import concat        from 'gulp-concat'
import uglifyim      from 'gulp-uglify-es'
const  uglify        = uglifyim.default
import {deleteAsync} from 'del'
import imageminfn    from 'gulp-imagemin'
import cache         from 'gulp-cache'
import autoprefixer  from 'autoprefixer'
import nunjucksRender  from 'gulp-nunjucks-render'


function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'DEV/ready/',
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	})
}

function js() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.js',
		'node_modules/swiper/swiper-bundle.min.js',
		'node_modules/swiped-events/dist/swiped-events.min.js',
		'node_modules/gsap/dist/gsap.min.js',
		'node_modules/gsap/dist/ScrollTrigger.min.js',
		'node_modules/jquery-mask-plugin/dist/jquery.mask.min.js',
		])
	.pipe(concat('libs.js'))
	.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(dest('DEV/ready/js'))
	.pipe(browserSync.stream())
}

function css() {
	return src([
		'node_modules/normalize.css/normalize.css',
		'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css',
		'node_modules/swiper/swiper-bundle.min.css',
		])
	.pipe(concat('libs.css'))
	.pipe(dest('DEV/ready/css'))
	.pipe(browserSync.stream())
}

function sass() {
	return src('DEV/sass/*.scss')
    .pipe(sassfn())
    .pipe(postCss([
		autoprefixer({ grid: 'autoplace' }),
		cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
	]))
    .pipe(dest('DEV/ready/css'))
	.pipe(browserSync.stream())
}

function imagemin() {
	return src(['DEV/ready/img/**/*'])
		.pipe(imageminfn())
		.pipe(dest('PUBLIC/img/'))
}

// Сборка html файлов
function nunjucks() {
	return src(['DEV/*.html', 'DEV/include/**/*.html'])
      .pipe(nunjucksRender({
        path: 'DEV',
        ext: '.html'
      }))
    //   .pipe(replace('../ready/libs/', 'libs/'))
      .pipe(dest('DEV/ready/'))
      .pipe(browserSync.reload({stream: true}));
}

async function removedist() { await deleteAsync('PUBLIC/**/*', { force: true }) }
async function clearcache() { cache.clearAll() }

function buildFn() {
	return src([
		'DEV/ready/*.html',
		'DEV/ready/includes/**/*.html',
		'DEV/ready/css/*.css',
    'DEV/ready/js/*.js',
		'DEV/ready/fonts/**/*'
	], { base: 'DEV/' })
	.pipe(dest('PUBLIC'))
}

function startwatch() {
	watch('DEV/sass/**/*.scss', { usePolling: true }, sass)
	watch(['DEV/ready/js/*.js'], { usePolling: true })
	watch(['DEV/*.html', 'DEV/includes/**/*.html' ], { usePolling: true }, nunjucks)
    watch([], { usePolling: true }, nunjucks)
}

export { js, css, sass, nunjucks, imagemin, clearcache }
export let libs = series(css, js)
export let build = series(removedist, imagemin, sass, buildFn)

export default series(nunjucks, sass, parallel(browsersync, startwatch))