+++
title = "czdomains"
template = "project.html"
description = "Database of Czechia TLDs"
date = 2023-06-27
[taxonomies]
tech=["Typescript", "fastify"]
[extra]
repository_url = "https://github.com/comatory/czdomains"
project_url = "https://czdomains.synacek.xyz/"
archived = false
+++

Web application that allows you to browse or search through database of Czechia TLD (`.cz`) domains. The database contains bulk of historically registered TLDs since 1990s. The application can also request WHOIS data and Internet Archive's Wayback machine archival link.

This project was created with main goal being **simplicity**. Even if it's written in Typescript, the front-end is old-fashioned HTML (nunjucks) templates. The database is just `sqlite` file that contains all the entries making the deployment really straightforward. The design is intentional and is a throwback to mid-1990s web, even the icons were sourced from CD-ROM containing clip-art graphics.

{{ image(href="/image/czdomains-01.png", alt="Home page of czdomains web application", caption="Home page sporting early-web classical look") }}

I wanted to have some kind of simple web application that I could experiment with, hosting it on own VPS and setting it all up. I was interested in trying out Typescript-based web framework with server-side rendered HTML, without using any client-side Javascript - the design and type of the application does not really need it.

The project was originally written for Deno runtime using [Fresh web framework](https://fresh.deno.dev/) (see [git history](https://github.com/comatory/czdomains/pull/1)) but I ultimately decided to switch to [fastify web framework](https://www.fastify.io/). The reasons at the time of writing the application (end of 2022 / early 2023) were:

- Fresh did not feel mature enough: inability to specify custom views for error pages
- Fresh felt like it didn't come with batteries included: like more advanced routing, support for cookies
- Fastify has way better documentation
- Fastify comes with JSON schema which eliminates lot of defensive code for HTTP endpoints that I'd otherwise have to write by hand when using Fresh

Overall it was good experience rewriting the project and comparing the pros and cons. I think Fresh framework was otherwise very cool and I really appreciate its _islands_ architecture ("ship HTML first"), I also prefer Deno's dependency management over centralized NPM registry.

<div class="row wrap centered">
  {{ image(href="/image/czdomains-02.png", alt="Browsing the list of domains", caption="Paginated results", width="160", layout="none") }}
  {{ image(href="/image/czdomains-03.png", alt="Detail of a domain", caption="Domain detail", width="160", layout="none") }}
</div>
