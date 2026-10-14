import { BotEngine } from "../vendor/bloub/engine";
import { EXPRESSION_BY_ID } from "../vendor/bloub/expressions";
import { RAYON } from "../vendor/bloub/repere";
import { SHAPE_BY_ID, type ShapeId } from "../vendor/bloub/skins";
import { SEQUENCE, STATE_BY_ID, type StateId } from "../vendor/bloub/states";

export const GROK_SEQUENCE = SEQUENCE.map((state) => ({
  state,
  duration: STATE_BY_ID.get(state)!.duration,
}));

/** The wrapper controls time only; measured geometry and transitions stay upstream. */
export class GrokPlayback {
  readonly sequence: typeof GROK_SEQUENCE;
  readonly duration: number;
  private engine: BotEngine;
  private index = 0;
  private next = 0;
  private last = 0;

  constructor(private shape: ShapeId = "cercle", start: StateId = "idle") {
    const offset = Math.max(0, SEQUENCE.indexOf(start));
    this.sequence = [...GROK_SEQUENCE.slice(offset), ...GROK_SEQUENCE.slice(0, offset)];
    this.duration = this.sequence.reduce((total, block) => total + block.duration, 0);
    this.engine = this.newEngine();
    this.next = this.sequence[0].duration;
  }

  private newEngine() {
    return new BotEngine(RAYON, this.sequence[0].state, SHAPE_BY_ID.get(this.shape)!.radii, EXPRESSION_BY_ID.get("neutre"));
  }

  sample(time: number) {
    if (!Number.isFinite(time) || time < 0) throw new RangeError("Animation time must be a finite, non-negative number");
    // Only one preceding cycle is needed: all source holds exceed their morphs.
    // This bounds seeks after a suspended machine without changing sample time.
    if (time < this.last || time - this.last > this.duration * 2) {
      const beginning = Math.max(0, Math.floor(time / this.duration) - 1) * this.duration;
      this.engine = this.newEngine();
      this.engine.reset(this.sequence[0].state, beginning);
      this.index = 0;
      this.next = beginning + this.sequence[0].duration;
    }
    while (time >= this.next) {
      this.index = (this.index + 1) % this.sequence.length;
      this.engine.setState(this.sequence[this.index].state, this.next);
      this.next += this.sequence[this.index].duration;
    }
    this.last = time;
    return { state: this.engine.state, frame: this.engine.sample(time) };
  }
}
