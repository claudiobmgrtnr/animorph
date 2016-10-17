///<reference types="jquery" />
///<reference path="./vanilla.d.ts" />

interface JQuery {
  amAppendTo(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amPrependTo(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amRemove(options?: Animorph.Options): Promise<any>;
  amLeave(options?: Animorph.Options): Promise<any>;
  amInsertAfter(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amReplaceClasses(classNamesBefore?: String[] | String, classNamesAfter?: String[] | String, transitionName?: 'enter'|'leave', options?: Animorph.Options): Promise<any>;
}
