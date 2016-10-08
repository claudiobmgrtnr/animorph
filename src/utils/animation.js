import { addClass, removeClass, detachNode, attachNode, cloneNode, waitUntilTransitionEnd, enableTransitions, disableTransitions } from './dom-manipulation';
import { requestAnimationFramePromise } from './request-animation-frame';

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
export function enterAnimation ({
  namespace,
  addClasses,
  removeClasses,
  element,
  target,
  operation
}) {
  if (target) {
    attachNode(element, target, operation);
  }
  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
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
export function leaveAnimation ({
  namespace,
  element,
  addClasses,
  removeClasses
}) {
  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
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
export function morphAnimation ({
  namespace,
  addClasses,
  removeClasses,
  element,
  target,
  operation,
  morphParent
}) {
  if (element instanceof window.HTMLElement === false) {
    throw new Error('target is required');
  }
  // Create clones which are needed for the morph effect
  const leavePlaceholder = _createLeavePlaceholder(element);
  const movePlaceholder = _createMovePlaceholder(element, morphParent);
  // Wait for all animations to finish
  return Promise.all([
    enterAnimation({
      namespace,
      addClasses,
      removeClasses,
      element,
      target,
      operation
    }),
    moveAnimation({
      namespace,
      addClasses,
      removeClasses,
      element: movePlaceholder,
      morphParent,
      target: element
    }),
    leaveAnimation({
      namespace,
      addClasses: [],
      removeClasses: [],
      element: leavePlaceholder
    })
  ]).then(() => {
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
export function removeAnimation (options) {
  return leaveAnimation(options).then(() => detachNode(options.element));
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
function moveAnimation ({
  namespace,
  addClasses,
  removeClasses,
  element,
  target,
  morphParent
}) {
  const targetPosition = _getElementPosition(target);
  const parentPosition = _getElementPosition(morphParent);
  const top = targetPosition.top - parentPosition.top;
  const left = targetPosition.left - parentPosition.left;
  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationName: 'move',
    onAnimationStart: () => {
      element.setAttribute('style', `position: absolute; top: ${top}; left: ${left};`);
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
function animation ({
  namespace,
  addClasses,
  removeClasses,
  element,
  animationName,
  onAnimationStart = () => {}
}) {
  return _startAnimation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationName
  })
  .then(onAnimationStart)
  .then(() => waitUntilTransitionEnd(element))
  .then(() => _removeAnimationClasses({
    namespace,
    element,
    animationName
  }));
}

function _createLeavePlaceholder (node) {
  const clone = cloneNode(node);
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
function _createMovePlaceholder (node, morphParent) {
  const clone = cloneNode(node);
  const elementPosition = _getElementPosition(node);
  const parentPosition = _getElementPosition(morphParent);
  const top = elementPosition.top - parentPosition.top;
  const left = elementPosition.left - parentPosition.left;
  clone.setAttribute('style', `position: absolute; top: ${top}; left: ${left};`);
  document.body.insertAdjacentElement('afterend', clone);
  return clone;
}

function _startAnimation ({
  namespace,
  element,
  addClasses,
  removeClasses,
  animationName = 'enter'
}) {
  disableTransitions(element);
  addClass(element, `${namespace}-${animationName}-prepare`);
  addClass(element, `${namespace}-${animationName}`);
  addClass(element, `${namespace}-animate`);
  return requestAnimationFramePromise().then(() => {
    removeClass(element, `${namespace}-${animationName}-prepare`);
    addClass(element, `${namespace}-${animationName}-active`);
    addClasses.forEach((className) => addClass(element, className));
    removeClasses.forEach((className) => removeClass(element, className));
    enableTransitions(element);
  });
}

function _getElementPosition (node) {
  const rect = node.getBoundingClientRect();
  const offset = {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
  };
  return offset;
}

function _removeAnimationClasses ({element, animationName, namespace}) {
  disableTransitions(element);
  return requestAnimationFramePromise()
  .then(() => {
    removeClass(element, `${namespace}-animate`);
    removeClass(element, `${namespace}-${animationName}`);
    removeClass(element, `${namespace}-${animationName}-active`);
    enableTransitions(element);
  });
}
