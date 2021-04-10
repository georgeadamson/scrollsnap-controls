import { Component, Prop, State, Watch, h } from '@stencil/core';

// Carousel Page Indicators

// Ponyfill for scrollIntoView will be late-loaded in unsupported browsers: (Safari, Edge, IE11)
let scrollIntoViewPonyfill;
const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style;

const DOT_CLASSNAME = 'scrollsnap-control-dot';
const DOTS_CLASSNAME = 'scrollsnap-control-dots';

@Component({
  tag: 'scrollsnap-controls',
  styleUrl: 'scrollsnap-controls.css',
  shadow: false,
  scoped: false
})
export class ScrollsnapControls {

  @Prop() for: string; 

  @Prop() dot: string | (() => void) ='⚪️';

  @Prop() currentDot: string | (() => void) = '🔘';

  @Prop({ mutable: true, reflect: true }) currentIndex: number = 0;

  // Set to true to not fetch any polyfills in browsers that do not support smoothscroll natively:
  @Prop() nopolyfill: boolean;

  @Prop() keys: boolean = true;

  @Prop() prev: string;
  @Prop() next: string;

  @State() slides: Element[] = [];

  @Watch('currentIndex')
  onIndexChange(newCurrentIndex) {
    const slide = this.slides[newCurrentIndex];
    const scrollIntoViewOptions: ScrollIntoViewOptions = {behavior: "smooth", block: "center", inline: "center"};

    // Ensure current slide has aria-current="true":
    this.slides.forEach((slide,i) => {
      if (i === newCurrentIndex) {
        slide.setAttribute('aria-current', 'true');
      } else if (slide.hasAttribute('aria-current')) {
        slide.removeAttribute('aria-current');
      }
    })

    // Scroll the slide into view (using polyfill in browsers that do not support smoothscroll)
    if (scrollIntoViewPonyfill) {
      scrollIntoViewPonyfill(slide, scrollIntoViewOptions);
    } else {
      slide.scrollIntoView(scrollIntoViewOptions);
    }
  }

  private slider: Element;

  init() {
    const slider = this.slider = document.getElementById(this.for) || document.querySelector(this.for);
    if (slider) this.slides = Array.from(slider.children);
  }

  // Will be handler to react to user scrolling:
  onScroll: (e: WheelEvent) => void = null;

  goto = (i: number) => { this.currentIndex = i; }

  // Jump to corresponding slide when user clicks an indicator dot:
  onDotClick = (e: MouseEvent) => {
    const dot = (e.target as HTMLElement).closest(`.${DOT_CLASSNAME}`);
    if (dot) {
      const i = Array.from(dot.parentNode.children).indexOf(dot);
      this.goto(i);
    }
  }

  onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') this.currentIndex++;
    else if (e.key === 'ArrowLeft') this.currentIndex--;
  }

  componentWillLoad() {
    this.init();
    this.onScroll = debounce(onScroll.bind(this), 100);
    if (this.slider) {
      this.slider.addEventListener('scroll', this.onScroll), false;
      this.slider.addEventListener('keydown', this.onKey, false);
    }

    // Late-load ponyfill for smooth scrolling if not supported: (Safari, Edge, IE11)
    if (!isSmoothScrollSupported && !scrollIntoViewPonyfill && !this.nopolyfill) {
      // @ts-ignore
      import('https://cdn.skypack.dev/smooth-scroll-into-view-if-needed?min')
        .then(module => scrollIntoViewPonyfill = module.default);
    }
  }

  // Perhaps a future improvement could be to respond to changes in the number of slider items:
  // componentDidUpdate() {
  //   // this.init();
  // }

  // Housekeeping
  disconnectedCallback() {
    const { slider, onScroll, onKey } = this;
    slider.removeEventListener('scroll', onScroll, false);
    slider.removeEventListener('keydown', onKey, false);
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

// Warning: This assumes all slides are the same width.
// Could make the position detection smarter...?
function onScroll() {
  const { slider, slides } = this;
  this.currentIndex = Math.round((slider.scrollLeft / slider.scrollWidth) * slides.length);
}