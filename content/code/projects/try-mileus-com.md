+++
title = "try.mileus.com"
template = "project.html"
description = "Web application for showcasing Mileus commute subscription service in Prague"
date = 2021-11-01
[taxonomies]
tech=["React","Typescript","Javascript", "ES6","Responsive","Mapbox","Redux","Dependency injection"]
[extra]
project_url = "https://try.mileus.com"
archived = false
+++

Multilingual web application created with fast-loading in mind. The purpose of the web app is to communicate the upsides of using inter-modal transportation in Prague.

<div class="centered">
  <figure>
    <a href="/image/mileus-web-app.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-web-app.webp" type="image/webp">
        <source srcset="/image/mileus-web-app.gif" type="image/gif">
        <img
          src="/image/mileus-web-app.gif"
          style="width: 320px; height: auto"
          loading="lazy"
          alt="Web app user flow"
        />
      </picture>
    </a>
    <figcaption>
      This is what the web app looks like on mobile devices.
    </figcaption>
  </figure>
</div>

Project was launched in Q2 2021 on domain <a href="https://try.mileus.com" target="_blank">try.mileus.com</a> [<a href="https://web.archive.org/web/*/http://try.mileus.com/*" target="_blank">archive</a>] to promote <a href="https://mileus.com">Mileus'</a> subscription commute service.

The emphasis was put to quick asset loading so code-splitting for map page was implemented. The web application contains interactive map that shows the recommended route. Each route can be toggled and inspected in detail.

Part of the project was also building the landing page with custom elements such as accordeons and list item.

Application is responsive and scales well to mobile, tablet and desktop viewports. Some viewports have custom layouts and show what is appropriate for each device.

<div class="on-left">
  <figure>
    <a href="/image/mileus-web-app-map.webp" target="_blank">
      <picture>
        <source srcset="/image/mileus-web-app-map.webp" type="image/webp">
        <source srcset="/image/image/mileus-web-app-map.gif" type="image/gif">
        <img
          alt="Web application user flow"
          src="/image/mileus-web-app-map.gif"
          style="width: 100%; max-width: 400px"
          loading="lazy"
        />
      </picture>
    </a>
    <figcaption>
      Interactive map screen in various viewport widths.
    </figcaption>
  </figure>
</div>

The tech stack was using simple React in combination with Redux for state management. PostCSS was used to serve efficient stylesheets which simply leverage power of CSS variables. The goal was to bring as little dependencies as possible.

My goal was to separate business logic and data-fetching from UI itself. So instead of putting this code into React components I opted for using <a href="https://github.com/reduxjs/redux-thunk" target="_blank">Redux Thunk</a> middleware.
Business logic is placed inside regular functions. These functions are invoked by Redux actions from UI.

Responsibility for data fetching, translations, persistence via local storage is done via separating the relevant code in service classes. These classes are instantiated mostly as singletons and passed via dependency injection mechanism into aforementioned Thunk functions. This makes it simple to refactor, replace and test different part of application.

The app has persistence built-in via local storage so when user visits the app again, they do not have to fill-in required data and just continue with their journey.
Similar mechanism was used to synchronize state between mutliple tabs to help with user retention.

At the same time this web app was created, I was building in-house React component library which is used here. Inputs, autocompletes, form elements and others were implemented in order to be re-used across other company projects.
