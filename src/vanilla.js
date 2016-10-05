import {
  morphAnimation,
  enterAnimation,
  leaveAnimation,
  removeAnimation
} from './utils/animation';

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

  const elements = element instanceof window.HTMLElement ? [element] : Array.prototype.slice.call(element);
  console.log(elements);
  return Promise.all(elements.map((element, animationIndex) => {
    if (element instanceof window.HTMLElement === false) {
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

export function appendTo (element, target, options = {}) {
  return animorph(element, {
    target,
    ...options
  });
}

export function prependTo (element, target, options = {}) {
  return animorph(element, {
    target,
    operation: 'prependTo',
    ...options
  });
}

export function remove (element, options = {}) {
  return animorph(element, {
    operation: 'remove',
    ...options
  });
}

export function leave (element, options = {}) {
  return animorph(element, {
    operation: 'leave',
    ...options
  });
}

export function insertAfter (element, target, options = {}) {
  return animorph(element, {
    target: target,
    operation: 'insertAfter',
    ...options
  });
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
export function replaceClasses (element, classNamesBefore, classNamesAfter, transitionName = 'enter', options = {}) {
  return animorph(element, {
    addClasses: classNamesAfter,
    removeClasses: classNamesBefore,
    operation: transitionName,
    ...options
  });
}