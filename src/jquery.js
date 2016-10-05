import {appendTo, prependTo, remove, leave, insertAfter, replaceClasses} from './vanilla.js';
import $ from 'jquery';

$.fn.amAppendTo = function (target, options) {
  return appendTo(this.toArray(), $(target)[0], options);
};

$.fn.amPrependTo = function (target, options) {
  return prependTo(this.toArray(), $(target)[0], options);
};

$.fn.amRemove = function (options) {
  return remove(this.toArray(), options);
};

$.fn.amLeave = function (options) {
  return leave(this.toArray(), options);
};

$.fn.amInsertAfter = function (target, options) {
  return insertAfter(this.toArray(), $(target)[0], options);
};

$.fn.amReplaceClasses = function (classNamesBefore, classNamesAfter, transitionName, options) {
  return replaceClasses(this.toArray(), classNamesBefore, classNamesAfter, transitionName, options);
};
