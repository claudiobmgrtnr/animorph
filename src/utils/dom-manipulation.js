/**
 * Removes the given element from it's parent
 *
 * @param  {HTMLElement} node The node to remove
 */
export function detachNode (node) {
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
export function prependNode (node, targetContainer) {
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
export function cloneNode (node) {
  const clone = node.cloneNode(false);
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
export function attachNode (node, target, domOperation) {
  switch (domOperation) {
    case 'appendTo':
      target.appendChild(node);
      break;
    case 'prependTo':
      prependNode(node, target);
      break;
    case 'insertAfter':
      insertAfter(node, target);
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
export function disableTransitions (node) {
  node.style.transition = 'none';
}

/**
 * Reverts disableTransitions
 *
 * @param  {HTMLElement} node The element
 */
export function enableTransitions (node) {
  node.style.transition = '';
}

/**
 * Returns the absolute position of the node to the document
 *
 * @param  {HTMLElement} node The element to measure
 * @return {{left: {Number}, top: {Number} }
 */
export function getElementPosition (node) {
  if (node === document.body) {
    return { left: 0, top: 0 };
  }
  // Support: IE <=11 only
  // Running getBoundingClientRect on a
  // disconnected node in IE throws an error
  if (!node.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  const rect = node.getBoundingClientRect();
  if (rect.width || rect.height) {
    const docElem = document.documentElement;
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
export function waitUntilTransitionEnd (node) {
  const durations = getTransitionDuration(node);
  const delays = getTransitionDelay(node);
  const entireAnimationTimes = durations.map((duration, i) => duration + delays[i]);
  const longestDuration = Math.max(...entireAnimationTimes);
  return new Promise((resolve) => {
    setTimeout(() => resolve(node), longestDuration);
  });
}

/**
 * Extract an array of all classNames of the given DOM or SVG node
 *
 * @param  {HTMLElement} element The element
 * @return {String[]} Classes
 */
export function getClassNames (element) {
  const className = element.getAttribute && element.getAttribute('class') || '';
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
export function toggleClass (element, className, force) {
  const classNames = getClassNames(element);
  const idx = classNames.indexOf(className);
  const hasClass = idx !== -1;
  const shouldHaveClass = force !== undefined ? force : !hasClass;
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
export function removeClass (element, className) {
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
export function addClass (element, className) {
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
function stringToMilliSeconds (timeString) {
  const timeUnits = {
    s: 1000,
    ms: 1
  };
  const parsedTime = /([.\d]+)\s*(\D+)/.exec(timeString);
  return parsedTime ? parseFloat(parsedTime[1], 10) * timeUnits[parsedTime[2]] : 0;
}

/**
 * Returns the duration of an elements transition
 * @param  {HTMLElement} node The element to measure
 * @return {Number[]} time in milliseconds
 */
function getTransitionDuration (node) {
  return (window.getComputedStyle(node).transitionDuration || '')
    .split(',')
    .map((delay) => stringToMilliSeconds(delay));
}

/**
 * Returns the delay of an elements transition
 * @param  {HTMLElement} node The element to measure
 * @return {Number[]} time in milliseconds
 */
export function getTransitionDelay (node) {
  return (window.getComputedStyle(node).transitionDelay || '')
    .split(',')
    .map((delay) => stringToMilliSeconds(delay));
}

/**
 * Force a browser repaint to apply all current styles
 *
 * @param node
 */
export function forceReflow (node) {
  return new Promise((resolve) => {
    resolve(node.offsetHeight);
  });
}

/**
 * Checks if node is a dom element
 * @param node
 * @returns {*}
 */
export function isDomElement (node) {
  // For all modern browser
  if (window.HTMLElement) {
    return node instanceof window.HTMLElement;
  }
  // For IE9 <3
  return node && typeof node === 'object' && node.nodeType === 1 && node.nodeName;
}

/**
 * Inserts a new node after a desired reference node.
 * @param referenceNode
 * @param newNode
 * @returns {Node}
 */
export function insertAfter (referenceNode, newNode) {
  // For all modern browser and Firefox version 48 and higher
  if (referenceNode.insertAdjacentElement) {
    return referenceNode.insertAdjacentElement('afterend', newNode);
  }
  // For Firefox version 48 and lower
  // If referenceNode is the last child within its parent element, that's fine, because referenceNode.nextSibling
  // will be null and insertBefore handles that case by adding to the end of the parent
  return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
