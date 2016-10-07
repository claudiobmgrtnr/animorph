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
	'move',
	'leave',
	'enter-prepare', //styles you want to apply to the enter object without transition
	'move-prepare',  //styles you want to apply to the move object without transition
	'leave-prepare', //styles you want to apply to the leave object without transition
	'enter-active',
	'move-active',
	'leave-active'
];


export function getNamespacedAnimationClasses(namespace) {
	const classes = {};
	animationClassNames.forEach((className) => {
		classes[className] = `${namespace}-${className}`;
	});
	return classes;
}

