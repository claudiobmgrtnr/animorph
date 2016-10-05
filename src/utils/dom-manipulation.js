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