import {appendTo, prependTo, remove, insertAfter, replaceClasses} from './vanilla.js';
import $ from 'jquery';

$.fn.amAppendTo = function (target, options) {
  return this.each((i, element) => appendTo(element, $(target)[0], options));
};

$.fn.amPrependTo = function (target, options) {
  return this.each((i, element) => prependTo(element, $(target)[0], options));
};

$.fn.amRemove = function (options) {
  return this.each((i, element) => remove(element, options));
};

$.fn.amInsertAfter = function (target, options) {
  return this.each((i, element) => insertAfter(element, $(target)[0], options));
};

$.fn.amReplaceClasses = function (classNamesBefore, classNamesAfter, transitionName, options) {
  return this.each((i, element) => replaceClasses(element, classNamesBefore, classNamesAfter, transitionName, options));
};
