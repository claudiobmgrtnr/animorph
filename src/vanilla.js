import {
  morphAnimation,
  enterAnimation,
  leaveAnimation,
  removeAnimation
} from './utils/animation';

import {
  isDomElement
} from './utils/dom-manipulation';

// Mapping of dom operation to animation
const operations = {
  appendTo: morphAnimation,
  prependTo: morphAnimation,
  insertBefore: morphAnimation,
  insertAfter: morphAnimation,
  remove: removeAnimation,
  enter: enterAnimation,
  leave: leaveAnimation
};

export function animorph (element, {
  namespace = 'am',
  addClasses = [],
  removeClasses = [],
  target,
  operation = 'appendTo',
  morphParent = document.body
}) {
  let animation = operations[operation];
  if (!animation) {
    throw new Error(`Invalid operation '${operation}'`);
  }

  if (typeof addClasses === 'string') {
    addClasses = addClasses.split(/\s*(?:\s|,)\s*/);
  }

  if (typeof removeClasses === 'string') {
    removeClasses = removeClasses.split(/\s*(?:\s|,)\s*/);
  }
  // Turn element from a single element or a node list or an array to an array:
  const elements = isDomElement(element) ? [element] : Array.prototype.slice.call(element);
  return Promise.all(elements.map((element, animationIndex) => {
    if (!isDomElement(element)) {
      throw new Error('Element is required');
    }
    // If we can't use a move animation fallback to an enter animation
    if (animation === morphAnimation && !morphParent.contains(element)) {
      animation = enterAnimation;
    }
    return animation({
      animationIndex,
      namespace,
      addClasses,
      removeClasses,
      element,
      target,
      operation,
      morphParent
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
export function appendTo (element, target, options = {}) {
  return animorph(element, {
    target,
    ...options
  });
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
export function prependTo (element, target, options = {}) {
  return animorph(element, {
    target,
    operation: 'prependTo',
    ...options
  });
}

/**
 * Animate the given element and removes it from the dom after
 * the animation is complete
 *
 * @param  {HTMLElement} element   The element to animate
 * @param  {Object} [options]      Animorph options like namespace @see animorph
 * @return {Promise}               Promise of the animation
 */
export function remove (element, options = {}) {
  return animorph(element, {
    operation: 'remove',
    ...options
  });
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
export function enter (element, options = {}) {
  return animorph(element, {
    operation: 'enter',
    ...options
  });
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
export function leave (element, options = {}) {
  return animorph(element, {
    operation: 'leave',
    ...options
  });
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
export function insertAfter (element, target, options = {}) {
  return animorph(element, {
    target: target,
    operation: 'insertAfter',
    ...options
  });
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
export function replaceClasses (element, classNamesBefore, classNamesAfter, transitionName = 'enter', options = {}) {
  return animorph(element, {
    addClasses: classNamesAfter,
    removeClasses: classNamesBefore,
    operation: transitionName,
    ...options
  });
}
