// import { Story, Meta } from '@storybook/react'

const slideMarkup = `
<li class="app-slide">
  <h3 class="app-slide-heading">Demo item</h3>
  <p class="app-slide-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.t</p>
  <img class="app-slide-img" src="https://source.unsplash.com/random/50x50.png" />
</li>
`

export default {
    // this creates a ‘Components’ folder and a ‘MyComponent’ subfolder
    title: './scrollsnap-controls.tsx',
} ;

const Template = (args) => {
  let { notify, hidden, disable, dot, currentDot, scrollOptions, demoItems, demoItemsPerPage, prev, next, noPrevNext } = args;

  notify = notify ? 'notify' : '';
  hidden = hidden ? 'hidden' : '';
  disable = disable ? 'disable' : '';
  dot = dot ? `dot="${dot}"` : '';
  currentDot = currentDot ? `current-dot="${currentDot}"` : '';
  scrollOptions = scrollOptions ? `scroll-options="${ encodeURIComponent(JSON.stringify(scrollOptions)) }"` : '';

  const itemWidth = 150;

  return `
    <style>
      .app-slider {
        border: 1px solid silver;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        list-style: none;
        padding: 0;
        width: 100%;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
      }
      .app-slider > * {
        scroll-snap-align: center;
        xscroll-snap-stop: always;
        min-width: ${itemWidth}px;
      }
      ${noPrevNext && '.button { display: none }'}
    </style>

    <div style="width:300px">
      <ul id="demo-slider1" class="app-slider" style="width:${demoItemsPerPage * itemWidth}px">
        ${ slideMarkup.repeat(demoItems) }
      </ul>

      <button class="button" id="prev-btn">Prev</button>
      <button class="button" id="next-btn">Next</button>
      <scrollsnap-controls ${notify} ${hidden} ${disable} ${dot} ${currentDot} ${scrollOptions} prev="${prev}" next="${next}"></scrollsnap-controls>
    </div>
  `};

  export const Default = Template.bind({});
  export const WithPrevNext = Template.bind({});
  export const WithPrevNextAutoDisable = Template.bind({});
  export const WithControlsHidden = Template.bind({});
  export const OneItemInView = Template.bind({});

  const defaultArgs = {
    notify: false,
    hidden: false,
    disable: false,
    dot: '◯',
    currentDot: '⬤',
    prev: '#prev-btn',
    next: '#next-btn',
    demoItems: 5,
    demoItemsPerPage: 3
  }

  Default.args = {...defaultArgs,
    noPrevNext: true
  };


  WithPrevNext.args = {...defaultArgs,
  };

  WithPrevNextAutoDisable.args = {
    ...defaultArgs,
    disable: true,
    demoItemsPerPage: 3
  }

  WithControlsHidden.args = {
    ...defaultArgs,
    hidden: true,
    disable: true,
    demoItemsPerPage: 3
  }

  OneItemInView.args = {
    ...defaultArgs,
    disable: true,
    demoItemsPerPage: 1
  }