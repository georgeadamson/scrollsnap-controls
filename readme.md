![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# \<scrollsnap-controls\>

Helper for use with a CSS Scrollsnap element.
Adds indicator buttons and handlers for Prev/Next buttons.

POC: Really rushed and unloved demo: https://codepen.io/georgeadamson/pen/VwPrwyY?editors=1100

## Using this component

After adding a script you can use this compoennt just like any other html element.

Add a script tag similar to this:

`<script type="module" src="https://cdn.jsdelivr.net/npm/scrollsnap-controls/dist/esm/scrollsnap-controls.min.js"></script>`

...then you can use the element like this:

`<scrollsnap-controls for="my-slider" prev="my-slider-prev" next="my-slider-next" polyfill aria></scrollsnap-controls>`



| This component is an experimental POC with caveats...!
- Only tested with _horizontal_ scrollsnap.
- Assumes all scroll items are the same width.


---


# Props/Attributes for using \<scrollsnap-controls\>
For latest see the [component readme](https://github.com/georgeadamson/scrollsnap-controls/blob/master/src/components/scrollsnap-controls/readme.md).

## Properties

| Property               | Attribute       | Description                                                                                                                                        | Type                     | Default     |
| ---------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------- |
| `aria`                 | `aria`          | Optional: When set, the component will toggle aria attributes on the scrollsnap elements. This can be helpful to screenreaders but scenarios vary. | `boolean`                | `undefined` |
| `currentDot`           | `current-dot`   | Optional: Specify a character or markup for the "current" page indicator dot.                                                                      | `(() => void) \| string` | `'🔘'`      |
| `currentIndex`         | `current-index` | Readonly: Attribite to surface the index of the current page.                                                                                      | `number`                 | `0`         |
| `dot`                  | `dot`           | Optional: Specify a character or markup for an indicator dot.                                                                                      | `(() => void) \| string` | `'⚪️'`      |
| `htmlFor` _(required)_ | `for`           | Required: id or CSS selector for your scrollsnap element.                                                                                          | `string`                 | `undefined` |
| `keys`                 | `keys`          | Experimental: When set, the component will attempt better paging of the scrollsnap using the ← → arrow keys.                                       | `boolean`                | `undefined` |
| `next`                 | `next`          | Optional: id or CSS selector for your "Next" button.                                                                                               | `string`                 | `undefined` |
| `polyfill`             | `polyfill`      | Optional: When set, the component will fetch polyfills for browsers that do not support smoothscroll natively. (Eg Safari, Edge, IE11)             | `boolean`                | `undefined` |
| `prev`                 | `prev`          | Optional: id or CSS selector for your "Previous" button.                                                                                           | `string`                 | `undefined` |


----------------------------------------------


