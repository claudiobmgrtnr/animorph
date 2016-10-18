Animorph
=========

[![npm version](https://badge.fury.io/js/animorph.svg)](http://badge.fury.io/js/animorph) 
[![Build status](https://travis-ci.org/claudiobmgrtnr/animorph.svg)](https://travis-ci.org/claudiobmgrtnr/animorph) [![Dependency Status](https://david-dm.org/claudiobmgrtnr/animorph.svg)](https://david-dm.org/claudiobmgrtnr/animorph) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard) [![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)]()

Morph your dom with style.  
Animorph.js is a small javascript framework that helps you to move any kind of elements inside of your dom.

* Lighweight (below 2kb gziped)
* Zero dependencies
* jQuery bindings (optional)
* CommonJS, AMD, and global interface
* TypeScript Definitions (optional)

Check it out on [codepen](http://codepen.io/claudiobmgrtnr/pen/NRrYaQ)

Installation
------------
Install the plugin with npm:
```shell
$ npm install animorph --save
```

Basic Usage
-----------

The following javascript code will start the animation and add all classes similar to angular animate so you 
can keep the entire animation declaration you css files.

Vanilla javascript without any dependencies

```js
  const element = document.querySelector('.foo');
  const wrapper = document.querySelector('.bar');
  animorph.appendTo(element, wrapper);
```

jQuery (please use `animorph.jquery.min.js` from the dist folder)

```js
  $('.foo').amAppendTo('.bar');
```

Please take a look at [the very simple enter example](https://github.com/claudiobmgrtnr/animorph/blob/master/examples/enter-example.html) or at the slightly [more advanced example](https://github.com/claudiobmgrtnr/animorph/blob/master/examples/advanced-example.html)

# Contribution

You're free to contribute to this project by submitting [issues](https://github.com/claudiobmgrtnr/animorph/issues) and/or [pull requests](https://github.com/claudiobmgrtnr/animorph/pulls).
This project uses the [semistandard code style](https://github.com/Flet/semistandard).

# License

This project is licensed under [MIT](https://github.com/claudiobmgrtnr/animorph/blob/master/LICENSE).



