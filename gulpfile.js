import { create, stream } from "browser-sync";
import cached from "gulp-cached";
import cssnano from "gulp-cssnano";
import { sync } from "del";
import fileinclude from "gulp-file-include";
import { watch as __watch, series, src, dest, parallel } from "gulp";
import gulpif from "gulp-if";
import npmdist from "gulp-npm-dist";
// import replace from "gulp-replace";
import uglify from "gulp-uglify";
import useref from "gulp-useref-plus";
import rename from "gulp-rename";
import gulpsass from "gulp-sass";
import sass from "sass";
import autoprefixer from "gulp-autoprefixer";
import { init, write } from "gulp-sourcemaps";
import cleanCSS from "gulp-clean-css";
import postcss from "gulp-postcss";
import tailwindcss from "tailwindcss";

let sass$ = gulpsass(sass);
let browsersync$ = create();

const isSourceMap = true;

const sourceMapWrite = isSourceMap ? "./" : false;

function browsersyncFn(callback) {
  var baseDir = "./dist";
  browsersync$.init({
    server: {
      baseDir: [baseDir, baseDir + "/html"], // Specify the base path of the project
      // index: "html/index.html"										// Has to specify the initial page in case not the index.html
    },
    port: 1113, // Used to change the port number
    // tunnel: 'technology', 											// Attempt to use the URL https://text.loca.lt
  });
  callback();
}

function browsersyncReload(callback) {
  browsersync$.reload();
  callback();
}

function watch() {
  // Below  are the files which will be watched and to skip watching files use '!' before the path.
  __watch(
    ["./src/assets/js/*", "./src/assets/js/*.js"],
    series("js", browsersyncReload)
  );
  __watch(
    ["./src/assets/plugins/*", "./src/assets/plugins/**/*.js"],
    series("plugins", browsersyncReload)
  );
  __watch(
    ["./src/html/**/*.html", "./src/html/partials/*"],
    series(["html", "build_tailwind"], browsersyncReload)
  );
  __watch(
    ["./src/assets/scss/**/*.scss", "!./src/assets/switcher/*.scss"],
    series("build_tailwind", browsersyncReload)
  );
}

function html(callback) {
  // Html files path
  var htmlFiles = "./src/html/**/*.html";

  src(htmlFiles)
    // .pipe(vinylPaths(del))
    .pipe(
      fileinclude({
        prefix: "@SPK@", // This is the prefix you can edit which is used in project to combine html files
        basepath: "@file",
        indent: true,
      })
    )
    .pipe(useref())
    .pipe(cached())
    .pipe(gulpif("*.js", uglify()))
    .pipe(
      gulpif(
        "*.css",
        cssnano({
          svgo: false,
        })
      )
    )
    .pipe(dest("./dist/html"));
  //  Used to remove the partials/ any other folder/file
  sync("./dist/html/partials");
  callback();
}

function scss(callback) {
  // SCSS path where code was written
  var scssFiles = "./src/assets/scss/**/*.scss";
  var cssFiles = "./src/assets/css/";
  // CSS path where code should need to be printed
  var cssDest = "./dist/assets/css";
  // Normal file
  src(scssFiles)
    .pipe(init()) // To create map file we should need to initiliaze.
    .pipe(sass$.sync().on("error", sass$.logError)) // To check any error with sass sync
    .pipe(
      postcss([
        tailwindcss(),
        autoprefixer,
      ])
    )
    .pipe(dest(cssDest))
    .pipe(dest(cssFiles));
  //  Minified file
  src(scssFiles)
    .pipe(init()) // To create map file we should need to initiliaze.
    .pipe(sass$.sync().on("error", sass$.logError)) // To check any error with sass sync
    .pipe(
      postcss([
        tailwindcss(),
        autoprefixer,
      ])
    )
    .pipe(dest(cssDest))
    .pipe(dest(cssFiles))
    .pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cleanCSS({ debug: true }, (details) => {
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(write(sourceMapWrite)) // To create map file
    .pipe(dest(cssDest))
    .pipe(dest(cssFiles));
  return callback();
}

// Build Tailwind CSS
function build_tailwind() {
  var scssFiles = "./src/assets/scss/**/*.scss";
  var cssDest = "./dist/assets/css";
  return src(scssFiles)
    .pipe(sass$.sync().on("error", sass$.logError))
    .pipe(
      postcss([
        tailwindcss(),
        autoprefixer,
        // require("tailwindcss"),
        // require("autoprefixer"),
      ])
    )
    .pipe(dest(cssDest))
    .pipe(stream());
}

function js(callback) {
  var jsFilePath = "./dist/assets/js"; // The javascript main Folder.
  // normal file
  src("./src/assets/js/*.js") // The *.js will select all the files which have extension of '.js'.
    .pipe(init())
    .pipe(dest(jsFilePath)); // The path where the new file should need to be created.
  return callback();
}

function plugins(callback) {
  var pluginsFilePath = "./dist/assets/plugins/"; // The javascript main Folder.
  // normal file
  src("./src/assets/plugins/**/*.js") // The *.js will select all the files which have extension of '.js'.
    .pipe(init())
    .pipe(dest(pluginsFilePath)); // The path where the new file should need to be created.
  // minified file
  src("./src/assets/plugins/**/*.js") // The *.js will select all the files which have extension of '.js'.
    .pipe(init())
    .pipe(uglify()) // uglify() is used to minify the javascript.
    .pipe(
      rename({
        // rename is used to add dirname, basename, extname, prefix, suffix.
        suffix: ".min",
      })
    )
    .pipe(write(sourceMapWrite)) // To create map file
    .pipe(dest(pluginsFilePath)); // The path where the new file should need to be created.

  return callback();
}

function copyLibs() {
  var destPath = "dist/assets/libs";

  return src(npmdist(), {
      base: "./node_modules",
    })
    .pipe(
      rename(function (path) {
        path.dirname = path.dirname.replace(/\/dist/, "").replace(/\\dist/, "");
      })
    )
    .pipe(dest(destPath));
}

function cleanDist(callback) {
  sync("./dist"); // Used to clear dist folder
  callback();
}

function copyAll() {
  var assetsPath = "./dist/assets"; // The file path where we want to copy the data from

  return src([
      "./src/assets/**/*", // All the folder and files will be will copied.
    ])
    .pipe(dest(assetsPath)); // dest() - A stream that can be used in the middle or at the end of a pipeline to create files on the file system.
}

const build = series(
  parallel(cleanDist, copyAll, scss, html, js, plugins),
  parallel(scss, html, js, plugins)
);

const defaults = series(
  parallel(cleanDist,copyAll,scss,html,js,plugins,copyLibs,build_tailwind),
  parallel( watch, js, scss, html, plugins, build_tailwind,browsersyncFn),
  parallel(build_tailwind,browsersyncFn)
);

// Export tasks
const _browsersyncReload = browsersyncReload;
export { _browsersyncReload as browsersyncReload };
const _browsersyncFn = browsersyncFn;
export { _browsersyncFn as browsersyncFn };
const _plugins = plugins;
export { _plugins as plugins };
const _js = js;
export { _js as js };
const _scss = scss;
export { _scss as scss };
const _html = html;
export { _html as html };
const _cleanDist = cleanDist;
export { _cleanDist as cleanDist };
const _copyAll = copyAll;
export { _copyAll as copyAll };
const _build_tailwind = build_tailwind;
export { _build_tailwind as build_tailwind };

const _watch = watch;
export { _watch as watch };

const _build = build;
export { _build as build };
const _default = defaults;
export { _default as default };
