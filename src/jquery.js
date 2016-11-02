import {appendTo, prependTo, remove, leave, insertAfter, replaceClasses} from './vanilla.js';
import $ from 'jquery';

/**
 * Append the current element to the target
 * This will start a move animation if the current element is already in the dom.
 *
 * @param  {JQuery|HTMLElement|String} target
 * @param  {object} options animorph options like namespace
 * @return {Promise}        Animation Promise
 */
$.fn.amAppendTo = function (target, options) {
  return appendTo(this.toArray(), $(target)[0], options);
};

/**
 * Prepend the current element to the target
 * This will start a move animation if the current element is already in the dom.
 *
 * @param  {JQuery|HTMLElement|String} target
 * @param  {object} options animorph options like namespace
 * @return {Promise}        Animation Promise
 */
$.fn.amPrependTo = function (target, options) {
  return prependTo(this.toArray(), $(target)[0], options);
};

/**
 * Run a leave animation and remove the current element from the dom after it finished
 *
 * @param  {object} options animorph options like namespace
 * @return {Promise}        Animation Promise
 */
$.fn.amRemove = function (options) {
  return remove(this.toArray(), options);
};

/**
 * Run a leave animation and remove the current element from the dom after it finished
 *
 * @param  {object} options animorph options like namespace
 * @return {Promise}        Animation Promise
 */
$.fn.amLeave = function (options) {
  return leave(this.toArray(), options);
};

/**
 * Inserts the current element after the target
 * This will start a move animation if the current element is already in the dom.
 *
 * @param  {JQuery|HTMLElement|String} target
 * @param  {object}     options animorph options like namespace
 * @return {Promise}    Animation Promise
 */
$.fn.amInsertAfter = function (target, options) {
  return insertAfter(this.toArray(), $(target)[0], options);
};

/**
 * Adds and removes css-classes from the given element.
 *
 * @param  {String|String[]} classNamesBefore class names to remove
 * @param  {String|String[]} classNamesAfter  class names to add
 * @param  {String}  Transition name `"enter"|"leave"`
 * @param  {object} options animorph options like namespace
 * @return {Promise}    Animation Promise
 */
$.fn.amReplaceClasses = function (classNamesBefore, classNamesAfter, transitionName, options) {
  return replaceClasses(this.toArray(), classNamesBefore, classNamesAfter, transitionName, options);
};

export * from './vanilla.js';
