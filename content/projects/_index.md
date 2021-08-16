+++
title = "Projects"
template = "projects.html"
+++

<div class="col" id="projects">

### Projects

* [try.mileus.com](/projects/try-mileus-com)

  Web application for showcasing Mileus commute subscription service in Prague.

  {{ tags(values=[
    'React',
    'Typescript',
    'ES6',
    'Responsive',
    'Mapbox',
    'Redux',
    'Dependency injection'
    ]) }}

* [avocode-email-tagsinput](https://github.com/avocode/avocode-email-tagsinput")

  React component library that contains components for rendering
  tags within inputs. More specifically, the library allows you to insert
  and validate email tags, navigate via keyboard and much more. Built on 
  SlateJS editor and used in production within
  [Avocode](https://avocode.com) application 
  that is used by thousands of users every day.

  {{ tags(values=[
    'React',
    'SlateJS',
    'ES6',
    'Flow',
    'Monorepo',
    'E2E specs',
    ]) }}

* [fb2iCal](https://github.com/comatory/fb2iCal)

  Very minimalistic Progressive Web App for converting Facebook
  event URLs / event IDs into iCal files. Works well on mobile
  where it can work as standalone app and list event data
  even when offline.
  Built using SvelteJS to minimize payload with help from Webpack for code-splitting. Code for parsing HTML and event data is isomorphic and runs on both server and browser.
  It's so simple that it can actually run without JavaScript in browser and is _progressively enhanced_.
  Use it on [fb2ical.com](https://fb2ical.com)

  {{ tags(values=[
    'PWA',
    'Mobile',
    'NodeJS',
    'SvelteJS',
    'Service Worker',
    'Offline',
    'No JS',
    ]) }}

* [PortionTracker](https://github.com/comatory/portion-tracker/)

  Small app that aims to be simple and fast. It tracks your eating
  habits - how often you eat and also the amount of food and its type.
  I wrote this for my own use but anyone can use it as well: self-hosted
  on Heroku or [on my own instance](https://portion-tracker.herokuapp.com).

  {{ tags(values=[
    'ES6',
    'NodeJS',
    'React',
    'Webpack',
    'SequelizeJS',
    'Dependency injection',
    'Material Design',
    ]) }}

* [Rotation Zoomer](https://comatory.github.io/rotation-zoomer)

  jQuery plugin that can serve images/canvases
  that are rotated and automatically maintains their position within
  DOM. Additional configuration allows user to rotate
  these elements "in-place" by 90-degree increments. Optional zoomer window
  can also be applied. This plugin was succesfully used in production
  on closed-source projects to display PDF and image documents.

  {{ tags(values=[
    'CoffeeScript',
    'jQuery',
    'Canvas',
    ]) }}

* [Dignus](https://github.com/comatory/Dignus)

  This was Ruby on Rails web application that connected event
  organizers and performers.
  It was user-centric, location aware and media focused,
  internationalized (Czech and English) with AWS support for uploading
  images and music.

  {{ tags(values=[
    'Ruby',
    'Ruby on Rails',
    'JavaScript',
    'PostgreSQL',
    'Heroku',
    ]) }}

* [DuckDuckGo Instant Answers](https://github.com/comatory/zeroclickinfo-goodies)

  Contribution to DDG open source project. Cheat sheets 
  for Midnight Commander and Czech language phrases that are
  displayed in search queries.

  {{ tags(values=[
    'JSON',
    'OSS',
    ]) }}

* [Sky To Speak website](https://web.archive.org/web/20210116182451/http://skytospeak.com/) (archived)

  Discontinued legacy website for czech artist that included
  links to media, event list and had a nice dynamic background.

  {{ tags(values=[
    'Wordpress',
    'HTML5',
    'CSS3',
    ]) }}

</div>

<div class="col" id="utilities">

### Utilities


* [urldat](https://github.com/comatory/urldat)

  Micro library for building URLs safely. This is a loose part of [urlcat](https://github.com/balazsbotond/urlcat) written in Dart.

  {{ tags(values=[
    '0 dependency',
    'Dart',
    'Web URLs',
    ]) }}

* [minidotenv](https://github.com/comatory/minidotenv)

  Small utility library for loading contents of `.env` file into app environment.

  {{ tags(values=[
    '0 dependency',
    'Typescript',
    'Jest',
    'Dot files',
    ]) }}

* [proximity-search-array](https://github.com/comatory/proximity-search-array)

  Get a copy of array containing target item and its neighbours based on proximity.

  {{ tags(values=[
    'ES6',
    'NodeJS',
    'Jest',
    ]) }}

* [es6-frontend-boilerplate-2017](https://github.com/comatory/es6-frontend-boilerplate-2017)

  Project template for frontend apps based on ES6, React, Redux, Webpack and CSS modules that I used back in 2017.

  {{ tags(values=[
    'ES6',
    'ReactJS',
    'Redux',
    'Webpack',
    'CSS Modules',
    ]) }}

* [oldGamesScraper](https://github.com/comatory/oldGamesScraper)

  Script for transformating content into PDF magazines for retro gaming website.

  {{ tags(values=[
    'Python',
    'Web Scraping',
    ]) }}

</div>
