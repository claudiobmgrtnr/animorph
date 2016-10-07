(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Animorph = factory());
}(this, (function () { 'use strict';

//
// This util allows to easily add, remove or toggle classes.
//
// Using it is neccessary as IE 9 doesn't support element classList
// and IE 11 doesn't support classList for SVG elements
// see also https://developer.mozilla.org/en/docs/Web/API/Element/classList
//
// This file is a replacement for domtokenlist because of
// https://github.com/medialize/ally.js/issues/147
//
// Usage:
//
// toggleClass(div, 'demo'); // Toggles the class `demo`
// toggleClass(div, 'demo', true); // Adds the class `demo`
// toggleClass(div, 'demo', false); // removes the class `demo`
//
// removeClass(div, 'demo');
// addClass(div, 'demo');
//

/**
 * Extract an array of all classNames of the given DOM or SVG node
 */
function getClassNames(element) {
	var className = element.getAttribute && element.getAttribute('class') || '';
	return className === '' ? [] : className.split(' ');
}

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

function removeClass(element, className) {
	return toggleClass(element, className, false);
}

function addClass(element, className) {
	if (className === undefined) {
		throw new Error('Class name is required');
	}
	return toggleClass(element, className, true);
}

function whichTransitionEnd() {
	var transitions = {
		'transition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'oTransitionEnd otransitionend'
	};

	for (var t in transitions) {
		if (document.documentElement.style[t] !== undefined) {
			return transitions[t];
		}
	}
}

var transitionEnd = whichTransitionEnd();

function detachNode(node) {
	// Detach from dom before any classes are added
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

function prependNode(node, targetContainer) {
	if (targetContainer.firstChild) {
		targetContainer.insertBefore(node, targetContainer.firstChild);
	} else {
		targetContainer.appendChild(node);
	}
}

function cloneNode(node) {
	var clone = node.cloneNode(false);
	clone.innerHTML = node.innerHTML;
	return clone;
}

function attachNode(node, targetContainer, domOperation) {
	switch (domOperation) {
		case 'append':
			targetContainer.appendChild(node);
			break;
		case 'prepend':
			prependNode(node, targetContainer);
			break;
		default:
			throw new Error('Invalid dom operation');
	}
}







function waitUntilTransitionEnd(node) {
	console.log("wait for", node);
	return new Promise(function (resolve) {
		var transitionEndListener = function transitionEndListener(event) {
			resolve(event);
			node.removeEventListener(transitionEnd, transitionEndListener);
		};
		node.addEventListener(transitionEnd, transitionEndListener, false);
	});
}

/*
 Entering as new
 + .ng-animate
 + .ng-enter
 + .ng-enter-active
 Entering from existing (Moving Element)
 + .ng-animate
 + .ng-leave
 + .ng-anchor
 + .ng-anchor-in-add
 + .ng-anchor-out-remove
 + .ng-anchor-in
 + .ng-anchor-in-add-active
 + .ng-anchor-out-remove-active
 Placeholder during Movement
 + .ng-animate
 + .ng-animate-shim
 */

var animationClassNames = ['animate', 'enter', 'move', 'leave', 'enter-prepare', //styles you want to apply to the enter object without transition
'move-prepare', //styles you want to apply to the move object without transition
'leave-prepare', //styles you want to apply to the leave object without transition
'enter-active', 'move-active', 'leave-active'];

function getNamespacedAnimationClasses(namespace) {
  var classes = {};
  animationClassNames.forEach(function (className) {
    classes[className] = namespace + '-' + className;
  });
  return classes;
}

var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

function requestAnimationFramePromise() {
	return new Promise(function (resolve) {
		return requestAnimationFrame(resolve);
	});
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Animorph = function () {
	function Animorph() {
		var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'am';

		_classCallCheck(this, Animorph);

		this.classes = getNamespacedAnimationClasses(namespace);
		this.namespace = namespace;
	}

	_createClass(Animorph, [{
		key: 'appendTo',
		value: function appendTo(itemToMorph, targetContainer) {
			this._morph(itemToMorph, targetContainer, 'append');
		}
	}, {
		key: 'prependTo',
		value: function prependTo(itemToMorph, targetContainer) {
			this._morph(itemToMorph, targetContainer, 'prepend');
		}
	}, {
		key: 'leave',
		value: function leave(leaveNode) {
			this._prepare(leaveNode, 'leave');
			return this._startAnimation(leaveNode, 'leave').then(function () {
				return waitUntilTransitionEnd(leaveNode);
			}).then(function (event) {
				return console.log("leave node", event);
			});
		}
	}, {
		key: 'enter',
		value: function enter(enterNode) {
			var _this = this;

			this._prepare(enterNode, 'enter');
			return this._startAnimation(enterNode, 'enter').then(function () {
				return waitUntilTransitionEnd(enterNode);
			}).then(function () {
				return _this._disableTransitions(enterNode);
			}).then(function () {
				return requestAnimationFramePromise();
			}).then(function () {
				removeClass(enterNode, _this.classes['enter']);
				removeClass(enterNode, _this.classes['enter-active']);
				_this._enableTransitions(enterNode);
			});
		}
	}, {
		key: '_prepare',
		value: function _prepare(node, animationType) {
			this._disableTransitions(node);
			addClass(node, this.classes[animationType + '-prepare']);
			addClass(node, this.classes['' + animationType]);
		}
	}, {
		key: '_startAnimation',
		value: function _startAnimation(node, animationType, addClasses, removeClasses) {
			var _this2 = this;

			return requestAnimationFramePromise().then(function () {
				_this2._enableTransitions(node);
				return requestAnimationFramePromise().then(function () {
					removeClass(node, _this2.classes[animationType + '-prepare']);
					addClass(node, _this2.classes[animationType + '-active']);
					//addClasses.forEach((className) => addClass(node, className));
					//removeClasses.forEach((className) => removeClass(node, className));
				});
			});
		}
	}, {
		key: '_morph',
		value: function _morph(itemToMorph, targetContainer, domOperation) {
			console.log(this._getElementPosition(itemToMorph));
			var leavePlaceholder = this._createLeavePlaceholder(itemToMorph);
			var animationElement = this._createAnimatedElement(itemToMorph);
			attachNode(itemToMorph, targetContainer, domOperation);
			this.enter(itemToMorph);
			this._move(animationElement, itemToMorph).then(function () {
				return detachNode(animationElement);
			});
			this.leave(leavePlaceholder).then(function () {
				return detachNode(leavePlaceholder);
			});
		}
	}, {
		key: '_move',
		value: function _move(currentStateNode, futureStateNode) {
			var position = this._getElementPosition(futureStateNode);
			this._prepare(currentStateNode, 'move');
			return this._startAnimation(currentStateNode, 'move').then(function () {
				currentStateNode.setAttribute('style', 'position: absolute; top: ' + position.top + '; left: ' + position.left + ';');
			}).then(function () {
				return waitUntilTransitionEnd(currentStateNode);
			}).then(function (event) {
				return console.log("move node", event);
			});
		}
	}, {
		key: '_createLeavePlaceholder',
		value: function _createLeavePlaceholder(node) {
			var clone = cloneNode(node);
			node.insertAdjacentElement('afterend', clone);
			return clone;
		}
	}, {
		key: '_createAnimatedElement',
		value: function _createAnimatedElement(node) {
			var clone = cloneNode(node);
			var position = this._getElementPosition(node);
			clone.setAttribute('style', 'position: absolute; top: ' + position.top + '; left: ' + position.left + ';');
			document.body.insertAdjacentElement('afterend', clone);
			return clone;
		}
	}, {
		key: '_disableTransitions',
		value: function _disableTransitions(node) {
			node.style.transition = 'none';
		}
	}, {
		key: '_enableTransitions',
		value: function _enableTransitions(node) {
			node.style.transition = '';
		}
	}, {
		key: '_getElementPosition',
		value: function _getElementPosition(node) {
			var rect = node.getBoundingClientRect();
			var offset = {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft
			};
			return offset;
		}
	}, {
		key: '_endAnimation',
		value: function _endAnimation(node) {
			var _this3 = this;

			var classList = node.classList;
			classList.forEach(function (item, i, object) {
				if (item.startsWith(_this3.namespace + '-')) {
					object.splice(i, 1);
				}
			});
			console.log(classList);
		}
	}]);

	return Animorph;
}();

/**
 * Export all public methods of the internal Animorph class
 */
function AnimorphAPI(namespace) {
	// Create new instance of the internal Animorph Class
	var animorph = new Animorph(namespace);

	this.appendTo = function () {
		animorph.appendTo.apply(animorph, arguments);
	};

	this.prependTo = function () {
		animorph.prependTo.apply(animorph, arguments);
	};
}

return AnimorphAPI;

})));
//# sourceMappingURL=index.js.map
