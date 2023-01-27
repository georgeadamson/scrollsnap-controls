import { Component, Prop, State, Watch, Element, h } from '@stencil/core';

// Carousel Page Indicators

// Ponyfill for scrollIntoView will be late-loaded in unsupported browsers: (Safari, Edge, IE11)
let scrollIntoViewPonyfill;

const DOT_CLASSNAME = 'scrollsnap-control-dot';
const DOTS_CLASSNAME = 'scrollsnap-control-dots';
const CURRENT_INDEX_ATTR = 'data-scrollsnap-current-index';
const EVENT_LISTENER_OPTIONS = { capture: true, passive: true };
const SLIDER_SELECTOR = 'ul:not(scrollsnap-controls *),ol:not(scrollsnap-controls *)';
const isTrue = { true: true }; // Helper to match "true" or true (string or boolean).

@Component({
  tag: 'scrollsnap-controls',
  styleUrl: 'scrollsnap-controls.css',
  shadow: false,
  scoped: false,
})
export class ScrollsnapControls {
  /**
   * Required: id or CSS selector of your scrollsnap slider, so this component can bind to it.
   */
  @Prop({ attribute: 'for' }) htmlFor: string | 'auto' = 'auto';

  /**
   * Optional: CSS selector for your "Previous" button.
   */
  @Prop() prev: string;

  /**
   * Optional: CSS selector for your "Next" button.
   */
  @Prop() next: string;

  /**
   * Optional: Specify a character or markup for an indicator dot.
   */
  @Prop() dot: string | (() => void) = '◯';

  /**
   * Optional: Specify a character or markup for the "current" page indicator dot.
   */
  @Prop() currentDot: string | (() => void) = '⬤';

  /**
   * Readonly: Attribute to surface the index of the current page.
   */
  @Prop({ mutable: true, reflect: true }) currentIndex: number = 0;

  /**
   * Optional: When set, the component will fetch polyfills for browsers that do not support smoothscroll natively. (Eg Safari, Edge, IE11)
   */
  @Prop() polyfill: boolean | 'auto' = 'auto';

  /**
   * Experimental: When set, the component will toggle disabled attributes on the Prev/Next buttons.
   * (Since v0.0.7)
   */
  @Prop() disable: boolean = false;

  /**
   * Experimental: When set, the component will toggle aria attributes on the scrollsnap elements.
   * This can be helpful to screenreaders but scenarios vary.
   */
  @Prop() aria: boolean = false;

  /**
   * Experimental: When set, the component will set attributes on the scrollsnap elements.
   * By default it will setCURRENT_INDEX_ATTR"0" on the scrollsnap slider.
   * This can be helpful for CSS or as a hook for extra behaviours.
   */
  @Prop() attrs: boolean = false;

  /**
   * Experimental: When set, the component will set data-attributes on the elements that match this selector.
   * This can be helpful for CSS or as a hook for extra behaviours.
   * This attribute will be set:CURRENT_INDEX_ATTR"0".
   */
  @Prop() notify: string | boolean;

  /**
   * DEPRECATED. Experimental: When set, the component will attempt better paging of the scrollsnap using the ← → arrow keys.
   */
  @Prop() keys: boolean = false;

  /**
   * An object with options for https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
   */
  @Prop() scrollIntoViewOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'nearest', inline: 'center' };

  /**
   * Function to return the index of the list item that is in the focal point of the scroll area.
   * Defaults to find the index of the item in tthe centre of the visible area of scroll element.
   * The funcion receives an array of children in the scroll element as its first argument.
   */
  @Prop() getCurrentIndex = getCurrentIndex;

  //
  @Element() host: HTMLElement;

  // Keep track of slides internally:
  @State() slides: HTMLElement[] = [];

  @Watch('currentIndex')
  onIndexChange(newCurrentIndex: number) {
    const { slides, slider, attrs, notify, aria, scrollIntoViewOptions } = this;

    const slide = slides[newCurrentIndex];

    if (attrs) {
      slider.setAttribute(CURRENT_INDEX_ATTR, String(newCurrentIndex));
    }

    if (notify || notify === '') {
      doNotify.call(this);
    }

    disableButtons.call(this, newCurrentIndex);

    // Ensure current slide has aria-current="true":
    if (aria) {
      slides.forEach((slide, i) => toggleAttribute(slide, 'aria-current', i, i === newCurrentIndex));
    }

    // Scroll the slide into view (using polyfill in browsers that do not support smoothscroll)
    if (scrollIntoViewPonyfill) {
      // https://scroll-into-view-if-needed.netlify.app/
      scrollIntoViewPonyfill(slide, { ...scrollIntoViewOptions, boundary: this.slider });
    } else {
      slide.scrollIntoView(scrollIntoViewOptions);
    }
  }

  private slider: HTMLElement;

  // During init this will be assigned a debounced handler for user scrolling:
  onScroll: (e: WheelEvent) => void = null;

  // Jump to corresponding slide when user clicks an indicator dot:
  onDotClick = (e: MouseEvent) => {
    const dot = (e.target as HTMLElement).closest(`.${DOT_CLASSNAME}`);
    if (dot) {
      const slides = dot.parentNode.children;
      const i = Array.from(slides).indexOf(dot);
      this.moveTo(i);
    }
  };

  // Always use this method to move slides because it includes the logic to keep currentIndex within limits:
  moveTo = (i: number) => {
    this.currentIndex = Math.max(0, Math.min(this.slides.length - 1, Number(i) || 0));
  };

  movePrev = () => {
    this.moveTo(this.currentIndex - 1);
  };

  moveNext = () => {
    this.moveTo(this.currentIndex + 1);
  };

  // Delegated click handler for the Prev/Next buttons:
  onBtnClick = (e: MouseEvent) => {
    const { prev, next } = this;
    const target = e.target as HTMLElement;

    if (next && closest(target, next)) {
      this.moveNext();
    } else if (prev && closest(target, prev)) {
      this.movePrev();
    }
  };

  onKey = (e: KeyboardEvent) => {
    console.log(e);
    if (e.key === 'ArrowRight') this.currentIndex++;
    else if (e.key === 'ArrowLeft') this.currentIndex--;
  };

  componentWillLoad() {
    const { htmlFor, attrs, notify, currentIndex, prev, next, keys, onKey, onBtnClick, polyfill } = this;

    // Locate the carousel element:
    const slider = (this.slider = htmlFor === 'auto' ? this.host.closest(`:has(${SLIDER_SELECTOR})`).querySelector(SLIDER_SELECTOR) : querySelector(htmlFor));

    if (slider) {
      const slides = Array.from(slider.children) as HTMLElement[];
      this.slides = slides;

      if (attrs) {
        slider.setAttribute(CURRENT_INDEX_ATTR, String(currentIndex));
      }

      if (notify || notify === '') {
        doNotify.call(this);
      }

      // Bind our scroll handler to this component instance and keep a reference so we can remove it later:
      this.onScroll = debounce(onScrollHandler.bind(this), 100);
      slider.addEventListener('scroll', this.onScroll, EVENT_LISTENER_OPTIONS);
      if (keys) slider.addEventListener('keydown', onKey, EVENT_LISTENER_OPTIONS);
    }

    if (next || prev) {
      document.addEventListener('click', onBtnClick, EVENT_LISTENER_OPTIONS);
      disableButtons.call(this, this.currentIndex || 0);
    }

    // Late-load ponyfill for smooth-scrolling if not supported: (Safari, Edge, IE11)
    if (polyfill && !scrollIntoViewPonyfill) {
      const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

      if (isTrue[String(polyfill)] || (polyfill === 'auto' && !isSmoothScrollSupported)) {
        import('smooth-scroll-into-view-if-needed').then(module => (scrollIntoViewPonyfill = module.default));
      }
    }
  }

  // Housekeeping:
  disconnectedCallback() {
    const { slider, onScroll, onKey, onBtnClick } = this;

    if (slider) {
      slider.removeEventListener('scroll', onScroll, EVENT_LISTENER_OPTIONS);
      slider.removeEventListener('keydown', onKey, EVENT_LISTENER_OPTIONS);
    }

    document.removeEventListener('click', onBtnClick, EVENT_LISTENER_OPTIONS);
  }

  render() {
    const { slides = [], dot, currentDot, currentIndex, onDotClick, onKey } = this;

    return (
      <ol class={DOTS_CLASSNAME} aria-hidden="true" onClick={onDotClick} onKeyDown={onKey}>
        {slides.map((_, i) => {
          const isActive = currentIndex === i;
          return (
            <li key={i} class={`${DOT_CLASSNAME} ${isActive ? 'active' : ''}`} data-active={isActive}>
              {isActive ? currentDot : dot}
            </li>
          );
        })}
      </ol>
    );
  }
}

// This rudimentary version of a debounce helper is all we need here:
function debounce(fn, ms) {
  let timerId;
  return () => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      fn();
    }, ms);
  };
}

// Handler to react when user scrolls. Must be used after onScroll.bind(this)
// WARNING: This assumes all slides are the same width.
// Could make the position detection smarter...?
function onScrollHandler() {
  const index = getCurrentIndex(this.slides);
  if (index > -1) this.currentIndex = index;
}

function getCurrentIndex(slides: HTMLElement[]) {
  const slider = slides[0]?.parentElement;
  if (!slider) return -1;
  const { top, left, width, height } = slider.getBoundingClientRect();
  const middleOfBoundaryX = left + width / 2;
  const middleOfBoundaryY = top + height / 2;
  const target = document.elementFromPoint(middleOfBoundaryX, middleOfBoundaryY);
  return slides.findIndex(slide => slide.contains(target));
}

// Helper to disable the Prev/Next buttons when start or end of carousel is reached.
// Must be used with "this" context set, eg: disableButtons.call(this)
function disableButtons(currentIndex: number) {
  if (this.disable) {
    const { prev, next, slides } = this;
    const prevEl = prev && querySelector(prev);
    const nextEl = next && querySelector(next);

    const disablePrev = currentIndex === 0 || slides.length === 0;
    const disableNext = currentIndex === slides.length - 1 || slides.length === 0;

    // prevEl && (disablePrev ? prevEl.setAttribute('disabled', 'disabled') : prevEl.removeAttribute('disabled'));
    // nextEl && (disableNext ? nextEl.setAttribute('disabled', 'disabled') : nextEl.removeAttribute('disabled'));

    prevEl && toggleAttribute(prevEl, 'disabled', 'disabled', disablePrev);
    nextEl && toggleAttribute(nextEl, 'disabled', 'disabled', disableNext);
  }
}

// Same as element.closest() but first searches by id in case an id has been supplied:
function closest(el: HTMLElement, selector: string) {
  let result;
  try {
    // Try it as an id selector:
    result = el.closest(`#${selector}`);
  } catch (err) {
    // Ignore error if we made the selector invalid by prefixing with #
  } finally {
    // Return slider if found by id, or try the selector as-is, and surface any error as nornal to help debug:
    return result || el.closest(selector);
  }
}

// Same as document.querySelector() but first searches by id in case an id has been supplied:
function querySelector(selector: string) {
  return document.getElementById(selector) || document.querySelector(selector);
}

// Called when currentIndex changes and if the notify attribute is set:
function doNotify() {
  const { notify, currentIndex, slider, slides, prev, next } = this;

  // Update data-scrollsnap-active on carousel items:
  slides.forEach((slide, i) => toggleAttribute(slide, CURRENT_INDEX_ATTR, i, i === currentIndex));

  slider.setAttribute(CURRENT_INDEX_ATTR, String(currentIndex));
  prev && querySelector(prev)?.setAttribute(CURRENT_INDEX_ATTR, String(currentIndex));
  next && querySelector(next)?.setAttribute(CURRENT_INDEX_ATTR, String(currentIndex));

  // If notify prop is a selector string (ie not just true), use it to find elements to update:
  if (notify && !isTrue[String(notify)]) {
    document.querySelectorAll(String(notify)).forEach(el => el.setAttribute(CURRENT_INDEX_ATTR, String(currentIndex)));
  }
}

// Helper to setAttribute or removeAttribute based on a condition:
function toggleAttribute(element: HTMLElement, attrName: string, attrValue, condition = typeof attrValue !== 'undefined') {
  if (condition) {
    element.setAttribute(attrName, String(attrValue));
  } else if (element.hasAttribute(attrName)) {
    element.removeAttribute(attrName);
  }
}
