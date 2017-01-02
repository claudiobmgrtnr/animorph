(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.animorph = global.animorph || {})));
}(this, (function (exports) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
      insertAfter$1(node, target);
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
function getElementPosition(node) {
  if (node === document.body) {
    return { left: 0, top: 0 };
  }
  // Support: IE <=11 only
  // Running getBoundingClientRect on a
  // disconnected node in IE throws an error
  if (!node.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  var rect = node.getBoundingClientRect();
  if (rect.width || rect.height) {
    var docElem = document.documentElement;
    return {
      top: rect.top + window.pageYOffset - docElem.clientTop,
      left: rect.left + window.pageXOffset - docElem.clientLeft
    };
  }

  // Return zeros for disconnected and hidden elements (gh-2310)
  return rect;
}

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
  var duration = getTransitionDuration(node) + getTransitionDelay(node);
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
 * Returns the duration of an elements transition
 * @param  {HTMLElement} node The element to measure
 * @return {Number} time in milliseconds
 */
function getTransitionDuration(node) {
  return stringToMilliSeconds(window.getComputedStyle(node).transitionDuration);
}

/**
 * Returns the delay of an elements transition
 * @param  {HTMLElement} node The element to measure
 * @return {Number} time in milliseconds
 */
function getTransitionDelay(node) {
  return stringToMilliSeconds(window.getComputedStyle(node).transitionDelay);
}

/**
 * Force a browser repaint to apply all current styles
 *
 * @param node
 */
function forceReflow(node) {
  return new Promise(function (resolve) {
    resolve(node.offsetHeight);
  });
}

/**
 * Checks if node is a dom element
 * @param node
 * @returns {*}
 */
function isDomElement(node) {
  // For all modern browser
  if (window.HTMLElement) {
    return node instanceof window.HTMLElement;
  }
  // For IE9 <3
  return node && (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' && node.nodeType === 1 && node.nodeName;
}

/**
 * Inserts a new node after a desired reference node.
 * @param referenceNode
 * @param newNode
 * @returns {Node}
 */
function insertAfter$1(referenceNode, newNode) {
  // For all modern browser and Firefox version 48 and higher
  if (referenceNode.insertAdjacentElement) {
    return referenceNode.insertAdjacentElement('afterend', newNode);
  }
  // For Firefox version 48 and lower
  // If referenceNode is the last child within its parent element, that's fine, because referenceNode.nextSibling
  // will be null and insertBefore handles that case by adding to the end of the parent
  return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * An animation which adds the `enter` classes and adds the element to the dom
 *
 * @param  {String} namespace       The animation class namespace e.g. 'am'
 * @param  {String[]} addClasses    Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @param  {HTMLElement} element    The element
 * @param  {HTMLElement} target     Optional - needed as reference for the new DOM position
 * @param  {"appendTo"|"prependTo"|"insertAfter"} operation  Dom operation
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function enterAnimation(_ref) {
  var namespace = _ref.namespace;
  var addClasses = _ref.addClasses;
  var removeClasses = _ref.removeClasses;
  var element = _ref.element;
  var target = _ref.target;
  var operation = _ref.operation;
  var animationIndex = _ref.animationIndex;

  if (target) {
    attachNode(element, target, operation);
  }
  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationIndex: animationIndex,
    animationName: 'enter'
  });
}

/**
 * An animation which adds the `leave` classes and adds the element to the dom
 *
 * @param  {String} namespace     The animation class namespace e.g. 'am'
 * @param  {HTMLElement} element  [description]
 * @param  {String[]} addClasses  Classes which will be added once the animation starts
 * @param  {String[]} removeClasses Classes which will be removed once the animation starts
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function leaveAnimation(_ref2) {
  var namespace = _ref2.namespace;
  var element = _ref2.element;
  var addClasses = _ref2.addClasses;
  var removeClasses = _ref2.removeClasses;
  var animationIndex = _ref2.animationIndex;

  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationIndex: animationIndex,
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
  var animationIndex = _ref3.animationIndex;

  if (element instanceof window.HTMLElement === false) {
    throw new Error('target is required');
  }
  // Create clones which are needed for the morph effect
  var leavePlaceholder = _createLeavePlaceholder(element);
  var movePlaceholder = _createMovePlaceholder(element, morphParent);
  // Add final classes for the enter element to determine the correct target position
  addClasses.forEach(function (className) {
    return addClass(element, className);
  });
  removeClasses.forEach(function (className) {
    return removeClass(element, className);
  });
  // Wait for all animations to finish
  return Promise.all([enterAnimation({
    namespace: namespace,
    addClasses: [],
    removeClasses: [],
    element: element,
    target: target,
    operation: operation,
    animationIndex: animationIndex
  }), moveAnimation({
    namespace: namespace,
    addClasses: addClasses,
    removeClasses: removeClasses,
    element: movePlaceholder,
    morphParent: morphParent,
    target: element,
    animationIndex: animationIndex
  }), removeAnimation({
    namespace: namespace,
    addClasses: [],
    removeClasses: [],
    element: leavePlaceholder,
    animationIndex: animationIndex
  })]).then(function () {
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
 * @param  {HTMLElement} element  [description]
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
  var animationIndex = _ref4.animationIndex;

  var targetPosition = getElementPosition(target);
  var parentPosition = getElementPosition(morphParent);
  var targetStyles = window.getComputedStyle(target);

  var top = targetPosition.top - parentPosition.top - parseFloat(targetStyles.marginTop);
  var left = targetPosition.left - parentPosition.left - parseFloat(targetStyles.marginLeft);

  return animation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationIndex: animationIndex,
    animationName: 'move',
    onAnimationStart: function onAnimationStart() {
      element.style.position = 'absolute';
      element.style.left = left + 'px';
      element.style.top = top + 'px';
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
 * @param  {function} [onAnimationStart] [description]
 * @return {Promise} A promise which will be resolved once the animation is complete
 */
function animation(_ref5) {
  var namespace = _ref5.namespace;
  var addClasses = _ref5.addClasses;
  var removeClasses = _ref5.removeClasses;
  var element = _ref5.element;
  var animationName = _ref5.animationName;
  var animationIndex = _ref5.animationIndex;
  var _ref5$onAnimationStar = _ref5.onAnimationStart;
  var onAnimationStart = _ref5$onAnimationStar === undefined ? function () {} : _ref5$onAnimationStar;

  return _startAnimation({
    namespace: namespace,
    element: element,
    addClasses: addClasses,
    removeClasses: removeClasses,
    animationName: animationName,
    animationIndex: animationIndex
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
  insertAfter$1(node, clone);
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
  var elementPosition = getElementPosition(node);
  var parentPosition = getElementPosition(morphParent);
  var nodeStyles = window.getComputedStyle(node);
  var top = elementPosition.top - parentPosition.top - parseFloat(nodeStyles.marginTop);
  var left = elementPosition.left - parentPosition.left - parseFloat(nodeStyles.marginLeft);

  clone.style.position = 'absolute';
  clone.style.left = left + 'px';
  clone.style.top = top + 'px';
  morphParent.appendChild(clone);
  return clone;
}

function _startAnimation(_ref6) {
  var namespace = _ref6.namespace;
  var element = _ref6.element;
  var addClasses = _ref6.addClasses;
  var removeClasses = _ref6.removeClasses;
  var animationIndex = _ref6.animationIndex;
  var _ref6$animationName = _ref6.animationName;
  var animationName = _ref6$animationName === undefined ? 'enter' : _ref6$animationName;

  var staggeringDuration = animationIndex === 0 ? 0 : _getStaggering({ element: element, animationIndex: animationIndex, animationName: animationName, namespace: namespace });
  disableTransitions(element);
  addClass(element, namespace + '-' + animationName + '-prepare');
  addClass(element, namespace + '-' + animationName);
  addClass(element, namespace + '-animate');
  return new Promise(function (resolve) {
    setTimeout(resolve, staggeringDuration);
  }).then(function () {
    return forceReflow(element).then(function () {
      forceReflow(element);
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
  });
}

function _removeAnimationClasses(_ref7) {
  var element = _ref7.element;
  var animationName = _ref7.animationName;
  var namespace = _ref7.namespace;

  disableTransitions(element);
  return forceReflow(element).then(function () {
    removeClass(element, namespace + '-animate');
    removeClass(element, namespace + '-' + animationName);
    removeClass(element, namespace + '-' + animationName + '-active');
    enableTransitions(element);
  });
}

/**
 * Adds the stagger classes measure the stagger duration and removes
 * the classes again.
 */
function _getStaggering(_ref8) {
  var element = _ref8.element;
  var animationIndex = _ref8.animationIndex;
  var animationName = _ref8.animationName;
  var namespace = _ref8.namespace;

  var delayWithoutStagger = getTransitionDelay(element);
  addClass(element, namespace + '-stagger');
  addClass(element, namespace + '-' + animationName + '-stagger');
  var delayWithStagger = getTransitionDelay(element);
  removeClass(element, namespace + '-stagger');
  removeClass(element, namespace + '-' + animationName + '-stagger');
  // If there is no difference with or without the stagger class
  // asume that there is no staggering
  return delayWithoutStagger === delayWithStagger ? 0 : delayWithStagger * animationIndex;
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

  if (typeof addClasses === 'string') {
    addClasses = addClasses.split(/\s*(?:\s|,)\s*/);
  }

  if (typeof removeClasses === 'string') {
    removeClasses = removeClasses.split(/\s*(?:\s|,)\s*/);
  }
  // Turn element from a single element or a node list or an array to an array:
  var elements = isDomElement(element) ? [element] : Array.prototype.slice.call(element);
  return Promise.all(elements.map(function (element, animationIndex) {
    if (!isDomElement(element)) {
      throw new Error('Element is required');
    }
    // If we can't use a move animation fallback to an enter animation
    if (animation === morphAnimation && !morphParent.contains(element)) {
      animation = enterAnimation;
    }
    return animation({
      animationIndex: animationIndex,
      namespace: namespace,
      addClasses: addClasses,
      removeClasses: removeClasses,
      element: element,
      target: target,
      operation: operation,
      morphParent: morphParent
    });
  }));
}

/**
 * Inserts the given element as last child to the given target.
 * If the element was in the dom before it is animated
 * from the old position to the new position.
 *
 * @jsfiddle https://jsfiddle.net/aoz5y2n7/3/embedded/
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function appendTo(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target
  }, options));
}

/**
 * Inserts the given element as first child to the given target.
 * If the element was in the dom before it is animated
 * from the old position to the new position.
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function prependTo(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target,
    operation: 'prependTo'
  }, options));
}

/**
 * Animate the given element and removes it from the dom after
 * the animation is complete
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function remove(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return animorph(element, _extends({
    operation: 'remove'
  }, options));
}

/**
 * Adds classes for an enter animation
 *
 * Flow:
 *
 * 1. Changes the classes (without animation)
 *    + Add: `${namespace}-enter-prepare`
 *    + Add: `${namespace}-enter`
 *    + Add: `${namespace}-animate`
 * 2. Changes the classes (with animation)
 *    + Add: `${namespace}-enter-active`
 *    + Remove: `${namespace}-enter-prepare`
 * 4. Waits for the animation to end
 * 5. Changes the classes (without animation)
 *    + Remove: `${namespace}-enter-active`
 *    + Remove: `${namespace}-enter`
 *    + Remove: `${namespace}-animate`
 * 6. Fullfills the promise
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function enter(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return animorph(element, _extends({
    operation: 'enter'
  }, options));
}

/**
 * Adds classes for a leave animation
 *
 * Flow:
 *
 * 1. Changes the classes (without animation)
 *    + Add: `${namespace}-leave-prepare`
 *    + Add: `${namespace}-leave`
 *    + Add: `${namespace}-animate`
 * 2. Changes the classes (with animation)
 *    + Add: `${namespace}-leave-active`
 *    + Remove: `${namespace}-leave-prepare`
 * 4. Waits for the animation to end
 * 5. Changes the classes (without animation)
 *    + Remove: `${namespace}-leave-active`
 *    + Remove: `${namespace}-leave`
 *    + Remove: `${namespace}-animate`
 * 6. Fullfills the promise
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function leave(element) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return animorph(element, _extends({
    operation: 'leave'
  }, options));
}

/**
 * Inserts the given element to the dom after the given target.
 * If the element was in the dom before it is animated
 * from the old position to the new position.
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
function insertAfter$$1(element, target) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return animorph(element, _extends({
    target: target,
    operation: 'insertAfter'
  }, options));
}

/**
 * Adds and removes css-classes from the given element.
 *
 * Flow:
 *
 * 1. Changes the classes (without animation)
 *    + Add: `${namespace}-${transitionName}-prepare`
 *    + Add: `${namespace}-${transitionName}`
 *    + Add: `${namespace}-animate`
 * 2. Changes the classes (with animation)
 *    + Add: `${namespace}-${transitionName}-active`
 *    + Add: custom class names (optional)
 *    + Remove: `${namespace}-${transitionName}-prepare`
 *    + Remove: custom class names (optional)
 * 4. Waits for the animation to end
 * 5. Changes the classes (without animation)
 *    + Remove: `${namespace}-${transitionName}-active`
 *    + Remove: `${namespace}-${transitionName}`
 *    + Remove: `${namespace}-animate`
 * 6. Fullfills the promise
 *
 * @param  {HTMLElement} element        The element to animate
 * @param  {String[]} classNamesBefore  Custom classes to be removed
 * @param  {String[]} classNamesAfter   Custom classes to be added
 * @param  {String} ["enter"|"leave"]   Transition name: "enter"|"leave"
 * @param  {Object} [options]           Animorph options like namespace @see animorph
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

exports.animorph = animorph;
exports.appendTo = appendTo;
exports.prependTo = prependTo;
exports.remove = remove;
exports.enter = enter;
exports.leave = leave;
exports.insertAfter = insertAfter$$1;
exports.replaceClasses = replaceClasses;

Object.defineProperty(exports, '__esModule', { value: true });

})));
