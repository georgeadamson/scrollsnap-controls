import { newSpecPage } from '@stencil/core/testing';
import { ScrollsnapControls } from '../scrollsnap-controls';

describe('scrollsnap-controls ', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ScrollsnapControls],
      html: `<scrollsnap-controls></scrollsnap-controls>`,
    });
    expect(page.root).toEqualHtml(`
      <scrollsnap-controls currentindex="0">
        <ol aria-hidden="true" class="scrollsnap-control-dots"></ol>
      </scrollsnap-controls >
    `);
  });
});
