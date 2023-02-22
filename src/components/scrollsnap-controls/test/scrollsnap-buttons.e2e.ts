import { newE2EPage } from '@stencil/core/testing';

describe('scrollsnap-controls', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<scrollsnap-controls></scrollsnap-controls>');

    const element = await page.find('scrollsnap-controls');
    expect(element).toHaveClass('hydrated');
  });
});
