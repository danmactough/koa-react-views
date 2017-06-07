# koa-react-views

[![Greenkeeper badge](https://badges.greenkeeper.io/danmactough/koa-react-views.svg)](https://greenkeeper.io/)

This is a [Koa][koa] view engine that renders [React][react] components on the server. It renders static markup and *does not* support mounting those views on the client.

This is intended to be used as a replacement for existing server-side view solutions.

This is an adaptation of [express-react-views][express-react-views], and this README cribs that project's README **heavily**.

## Usage

### install

```sh
npm install koa-react-views react react-dom
```

### Add it to your app

```js
// app.js

var app = koa();
require('koa-react-views')(app, {
  viewExt: '.jsx'
});
```

### Settings

setting | values | default
--------|--------|--------:
`doctype` | any string that can be used as [a doctype](http://en.wikipedia.org/wiki/Document_type_declaration), this will be prepended to your document | `"<!DOCTYPE html>"`
`beautify` | `true`: beautify markup before outputting (note, this can affect rendering due to additional whitespace) | `false`
`transformViews` | `true`: use `babel` to apply JSX, ESNext transforms to views.<br>**Note:** if already using `babel-core/register` in your project, you should set this to `false` | `true`
`root` | path to your views | path.resolve(process.cwd, './views')
`viewExt` | file extension | `.jsx`

### Views

Under the hood, [Babel][babel] is used to compile your views into ES5 friendly code, using the default Babel options.  Only the files in your `views` directory will be compiled.

Your views should be node modules that export a React component. Let's assume you have this file in `views/index.jsx`:

```js
var React = require('react');

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

module.exports = HelloMessage;
```

### Routes

In your route handlers, you gain a helpful render method:

```js
// app.js
var route = require('koa-route');
app.use(route.get('/', index));

function* index () {
	this.render('index');
}
```

### Layouts

Your views are really just React components. If you want a "layout", just require it:


`views/layouts/default.jsx`:

```js
var React = require('react');

var DefaultLayout = React.createClass({
  render: function() {
    return (
      <html>
        <head><title>{this.props.title}</title></head>
        <body>{this.props.children}</body>
      </html>
    );
  }
});

module.exports = DefaultLayout;
```

`views/index.jsx`:

```js
var React = require('react');
var DefaultLayout = require('./layouts/default');

var HelloMessage = React.createClass({
  render: function() {
    return (
      <DefaultLayout title={this.props.title}>
        <div>Hello {this.props.name}</div>
      </DefaultLayout>
    );
  }
});

module.exports = HelloMessage;
```

## Caveats

* This uses `require` to access your views. This means that contents are cached for the lifetime of the server process. You need to restart your server when making changes to your views. **In development, we clear your view files from the cache so you can simply refresh your browser to see changes.**
* React & JSX have their own rendering caveats. For example, inline `<script>`s and `<style>`s will need to use `dangerouslySetInnerHTML={{__html: 'script content'}}`. You can take advantage of ES6 template strings here.

```js
<script dangerouslySetInnerHTML={{__html: `
  // google analtyics
  // is a common use
`}} />
```

* It's not possible to specify a doctype in JSX. You can override the default HTML5 doctype in the settings.

[koa]: http://koajs.com/
[react]: http://facebook.github.io/react/
[express-react-views]: https://github.com/reactjs/express-react-views
[babel]: https://babeljs.io/