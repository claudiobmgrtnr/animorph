import {addClass, removeClass} from './toggle-class';
import {detachNode, attachNode, cloneNode, waitUntilTransitionEnd} from './dom-manipulation';
import {getNamespacedAnimationClasses} from './css-classnames';
import {requestAnimationFramePromise} from './request-animation-frame';

export default class Animorph {
	constructor(namespace = 'am') {
		this.classes = getNamespacedAnimationClasses(namespace);
		this.namespace = namespace;
	}
	appendTo(itemToMorph, targetContainer) {
		this._morph(itemToMorph, targetContainer, 'append');
	}

	prependTo(itemToMorph, targetContainer) {
		this._morph(itemToMorph, targetContainer, 'prepend');
	}

	leave(leaveNode) {
		this._prepare(leaveNode, 'leave');
		return this._startAnimation(leaveNode, 'leave')
			.then(() => waitUntilTransitionEnd(leaveNode))
			.then((event) => console.log("leave node", event));
	}

	enter(enterNode) {
		this._prepare(enterNode, 'enter');
		return this._startAnimation(enterNode, 'enter')
			.then(() => waitUntilTransitionEnd(enterNode))
			.then(() => this._disableTransitions(enterNode))
			.then(() => requestAnimationFramePromise())
			.then(() => {
				removeClass(enterNode, this.classes[`enter`]);
				removeClass(enterNode, this.classes[`enter-active`]);
				this._enableTransitions(enterNode);
			})
	}

	_prepare(node, animationType) {
		this._disableTransitions(node);
		addClass(node, this.classes[`${animationType}-prepare`]);
		addClass(node, this.classes[`${animationType}`]);
	}

	_startAnimation(node, animationType, addClasses, removeClasses) {
		return requestAnimationFramePromise().then(() => {
			this._enableTransitions(node);
			return requestAnimationFramePromise().then(() => {
				removeClass(node, this.classes[`${animationType}-prepare`]);
				addClass(node, this.classes[`${animationType}-active`]);
				//addClasses.forEach((className) => addClass(node, className));
				//removeClasses.forEach((className) => removeClass(node, className));

			});
		});
	}

	_morph(itemToMorph, targetContainer, domOperation) {
		console.log(this._getElementPosition(itemToMorph));
		const leavePlaceholder = this._createLeavePlaceholder(itemToMorph);
		const animationElement = this._createAnimatedElement(itemToMorph);
		attachNode(itemToMorph, targetContainer, domOperation);
		this.enter(itemToMorph);
		this._move(animationElement, itemToMorph)
			.then(() => detachNode(animationElement));
		this.leave(leavePlaceholder)
			.then(() => detachNode(leavePlaceholder));
	}

	_move(currentStateNode, futureStateNode) {
		const position = this._getElementPosition(futureStateNode);
		this._prepare(currentStateNode, 'move');
		return this._startAnimation(currentStateNode, 'move')
			.then(() => {
				currentStateNode.setAttribute('style', `position: absolute; top: ${position.top}; left: ${position.left};`);
			})
			.then(() => waitUntilTransitionEnd(currentStateNode))
			.then((event) => console.log("move node", event))
	}

	_createLeavePlaceholder(node) {
		const clone = cloneNode(node);
		node.insertAdjacentElement('afterend', clone);
		return clone;
	}

	_createAnimatedElement(node) {
		const clone = cloneNode(node);
		const position = this._getElementPosition(node);
		clone.setAttribute('style', `position: absolute; top: ${position.top}; left: ${position.left};`);
		document.body.insertAdjacentElement('afterend', clone);
		return clone;
	}

	_disableTransitions(node) {
		node.style.transition ='none';
	}

	_enableTransitions(node) {
		node.style.transition = '';
	}

	_getElementPosition(node) {
		const rect = node.getBoundingClientRect();
		const offset = {
			top: rect.top + document.body.scrollTop,
			left: rect.left + document.body.scrollLeft
		}
		return offset;
	}

	_endAnimation(node) {
		let classList = node.classList;
		classList.forEach((item, i, object) => {
			if(item.startsWith(`${this.namespace}-`)){
				object.splice(i, 1);
			}
		});
		console.log(classList);
	}
}