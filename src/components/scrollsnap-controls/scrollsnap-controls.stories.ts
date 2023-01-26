// import { Story, Meta } from '@storybook/react'

export default {
    // this creates a ‘Components’ folder and a ‘MyComponent’ subfolder
    title: './scrollsnap-controls.tsx',
} ;

const Template = (args) => `
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
    scroll-snap-stop: always;
    min-width: 50vw;
  }
</style>


<ul id="demo-slider" class="app-slider">
<li class="app-slide">
  <h3 class="app-slide-heading">Make Your Own</h3>
  <p class="app-slide-text">Where the fun happens! Record stories in your own voice, make playlists from your MP3s, and link them all to physical cards</p>
  <h4 class="app-slide-label">Podcasts</h4>
  <img class="app-slide-img" src="https://source.unsplash.com/random/40x50?1" />
</li>

<li class="app-slide">
  <h3 class="app-slide-heading">Make Your Own</h3>
  <p class="app-slide-text">Where the fun happens! Record stories in your own voice, make playlists from your MP3s, and link them all to physical cards</p>
  <h4 class="app-slide-label">Podcasts</h4>
  <img class="app-slide-img" src="https://source.unsplash.com/random/40x50?2" />
</li>

<li class="app-slide">
  <h3 class="app-slide-heading">Make Your Own</h3>
  <p class="app-slide-text">Where the fun happens! Record stories in your own voice, make playlists from your MP3s, and link them all to physical cards</p>
  <h4 class="app-slide-label">Podcasts</h4>
  <img class="app-slide-img" src="https://source.unsplash.com/random/40x50?3" />
</li>

<li class="app-slide">
  <h3 class="app-slide-heading">Make Your Own</h3>
  <p class="app-slide-text">Where the fun happens! Record stories in your own voice, make playlists from your MP3s, and link them all to physical cards</p>
  <h4 class="app-slide-label">Podcasts</h4>
  <img class="app-slide-img" src="https://source.unsplash.com/random/40x50?4" />
</li>
</ul>

<scrollsnap-controls first="${args.first}" middle="${args.middle}" last="${args.last}" notify prev=".prev" next=".next"></scrollsnap-controls>
<button class="prev">Prev</button>
<button class="next">Next</button>
`;

export const Example = Template.bind({});

Example.args = {
  first: 'Winnie',
  middle: 'The',
  last: 'Pooh'
};