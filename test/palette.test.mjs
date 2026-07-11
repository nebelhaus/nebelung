// Tests for the OKLCH palette generator. Run with `node --test`.
//
// These pin the two things that actually matter for a theme: the perceptual
// invariants the strategy promises (neutrals go true-grey but keep lightness;
// accents keep hue + lightness and only lose chroma), and that the committed
// palette/*.json is what the current code produces (drift guard — the repo
// commits generated output, so a stale checkout is a real failure mode).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
	buildOverrides,
	hexToRgb,
	rgbToHex,
	hexToLch,
	lchToHex,
	MOCHA,
	NEUTRALS,
	ACCENTS,
	CONFIG,
} from "../scripts/generate-palette.mjs";

const HEX6 = /^[0-9a-f]{6}$/;
const near = (a, b, eps) => Math.abs(a - b) <= eps;

test("covers every mocha color exactly once, all valid 6-digit hex", () => {
	const { out } = buildOverrides();
	assert.equal(Object.keys(out).length, NEUTRALS.length + ACCENTS.length);
	assert.equal(Object.keys(out).length, Object.keys(MOCHA).length);
	for (const [name, hex] of Object.entries(out)) {
		assert.match(hex, HEX6, `${name} -> ${hex} is not 6-digit hex`);
	}
});

test("neutrals become true grey (R=G=B) — chroma stripped", () => {
	const { out } = buildOverrides();
	for (const name of NEUTRALS) {
		const [r, g, b] = hexToRgb(out[name]);
		assert.ok(r === g && g === b, `${name} -> ${out[name]} is not neutral grey`);
	}
});

test("neutrals preserve OKLCH lightness", () => {
	const { out } = buildOverrides();
	for (const name of NEUTRALS) {
		const before = hexToLch(MOCHA[name])[0];
		const after = hexToLch(out[name])[0];
		assert.ok(near(before, after, 0.01), `${name} lightness drifted ${before} -> ${after}`);
	}
});

test("accents keep hue + lightness and only scale chroma down", () => {
	const { out } = buildOverrides();
	for (const name of ACCENTS) {
		const [L0, C0, h0] = hexToLch(MOCHA[name]);
		const [L1, C1, h1] = hexToLch(out[name]);
		assert.ok(near(L0, L1, 0.01), `${name} lightness drifted`);
		assert.ok(near(h0, h1, 0.05), `${name} hue drifted ${h0} -> ${h1}`);
		assert.ok(C1 < C0, `${name} chroma should shrink (${C0} -> ${C1})`);
		assert.ok(near(C1, C0 * CONFIG.accentChromaScale, 0.02), `${name} chroma not scaled by config`);
	}
});

test("config knobs drive the output", () => {
	// scale 1.0 leaves accent chroma ~unchanged...
	const identity = buildOverrides({ ...CONFIG, accentChromaScale: 1 });
	for (const name of ACCENTS) {
		const c0 = hexToLch(MOCHA[name])[1];
		const c1 = hexToLch(identity.out[name])[1];
		assert.ok(near(c0, c1, 0.02), `${name} should be ~unchanged at scale 1`);
	}
	// ...and scale 0 flattens accents to grey too.
	const flat = buildOverrides({ ...CONFIG, accentChromaScale: 0 });
	for (const name of ACCENTS) {
		const [r, g, b] = hexToRgb(flat.out[name]);
		assert.ok(r === g && g === b, `${name} should be grey at scale 0`);
	}
});

test("hex<->rgb round-trips", () => {
	for (const hex of Object.values(MOCHA)) {
		assert.equal(rgbToHex(hexToRgb(hex)), hex);
	}
});

test("hex<->OKLCH round-trips within 8-bit rounding", () => {
	for (const hex of Object.values(MOCHA)) {
		const back = hexToRgb(lchToHex(hexToLch(hex)));
		const fwd = hexToRgb(hex);
		for (let i = 0; i < 3; i++) {
			assert.ok(Math.abs(back[i] - fwd[i]) <= 1, `${hex} round-trip off at channel ${i}`);
		}
	}
});

test("committed palette/nebelung.hex.json matches generator output (drift guard)", () => {
	const committed = JSON.parse(
		readFileSync(new URL("../palette/nebelung.hex.json", import.meta.url)),
	);
	assert.deepEqual(committed, buildOverrides().out);
});

test("committed palette/nebelung.json matches generator output (drift guard)", () => {
	const committed = JSON.parse(
		readFileSync(new URL("../palette/nebelung.json", import.meta.url)),
	);
	assert.deepEqual(committed, { mocha: buildOverrides().out });
});
