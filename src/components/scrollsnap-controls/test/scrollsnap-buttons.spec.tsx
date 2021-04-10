import { newSpecPage } from '@stencil/core/testing';
import { ScrollsnapButtons } from '../scrollsnap-buttons';

describe('scrollsnap-buttons', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [ScrollsnapButtons],
      html: `<scrollsnap-buttons></scrollsnap-buttons>`,
    });
    expect(page.root).toEqualHtml(`
      <scrollsnap-buttons>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </scrollsnap-buttons>
    `);
  });
});
