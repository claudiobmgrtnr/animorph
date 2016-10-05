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

const animationClassNames = [
	'animate',
	'enter',
	'animate-active'
];


export function getNamespacedAnimationClasses(namespace) {
	const classes = {};
	animationClassNames.forEach((className) => {
		const camelCasedName = className.replace(/\-(.)/g, (match, character) => character.toUpperCase());
		classes[camelCasedName] = `${namespace}-${className}`;
	});
	return classes;
}

