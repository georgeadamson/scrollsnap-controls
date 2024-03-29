import { Component, Prop, State, Watch, Element, h } from '@stencil/core';

// Prev/Next controls for a CSS scroll area. Plus "trainstops".

// To reference this code during development: <script type="module" src="/build/scrollsnap-controls.esm.js"></script>

// Ponyfill for scrollIntoView will be late-loaded in unsupported browsers: (Safari, Edge, IE11)
interface ScrollIntoViewPonyfillOptions extends ScrollIntoViewOptions {
  boundary: Element;
}
let scrollIntoViewPonyfill: (element: Element, scrollIntoViewOptions: ScrollIntoViewPonyfillOptions) => void;

const DOT_CLASSNAME = 'scrollsnap-control-dot';
const DOTS_CLASSNAME = 'scrollsnap-control-dots';
const CURRENT_IDX_ATTR = 'data-scrollsnap-current-index';
const SLIDER_SELECTOR = 'ul:not(scrollsnap-controls *),ol:not(scrollsnap-controls *)';
const CLICK_EVENT_OPTIONS = { capture: true }; // Not passive because we may need to call preventDefault()
const SCROLL_EVENT_OPTIONS = { capture: true, passive: true }; // Can be passive to improve scroll performance
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
   * Optional: CSS selector to bind to your "Previous" button.
   */
  @Prop() prev: string;

  /**
   * Optional: CSS selector to bind to your "Next" button.
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
   * Read-write: Attribute to surface the index of the current page.
   */
  @Prop({ attribute: 'current-index', mutable: true, reflect: true }) idx: number = 0;

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
   * By default it will set data-scrollsnap-current-index="0" on the scrollsnap slider.
   * This can be helpful for CSS or as a hook for extra behaviours.
   */
  @Prop() attrs: boolean = false;

  /**
   * Experimental: When set, the component will set data-attributes on the elements that match this selector.
   * This can be helpful for CSS selectors or as a hook for extra behaviours.
   * This attribute will be set: data-scrollsnap-current-index="0".
   */
  @Prop() notify: string | boolean;

  /**
   * DEPRECATED. When set, the component will attempt better paging of the scrollsnap using the ← → arrow keys.
   */
  // @Prop() keys: boolean = false;

  /**
   * An object with options for https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
   * Note: Up to version 0.0.10 this prop was named scrollIntoViewOptions.
   */
  @Prop({ attribute: 'scrollOptions' }) scrollIntoViewOptions: ScrollIntoViewOptions = {
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  };

  /**
   * Function to return the index of the list item that is in the focal point of the scroll area.
   * Defaults to find the index of the item in tthe centre of the visible area of scroll element.
   * The funcion receives an array of children in the scroll element as its first argument.
   */
  @Prop() getIdx = getIdx;

  /**
   *
   */
  @Prop() infinite = false;

  // Internal use only. Stencil exposes host as a reference to the <scrollsnap-controls> element itself:
  @Element() host: HTMLElement;

  // Keep track of slides internally:
  @State() slides: HTMLElement[] = [];

  // Set while scrolling to a specific item. Prevents scroll event triggering itself.
  @State() isScrollingTo: Boolean;

  @Watch('idx')
  onIndexChange(newIdx: number) {
    const { slides, slider, attrs, notify, aria, scrollIntoViewOptions } = this;
    const slide = slides[newIdx];

    if (attrs) {
      slider.setAttribute(CURRENT_IDX_ATTR, String(newIdx));
    }

    if (notify || notify === '') {
      doNotify.call(this);
    }

    disableButtons.call(this, newIdx);

    // Ensure current slide has aria-current="true":
    if (aria) {
      slides.forEach((slide, i) => toggleAttr(slide, 'aria-current', i, i === newIdx));
    }

    // Handler to unset isScrollingTo and unbind itself when scrolling finishes:
    const onAfterScroll = () => {
      this.isScrollingTo = false;
      onScrollHandler.call(this);
      slider.removeEventListener('scroll', debouncedScroll, SCROLL_EVENT_OPTIONS);
    };

    // Set isScrollingTo while scrolling to a specific item. Prevents code-triggered scroll from triggering itself:
    this.isScrollingTo = true;

    // Unset isScrollingTo when scrolling finishes:
    const debouncedScroll = debounce(onAfterScroll, 100);
    slider.addEventListener('scroll', debouncedScroll, SCROLL_EVENT_OPTIONS);

    // Scroll the slide into view (using polyfill in browsers that do not support smoothscroll)
    if (scrollIntoViewPonyfill) {
      // https://scroll-into-view-if-needed.netlify.app/
      scrollIntoViewPonyfill(slide, { ...scrollIntoViewOptions, boundary: this.slider });
    } else {
      slide.scrollIntoView(scrollIntoViewOptions);
    }
  }

  private slider: HTMLElement;
  private observer: IntersectionObserver;

  // During init this will be assigned a debounced handler for user scrolling:
  onScroll: (e: WheelEvent) => void = null;

  // Jump to corresponding slide when user clicks an indicator dot:
  onDotClick = (e: MouseEvent) => {
    const dot = (e.target as HTMLElement).closest('.' + DOT_CLASSNAME);
    if (dot) {
      const slides = dot.parentNode.children;
      const i = Array.from(slides).indexOf(dot);
      this.moveTo(i);
    }
  };

  // Bind delegated click handlers while the slider is in view:
  onInView = ([entry]: IntersectionObserverEntry[]) => {
    if (entry && (this.next || this.prev)) {
      if (entry.isIntersecting) {
        document.addEventListener('click', this.onBtnClick, CLICK_EVENT_OPTIONS);
        disableButtons.call(this, this.idx || 0);
      } else {
        document.removeEventListener('click', this.onBtnClick, CLICK_EVENT_OPTIONS);
      }
    }
  };

  // Always use this method to move slides because it includes the logic to keep idx within limits:
  moveTo = (i: number) => {
    const {
      infinite,
      slides: { length },
    } = this;

    // When infinite scrolling is enabled, move to the opposite end if already at the limit:
    if (infinite) {
      if (i === -1) {
        i = length - 1;
      } else if (i === length) {
        i = 0;
      }
    }

    this.idx = Math.max(0, Math.min(length - 1, Number(i) || 0));
  };

  // Deliberately simple handler so we don't duplicate logic in moveTo()
  movePrev = () => {
    this.moveTo(this.idx - 1);
  };

  // Deliberately simple handler so we don't duplicate logic in moveTo()
  moveNext = () => {
    this.moveTo(this.idx + 1);
  };

  // Delegated click handler for the Prev/Next buttons:
  // Important: Only do something after confirming the target is Prev or Next.
  onBtnClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const { prev, next, moveNext, movePrev } = this;

    const isNext = next && closest(target, next);
    const isPrev = !isNext && prev && closest(target, prev);

    // Edge case: If Prev/Next button is inside a link then stop the click bubbling up to it:
    if ((isNext || isPrev) && target.parentElement?.closest('a,button')) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isNext) {
      moveNext();
    } else if (isPrev) {
      movePrev();
    }
  };

  componentWillLoad() {
    let { scrollIntoViewOptions } = this;
    const { htmlFor, attrs, notify, idx, polyfill } = this;

    // When scrollIntoViewOptions are supplied as raw JSON convert to object:
    if (typeof scrollIntoViewOptions === 'string' && scrollIntoViewOptions) {
      try {
        scrollIntoViewOptions = JSON.parse(decodeURIComponent(scrollIntoViewOptions));
      } catch (err) {
        scrollIntoViewOptions = {};
      } finally {
        this.scrollIntoViewOptions = scrollIntoViewOptions;
      }
    }

    // Locate the carousel element nearby:
    const slider = (this.slider = htmlFor === 'auto' ? this.host.closest(`:has(${SLIDER_SELECTOR})`)?.querySelector(SLIDER_SELECTOR) : querySelector(htmlFor));

    if (slider) {
      this.slides = Array.from(slider.children) as HTMLElement[];

      if (attrs) {
        slider.setAttribute(CURRENT_IDX_ATTR, String(idx));
      }

      if (notify || notify === '') {
        doNotify.call(this);
      }

      // Bind our scroll handler to this component instance and keep a reference so we can remove it later:
      this.onScroll = throttle(onScrollHandler.bind(this), 50);
      slider.addEventListener('scroll', this.onScroll, SCROLL_EVENT_OPTIONS);
    }

    // Late-load ponyfill for smooth-scrolling if not supported: (Safari, Edge, IE11)
    if (polyfill && !scrollIntoViewPonyfill) {
      const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

      if (isTrue[String(polyfill)] || (polyfill === 'auto' && !isSmoothScrollSupported)) {
        import('smooth-scroll-into-view-if-needed').then(module => (scrollIntoViewPonyfill = module.default));
      }
    }
  }

  componentDidLoad() {
    this.slider && (this.observer = new IntersectionObserver(this.onInView)).observe(this.slider);
    // The code above is a condensed equivalent of:
    // if (this.slider) {
    //   this.observer = new IntersectionObserver(this.onInView);
    //   this.observer.observe(this.slider);
    // }
  }

  // Housekeeping:
  disconnectedCallback() {
    const { slider, onScroll, onBtnClick, observer } = this;

    // Tidy up IntersectionObserver:
    observer.disconnect();

    if (slider) {
      slider.removeEventListener('scroll', onScroll, SCROLL_EVENT_OPTIONS);
    }

    document.removeEventListener('click', onBtnClick, CLICK_EVENT_OPTIONS);
  }

  render() {
    const { slides = [], dot, currentDot, idx, onDotClick } = this;

    // Render the dots:
    return (
      <ol class={DOTS_CLASSNAME} aria-hidden="true" onClick={onDotClick}>
        {slides.map((_, i) => {
          const isActive = idx === i;
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
// (Does not handle "this" or args etc because they're not needed)
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

// Very stripped down throttle function just for this purpose.
// (Does not handle "this" or args etc because they're not needed)
function throttle(fn, delay) {
  let timeout = null;
  return () => {
    if (!timeout) {
      timeout = setTimeout(() => {
        fn();
        timeout = null;
      }, delay);
    }
  };
}

// Handler to react when user scrolls. Must be used after onScroll.bind(this)
// WARNING: This assumes all slides are the same width.
function onScrollHandler() {
  const {
    isScrollingTo,
    slider: { scrollLeft, scrollWidth, clientWidth },
  } = this;
  if (isScrollingTo) return;

  // Detect first and last position to avoid odd bounce effect when getIdx wrongly chooses the middle item:
  const scrollPercent = ~~((scrollLeft / (scrollWidth - clientWidth)) * 100);

  if (scrollPercent === 0) {
    this.idx = 0;
  } else if (scrollPercent === 100) {
    this.idx = this.slides.length - 1;
  } else {
    const index = getIdx(this.slides);
    if (index > -1) this.idx = index;
  }
}

function getIdx(slides: HTMLElement[]) {
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
function disableButtons(idx: number) {
  const { disable, infinite, prev, next, slides } = this;

  if (disable && !infinite) {
    const prevEl = prev && querySelector(prev);
    const nextEl = next && querySelector(next);

    const disablePrev = idx === 0 || slides.length === 0;
    const disableNext = idx === slides.length - 1 || slides.length === 0;

    prevEl && toggleAttr(prevEl, 'disabled', 'disabled', disablePrev);
    nextEl && toggleAttr(nextEl, 'disabled', 'disabled', disableNext);
  }
}

// Same as element.closest() but first searches by id in case an id has been supplied:
function closest(el: HTMLElement, selector: string) {
  let result;
  try {
    // Try it as an id selector:
    result = el.closest('#' + selector);
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

// Called when idx changes and if the notify attribute is set:
function doNotify() {
  const { notify, idx, slider, slides, prev, next } = this;

  // Update data-scrollsnap-active on carousel items:
  slides.forEach((slide, i) => toggleAttr(slide, CURRENT_IDX_ATTR, i, i === idx));

  slider.setAttribute(CURRENT_IDX_ATTR, String(idx));
  prev && querySelector(prev)?.setAttribute(CURRENT_IDX_ATTR, String(idx));
  next && querySelector(next)?.setAttribute(CURRENT_IDX_ATTR, String(idx));

  // If notify prop is a selector string (ie not just true), use it to find elements to update:
  if (notify && !isTrue[String(notify)]) {
    document.querySelectorAll(String(notify)).forEach(el => el.setAttribute(CURRENT_IDX_ATTR, String(idx)));
  }
}

// Helper to setAttribute or removeAttribute based on a condition:
function toggleAttr(element: HTMLElement, attrName: string, attrValue, condition = typeof attrValue !== 'undefined') {
  if (condition) {
    element.setAttribute(attrName, String(attrValue));
  } else if (element.hasAttribute(attrName)) {
    element.removeAttribute(attrName);
  }
}
