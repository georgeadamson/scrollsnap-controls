import { Component, Prop, State, Watch, Element, h } from '@stencil/core';

// Carousel Page Indicators

// Ponyfill for scrollIntoView will be late-loaded in unsupported browsers: (Safari, Edge, IE11)
let scrollIntoViewPonyfill;

const DOT_CLASSNAME = 'scrollsnap-control-dot';
const DOTS_CLASSNAME = 'scrollsnap-control-dots';
const EVENT_LISTENER_OPTIONS = { capture: true, passive: true }
const isTrue = { true: true };

@Component({
  tag: 'scrollsnap-controls',
  styleUrl: 'scrollsnap-controls.css',
  shadow: false,
  scoped: false
})
export class ScrollsnapControls {

  /**
   * Required: id or CSS selector of your scrollsnap slider, so this component can bind to it.
   */
  @Prop({ attribute: 'for' }) htmlFor!: string | 'auto';

  /**
   * Optional: id or CSS selector for your "Previous" button.
   */
  @Prop() prev: string;

  /**
   * Optional: id or CSS selector for your "Next" button.
   */
  @Prop() next: string;

  /**
   * Optional: Specify a character or markup for an indicator dot.
   */
  @Prop() dot: string | (() => void) ='◯';

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
   * Experimental: When set, the component will attributes on the scrollsnap elements.
   * By default it will set data-scrollsnap-current-index="0" on the scrollsnap slider.
   * This can be helpful for CSS or as a hook for extra behaviours.
   */
   @Prop() attrs: boolean = false;

  /**
   * Experimental: When set, the component will set attributes on the elements that match this selector.
   * This can be helpful for CSS or as a hook for extra behaviours.
   * This attribute will be set: data-scrollsnap-current-index="0".
   */
   @Prop() notify: string = '';

  /**
   * Experimental: When set, the component will attempt better paging of the scrollsnap using the ← → arrow keys.
   */
  @Prop() keys: boolean = false;


  /**
   *
   */
  @Prop() scrollIntoViewOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center', inline: 'center' };

  @Element() element: HTMLElement;

  // Keep track of slides internally:
  @State() slides: Element[] = [];

  @Watch('currentIndex')
  onIndexChange(newCurrentIndex: number) {
    const { slides, slider, attrs, notify, aria, polyfill, scrollIntoViewOptions } = this;

    // Late-load ponyfill for smooth-scrolling if not supported: (Safari, Edge, IE11)
    if (polyfill && !scrollIntoViewPonyfill) {
      const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

      if (isTrue[String(polyfill)] || (polyfill === 'auto' && !isSmoothScrollSupported)) {

        // @ts-ignore
        import('https://cdn.skypack.dev/smooth-scroll-into-view-if-needed?min')
          .then(module => scrollIntoViewPonyfill = module.default);
      }
    }

    const slide = slides[newCurrentIndex];

    if (attrs) {
      slider.setAttribute('data-scrollsnap-current-index', String(newCurrentIndex));
    }

    if (notify) {
      this.prev && querySelector(this.prev)?.setAttribute('data-scrollsnap-current-index', String(newCurrentIndex));
      this.next && querySelector(this.next)?.setAttribute('data-scrollsnap-current-index', String(newCurrentIndex));

      // If notify prop might be a selector (ie not just true), use it find elements to update:
      if (!{ true: true }[notify] ) {
        document.querySelectorAll(notify).forEach(
          el => el.setAttribute('data-scrollsnap-current-index', String(newCurrentIndex))
        )
      }
    }

    disableButtons.call(this, newCurrentIndex);

    // Ensure current slide has aria-current="true":
    if (aria) {
      slides.forEach((slide,i) => {
        if (i === newCurrentIndex) {
          slide.setAttribute('aria-current', 'true');
        } else if (slide.hasAttribute('aria-current')) {
          slide.removeAttribute('aria-current');
        }
      })
    }

    // Scroll the slide into view (using polyfill in browsers that do not support smoothscroll)
    if (scrollIntoViewPonyfill) {
      // https://scroll-into-view-if-needed.netlify.app/
      scrollIntoViewPonyfill(slide, {...scrollIntoViewOptions, boundary: this.slider });
    } else {
      slide.scrollIntoView(scrollIntoViewOptions);
    }
  }

  private slider: Element;

  init() {
    const { htmlFor , attrs, notify, currentIndex } = this;
    const slider = this.slider = htmlFor === 'auto'
      ? this.element.parentElement.querySelector('ul,ol')
      : querySelector(htmlFor);

    if (slider) {
      this.slides = Array.from(slider.children);

      if (attrs) {
        slider.setAttribute('data-scrollsnap-current-index', String(currentIndex));
      }

      if (notify) {
        document.querySelectorAll(notify).forEach(
          el => el.setAttribute('data-scrollsnap-current-index', String(currentIndex))
        )
      }
    }


  }

  // Will be handler to react to user scrolling:
  onScroll: (e: WheelEvent) => void = null;

  // Jump to corresponding slide when user clicks an indicator dot:
  onDotClick = (e: MouseEvent) => {
    const dot = (e.target as HTMLElement).closest(`.${DOT_CLASSNAME}`);
    if (dot) {
      const i = Array.from(dot.parentNode.children).indexOf(dot);
      this.moveTo(i);
    }
  }

  // Always use this method to move slides because it includes the logic to keep currentIndex within limits:
  moveTo = (i: number) => {
    this.currentIndex = Math.max(0, Math.min(this.slides.length - 1, Number(i) || 0));
  }

  movePrev = () => {
    this.moveTo(this.currentIndex - 1);
  }

  moveNext = () => {
    this.moveTo(this.currentIndex + 1);
  }

  // Delegated click handler for the Prev/Next buttons:
  onBtnClick = (e: MouseEvent) => {
    const { prev, next } = this;
    const target = e.target as HTMLElement;

    if (next && closest(target, next)) {
      this.moveNext();
    } else if(prev && closest(target, prev)) {
      this.movePrev();
    }
  }

  onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') this.currentIndex++;
    else if (e.key === 'ArrowLeft') this.currentIndex--;
  }

  componentWillLoad() {
    this.init();

    const { slider, prev, next, keys, onKey, onBtnClick } = this;

    if (slider) {
      // Bind our scroll handler to this component instance and keep a reference so we can remove it later:
      this.onScroll = debounce(onScroll.bind(this), 100);
      slider.addEventListener('scroll', this.onScroll, EVENT_LISTENER_OPTIONS);
      if (keys) slider.addEventListener('keydown', onKey, EVENT_LISTENER_OPTIONS);
    }

    if (next || prev) {
      document.addEventListener('click', onBtnClick, EVENT_LISTENER_OPTIONS);
      disableButtons.call(this, this.currentIndex || 0);
    }

    // // Late-load ponyfill for smooth-scrolling if not supported: (Safari, Edge, IE11)
    // if (!isSmoothScrollSupported && !scrollIntoViewPonyfill && this.polyfill) {
    //   // @ts-ignore
    //   import('https://cdn.skypack.dev/smooth-scroll-into-view-if-needed?min')
    //     .then(module => scrollIntoViewPonyfill = module.default);
    // }
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
    const { slides = [], dot, currentDot, currentIndex, onDotClick, onKey} = this;

    return (
      <ol class={DOTS_CLASSNAME} aria-hidden="true" onClick={onDotClick} onKeyDown={onKey}>
        {slides.map((_,i) => (
          <li class={`${DOT_CLASSNAME} ${currentIndex === i ? 'active' : ''}`}>
            {currentIndex === i ? currentDot : dot}
          </li>)
        )}
      </ol>
    );
  }

}

// This rudimentary version of a debounce helper is all we need here:
function debounce(fn, ms) {
	let timerId
	return () => {
		clearTimeout(timerId)
		timerId = setTimeout(() => {
			timerId = null;
      fn()
		}, ms);
	}
}

// Handler to react when user scrolls. Must be used after onScroll.bind(this)
// WARNING: This assumes all slides are the same width.
// Could make the position detection smarter...?
function onScroll() {
  const { slider, slides } = this;
  this.currentIndex = Math.round((slider.scrollLeft / slider.scrollWidth) * slides.length);
}

// Helper to disable the Prev/Next buttons when start or end of carousel is reached.
// Must be used with "this" context set, eg: disableButtons.call(this)
function disableButtons(currentIndex: number) {
  if (this.disable) {
    const prevEl = this.prev && querySelector(this.prev);
    const nextEl = this.next && querySelector(this.next);

    const disablePrev = currentIndex === 0 || this.slides.length === 0;
    const disableNext = currentIndex === this.slides.length - 1 || this.slides.length === 0;

    prevEl && (disablePrev ? prevEl.setAttribute('disabled', 'disabled') : prevEl.removeAttribute('disabled'));
    nextEl && (disableNext ? nextEl.setAttribute('disabled', 'disabled') : nextEl.removeAttribute('disabled'));
  }
}

// Same as slider.closest() but first searches by id in case an id has been supplied:
function closest(el: HTMLElement, selector: string) {
  let result;
  try {
    // Try it as an id selector: (Ignore error if we've made the selector invalid by prefixing with #)
    result = el.closest(`#${selector}`);
  } catch(err) {
    // Ignore error
  } finally {
    // Return slider if found by id, or try the selector as-is, and surface any error as nornal to help debug:
    return result || el.closest(selector);
  }
}

// Same as document.querySelector() but first searches by id in case an id has been supplied:
function querySelector(selector: string) {
  return document.getElementById(selector) || document.querySelector(selector);
}