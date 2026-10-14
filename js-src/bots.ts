/**
 * The Labs teammates, alive: the same Bloub engine and playback aisa.one/labs uses (vendor/bloub, MIT), drawn as plain SVG.
 *
 * Any element with data-bot="seo|research|finder|marketing" becomes an animated bot. It animates only while it is on screen,
 * the tab is visible and the viewer allows motion. An element inside [data-bot-gate] also waits until that gate's inline
 * opacity is above 0 (the end card fades in over the story). window.AisaBots.seek(t) paints every bot at time t (film mode).
 */
import { GrokPlayback } from "./grok/playback";
import type { BotFrame } from "./vendor/bloub/engine";
import { NOTIF_BLUE } from "./vendor/bloub/decor";
import { DEMI_VIEWBOX, RAYON } from "./vendor/bloub/repere";
import { COLOR_BY_ID, mixHex, type ShapeId } from "./vendor/bloub/skins";
import { POSES, type StateId } from "./vendor/bloub/states";

// The four Labs templates (client/src/labs/lib/templates.ts on aisa.one): shape and colour, as the site's Mascot maps them.
const TEAM: Record<string, { shape: ShapeId; start: StateId; color: string }> = {
  seo: { shape: "triangle", start: "play", color: "vert" },
  research: { shape: "galet", start: "orbit", color: "violet" },
  finder: { shape: "cercle", start: "thinking", color: "bleu" },
  marketing: { shape: "cercle", start: "idle", color: "orange" },
};

let uid = 0;
const n = (x: number) => +x.toFixed(2);

function svg(frame: BotFrame, ink: string, paper: string, id: string) {
  const V = DEMI_VIEWBOX, mask = `${id}-m`;
  const dots = frame.dots.map(dot => {
    const fill = dot.color ?? (dot.depth === undefined ? ink : mixHex(paper, ink, dot.depth));
    return dot.d
      ? `<path d="${dot.d}" fill="${fill}" opacity="${dot.opacity}" transform="translate(${n(dot.x)} ${n(dot.y)}) rotate(${n(dot.rot ?? 0)}) scale(${RAYON})"/>`
      : `<circle cx="${n(dot.x)}" cy="${n(dot.y)}" r="${n(dot.r)}" fill="${fill}" opacity="${dot.opacity}"/>`;
  }).join("");
  const arcs = (side: "back" | "front") =>
    `<g fill="none" stroke-linecap="round">${frame.arcs.map(a => `<path d="${a[side]}" stroke="url(#${id}-${a.id})" stroke-width="${a.width}" opacity="${a.opacity}"/>`).join("")}</g>`;
  const grads = frame.arcs.map(a =>
    `<linearGradient id="${id}-${a.id}" gradientUnits="userSpaceOnUse" x1="${a.grad.x1}" y1="${a.grad.y1}" x2="${a.grad.x2}" y2="${a.grad.y2}">${
      a.grad.stops.map((c, i) => `<stop offset="${i / (a.grad.stops.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`).join("");
  const eyes = frame.eyes.map(e => `<path d="${e.d}" transform="${e.matrix}" opacity="${e.alpha}" fill="#000"/>`).join("");
  const notch = frame.notch ? `<circle cx="${n(frame.notch.x)}" cy="${n(frame.notch.y)}" r="${n(frame.notch.r)}" fill="#000"/>` : "";
  const notif = frame.notif ? `<circle cx="${n(frame.notif.x)}" cy="${n(frame.notif.y)}" r="${n(frame.notif.r)}" fill="${NOTIF_BLUE}"/>` : "";
  return `<svg width="100%" height="100%" viewBox="${-V} ${-V} ${V * 2} ${V * 2}" aria-hidden="true" focusable="false">` +
    `<defs><mask id="${mask}" maskUnits="userSpaceOnUse" x="${-V}" y="${-V}" width="${V * 2}" height="${V * 2}"><path d="${frame.bodyPath}" fill="#fff"/>${eyes}${notch}</mask>${grads}</defs>` +
    arcs("back") + (frame.dotsBehind ? `<g>${dots}</g>` : "") +
    `<g opacity="${frame.bodyAlpha}"><path d="${frame.bodyPath}" fill="${paper}"/><g mask="url(#${mask})"><rect x="${-V}" y="${-V}" width="${V * 2}" height="${V * 2}" fill="${ink}"/></g></g>` +
    (frame.dotsBehind ? "" : `<g>${dots}</g>`) + notif + arcs("front") + "</svg>";
}

type Bot = { el: HTMLElement; gate: HTMLElement | null; player: GrokPlayback; ink: string; paper: string; id: string; time: number; seen: boolean };
const bots: Bot[] = [];

function draw(bot: Bot) {
  bot.el.innerHTML = svg(bot.player.sample(bot.time).frame, bot.ink, bot.paper, bot.id);
}

function mount(el: HTMLElement) {
  const who = TEAM[el.dataset.bot ?? ""];
  if (!who) return;
  const bot: Bot = {
    el, gate: el.closest<HTMLElement>("[data-bot-gate]"), player: new GrokPlayback(who.shape, who.start),
    ink: COLOR_BY_ID.get(who.color)!.hex, paper: el.dataset.paper ?? "#ffffff", id: `bot${uid++}`, time: POSES[who.start], seen: false,
  };
  bots.push(bot);
  draw(bot);
}

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
let film = false, last: number | undefined;
const live = (bot: Bot) => bot.seen && (!bot.gate || parseFloat(bot.gate.style.opacity || "1") > 0);

function tick(now: number) {
  const dt = last === undefined ? 0 : Math.min((now - last) / 1000, 0.064);
  last = now;
  if (!film && !document.hidden && !reduce.matches) {
    for (const bot of bots) {
      if (!live(bot)) continue;
      bot.time += dt;
      draw(bot);
    }
  }
  requestAnimationFrame(tick);
}

function start() {
  document.querySelectorAll<HTMLElement>("[data-bot]").forEach(mount);
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const bot = bots.find(b => b.el === e.target);
    if (bot) bot.seen = e.isIntersecting;
  }), { threshold: 0.15 });
  bots.forEach(b => io.observe(b.el));
  requestAnimationFrame(tick);
}

/** Film mode: every bot at its own start pose plus t seconds, no clock carried between frames. */
function seek(t: number) {
  film = true;
  for (const bot of bots) {
    const who = TEAM[bot.el.dataset.bot ?? ""];
    bot.time = POSES[who.start] + Math.max(0, t);
    draw(bot);
  }
}

(window as unknown as { AisaBots: object }).AisaBots = { seek };
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
else start();
