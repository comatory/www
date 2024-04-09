+++
title = "Mileus mobile apps"
template = "project.html"
description = "Suite of multi-platform mobile apps for Mileus commute subscription service"
date = 2022-02-01
[taxonomies]
tech=["Dart","Flutter","mobile","iOS","Android","Firebase"]
[extra]
archived = false
+++

The goal of the applications was to provide two mobile apps - one for end-users (customers) and other for service providers (taxi drivers).

<div class="row wrap">
  {{ image(href="/image/mileus-taxi-0.png", alt="Promotional picture of Mileus app showing taxi in a city.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-1.png", alt="Promotional picture of Mileus app showing screen with a map with line between home and work locations.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-2.png", alt="Promotional picture of Mileus app showing screen with parameters of journey.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-3.png", alt="Promotional picture of Mileus app showing screen with parameters of journey.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-4.png", alt="Promotional picture of Mileus app showing screen with parameters of a service subscription.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-5.png", alt="Promotional picture of Mileus app showing screen with map and navigation.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-6.png", alt="Promotional picture of Mileus service with illustration of taxi and subway.", width=160, layout="none") }}
  {{ image(href="/image/mileus-taxi-7.png", alt="Promotional picture of Mileus service with illustration of taxi and subway amongst buildings.", width=160, layout="none") }}
</div>

Requirement for applications were:

* multi-platform: iOS & Android
* location-aware: GPS sensors
* ability to work offline with limited capability
* purchase of recurring subscription via the device using a payment system
* multilingual: detect device's locale and provide English and Czech translations

When different technologies were evaluated, *Flutter* framework came out as a winner because it could fulfill these requirements.

Both applications are very much like what other ride-hailing services, such as Uber offer.

{{ video(href="/video/mileus-taxi-commute.mov", title="Commute flow", caption="The commute flow within the customer application. User searches for available taxis, starts the commute. The taxi catches up with the commuter later on.") }}

Customer application allows users to sign up for the service. The purchase flow will ask users to fill-in their home and destination addresses, calculate the recommended route and the subscription price. The price is tailored specifically for each customer, depending on their journey.

{{ video(href="/video/mileus-taxi-subscription.mov", title="Subscription flow", caption="User has to subscribe to a commute from theirwork address to home. App requires both addresses, user is provided with recommended routes and finally pays for the subscription.") }}

Customer app needs device location in order to navigate the user. When commute is activated, the service will pair commuter with a driver. From then on, the app helps commuter with navigation via map and commute directions.

The application can work offline most of the time as it needs to work reliably when user is in a subway with no cell signal.

Driver application connects drivers with commuters. Driver can sign-in to predefined shift. When the shift is started, driver can receive orders. Application will then pair driver with commuter with the help of back-end service that can process the state of the taxi fleet and commuter demand.

Both applications require near real-time communcation with backend infrastructure. We relied on Firebase (FireStore) service to serve as an update mechanism, for example when new order arrived, it would trigger UI within the driver app. Analogically, if user started commute and driver was matched, the FireStore would receive new record and that would be reflected in UI as well.
Firebase was also used for push notifications.

The development time for both apps was less than a year, me being sole developer for 90% of the project in regards to mobile applications.

This meant that I chose certain approaches. Such as creating external library that dealt with shared code between two applications. This library contained shared logic (utilities for time conversion), classes (storage & API calls) or even whole UI flows (user registration).

I even developed [urldat](https://github.com/comatory/urldat) to help me with contructing API URLs.

We needed to have solid mapping solution, so I went with *flutter_map* library and I ended up [contributing to the project](https://github.com/fleaflet/flutter_map/pulls?q=is%3Apr+author%3Acomatory+is%3Aclosed) in order to fix some deficiencies.

One of the things I wanted to get right out of the gate was to have software architecture that would allow to decouple part of the applications.

First step was to strictly separate UI (widgets) and logic such as data fetching or manipulation with the map. I leveraged library *flutter_bloc* that allowed me to do two things:

* manage global application state
* extract logic into units (BLoCs) that are not part of UI

The communication between widgets and BLoCs was made via widgets that would re-render whenever state was changed.

{{ video(href="/video/mileus-taxi-debug.mov", title="Debugging UI", caption="Debugging UI to observe current state of sensors, Firebase services and user account. It is possible to see application logs or save these logs into a file.") }}

Technical implementations such as data fetching over network (API), writing and reading from device disk, encryption - these were extracted into modules and classes. I used dependency injection so these modules could communicate between each other without being coupled together.
This solution proved to be good since later on in the project, another developer joined the team and the changes could be made to specific isolated parts of the codebase. It was easier to review changes and integrate the work efficiently.

<div class="row wrap">
    {{ video(href="/video/mileus-taxi-onboarding.mov", title="Debugging UI", caption="User onboarding.", width=300, layout="none") }}
    {{ video(href="/video/mileus-taxi-registration.mov", title="Debugging UI", caption="User registration.", width=300, layout="none") }}
</div>
