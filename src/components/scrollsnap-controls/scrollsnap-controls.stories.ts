// import { Story, Meta } from '@storybook/react'

const slideMarkup = `
<li class="app-slide">
  <h3 class="app-slide-heading">Make Your Own</h3>
  <p class="app-slide-text">Where the fun happens! Record stories in your own voice, make playlists from your MP3s.</p>
  <img class="app-slide-img" src="https://source.unsplash.com/random/50x50" />
</li>
`

export default {
    // this creates a ‘Components’ folder and a ‘MyComponent’ subfolder
    title: './scrollsnap-controls.tsx',
} ;

const Template = ({notify}) => `
<style>
  .app-slider {
    padding: 0;
    width: 100%;
    overflow-x: auto;
    scroll-snap-type: x mandatory;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    list-style: none;
  }

  .app-slider > * {
    scroll-snap-align: center;
    xscroll-snap-stop: always;
    min-width: 150px;
  }
</style>

<div style="width:300px">
  <ul id="demo-slider1" class="app-slider">
    ${ slideMarkup.repeat(10) }
  </ul>

  <button id="prev1">Prev</button>
  <button id="next1">Next</button>
  <scrollsnap-controls ${notify} prev="#prev1" next="#next1"></scrollsnap-controls>
</div>

<div style="width:400px">
  <ul id="demo-slider2" class="app-slider">
    ${ slideMarkup.repeat(10) }
  </ul>

  <button id="prev2">Prev</button>
  <button id="next2">Next</button>
  <scrollsnap-controls ${notify} prev="#prev2" next="#next2"></scrollsnap-controls>
</div>

<div style="width:700px">
  <ul id="demo-slider3" class="app-slider">
    ${ slideMarkup.repeat(10) }
  </ul>

  <button id="prev3">Prev</button>
  <button id="next3">Next</button>
  <scrollsnap-controls ${notify} prev="#prev3" next="#next3"></scrollsnap-controls>
</div>
`;

export const Example = Template.bind({});

Example.args = {
  notify: false,
};