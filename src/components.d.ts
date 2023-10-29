/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface ScrollsnapControls {
        /**
          * Experimental: When set, the component will toggle aria attributes on the scrollsnap elements. This can be helpful to screenreaders but scenarios vary.
         */
        "aria": boolean;
        /**
          * Experimental: When set, the component will set attributes on the scrollsnap elements. By default it will set data-scrollsnap-current-index="0" on the scrollsnap slider. This can be helpful for CSS or as a hook for extra behaviours.
         */
        "attrs": boolean;
        /**
          * Optional: Specify a character or markup for the "current" page indicator dot.
         */
        "currentDot": string | (() => void);
        /**
          * Experimental: When set, the component will toggle disabled attributes on the Prev/Next buttons. (Since v0.0.7)
         */
        "disable": boolean;
        /**
          * Optional: Specify a character or markup for an indicator dot.
         */
        "dot": string | (() => void);
        /**
          * Function to return the index of the list item that is in the focal point of the scroll area. Defaults to find the index of the item in tthe centre of the visible area of scroll element. The funcion receives an array of children in the scroll element as its first argument.
         */
        "getIdx": (slides: HTMLElement[]) => number;
        /**
          * Required: id or CSS selector of your scrollsnap slider, so this component can bind to it.
         */
        "htmlFor": string | 'auto';
        /**
          * Read-write: Attribute to surface the index of the current page.
         */
        "idx": number;
        "infinite": boolean;
        /**
          * Optional: CSS selector to bind to your "Next" button.
         */
        "next": string;
        /**
          * Experimental: When set, the component will set data-attributes on the elements that match this selector. This can be helpful for CSS selectors or as a hook for extra behaviours. This attribute will be set: data-scrollsnap-current-index="0".
         */
        "notify": string | boolean;
        /**
          * Optional: When set, the component will fetch polyfills for browsers that do not support smoothscroll natively. (Eg Safari, Edge, IE11)
         */
        "polyfill": boolean | 'auto';
        /**
          * Optional: CSS selector to bind to your "Previous" button.
         */
        "prev": string;
        /**
          * An object with options for https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView Note: Up to version 0.0.10 this prop was named scrollIntoViewOptions.
         */
        "scrollIntoViewOptions": ScrollIntoViewOptions;
    }
}
declare global {
    interface HTMLScrollsnapControlsElement extends Components.ScrollsnapControls, HTMLStencilElement {
    }
    var HTMLScrollsnapControlsElement: {
        prototype: HTMLScrollsnapControlsElement;
        new (): HTMLScrollsnapControlsElement;
    };
    interface HTMLElementTagNameMap {
        "scrollsnap-controls": HTMLScrollsnapControlsElement;
    }
}
declare namespace LocalJSX {
    interface ScrollsnapControls {
        /**
          * Experimental: When set, the component will toggle aria attributes on the scrollsnap elements. This can be helpful to screenreaders but scenarios vary.
         */
        "aria"?: boolean;
        /**
          * Experimental: When set, the component will set attributes on the scrollsnap elements. By default it will set data-scrollsnap-current-index="0" on the scrollsnap slider. This can be helpful for CSS or as a hook for extra behaviours.
         */
        "attrs"?: boolean;
        /**
          * Optional: Specify a character or markup for the "current" page indicator dot.
         */
        "currentDot"?: string | (() => void);
        /**
          * Experimental: When set, the component will toggle disabled attributes on the Prev/Next buttons. (Since v0.0.7)
         */
        "disable"?: boolean;
        /**
          * Optional: Specify a character or markup for an indicator dot.
         */
        "dot"?: string | (() => void);
        /**
          * Function to return the index of the list item that is in the focal point of the scroll area. Defaults to find the index of the item in tthe centre of the visible area of scroll element. The funcion receives an array of children in the scroll element as its first argument.
         */
        "getIdx"?: (slides: HTMLElement[]) => number;
        /**
          * Required: id or CSS selector of your scrollsnap slider, so this component can bind to it.
         */
        "htmlFor"?: string | 'auto';
        /**
          * Read-write: Attribute to surface the index of the current page.
         */
        "idx"?: number;
        "infinite"?: boolean;
        /**
          * Optional: CSS selector to bind to your "Next" button.
         */
        "next"?: string;
        /**
          * Experimental: When set, the component will set data-attributes on the elements that match this selector. This can be helpful for CSS selectors or as a hook for extra behaviours. This attribute will be set: data-scrollsnap-current-index="0".
         */
        "notify"?: string | boolean;
        /**
          * Optional: When set, the component will fetch polyfills for browsers that do not support smoothscroll natively. (Eg Safari, Edge, IE11)
         */
        "polyfill"?: boolean | 'auto';
        /**
          * Optional: CSS selector to bind to your "Previous" button.
         */
        "prev"?: string;
        /**
          * An object with options for https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView Note: Up to version 0.0.10 this prop was named scrollIntoViewOptions.
         */
        "scrollIntoViewOptions"?: ScrollIntoViewOptions;
    }
    interface IntrinsicElements {
        "scrollsnap-controls": ScrollsnapControls;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "scrollsnap-controls": LocalJSX.ScrollsnapControls & JSXBase.HTMLAttributes<HTMLScrollsnapControlsElement>;
        }
    }
}
