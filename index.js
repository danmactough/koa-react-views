'use strict';
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var beautifyHTML = require('js-beautify').html;
var assign = require('object-assign');
var path = require('path');

var DEFAULT_SETTINGS = {
  doctype: '<!DOCTYPE html>',
  viewExt: '.jsx',
  beautify: false,
  transformViews: true
};

function createEngine (app, settings) {
  if (app.context.render) {
    return;
  }

  settings = assign({}, DEFAULT_SETTINGS, settings || {});
  settings.root = path.resolve(process.cwd(), settings.root || './views');
  if (settings.transformViews) {
    require('babel-core/register')({
      only: settings.root
    });
  }

  var moduleDetectRegEx = new RegExp('^' + settings.root);

  /**
   * Render html using view and props
   * @param {String} view
   * @param {Object} props
   * @return {String} html
   */
  function* render (view, props) {
    view += settings.viewExt;
    var viewPath = path.join(settings.root, view);
    var html = settings.doctype;
    var component = require(viewPath);
    // Transpiled ES6 may export components as { default: Component }
    component = component.default || component;
    html += ReactDOMServer.renderToStaticMarkup(
      React.createElement(component, props)
    );

    if (settings.beautify) {
      // NOTE: This will screw up some things where whitespace is important, and
      // be subtly different than prod.
      html = beautifyHTML(html);
    }

    if (app.env === 'development') {
      // Remove all files from the module cache that are in the view folder.
      Object.keys(require.cache).forEach(function(module) {
        if (moduleDetectRegEx.test(module)) {
          delete require.cache[module];
        }
      });
    }

    return html;
  }

  app.context.render = function* (view, _context) {
    var context = {};
    assign(context, this.state);
    assign(context, _context);

    var html = yield *render(view, context);
    this.type = 'html';
    this.body = html;
    return html;
  };
}

exports = module.exports = createEngine;
