function whichTransitionEnd() {
	var transitions = {
		'transition'       : 'transitionend',
		'WebkitTransition' : 'webkitTransitionEnd',
		'MozTransition'    : 'transitionend',
		'OTransition'      : 'oTransitionEnd otransitionend'
	};

	for(var t in transitions){
		if(document.documentElement.style[t] !== undefined){
			return transitions[t];
		}
	}
}

export default whichTransitionEnd();