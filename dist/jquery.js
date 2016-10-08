(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery')) :
  typeof define === 'function' && define.amd ? define(['jquery'], factory) :
  (factory(global.jQuery));
}(this, (function ($) { 'use strict';

$ = 'default' in $ ? $['default'] : $;

/**
 * Removes the given element from it's parent
 *
 * @param  {HTMLElement} node The node to remove
 */
function detachNode(node) {
  // Detach from dom before any classes are added
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

/**
 * Adds the given element as the first child of the given parent
 *
 * @param  {HTMLElement} node The node to remove
 * @param  {HTMLElement} targetContainer The new parent
 */
function prependNode(node, targetContainer) {
  if (targetContainer.firstChild) {
    targetContainer.insertBefore(node, targetContainer.firstChild);
  } else {
    targetContainer.appendChild(node);
  }
}

/**
 * Clones a given Node an all its content
 * Needed as IE9 does not support node.clone(true)
 *
 * @param  {HTMLElement} node The node to clone
 * @returns  {HTMLElement}
 */
function cloneNode(node) {
  var clone = node.cloneNode(false);
  clone.innerHTML = node.innerHTML;
  return clone;
}

/**
 * Shorthand to attach a element to the dom
 *
 * @param  {HTMLElement} node The element which should be added
 * @param  {HTMLElement} target The reference element/parent
 * @param  {String} domOperation The dom operation name
 */
function attachNode(node, target, domOperation) {
  switch (domOperation) {
    case 'appendTo':
      target.appendChild(node);
      break;
    case 'prependTo':
      prependNode(node, target);
      break;
    case 'insertAfter':
      node.insertAdjacentElement('afterend', target);
      break;
    default:
      throw new Error('Invalid dom operation');
  }
}

/**
 * Disables all transitions for the given node
 *
 * @param  {HTMLElement} node The element
 */
function disableTransitions(node) {
  node.style.transition = 'none';
}

/**
 * Reverts disableTransitions
 *
 * @param  {HTMLElement} node The element
 */
function enableTransitions(node) {
  node.style.transition = '';
}

/**
 * Returns the absolute position of the node to the document
 *
 * @param  {HTMLElement} node The element to measure
 * @return {{left: {Number}, top: {Number} }
 */


/**
 * Returns a Promise which is resolved after delay of (transition duration + transition delay).
 *
 * This is a replacement for onTransitionEnd as we can't guarantee that an animation started
 * and would wait forever.
 *
 * @param  {HTMLElement} node The element with a css-transition
 * @return {Promise}
 */
function waitUntilTransitionEnd(node) {
  var duration = getTransitionDuration(node);
  return new Promise(function (resolve) {
    setTimeout(function () {
      return resolve(node);
    }, duration);
  });
}

/**
 * Extract an array of all classNames of the given DOM or SVG node
 *
 * @param  {HTMLElement} element The element
 * @return {String[]} Classes
 */
function getClassNames(element) {
  var className = element.getAttribute && element.getAttribute('class') || '';
  return className === '' ? [] : className.split(' ');
}

/**
 * Replacement for DomTokenList
 *
 * IE 9 doesn't support element classList and IE 11 doesn't support classList for SVG elements
 * see also https://developer.mozilla.org/en/docs/Web/API/Element/classList
 *
 * Usage:
 * toggleClass(div, 'demo'); // Toggles the class `demo`
 * toggleClass(div, 'demo', true); // Adds the class `demo`
 * toggleClass(div, 'demo', false); // removes the class `demo`
 *
 * @param  {HTMLElement} element The target node
 * @param  {String} className The class name to toggle
 * @param  {boolean} force Optional - true will allways add - false will alawys remove
 */
function toggleClass(element, className, force) {
  var classNames = getClassNames(element);
  var idx = classNames.indexOf(className);
  var hasClass = idx !== -1;
  var shouldHaveClass = force !== undefined ? force : !hasClass;
  // Break if classes are already set/removed
  if (shouldHaveClass === hasClass) {
    return;
  }
  // Remove class
  if (!shouldHaveClass) {
    classNames.splice(idx, 1);
  }
  // Add class
  if (shouldHaveClass) {
    classNames.push(className);
  }
  element.setAttribute('class', classNames.join(' '));
}

/**
 * Remove the given class name from the element
 * @param  {HTMLElement} element The DOM Node
 * @param  {String} className The class name
 */
function removeClass(element, className) {
  if (className === undefined) {
    throw new Error('Class name is required');
  }
  toggleClass(element, className, false);
}

/**
 * Adds the given class name from the element
 * @param  {HTMLElement} element The DOM Node
 * @param  {String} className The class name
 */
function addClass(element, className) {
  if (className === undefined) {
    throw new Error('Class name is required');
  }
  toggleClass(element, className, true);
}

/**
 * Turns "2s" or "2000ms" into 2000
 * @param  {string} timeString A unit postfixed time string
 * @return {number} milliseconds
 */
function stringToMilliSeconds(timeString) {
  var timeUnits = {
    s: 1000,
    ms: 1
  };
  var parsedTime = /([\d\.]+)\s*(\D+)/.exec(timeString);
  return parsedTime ? parseFloat(parsedTime[1], 10) * timeUnits[parsedTime[2]] : 0;
}

/**
 * Returns the duration of an elements transition including the transition delay
 * @param  {HTMLElement} node The element to measure
 * @return {Number} time in milliseconds
 */
function getTransitionDuration(node) {
  var duration = stringToMilliSeconds(window.getComputedStyle(node).transitionDuration);
  var delay = stringToMilliSeconds(window.getComputedStyle(node).transitionDelay);
  return duration + delay;
}

var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

function requestAnimationFramePromise() {
  return new Promise(function (resolve) {
    return requestAnimationFrame(resolve);
  });
}

/**
 * An animation which adds the `enter` classes and adds the element to the dom
 *
 * @param  {String} namespace     The animation class namespace e.g. 'am'
 * @param  {String[]} addClasses  Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @param  {[type]} element       The element
 * @param  {[type]} target        Optional - needed as reference to add the element into DOM
 * @param  {[type]} operation     Optional - needed to add the element into DOM
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function enterAnimation(_ref) {
  var namespace = _ref.namespace;
  var addClasses = _ref.addClasses;
  var removeClasses = _ref.removeClasses;
  var element = _ref.element;
  var target = _ref.target;
  var operation = _ref.operation;

  if (target) {
    attachNode(element, target, operation);
  }
  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationName: 'enter'
  });
}

/**
 * An animation which adds the `leave` classes and adds the element to the dom
 *
 * @param  {String} namespace     The animation class namespace e.g. 'am'
 * @param  {[type]} element       [description]
 * @param  {String[]} addClasses  Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function leaveAnimation(_ref2) {
  var namespace = _ref2.namespace;
  var element = _ref2.element;
  var addClasses = _ref2.addClasses;
  var removeClasses = _ref2.removeClasses;

  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationName: 'leave'
  });
}

/**
 * An animation which morphs an element from its old position to its new position
 *
 * @param  {String} namespace        The animation class namespace e.g. 'am'
 * @param  {String[]} addClasses     Classes which will be added once the animation starts
 * @param  {String[]} removeClasses  Classes which will be removed once the animation starts
 * @param  {HTMLElement} element     The element to animate
 * @param  {HTMLElement} target      The reference target to attach the element into the DOM
 * @param  {HTMLElement} operation   The attach method
 * @param  {HTMLElement} morphParent The wrapper for the move clone
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function morphAnimation(_ref3) {
  var namespace = _ref3.namespace;
  var addClasses = _ref3.addClasses;
  var removeClasses = _ref3.removeClasses;
  var element = _ref3.element;
  var target = _ref3.target;
  var operation = _ref3.operation;
  var morphParent = _ref3.morphParent;

  if (element instanceof window.HTMLElement === false) {
    throw new Error('target is required');
  }
  // Create clones which are needed for the morph effect
  var leavePlaceholder = _createLeavePlaceholder(element);
  var movePlaceholder = _createMovePlaceholder(element, morphParent);
  // Wait for all animations to finish
  return Promise.all([enterAnimation({
    namespace: namespace,
    addClasses: addClasses,
    removeClasses: removeClasses,
    element: element,
    target: target,
    operation: operation
  }), moveAnimation({
    namespace: namespace,
    addClasses: addClasses,
    removeClasses: removeClasses,
    element: movePlaceholder,
    morphParent: morphParent,
    target: element
  }), leaveAnimation({
    namespace: namespace,
    addClasses: [],
    removeClasses: [],
    element: leavePlaceholder
  })]).then(function () {
    detachNode(leavePlaceholder);
    detachNode(movePlaceholder);
  });
}

/**
 * This animation will add the leave classes and remove the element form the
 * DOM once the animation is complete
 *
 * @param  {Object} options All leaveAnimation options
 * @return {Promise}
 */
function removeAnimation(options) {
  return leaveAnimation(options).then(function () {
    return detachNode(options.element);
  });
}

/**
 * Moves the given element to the target Position
 *
 * @param  {String} namespace     The animation class namespace e.g. 'am'
 * @param  {String[]} addClasses  Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @param  {[type]} element       [description]
 * @param  {[type]} target        [description]
 * @param  {[type]} morphParent   [description]
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function moveAnimation(_ref4) {
  var namespace = _ref4.namespace;
  var addClasses = _ref4.addClasses;
  var removeClasses = _ref4.removeClasses;
  var element = _ref4.element;
  var target = _ref4.target;
  var morphParent = _ref4.morphParent;

  var targetPosition = _getElementPosition(target);
  var parentPosition = _getElementPosition(morphParent);
  var top = targetPosition.top - parentPosition.top;
  var left = targetPosition.left - parentPosition.left;
  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationName: 'move',
    onAnimationStart: function onAnimationStart() {
      element.setAttribute('style', 'position: absolute; top: ' + top + '; left: ' + left + ';');
    }
  });
}

/**
 * Helper function which does the entire animation from start to cleanup
 *
 * @param  {String} namespace       The animation class namespace e.g. 'am'
 * @param  {String[]} addClasses    Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @param  {HTMLElement} element    The Element which to animate
 * @param  {HTMLElement} morphParent   [description]
 * @param  {function} [onAnimationStart=(] [description]
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function animation(_ref5) {
  var namespace = _ref5.namespace;
  var addClasses = _ref5.addClasses;
  var removeClasses = _ref5.removeClasses;
  var element = _ref5.element;
  var animationName = _ref5.animationName;
  var _ref5$onAnimationStar = _ref5.onAnimationStart;
  var onAnimationStart = _ref5$onAnimationStar === undefined ? function () {} : _ref5$onAnimationStar;

  return _startAnimation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationName: animationName
  }).then(onAnimationStart).then(function () {
    return waitUntilTransitionEnd(element);
  }).then(function () {
    return _removeAnimationClasses({
      namespace: namespace,
      element: element,
      animationName: animationName
    });
  });
}

function _createLeavePlaceholder(node) {
  var clone = cloneNode(node);
  node.insertAdjacentElement('afterend', clone);
  return clone;
}

/**
 * Create a clone and place it absolute directly above the given node
 *
 * @param  {HTMLElement} node        The node to clone
 * @param  {HTMLElement} morphParent The parent for the clone
 * @return {HTMLElement} clone
 */
function _createMovePlaceholder(node, morphParent) {
  var clone = cloneNode(node);
  var elementPosition = _getElementPosition(node);
  var parentPosition = _getElementPosition(morphParent);
  var top = elementPosition.top - parentPosition.top;
  var left = elementPosition.left - parentPosition.left;
  clone.setAttribute('style', 'position: absolute; top: ' + top + '; left: ' + left + ';');
  document.body.insertAdjacentElement('afterend', clone);
  return clone;
}

function _startAnimation(_ref6) {
  var namespace = _ref6.namespace;
  var element = _ref6.element;
  var addClasses = _ref6.addClasses;
  var removeClasses = _ref6.removeClasses;
  var _ref6$animationName = _ref6.animationName;
  var animationName = _ref6$animationName === undefined ? 'enter' : _ref6$animationName;

  disableTransitions(element);
  addClass(element, namespace + '-' + animationName + '-prepare');
  addClass(element, namespace + '-' + animationName);
  addClass(element, namespace + '-animate');
  return requestAnimationFramePromise().then(function () {
    removeClass(element, namespace + '-' + animationName + '-prepare');
    addClass(element, namespace + '-' + animationName + '-active');
    addClasses.forEach(function (className) {
      return addClass(element, className);
    });
    removeClasses.forEach(function (className) {
      return removeClass(element, className);
    });
    enableTransitions(element);
  });
}

function _getElementPosition(node) {
  var rect = node.getBoundingClientRect();
  var offset = {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  };
  return offset;
}

function _removeAnimationClasses(_ref7) {
  var element = _ref7.element;
  var animationName = _ref7.animationName;
  var namespace = _ref7.namespace;

  disableTransitions(element);
  return requestAnimationFramePromise().then(function () {
    removeClass(element, namespace + '-animate');
    removeClass(element, namespace + '-' + animationName);
    removeClass(element, namespace + '-' + animationName + '-active');
    enableTransitions(element);
  });
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Mapping of dom operation to animation
var operations = {
  appendTo: morphAnimation,
  prependTo: morphAnimation,
  insertBefore: morphAnimation,
  insertAfter: morphAnimation,
  remove: removeAnimation,
  enter: enterAnimation,
  leave: leaveAnimation
};

function animorph(element, _ref) {
  var _ref$namespace = _ref.namespace;
  var namespace = _ref$namespace === undefined ? 'am' : _ref$namespace;
  var _ref$addClasses = _ref.addClasses;
  var addClasses = _ref$addClasses === undefined ? [] : _ref$addClasses;
  var _ref$removeClasses = _ref.removeClasses;
  var removeClasses = _ref$removeClasses === undefined ? [] : _ref$removeClasses;
  var target = _ref.target;
  var _ref$operation = _ref.operation;
  var operation = _ref$operation === undefined ? 'appendTo' : _ref$operation;
  var _ref$morphParent = _ref.morphParent;
  var morphParent = _ref$morphParent === undefined ? document.body : _ref$morphParent;

  var animation = operations[operation];
  if (!animation) {
    throw new Error('Invalid operation \'' + operation + '\'');
  }
  if (element instanceof window.HTMLElement === false) {
    throw new Error('Element is required');
  }
  // If we can't use a move animation fallback to an enter animation
  if (animation === morphAnimation && !element.parentNode) {
    animation = enterAnimation;
  }
  return animation({
    namespace: namespace,
    addClasses: addClasses,
    removeClasses: removeClasses,
    element: element,
    target: target,
    operation: operation,
    morphParent: morphParent
  });
}

function appendTo(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target
  }, options));
}

function prependTo(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target,
    operation: 'prependTo'
  }, options));
}

function remove(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return animorph(element, _extends({
    operation: 'remove'
  }, options));
}

function insertAfter(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target,
    operation: 'insertAfter'
  }, options));
}

/**
 * Allows to animate from one set of classes to another
 *
 * @param  {HTMLElement} element        The element to animate
 * @param  {String[]} classNamesBefore  Class names before
 * @param  {String[]} classNamesAfter   Class names after
 * @param  {String} [transitionName]     Transition name (enter or leave)
 * @param  {Object} [options={}]        Animorph options like namespace
 * @return {Promise}                    Promise of the animation
 */
function replaceClasses(element, classNamesBefore, classNamesAfter) {
  var transitionName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'enter';
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  return animorph(element, _extends({
    addClasses: classNamesAfter,
    removeClasses: classNamesBefore,
    operation: transitionName
  }, options));
}

$.fn.amAppendTo = function (target, options) {
  return this.each(function (i, element) {
    return appendTo(element, $(target)[0], options);
  });
};

$.fn.amPrependTo = function (target, options) {
  return this.each(function (i, element) {
    return prependTo(element, $(target)[0], options);
  });
};

$.fn.amRemove = function (options) {
  return this.each(function (i, element) {
    return remove(element, options);
  });
};

$.fn.amInsertAfter = function (target, options) {
  return this.each(function (i, element) {
    return insertAfter(element, $(target)[0], options);
  });
};

$.fn.amReplaceClasses = function (classNamesBefore, classNamesAfter, transitionName, options) {
  return this.each(function (i, element) {
    return replaceClasses(element, classNamesBefore, classNamesAfter, transitionName, options);
  });
};

})));
