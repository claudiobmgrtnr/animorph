/**
 * Export all public methods of the internal Animorph class
 */
import Animorph from './utils/animorph';
export default function AnimorphAPI(namespace) {
	// Create new instance of the internal Animorph Class
	const animorph = new Animorph(namespace);

	this.appendTo = function() {
		animorph.appendTo(...arguments);
	};

	this.prependTo = function() {
		animorph.prependTo(...arguments);
	};
}