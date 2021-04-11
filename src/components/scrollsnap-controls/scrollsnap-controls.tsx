import { Component, Prop, State, Watch, h } from '@stencil/core';

// Carousel Page Indicators

// Ponyfill for scrollIntoView will be late-loaded in unsupported browsers: (Safari, Edge, IE11)
let scrollIntoViewPonyfill;
const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

const DOT_CLASSNAME = 'scrollsnap-control-dot';
const DOTS_CLASSNAME = 'scrollsnap-control-dots';
const EVENT_LISTENER_OPTIONS = { capture: true, passive: true }

@Component({
  tag: 'scrollsnap-controls',
  styleUrl: 'scrollsnap-controls.css',
  shadow: false,
  scoped: false
})
export class ScrollsnapControls {

  @Prop({ attribute: 'for' }) htmlFor: string; 
  @Prop() prev: string;
  @Prop() next: string;

  @Prop() dot: string | (() => void) ='⚪️';
  @Prop() currentDot: string | (() => void) = '🔘';
  @Prop({ mutable: true, reflect: true }) currentIndex: number = 0;

  // Set to true to not fetch any polyfills in browsers that do not support smoothscroll natively:
  @Prop() polyfill: boolean;
  @Prop() aria: boolean;
  @Prop() keys: boolean;

  @State() slides: Element[] = [];

  @Watch('currentIndex')
  onIndexChange(newCurrentIndex) {
    const slide = this.slides[newCurrentIndex];
    const scrollIntoViewOptions: ScrollIntoViewOptions = {behavior: "smooth", block: "center", inline: "center"};

    // Ensure current slide has aria-current="true":
    if (this.aria) {
      this.slides.forEach((slide,i) => {
        if (i === newCurrentIndex) {
          slide.setAttribute('aria-current', 'true');
        } else if (slide.hasAttribute('aria-current')) {
          slide.removeAttribute('aria-current');
        }
      })
    }

    // Scroll the slide into view (using polyfill in browsers that do not support smoothscroll)
    if (scrollIntoViewPonyfill) {
      scrollIntoViewPonyfill(slide, scrollIntoViewOptions);
    } else {
      slide.scrollIntoView(scrollIntoViewOptions);
    }
  }

  private slider: Element;

  init() {
    const { htmlFor } = this;

    const slider = this.slider = document.getElementById(htmlFor) || document.querySelector(htmlFor);
    if (slider) this.slides = Array.from(slider.children);
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
    const nextEl = next && closest(target, next);

    if (nextEl) {
      this.moveNext();
    } else {
      const prevEl = prev && closest(target, prev);
      if (prevEl) this.movePrev();
    }
  }

  onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') this.currentIndex++;
    else if (e.key === 'ArrowLeft') this.currentIndex--;
  }

  componentWillLoad() {
    this.init();

    const { slider, prev, next, onKey, onBtnClick } = this;

    if (slider) {
      this.onScroll = debounce(onScroll.bind(this), 100);
      slider.addEventListener('scroll', this.onScroll, EVENT_LISTENER_OPTIONS);
      if (this.keys) slider.addEventListener('keydown', onKey, EVENT_LISTENER_OPTIONS);
    }

    if (next || prev) {
      document.addEventListener('click', onBtnClick, EVENT_LISTENER_OPTIONS);
    }

    // Late-load ponyfill for smooth-scrolling if not supported: (Safari, Edge, IE11)
    if (!isSmoothScrollSupported && !scrollIntoViewPonyfill && this.polyfill) {
      // @ts-ignore
      import('https://cdn.skypack.dev/smooth-scroll-into-view-if-needed?min')
        .then(module => scrollIntoViewPonyfill = module.default);
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

// Helper to call element.closest(selector) where selector might be an id, without choking on it:
function closest(el: HTMLElement, selector: string) {
  let result;
  try {
    // Try it as an id selector: (Ignore error if we've made the selector invalid)
    result = el.closest(`#${selector}`);
  } catch(err) {
    // Ignore error
  } finally {
    // Try the selector as-is, and surface any error as nornal to help the user debug:
    return result || el.closest(selector);
  }
}