+++
title = "mileus/ui"
template = "project.html"
description = "React component UI library used within Mileus web projects"
date = 2021-11-01
[taxonomies]
tech=["React","Javascript", "Typescript","ES6","Library","Storybook","PostCSS"]
[extra]
archived = false
+++

I decided to build React component library for Mileus' web projects because we were building multiple web applications based on same stack.

It was important to have consistent look across them and I also wanted to be more productive by working on business requirements instead of reinventing basic UI components each time. The result was this library that was distributed as NPM package.

{{ image(href="/image/mileus-ui-input.webp", fallback_href="/image/mileus-ui-input.gif", type="image/webp", fallback_type="image/gif", alt="Text input component", caption="Text input component with validation.", width=320) }}

{{ image(href="/image/mileus-ui-toggle.webp", fallback_href="/image/mileus-ui-toggle.gif", type="image/webp", fallback_type="image/gif", alt="Button toggle component", caption="Toggle button component composed from base buttons.", width=320) }}

{{ image(href="/image/mileus-ui-datetime.webp", fallback_href="/image/mileus-ui-datetime.gif", type="image/webp", fallback_type="image/gif", alt="Datetime input component", caption="Combined date time input component which is locale aware.", width=320) }}

The library is heavily opinionated which means it comes with its own stylesheet and typography to maintain brand identity.

These are just some components that the library uses:

* accordion header
* autocomplete combobox that fetches options dynamically
* buttons
* date and time input that can be combined to enter both
* icon set
* configurable tooltip based on PopperJS

{{ image(href="/image/mileus-ui-tooltip.webp", fallback_href="/image/mileus-ui-tooltip.gif", type="image/webp", fallback_type="image/gif", alt="Tooltip component", caption="Tooltip applied to button, triggers on hover or focus. Tooltip can automatically switch its location if it detects window boundaries.", width=320) }}

{{ image(href="/image/mileus-ui-combobox.webp", fallback_href="/image/mileus-ui-combobox.gif", type="image/webp", fallback_type="image/gif", alt="Address combobox", caption="Address combobox component which automatically fetches options from server. It uses portal so option list is always visible even when the input is placed in container with hidden overflow.", width=320) }}

{{ image(href="/image/mileus-ui-icons.webp", fallback_href="/image/mileus-ui-icons.gif", type="image/webp", fallback_type="image/gif", alt="Icons", caption="Icons specific to Mileus' business domain.", width=320) }}

Apart from React components the library also exports series of CSS variables used for consistency such as

* responsive breakpoints
* margin and padding
* colors
* typographical sizes and weights

<div class='row--centered'>
    {{ image(href="/image/mileus-ui-colors.webp", fallback_href="/image/mileus-ui-colors.png", type="image/webp", fallback_type="image/png", alt="Colors", caption="Colors used for components and exposed as CSS variables", width=160, layout="fit") }}
    {{ image(href="/image/mileus-ui-spacing.webp", fallback_href="/image/mileus-ui-spacing.png", type="image/webp", fallback_type="image/png", alt="Spacing", caption="Set of CSS variables for margin and padding used for components. These are also exposed and can be used to implement consistent spacing - inspired by Tailwind CSS.", width=160, layout="fit") }}
    {{ image(href="/image/mileus-ui-typography.webp", fallback_href="/image/mileus-ui-typography.png", type="image/webp", fallback_type="image/png", alt="Typography", caption="Typography used for components and exposed CSS variables for sizes and weights. Used font is a variable font so supported browsers save bandwith.", width=160, layout="fit") }}
</div>

Thanks to PostCSS it was possible to use breakpoint CSS variables in target projects.

It was very important to me not to have huge size of the library. The library has separate entry point and bundles for date time component as it requires `date-fns` library. This means that you don't pay the upfront cost of downloading it if you're only using button component for example.

All components are accessible via keyboard with correct focus behaviour.

The repository itself also contains Storybook to preview and test the components. This approach turned out to be a good decision since designer could check his work and try out different states of the components.
