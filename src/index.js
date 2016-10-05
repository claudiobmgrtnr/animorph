import transitionEnd from './utils/feature-detects';
import {addClass} from './utils/toggle-class';
import {detachNode, prependNode} from './utils/dom-manipulation';

export function appendTo (itemToMorph, targetContainer) {
	detachNode(itemToMorph);
	addClass(itemToMorph, `${namespace}-enter`);
	targetContainer.appendChild(itemToMorph);
}


export function prependTo (itemToMorph, targetContainer) {
	detachNode(itemToMorph);
	addClass(itemToMorph, `${namespace}-enter`);
	prependNode(itemToMorph, targetContainer);
}