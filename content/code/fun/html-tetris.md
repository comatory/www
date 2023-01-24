+++
title = "HTML Tetris"
template = "project.html"
description = "Tetris game rendered in HTML, inspired by 1989 Gameboy version"
date = 2022-11-20
[taxonomies]
tech=["HTML", "Javascript", "Vanilla JS","ES Modules","PWA","Game"]
[extra]
project_url = "https://tetris.synacek.org"
repository_url = "https://github.com/comatory/html-tetris"
+++

Motivation for re-implementing the game was to:

* understand the mechanics of a tetris game
* try it game development with something simple-ish

I believe I achieved those goals and it was quite interesting to learn about various styles of tetris games. One example was reading up on different types of rotation systems, meaning how pieces are rotated and how they behave when collision occurs[^1].

I didn't use `Canvas` API for browsers but instead opted for rendering the game using HTML document itself. The play area is constructed with CSS grid. This decision meant not using "sprites". The block that makes up a tetromino shape isn't image either, it's pure CSS - I published it as [separate source](https://github.com/comatory/css-tetrominoes).

See for yourself:

<div class="centered">
  <figure>
    <video
     controls=""
     muted=""
     title="Tetris game"
     src="/video/html-tetris.mov"
     class="responsive-media"
    >
    </video>
    <figcaption>
      Gameplay footage of Tetris game
    </figcaption>
  </figure>
</div>

Another goal of my implementation was to approach it with simplicity in mind. I'm using plain Javascript and regular DOM APIs. I didn't want any build steps [^2] but also wanted to have the code modularized. I went with native [ES modules](https://developer.mozilla.org/en-US/).

Having static types is nice too but that would mean introducing Typescript (and a build step). Instead I chose [JSDoc](https://jsdoc.app/) annotations which works quite well for the project of this size.

I went for pixel-art look, more specifically I wanted the game to be similar to [1989 Gameboy release](https://en.wikipedia.org/wiki/Tetris_(Game_Boy_video_game)). The game is meant to be played on desktop computers with keyboard but the game can accomodate mobile devices as well, touch controls will show up on smaller screens or they can be toggled via an option control.

<img src="/image/html-tetris.png" class="centered responsive-media" alt="Image of HTML Tetris game" />

Game is installable as a PWA so it can run offline. Generally this was interesting challenge. I found out that getting some things right is quite tricky - correct timing and animations. My implementation is not perfect on that front but it is playable. It definitely took more time than I expected it to.

---

[^1]: My game uses NES-style rotation system. If you try to rotate a tetromino in a way where it would bump into a wall or other fallen tetrominoes, it will not succeed. It's pretty old school approach, today there are way more advanced systems such as [*super rotation system*](https://tetris.wiki/Super_Rotation_System) which are more user-friendly.

[^2]: There are few exceptions but they do not involve the runtime. I used some developer tooling for formatting, testing and linting. I also wrote little script that generates list of files to be cached by a service worker.
