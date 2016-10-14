///<reference types="jquery" />


declare namespace Animorph {
  interface Options {
    namespace?: string,
    addClasses?: string[]|string,
    removeClasses?: string[]|string,
    target?:HTMLElement,
    operation?: 'appendTo'|'prependTo'|'insertBefore'|'insertAfter'|'remove'|'enter'|'leave',
    morphParent?: HTMLElement
  }
}

declare module 'animorph' {
  export function animorph(element: HTMLElement|HTMLElement[]|NodeList, options?: Animorph.Options): Promise<any>;
  export function appendTo(element: HTMLElement|HTMLElement[]|NodeList, target:HTMLElement, options?: Animorph.Options): Promise<any>;
  export function prependTo(element: HTMLElement|HTMLElement[]|NodeList, target:HTMLElement, options?: Animorph.Options): Promise<any>;
  export function remove(element: HTMLElement|HTMLElement[]|NodeList, options?: Animorph.Options): Promise<any>;
  export function leave(element: HTMLElement|HTMLElement[]|NodeList, options?: Animorph.Options): Promise<any>;
  export function insertAfter(element: HTMLElement|HTMLElement[]|NodeList, target:HTMLElement, options?: Animorph.Options): Promise<any>;
  export function replaceClasses(element: HTMLElement|HTMLElement[]|NodeList, classNamesBefore?: String[] | String, classNamesAfter?: String[] | String,  transitionName? :'enter'|'leave', options?: Animorph.Options): Promise<any>;
}

interface JQuery {
  amAppendTo(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amPrependTo(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amRemove(options?: Animorph.Options): Promise<any>;
  amLeave(options?: Animorph.Options): Promise<any>;
  amInsertAfter(target: JQuery|String|HTMLElement, options?: Animorph.Options): Promise<any>;
  amReplaceClasses(classNamesBefore?: String[] | String, classNamesAfter?: String[] | String, transitionName?: 'enter'|'leave', options?: Animorph.Options): Promise<any>;
}
