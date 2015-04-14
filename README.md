## AngularJS-Gulp-Browserify-SASS-Karma-Seed

This is a simple app structure for building AngularJS apps. This seed project
includes a lot of basic configuration and Gulp tasks for linting JS and SCSS
as well as building/watching code.

This was intended to be a base repository to clone and use for other projects.

## Requirements

1. You should have `ruby`
1. You should have `npm`

## Quick Start

1. Clone the repo
1. Install ruby gems with `bundle install`
1. Install the local requirements: `npm install`
1. Install the Bower components: `bower install`
1. Run locally: `gulp` or create a build: `gulp build`

Alternatively, you can run:

1. `npm run watch` for development
1. `npm run build` for a production build

The npm alternatives don't require modifying your PATH variable to find
the local executables.

## NPM Notes

These notes only apply if you use `gulp` or `gulp build` and not the npm
alternative commands.

It's easier to use local node modules if you append it to your PATH:

```bash
export PATH=node_modules/.bin:$PATH
```

After adding the local path to your PATH variable, you must source your
`.bashrc` file.

```bash
source ~/.bashrc
```

Then you can use all node modules local to the repository without prepending
the long file path or installing `gulp` or `bower` as a global binary.

## Running Unit Tests

You can run the unit test suite via `npm`:

```bash
npm test
```

In addition to running the test suite, the code is checked with jshint for any
errors. The test suite will fail if any jshint errors are found.
