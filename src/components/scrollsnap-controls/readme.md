# scrollsnap-controls



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute       | Description                                                                                                                                                                                                                          | Type                     | Default                                                       |
| ----------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------- |
| `aria`                  | `aria`          | Experimental: When set, the component will toggle aria attributes on the scrollsnap elements. This can be helpful to screenreaders but scenarios vary.                                                                               | `boolean`                | `false`                                                       |
| `attrs`                 | `attrs`         | Experimental: When set, the component will attributes on the scrollsnap elements. By default it will set data-scrollsnap-current-index="0" on the scrollsnap element. This can be helpful for CSS or as a hook for extra behaviours. | `boolean`                | `false`                                                       |
| `currentDot`            | `current-dot`   | Optional: Specify a character or markup for the "current" page indicator dot.                                                                                                                                                        | `(() => void) \| string` | `'⬤'`                                                         |
| `currentIndex`          | `current-index` | Readonly: Attribute to surface the index of the current page.                                                                                                                                                                        | `number`                 | `0`                                                           |
| `disable`               | `disable`       | Experimental: When set, the component will toggle disabled attributes on the Prev/Next buttons. (Since v0.0.7)                                                                                                                       | `boolean`                | `false`                                                       |
| `dot`                   | `dot`           | Optional: Specify a character or markup for an indicator dot.                                                                                                                                                                        | `(() => void) \| string` | `'◯'`                                                         |
| `htmlFor` _(required)_  | `for`           | Required: id or CSS selector for your scrollsnap element.                                                                                                                                                                            | `string`                 | `undefined`                                                   |
| `keys`                  | `keys`          | Experimental: When set, the component will attempt better paging of the scrollsnap using the ← → arrow keys.                                                                                                                         | `boolean`                | `false`                                                       |
| `next`                  | `next`          | Optional: id or CSS selector for your "Next" button.                                                                                                                                                                                 | `string`                 | `undefined`                                                   |
| `notify`                | `notify`        | Experimental: When set, the component will set attributes on the elements that match this selector. This can be helpful for CSS or as a hook for extra behaviours. This attribute will be set: data-scrollsnap-current-index="0".    | `string`                 | `''`                                                          |
| `polyfill`              | `polyfill`      | Optional: When set, the component will fetch polyfills for browsers that do not support smoothscroll natively. (Eg Safari, Edge, IE11)                                                                                               | `boolean`                | `false`                                                       |
| `prev`                  | `prev`          | Optional: id or CSS selector for your "Previous" button.                                                                                                                                                                             | `string`                 | `undefined`                                                   |
| `scrollIntoViewOptions` | --              |                                                                                                                                                                                                                                      | `ScrollIntoViewOptions`  | `{ behavior: 'smooth', block: 'nearest', inline: 'nearest' }` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
