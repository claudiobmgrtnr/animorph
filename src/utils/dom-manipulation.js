import transitionEnd from './feature-detects';

export function detachNode(node) {
	// Detach from dom before any classes are added
	if (node.parentNode) {
		node.parentNode.removeChild(node);
	}
}

export function prependNode(node, targetContainer) {
	if (targetContainer.firstChild) {
		targetContainer.insertBefore(node, targetContainer.firstChild);
	} else {
		targetContainer.appendChild(node);
	}
}

export function cloneNode(node) {
	const clone = node.cloneNode(false);
	clone.innerHTML = node.innerHTML;
	return clone;
}

export function attachNode(node, targetContainer, domOperation) {
	switch (domOperation) {
		case 'append':
			targetContainer.appendChild(node);
			break;
		case 'prepend':
			prependNode(node, targetContainer)
			break;
		default:
			throw new Error('Invalid dom operation');
	}
}

export function disableTransitions(node) {
	node.style.transition ='none';
}

export function enableTransitions(node) {
	node.style.transition = '';
}

export function getElementPosition(node) {
	const rect = node.getBoundingClientRect();
	const offset = {
		top: rect.top + document.body.scrollTop,
		left: rect.left + document.body.scrollLeft
	}
	return offset;
}

export function waitUntilTransitionEnd(node) {
	console.log("wait for", node);
	return new Promise((resolve) => {
		const transitionEndListener = function(event) {
			resolve(event);
			node.removeEventListener(transitionEnd, transitionEndListener);
		};
		node.addEventListener(transitionEnd, transitionEndListener, false);
	});
}