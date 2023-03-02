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

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-input.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-input.webp" type="image/webp">
        <source srcset="/image/mileus-ui-input.gif" type="image/gif">
        <img
          src="/image/mileus-ui-input.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Text input component"
        />
      </picture>
    </a>
    <figcaption>
      Text input component with validation.
    </figcaption>
  </figure>
</div>

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-toggle.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-toggle.webp" type="image/webp">
        <source srcset="/image/mileus-ui-toggle.gif" type="image/gif">
        <img
          src="/image/mileus-ui-toggle.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Button toggle component"
        />
      </picture>
    </a>
    <figcaption>
      Toggle button component composed from base buttons.
    </figcaption>
  </figure>
</div>

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-datetime.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-datetime.webp" type="image/webp">
        <source srcset="/image/mileus-ui-datetime.gif" type="image/gif">
        <img
          src="/image/mileus-ui-datetime.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Datetime input component"
        />
      </picture>
    </a>
    <figcaption>
      Combined date time input component which is locale aware.
    </figcaption>
  </figure>
</div>

The library is heavily opinionated which means it comes with its own stylesheet and typography to maintain brand identity.

These are just some components that the library uses:

* accordion header
* autocomplete combobox that fetches options dynamically
* buttons
* date and time input that can be combined to enter both
* icon set
* configurable tooltip based on PopperJS

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-tooltip.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-tooltip.webp" type="image/webp">
        <source srcset="/image/mileus-ui-tooltip.gif" type="image/gif">
        <img
          src="/image/mileus-ui-tooltip.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Tooltip component"
        />
      </picture>
    </a>
    <figcaption>
      Tooltip applied to button, triggers on hover or focus. Tooltip can automatically switch its location if it detects window boundaries.
    </figcaption>
  </figure>
</div>

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-combobox.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-combobox.webp" type="image/webp">
        <source srcset="/image/mileus-ui-combobox.gif" type="image/gif">
        <img
          src="/image/mileus-ui-combobox.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Address combobox"
        />
      </picture>
    </a>
    <figcaption>
      Address combobox component which automatically fetches options from server. It uses portal so option list is always visible even when the input is placed in container with hidden overflow.
    </figcaption>
  </figure>
</div>

<div class="centered">
  <figure>
    <a href="/image/mileus-ui-icons.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-icons.webp" type="image/webp">
        <source srcset="/image/mileus-ui-icons.gif" type="image/gif">
        <img
          src="/image/mileus-ui-icons.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Icons"
        />
      </picture>
    </a>
    <figcaption>
      Icons specific to Mileus' business domain
    </figcaption>
  </figure>
</div>

Apart from React components the library also exports series of CSS variables used for consistency such as

* responsive breakpoints
* margin and padding
* colors
* typographical sizes and weights

<div class='row--centered'>
  <figure style="width: 160px">
    <a href="/image/mileus-ui-colors.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-colors.webp" type="image/webp">
        <source srcset="/image/mileus-ui-colors.png" type="image/png">
        <img
          src="/image/mileus-ui-colors.png"
          style="width: 160px; height: auto"
          loading="lazy"
          alt="Colors"
        />
      </picture>
    </a>
    <figcaption>
      Colors used for components and exposed as CSS variables
    </figcaption>
  </figure>

  <figure style="width: 160px">
    <a href="/image/mileus-ui-spacing.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-spacing.webp" type="image/webp">
        <source srcset="/image/mileus-ui-spacing.png" type="image/png">
        <img
          src="/image/mileus-ui-spacing.png"
          style="width: 160px; height: auto"
          loading="lazy"
          alt="Spacing"
        />
      </picture>
    </a>
    <figcaption>
      Set of CSS variables for margin and padding used for components. These are also exposed and can be used to implement consistent spacing - inspired by Tailwind CSS.
    </figcaption>
  </figure>

  <figure style="width: 160px">
    <a href="/image/mileus-ui-typography.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-ui-typography.webp" type="image/webp">
        <source srcset="/image/mileus-ui-typography.png" type="image/png">
        <img
          src="/image/mileus-ui-typography.png"
          style="width: 160px; height: auto"
          loading="lazy"
          alt="Typography"
        />
      </picture>
    </a>
    <figcaption>
      Typography used for components and exposed CSS variables for sizes and weights. Used font is a variable font so supported browsers save bandwith.
    </figcaption>
  </figure>
</div>

Thanks to PostCSS it was possible to use breakpoint CSS variables in target projects.

It was very important to me not to have huge size of the library. The library has separate entry point and bundles for date time component as it requires `date-fns` library. This means that you don't pay the upfront cost of downloading it if you're only using button component for example.

All components are accessible via keyboard with correct focus behaviour.

The repository itself also contains Storybook to preview and test the components. This approach turned out to be a good decision since designer could check his work and try out different states of the components.
