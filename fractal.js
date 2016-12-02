'use strict';

/*
* Require the path module
*/
const path = require('path');

/*
 * Require the Fractal module
 */
const fractal = module.exports = require('@frctl/fractal').create();

// require the Mandelbrot theme module
const mandelbrot = require('@frctl/mandelbrot');

// create a new instance with custom config options
const myCustomisedTheme = mandelbrot({
    skin: 'black',
    nav: ['docs', 'components'],
    panels: ['html', 'view', 'context', 'notes']
});

// tell Fractal to use the configured theme by default
fractal.web.theme(myCustomisedTheme);

/*
 * Give your project a title.
 */
fractal.set('project.title', 'Lukehillonline');

/*
 * Tell Fractal where to look for components.
 */
fractal.components.set('path', path.join(__dirname, 'styleguide/components'));

/*
 * Tell Fractal where to look for preview template.
 */
fractal.components.set('default.preview', '@preview');

/*
 * Tell Fractal where to look for documentation pages.
 */
fractal.docs.set('path', path.join(__dirname, 'styleguide/docs'));

/*
 * Tell the Fractal web preview plugin where to look for static assets.
 */
fractal.web.set('static.path', path.join(__dirname, 'assets'));

/*
 * Tell the Fractal where to put the built HTML output.
 */
fractal.web.set('builder.dest', path.join(__dirname, 'styleguide/build'));