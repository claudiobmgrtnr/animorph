import { addClass, removeClass, detachNode, attachNode, cloneNode, waitUntilTransitionEnd, enableTransitions, disableTransitions, getTransitionDelay, forceReflow } from './dom-manipulation';

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
  operation,
  animationIndex
}) {
  if (target) {
    attachNode(element, target, operation);
  }
  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationIndex,
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
  removeClasses,
  animationIndex
}) {
  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationIndex,
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
  morphParent,
  animationIndex
}) {
  if (element instanceof window.HTMLElement === false) {
    throw new Error('target is required');
  }
  // Create clones which are needed for the morph effect
  const leavePlaceholder = _createLeavePlaceholder(element);
  const movePlaceholder = _createMovePlaceholder(element, morphParent);
  // Add final classes for the enter element to determine the correct target position
  addClasses.forEach((className) => addClass(element, className));
  removeClasses.forEach((className) => removeClass(element, className));
  // Wait for all animations to finish
  return Promise.all([
    enterAnimation({
      namespace,
      addClasses: [],
      removeClasses: [],
      element,
      target,
      operation,
      animationIndex
    }),
    moveAnimation({
      namespace,
      addClasses,
      removeClasses,
      element: movePlaceholder,
      target: element,
      morphParent,
      animationIndex
    }),
    removeAnimation({
      namespace,
      addClasses: [],
      removeClasses: [],
      element: leavePlaceholder,
      animationIndex
    })
  ]).then(() => {
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
  morphParent,
  animationIndex
}) {
  const targetPosition = _getElementPosition(target, morphParent);
  const targetStyles = window.getComputedStyle(target);

  const top = targetPosition.top - parseFloat(targetStyles.marginTop);
  const left = targetPosition.left - parseFloat(targetStyles.marginLeft);

  return animation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationIndex,
    animationName: 'move',
    onAnimationStart: () => {
      element.style.position = 'absolute';
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
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
  animationIndex,
  onAnimationStart = () => {}
}) {
  return _startAnimation({
    namespace,
    element,
    addClasses,
    removeClasses,
    animationName,
    animationIndex
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
  const nodeStyles = window.getComputedStyle(node);
  const top = elementPosition.top - parentPosition.top - parseFloat(nodeStyles.marginTop);
  const left = elementPosition.left - parentPosition.left - parseFloat(nodeStyles.marginLeft);
  clone.style.position = 'absolute';
  clone.style.left = `${left}px`;
  clone.style.top = `${top}px`;
  morphParent.appendChild(clone);
  return clone;
}

function _startAnimation ({
  namespace,
  element,
  addClasses,
  removeClasses,
  animationIndex,
  animationName = 'enter'
}) {
  const staggeringDuration = _getStaggering({element, animationIndex, animationName, namespace});
  disableTransitions(element);
  addClass(element, `${namespace}-${animationName}-prepare`);
  addClass(element, `${namespace}-${animationName}`);
  addClass(element, `${namespace}-animate`);
  return new Promise((resolve) => {
    setTimeout(resolve, staggeringDuration);
  }).then(() => forceReflow(element).then(() => {
    forceReflow(element);
    removeClass(element, `${namespace}-${animationName}-prepare`);
    addClass(element, `${namespace}-${animationName}-active`);
    addClasses.forEach((className) => addClass(element, className));
    removeClasses.forEach((className) => removeClass(element, className));
    enableTransitions(element);
  }));
}

function _getElementPosition ( node, relativeEl = document.body ) {
  var x = 0;
  var y = 0;
  while (node && node != relativeEl && !isNaN( node.offsetLeft ) && !isNaN( node.offsetTop )) {
    x += node.offsetLeft - node.scrollLeft + node.clientLeft;
    y += node.offsetTop - node.scrollTop + node.clientTop;
    node = node.offsetParent;
  }
  return { top: y, left: x };
}



function _removeAnimationClasses ({element, animationName, namespace}) {
  disableTransitions(element);
  return forceReflow(element)
  .then(() => {
    removeClass(element, `${namespace}-animate`);
    removeClass(element, `${namespace}-${animationName}`);
    removeClass(element, `${namespace}-${animationName}-active`);
    enableTransitions(element);
  });
}

function _getStaggering ({element, animationIndex, animationName, namespace}) {
  const delayWithoutStagger = getTransitionDelay(element);
  addClass(element, `${namespace}-${animationName}-stagger`);
  const delayWithStagger = getTransitionDelay(element);
  removeClass(element, `${namespace}-${animationName}-stagger`);
  return delayWithoutStagger === delayWithStagger ? 0 : delayWithStagger * animationIndex;
}
