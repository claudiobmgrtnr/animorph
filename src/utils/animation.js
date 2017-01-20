import {
  addClass,
  removeClass,
  getClassNames,
  getElementPosition,
  detachNode,
  attachNode,
  cloneNode,
  waitUntilTransitionEnd,
  enableTransitions,
  disableTransitions,
  getTransitionDelay,
  forceReflow,
  insertAfter
} from './dom-manipulation';

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
 * @param  {HTMLElement} element  [description]
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
      morphParent,
      target: element,
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
 * @param  {HTMLElement} element  [description]
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
  const targetPosition = getElementPosition(target);
  const parentPosition = getElementPosition(morphParent);
  const targetStyles = window.getComputedStyle(target);

  const top = targetPosition.top - parentPosition.top - parseFloat(targetStyles.marginTop);
  const left = targetPosition.left - parentPosition.left - parseFloat(targetStyles.marginLeft);

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
 * @param  {function} [onAnimationStart] [description]
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
  insertAfter(node, clone);
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
  const elementPosition = getElementPosition(node);
  const parentPosition = getElementPosition(morphParent);
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
  const staggeringDuration = animationIndex === 0 ? 0 : _getStaggeringFromCache({element, animationIndex, animationName, namespace});
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

/**
 * Adds the stagger classes measure the stagger duration and removes
 * the classes again.
 */
function _getStaggering ({element, animationName, namespace}) {
  const delayWithoutStagger = getTransitionDelay(element);
  addClass(element, `${namespace}-stagger`);
  addClass(element, `${namespace}-${animationName}-stagger`);
  const delayWithStagger = getTransitionDelay(element);
  removeClass(element, `${namespace}-stagger`);
  removeClass(element, `${namespace}-${animationName}-stagger`);
  // If there is no difference with or without the stagger class
  // asume that there is no staggering
  return delayWithoutStagger[0] === delayWithStagger[0] ? 0 : delayWithStagger[0];
}

const staggeringCache = {};
/**
 * Returns the staggering duration from cache
 * The value is calculated if no duration is cache
 */
function _getStaggeringFromCache ({element, animationIndex, animationName, namespace}) {
  const classNames = getClassNames(element);
  classNames.sort();
  const key = classNames.join(' ');
  if (!staggeringCache[key]) {
    staggeringCache[key] = _getStaggering({element, animationIndex, animationName, namespace});
  }
  return staggeringCache[key] * animationIndex;
}
