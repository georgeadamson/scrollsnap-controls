import { newE2EPage } from '@stencil/core/testing';

describe('scrollsnap-buttons', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<scrollsnap-buttons></scrollsnap-buttons>');

    const element = await page.find('scrollsnap-buttons');
    expect(element).toHaveClass('hydrated');
  });
});
