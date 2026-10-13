# AIsa Labs: GTM Team page ("Their first day")

A redesign of the GTM Team section of [aisa.one/labs](https://aisa.one/labs#templates). The page tells one story as you scroll: the four Grok Bot teammates' first day, from 9:00 to 18:00. Each teammate does one real job with AIsa tools, a bill counts up, and the page ends on "Day one cost $0.068."

- Preview link: https://claude.ai/artifact/WDBsyvHc89SB7qDVKmb2zy (private; ask Raphael for access)
- Social preview image: `assets/og-gtm-team.png` (1200 × 630)

## What's in this folder

| Path | What it is |
|---|---|
| `index.html` | The whole page: HTML, CSS and one script. No build step, no dependencies. |
| `assets/` | Fonts (self-hosted), the AIsa lockup and mark, the four teammate mascots, the Grok Bot mark, X/Reddit/YouTube icons, favicon, home-screen icon, social preview image. |
| `data/DATA_SOURCES.md` | Every number on the page, the real AIsa call behind it and its cost. The raw provider rows stay private. |

## Run it locally

```bash
cd aisa-labs-gtm-team && python3 -m http.server 8765
```
Then open http://127.0.0.1:8765.

## Putting it live

It's a static page, under 1 MB with fonts. Two ways:

1. **Serve it as is** at `/labs` (or a sub-path). Upload `index.html` and `assets/`.
2. **Port it into the site's framework.** The sections are plain HTML: the hero, the story (`#story`), the team cards (`#team`), the prices (`#prices`) and the setup prompt (`#start`). The story's logic is the one script at the bottom of `index.html`. It needs the `#story` markup and nothing else.

### Before it goes live

- [ ] **Address.** If the page lives somewhere other than `https://aisa.one/labs`, update the address in `canonical`, `og:url`, `og:image` and `twitter:image`. The image URLs must be absolute for link previews to work.
- [ ] **Fonts.** Plus Jakarta Sans (headings), Inter (text) and Geist Mono (labels and prices) are self-hosted from `assets/`, all under the OFL. If the site already loads them, drop the `@font-face` and `preload` lines. Keep Inter's `cv08` feature on, so the capital I in "AIsa" has serifs and never reads as "Alsa".
- [ ] **Analytics.** Add the site's usual tag.
- [ ] **Links.** "Add to Grok Bot" buttons go to the real x.ai/bot links of the four Labs bots. "Details" go to `aisa.one/labs/templates/*`. The setup prompt matches `aisa.one/docs/agent-quickstart`; check it's still current.
- [ ] **Link preview check.** After deploy, paste the URL into the X Card Validator, Slack or LinkedIn's Post Inspector to confirm the image shows.
- [ ] **Devices.** Check one phone and one laptop. Below 700 px the story switches to a phone layout (see below).

## How the story works

One number drives everything: `p`, the scroll progress through `#story` (0 to 1). On every frame, `applyState(p)` sets what the app shows and `place(p)` sets the camera. Nothing is stored between frames, so scrolling up and down always shows the same thing for the same position.

Settings at the top of the script:
- `BOTS`: each teammate's name, avatar, scroll segment (`a` to `b`), the job typed into the chat, the time it finishes and its one-line result in the sidebar.
- `S`: when each step happens inside a teammate's segment (greeting, typing, send, price card, approve, ticks, result).
- `CLOCK`: the time shown in the caption pill at each point of the scroll.
- `CAPS`: the caption text at each point.
- Each teammate's chat is plain HTML in `#f0` to `#f3`. Edit the text there. Prices on the tool rows live in `data-p`, which the sidebar bill adds up.

**Desktop:** a camera pans and zooms across the app. Its targets are measured from the real messages, so editing text keeps the framing right.

**Phone (under 700 px):** the app becomes a phone chat at true size. The team turns into a strip of avatars with the bill, the caption moves above the app, and the camera stays still.

Without JavaScript, the page shows one finished chat (Research).

Dev helpers:
- `?p=0.42` freezes the page at one moment, for screenshots.
- `?film=1` plus `window.renderAt(seconds)` drives the same story by time instead of scroll. This is how the matching launch video gets rendered later.

## What's real

Six real AIsa calls on 13 Oct 2026 cost $0.0673 in total. The page shows each teammate's total rounded to $0.001, and those add up to $0.068. The sources are in `data/DATA_SOURCES.md`.

- **SEO:** keywords aisa.one ranks for in the US (one call). "anthropic api key" gets 18,100 searches a month and we rank #45; "claude api key" gets 14,800 and we rank #35. Both land on the Claude API key guide. This is a real finding the team can act on.
- **Research:** X, Reddit and YouTube searches about Grok Bot's new inbox (three calls).
- **Leads:** two company searches. Of 20 companies checked, 5 fit and one duplicate was merged. Only company names and domains are shown, no people.
- **Content:** built from the other teammates' notes, with no paid calls.

Notes:
- The teammates' wording is written for the page; the data behind it is the real call output. The footnote under the story says so.
- Provider names stay off the page, and the tool rows name the job instead.
- The Grok Bot app is recreated from xAI's official screenshots.

## Credits

- Mascots: aisa.one/labs.
- Grok Bot mark: xAI.
- X, Reddit and YouTube icons: Simple Icons (CC0).
- Fonts: Plus Jakarta Sans, Inter and Geist Mono (SIL Open Font License).
