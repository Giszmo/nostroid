# Nostroid - The most performant cross platform nostr client

This [nostr](https://github.com/nostr-protocol/nostr) client was created using
[Svelte](https://github.com/sveltejs/svelte), a novel tool to create web apps.

As a web app, it also works on all platforms - Windows, Linux, Mac, Android and
iPhone.

# High level design goals

This client is meant to feel like Twitter. If you are used to Twitter, you
should feel at home with Nostroid.

## Performance

Nostr relies on "relays" and Nostroid will remain compatible with random
relays. This means that the client has to verify content it receives and doesn't
always have the best control over what it will receive in which order. While
this is an overhead, it is an inherently anticipated overhead in the nostr
ecosystem and we adapt to it by storing all relevant events locally ahead of the
user interacting with them. Once loaded, this content is not only fast to
browse, it is even available offline. Ideally you could connect to the nostr
network for 20s and then read up on all your friends updates, reply to them,
like and re-post their posts to then sync with the network again, publishing
your interactions later.

## Storage

For optimal performance, Nostroid needs about 200MB of local storage. It will
work with less but that will degrade the performance a bit.

# The friends of my friends

One of the most annoying parts of Twitter is spam, impersonators, bots. What do
these have in common? **You don't follow them!**

Occasionally you want people to be able to "cold call" you - to contact you out
of the blue. But usually not. Nostroid draws a clear distinction between what is
considered probably ok and what not: **How close in your network of follows is
the author of the event?**.

If an account has zero followers, how likely is it that you would want to hear
from them? How much would that change if the account had a million followers,
none of which is followed by any of your friends' friends? Not zero? Well,
Nostroid explores who you follow and who they follow in turn and so on until
10,000 accounts are reached and disregards any account outside of that group -
with a few exceptions. In summary:

- nostr accounts are either in your in-group of 10,000 closest accounts or in
  your out-group.
- If your in-group replies/reacts, you will also see that post even if the author
  is an obvious bot with zero followers. The author will be shown as such.
- If you get DMs from your out-group, you will see them in your spam folder.
- Reactions (:heart:, :+1:, :-1:, ...) from your out-group will not be shown or
  counted.
- Post replies from your out-group will not be shown unless somebody from your
  in-group replies/reacts.

# Infinite scroll - Reaching "the end of the internet"

Social networks tend to hold random content ready for the user to improve
retention - to entertain the user while there is nothing relevant to show. While
this is vilified for hurting our attention spans, it probably is detrimentally
important for success. And who knows? Maybe Twitter keeps us busy by showing us
a calculated amount of obvious scammers to get mad at? :laughing:

Nostroid will - for better or worse - give the user more control and make it
easier to dismiss content from out-group accounts. It will show why that spammer
is in your in-group, making it easier to mute not only these spammers but also
your friend of a friend that keeps following these spammers (for whatever
reason). The cut-off at 10,000 accounts being arbitrary, the user can also tweak
this number.

# Development

## Tools

Nostroid is built with Svelte using Dexie and IndexedDB. It uses nostr-tools to
communicate with the nostr relays via Websocket.

## Information flow

- Events are retrieved in a separate thread - a SharedWorker.
- The SharedWorker determines what to fetch from the nostr network, opens
  channels to relays and writes events into the local database in batches.
- The UI is reactive to DB changes - multiple tabs detect when in the config the
  "current account" changed and update their state accordingly.
- The UI also writes to the DB. Events are signed in the UI thread but stored in
  the DB for delivery by the SharedWorker that maintains the channels to the
  relays. Missing pubkeys or event ids are signaled through profiles
  `{missing: true}` or entries in `db.missingEvents` and subsequently fetched by
  the SharedWorker.

## Install dependencies

This project is well tested using [pnpm](https://pnpm.io/). It might work with
old `npm`, too but if not, please try following the exact instructions here
before filing issues.

0. Make sure to have a modern version of `node`. v18.6.0 for example.
1. `git submodule update --init`
2. Get [pnpm](https://pnpm.io/)
3. `pnpm install`

## Run locally in dev mode

Currently only Chrome / Chromium supports running workers in dev mode. To start
the server on localhost, run:

```
pnpm run dev
```

The server updates automatically as soon as files change.

To test it in other browsers than Chrome, build and preview the project:

```
pnpm run build
pnpm run preview
```

## Deployment

1. Configure your nginx to host static files.
   [This](https://vite-plugin-pwa.netlify.app/deployment/nginx.html) might be
   helpful.
2. `pnpm run build`
3. Copy the `build` folder to your server
