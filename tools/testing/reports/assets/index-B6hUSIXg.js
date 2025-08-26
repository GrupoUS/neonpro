const GS = Object.defineProperty;
const KS = (e, t, r) =>
	t in e
		? GS(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
		: (e[t] = r);
const fs = (e, t, r) => KS(e, typeof t !== "symbol" ? t + "" : t, r);
(() => {
	const t = document.createElement("link").relList;
	if (t && t.supports && t.supports("modulepreload")) {
		return;
	}
	for (const s of document.querySelectorAll('link[rel="modulepreload"]')) {
		o(s);
	}
	new MutationObserver((s) => {
		for (const c of s) {
			if (c.type === "childList") {
				for (const f of c.addedNodes) {
					f.tagName === "LINK" && f.rel === "modulepreload" && o(f);
				}
			}
		}
	}).observe(document, { childList: !0, subtree: !0 });
	function r(s) {
		const c = {};
		return (
			s.integrity && (c.integrity = s.integrity),
			s.referrerPolicy && (c.referrerPolicy = s.referrerPolicy),
			s.crossOrigin === "use-credentials"
				? (c.credentials = "include")
				: (s.crossOrigin === "anonymous"
					? (c.credentials = "omit")
					: (c.credentials = "same-origin")),
			c
		);
	}
	function o(s) {
		if (s.ep) {
			return;
		}
		s.ep = !0;
		const c = r(s);
		fetch(s.href, c);
	}
})(); /**
 * @vue/shared v3.5.12
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 */

/*! #__NO_SIDE_EFFECTS__ */
function hh(e) {
	const t = Object.create(null);
	for (const r of e.split(",")) {
		t[r] = 1;
	}
	return (r) => r in t;
}
const vt = {},
	ys = [],
	Fr = () => {},
	XS = () => !1,
	pu = (e) =>
		e.codePointAt(0) === 111 &&
		e.codePointAt(1) === 110 &&
		(e.codePointAt(2) > 122 || e.codePointAt(2) < 97),
	ph = (e) => e.startsWith("onUpdate:"),
	Wt = Object.assign,
	gh = (e, t) => {
		const r = e.indexOf(t);
		r !== -1 && e.splice(r, 1);
	},
	YS = Object.prototype.hasOwnProperty,
	bt = (e, t) => YS.call(e, t),
	Fe = Array.isArray,
	bs = (e) => da(e) === "[object Map]",
	gu = (e) => da(e) === "[object Set]",
	dv = (e) => da(e) === "[object Date]",
	Ke = (e) => typeof e === "function",
	Ot = (e) => typeof e === "string",
	Tr = (e) => typeof e === "symbol",
	_t = (e) => e !== null && typeof e === "object",
	O0 = (e) => (_t(e) || Ke(e)) && Ke(e.then) && Ke(e.catch),
	R0 = Object.prototype.toString,
	da = (e) => R0.call(e),
	ZS = (e) => da(e).slice(8, -1),
	D0 = (e) => da(e) === "[object Object]",
	vh = (e) =>
		Ot(e) && e !== "NaN" && e[0] !== "-" && "" + Number.parseInt(e, 10) === e,
	Nl = hh(
		",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted",
	),
	vu = (e) => {
		const t = Object.create(null);
		return (r) => t[r] || (t[r] = e(r));
	},
	JS = /-(\w)/g,
	Jn = vu((e) => e.replace(JS, (t, r) => (r ? r.toUpperCase() : ""))),
	QS = /\B([A-Z])/g,
	yi = vu((e) => e.replace(QS, "-$1").toLowerCase()),
	mu = vu((e) => e.charAt(0).toUpperCase() + e.slice(1)),
	Sc = vu((e) => (e ? `on${mu(e)}` : "")),
	In = (e, t) => !Object.is(e, t),
	_c = (e, ...t) => {
		for (let r = 0; r < e.length; r++) {
			e[r](...t);
		}
	},
	z0 = (e, t, r, o = !1) => {
		Object.defineProperty(e, t, {
			configurable: !0,
			enumerable: !1,
			writable: o,
			value: r,
		});
	},
	md = (e) => {
		const t = Number.parseFloat(e);
		return isNaN(t) ? e : t;
	},
	I0 = (e) => {
		const t = Ot(e) ? Number(e) : Number.NaN;
		return isNaN(t) ? e : t;
	};
let hv;
const yu = () =>
	hv ||
	(hv =
		typeof globalThis < "u"
			? globalThis
			: typeof self < "u"
				? self
				: typeof window < "u"
					? window
					: typeof global < "u"
						? global
						: {});
function Jt(e) {
	if (Fe(e)) {
		const t = {};
		for (let r = 0; r < e.length; r++) {
			const o = e[r],
				s = Ot(o) ? r_(o) : Jt(o);
			if (s) {
				for (const c in s) {
					t[c] = s[c];
				}
			}
		}
		return t;
	}
	if (Ot(e) || _t(e)) {
		return e;
	}
}
const e_ = /;(?![^(]*\))/g,
	t_ = /:([^]+)/,
	n_ = /\/\*[^]*?\*\//g;
function r_(e) {
	const t = {};
	return (
		e
			.replace(n_, "")
			.split(e_)
			.forEach((r) => {
				if (r) {
					const o = r.split(t_);
					o.length > 1 && (t[o[0].trim()] = o[1].trim());
				}
			}),
		t
	);
}
function st(e) {
	let t = "";
	if (Ot(e)) {
		t = e;
	} else if (Fe(e)) {
		for (let r = 0; r < e.length; r++) {
			const o = st(e[r]);
			o && (t += o + " ");
		}
	} else if (_t(e)) {
		for (const r in e) {
			e[r] && (t += r + " ");
		}
	}
	return t.trim();
}
function i_(e) {
	if (!e) {
		return ;
	}
	const { class: t, style: r } = e;
	return t && !Ot(t) && (e.class = st(t)), r && (e.style = Jt(r)), e;
}
const o_ =
		"itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
	s_ = hh(o_);
function F0(e) {
	return !!e || e === "";
}
function l_(e, t) {
	if (e.length !== t.length) {
		return !1;
	}
	let r = !0;
	for (let o = 0; r && o < e.length; o++) {
		r = bu(e[o], t[o]);
	}
	return r;
}
function bu(e, t) {
	if (e === t) {
		return !0;
	}
	let r = dv(e),
		o = dv(t);
	if (r || o) {
		return r && o ? e.getTime() === t.getTime() : !1;
	}
	if (((r = Tr(e)), (o = Tr(t)), r || o)) {
		return e === t;
	}
	if (((r = Fe(e)), (o = Fe(t)), r || o)) {
		return r && o ? l_(e, t) : !1;
	}
	if (((r = _t(e)), (o = _t(t)), r || o)) {
		if (!(r && o)) {
			return !1;
		}
		const s = Object.keys(e).length,
			c = Object.keys(t).length;
		if (s !== c) {
			return !1;
		}
		for (const f in e) {
			const d = Object.hasOwn(e, f),
				h = Object.hasOwn(t, f);
			if ((d && !h) || (!d && h) || !bu(e[f], t[f])) {
				return !1;
			}
		}
	}
	return String(e) === String(t);
}
function H0(e, t) {
	return e.findIndex((r) => bu(r, t));
}
const q0 = (e) => !!(e && e.__v_isRef === !0),
	He = (e) =>
		Ot(e)
			? e
			: e == undefined
				? ""
				: Fe(e) || (_t(e) && (e.toString === R0 || !Ke(e.toString)))
					? q0(e)
						? He(e.value)
						: JSON.stringify(e, B0, 2)
					: String(e),
	B0 = (e, t) =>
		q0(t)
			? B0(e, t.value)
			: bs(t)
				? {
						[`Map(${t.size})`]: [...t.entries()].reduce(
							(r, [o, s], c) => ((r[Uf(o, c) + " =>"] = s), r),
							{},
						),
					}
				: gu(t)
					? { [`Set(${t.size})`]: [...t.values()].map((r) => Uf(r)) }
					: Tr(t)
						? Uf(t)
						: _t(t) && !Fe(t) && !D0(t)
							? String(t)
							: t,
	Uf = (e, t = "") => {
		let r;
		return Tr(e) ? `Symbol(${((r = e.description)) != undefined ? r : t})` : e;
	}; /**
 * @vue/reactivity v3.5.12
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 */

let Cn;
class a_ {
	constructor(t = !1) {
		(this.detached = t),
			(this._active = !0),
			(this.effects = []),
			(this.cleanups = []),
			(this._isPaused = !1),
			(this.parent = Cn),
			!t && Cn && (this.index = (Cn.scopes || (Cn.scopes = [])).push(this) - 1);
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let t, r;
			if (this.scopes) {
				for (t = 0, r = this.scopes.length; t < r; t++) {
					this.scopes[t].pause();
				}
			}
			for (t = 0, r = this.effects.length; t < r; t++) {
				this.effects[t].pause();
			}
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let t, r;
			if (this.scopes) {
				for (t = 0, r = this.scopes.length; t < r; t++) {
					this.scopes[t].resume();
				}
			}
			for (t = 0, r = this.effects.length; t < r; t++) {
				this.effects[t].resume();
			}
		}
	}
	run(t) {
		if (this._active) {
			const r = Cn;
			try {
				return (Cn = this), t();
			} finally {
				Cn = r;
			}
		}
	}
	on() {
		Cn = this;
	}
	off() {
		Cn = this.parent;
	}
	stop(t) {
		if (this._active) {
			let r, o;
			for (r = 0, o = this.effects.length; r < o; r++) {
				this.effects[r].stop();
			}
			for (r = 0, o = this.cleanups.length; r < o; r++) {
				this.cleanups[r]();
			}
			if (this.scopes) {
				for (r = 0, o = this.scopes.length; r < o; r++) {
					this.scopes[r].stop(!0);
				}
			}
			if (!this.detached && this.parent && !t) {
				const s = this.parent.scopes.pop();
				s &&
					s !== this &&
					((this.parent.scopes[this.index] = s), (s.index = this.index));
			}
			(this.parent = void 0), (this._active = !1);
		}
	}
}
function W0() {
	return Cn;
}
function c_(e, t = !1) {
	Cn && Cn.cleanups.push(e);
}
let kt;
const Vf = new WeakSet();
class U0 {
	constructor(t) {
		(this.fn = t),
			(this.deps = void 0),
			(this.depsTail = void 0),
			(this.flags = 5),
			(this.next = void 0),
			(this.cleanup = void 0),
			(this.scheduler = void 0),
			Cn && Cn.active && Cn.effects.push(this);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 &&
			((this.flags &= -65), Vf.has(this) && (Vf.delete(this), this.trigger()));
	}
	notify() {
		(this.flags & 2 && !(this.flags & 32)) || this.flags & 8 || j0(this);
	}
	run() {
		if (!(this.flags & 1)) {
			return this.fn();
		}
		(this.flags |= 2), pv(this), G0(this);
		const t = kt,
			r = Sr;
		(kt = this), (Sr = !0);
		try {
			return this.fn();
		} finally {
			K0(this), (kt = t), (Sr = r), (this.flags &= -3);
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let t = this.deps; t; t = t.nextDep) {
				bh(t);
			}
			(this.deps = this.depsTail = void 0),
				pv(this),
				this.onStop && this.onStop(),
				(this.flags &= -2);
		}
	}
	trigger() {
		this.flags & 64
			? Vf.add(this)
			: (this.scheduler
				? this.scheduler()
				: this.runIfDirty());
	}
	runIfDirty() {
		yd(this) && this.run();
	}
	get dirty() {
		return yd(this);
	}
}
let V0 = 0,
	$l,
	Pl;
function j0(e, t = !1) {
	if (((e.flags |= 8), t)) {
		(e.next = Pl), (Pl = e);
		return;
	}
	(e.next = $l), ($l = e);
}
function mh() {
	V0++;
}
function yh() {
	if (--V0 > 0) {
		return;
	}
	if (Pl) {
		let t = Pl;
		for (Pl = void 0; t; ) {
			const r = t.next;
			(t.next = void 0), (t.flags &= -9), (t = r);
		}
	}
	let e;
	while ($l) {
		let t = $l;
		for ($l = void 0; t; ) {
			const r = t.next;
			if (((t.next = void 0), (t.flags &= -9), t.flags & 1)) {
				try {
					t.trigger();
				} catch (error) {
					e || (e = error);
				}
			}
			t = r;
		}
	}
	if (e) {
		throw e;
	}
}
function G0(e) {
	for (let t = e.deps; t; t = t.nextDep) {
		(t.version = -1),
			(t.prevActiveLink = t.dep.activeLink),
			(t.dep.activeLink = t);
	}
}
function K0(e) {
	let t,
		r = e.depsTail,
		o = r;
	while (o) {
		const s = o.prevDep;
		o.version === -1 ? (o === r && (r = s), bh(o), u_(o)) : (t = o),
			(o.dep.activeLink = o.prevActiveLink),
			(o.prevActiveLink = void 0),
			(o = s);
	}
	(e.deps = t), (e.depsTail = r);
}
function yd(e) {
	for (let t = e.deps; t; t = t.nextDep) {
		if (
			t.dep.version !== t.version ||
			(t.dep.computed && (X0(t.dep.computed) || t.dep.version !== t.version))
		) {
			return !0;
		}
	}
	return !!e._dirty;
}
function X0(e) {
	if (
		(e.flags & 4 && !(e.flags & 16)) ||
		((e.flags &= -17), e.globalVersion === Ul)
	) {
		return;
	}
	e.globalVersion = Ul;
	const t = e.dep;
	if (((e.flags |= 2), t.version > 0 && !e.isSSR && e.deps && !yd(e))) {
		e.flags &= -3;
		return;
	}
	const r = kt,
		o = Sr;
	(kt = e), (Sr = !0);
	try {
		G0(e);
		const s = e.fn(e._value);
		(t.version === 0 || In(s, e._value)) && ((e._value = s), t.version++);
	} catch (error) {
		throw (t.version++, error);
	} finally {
		(kt = r), (Sr = o), K0(e), (e.flags &= -3);
	}
}
function bh(e, t = !1) {
	const { dep: r, prevSub: o, nextSub: s } = e;
	if (
		(o && ((o.nextSub = s), (e.prevSub = void 0)),
		s && ((s.prevSub = o), (e.nextSub = void 0)),
		r.subs === e && ((r.subs = o), !o && r.computed))
	) {
		r.computed.flags &= -5;
		for (let c = r.computed.deps; c; c = c.nextDep) {
			bh(c, !0);
		}
	}
	!(t || --r.sc) && r.map && r.map.delete(r.key);
}
function u_(e) {
	const { prevDep: t, nextDep: r } = e;
	t && ((t.nextDep = r), (e.prevDep = void 0)),
		r && ((r.prevDep = t), (e.nextDep = void 0));
}
let Sr = !0;
const Y0 = [];
function io() {
	Y0.push(Sr), (Sr = !1);
}
function oo() {
	const e = Y0.pop();
	Sr = e === void 0 ? !0 : e;
}
function pv(e) {
	const { cleanup: t } = e;
	if (((e.cleanup = void 0), t)) {
		const r = kt;
		kt = void 0;
		try {
			t();
		} finally {
			kt = r;
		}
	}
}
let Ul = 0;
class f_ {
	constructor(t, r) {
		(this.sub = t),
			(this.dep = r),
			(this.version = r.version),
			(this.nextDep =
				this.prevDep =
				this.nextSub =
				this.prevSub =
				this.prevActiveLink =
					void 0);
	}
}
class wu {
	constructor(t) {
		(this.computed = t),
			(this.version = 0),
			(this.activeLink = void 0),
			(this.subs = void 0),
			(this.map = void 0),
			(this.key = void 0),
			(this.sc = 0);
	}
	track(t) {
		if (!(kt && Sr) || kt === this.computed) {
			return;
		}
		let r = this.activeLink;
		if (r === void 0 || r.sub !== kt) {
			(r = this.activeLink = new f_(kt, this)),
				kt.deps
					? ((r.prevDep = kt.depsTail),
						(kt.depsTail.nextDep = r),
						(kt.depsTail = r))
					: (kt.deps = kt.depsTail = r),
				Z0(r);
		} else if (r.version === -1 && ((r.version = this.version), r.nextDep)) {
			const o = r.nextDep;
			(o.prevDep = r.prevDep),
				r.prevDep && (r.prevDep.nextDep = o),
				(r.prevDep = kt.depsTail),
				(r.nextDep = void 0),
				(kt.depsTail.nextDep = r),
				(kt.depsTail = r),
				kt.deps === r && (kt.deps = o);
		}
		return r;
	}
	trigger(t) {
		this.version++, Ul++, this.notify(t);
	}
	notify(t) {
		mh();
		try {
			for (let r = this.subs; r; r = r.prevSub) {
				r.sub.notify() && r.sub.dep.notify();
			}
		} finally {
			yh();
		}
	}
}
function Z0(e) {
	if ((e.dep.sc++, e.sub.flags & 4)) {
		const t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let o = t.deps; o; o = o.nextDep) {
				Z0(o);
			}
		}
		const r = e.dep.subs;
		r !== e && ((e.prevSub = r), r && (r.nextSub = e)), (e.dep.subs = e);
	}
}
const Ic = new WeakMap(),
	Ao = Symbol(""),
	bd = Symbol(""),
	Vl = Symbol("");
function hn(e, t, r) {
	if (Sr && kt) {
		let o = Ic.get(e);
		o || Ic.set(e, (o = new Map()));
		let s = o.get(r);
		s || (o.set(r, (s = new wu())), (s.map = o), (s.key = r)), s.track();
	}
}
function ci(e, t, r, o, s, c) {
	const f = Ic.get(e);
	if (!f) {
		Ul++;
		return;
	}
	const d = (h) => {
		h && h.trigger();
	};
	if ((mh(), t === "clear")) {
		f.forEach(d);
	} else {
		const h = Fe(e),
			p = h && vh(r);
		if (h && r === "length") {
			const v = Number(o);
			f.forEach((m, b) => {
				(b === "length" || b === Vl || (!Tr(b) && b >= v)) && d(m);
			});
		} else {
			switch (
				((r !== void 0 || f.has(void 0)) && d(f.get(r)), p && d(f.get(Vl)), t)
			) {
				case "add": {
					h ? p && d(f.get("length")) : (d(f.get(Ao)), bs(e) && d(f.get(bd)));
					break;
				}
				case "delete": {
					h || (d(f.get(Ao)), bs(e) && d(f.get(bd)));
					break;
				}
				case "set": {
					bs(e) && d(f.get(Ao));
					break;
				}
			}
		}
	}
	yh();
}
function d_(e, t) {
	const r = Ic.get(e);
	return r && r.get(t);
}
function ds(e) {
	const t = ht(e);
	return t === e ? t : (hn(t, "iterate", Vl), or(e) ? t : t.map(pn));
}
function xu(e) {
	return hn((e = ht(e)), "iterate", Vl), e;
}
const h_ = {
	__proto__: undefined,
	[Symbol.iterator]() {
		return jf(this, Symbol.iterator, pn);
	},
	concat(...e) {
		return ds(this).concat(...e.map((t) => (Fe(t) ? ds(t) : t)));
	},
	entries() {
		return jf(this, "entries", (e) => ((e[1] = pn(e[1])), e));
	},
	every(e, t) {
		return ii(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return ii(this, "filter", e, t, (r) => r.map(pn), arguments);
	},
	find(e, t) {
		return ii(this, "find", e, t, pn, arguments);
	},
	findIndex(e, t) {
		return ii(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return ii(this, "findLast", e, t, pn, arguments);
	},
	findLastIndex(e, t) {
		return ii(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return ii(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return Gf(this, "includes", e);
	},
	indexOf(...e) {
		return Gf(this, "indexOf", e);
	},
	join(e) {
		return ds(this).join(e);
	},
	lastIndexOf(...e) {
		return Gf(this, "lastIndexOf", e);
	},
	map(e, t) {
		return ii(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return xl(this, "pop");
	},
	push(...e) {
		return xl(this, "push", e);
	},
	reduce(e, ...t) {
		return gv(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return gv(this, "reduceRight", e, t);
	},
	shift() {
		return xl(this, "shift");
	},
	some(e, t) {
		return ii(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return xl(this, "splice", e);
	},
	toReversed() {
		return ds(this).toReversed();
	},
	toSorted(e) {
		return ds(this).toSorted(e);
	},
	toSpliced(...e) {
		return ds(this).toSpliced(...e);
	},
	unshift(...e) {
		return xl(this, "unshift", e);
	},
	values() {
		return jf(this, "values", pn);
	},
};
function jf(e, t, r) {
	const o = xu(e),
		s = o[t]();
	return (
		o !== e &&
			!or(e) &&
			((s._next = s.next),
			(s.next = () => {
				const c = s._next();
				return c.value && (c.value = r(c.value)), c;
			})),
		s
	);
}
const p_ = Array.prototype;
function ii(e, t, r, o, s, c) {
	const f = xu(e),
		d = f !== e && !or(e),
		h = f[t];
	if (h !== p_[t]) {
		const m = h.apply(e, c);
		return d ? pn(m) : m;
	}
	let p = r;
	f !== e &&
		(d
			? (p = function p(m, b) {
					return r.call(this, pn(m), b, e);
				})
			: r.length > 2 &&
				(p = function p(m, b) {
					return r.call(this, m, b, e);
				}));
	const v = h.call(f, p, o);
	return d && s ? s(v) : v;
}
function gv(e, t, r, o) {
	const s = xu(e);
	let c = r;
	return (
		s !== e &&
			(or(e)
				? r.length > 3 &&
					(c = function c(f, d, h) {
						return r.call(this, f, d, h, e);
					})
				: (c = function c(f, d, h) {
						return r.call(this, f, pn(d), h, e);
					})),
		s[t](c, ...o)
	);
}
function Gf(e, t, r) {
	const o = ht(e);
	hn(o, "iterate", Vl);
	const s = o[t](...r);
	return (s === -1 || s === !1) && _h(r[0])
		? ((r[0] = ht(r[0])), o[t](...r))
		: s;
}
function xl(e, t, r = []) {
	io(), mh();
	const o = ht(e)[t].apply(e, r);
	return yh(), oo(), o;
}
const g_ = hh("__proto__,__v_isRef,__isVue"),
	J0 = new Set(
		Object.getOwnPropertyNames(Symbol)
			.filter((e) => e !== "arguments" && e !== "caller")
			.map((e) => Symbol[e])
			.filter(Tr),
	);
function v_(e) {
	Tr(e) || (e = String(e));
	const t = ht(this);
	return hn(t, "has", e), Object.hasOwn(t, e);
}
class Q0 {
	constructor(t = !1, r = !1) {
		(this._isReadonly = t), (this._isShallow = r);
	}
	get(t, r, o) {
		const s = this._isReadonly,
			c = this._isShallow;
		if (r === "__v_isReactive") {
			return !s;
		}
		if (r === "__v_isReadonly") {
			return s;
		}
		if (r === "__v_isShallow") {
			return c;
		}
		if (r === "__v_raw") {
			return o === (s ? (c ? C_ : ry) : (c ? ny : ty)).get(t) ||
				Object.getPrototypeOf(t) === Object.getPrototypeOf(o)
				? t
				: void 0;
		}
		const f = Fe(t);
		if (!s) {
			let h;
			if (f && (h = h_[r])) {
				return h;
			}
			if (r === "hasOwnProperty") {
				return v_;
			}
		}
		const d = Reflect.get(t, r, At(t) ? t : o);
		return (Tr(r) ? J0.has(r) : g_(r)) || (s || hn(t, "get", r), c)
			? d
			: At(d)
				? f && vh(r)
					? d
					: d.value
				: _t(d)
					? s
						? ha(d)
						: Zn(d)
					: d;
	}
}
class ey extends Q0 {
	constructor(t = !1) {
		super(!1, t);
	}
	set(t, r, o, s) {
		let c = t[r];
		if (!this._isShallow) {
			const h = $o(c);
			if (
				(!(or(o) || $o(o)) && ((c = ht(c)), (o = ht(o))),
				!Fe(t) && At(c) && !At(o))
			) {
				return h ? !1 : ((c.value = o), !0);
			}
		}
		const f = Fe(t) && vh(r) ? Number(r) < t.length : bt(t, r),
			d = Reflect.set(t, r, o, At(t) ? t : s);
		return (
			t === ht(s) && (f ? In(o, c) && ci(t, "set", r, o) : ci(t, "add", r, o)),
			d
		);
	}
	deleteProperty(t, r) {
		const o = bt(t, r);
		t[r];
		const s = Reflect.deleteProperty(t, r);
		return s && o && ci(t, "delete", r, void 0), s;
	}
	has(t, r) {
		const o = Reflect.has(t, r);
		return !(Tr(r) && J0.has(r)) && hn(t, "has", r), o;
	}
	ownKeys(t) {
		return hn(t, "iterate", Fe(t) ? "length" : Ao), Reflect.ownKeys(t);
	}
}
class m_ extends Q0 {
	constructor(t = !1) {
		super(!0, t);
	}
	set(t, r) {
		return !0;
	}
	deleteProperty(t, r) {
		return !0;
	}
}
const y_ = new ey(),
	b_ = new m_(),
	w_ = new ey(!0);
const wd = (e) => e,
	ic = (e) => Reflect.getPrototypeOf(e);
function x_(e, t, r) {
	return function (...o) {
		const s = this.__v_raw,
			c = ht(s),
			f = bs(c),
			d = e === "entries" || (e === Symbol.iterator && f),
			h = e === "keys" && f,
			p = s[e](...o),
			v = r ? wd : (t ? xd : pn);
		return (
			!t && hn(c, "iterate", h ? bd : Ao),
			{
				next() {
					const { value: m, done: b } = p.next();
					return b
						? { value: m, done: b }
						: { value: d ? [v(m[0]), v(m[1])] : v(m), done: b };
				},
				[Symbol.iterator]() {
					return this;
				},
			}
		);
	};
}
function oc(e) {
	return function (...t) {
		return e === "delete" ? !1 : (e === "clear" ? void 0 : this);
	};
}
function S_(e, t) {
	const r = {
		get(s) {
			const c = this.__v_raw,
				f = ht(c),
				d = ht(s);
			e || (In(s, d) && hn(f, "get", s), hn(f, "get", d));
			const { has: h } = ic(f),
				p = t ? wd : (e ? xd : pn);
			if (h.call(f, s)) {
				return p(c.get(s));
			}
			if (h.call(f, d)) {
				return p(c.get(d));
			}
			c !== f && c.get(s);
		},
		get size() {
			const s = this.__v_raw;
			return !e && hn(ht(s), "iterate", Ao), Reflect.get(s, "size", s);
		},
		has(s) {
			const c = this.__v_raw,
				f = ht(c),
				d = ht(s);
			return (
				e || (In(s, d) && hn(f, "has", s), hn(f, "has", d)),
				s === d ? c.has(s) : c.has(s) || c.has(d)
			);
		},
		forEach(s, c) {
			const d = this.__v_raw,
				h = ht(d),
				p = t ? wd : (e ? xd : pn);
			return (
				!e && hn(h, "iterate", Ao),
				d.forEach((v, m) => s.call(c, p(v), p(m), this))
			);
		},
	};
	return (
		Wt(
			r,
			e
				? {
						add: oc("add"),
						set: oc("set"),
						delete: oc("delete"),
						clear: oc("clear"),
					}
				: {
						add(s) {
							!(t || or(s) || $o(s)) && (s = ht(s));
							const c = ht(this);
							return (
								ic(c).has.call(c, s) || (c.add(s), ci(c, "add", s, s)), this
							);
						},
						set(s, c) {
							!(t || or(c) || $o(c)) && (c = ht(c));
							const f = ht(this),
								{ has: d, get: h } = ic(f);
							let p = d.call(f, s);
							p || ((s = ht(s)), (p = d.call(f, s)));
							const v = h.call(f, s);
							return (
								f.set(s, c),
								p ? In(c, v) && ci(f, "set", s, c) : ci(f, "add", s, c),
								this
							);
						},
						delete(s) {
							const c = ht(this),
								{ has: f, get: d } = ic(c);
							let h = f.call(c, s);
							h || ((s = ht(s)), (h = f.call(c, s))), d && d.call(c, s);
							const p = c.delete(s);
							return h && ci(c, "delete", s, void 0), p;
						},
						clear() {
							const s = ht(this),
								c = s.size > 0,
								f = s.clear();
							return c && ci(s, "clear", void 0, void 0), f;
						},
					},
		),
		["keys", "values", "entries", Symbol.iterator].forEach((s) => {
			r[s] = x_(s, e, t);
		}),
		r
	);
}
function wh(e, t) {
	const r = S_(e, t);
	return (o, s, c) =>
		s === "__v_isReactive"
			? !e
			: s === "__v_isReadonly"
				? e
				: s === "__v_raw"
					? o
					: Reflect.get(bt(r, s) && s in o ? r : o, s, c);
}
const __ = { get: wh(!1, !1) },
	k_ = { get: wh(!1, !0) },
	T_ = { get: wh(!0, !1) };
const ty = new WeakMap(),
	ny = new WeakMap(),
	ry = new WeakMap(),
	C_ = new WeakMap();
function E_(e) {
	switch (e) {
		case "Object":
		case "Array": {
			return 1;
		}
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": {
			return 2;
		}
		default: {
			return 0;
		}
	}
}
function L_(e) {
	return e.__v_skip || !Object.isExtensible(e) ? 0 : E_(ZS(e));
}
function Zn(e) {
	return $o(e) ? e : Sh(e, !1, y_, __, ty);
}
function xh(e) {
	return Sh(e, !1, w_, k_, ny);
}
function ha(e) {
	return Sh(e, !0, b_, T_, ry);
}
function Sh(e, t, r, o, s) {
	if (!_t(e) || (e.__v_raw && !(t && e.__v_isReactive))) {
		return e;
	}
	const c = s.get(e);
	if (c) {
		return c;
	}
	const f = L_(e);
	if (f === 0) {
		return e;
	}
	const d = new Proxy(e, f === 2 ? o : r);
	return s.set(e, d), d;
}
function ws(e) {
	return $o(e) ? ws(e.__v_raw) : !!(e && e.__v_isReactive);
}
function $o(e) {
	return !!(e && e.__v_isReadonly);
}
function or(e) {
	return !!(e && e.__v_isShallow);
}
function _h(e) {
	return e ? !!e.__v_raw : !1;
}
function ht(e) {
	const t = e && e.__v_raw;
	return t ? ht(t) : e;
}
function kh(e) {
	return (
		!bt(e, "__v_skip") && Object.isExtensible(e) && z0(e, "__v_skip", !0), e
	);
}
const pn = (e) => (_t(e) ? Zn(e) : e),
	xd = (e) => (_t(e) ? ha(e) : e);
function At(e) {
	return e ? e.__v_isRef === !0 : !1;
}
function We(e) {
	return iy(e, !1);
}
function jr(e) {
	return iy(e, !0);
}
function iy(e, t) {
	return At(e) ? e : new A_(e, t);
}
class A_ {
	constructor(t, r) {
		(this.dep = new wu()),
			(this.__v_isRef = !0),
			(this.__v_isShallow = !1),
			(this._rawValue = r ? t : ht(t)),
			(this._value = r ? t : pn(t)),
			(this.__v_isShallow = r);
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(t) {
		const r = this._rawValue,
			o = this.__v_isShallow || or(t) || $o(t);
		(t = o ? t : ht(t)),
			In(t, r) &&
				((this._rawValue = t),
				(this._value = o ? t : pn(t)),
				this.dep.trigger());
	}
}
function I(e) {
	return At(e) ? e.value : e;
}
const M_ = {
	get: (e, t, r) => (t === "__v_raw" ? e : I(Reflect.get(e, t, r))),
	set: (e, t, r, o) => {
		const s = e[t];
		return At(s) && !At(r) ? ((s.value = r), !0) : Reflect.set(e, t, r, o);
	},
};
function oy(e) {
	return ws(e) ? e : new Proxy(e, M_);
}
class N_ {
	constructor(t) {
		(this.__v_isRef = !0), (this._value = void 0);
		const r = (this.dep = new wu()),
			{ get: o, set: s } = t(r.track.bind(r), r.trigger.bind(r));
		(this._get = o), (this._set = s);
	}
	get value() {
		return (this._value = this._get());
	}
	set value(t) {
		this._set(t);
	}
}
function sy(e) {
	return new N_(e);
}
function $_(e) {
	const t = Fe(e) ? new Array(e.length) : {};
	for (const r in e) {
		t[r] = ly(e, r);
	}
	return t;
}
class P_ {
	constructor(t, r, o) {
		(this._object = t),
			(this._key = r),
			(this._defaultValue = o),
			(this.__v_isRef = !0),
			(this._value = void 0);
	}
	get value() {
		const t = this._object[this._key];
		return (this._value = t === void 0 ? this._defaultValue : t);
	}
	set value(t) {
		this._object[this._key] = t;
	}
	get dep() {
		return d_(ht(this._object), this._key);
	}
}
class O_ {
	constructor(t) {
		(this._getter = t),
			(this.__v_isRef = !0),
			(this.__v_isReadonly = !0),
			(this._value = void 0);
	}
	get value() {
		return (this._value = this._getter());
	}
}
function Su(e, t, r) {
	return At(e)
		? e
		: Ke(e)
			? new O_(e)
			: _t(e) && arguments.length > 1
				? ly(e, t, r)
				: We(e);
}
function ly(e, t, r) {
	const o = e[t];
	return At(o) ? o : new P_(e, t, r);
}
class R_ {
	constructor(t, r, o) {
		(this.fn = t),
			(this.setter = r),
			(this._value = void 0),
			(this.dep = new wu(this)),
			(this.__v_isRef = !0),
			(this.deps = void 0),
			(this.depsTail = void 0),
			(this.flags = 16),
			(this.globalVersion = Ul - 1),
			(this.next = void 0),
			(this.effect = this),
			(this.__v_isReadonly = !r),
			(this.isSSR = o);
	}
	notify() {
		if (((this.flags |= 16), !(this.flags & 8) && kt !== this)) {
			return j0(this, !0), !0;
		}
	}
	get value() {
		const t = this.dep.track();
		return X0(this), t && (t.version = this.dep.version), this._value;
	}
	set value(t) {
		this.setter && this.setter(t);
	}
}
function D_(e, t, r = !1) {
	let o, s;
	return Ke(e) ? (o = e) : ((o = e.get), (s = e.set)), new R_(o, s, r);
}
const sc = {},
	Fc = new WeakMap();
let ko;
function z_(e, t = !1, r = ko) {
	if (r) {
		let o = Fc.get(r);
		o || Fc.set(r, (o = [])), o.push(e);
	}
}
function I_(e, t, r = vt) {
	const {
			immediate: o,
			deep: s,
			once: c,
			scheduler: f,
			augmentJob: d,
			call: h,
		} = r,
		p = (A) => (s ? A : (or(A) || s === !1 || s === 0 ? ui(A, 1) : ui(A)));
	let v,
		m,
		b,
		w,
		M = !1,
		C = !1;
	if (
		(At(e)
			? ((m = () => e.value), (M = or(e)))
			: ws(e)
				? ((m = () => p(e)), (M = !0))
				: Fe(e)
					? ((C = !0),
						(M = e.some((A) => ws(A) || or(A))),
						(m = () =>
							e.map((A) => {
								if (At(A)) {
									return A.value;
								}
								if (ws(A)) {
									return p(A);
								}
								if (Ke(A)) {
									return h ? h(A, 2) : A();
								}
							})))
					: Ke(e)
						? t
							? (m = h ? () => h(e, 2) : e)
							: (m = () => {
									if (b) {
										io();
										try {
											b();
										} finally {
											oo();
										}
									}
									const A = ko;
									ko = v;
									try {
										return h ? h(e, 3, [w]) : e(w);
									} finally {
										ko = A;
									}
								})
						: (m = Fr),
		t && s)
	) {
		const A = m,
			z = s === !0 ? 1 / 0 : s;
		m = () => ui(A(), z);
	}
	const E = W0(),
		L = () => {
			v.stop(), E && gh(E.effects, v);
		};
	if (c && t) {
		const A = t;
		t = (...z) => {
			A(...z), L();
		};
	}
	let N = C ? new Array(e.length).fill(sc) : sc;
	const P = (A) => {
		if (v.flags & 1 && (v.dirty || A)) {
			if (t) {
				const z = v.run();
				if (s || M || (C ? z.some((W, U) => In(W, N[U])) : In(z, N))) {
					b && b();
					const W = ko;
					ko = v;
					try {
						const U = [z, N === sc ? void 0 : (C && N[0] === sc ? [] : N), w];
						h ? h(t, 3, U) : t(...U), (N = z);
					} finally {
						ko = W;
					}
				}
			} else {
				v.run();
			}
		}
	};
	return (
		d && d(P),
		(v = new U0(m)),
		(v.scheduler = f ? () => f(P, !1) : P),
		(w = (A) => z_(A, !1, v)),
		(b = v.onStop =
			() => {
				const A = Fc.get(v);
				if (A) {
					if (h) {
						h(A, 4);
					} else {
						for (const z of A) {z();}
					}
					Fc.delete(v);
				}
			}),
		t ? (o ? P(!0) : (N = v.run())) : (f ? f(P.bind(null, !0), !0) : v.run()),
		(L.pause = v.pause.bind(v)),
		(L.resume = v.resume.bind(v)),
		(L.stop = L),
		L
	);
}
function ui(e, t = 1 / 0, r) {
	if (t <= 0 || !_t(e) || e.__v_skip || ((r = r || new Set()), r.has(e))) {
		return e;
	}
	if ((r.add(e), t--, At(e))) {
		ui(e.value, t, r);
	} else if (Fe(e)) {
		for (let o = 0; o < e.length; o++) {
			ui(e[o], t, r);
		}
	} else if (gu(e) || bs(e)) {
		e.forEach((o) => {
			ui(o, t, r);
		});
	} else if (D0(e)) {
		for (const o in e) {
			ui(e[o], t, r);
		}
		for (const o of Object.getOwnPropertySymbols(e)) {
			Object.prototype.propertyIsEnumerable.call(e, o) && ui(e[o], t, r);
		}
	}
	return e;
} /**
 * @vue/runtime-core v3.5.12
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 */

function pa(e, t, r, o) {
	try {
		return o ? e(...o) : e();
	} catch (error) {
		ga(error, t, r);
	}
}
function Cr(e, t, r, o) {
	if (Ke(e)) {
		const s = pa(e, t, r, o);
		return (
			s &&
				O0(s) &&
				s.catch((error) => {
					ga(error, t, r);
				}),
			s
		);
	}
	if (Fe(e)) {
		const s = [];
		for (let c = 0; c < e.length; c++) {
			s.push(Cr(e[c], t, r, o));
		}
		return s;
	}
}
function ga(e, t, r, o = !0) {
	const s = t ? t.vnode : undefined,
		{ errorHandler: c, throwUnhandledErrorInProduction: f } =
			(t && t.appContext.config) || vt;
	if (t) {
		let d = t.parent;
		const h = t.proxy,
			p = `https://vuejs.org/error-reference/#runtime-${r}`;
		while (d) {
			const v = d.ec;
			if (v) {
				for (let m = 0; m < v.length; m++) {
					if (v[m](e, h, p) === !1) {return;}
				}
			}
			d = d.parent;
		}
		if (c) {
			io(), pa(c, undefined, 10, [e, h, p]), oo();
			return;
		}
	}
	F_(e, r, s, o, f);
}
function F_(e, t, r, o = !0, s = !1) {
	if (s) {
		throw e;
	}
	console.error(e);
}
const Ln = [];
let zr = -1;
const xs = [];
let Hi,
	hs = 0;
const ay = Promise.resolve();
let Hc;
function un(e) {
	const t = Hc || ay;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function H_(e) {
	let t = zr + 1,
		r = Ln.length;
	while (t < r) {
		const o = (t + r) >>> 1,
			s = Ln[o],
			c = jl(s);
		c < e || (c === e && s.flags & 2) ? (t = o + 1) : (r = o);
	}
	return t;
}
function Th(e) {
	if (!(e.flags & 1)) {
		const t = jl(e),
			r = Ln[Ln.length - 1];
		!r || (!(e.flags & 2) && t >= jl(r)) ? Ln.push(e) : Ln.splice(H_(t), 0, e),
			(e.flags |= 1),
			cy();
	}
}
function cy() {
	Hc || (Hc = ay.then(fy));
}
function Sd(e) {
	Fe(e)
		? xs.push(...e)
		: (Hi && e.id === -1
			? Hi.splice(hs + 1, 0, e)
			: e.flags & 1 || (xs.push(e), (e.flags |= 1))),
		cy();
}
function vv(e, t, r = zr + 1) {
	for (; r < Ln.length; r++) {
		const o = Ln[r];
		if (o && o.flags & 2) {
			if (e && o.id !== e.uid) {
				continue;
			}
			Ln.splice(r, 1),
				r--,
				o.flags & 4 && (o.flags &= -2),
				o(),
				o.flags & 4 || (o.flags &= -2);
		}
	}
}
function uy(e) {
	if (xs.length > 0) {
		const t = [...new Set(xs)].sort((r, o) => jl(r) - jl(o));
		if (((xs.length = 0), Hi)) {
			Hi.push(...t);
			return;
		}
		for (Hi = t, hs = 0; hs < Hi.length; hs++) {
			const r = Hi[hs];
			r.flags & 4 && (r.flags &= -2), r.flags & 8 || r(), (r.flags &= -2);
		}
		(Hi = undefined), (hs = 0);
	}
}
const jl = (e) => (e.id == undefined ? (e.flags & 2 ? -1 : 1 / 0) : e.id);
function fy(e) {
	try {
		for (zr = 0; zr < Ln.length; zr++) {
			const t = Ln[zr];
			t &&
				!(t.flags & 8) &&
				(t.flags & 4 && (t.flags &= -2),
				pa(t, t.i, t.i ? 15 : 14),
				t.flags & 4 || (t.flags &= -2));
		}
	} finally {
		for (; zr < Ln.length; zr++) {
			const t = Ln[zr];
			t && (t.flags &= -2);
		}
		(zr = -1),
			(Ln.length = 0),
			uy(),
			(Hc = undefined),
			(Ln.length || xs.length) && fy();
	}
}
let en, _u;
function qc(e) {
	const t = en;
	return (en = e), (_u = (e && e.type.__scopeId) || undefined), t;
}
function dy(e) {
	_u = e;
}
function hy() {
	_u = undefined;
}
const py = (e) => ot;
function ot(e, t = en, r) {
	if (!t || e._n) {
		return e;
	}
	const o = (...s) => {
		o._d && Vc(-1);
		const c = qc(t);
		let f;
		try {
			f = e(...s);
		} finally {
			qc(c), o._d && Vc(1);
		}
		return f;
	};
	return (o._n = !0), (o._c = !0), (o._d = !0), o;
}
function mt(e, t) {
	if (en === null) {
		return e;
	}
	const r = Mu(en),
		o = e.dirs || (e.dirs = []);
	for (let s = 0; s < t.length; s++) {
		let [c, f, d, h = vt] = t[s];
		c &&
			(Ke(c) && (c = { mounted: c, updated: c }),
			c.deep && ui(f),
			o.push({
				dir: c,
				instance: r,
				value: f,
				oldValue: void 0,
				arg: d,
				modifiers: h,
			}));
	}
	return e;
}
function bo(e, t, r, o) {
	const s = e.dirs,
		c = t && t.dirs;
	for (let f = 0; f < s.length; f++) {
		const d = s[f];
		c && (d.oldValue = c[f].value);
		const h = d.dir[o];
		h && (io(), Cr(h, r, 8, [e.el, d, e, t]), oo());
	}
}
const q_ = Symbol("_vte"),
	gy = (e) => e.__isTeleport,
	qi = Symbol("_leaveCb"),
	lc = Symbol("_enterCb");
function B_() {
	const e = {
		isMounted: !1,
		isLeaving: !1,
		isUnmounting: !1,
		leavingVNodes: new Map(),
	};
	return (
		Bs(() => {
			e.isMounted = !0;
		}),
		_y(() => {
			e.isUnmounting = !0;
		}),
		e
	);
}
const nr = [Function, Array],
	vy = {
		mode: String,
		appear: Boolean,
		persisted: Boolean,
		onBeforeEnter: nr,
		onEnter: nr,
		onAfterEnter: nr,
		onEnterCancelled: nr,
		onBeforeLeave: nr,
		onLeave: nr,
		onAfterLeave: nr,
		onLeaveCancelled: nr,
		onBeforeAppear: nr,
		onAppear: nr,
		onAfterAppear: nr,
		onAppearCancelled: nr,
	},
	my = (e) => {
		const t = e.subTree;
		return t.component ? my(t.component) : t;
	},
	W_ = {
		name: "BaseTransition",
		props: vy,
		setup(e, { slots: t }) {
			const r = va(),
				o = B_();
			return () => {
				const s = t.default && wy(t.default(), !0);
				if (!(s && s.length > 0)) {
					return;
				}
				const c = yy(s),
					f = ht(e),
					{ mode: d } = f;
				if (o.isLeaving) {
					return Kf(c);
				}
				const h = mv(c);
				if (!h) {
					return Kf(c);
				}
				let p = _d(h, f, o, r, (b) => (p = b));
				h.type !== an && Gl(h, p);
				const v = r.subTree,
					m = v && mv(v);
				if (m && m.type !== an && !Ir(h, m) && my(r).type !== an) {
					const b = _d(m, f, o, r);
					if ((Gl(m, b), d === "out-in" && h.type !== an)) {
						return (
							(o.isLeaving = !0),
							(b.afterLeave = () => {
								(o.isLeaving = !1),
									r.job.flags & 8 || r.update(),
									delete b.afterLeave;
							}),
							Kf(c)
						);
					}
					d === "in-out" &&
						h.type !== an &&
						(b.delayLeave = (w, M, C) => {
							const E = by(o, m);
							(E[String(m.key)] = m),
								(w[qi] = () => {
									M(), (w[qi] = void 0), delete p.delayedLeave;
								}),
								(p.delayedLeave = C);
						});
				}
				return c;
			};
		},
	};
function yy(e) {
	let t = e[0];
	if (e.length > 1) {
		for (const r of e) {
			if (r.type !== an) {
				t = r;
				break;
			}
		}
	}
	return t;
}
const U_ = W_;
function by(e, t) {
	const { leavingVNodes: r } = e;
	let o = r.get(t.type);
	return o || ((o = Object.create(null)), r.set(t.type, o)), o;
}
function _d(e, t, r, o, s) {
	const {
			appear: c,
			mode: f,
			persisted: d = !1,
			onBeforeEnter: h,
			onEnter: p,
			onAfterEnter: v,
			onEnterCancelled: m,
			onBeforeLeave: b,
			onLeave: w,
			onAfterLeave: M,
			onLeaveCancelled: C,
			onBeforeAppear: E,
			onAppear: L,
			onAfterAppear: N,
			onAppearCancelled: P,
		} = t,
		A = String(e.key),
		z = by(r, e),
		W = (Q, G) => {
			Q && Cr(Q, o, 9, G);
		},
		U = (Q, G) => {
			const te = G[1];
			W(Q, G),
				Fe(Q) ? Q.every((Z) => Z.length <= 1) && te() : Q.length <= 1 && te();
		},
		re = {
			mode: f,
			persisted: d,
			beforeEnter(Q) {
				let G = h;
				if (!r.isMounted) {
					if (c) {
						G = E || h;
					} else {
						return;
					}
				}
				Q[qi] && Q[qi](!0);
				const te = z[A];
				te && Ir(e, te) && te.el[qi] && te.el[qi](), W(G, [Q]);
			},
			enter(Q) {
				let G = p,
					te = v,
					Z = m;
				if (!r.isMounted) {
					if (c) {
						(G = L || p), (te = N || v), (Z = P || m);
					} else {
						return;
					}
				}
				let q = !1;
				const F = (Q[lc] = (k) => {
					q ||
						((q = !0),
						k ? W(Z, [Q]) : W(te, [Q]),
						re.delayedLeave && re.delayedLeave(),
						(Q[lc] = void 0));
				});
				G ? U(G, [Q, F]) : F();
			},
			leave(Q, G) {
				const te = String(e.key);
				if ((Q[lc] && Q[lc](!0), r.isUnmounting)) {
					return G();
				}
				W(b, [Q]);
				let Z = !1;
				const q = (Q[qi] = (F) => {
					Z ||
						((Z = !0),
						G(),
						F ? W(C, [Q]) : W(M, [Q]),
						(Q[qi] = void 0),
						z[te] === e && delete z[te]);
				});
				(z[te] = e), w ? U(w, [Q, q]) : q();
			},
			clone(Q) {
				const G = _d(Q, t, r, o, s);
				return s && s(G), G;
			},
		};
	return re;
}
function Kf(e) {
	if (ku(e)) {
		return (e = Ji(e)), (e.children = undefined), e;
	}
}
function mv(e) {
	if (!ku(e)) {
		return gy(e.type) && e.children ? yy(e.children) : e;
	}
	const { shapeFlag: t, children: r } = e;
	if (r) {
		if (t & 16) {
			return r[0];
		}
		if (t & 32 && Ke(r.default)) {
			return r.default();
		}
	}
}
function Gl(e, t) {
	e.shapeFlag & 6 && e.component
		? ((e.transition = t), Gl(e.component.subTree, t))
		: (e.shapeFlag & 128
			? ((e.ssContent.transition = t.clone(e.ssContent)),
				(e.ssFallback.transition = t.clone(e.ssFallback)))
			: (e.transition = t));
}
function wy(e, t = !1, r) {
	let o = [],
		s = 0;
	for (let c = 0; c < e.length; c++) {
		const f = e[c];
		const d =
			r == undefined
				? f.key
				: String(r) + String(f.key != undefined ? f.key : c);
		f.type === ct
			? (f.patchFlag & 128 && s++, (o = o.concat(wy(f.children, t, d))))
			: (t || f.type !== an) && o.push(d != undefined ? Ji(f, { key: d }) : f);
	}
	if (s > 1) {
		for (let c = 0; c < o.length; c++) {
			o[c].patchFlag = -2;
		}
	}
	return o;
} /*! #__NO_SIDE_EFFECTS__ */
function ut(e, t) {
	return Ke(e) ? Wt({ name: e.name }, t, { setup: e }) : e;
}
function xy(e) {
	e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function kd(e, t, r, o, s = !1) {
	if (Fe(e)) {
		e.forEach((M, C) => kd(M, t && (Fe(t) ? t[C] : t), r, o, s));
		return;
	}
	if (Ss(o) && !s) {
		return;
	}
	const c = o.shapeFlag & 4 ? Mu(o.component) : o.el,
		f = s ? undefined : c,
		{ i: d, r: h } = e,
		p = t && t.r,
		v = d.refs === vt ? (d.refs = {}) : d.refs,
		m = d.setupState,
		b = ht(m),
		w = m === vt ? () => !1 : (M) => bt(b, M);
	if (
		(p != undefined &&
			p !== h &&
			(Ot(p)
				? ((v[p] = undefined), w(p) && (m[p] = undefined))
				: At(p) && (p.value = undefined)),
		Ke(h))
	) {
		pa(h, d, 12, [f, v]);
	} else {
		const M = Ot(h),
			C = At(h);
		if (M || C) {
			const E = () => {
				if (e.f) {
					const L = M ? (w(h) ? m[h] : v[h]) : h.value;
					s
						? Fe(L) && gh(L, c)
						: Fe(L)
							? L.includes(c) || L.push(c)
							: M
								? ((v[h] = [c]), w(h) && (m[h] = v[h]))
								: ((h.value = [c]), e.k && (v[e.k] = h.value));
				} else {
					M
						? ((v[h] = f), w(h) && (m[h] = f))
						: C && ((h.value = f), e.k && (v[e.k] = f));
				}
			};
			f ? ((E.id = -1), Gn(E, r)) : E();
		}
	}
}
yu().requestIdleCallback;
yu().cancelIdleCallback;
const Ss = (e) => !!e.type.__asyncLoader,
	ku = (e) => e.type.__isKeepAlive;
function V_(e, t) {
	Sy(e, "a", t);
}
function j_(e, t) {
	Sy(e, "da", t);
}
function Sy(e, t, r = cn) {
	const o =
		e.__wdc ||
		(e.__wdc = () => {
			let s = r;
			while (s) {
				if (s.isDeactivated) {
					return;
				}
				s = s.parent;
			}
			return e();
		});
	if ((Tu(t, o, r), r)) {
		let s = r.parent;
		while (s && s.parent) {
			ku(s.parent.vnode) && G_(o, t, r, s), (s = s.parent);
		}
	}
}
function G_(e, t, r, o) {
	const s = Tu(t, e, o, !0);
	Cu(() => {
		gh(o[t], s);
	}, r);
}
function Tu(e, t, r = cn, o = !1) {
	if (r) {
		const s = r[e] || (r[e] = []),
			c =
				t.__weh ||
				(t.__weh = (...f) => {
					io();
					const d = ma(r),
						h = Cr(t, r, e, f);
					return d(), oo(), h;
				});
		return o ? s.unshift(c) : s.push(c), c;
	}
}
const bi =
		(e) =>
		(t, r = cn) => {
			(!Xl || e === "sp") && Tu(e, (...o) => t(...o), r);
		},
	K_ = bi("bm"),
	Bs = bi("m"),
	X_ = bi("bu"),
	Y_ = bi("u"),
	_y = bi("bum"),
	Cu = bi("um"),
	Z_ = bi("sp"),
	J_ = bi("rtg"),
	Q_ = bi("rtc");
function ek(e, t = cn) {
	Tu("ec", e, t);
}
const Ch = "components",
	tk = "directives";
function Po(e, t) {
	return Eh(Ch, e, !0, t) || e;
}
const ky = Symbol.for("v-ndc");
function yv(e) {
	return Ot(e) ? Eh(Ch, e, !1) || e : e || ky;
}
function Gr(e) {
	return Eh(tk, e);
}
function Eh(e, t, r = !0, o = !1) {
	const s = en || cn;
	if (s) {
		const c = s.type;
		if (e === Ch) {
			const d = Gk(c, !1);
			if (d && (d === t || d === Jn(t) || d === mu(Jn(t)))) {
				return c;
			}
		}
		const f = bv(s[e] || c[e], t) || bv(s.appContext[e], t);
		return !f && o ? c : f;
	}
}
function bv(e, t) {
	return e && (e[t] || e[Jn(t)] || e[mu(Jn(t))]);
}
function gi(e, t, r, o) {
	let s;
	const c = r,
		f = Fe(e);
	if (f || Ot(e)) {
		const d = f && ws(e);
		let h = !1;
		d && ((h = !or(e)), (e = xu(e))), (s = new Array(e.length));
		for (let p = 0, v = e.length; p < v; p++) {
			s[p] = t(h ? pn(e[p]) : e[p], p, void 0, c);
		}
	} else if (typeof e === "number") {
		s = new Array(e);
		for (let d = 0; d < e; d++) {
			s[d] = t(d + 1, d, void 0, c);
		}
	} else if (_t(e)) {
		if (e[Symbol.iterator]) {
			s = Array.from(e, (d, h) => t(d, h, void 0, c));
		} else {
			const d = Object.keys(e);
			s = new Array(d.length);
			for (let h = 0, p = d.length; h < p; h++) {
				const v = d[h];
				s[h] = t(e[v], v, h, c);
			}
		}
	} else {
		s = [];
	}
	return s;
}
function nk(e, t) {
	for (let r = 0; r < t.length; r++) {
		const o = t[r];
		if (Fe(o)) {
			for (let s = 0; s < o.length; s++) {
				e[o[s].name] = o[s].fn;
			}
		} else {
			o &&
				(e[o.name] = o.key
					? (...s) => {
							const c = o.fn(...s);
							return c && (c.key = o.key), c;
						}
					: o.fn);
		}
	}
	return e;
}
function vn(e, t, r = {}, o, s) {
	if (en.ce || (en.parent && Ss(en.parent) && en.parent.ce)) {
		return (
			t !== "default" && (r.name = t),
			oe(),
			rt(ct, undefined, [Pe("slot", r, o && o())], 64)
		);
	}
	const c = e[t];
	c && c._c && (c._d = !1), oe();
	const f = c && Ty(c(r)),
		d = r.key || (f && f.key),
		h = rt(
			ct,
			{ key: (d && !Tr(d) ? d : `_${t}`) + (!f && o ? "_fb" : "") },
			f || (o ? o() : []),
			f && e._ === 1 ? 64 : -2,
		);
	return (
		h.scopeId && (h.slotScopeIds = [h.scopeId + "-s"]),
		c && c._c && (c._d = !0),
		h
	);
}
function Ty(e) {
	return e.some((t) =>
		$s(t) ? !(t.type === an || (t.type === ct && !Ty(t.children))) : !0,
	)
		? e
		: undefined;
}
function rk(e, t) {
	const r = {};
	for (const o in e) {
		r[Sc(o)] = e[o];
	}
	return r;
}
const Td = (e) => (e ? (Xy(e) ? Mu(e) : Td(e.parent)) : undefined),
	Ol = Wt(Object.create(null), {
		$: (e) => e,
		$el: (e) => e.vnode.el,
		$data: (e) => e.data,
		$props: (e) => e.props,
		$attrs: (e) => e.attrs,
		$slots: (e) => e.slots,
		$refs: (e) => e.refs,
		$parent: (e) => Td(e.parent),
		$root: (e) => Td(e.root),
		$host: (e) => e.ce,
		$emit: (e) => e.emit,
		$options: (e) => Lh(e),
		$forceUpdate: (e) =>
			e.f ||
			(e.f = () => {
				Th(e.update);
			}),
		$nextTick: (e) => e.n || (e.n = un.bind(e.proxy)),
		$watch: (e) => Ek.bind(e),
	}),
	Xf = (e, t) => e !== vt && !e.__isScriptSetup && bt(e, t),
	ik = {
		get({ _: e }, t) {
			if (t === "__v_skip") {
				return !0;
			}
			const {
				ctx: r,
				setupState: o,
				data: s,
				props: c,
				accessCache: f,
				type: d,
				appContext: h,
			} = e;
			let p;
			if (t[0] !== "$") {
				const w = f[t];
				if (w !== void 0) {
					switch (w) {
						case 1: {
							return o[t];
						}
						case 2: {
							return s[t];
						}
						case 4: {
							return r[t];
						}
						case 3: {
							return c[t];
						}
					}
				}

				if (Xf(o, t)) {
					return (f[t] = 1), o[t];
				}
				if (s !== vt && bt(s, t)) {
					return (f[t] = 2), s[t];
				}
				if ((p = e.propsOptions[0]) && bt(p, t)) {
					return (f[t] = 3), c[t];
				}
				if (r !== vt && bt(r, t)) {
					return (f[t] = 4), r[t];
				}
				Cd && (f[t] = 0);
			}
			const v = Ol[t];
			let m, b;
			if (v) {
				return t === "$attrs" && hn(e.attrs, "get", ""), v(e);
			}
			if ((m = d.__cssModules) && (m = m[t])) {
				return m;
			}
			if (r !== vt && bt(r, t)) {
				return (f[t] = 4), r[t];
			}
			if (((b = h.config.globalProperties), bt(b, t))) {
				return b[t];
			}
		},
		set({ _: e }, t, r) {
			const { data: o, setupState: s, ctx: c } = e;
			return Xf(s, t)
				? ((s[t] = r), !0)
				: o !== vt && bt(o, t)
					? ((o[t] = r), !0)
					: bt(e.props, t) || (t[0] === "$" && t.slice(1) in e)
						? !1
						: ((c[t] = r), !0);
		},
		has(
			{
				_: {
					data: e,
					setupState: t,
					accessCache: r,
					ctx: o,
					appContext: s,
					propsOptions: c,
				},
			},
			f,
		) {
			let d;
			return (
				!!r[f] ||
				(e !== vt && bt(e, f)) ||
				Xf(t, f) ||
				((d = c[0]) && bt(d, f)) ||
				bt(o, f) ||
				bt(Ol, f) ||
				bt(s.config.globalProperties, f)
			);
		},
		defineProperty(e, t, r) {
			return (
				r.get != undefined
					? (e._.accessCache[t] = 0)
					: bt(r, "value") && this.set(e, t, r.value, undefined),
				Reflect.defineProperty(e, t, r)
			);
		},
	};
function ok() {
	return sk().attrs;
}
function sk() {
	const e = va();
	return e.setupContext || (e.setupContext = Zy(e));
}
function Bc(e) {
	return Fe(e) ? e.reduce((t, r) => ((t[r] = undefined), t), {}) : e;
}
function Wc(e, t) {
	return e && t
		? (Fe(e) && Fe(t)
			? e.concat(t)
			: Wt({}, Bc(e), Bc(t)))
		: e || t;
}
let Cd = !0;
function lk(e) {
	const t = Lh(e),
		r = e.proxy,
		o = e.ctx;
	(Cd = !1), t.beforeCreate && wv(t.beforeCreate, e, "bc");
	const {
		data: s,
		computed: c,
		methods: f,
		watch: d,
		provide: h,
		inject: p,
		created: v,
		beforeMount: m,
		mounted: b,
		beforeUpdate: w,
		updated: M,
		activated: C,
		deactivated: E,
		beforeDestroy: L,
		beforeUnmount: N,
		destroyed: P,
		unmounted: A,
		render: z,
		renderTracked: W,
		renderTriggered: U,
		errorCaptured: re,
		serverPrefetch: Q,
		expose: G,
		inheritAttrs: te,
		components: Z,
		directives: q,
		filters: F,
	} = t;
	if ((p && ak(p, o), f)) {
		for (const V in f) {
			const ie = f[V];
			Ke(ie) && (o[V] = ie.bind(r));
		}
	}
	if (s) {
		const V = s.call(r, r);
		_t(V) && (e.data = Zn(V));
	}
	if (((Cd = !0), c)) {
		for (const V in c) {
			const ie = c[V],
				ye = Ke(ie) ? ie.bind(r, r) : (Ke(ie.get) ? ie.get.bind(r, r) : Fr),
				Ne = !Ke(ie) && Ke(ie.set) ? ie.set.bind(r) : Fr,
				Ue = Te({ get: ye, set: Ne });
			Object.defineProperty(o, V, {
				enumerable: !0,
				configurable: !0,
				get: () => Ue.value,
				set: (je) => (Ue.value = je),
			});
		}
	}
	if (d) {
		for (const V in d) {
			Cy(d[V], o, r, V);
		}
	}
	if (h) {
		const V = Ke(h) ? h.call(r) : h;
		Reflect.ownKeys(V).forEach((ie) => {
			kc(ie, V[ie]);
		});
	}
	v && wv(v, e, "c");
	function B(V, ie) {
		Fe(ie) ? ie.forEach((ye) => V(ye.bind(r))) : ie && V(ie.bind(r));
	}
	if (
		(B(K_, m),
		B(Bs, b),
		B(X_, w),
		B(Y_, M),
		B(V_, C),
		B(j_, E),
		B(ek, re),
		B(Q_, W),
		B(J_, U),
		B(_y, N),
		B(Cu, A),
		B(Z_, Q),
		Fe(G))
	) {
		if (G.length > 0) {
			const V = e.exposed || (e.exposed = {});
			G.forEach((ie) => {
				Object.defineProperty(V, ie, {
					get: () => r[ie],
					set: (ye) => (r[ie] = ye),
				});
			});
		} else {
			e.exposed || (e.exposed = {});
		}
	}
	z && e.render === Fr && (e.render = z),
		te != undefined && (e.inheritAttrs = te),
		Z && (e.components = Z),
		q && (e.directives = q),
		Q && xy(e);
}
function ak(e, t, r = Fr) {
	Fe(e) && (e = Ed(e));
	for (const o in e) {
		const s = e[o];
		let c;
		_t(s)
			? ("default" in s
				? (c = di(s.from || o, s.default, !0))
				: (c = di(s.from || o)))
			: (c = di(s)),
			At(c)
				? Object.defineProperty(t, o, {
						enumerable: !0,
						configurable: !0,
						get: () => c.value,
						set: (f) => (c.value = f),
					})
				: (t[o] = c);
	}
}
function wv(e, t, r) {
	Cr(Fe(e) ? e.map((o) => o.bind(t.proxy)) : e.bind(t.proxy), t, r);
}
function Cy(e, t, r, o) {
	const s = o.includes(".") ? Fy(r, o) : () => r[o];
	if (Ot(e)) {
		const c = t[e];
		Ke(c) && Bt(s, c);
	} else if (Ke(e)) {
		Bt(s, e.bind(r));
	} else if (_t(e)) {
		if (Fe(e)) {
			e.forEach((c) => Cy(c, t, r, o));
		} else {
			const c = Ke(e.handler) ? e.handler.bind(r) : t[e.handler];
			Ke(c) && Bt(s, c, e);
		}
	}
}
function Lh(e) {
	const t = e.type,
		{ mixins: r, extends: o } = t,
		{
			mixins: s,
			optionsCache: c,
			config: { optionMergeStrategies: f },
		} = e.appContext,
		d = c.get(t);
	let h;
	return (
		d
			? (h = d)
			: (s.length > 0 || r || o
				? ((h = {}), s.length && s.forEach((p) => Uc(h, p, f, !0)), Uc(h, t, f))
				: (h = t)),
		_t(t) && c.set(t, h),
		h
	);
}
function Uc(e, t, r, o = !1) {
	const { mixins: s, extends: c } = t;
	c && Uc(e, c, r, !0), s && s.forEach((f) => Uc(e, f, r, !0));
	for (const f in t) {
		if (!(o && f === "expose")) {
			const d = ck[f] || (r && r[f]);
			e[f] = d ? d(e[f], t[f]) : t[f];
		}
	}
	return e;
}
const ck = {
	data: xv,
	props: Sv,
	emits: Sv,
	methods: Ll,
	computed: Ll,
	beforeCreate: Tn,
	created: Tn,
	beforeMount: Tn,
	mounted: Tn,
	beforeUpdate: Tn,
	updated: Tn,
	beforeDestroy: Tn,
	beforeUnmount: Tn,
	destroyed: Tn,
	unmounted: Tn,
	activated: Tn,
	deactivated: Tn,
	errorCaptured: Tn,
	serverPrefetch: Tn,
	components: Ll,
	directives: Ll,
	watch: fk,
	provide: xv,
	inject: uk,
};
function xv(e, t) {
	return t
		? (e
			? function () {
					return Wt(
						Ke(e) ? e.call(this, this) : e,
						Ke(t) ? t.call(this, this) : t,
					);
				}
			: t)
		: e;
}
function uk(e, t) {
	return Ll(Ed(e), Ed(t));
}
function Ed(e) {
	if (Fe(e)) {
		const t = {};
		for (let r = 0; r < e.length; r++) {
			t[e[r]] = e[r];
		}
		return t;
	}
	return e;
}
function Tn(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Ll(e, t) {
	return e ? Wt(Object.create(null), e, t) : t;
}
function Sv(e, t) {
	return e
		? (Fe(e) && Fe(t)
			? [...new Set([...e, ...t])]
			: Wt(Object.create(null), Bc(e), Bc(t ?? {})))
		: t;
}
function fk(e, t) {
	if (!e) {
		return t;
	}
	if (!t) {
		return e;
	}
	const r = Wt(Object.create(null), e);
	for (const o in t) {
		r[o] = Tn(e[o], t[o]);
	}
	return r;
}
function Ey() {
	return {
		app: undefined,
		config: {
			isNativeTag: XS,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {},
		},
		mixins: [],
		components: {},
		directives: {},
		provides: Object.create(null),
		optionsCache: new WeakMap(),
		propsCache: new WeakMap(),
		emitsCache: new WeakMap(),
	};
}
let dk = 0;
function hk(e, t) {
	return (o, s) => {
		Ke(o) || (o = Wt({}, o)), s != undefined && !_t(s) && (s = undefined);
		const c = Ey(),
			f = new WeakSet(),
			d = [];
		let h = !1;
		const p = (c.app = {
			_uid: dk++,
			_component: o,
			_props: s,
			_container: undefined,
			_context: c,
			_instance: undefined,
			version: Xk,
			get config() {
				return c.config;
			},
			set config(v) {},
			use(v, ...m) {
				return (
					f.has(v) ||
						(v && Ke(v.install)
							? (f.add(v), v.install(p, ...m))
							: Ke(v) && (f.add(v), v(p, ...m))),
					p
				);
			},
			mixin(v) {
				return c.mixins.includes(v) || c.mixins.push(v), p;
			},
			component(v, m) {
				return m ? ((c.components[v] = m), p) : c.components[v];
			},
			directive(v, m) {
				return m ? ((c.directives[v] = m), p) : c.directives[v];
			},
			mount(v, m, b) {
				if (!h) {
					const w = p._ceVNode || Pe(o, s);
					return (
						(w.appContext = c),
						b === !0 ? (b = "svg") : b === !1 && (b = void 0),
						m && t ? t(w, v) : e(w, v, b),
						(h = !0),
						(p._container = v),
						(v.__vue_app__ = p),
						Mu(w.component)
					);
				}
			},
			onUnmount(v) {
				d.push(v);
			},
			unmount() {
				h &&
					(Cr(d, p._instance, 16),
					e(undefined, p._container),
					delete p._container.__vue_app__);
			},
			provide(v, m) {
				return (c.provides[v] = m), p;
			},
			runWithContext(v) {
				const m = _s;
				_s = p;
				try {
					return v();
				} finally {
					_s = m;
				}
			},
		});
		return p;
	};
}
let _s;
function kc(e, t) {
	if (cn) {
		let r = cn.provides;
		const o = cn.parent && cn.parent.provides;
		o === r && (r = cn.provides = Object.create(o)), (r[e] = t);
	}
}
function di(e, t, r = !1) {
	const o = cn || en;
	if (o || _s) {
		const s = _s
			? _s._context.provides
			: o
				? o.parent == undefined
					? o.vnode.appContext && o.vnode.appContext.provides
					: o.parent.provides
				: void 0;
		if (s && e in s) {
			return s[e];
		}
		if (arguments.length > 1) {
			return r && Ke(t) ? t.call(o && o.proxy) : t;
		}
	}
}
const Ly = {},
	Ay = () => Object.create(Ly),
	My = (e) => Object.getPrototypeOf(e) === Ly;
function pk(e, t, r, o = !1) {
	const s = {},
		c = Ay();
	(e.propsDefaults = Object.create(null)), Ny(e, t, s, c);
	for (const f in e.propsOptions[0]) {
		f in s || (s[f] = void 0);
	}
	r ? (e.props = o ? s : xh(s)) : (e.type.props ? (e.props = s) : (e.props = c)),
		(e.attrs = c);
}
function gk(e, t, r, o) {
	const {
			props: s,
			attrs: c,
			vnode: { patchFlag: f },
		} = e,
		d = ht(s),
		[h] = e.propsOptions;
	let p = !1;
	if ((o || f > 0) && !(f & 16)) {
		if (f & 8) {
			const v = e.vnode.dynamicProps;
			for (let m = 0; m < v.length; m++) {
				const b = v[m];
				if (Lu(e.emitsOptions, b)) {
					continue;
				}
				const w = t[b];
				if (h) {
					if (bt(c, b)) {
						w !== c[b] && ((c[b] = w), (p = !0));
					} else {
						const M = Jn(b);
						s[M] = Ld(h, d, M, w, e, !1);
					}
				} else {
					w !== c[b] && ((c[b] = w), (p = !0));
				}
			}
		}
	} else {
		Ny(e, t, s, c) && (p = !0);
		let v;
		for (const m in d) {
			(!t || (!bt(t, m) && ((v = yi(m)) === m || !bt(t, v)))) &&
				(h
					? r &&
						(r[m] !== void 0 || r[v] !== void 0) &&
						(s[m] = Ld(h, d, m, void 0, e, !0))
					: delete s[m]);
		}
		if (c !== d) {
			for (const m in c) {
				!(t && bt(t, m)) && (delete c[m], (p = !0));
			}
		}
	}
	p && ci(e.attrs, "set", "");
}
function Ny(e, t, r, o) {
	const [s, c] = e.propsOptions;
	let f = !1,
		d;
	if (t) {
		for (const h in t) {
			if (Nl(h)) {
				continue;
			}
			const p = t[h];
			let v;
			s && bt(s, (v = Jn(h)))
				? (c && c.includes(v)
					? ((d || (d = {}))[v] = p)
					: (r[v] = p))
				: Lu(e.emitsOptions, h) ||
					((!(h in o) || p !== o[h]) && ((o[h] = p), (f = !0)));
		}
	}
	if (c) {
		const h = ht(r),
			p = d || vt;
		for (let v = 0; v < c.length; v++) {
			const m = c[v];
			r[m] = Ld(s, h, m, p[m], e, !bt(p, m));
		}
	}
	return f;
}
function Ld(e, t, r, o, s, c) {
	const f = e[r];
	if (f != undefined) {
		const d = bt(f, "default");
		if (d && o === void 0) {
			const h = f.default;
			if (f.type !== Function && !f.skipFactory && Ke(h)) {
				const { propsDefaults: p } = s;
				if (r in p) {
					o = p[r];
				} else {
					const v = ma(s);
					(o = p[r] = h.call(undefined, t)), v();
				}
			} else {
				o = h;
			}
			s.ce && s.ce._setProp(r, o);
		}
		f[0] &&
			(c && !d ? (o = !1) : f[1] && (o === "" || o === yi(r)) && (o = !0));
	}
	return o;
}
const vk = new WeakMap();
function $y(e, t, r = !1) {
	const o = r ? vk : t.propsCache,
		s = o.get(e);
	if (s) {
		return s;
	}
	const c = e.props,
		f = {},
		d = [];
	let h = !1;
	if (!Ke(e)) {
		const v = (m) => {
			h = !0;
			const [b, w] = $y(m, t, !0);
			Wt(f, b), w && d.push(...w);
		};
		!r && t.mixins.length && t.mixins.forEach(v),
			e.extends && v(e.extends),
			e.mixins && e.mixins.forEach(v);
	}
	if (!(c || h)) {
		return _t(e) && o.set(e, ys), ys;
	}
	if (Fe(c)) {
		for (let v = 0; v < c.length; v++) {
			const m = Jn(c[v]);
			_v(m) && (f[m] = vt);
		}
	} else if (c) {
		for (const v in c) {
			const m = Jn(v);
			if (_v(m)) {
				const b = c[v],
					w = (f[m] = Fe(b) || Ke(b) ? { type: b } : Wt({}, b)),
					M = w.type;
				let C = !1,
					E = !0;
				if (Fe(M)) {
					for (let L = 0; L < M.length; ++L) {
						const N = M[L],
							P = Ke(N) && N.name;
						if (P === "Boolean") {
							C = !0;
							break;
						}
						P === "String" && (E = !1);
					}
				} else {
					C = Ke(M) && M.name === "Boolean";
				}
				(w[0] = C), (w[1] = E), (C || bt(w, "default")) && d.push(m);
			}
		}
	}
	const p = [f, d];
	return _t(e) && o.set(e, p), p;
}
function _v(e) {
	return e[0] !== "$" && !Nl(e);
}
const Py = (e) => e[0] === "_" || e === "$stable",
	Ah = (e) => (Fe(e) ? e.map(wr) : [wr(e)]),
	mk = (e, t, r) => {
		if (t._n) {
			return t;
		}
		const o = ot((...s) => Ah(t(...s)), r);
		return (o._c = !1), o;
	},
	Oy = (e, t, r) => {
		const o = e._ctx;
		for (const s in e) {
			if (Py(s)) {
				continue;
			}
			const c = e[s];
			if (Ke(c)) {
				t[s] = mk(s, c, o);
			} else if (c != undefined) {
				const f = Ah(c);
				t[s] = () => f;
			}
		}
	},
	Ry = (e, t) => {
		const r = Ah(t);
		e.slots.default = () => r;
	},
	Dy = (e, t, r) => {
		for (const o in t) {
			(r || o !== "_") && (e[o] = t[o]);
		}
	},
	yk = (e, t, r) => {
		const o = (e.slots = Ay());
		if (e.vnode.shapeFlag & 32) {
			const s = t._;
			s ? (Dy(o, t, r), r && z0(o, "_", s, !0)) : Oy(t, o);
		} else {
			t && Ry(e, t);
		}
	},
	bk = (e, t, r) => {
		const { vnode: o, slots: s } = e;
		let c = !0,
			f = vt;
		if (o.shapeFlag & 32) {
			const d = t._;
			d
				? (r && d === 1
					? (c = !1)
					: Dy(s, t, r))
				: ((c = !t.$stable), Oy(t, s)),
				(f = t);
		} else {
			t && (Ry(e, t), (f = { default: 1 }));
		}
		if (c) {
			for (const d in s) {
				!Py(d) && f[d] == undefined && delete s[d];
			}
		}
	},
	Gn = Ik;
function wk(e) {
	return xk(e);
}
function xk(e, t) {
	const r = yu();
	r.__VUE__ = !0;
	const {
			insert: o,
			remove: s,
			patchProp: c,
			createElement: f,
			createText: d,
			createComment: h,
			setText: p,
			setElementText: v,
			parentNode: m,
			nextSibling: b,
			setScopeId: w = Fr,
			insertStaticContent: M,
		} = e,
		C = (
			O,
			H,
			J,
			fe,
			le,
			he,
			_e = void 0,
			ue,
			be = !!H.dynamicChildren,
		) => {
			if (O === H) {
				return;
			}
			O && !Ir(O, H) && ((fe = X(O)), je(O, le, he, !0), (O = undefined)),
				H.patchFlag === -2 && ((be = !1), (H.dynamicChildren = undefined));
			const { type: ve, ref: qe, shapeFlag: Le } = H;
			switch (ve) {
				case Au: {
					E(O, H, J, fe);
					break;
				}
				case an: {
					L(O, H, J, fe);
					break;
				}
				case Jf: {
					O == undefined && N(H, J, fe, _e);
					break;
				}
				case ct: {
					Z(O, H, J, fe, le, he, _e, ue, be);
					break;
				}
				default: {
					Le & 1
						? z(O, H, J, fe, le, he, _e, ue, be)
						: (Le & 6
							? q(O, H, J, fe, le, he, _e, ue, be)
							: (Le & 64 || Le & 128) &&
								ve.process(O, H, J, fe, le, he, _e, ue, be, $e));
				}
			}
			qe != undefined && le && kd(qe, O && O.ref, he, H || O, !H);
		},
		E = (O, H, J, fe) => {
			if (O == undefined) {
				o((H.el = d(H.children)), J, fe);
			} else {
				const le = (H.el = O.el);
				H.children !== O.children && p(le, H.children);
			}
		},
		L = (O, H, J, fe) => {
			O == undefined ? o((H.el = h(H.children || "")), J, fe) : (H.el = O.el);
		},
		N = (O, H, J, fe) => {
			[O.el, O.anchor] = M(O.children, H, J, fe, O.el, O.anchor);
		},
		P = ({ el: O, anchor: H }, J, fe) => {
			let le;
			while (O && O !== H) {
				(le = b(O)), o(O, J, fe), (O = le);
			}
			o(H, J, fe);
		},
		A = ({ el: O, anchor: H }) => {
			let J;
			while (O && O !== H) {
				(J = b(O)), s(O), (O = J);
			}
			s(H);
		},
		z = (O, H, J, fe, le, he, _e, ue, be) => {
			H.type === "svg" ? (_e = "svg") : H.type === "math" && (_e = "mathml"),
				O == undefined
					? W(H, J, fe, le, he, _e, ue, be)
					: Q(O, H, le, he, _e, ue, be);
		},
		W = (O, H, J, fe, le, he, _e, ue) => {
			let be, ve;
			const { props: qe, shapeFlag: Le, transition: De, dirs: Be } = O;
			if (
				((be = O.el = f(O.type, he, qe && qe.is, qe)),
				Le & 8
					? v(be, O.children)
					: Le & 16 && re(O.children, be, undefined, fe, le, Yf(O, he), _e, ue),
				Be && bo(O, undefined, fe, "created"),
				U(be, O, O.scopeId, _e, fe),
				qe)
			) {
				for (const gt in qe) {
					gt !== "value" && !Nl(gt) && c(be, gt, undefined, qe[gt], he, fe);
				}
				"value" in qe && c(be, "value", undefined, qe.value, he),
					(ve = qe.onVnodeBeforeMount) && Rr(ve, fe, O);
			}
			Be && bo(O, undefined, fe, "beforeMount");
			const Xe = Sk(le, De);
			Xe && De.beforeEnter(be),
				o(be, H, J),
				((ve = qe && qe.onVnodeMounted) || Xe || Be) &&
					Gn(() => {
						ve && Rr(ve, fe, O),
							Xe && De.enter(be),
							Be && bo(O, undefined, fe, "mounted");
					}, le);
		},
		U = (O, H, J, fe, le) => {
			if ((J && w(O, J), fe)) {
				for (let he = 0; he < fe.length; he++) {
					w(O, fe[he]);
				}
			}
			if (le) {
				const he = le.subTree;
				if (
					H === he ||
					(By(he.type) && (he.ssContent === H || he.ssFallback === H))
				) {
					const _e = le.vnode;
					U(O, _e, _e.scopeId, _e.slotScopeIds, le.parent);
				}
			}
		},
		re = (O, H, J, fe, le, he, _e, ue, be = 0) => {
			for (let ve = be; ve < O.length; ve++) {
				const qe = (O[ve] = ue ? Bi(O[ve]) : wr(O[ve]));
				C(undefined, qe, H, J, fe, le, he, _e, ue);
			}
		},
		Q = (O, H, J, fe, le, he, _e) => {
			const ue = (H.el = O.el);
			let { patchFlag: be, dynamicChildren: ve, dirs: qe } = H;
			be |= O.patchFlag & 16;
			const Le = O.props || vt,
				De = H.props || vt;
			let Be;
			if (
				(J && wo(J, !1),
				(Be = De.onVnodeBeforeUpdate) && Rr(Be, J, H, O),
				qe && bo(H, O, J, "beforeUpdate"),
				J && wo(J, !0),
				((Le.innerHTML && De.innerHTML == undefined) ||
					(Le.textContent && De.textContent == undefined)) &&
					v(ue, ""),
				ve
					? G(O.dynamicChildren, ve, ue, J, fe, Yf(H, le), he)
					: _e || ie(O, H, ue, undefined, J, fe, Yf(H, le), he, !1),
				be > 0)
			) {
				if (be & 16) {
					te(ue, Le, De, J, le);
				} else if (
					(be & 2 &&
						Le.class !== De.class &&
						c(ue, "class", undefined, De.class, le),
					be & 4 && c(ue, "style", Le.style, De.style, le),
					be & 8)
				) {
					const Xe = H.dynamicProps;
					for (let gt = 0; gt < Xe.length; gt++) {
						const nt = Xe[gt],
							lt = Le[nt],
							Tt = De[nt];
						(Tt !== lt || nt === "value") && c(ue, nt, lt, Tt, le, J);
					}
				}
				be & 1 && O.children !== H.children && v(ue, H.children);
			} else {
				!_e && ve == undefined && te(ue, Le, De, J, le);
			}
			((Be = De.onVnodeUpdated) || qe) &&
				Gn(() => {
					Be && Rr(Be, J, H, O), qe && bo(H, O, J, "updated");
				}, fe);
		},
		G = (O, H, J, fe, le, he, _e) => {
			for (let ue = 0; ue < H.length; ue++) {
				const be = O[ue],
					ve = H[ue],
					qe =
						be.el && (be.type === ct || !Ir(be, ve) || be.shapeFlag & 70)
							? m(be.el)
							: J;
				C(be, ve, qe, undefined, fe, le, he, _e, !0);
			}
		},
		te = (O, H, J, fe, le) => {
			if (H !== J) {
				if (H !== vt) {
					for (const he in H) {
						!(Nl(he) || he in J) && c(O, he, H[he], undefined, le, fe);
					}
				}
				for (const he in J) {
					if (Nl(he)) {
						continue;
					}
					const _e = J[he],
						ue = H[he];
					_e !== ue && he !== "value" && c(O, he, ue, _e, le, fe);
				}
				"value" in J && c(O, "value", H.value, J.value, le);
			}
		},
		Z = (O, H, J, fe, le, he, _e, ue, be) => {
			const ve = (H.el = O ? O.el : d("")),
				qe = (H.anchor = O ? O.anchor : d(""));
			const { patchFlag: Le, dynamicChildren: De, slotScopeIds: Be } = H;
			Be && (ue = ue ? ue.concat(Be) : Be),
				O == undefined
					? (o(ve, J, fe),
						o(qe, J, fe),
						re(H.children || [], J, qe, le, he, _e, ue, be))
					: (Le > 0 && Le & 64 && De && O.dynamicChildren
						? (G(O.dynamicChildren, De, J, le, he, _e, ue),
							(H.key != null || (le && H === le.subTree)) && zy(O, H, !0))
						: ie(O, H, J, qe, le, he, _e, ue, be));
		},
		q = (O, H, J, fe, le, he, _e, ue, be) => {
			(H.slotScopeIds = ue),
				O == undefined
					? (H.shapeFlag & 512
						? le.ctx.activate(H, J, fe, _e, be)
						: F(H, J, fe, le, he, _e, be))
					: k(O, H, be);
		},
		F = (O, H, J, fe, le, he, _e) => {
			const ue = (O.component = Wk(O, fe, le));
			if ((ku(O) && (ue.ctx.renderer = $e), Uk(ue, !1, _e), ue.asyncDep)) {
				if ((le && le.registerDep(ue, B, _e), !O.el)) {
					const be = (ue.subTree = Pe(an));
					L(undefined, be, H, J);
				}
			} else {
				B(ue, O, H, J, le, he, _e);
			}
		},
		k = (O, H, J) => {
			const fe = (H.component = O.component);
			if ($k(O, H, J)) {
				if (fe.asyncDep && !fe.asyncResolved) {
					V(fe, H, J);
					return;
				}
				(fe.next = H), fe.update();
			} else {
				(H.el = O.el), (fe.vnode = H);
			}
		},
		B = (O, H, J, fe, le, he, _e) => {
			const ue = () => {
				if (O.isMounted) {
					let { next: Le, bu: De, u: Be, parent: Xe, vnode: gt } = O;
					{
						const Dt = Iy(O);
						if (Dt) {
							Le && ((Le.el = gt.el), V(O, Le, _e)),
								Dt.asyncDep.then(() => {
									O.isUnmounted || ue();
								});
							return;
						}
					}
					let nt = Le,
						lt;
					wo(O, !1),
						Le ? ((Le.el = gt.el), V(O, Le, _e)) : (Le = gt),
						De && _c(De),
						(lt = Le.props && Le.props.onVnodeBeforeUpdate) &&
							Rr(lt, Xe, Le, gt),
						wo(O, !0);
					const Tt = Zf(O),
						Rt = O.subTree;
					(O.subTree = Tt),
						C(Rt, Tt, m(Rt.el), X(Rt), O, le, he),
						(Le.el = Tt.el),
						nt === null && $h(O, Tt.el),
						Be && Gn(Be, le),
						(lt = Le.props && Le.props.onVnodeUpdated) &&
							Gn(() => Rr(lt, Xe, Le, gt), le);
				} else {
					let Le;
					const { el: De, props: Be } = H,
						{ bm: Xe, m: gt, parent: nt, root: lt, type: Tt } = O,
						Rt = Ss(H);
					if (
						(wo(O, !1),
						Xe && _c(Xe),
						!Rt && (Le = Be && Be.onVnodeBeforeMount) && Rr(Le, nt, H),
						wo(O, !0),
						De && Ze)
					) {
						const Dt = () => {
							(O.subTree = Zf(O)), Ze(De, O.subTree, O, le);
						};
						Rt && Tt.__asyncHydrate ? Tt.__asyncHydrate(De, O, Dt) : Dt();
					} else {
						lt.ce && lt.ce._injectChildStyle(Tt);
						const Dt = (O.subTree = Zf(O));
						C(undefined, Dt, J, fe, O, le, he), (H.el = Dt.el);
					}
					if ((gt && Gn(gt, le), !Rt && (Le = Be && Be.onVnodeMounted))) {
						const Dt = H;
						Gn(() => Rr(Le, nt, Dt), le);
					}
					(H.shapeFlag & 256 ||
						(nt && Ss(nt.vnode) && nt.vnode.shapeFlag & 256)) &&
						O.a &&
						Gn(O.a, le),
						(O.isMounted = !0),
						(H = J = fe = undefined);
				}
			};
			O.scope.on();
			const be = (O.effect = new U0(ue));
			O.scope.off();
			const ve = (O.update = be.run.bind(be)),
				qe = (O.job = be.runIfDirty.bind(be));
			(qe.i = O),
				(qe.id = O.uid),
				(be.scheduler = () => Th(qe)),
				wo(O, !0),
				ve();
		},
		V = (O, H, J) => {
			H.component = O;
			const fe = O.vnode.props;
			(O.vnode = H),
				(O.next = undefined),
				gk(O, H.props, fe, J),
				bk(O, H.children, J),
				io(),
				vv(O),
				oo();
		},
		ie = (O, H, J, fe, le, he, _e, ue, be = !1) => {
			const ve = O && O.children,
				qe = O ? O.shapeFlag : 0,
				Le = H.children,
				{ patchFlag: De, shapeFlag: Be } = H;
			if (De > 0) {
				if (De & 128) {
					Ne(ve, Le, J, fe, le, he, _e, ue, be);
					return;
				}
				if (De & 256) {
					ye(ve, Le, J, fe, le, he, _e, ue, be);
					return;
				}
			}
			Be & 8
				? (qe & 16 && Ae(ve, le, he), Le !== ve && v(J, Le))
				: qe & 16
					? Be & 16
						? Ne(ve, Le, J, fe, le, he, _e, ue, be)
						: Ae(ve, le, he, !0)
					: (qe & 8 && v(J, ""), Be & 16 && re(Le, J, fe, le, he, _e, ue, be));
		},
		ye = (O, H, J, fe, le, he, _e, ue, be) => {
			(O = O || ys), (H = H || ys);
			const ve = O.length,
				qe = H.length,
				Le = Math.min(ve, qe);
			let De;
			for (De = 0; De < Le; De++) {
				const Be = (H[De] = be ? Bi(H[De]) : wr(H[De]));
				C(O[De], Be, J, undefined, le, he, _e, ue, be);
			}
			ve > qe
				? Ae(O, le, he, !0, !1, Le)
				: re(H, J, fe, le, he, _e, ue, be, Le);
		},
		Ne = (O, H, J, fe, le, he, _e, ue, be) => {
			let ve = 0;
			const qe = H.length;
			let Le = O.length - 1,
				De = qe - 1;
			while (ve <= Le && ve <= De) {
				const Be = O[ve],
					Xe = (H[ve] = be ? Bi(H[ve]) : wr(H[ve]));
				if (Ir(Be, Xe)) {
					C(Be, Xe, J, undefined, le, he, _e, ue, be);
				} else {
					break;
				}
				ve++;
			}
			while (ve <= Le && ve <= De) {
				const Be = O[Le],
					Xe = (H[De] = be ? Bi(H[De]) : wr(H[De]));
				if (Ir(Be, Xe)) {
					C(Be, Xe, J, undefined, le, he, _e, ue, be);
				} else {
					break;
				}
				Le--, De--;
			}
			if (ve > Le) {
				if (ve <= De) {
					const Be = De + 1,
						Xe = Be < qe ? H[Be].el : fe;
					while (ve <= De) {
						C(
							undefined,
							(H[ve] = be ? Bi(H[ve]) : wr(H[ve])),
							J,
							Xe,
							le,
							he,
							_e,
							ue,
							be,
						),
							ve++;
					}
				}
			} else if (ve > De) {
				while (ve <= Le) {
					je(O[ve], le, he, !0), ve++;
				}
			} else {
				const Be = ve,
					Xe = ve,
					gt = new Map();
				for (ve = Xe; ve <= De; ve++) {
					const tn = (H[ve] = be ? Bi(H[ve]) : wr(H[ve]));
					tn.key != undefined && gt.set(tn.key, ve);
				}
				let nt,
					lt = 0;
				const Tt = De - Xe + 1;
				let Rt = !1,
					Dt = 0;
				const Wn = new Array(Tt);
				for (ve = 0; ve < Tt; ve++) {
					Wn[ve] = 0;
				}
				for (ve = Be; ve <= Le; ve++) {
					const tn = O[ve];
					if (lt >= Tt) {
						je(tn, le, he, !0);
						continue;
					}
					let Ve;
					if (tn.key != undefined) {
						Ve = gt.get(tn.key);
					} else {
						for (nt = Xe; nt <= De; nt++) {
							if (Wn[nt - Xe] === 0 && Ir(tn, H[nt])) {
								Ve = nt;
								break;
							}
						}
					}
					Ve === void 0
						? je(tn, le, he, !0)
						: ((Wn[Ve - Xe] = ve + 1),
							Ve >= Dt ? (Dt = Ve) : (Rt = !0),
							C(tn, H[Ve], J, undefined, le, he, _e, ue, be),
							lt++);
				}
				const ar = Rt ? _k(Wn) : ys;
				for (nt = ar.length - 1, ve = Tt - 1; ve >= 0; ve--) {
					const tn = Xe + ve,
						Ve = H[tn],
						so = tn + 1 < qe ? H[tn + 1].el : fe;
					Wn[ve] === 0
						? C(undefined, Ve, J, so, le, he, _e, ue, be)
						: Rt && (nt < 0 || ve !== ar[nt] ? Ue(Ve, J, so, 2) : nt--);
				}
			}
		},
		Ue = (O, H, J, fe, le) => {
			const {
				el: he,
				type: _e,
				transition: ue,
				children: be,
				shapeFlag: ve,
			} = O;
			if (ve & 6) {
				Ue(O.component.subTree, H, J, fe);
				return;
			}
			if (ve & 128) {
				O.suspense.move(H, J, fe);
				return;
			}
			if (ve & 64) {
				_e.move(O, H, J, $e);
				return;
			}
			if (_e === ct) {
				o(he, H, J);
				for (let Le = 0; Le < be.length; Le++) {
					Ue(be[Le], H, J, fe);
				}
				o(O.anchor, H, J);
				return;
			}
			if (_e === Jf) {
				P(O, H, J);
				return;
			}
			if (fe !== 2 && ve & 1 && ue) {
				if (fe === 0) {
					ue.beforeEnter(he), o(he, H, J), Gn(() => ue.enter(he), le);
				} else {
					const { leave: Le, delayLeave: De, afterLeave: Be } = ue,
						Xe = () => o(he, H, J),
						gt = () => {
							Le(he, () => {
								Xe(), Be && Be();
							});
						};
					De ? De(he, Xe, gt) : gt();
				}
			} else {
				o(he, H, J);
			}
		},
		je = (O, H, J, fe = !1, le = !1) => {
			const {
				type: he,
				props: _e,
				ref: ue,
				children: be,
				dynamicChildren: ve,
				shapeFlag: qe,
				patchFlag: Le,
				dirs: De,
				cacheIndex: Be,
			} = O;
			if (
				(Le === -2 && (le = !1),
				ue != undefined && kd(ue, undefined, J, O, !0),
				Be != undefined && (H.renderCache[Be] = void 0),
				qe & 256)
			) {
				H.ctx.deactivate(O);
				return;
			}
			const Xe = qe & 1 && De,
				gt = !Ss(O);
			let nt;
			if (
				(gt && (nt = _e && _e.onVnodeBeforeUnmount) && Rr(nt, H, O), qe & 6)
			) {
				Je(O.component, J, fe);
			} else {
				if (qe & 128) {
					O.suspense.unmount(J, fe);
					return;
				}
				Xe && bo(O, undefined, H, "beforeUnmount"),
					qe & 64
						? O.type.remove(O, H, J, $e, fe)
						: (ve && !ve.hasOnce && (he !== ct || (Le > 0 && Le & 64))
							? Ae(ve, H, J, !1, !0)
							: ((he === ct && Le & 384) || (!le && qe & 16)) && Ae(be, H, J)),
					fe && it(O);
			}
			((gt && (nt = _e && _e.onVnodeUnmounted)) || Xe) &&
				Gn(() => {
					nt && Rr(nt, H, O), Xe && bo(O, undefined, H, "unmounted");
				}, J);
		},
		it = (O) => {
			const { type: H, el: J, anchor: fe, transition: le } = O;
			if (H === ct) {
				tt(J, fe);
				return;
			}
			if (H === Jf) {
				A(O);
				return;
			}
			const he = () => {
				s(J), le && !le.persisted && le.afterLeave && le.afterLeave();
			};
			if (O.shapeFlag & 1 && le && !le.persisted) {
				const { leave: _e, delayLeave: ue } = le,
					be = () => _e(J, he);
				ue ? ue(O.el, he, be) : be();
			} else {
				he();
			}
		},
		tt = (O, H) => {
			let J;
			while (O !== H) {
				(J = b(O)), s(O), (O = J);
			}
			s(H);
		},
		Je = (O, H, J) => {
			const {
				bum: fe,
				scope: le,
				job: he,
				subTree: _e,
				um: ue,
				m: be,
				a: ve,
			} = O;
			kv(be),
				kv(ve),
				fe && _c(fe),
				le.stop(),
				he && ((he.flags |= 8), je(_e, O, H, J)),
				ue && Gn(ue, H),
				Gn(() => {
					O.isUnmounted = !0;
				}, H),
				H &&
					H.pendingBranch &&
					!H.isUnmounted &&
					O.asyncDep &&
					!O.asyncResolved &&
					O.suspenseId === H.pendingId &&
					(H.deps--, H.deps === 0 && H.resolve());
		},
		Ae = (O, H, J, fe = !1, le = !1, he = 0) => {
			for (let _e = he; _e < O.length; _e++) {
				je(O[_e], H, J, fe, le);
			}
		},
		X = (O) => {
			if (O.shapeFlag & 6) {
				return X(O.component.subTree);
			}
			if (O.shapeFlag & 128) {
				return O.suspense.next();
			}
			const H = b(O.anchor || O.el),
				J = H && H[q_];
			return J ? b(J) : H;
		};
	let ae = !1;
	const de = (O, H, J) => {
			O == undefined
				? H._vnode && je(H._vnode, undefined, undefined, !0)
				: C(H._vnode || undefined, O, H, undefined, undefined, undefined, J),
				(H._vnode = O),
				ae || ((ae = !0), vv(), uy(), (ae = !1));
		},
		$e = {
			p: C,
			um: je,
			m: Ue,
			r: it,
			mt: F,
			mc: re,
			pc: ie,
			pbc: G,
			n: X,
			o: e,
		};
	let Ee, Ze;
	return { render: de, hydrate: Ee, createApp: hk(de, Ee) };
}
function Yf({ type: e, props: t }, r) {
	return (r === "svg" && e === "foreignObject") ||
		(r === "mathml" &&
			e === "annotation-xml" &&
			t &&
			t.encoding &&
			t.encoding.includes("html"))
		? void 0
		: r;
}
function wo({ effect: e, job: t }, r) {
	r ? ((e.flags |= 32), (t.flags |= 4)) : ((e.flags &= -33), (t.flags &= -5));
}
function Sk(e, t) {
	return (!e || (e && !e.pendingBranch)) && t && !t.persisted;
}
function zy(e, t, r = !1) {
	const o = e.children,
		s = t.children;
	if (Fe(o) && Fe(s)) {
		for (let c = 0; c < o.length; c++) {
			const f = o[c];
			let d = s[c];
			d.shapeFlag & 1 &&
				!d.dynamicChildren &&
				((d.patchFlag <= 0 || d.patchFlag === 32) &&
					((d = s[c] = Bi(s[c])), (d.el = f.el)),
				!r && d.patchFlag !== -2 && zy(f, d)),
				d.type === Au && (d.el = f.el);
		}
	}
}
function _k(e) {
	const t = [...e],
		r = [0];
	let o, s, c, f, d;
	const h = e.length;
	for (o = 0; o < h; o++) {
		const p = e[o];
		if (p !== 0) {
			if (((s = r[r.length - 1]), e[s] < p)) {
				(t[o] = s), r.push(o);
				continue;
			}
			for (c = 0, f = r.length - 1; c < f; ) {
				(d = (c + f) >> 1), e[r[d]] < p ? (c = d + 1) : (f = d);
			}
			p < e[r[c]] && (c > 0 && (t[o] = r[c - 1]), (r[c] = o));
		}
	}
	for (c = r.length, f = r[c - 1]; c-- > 0; ) {
		(r[c] = f), (f = t[f]);
	}
	return r;
}
function Iy(e) {
	const t = e.subTree.component;
	if (t) {
		return t.asyncDep && !t.asyncResolved ? t : Iy(t);
	}
}
function kv(e) {
	if (e) {
		for (let t = 0; t < e.length; t++) {
			e[t].flags |= 8;
		}
	}
}
const kk = Symbol.for("v-scx"),
	Tk = () => di(kk);
function Mh(e, t) {
	return Eu(e, undefined, t);
}
function Ck(e, t) {
	return Eu(e, undefined, { flush: "sync" });
}
function Bt(e, t, r) {
	return Eu(e, t, r);
}
function Eu(e, t, r = vt) {
	const { immediate: o, deep: s, flush: c, once: f } = r,
		d = Wt({}, r),
		h = (t && o) || (!t && c !== "post");
	let p;
	if (Xl) {
		if (c === "sync") {
			const w = Tk();
			p = w.__watcherHandles || (w.__watcherHandles = []);
		} else if (!h) {
			const w = () => {};
			return (w.stop = Fr), (w.resume = Fr), (w.pause = Fr), w;
		}
	}
	const v = cn;
	d.call = (w, M, C) => Cr(w, v, M, C);
	let m = !1;
	c === "post"
		? (d.scheduler = (w) => {
				Gn(w, v && v.suspense);
			})
		: c !== "sync" &&
			((m = !0),
			(d.scheduler = (w, M) => {
				M ? w() : Th(w);
			})),
		(d.augmentJob = (w) => {
			t && (w.flags |= 4),
				m && ((w.flags |= 2), v && ((w.id = v.uid), (w.i = v)));
		});
	const b = I_(e, t, d);
	return Xl && (p ? p.push(b) : h && b()), b;
}
function Ek(e, t, r) {
	const o = this.proxy,
		s = Ot(e) ? (e.includes(".") ? Fy(o, e) : () => o[e]) : e.bind(o, o);
	let c;
	Ke(t) ? (c = t) : ((c = t.handler), (r = t));
	const f = ma(this),
		d = Eu(s, c.bind(o), r);
	return f(), d;
}
function Fy(e, t) {
	const r = t.split(".");
	return () => {
		let o = e;
		for (let s = 0; s < r.length && o; s++) {
			o = o[r[s]];
		}
		return o;
	};
}
function Nh(e, t, r = vt) {
	const o = va(),
		s = Jn(t),
		c = yi(t),
		f = Hy(e, s),
		d = sy((h, p) => {
			let v,
				m = vt,
				b;
			return (
				Ck(() => {
					const w = e[s];
					In(v, w) && ((v = w), p());
				}),
				{
					get() {
						return h(), r.get ? r.get(v) : v;
					},
					set(w) {
						const M = r.set ? r.set(w) : w;
						if (!(In(M, v) || (m !== vt && In(w, m)))) {
							return;
						}
						const C = o.vnode.props;
						(C &&
							(t in C || s in C || c in C) &&
							(`onUpdate:${t}` in C ||
								`onUpdate:${s}` in C ||
								`onUpdate:${c}` in C)) ||
							((v = w), p()),
							o.emit(`update:${t}`, M),
							In(w, M) && In(w, m) && !In(M, b) && p(),
							(m = w),
							(b = M);
					},
				}
			);
		});
	return (
		(d[Symbol.iterator] = () => {
			let h = 0;
			return {
				next() {
					return h < 2 ? { value: h++ ? f || vt : d, done: !1 } : { done: !0 };
				},
			};
		}),
		d
	);
}
const Hy = (e, t) =>
	t === "modelValue" || t === "model-value"
		? e.modelModifiers
		: e[`${t}Modifiers`] || e[`${Jn(t)}Modifiers`] || e[`${yi(t)}Modifiers`];
function Lk(e, t, ...r) {
	if (e.isUnmounted) {
		return;
	}
	const o = e.vnode.props || vt;
	let s = r;
	const c = t.startsWith("update:"),
		f = c && Hy(o, t.slice(7));
	f &&
		(f.trim && (s = r.map((v) => (Ot(v) ? v.trim() : v))),
		f.number && (s = r.map(md)));
	let d,
		h = o[(d = Sc(t))] || o[(d = Sc(Jn(t)))];
	!h && c && (h = o[(d = Sc(yi(t)))]), h && Cr(h, e, 6, s);
	const p = o[d + "Once"];
	if (p) {
		if (!e.emitted) {
			e.emitted = {};
		} else if (e.emitted[d]) {
			return;
		}
		(e.emitted[d] = !0), Cr(p, e, 6, s);
	}
}
function qy(e, t, r = !1) {
	const o = t.emitsCache,
		s = o.get(e);
	if (s !== void 0) {
		return s;
	}
	const c = e.emits;
	let f = {},
		d = !1;
	if (!Ke(e)) {
		const h = (p) => {
			const v = qy(p, t, !0);
			v && ((d = !0), Wt(f, v));
		};
		!r && t.mixins.length && t.mixins.forEach(h),
			e.extends && h(e.extends),
			e.mixins && e.mixins.forEach(h);
	}
	return c || d
		? (Fe(c) ? c.forEach((h) => (f[h] = undefined)) : Wt(f, c),
			_t(e) && o.set(e, f),
			f)
		: (_t(e) && o.set(e, undefined), undefined);
}
function Lu(e, t) {
	return e && pu(t)
		? ((t = t.slice(2).replace(/Once$/, "")),
			bt(e, t[0].toLowerCase() + t.slice(1)) || bt(e, yi(t)) || bt(e, t))
		: !1;
}
function Zf(e) {
	const {
			type: t,
			vnode: r,
			proxy: o,
			withProxy: s,
			propsOptions: [c],
			slots: f,
			attrs: d,
			emit: h,
			render: p,
			renderCache: v,
			props: m,
			data: b,
			setupState: w,
			ctx: M,
			inheritAttrs: C,
		} = e,
		E = qc(e);
	let L, N;
	try {
		if (r.shapeFlag & 4) {
			const A = s || o,
				z = A;
			(L = wr(p.call(z, A, v, m, w, b, M))), (N = d);
		} else {
			const A = t;
			(L = wr(
				A.length > 1 ? A(m, { attrs: d, slots: f, emit: h }) : A(m),
			)),
				(N = t.props ? d : Mk(d));
		}
	} catch (error) {
		(Rl.length = 0), ga(error, e, 1), (L = Pe(an));
	}
	let P = L;
	if (N && C !== !1) {
		const A = Object.keys(N),
			{ shapeFlag: z } = P;
		A.length &&
			z & 7 &&
			(c && A.some(ph) && (N = Nk(N, c)), (P = Ji(P, N, !1, !0)));
	}
	return (
		r.dirs &&
			((P = Ji(P, undefined, !1, !0)),
			(P.dirs = P.dirs ? P.dirs.concat(r.dirs) : r.dirs)),
		r.transition && Gl(P, r.transition),
		(L = P),
		qc(E),
		L
	);
}
function Ak(e, t = !0) {
	let r;
	for (let o = 0; o < e.length; o++) {
		const s = e[o];
		if ($s(s)) {
			if (s.type !== an || s.children === "v-if") {
				if (r) {
					return;
				}
				r = s;
			}
		} else {
			return;
		}
	}
	return r;
}
const Mk = (e) => {
		let t;
		for (const r in e) {
			(r === "class" || r === "style" || pu(r)) && ((t || (t = {}))[r] = e[r]);
		}
		return t;
	},
	Nk = (e, t) => {
		const r = {};
		for (const o in e) {
			!(ph(o) && o.slice(9) in t) && (r[o] = e[o]);
		}
		return r;
	};
function $k(e, t, r) {
	const { props: o, children: s, component: c } = e,
		{ props: f, children: d, patchFlag: h } = t,
		p = c.emitsOptions;
	if (t.dirs || t.transition) {
		return !0;
	}
	if (r && h >= 0) {
		if (h & 1024) {
			return !0;
		}
		if (h & 16) {
			return o ? Tv(o, f, p) : !!f;
		}
		if (h & 8) {
			const v = t.dynamicProps;
			for (let m = 0; m < v.length; m++) {
				const b = v[m];
				if (f[b] !== o[b] && !Lu(p, b)) {
					return !0;
				}
			}
		}
	} else {
		return (s || d) && !(d && d.$stable)
			? !0
			: o === f
				? !1
				: o
					? f
						? Tv(o, f, p)
						: !0
					: !!f;
	}
	return !1;
}
function Tv(e, t, r) {
	const o = Object.keys(t);
	if (o.length !== Object.keys(e).length) {
		return !0;
	}
	for (let s = 0; s < o.length; s++) {
		const c = o[s];
		if (t[c] !== e[c] && !Lu(r, c)) {
			return !0;
		}
	}
	return !1;
}
function $h({ vnode: e, parent: t }, r) {
	while (t) {
		const o = t.subTree;
		if (
			(o.suspense && o.suspense.activeBranch === e && (o.el = e.el), o === e)
		) {
			((e = t.vnode).el = r), (t = t.parent);
		} else {
			break;
		}
	}
}
const By = (e) => e.__isSuspense;
let Ad = 0;
const Pk = {
		name: "Suspense",
		__isSuspense: !0,
		process(e, t, r, o, s, c, f, d, h, p) {
			if (e == undefined) {
				Ok(t, r, o, s, c, f, d, h, p);
			} else {
				if (c && c.deps > 0 && !e.suspense.isInFallback) {
					(t.suspense = e.suspense), (t.suspense.vnode = t), (t.el = e.el);
					return;
				}
				Rk(e, t, r, o, s, f, d, h, p);
			}
		},
		hydrate: Dk,
		normalize: zk,
	},
	Wy = Pk;
function Kl(e, t) {
	const r = e.props && e.props[t];
	Ke(r) && r();
}
function Ok(e, t, r, o, s, c, f, d, h) {
	const {
			p,
			o: { createElement: v },
		} = h,
		m = v("div"),
		b = (e.suspense = Uy(e, s, o, t, m, r, c, f, d, h));
	p(undefined, (b.pendingBranch = e.ssContent), m, undefined, o, b, c, f),
		b.deps > 0
			? (Kl(e, "onPending"),
				Kl(e, "onFallback"),
				p(undefined, e.ssFallback, t, r, o, undefined, c, f),
				ks(b, e.ssFallback))
			: b.resolve(!1, !0);
}
function Rk(e, t, r, o, s, c, f, d, { p: h, um: p, o: { createElement: v } }) {
	const m = (t.suspense = e.suspense);
	(m.vnode = t), (t.el = e.el);
	const b = t.ssContent,
		w = t.ssFallback,
		{ activeBranch: M, pendingBranch: C, isInFallback: E, isHydrating: L } = m;
	if (C) {
		(m.pendingBranch = b),
			Ir(b, C)
				? (h(C, b, m.hiddenContainer, undefined, s, m, c, f, d),
					m.deps <= 0
						? m.resolve()
						: E && (L || (h(M, w, r, o, s, undefined, c, f, d), ks(m, w))))
				: ((m.pendingId = Ad++),
					L ? ((m.isHydrating = !1), (m.activeBranch = C)) : p(C, s, m),
					(m.deps = 0),
					(m.effects.length = 0),
					(m.hiddenContainer = v("div")),
					E
						? (h(undefined, b, m.hiddenContainer, undefined, s, m, c, f, d),
							m.deps <= 0
								? m.resolve()
								: (h(M, w, r, o, s, undefined, c, f, d), ks(m, w)))
						: (M && Ir(b, M)
							? (h(M, b, r, o, s, m, c, f, d), m.resolve(!0))
							: (h(null, b, m.hiddenContainer, null, s, m, c, f, d),
								m.deps <= 0 && m.resolve())));
	} else if (M && Ir(b, M)) {
		h(M, b, r, o, s, m, c, f, d), ks(m, b);
	} else if (
		(Kl(t, "onPending"),
		(m.pendingBranch = b),
		b.shapeFlag & 512
			? (m.pendingId = b.component.suspenseId)
			: (m.pendingId = Ad++),
		h(undefined, b, m.hiddenContainer, undefined, s, m, c, f, d),
		m.deps <= 0)
	) {
		m.resolve();
	} else {
		const { timeout: N, pendingId: P } = m;
		N > 0
			? setTimeout(() => {
					m.pendingId === P && m.fallback(w);
				}, N)
			: N === 0 && m.fallback(w);
	}
}
function Uy(e, t, r, o, s, c, f, d, h, p, v = !1) {
	const {
		p: m,
		m: b,
		um: w,
		n: M,
		o: { parentNode: C, remove: E },
	} = p;
	let L;
	const N = Fk(e);
	N && t && t.pendingBranch && ((L = t.pendingId), t.deps++);
	const P = e.props ? I0(e.props.timeout) : void 0,
		A = c,
		z = {
			vnode: e,
			parent: t,
			parentComponent: r,
			namespace: f,
			container: o,
			hiddenContainer: s,
			deps: 0,
			pendingId: Ad++,
			timeout: typeof P === "number" ? P : -1,
			activeBranch: undefined,
			pendingBranch: undefined,
			isInFallback: !v,
			isHydrating: v,
			isUnmounted: !1,
			effects: [],
			resolve(W = !1, U = !1) {
				const {
					vnode: re,
					activeBranch: Q,
					pendingBranch: G,
					pendingId: te,
					effects: Z,
					parentComponent: q,
					container: F,
				} = z;
				let k = !1;
				z.isHydrating
					? (z.isHydrating = !1)
					: W ||
						((k = Q && G.transition && G.transition.mode === "out-in"),
						k &&
							(Q.transition.afterLeave = () => {
								te === z.pendingId && (b(G, F, c === A ? M(Q) : c, 0), Sd(Z));
							}),
						Q && (C(Q.el) === F && (c = M(Q)), w(Q, q, z, !0)),
						k || b(G, F, c, 0)),
					ks(z, G),
					(z.pendingBranch = undefined),
					(z.isInFallback = !1);
				let B = z.parent,
					V = !1;
				while (B) {
					if (B.pendingBranch) {
						B.effects.push(...Z), (V = !0);
						break;
					}
					B = B.parent;
				}
				!(V || k) && Sd(Z),
					(z.effects = []),
					N &&
						t &&
						t.pendingBranch &&
						L === t.pendingId &&
						(t.deps--, t.deps === 0 && !U && t.resolve()),
					Kl(re, "onResolve");
			},
			fallback(W) {
				if (!z.pendingBranch) {
					return;
				}
				const {
					vnode: U,
					activeBranch: re,
					parentComponent: Q,
					container: G,
					namespace: te,
				} = z;
				Kl(U, "onFallback");
				const Z = M(re),
					q = () => {
						z.isInFallback &&
							(m(undefined, W, G, Z, Q, undefined, te, d, h), ks(z, W));
					},
					F = W.transition && W.transition.mode === "out-in";
				F && (re.transition.afterLeave = q),
					(z.isInFallback = !0),
					w(re, Q, undefined, !0),
					F || q();
			},
			move(W, U, re) {
				z.activeBranch && b(z.activeBranch, W, U, re), (z.container = W);
			},
			next() {
				return z.activeBranch && M(z.activeBranch);
			},
			registerDep(W, U, re) {
				const Q = !!z.pendingBranch;
				Q && z.deps++;
				const G = W.vnode.el;
				W.asyncDep
					.catch((error) => {
						ga(error, W, 0);
					})
					.then((te) => {
						if (
							W.isUnmounted ||
							z.isUnmounted ||
							z.pendingId !== W.suspenseId
						) {
							return;
						}
						W.asyncResolved = !0;
						const { vnode: Z } = W;
						Nd(W, te, !1), G && (Z.el = G);
						const q = !G && W.subTree.el;
						U(
							W,
							Z,
							C(G || W.subTree.el),
							G ? undefined : M(W.subTree),
							z,
							f,
							re,
						),
							q && E(q),
							$h(W, Z.el),
							Q && --z.deps === 0 && z.resolve();
					});
			},
			unmount(W, U) {
				(z.isUnmounted = !0),
					z.activeBranch && w(z.activeBranch, r, W, U),
					z.pendingBranch && w(z.pendingBranch, r, W, U);
			},
		};
	return z;
}
function Dk(e, t, r, o, s, c, f, d, h) {
	const p = (t.suspense = Uy(
			t,
			o,
			r,
			e.parentNode,
			document.createElement("div"),
			undefined,
			s,
			c,
			f,
			d,
			!0,
		)),
		v = h(e, (p.pendingBranch = t.ssContent), r, p, c, f);
	return p.deps === 0 && p.resolve(!1, !0), v;
}
function zk(e) {
	const { shapeFlag: t, children: r } = e,
		o = t & 32;
	(e.ssContent = Cv(o ? r.default : r)),
		(e.ssFallback = o ? Cv(r.fallback) : Pe(an));
}
function Cv(e) {
	let t;
	if (Ke(e)) {
		const r = Ns && e._c;
		r && ((e._d = !1), oe()), (e = e()), r && ((e._d = !0), (t = Hn), Vy());
	}
	return (
		Fe(e) && (e = Ak(e)),
		(e = wr(e)),
		t && !e.dynamicChildren && (e.dynamicChildren = t.filter((r) => r !== e)),
		e
	);
}
function Ik(e, t) {
	t && t.pendingBranch
		? (Fe(e)
			? t.effects.push(...e)
			: t.effects.push(e))
		: Sd(e);
}
function ks(e, t) {
	e.activeBranch = t;
	const { vnode: r, parentComponent: o } = e;
	let s = t.el;
	while (!s && t.component) {
		(t = t.component.subTree), (s = t.el);
	}
	(r.el = s), o && o.subTree === r && ((o.vnode.el = s), $h(o, s));
}
function Fk(e) {
	const t = e.props && e.props.suspensible;
	return t != undefined && t !== !1;
}
const ct = Symbol.for("v-fgt"),
	Au = Symbol.for("v-txt"),
	an = Symbol.for("v-cmt"),
	Jf = Symbol.for("v-stc"),
	Rl = [];
let Hn;
function oe(e = !1) {
	Rl.push((Hn = e ? undefined : []));
}
function Vy() {
	Rl.pop(), (Hn = Rl[Rl.length - 1] || undefined);
}
let Ns = 1;
function Vc(e) {
	(Ns += e), e < 0 && Hn && (Hn.hasOnce = !0);
}
function jy(e) {
	return (
		(e.dynamicChildren = Ns > 0 ? Hn || ys : undefined),
		Vy(),
		Ns > 0 && Hn && Hn.push(e),
		e
	);
}
function me(e, t, r, o, s, c) {
	return jy(Y(e, t, r, o, s, c, !0));
}
function rt(e, t, r, o, s) {
	return jy(Pe(e, t, r, o, s, !0));
}
function $s(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function Ir(e, t) {
	return e.type === t.type && e.key === t.key;
}
const Gy = ({ key: e }) => e ?? undefined,
	Tc = ({ ref: e, ref_key: t, ref_for: r }) => (
		typeof e === "number" && (e = "" + e),
		e != undefined
			? (Ot(e) || At(e) || Ke(e)
				? { i: en, r: e, k: t, f: !!r }
				: e)
			: undefined
	);
function Y(
	e,
	t,
	r,
	o = 0,
	s,
	c = e === ct ? 0 : 1,
	f = !1,
	d = !1,
) {
	const h = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && Gy(t),
		ref: t && Tc(t),
		scopeId: _u,
		slotScopeIds: undefined,
		children: r,
		component: undefined,
		suspense: undefined,
		ssContent: undefined,
		ssFallback: undefined,
		dirs: undefined,
		transition: undefined,
		el: undefined,
		anchor: undefined,
		target: undefined,
		targetStart: undefined,
		targetAnchor: undefined,
		staticCount: 0,
		shapeFlag: c,
		patchFlag: o,
		dynamicProps: s,
		dynamicChildren: undefined,
		appContext: undefined,
		ctx: en,
	};
	return (
		d
			? (Ph(h, r), c & 128 && e.normalize(h))
			: r && (h.shapeFlag |= Ot(r) ? 8 : 16),
		Ns > 0 &&
			!f &&
			Hn &&
			(h.patchFlag > 0 || c & 6) &&
			h.patchFlag !== 32 &&
			Hn.push(h),
		h
	);
}
const Pe = Hk;
function Hk(e, t, r, o = 0, s, c = !1) {
	if (((!e || e === ky) && (e = an), $s(e))) {
		const d = Ji(e, t, !0);
		return (
			r && Ph(d, r),
			Ns > 0 &&
				!c &&
				Hn &&
				(d.shapeFlag & 6 ? (Hn[Hn.indexOf(e)] = d) : Hn.push(d)),
			(d.patchFlag = -2),
			d
		);
	}
	if ((Kk(e) && (e = e.__vccOpts), t)) {
		t = Ky(t);
		let { class: d, style: h } = t;
		d && !Ot(d) && (t.class = st(d)),
			_t(h) && (_h(h) && !Fe(h) && (h = Wt({}, h)), (t.style = Jt(h)));
	}
	const f = Ot(e) ? 1 : By(e) ? 128 : gy(e) ? 64 : _t(e) ? 4 : Ke(e) ? 2 : 0;
	return Y(e, t, r, o, s, f, c, !0);
}
function Ky(e) {
	return e ? (_h(e) || My(e) ? Wt({}, e) : e) : undefined;
}
function Ji(e, t, r = !1, o = !1) {
	const { props: s, ref: c, patchFlag: f, children: d, transition: h } = e,
		p = t ? hi(s || {}, t) : s,
		v = {
			__v_isVNode: !0,
			__v_skip: !0,
			type: e.type,
			props: p,
			key: p && Gy(p),
			ref:
				t && t.ref
					? r && c
						? Fe(c)
							? c.concat(Tc(t))
							: [c, Tc(t)]
						: Tc(t)
					: c,
			scopeId: e.scopeId,
			slotScopeIds: e.slotScopeIds,
			children: d,
			target: e.target,
			targetStart: e.targetStart,
			targetAnchor: e.targetAnchor,
			staticCount: e.staticCount,
			shapeFlag: e.shapeFlag,
			patchFlag: t && e.type !== ct ? (f === -1 ? 16 : f | 16) : f,
			dynamicProps: e.dynamicProps,
			dynamicChildren: e.dynamicChildren,
			appContext: e.appContext,
			dirs: e.dirs,
			transition: h,
			component: e.component,
			suspense: e.suspense,
			ssContent: e.ssContent && Ji(e.ssContent),
			ssFallback: e.ssFallback && Ji(e.ssFallback),
			el: e.el,
			anchor: e.anchor,
			ctx: e.ctx,
			ce: e.ce,
		};
	return h && o && Gl(v, h.clone(v)), v;
}
function pt(e = " ", t = 0) {
	return Pe(Au, undefined, e, t);
}
function Ye(e = "", t = !1) {
	return t ? (oe(), rt(an, undefined, e)) : Pe(an, undefined, e);
}
function wr(e) {
	return e == undefined || typeof e === "boolean"
		? Pe(an)
		: Fe(e)
			? Pe(ct, undefined, [...e])
			: $s(e)
				? Bi(e)
				: Pe(Au, undefined, String(e));
}
function Bi(e) {
	return (e.el === null && e.patchFlag !== -1) || e.memo ? e : Ji(e);
}
function Ph(e, t) {
	let r = 0;
	const { shapeFlag: o } = e;
	if (t == undefined) {
		t = undefined;
	} else if (Fe(t)) {
		r = 16;
	} else if (typeof t === "object") {
		if (o & 65) {
			const s = t.default;
			s && (s._c && (s._d = !1), Ph(e, s()), s._c && (s._d = !0));
			return;
		}
		r = 32;
		const s = t._;
		s || My(t)
			? s === 3 &&
				en &&
				(en.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)))
			: (t._ctx = en);
	} else {
		Ke(t)
			? ((t = { default: t, _ctx: en }), (r = 32))
			: ((t = String(t)), o & 64 ? ((r = 16), (t = [pt(t)])) : (r = 8));
	}
	(e.children = t), (e.shapeFlag |= r);
}
function hi(...e) {
	const t = {};
	for (let r = 0; r < e.length; r++) {
		const o = e[r];
		for (const s in o) {
			if (s === "class") {
				t.class !== o.class && (t.class = st([t.class, o.class]));
			} else if (s === "style") {
				t.style = Jt([t.style, o.style]);
			} else if (pu(s)) {
				const c = t[s],
					f = o[s];
				f &&
					c !== f &&
					!(Fe(c) && c.includes(f)) &&
					(t[s] = c ? [].concat(c, f) : f);
			} else {
				s !== "" && (t[s] = o[s]);
			}
		}
	}
	return t;
}
function Rr(e, t, r, o) {
	Cr(e, t, 7, [r, o]);
}
const qk = Ey();
let Bk = 0;
function Wk(e, t, r) {
	const o = e.type,
		s = (t ? t.appContext : e.appContext) || qk,
		c = {
			uid: Bk++,
			vnode: e,
			type: o,
			parent: t,
			appContext: s,
			root: undefined,
			next: undefined,
			subTree: undefined,
			effect: undefined,
			update: undefined,
			job: undefined,
			scope: new a_(!0),
			render: undefined,
			proxy: undefined,
			exposed: undefined,
			exposeProxy: undefined,
			withProxy: undefined,
			provides: t ? t.provides : Object.create(s.provides),
			ids: t ? t.ids : ["", 0, 0],
			accessCache: undefined,
			renderCache: [],
			components: undefined,
			directives: undefined,
			propsOptions: $y(o, s),
			emitsOptions: qy(o, s),
			emit: undefined,
			emitted: undefined,
			propsDefaults: vt,
			inheritAttrs: o.inheritAttrs,
			ctx: vt,
			data: vt,
			props: vt,
			attrs: vt,
			slots: vt,
			refs: vt,
			setupState: vt,
			setupContext: undefined,
			suspense: r,
			suspenseId: r ? r.pendingId : 0,
			asyncDep: undefined,
			asyncResolved: !1,
			isMounted: !1,
			isUnmounted: !1,
			isDeactivated: !1,
			bc: undefined,
			c: undefined,
			bm: undefined,
			m: undefined,
			bu: undefined,
			u: undefined,
			um: undefined,
			bum: undefined,
			da: undefined,
			a: undefined,
			rtg: undefined,
			rtc: undefined,
			ec: undefined,
			sp: undefined,
		};
	return (
		(c.ctx = { _: c }),
		(c.root = t ? t.root : c),
		(c.emit = Lk.bind(undefined, c)),
		e.ce && e.ce(c),
		c
	);
}
let cn;
const va = () => cn || en;
let jc, Md;
{
	const e = yu(),
		t = (r, o) => {
			let s;
			return (
				(s = e[r]) || (s = e[r] = []),
				s.push(o),
				(c) => {
					s.length > 1 ? s.forEach((f) => f(c)) : s[0](c);
				}
			);
		};
	(jc = t("__VUE_INSTANCE_SETTERS__", (r) => (cn = r))),
		(Md = t("__VUE_SSR_SETTERS__", (r) => (Xl = r)));
}
const ma = (e) => {
		const t = cn;
		return (
			jc(e),
			e.scope.on(),
			() => {
				e.scope.off(), jc(t);
			}
		);
	},
	Ev = () => {
		cn && cn.scope.off(), jc();
	};
function Xy(e) {
	return e.vnode.shapeFlag & 4;
}
let Xl = !1;
function Uk(e, t = !1, r = !1) {
	t && Md(t);
	const { props: o, children: s } = e.vnode,
		c = Xy(e);
	pk(e, o, c, t), yk(e, s, r);
	const f = c ? Vk(e, t) : void 0;
	return t && Md(!1), f;
}
function Vk(e, t) {
	const r = e.type;
	(e.accessCache = Object.create(null)), (e.proxy = new Proxy(e.ctx, ik));
	const { setup: o } = r;
	if (o) {
		io();
		const s = (e.setupContext = o.length > 1 ? Zy(e) : undefined),
			c = ma(e),
			f = pa(o, e, 0, [e.props, s]),
			d = O0(f);
		if ((oo(), c(), (d || e.sp) && !Ss(e) && xy(e), d)) {
			if ((f.then(Ev, Ev), t)) {
				return f
					.then((h) => {
						Nd(e, h, t);
					})
					.catch((error) => {
						ga(error, e, 0);
					});
			}
			e.asyncDep = f;
		} else {
			Nd(e, f, t);
		}
	} else {
		Yy(e, t);
	}
}
function Nd(e, t, r) {
	Ke(t)
		? (e.type.__ssrInlineRender
			? (e.ssrRender = t)
			: (e.render = t))
		: _t(t) && (e.setupState = oy(t)),
		Yy(e, r);
}
let Lv;
function Yy(e, t, r) {
	const o = e.type;
	if (!e.render) {
		if (!t && Lv && !o.render) {
			const s = o.template || Lh(e).template;
			if (s) {
				const { isCustomElement: c, compilerOptions: f } = e.appContext.config,
					{ delimiters: d, compilerOptions: h } = o,
					p = Wt(Wt({ isCustomElement: c, delimiters: d }, f), h);
				o.render = Lv(s, p);
			}
		}
		e.render = o.render || Fr;
	}
	{
		const s = ma(e);
		io();
		try {
			lk(e);
		} finally {
			oo(), s();
		}
	}
}
const jk = {
	get(e, t) {
		return hn(e, "get", ""), e[t];
	},
};
function Zy(e) {
	const t = (r) => {
		e.exposed = r || {};
	};
	return {
		attrs: new Proxy(e.attrs, jk),
		slots: e.slots,
		emit: e.emit,
		expose: t,
	};
}
function Mu(e) {
	return e.exposed
		? e.exposeProxy ||
				(e.exposeProxy = new Proxy(oy(kh(e.exposed)), {
					get(t, r) {
						if (r in t) {
							return t[r];
						}
						if (r in Ol) {
							return Ol[r](e);
						}
					},
					has(t, r) {
						return r in t || r in Ol;
					},
				}))
		: e.proxy;
}
function Gk(e, t = !0) {
	return Ke(e) ? e.displayName || e.name : e.name || (t && e.__name);
}
function Kk(e) {
	return Ke(e) && "__vccOpts" in e;
}
const Te = (e, t) => D_(e, t, Xl);
function ya(e, t, r) {
	const o = arguments.length;
	return o === 2
		? _t(t) && !Fe(t)
			? $s(t)
				? Pe(e, undefined, [t])
				: Pe(e, t)
			: Pe(e, undefined, t)
		: (o > 3
				? (r = Array.prototype.slice.call(arguments, 2))
				: o === 3 && $s(r) && (r = [r]),
			Pe(e, t, r));
}
const Xk = "3.5.12"; /**
 * @vue/runtime-dom v3.5.12
 * (c) 2018-present Yuxi (Evan) You and Vue contributors
 * @license MIT
 */

let $d;
const Av = typeof window < "u" && window.trustedTypes;
if (Av) {
	try {
		$d = Av.createPolicy("vue", { createHTML: (e) => e });
	} catch {}
}
const Jy = $d ? (e) => $d.createHTML(e) : (e) => e,
	Yk = "http://www.w3.org/2000/svg",
	Zk = "http://www.w3.org/1998/Math/MathML",
	li = typeof document < "u" ? document : undefined,
	Mv = li && li.createElement("template"),
	Jk = {
		insert: (e, t, r) => {
			t.insertBefore(e, r || undefined);
		},
		remove: (e) => {
			const t = e.parentNode;
			t && t.removeChild(e);
		},
		createElement: (e, t, r, o) => {
			const s =
				t === "svg"
					? li.createElementNS(Yk, e)
					: t === "mathml"
						? li.createElementNS(Zk, e)
						: r
							? li.createElement(e, { is: r })
							: li.createElement(e);
			return (
				e === "select" &&
					o &&
					o.multiple != undefined &&
					s.setAttribute("multiple", o.multiple),
				s
			);
		},
		createText: (e) => li.createTextNode(e),
		createComment: (e) => li.createComment(e),
		setText: (e, t) => {
			e.nodeValue = t;
		},
		setElementText: (e, t) => {
			e.textContent = t;
		},
		parentNode: (e) => e.parentNode,
		nextSibling: (e) => e.nextSibling,
		querySelector: (e) => li.querySelector(e),
		setScopeId(e, t) {
			e.setAttribute(t, "");
		},
		insertStaticContent(e, t, r, o, s, c) {
			const f = r ? r.previousSibling : t.lastChild;
			if (s && (s === c || s.nextSibling)) {
				while (
					(t.insertBefore(s.cloneNode(!0), r),
					!(s === c || !(s = s.nextSibling)))
				) {}
			} else {
				Mv.innerHTML = Jy(
					o === "svg"
						? `<svg>${e}</svg>`
						: (o === "mathml"
							? `<math>${e}</math>`
							: e),
				);
				const d = Mv.content;
				if (o === "svg" || o === "mathml") {
					const h = d.firstChild;
					while (h.firstChild) {
						d.append(h.firstChild);
					}
					d.removeChild(h);
				}
				t.insertBefore(d, r);
			}
			return [
				f ? f.nextSibling : t.firstChild,
				r ? r.previousSibling : t.lastChild,
			];
		},
	},
	Oi = "transition",
	Sl = "animation",
	Yl = Symbol("_vtc"),
	Qy = {
		name: String,
		type: String,
		css: { type: Boolean, default: !0 },
		duration: [String, Number, Object],
		enterFromClass: String,
		enterActiveClass: String,
		enterToClass: String,
		appearFromClass: String,
		appearActiveClass: String,
		appearToClass: String,
		leaveFromClass: String,
		leaveActiveClass: String,
		leaveToClass: String,
	},
	Qk = Wt({}, vy, Qy),
	eT = (e) => ((e.displayName = "Transition"), (e.props = Qk), e),
	tT = eT((e, { slots: t }) => ya(U_, nT(e), t)),
	xo = (e, t = []) => {
		Fe(e) ? e.forEach((r) => r(...t)) : e && e(...t);
	},
	Nv = (e) => (e ? (Fe(e) ? e.some((t) => t.length > 1) : e.length > 1) : !1);
function nT(e) {
	const t = {};
	for (const Z in e) {
		Z in Qy || (t[Z] = e[Z]);
	}
	if (e.css === !1) {
		return t;
	}
	const {
			name: r = "v",
			type: o,
			duration: s,
			enterFromClass: c = `${r}-enter-from`,
			enterActiveClass: f = `${r}-enter-active`,
			enterToClass: d = `${r}-enter-to`,
			appearFromClass: h = c,
			appearActiveClass: p = f,
			appearToClass: v = d,
			leaveFromClass: m = `${r}-leave-from`,
			leaveActiveClass: b = `${r}-leave-active`,
			leaveToClass: w = `${r}-leave-to`,
		} = e,
		M = rT(s),
		C = M && M[0],
		E = M && M[1],
		{
			onBeforeEnter: L,
			onEnter: N,
			onEnterCancelled: P,
			onLeave: A,
			onLeaveCancelled: z,
			onBeforeAppear: W = L,
			onAppear: U = N,
			onAppearCancelled: re = P,
		} = t,
		Q = (Z, q, F) => {
			So(Z, q ? v : d), So(Z, q ? p : f), F && F();
		},
		G = (Z, q) => {
			(Z._isLeaving = !1), So(Z, m), So(Z, w), So(Z, b), q && q();
		},
		te = (Z) => (q, F) => {
			const k = Z ? U : N,
				B = () => Q(q, Z, F);
			xo(k, [q, B]),
				$v(() => {
					So(q, Z ? h : c), Ri(q, Z ? v : d), Nv(k) || Pv(q, o, C, B);
				});
		};
	return Wt(t, {
		onBeforeEnter(Z) {
			xo(L, [Z]), Ri(Z, c), Ri(Z, f);
		},
		onBeforeAppear(Z) {
			xo(W, [Z]), Ri(Z, h), Ri(Z, p);
		},
		onEnter: te(!1),
		onAppear: te(!0),
		onLeave(Z, q) {
			Z._isLeaving = !0;
			const F = () => G(Z, q);
			Ri(Z, m),
				Ri(Z, b),
				sT(),
				$v(() => {
					Z._isLeaving && (So(Z, m), Ri(Z, w), Nv(A) || Pv(Z, o, E, F));
				}),
				xo(A, [Z, F]);
		},
		onEnterCancelled(Z) {
			Q(Z, !1), xo(P, [Z]);
		},
		onAppearCancelled(Z) {
			Q(Z, !0), xo(re, [Z]);
		},
		onLeaveCancelled(Z) {
			G(Z), xo(z, [Z]);
		},
	});
}
function rT(e) {
	if (e == undefined) {
		return ;
	}
	if (_t(e)) {
		return [Qf(e.enter), Qf(e.leave)];
	}
	{
		const t = Qf(e);
		return [t, t];
	}
}
function Qf(e) {
	return I0(e);
}
function Ri(e, t) {
	t.split(/\s+/).forEach((r) => r && e.classList.add(r)),
		(e[Yl] || (e[Yl] = new Set())).add(t);
}
function So(e, t) {
	t.split(/\s+/).forEach((o) => o && e.classList.remove(o));
	const r = e[Yl];
	r && (r.delete(t), r.size || (e[Yl] = void 0));
}
function $v(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
let iT = 0;
function Pv(e, t, r, o) {
	const s = (e._endId = ++iT),
		c = () => {
			s === e._endId && o();
		};
	if (r != undefined) {
		return setTimeout(c, r);
	}
	const { type: f, timeout: d, propCount: h } = oT(e, t);
	if (!f) {
		return o();
	}
	const p = f + "end";
	let v = 0;
	const m = () => {
			e.removeEventListener(p, b), c();
		},
		b = (w) => {
			w.target === e && ++v >= h && m();
		};
	setTimeout(() => {
		v < h && m();
	}, d + 1),
		e.addEventListener(p, b);
}
function oT(e, t) {
	const r = window.getComputedStyle(e),
		o = (M) => (r[M] || "").split(", "),
		s = o(`${Oi}Delay`),
		c = o(`${Oi}Duration`),
		f = Ov(s, c),
		d = o(`${Sl}Delay`),
		h = o(`${Sl}Duration`),
		p = Ov(d, h);
	let v,
		m = 0,
		b = 0;
	t === Oi
		? f > 0 && ((v = Oi), (m = f), (b = c.length))
		: (t === Sl
			? p > 0 && ((v = Sl), (m = p), (b = h.length))
			: ((m = Math.max(f, p)),
				(v = m > 0 ? (f > p ? Oi : Sl) : null),
				(b = v ? (v === Oi ? c.length : h.length) : 0)));
	const w =
		v === Oi && /\b(transform|all)(,|$)/.test(o(`${Oi}Property`).toString());
	return { type: v, timeout: m, propCount: b, hasTransform: w };
}
function Ov(e, t) {
	while (e.length < t.length) {
		e = e.concat(e);
	}
	return Math.max(...t.map((r, o) => Rv(r) + Rv(e[o])));
}
function Rv(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function sT() {
	return document.body.offsetHeight;
}
function lT(e, t, r) {
	const o = e[Yl];
	o && (t = (t ? [t, ...o] : [...o]).join(" ")),
		t == undefined
			? e.removeAttribute("class")
			: (r
				? e.setAttribute("class", t)
				: (e.className = t));
}
const Gc = Symbol("_vod"),
	eb = Symbol("_vsh"),
	Gi = {
		beforeMount(e, { value: t }, { transition: r }) {
			(e[Gc] = e.style.display === "none" ? "" : e.style.display),
				r && t ? r.beforeEnter(e) : _l(e, t);
		},
		mounted(e, { value: t }, { transition: r }) {
			r && t && r.enter(e);
		},
		updated(e, { value: t, oldValue: r }, { transition: o }) {
			!t != !r &&
				(o
					? (t
						? (o.beforeEnter(e), _l(e, !0), o.enter(e))
						: o.leave(e, () => {
								_l(e, !1);
							}))
					: _l(e, t));
		},
		beforeUnmount(e, { value: t }) {
			_l(e, t);
		},
	};
function _l(e, t) {
	(e.style.display = t ? e[Gc] : "none"), (e[eb] = !t);
}
const aT = Symbol(""),
	cT = /(^|;)\s*display\s*:/;
function uT(e, t, r) {
	const o = e.style,
		s = Ot(r);
	let c = !1;
	if (r && !s) {
		if (t) {
			if (Ot(t)) {
				for (const f of t.split(";")) {
					const d = f.slice(0, f.indexOf(":")).trim();
					r[d] == undefined && Cc(o, d, "");
				}
			} else {
				for (const f in t) {r[f] == null && Cc(o, f, "");}
			}
		}
		for (const f in r) {
			f === "display" && (c = !0), Cc(o, f, r[f]);
		}
	} else if (s) {
		if (t !== r) {
			const f = o[aT];
			f && (r += ";" + f), (o.cssText = r), (c = cT.test(r));
		}
	} else {
		t && e.removeAttribute("style");
	}
	Gc in e && ((e[Gc] = c ? o.display : ""), e[eb] && (o.display = "none"));
}
const Dv = /\s*!important$/;
function Cc(e, t, r) {
	if (Fe(r)) {
		r.forEach((o) => Cc(e, t, o));
	} else if ((r == undefined && (r = ""), t.startsWith("--"))) {
		e.setProperty(t, r);
	} else {
		const o = fT(e, t);
		Dv.test(r)
			? e.setProperty(yi(o), r.replace(Dv, ""), "important")
			: (e[o] = r);
	}
}
const zv = ["Webkit", "Moz", "ms"],
	ed = {};
function fT(e, t) {
	const r = ed[t];
	if (r) {
		return r;
	}
	let o = Jn(t);
	if (o !== "filter" && o in e) {
		return (ed[t] = o);
	}
	o = mu(o);
	for (let s = 0; s < zv.length; s++) {
		const c = zv[s] + o;
		if (c in e) {
			return (ed[t] = c);
		}
	}
	return t;
}
const Iv = "http://www.w3.org/1999/xlink";
function Fv(e, t, r, o, s, c = s_(t)) {
	o && t.startsWith("xlink:")
		? (r == null
			? e.removeAttributeNS(Iv, t.slice(6, t.length))
			: e.setAttributeNS(Iv, t, r))
		: (r == null || (c && !F0(r))
			? e.removeAttribute(t)
			: e.setAttribute(t, c ? "" : Tr(r) ? String(r) : r));
}
function Hv(e, t, r, o, s) {
	if (t === "innerHTML" || t === "textContent") {
		r != undefined && (e[t] = t === "innerHTML" ? Jy(r) : r);
		return;
	}
	const c = e.tagName;
	if (t === "value" && c !== "PROGRESS" && !c.includes("-")) {
		const d = c === "OPTION" ? e.getAttribute("value") || "" : e.value,
			h = r == undefined ? (e.type === "checkbox" ? "on" : "") : String(r);
		(d !== h || !("_value" in e)) && (e.value = h),
			r == undefined && e.removeAttribute(t),
			(e._value = r);
		return;
	}
	let f = !1;
	if (r === "" || r == undefined) {
		const d = typeof e[t];
		d === "boolean"
			? (r = F0(r))
			: (r == null && d === "string"
				? ((r = ""), (f = !0))
				: d === "number" && ((r = 0), (f = !0)));
	}
	try {
		e[t] = r;
	} catch {}
	f && e.removeAttribute(s || t);
}
function Co(e, t, r, o) {
	e.addEventListener(t, r, o);
}
function dT(e, t, r, o) {
	e.removeEventListener(t, r, o);
}
const qv = Symbol("_vei");
function hT(e, t, r, o, s) {
	const c = e[qv] || (e[qv] = {}),
		f = c[t];
	if (o && f) {
		f.value = o;
	} else {
		const [d, h] = pT(t);
		if (o) {
			const p = (c[t] = mT(o, s));
			Co(e, d, p, h);
		} else {
			f && (dT(e, d, f, h), (c[t] = void 0));
		}
	}
}
const Bv = /(?:Once|Passive|Capture)$/;
function pT(e) {
	let t;
	if (Bv.test(e)) {
		t = {};
		let o;
		while ((o = e.match(Bv))) {
			(e = e.slice(0, e.length - o[0].length)), (t[o[0].toLowerCase()] = !0);
		}
	}
	return [e[2] === ":" ? e.slice(3) : yi(e.slice(2)), t];
}
let td = 0;
const gT = Promise.resolve(),
	vT = () => td || (gT.then(() => (td = 0)), (td = Date.now()));
function mT(e, t) {
	const r = (o) => {
		if (!o._vts) {
			o._vts = Date.now();
		} else if (o._vts <= r.attached) {
			return;
		}
		Cr(yT(o, r.value), t, 5, [o]);
	};
	return (r.value = e), (r.attached = vT()), r;
}
function yT(e, t) {
	if (Fe(t)) {
		const r = e.stopImmediatePropagation;
		return (
			(e.stopImmediatePropagation = () => {
				r.call(e), (e._stopped = !0);
			}),
			t.map((o) => (s) => !s._stopped && o && o(s))
		);
	}
	return t;
}
const Wv = (e) =>
		e.codePointAt(0) === 111 &&
		e.codePointAt(1) === 110 &&
		e.codePointAt(2) > 96 &&
		e.codePointAt(2) < 123,
	bT = (e, t, r, o, s, c) => {
		const f = s === "svg";
		t === "class"
			? lT(e, o, f)
			: t === "style"
				? uT(e, r, o)
				: pu(t)
					? ph(t) || hT(e, t, r, o, c)
					: (
								t[0] === "."
									? ((t = t.slice(1)), !0)
									: t[0] === "^"
										? ((t = t.slice(1)), !1)
										: wT(e, t, o, f)
							)
						? (Hv(e, t, o),
							!e.tagName.includes("-") &&
								(t === "value" || t === "checked" || t === "selected") &&
								Fv(e, t, o, f, c, t !== "value"))
						: e._isVueCE && (/[A-Z]/.test(t) || !Ot(o))
							? Hv(e, Jn(t), o, c, t)
							: (t === "true-value"
									? (e._trueValue = o)
									: t === "false-value" && (e._falseValue = o),
								Fv(e, t, o, f));
	};
function wT(e, t, r, o) {
	if (o) {
		return !!(
			t === "innerHTML" ||
			t === "textContent" ||
			(t in e && Wv(t) && Ke(r))
		);
	}
	if (
		t === "spellcheck" ||
		t === "draggable" ||
		t === "translate" ||
		t === "form" ||
		(t === "list" && e.tagName === "INPUT") ||
		(t === "type" && e.tagName === "TEXTAREA")
	) {
		return !1;
	}
	if (t === "width" || t === "height") {
		const s = e.tagName;
		if (s === "IMG" || s === "VIDEO" || s === "CANVAS" || s === "SOURCE") {
			return !1;
		}
	}
	return Wv(t) && Ot(r) ? !1 : t in e;
}
const Kc = (e) => {
	const t = e.props["onUpdate:modelValue"] || !1;
	return Fe(t) ? (r) => _c(t, r) : t;
};
function xT(e) {
	e.target.composing = !0;
}
function Uv(e) {
	const t = e.target;
	t.composing && ((t.composing = !1), t.dispatchEvent(new Event("input")));
}
const Ts = Symbol("_assign"),
	ST = {
		created(e, { modifiers: { lazy: t, trim: r, number: o } }, s) {
			e[Ts] = Kc(s);
			const c = o || (s.props && s.props.type === "number");
			Co(e, t ? "change" : "input", (f) => {
				if (f.target.composing) {
					return;
				}
				let d = e.value;
				r && (d = d.trim()), c && (d = md(d)), e[Ts](d);
			}),
				r &&
					Co(e, "change", () => {
						e.value = e.value.trim();
					}),
				t ||
					(Co(e, "compositionstart", xT),
					Co(e, "compositionend", Uv),
					Co(e, "change", Uv));
		},
		mounted(e, { value: t }) {
			e.value = t ?? "";
		},
		beforeUpdate(
			e,
			{ value: t, oldValue: r, modifiers: { lazy: o, trim: s, number: c } },
			f,
		) {
			if (((e[Ts] = Kc(f)), e.composing)) {
				return;
			}
			const d =
					(c || e.type === "number") && !/^0\d/.test(e.value)
						? md(e.value)
						: e.value,
				h = t ?? "";
			d !== h &&
				((document.activeElement === e &&
					e.type !== "range" &&
					((o && t === r) || (s && e.value.trim() === h))) ||
					(e.value = h));
		},
	},
	_T = {
		deep: !0,
		created(e, t, r) {
			(e[Ts] = Kc(r)),
				Co(e, "change", () => {
					const o = e._modelValue,
						s = kT(e),
						c = e.checked,
						f = e[Ts];
					if (Fe(o)) {
						const d = H0(o, s),
							h = d !== -1;
						if (c && !h) {
							f(o.concat(s));
						} else if (!c && h) {
							const p = [...o];
							p.splice(d, 1), f(p);
						}
					} else if (gu(o)) {
						const d = new Set(o);
						c ? d.add(s) : d.delete(s), f(d);
					} else {
						f(tb(e, c));
					}
				});
		},
		mounted: Vv,
		beforeUpdate(e, t, r) {
			(e[Ts] = Kc(r)), Vv(e, t, r);
		},
	};
function Vv(e, { value: t, oldValue: r }, o) {
	e._modelValue = t;
	let s;
	if (Fe(t)) {
		s = H0(t, o.props.value) > -1;
	} else if (gu(t)) {
		s = t.has(o.props.value);
	} else {
		if (t === r) {
			return;
		}
		s = bu(t, tb(e, !0));
	}
	e.checked !== s && (e.checked = s);
}
function kT(e) {
	return "_value" in e ? e._value : e.value;
}
function tb(e, t) {
	const r = t ? "_trueValue" : "_falseValue";
	return r in e ? e[r] : t;
}
const TT = ["ctrl", "shift", "alt", "meta"],
	CT = {
		stop: (e) => e.stopPropagation(),
		prevent: (e) => e.preventDefault(),
		self: (e) => e.target !== e.currentTarget,
		ctrl: (e) => !e.ctrlKey,
		shift: (e) => !e.shiftKey,
		alt: (e) => !e.altKey,
		meta: (e) => !e.metaKey,
		left: (e) => "button" in e && e.button !== 0,
		middle: (e) => "button" in e && e.button !== 1,
		right: (e) => "button" in e && e.button !== 2,
		exact: (e, t) => TT.some((r) => e[`${r}Key`] && !t.includes(r)),
	},
	Ec = (e, t) => {
		const r = e._withMods || (e._withMods = {}),
			o = t.join(".");
		return (
			r[o] ||
			(r[o] = (s, ...c) => {
				for (let f = 0; f < t.length; f++) {
					const d = CT[t[f]];
					if (d && d(s, t)) {
						return;
					}
				}
				return e(s, ...c);
			})
		);
	},
	ET = {
		esc: "escape",
		space: " ",
		up: "arrow-up",
		left: "arrow-left",
		right: "arrow-right",
		down: "arrow-down",
		delete: "backspace",
	},
	Pd = (e, t) => {
		const r = e._withKeys || (e._withKeys = {}),
			o = t.join(".");
		return (
			r[o] ||
			(r[o] = (s) => {
				if (!("key" in s)) {
					return;
				}
				const c = yi(s.key);
				if (t.some((f) => f === c || ET[f] === c)) {
					return e(s);
				}
			})
		);
	},
	LT = Wt({ patchProp: bT }, Jk);
let jv;
function AT() {
	return jv || (jv = wk(LT));
}
const nb = (...e) => {
	const t = AT().createApp(...e),
		{ mount: r } = t;
	return (
		(t.mount = (o) => {
			const s = NT(o);
			if (!s) {
				return;
			}
			const c = t._component;
			!(Ke(c) || c.render || c.template) && (c.template = s.innerHTML),
				s.nodeType === 1 && (s.textContent = "");
			const f = r(s, !1, MT(s));
			return (
				s instanceof Element &&
					(s.removeAttribute("v-cloak"), s.setAttribute("data-v-app", "")),
				f
			);
		}),
		t
	);
};
function MT(e) {
	if (e instanceof SVGElement) {
		return "svg";
	}
	if (typeof MathMLElement === "function" && e instanceof MathMLElement) {
		return "mathml";
	}
}
function NT(e) {
	return Ot(e) ? document.querySelector(e) : e;
}
const Kr = (e, t) => {
		const r = e.__vccOpts || e;
		for (const [o, s] of t) {
			r[o] = s;
		}
		return r;
	},
	$T = {};
function PT(e, t) {
	const r = Po("RouterView");
	return oe(), rt(r);
}
const OT = Kr($T, [["render", PT]]),
	RT = ["top", "right", "bottom", "left"],
	Gv = ["start", "end"],
	Kv = RT.reduce((e, t) => e.concat(t, t + "-" + Gv[0], t + "-" + Gv[1]), []),
	Zl = Math.min,
	To = Math.max,
	DT = { left: "right", right: "left", bottom: "top", top: "bottom" },
	zT = { start: "end", end: "start" };
function Od(e, t, r) {
	return To(e, Zl(t, r));
}
function zo(e, t) {
	return typeof e === "function" ? e(t) : e;
}
function Ur(e) {
	return e.split("-")[0];
}
function _r(e) {
	return e.split("-")[1];
}
function rb(e) {
	return e === "x" ? "y" : "x";
}
function Oh(e) {
	return e === "y" ? "height" : "width";
}
function ba(e) {
	return ["top", "bottom"].includes(Ur(e)) ? "y" : "x";
}
function Rh(e) {
	return rb(ba(e));
}
function ib(e, t, r) {
	r === void 0 && (r = !1);
	const o = _r(e),
		s = Rh(e),
		c = Oh(s);
	let f =
		s === "x"
			? (o === (r ? "end" : "start")
				? "right"
				: "left")
			: (o === "start"
				? "bottom"
				: "top");
	return t.reference[c] > t.floating[c] && (f = Yc(f)), [f, Yc(f)];
}
function IT(e) {
	const t = Yc(e);
	return [Xc(e), t, Xc(t)];
}
function Xc(e) {
	return e.replaceAll(/start|end/g, (t) => zT[t]);
}
function FT(e, t, r) {
	const o = ["left", "right"],
		s = ["right", "left"],
		c = ["top", "bottom"],
		f = ["bottom", "top"];
	switch (e) {
		case "top":
		case "bottom": {
			return r ? (t ? s : o) : (t ? o : s);
		}
		case "left":
		case "right": {
			return t ? c : f;
		}
		default: {
			return [];
		}
	}
}
function HT(e, t, r, o) {
	const s = _r(e);
	let c = FT(Ur(e), r === "start", o);
	return (
		s && ((c = c.map((f) => f + "-" + s)), t && (c = c.concat(c.map(Xc)))), c
	);
}
function Yc(e) {
	return e.replaceAll(/left|right|bottom|top/g, (t) => DT[t]);
}
function qT(e) {
	return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function ob(e) {
	return typeof e !== "number"
		? qT(e)
		: { top: e, right: e, bottom: e, left: e };
}
function Dl(e) {
	return {
		...e,
		top: e.y,
		left: e.x,
		right: e.x + e.width,
		bottom: e.y + e.height,
	};
}
function Xv(e, t, r) {
	const { reference: o, floating: s } = e;
	const c = ba(t),
		f = Rh(t),
		d = Oh(f),
		h = Ur(t),
		p = c === "y",
		v = o.x + o.width / 2 - s.width / 2,
		m = o.y + o.height / 2 - s.height / 2,
		b = o[d] / 2 - s[d] / 2;
	let w;
	switch (h) {
		case "top": {
			w = { x: v, y: o.y - s.height };
			break;
		}
		case "bottom": {
			w = { x: v, y: o.y + o.height };
			break;
		}
		case "right": {
			w = { x: o.x + o.width, y: m };
			break;
		}
		case "left": {
			w = { x: o.x - s.width, y: m };
			break;
		}
		default: {
			w = { x: o.x, y: o.y };
		}
	}
	switch (_r(t)) {
		case "start": {
			w[f] -= b * (r && p ? -1 : 1);
			break;
		}
		case "end": {
			w[f] += b * (r && p ? -1 : 1);
			break;
		}
	}
	return w;
}
const BT = async (e, t, r) => {
	const {
			placement: o = "bottom",
			strategy: s = "absolute",
			middleware: c = [],
			platform: f,
		} = r,
		d = c.filter(Boolean),
		h = await (f.isRTL == undefined ? void 0 : f.isRTL(t));
	let p = await f.getElementRects({ reference: e, floating: t, strategy: s }),
		{ x: v, y: m } = Xv(p, o, h),
		b = o,
		w = {},
		M = 0;
	for (let C = 0; C < d.length; C++) {
		const { name: E, fn: L } = d[C],
			{
				x: N,
				y: P,
				data: A,
				reset: z,
			} = await L({
				x: v,
				y: m,
				initialPlacement: o,
				placement: b,
				strategy: s,
				middlewareData: w,
				rects: p,
				platform: f,
				elements: { reference: e, floating: t },
			});
		(v = N ?? v),
			(m = P ?? m),
			(w = { ...w, [E]: { ...w[E], ...A } }),
			z &&
				M <= 50 &&
				(M++,
				typeof z === "object" &&
					(z.placement && (b = z.placement),
					z.rects &&
						(p =
							z.rects === !0
								? await f.getElementRects({
										reference: e,
										floating: t,
										strategy: s,
									})
								: z.rects),
					({ x: v, y: m } = Xv(p, b, h))),
				(C = -1));
	}
	return { x: v, y: m, placement: b, strategy: s, middlewareData: w };
};
async function Nu(e, t) {
	let r;
	t === void 0 && (t = {});
	const { x: o, y: s, platform: c, rects: f, elements: d, strategy: h } = e,
		{
			boundary: p = "clippingAncestors",
			rootBoundary: v = "viewport",
			elementContext: m = "floating",
			altBoundary: b = !1,
			padding: w = 0,
		} = zo(t, e),
		M = ob(w),
		E = d[b ? (m === "floating" ? "reference" : "floating") : m],
		L = Dl(
			await c.getClippingRect({
				element:
					(r = await (c.isElement == undefined ? void 0 : c.isElement(E))) ==
						undefined || r
						? E
						: E.contextElement ||
							(await (c.getDocumentElement == undefined
								? void 0
								: c.getDocumentElement(d.floating))),
				boundary: p,
				rootBoundary: v,
				strategy: h,
			}),
		),
		N = m === "floating" ? { ...f.floating, x: o, y: s } : f.reference,
		P = await (c.getOffsetParent == undefined
			? void 0
			: c.getOffsetParent(d.floating)),
		A = (await (c.isElement == undefined ? void 0 : c.isElement(P)))
			? (await (c.getScale == undefined ? void 0 : c.getScale(P))) || {
					x: 1,
					y: 1,
				}
			: { x: 1, y: 1 },
		z = Dl(
			c.convertOffsetParentRelativeRectToViewportRelativeRect
				? await c.convertOffsetParentRelativeRectToViewportRelativeRect({
						elements: d,
						rect: N,
						offsetParent: P,
						strategy: h,
					})
				: N,
		);
	return {
		top: (L.top - z.top + M.top) / A.y,
		bottom: (z.bottom - L.bottom + M.bottom) / A.y,
		left: (L.left - z.left + M.left) / A.x,
		right: (z.right - L.right + M.right) / A.x,
	};
}
const WT = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		const {
				x: r,
				y: o,
				placement: s,
				rects: c,
				platform: f,
				elements: d,
				middlewareData: h,
			} = t,
			{ element: p, padding: v = 0 } = zo(e, t) || {};
		if (p == undefined) {
			return {};
		}
		const m = ob(v),
			b = { x: r, y: o },
			w = Rh(s),
			M = Oh(w),
			C = await f.getDimensions(p),
			E = w === "y",
			L = E ? "top" : "left",
			N = E ? "bottom" : "right",
			P = E ? "clientHeight" : "clientWidth",
			A = c.reference[M] + c.reference[w] - b[w] - c.floating[M],
			z = b[w] - c.reference[w],
			W = await (f.getOffsetParent == undefined
				? void 0
				: f.getOffsetParent(p));
		let U = W ? W[P] : 0;
		!(U && (await (f.isElement == undefined ? void 0 : f.isElement(W)))) &&
			(U = d.floating[P] || c.floating[M]);
		const re = A / 2 - z / 2,
			Q = U / 2 - C[M] / 2 - 1,
			G = Zl(m[L], Q),
			te = Zl(m[N], Q),
			Z = G,
			q = U - C[M] - te,
			F = U / 2 - C[M] / 2 + re,
			k = Od(Z, F, q),
			B =
				!h.arrow &&
				_r(s) != undefined &&
				F !== k &&
				c.reference[M] / 2 - (F < Z ? G : te) - C[M] / 2 < 0,
			V = B ? (F < Z ? F - Z : F - q) : 0;
		return {
			[w]: b[w] + V,
			data: {
				[w]: k,
				centerOffset: F - k - V,
				...(B && { alignmentOffset: V }),
			},
			reset: B,
		};
	},
});
function UT(e, t, r) {
	return (
		e
			? [...r.filter((s) => _r(s) === e), ...r.filter((s) => _r(s) !== e)]
			: r.filter((s) => Ur(s) === s)
	).filter((s) => (e ? _r(s) === e || (t ? Xc(s) !== s : !1) : !0));
}
const VT = (e) => (
		e === void 0 && (e = {}),
		{
			name: "autoPlacement",
			options: e,
			async fn(t) {
				let r, o, s;
				const {
						rects: c,
						middlewareData: f,
						placement: d,
						platform: h,
						elements: p,
					} = t,
					{
						crossAxis: v = !1,
						alignment: m,
						allowedPlacements: b = Kv,
						autoAlignment: w = !0,
						...M
					} = zo(e, t),
					C = m !== void 0 || b === Kv ? UT(m || undefined, w, b) : b,
					E = await Nu(t, M),
					L = ((r = f.autoPlacement) == undefined ? void 0 : r.index) || 0,
					N = C[L];
				if (N == undefined) {
					return {};
				}
				const P = ib(
					N,
					c,
					await (h.isRTL == undefined ? void 0 : h.isRTL(p.floating)),
				);
				if (d !== N) {
					return { reset: { placement: C[0] } };
				}
				const A = [E[Ur(N)], E[P[0]], E[P[1]]],
					z = [
						...(((o = f.autoPlacement) == undefined ? void 0 : o.overflows) ||
							[]),
						{
							placement: N,
							overflows: A,
						},
					],
					W = C[L + 1];
				if (W) {
					return {
						data: { index: L + 1, overflows: z },
						reset: { placement: W },
					};
				}
				const U = z
						.map((G) => {
							const te = _r(G.placement);
							return [
								G.placement,
								te && v
									? G.overflows.slice(0, 2).reduce((Z, q) => Z + q, 0)
									: G.overflows[0],
								G.overflows,
							];
						})
						.sort((G, te) => G[1] - te[1]),
					Q =
						((s = U.filter((G) =>
							G[2].slice(0, _r(G[0]) ? 2 : 3).every((te) => te <= 0),
						)[0]) == undefined
							? void 0
							: s[0]) || U[0][0];
				return Q !== d
					? { data: { index: L + 1, overflows: z }, reset: { placement: Q } }
					: {};
			},
		}
	),
	jT = (e) => (
		e === void 0 && (e = {}),
		{
			name: "flip",
			options: e,
			async fn(t) {
				let r, o;
				const {
						placement: s,
						middlewareData: c,
						rects: f,
						initialPlacement: d,
						platform: h,
						elements: p,
					} = t,
					{
						mainAxis: v = !0,
						crossAxis: m = !0,
						fallbackPlacements: b,
						fallbackStrategy: w = "bestFit",
						fallbackAxisSideDirection: M = "none",
						flipAlignment: C = !0,
						...E
					} = zo(e, t);
				if ((r = c.arrow) != undefined && r.alignmentOffset) {
					return {};
				}
				const L = Ur(s),
					N = Ur(d) === d,
					P = await (h.isRTL == undefined ? void 0 : h.isRTL(p.floating)),
					A = b || (N || !C ? [Yc(d)] : IT(d));
				!b && M !== "none" && A.push(...HT(d, C, M, P));
				const z = [d, ...A],
					W = await Nu(t, E),
					U = [];
				let re = ((o = c.flip) == undefined ? void 0 : o.overflows) || [];
				if ((v && U.push(W[L]), m)) {
					const Z = ib(s, f, P);
					U.push(W[Z[0]], W[Z[1]]);
				}
				if (
					((re = [...re, { placement: s, overflows: U }]),
					!U.every((Z) => Z <= 0))
				) {
					let Q, G;
					const Z = (((Q = c.flip) == undefined ? void 0 : Q.index) || 0) + 1,
						q = z[Z];
					if (q) {
						return {
							data: { index: Z, overflows: re },
							reset: { placement: q },
						};
					}
					let F =
						(G = re
							.filter((k) => k.overflows[0] <= 0)
							.sort((k, B) => k.overflows[1] - B.overflows[1])[0]) == undefined
							? void 0
							: G.placement;
					if (!F) {
						switch (w) {
							case "bestFit": {
								let te;
								const k =
									(te = re
										.map((B) => [
											B.placement,
											B.overflows
												.filter((V) => V > 0)
												.reduce((V, ie) => V + ie, 0),
										])
										.sort((B, V) => B[1] - V[1])[0]) == undefined
										? void 0
										: te[0];
								k && (F = k);
								break;
							}
							case "initialPlacement": {
								F = d;
								break;
							}
						}
					}
					if (s !== F) {
						return { reset: { placement: F } };
					}
				}
				return {};
			},
		}
	);
async function GT(e, t) {
	const { placement: r, platform: o, elements: s } = e,
		c = await (o.isRTL == undefined ? void 0 : o.isRTL(s.floating)),
		f = Ur(r),
		d = _r(r),
		h = ba(r) === "y",
		p = ["left", "top"].includes(f) ? -1 : 1,
		v = c && h ? -1 : 1,
		m = zo(t, e);
	let {
		mainAxis: b,
		crossAxis: w,
		alignmentAxis: M,
	} = typeof m === "number"
		? { mainAxis: m, crossAxis: 0, alignmentAxis: undefined }
		: { mainAxis: 0, crossAxis: 0, alignmentAxis: undefined, ...m };
	return (
		d && typeof M === "number" && (w = d === "end" ? M * -1 : M),
		h ? { x: w * v, y: b * p } : { x: b * p, y: w * v }
	);
}
const KT = (e) => (
		e === void 0 && (e = 0),
		{
			name: "offset",
			options: e,
			async fn(t) {
				let r, o;
				const { x: s, y: c, placement: f, middlewareData: d } = t,
					h = await GT(t, e);
				return f === ((r = d.offset) == undefined ? void 0 : r.placement) &&
					(o = d.arrow) != undefined &&
					o.alignmentOffset
					? {}
					: { x: s + h.x, y: c + h.y, data: { ...h, placement: f } };
			},
		}
	),
	XT = (e) => (
		e === void 0 && (e = {}),
		{
			name: "shift",
			options: e,
			async fn(t) {
				const { x: r, y: o, placement: s } = t,
					{
						mainAxis: c = !0,
						crossAxis: f = !1,
						limiter: d = {
							fn: (E) => {
								const { x: L, y: N } = E;
								return { x: L, y: N };
							},
						},
						...h
					} = zo(e, t),
					p = { x: r, y: o },
					v = await Nu(t, h),
					m = ba(Ur(s)),
					b = rb(m);
				let w = p[b],
					M = p[m];
				if (c) {
					const E = b === "y" ? "top" : "left",
						L = b === "y" ? "bottom" : "right",
						N = w + v[E],
						P = w - v[L];
					w = Od(N, w, P);
				}
				if (f) {
					const E = m === "y" ? "top" : "left",
						L = m === "y" ? "bottom" : "right",
						N = M + v[E],
						P = M - v[L];
					M = Od(N, M, P);
				}
				const C = d.fn({ ...t, [b]: w, [m]: M });
				return { ...C, data: { x: C.x - r, y: C.y - o } };
			},
		}
	),
	YT = (e) => (
		e === void 0 && (e = {}),
		{
			name: "size",
			options: e,
			async fn(t) {
				const { placement: r, rects: o, platform: s, elements: c } = t,
					{ apply: f = () => {}, ...d } = zo(e, t),
					h = await Nu(t, d),
					p = Ur(r),
					v = _r(r),
					m = ba(r) === "y",
					{ width: b, height: w } = o.floating;
				let M, C;
				p === "top" || p === "bottom"
					? ((M = p),
						(C =
							v ===
							((await (s.isRTL == undefined ? void 0 : s.isRTL(c.floating)))
								? "start"
								: "end")
								? "left"
								: "right"))
					: ((C = p), (M = v === "end" ? "top" : "bottom"));
				const E = w - h[M],
					L = b - h[C],
					N = !t.middlewareData.shift;
				let P = E,
					A = L;
				if (m) {
					const W = b - h.left - h.right;
					A = v || N ? Zl(L, W) : W;
				} else {
					const W = w - h.top - h.bottom;
					P = v || N ? Zl(E, W) : W;
				}
				if (N && !v) {
					const W = To(h.left, 0),
						U = To(h.right, 0),
						re = To(h.top, 0),
						Q = To(h.bottom, 0);
					m
						? (A = b - 2 * (W !== 0 || U !== 0 ? W + U : To(h.left, h.right)))
						: (P =
								w - 2 * (re !== 0 || Q !== 0 ? re + Q : To(h.top, h.bottom)));
				}
				await f({ ...t, availableWidth: A, availableHeight: P });
				const z = await s.getDimensions(c.floating);
				return b !== z.width || w !== z.height ? { reset: { rects: !0 } } : {};
			},
		}
	);
function ir(e) {
	let t;
	return (
		((t = e.ownerDocument) == undefined ? void 0 : t.defaultView) || window
	);
}
function Hr(e) {
	return ir(e).getComputedStyle(e);
}
const Yv = Math.min,
	zl = Math.max,
	Zc = Math.round;
function sb(e) {
	const t = Hr(e);
	let r = Number.parseFloat(t.width),
		o = Number.parseFloat(t.height);
	const s = e.offsetWidth,
		c = e.offsetHeight,
		f = Zc(r) !== s || Zc(o) !== c;
	return f && ((r = s), (o = c)), { width: r, height: o, fallback: f };
}
function Qi(e) {
	return ab(e) ? (e.nodeName || "").toLowerCase() : "";
}
let ac;
function lb() {
	if (ac) {
		return ac;
	}
	const e = navigator.userAgentData;
	return e && Array.isArray(e.brands)
		? ((ac = e.brands.map((t) => t.brand + "/" + t.version).join(" ")), ac)
		: navigator.userAgent;
}
function qr(e) {
	return e instanceof ir(e).HTMLElement;
}
function Yi(e) {
	return e instanceof ir(e).Element;
}
function ab(e) {
	return e instanceof ir(e).Node;
}
function Zv(e) {
	return typeof ShadowRoot > "u"
		? !1
		: e instanceof ir(e).ShadowRoot || e instanceof ShadowRoot;
}
function $u(e) {
	const { overflow: t, overflowX: r, overflowY: o, display: s } = Hr(e);
	return (
		/auto|scroll|overlay|hidden|clip/.test(t + o + r) &&
		!["inline", "contents"].includes(s)
	);
}
function ZT(e) {
	return ["table", "td", "th"].includes(Qi(e));
}
function Rd(e) {
	const t = /firefox/i.test(lb()),
		r = Hr(e),
		o = r.backdropFilter || r.WebkitBackdropFilter;
	return (
		r.transform !== "none" ||
		r.perspective !== "none" ||
		(!!o && o !== "none") ||
		(t && r.willChange === "filter") ||
		(t && !!r.filter && r.filter !== "none") ||
		["transform", "perspective"].some((s) => r.willChange.includes(s)) ||
		["paint", "layout", "strict", "content"].some((s) => {
			const c = r.contain;
			return c != undefined && c.includes(s);
		})
	);
}
function cb() {
	return !/^((?!chrome|android).)*safari/i.test(lb());
}
function Dh(e) {
	return ["html", "body", "#document"].includes(Qi(e));
}
function ub(e) {
	return Yi(e) ? e : e.contextElement;
}
const fb = { x: 1, y: 1 };
function Cs(e) {
	const t = ub(e);
	if (!qr(t)) {
		return fb;
	}
	const r = t.getBoundingClientRect(),
		{ width: o, height: s, fallback: c } = sb(t);
	let f = (c ? Zc(r.width) : r.width) / o,
		d = (c ? Zc(r.height) : r.height) / s;
	return (
		(f && Number.isFinite(f)) || (f = 1),
		(d && Number.isFinite(d)) || (d = 1),
		{ x: f, y: d }
	);
}
function Jl(e, t, r, o) {
	let s, c;
	t === void 0 && (t = !1), r === void 0 && (r = !1);
	const f = e.getBoundingClientRect(),
		d = ub(e);
	let h = fb;
	t && (o ? Yi(o) && (h = Cs(o)) : (h = Cs(e)));
	const p = d ? ir(d) : window,
		v = !cb() && r;
	let m =
			(f.left +
				((v && ((s = p.visualViewport) == undefined ? void 0 : s.offsetLeft)) ||
					0)) /
			h.x,
		b =
			(f.top +
				((v && ((c = p.visualViewport) == undefined ? void 0 : c.offsetTop)) ||
					0)) /
			h.y,
		w = f.width / h.x,
		M = f.height / h.y;
	if (d) {
		const C = ir(d),
			E = o && Yi(o) ? ir(o) : o;
		let L = C.frameElement;
		while (L && o && E !== C) {
			const N = Cs(L),
				P = L.getBoundingClientRect(),
				A = getComputedStyle(L);
			(P.x += (L.clientLeft + Number.parseFloat(A.paddingLeft)) * N.x),
				(P.y += (L.clientTop + Number.parseFloat(A.paddingTop)) * N.y),
				(m *= N.x),
				(b *= N.y),
				(w *= N.x),
				(M *= N.y),
				(m += P.x),
				(b += P.y),
				(L = ir(L).frameElement);
		}
	}
	return {
		width: w,
		height: M,
		top: b,
		right: m + w,
		bottom: b + M,
		left: m,
		x: m,
		y: b,
	};
}
function Zi(e) {
	return ((ab(e) ? e.ownerDocument : e.document) || window.document)
		.documentElement;
}
function Pu(e) {
	return Yi(e)
		? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
		: { scrollLeft: e.pageXOffset, scrollTop: e.pageYOffset };
}
function db(e) {
	return Jl(Zi(e)).left + Pu(e).scrollLeft;
}
function Ql(e) {
	if (Qi(e) === "html") {
		return e;
	}
	const t = e.assignedSlot || e.parentNode || (Zv(e) && e.host) || Zi(e);
	return Zv(t) ? t.host : t;
}
function hb(e) {
	const t = Ql(e);
	return Dh(t) ? t.ownerDocument.body : (qr(t) && $u(t) ? t : hb(t));
}
function Jc(e, t) {
	let r;
	t === void 0 && (t = []);
	const o = hb(e),
		s = o === ((r = e.ownerDocument) == undefined ? void 0 : r.body),
		c = ir(o);
	return s
		? t.concat(c, c.visualViewport || [], $u(o) ? o : [])
		: t.concat(o, Jc(o));
}
function Jv(e, t, r) {
	return t === "viewport"
		? Dl(
				((o, s) => {
					const c = ir(o),
						f = Zi(o),
						d = c.visualViewport;
					let h = f.clientWidth,
						p = f.clientHeight,
						v = 0,
						m = 0;
					if (d) {
						(h = d.width), (p = d.height);
						const b = cb();
						(b || (!b && s === "fixed")) &&
							((v = d.offsetLeft), (m = d.offsetTop));
					}
					return { width: h, height: p, x: v, y: m };
				})(e, r),
			)
		: (Yi(t)
			? Dl(
					((o, s) => {
						const c = Jl(o, !0, s === "fixed"),
							f = c.top + o.clientTop,
							d = c.left + o.clientLeft,
							h = qr(o) ? Cs(o) : { x: 1, y: 1 };
						return {
							width: o.clientWidth * h.x,
							height: o.clientHeight * h.y,
							x: d * h.x,
							y: f * h.y,
						};
					})(t, r),
				)
			: Dl(
					((o) => {
						const s = Zi(o),
							c = Pu(o),
							f = o.ownerDocument.body,
							d = zl(
								s.scrollWidth,
								s.clientWidth,
								f.scrollWidth,
								f.clientWidth,
							),
							h = zl(
								s.scrollHeight,
								s.clientHeight,
								f.scrollHeight,
								f.clientHeight,
							);
						let p = -c.scrollLeft + db(o);
						const v = -c.scrollTop;
						return (
							Hr(f).direction === "rtl" &&
								(p += zl(s.clientWidth, f.clientWidth) - d),
							{ width: d, height: h, x: p, y: v }
						);
					})(Zi(e)),
				));
}
function Qv(e) {
	return qr(e) && Hr(e).position !== "fixed" ? e.offsetParent : undefined;
}
function em(e) {
	const t = ir(e);
	let r = Qv(e);
	while (r && ZT(r) && Hr(r).position === "static") {
		r = Qv(r);
	}
	return r &&
		(Qi(r) === "html" ||
			(Qi(r) === "body" && Hr(r).position === "static" && !Rd(r)))
		? t
		: r ||
				((o) => {
					let s = Ql(o);
					while (qr(s) && !Dh(s)) {
						if (Rd(s)) {
							return s;
						}
						s = Ql(s);
					}
					return;
				})(e) ||
				t;
}
function JT(e, t, r) {
	const o = qr(t),
		s = Zi(t),
		c = Jl(e, !0, r === "fixed", t);
	let f = { scrollLeft: 0, scrollTop: 0 };
	const d = { x: 0, y: 0 };
	if (o || (!o && r !== "fixed")) {
		if (((Qi(t) !== "body" || $u(s)) && (f = Pu(t)), qr(t))) {
			const h = Jl(t, !0);
			(d.x = h.x + t.clientLeft), (d.y = h.y + t.clientTop);
		} else {
			s && (d.x = db(s));
		}
	}
	return {
		x: c.left + f.scrollLeft - d.x,
		y: c.top + f.scrollTop - d.y,
		width: c.width,
		height: c.height,
	};
}
const QT = {
		getClippingRect(e) {
			const { element: t, boundary: r, rootBoundary: o, strategy: s } = e;
			const c =
					r === "clippingAncestors"
						? ((p, v) => {
								const m = v.get(p);
								if (m) {
									return m;
								}
								let b = Jc(p).filter((E) => Yi(E) && Qi(E) !== "body"),
									w;
								const M = Hr(p).position === "fixed";
								let C = M ? Ql(p) : p;
								while (Yi(C) && !Dh(C)) {
									const E = Hr(C),
										L = Rd(C);
									(
										M
											? L || w
											: L ||
												E.position !== "static" ||
												!w ||
												!["absolute", "fixed"].includes(w.position)
									)
										? (w = E)
										: (b = b.filter((N) => N !== C)),
										(C = Ql(C));
								}
								return v.set(p, b), b;
							})(t, this._c)
						: [].concat(r),
				f = [...c, o],
				d = f[0],
				h = f.reduce(
					(p, v) => {
						const m = Jv(t, v, s);
						return (
							(p.top = zl(m.top, p.top)),
							(p.right = Yv(m.right, p.right)),
							(p.bottom = Yv(m.bottom, p.bottom)),
							(p.left = zl(m.left, p.left)),
							p
						);
					},
					Jv(t, d, s),
				);
			return {
				width: h.right - h.left,
				height: h.bottom - h.top,
				x: h.left,
				y: h.top,
			};
		},
		convertOffsetParentRelativeRectToViewportRelativeRect(e) {
			const { rect: t, offsetParent: r, strategy: o } = e;
			const s = qr(r),
				c = Zi(r);
			if (r === c) {
				return t;
			}
			let f = { scrollLeft: 0, scrollTop: 0 },
				d = { x: 1, y: 1 };
			const h = { x: 0, y: 0 };
			if (
				(s || (!s && o !== "fixed")) &&
				((Qi(r) !== "body" || $u(c)) && (f = Pu(r)), qr(r))
			) {
				const p = Jl(r);
				(d = Cs(r)), (h.x = p.x + r.clientLeft), (h.y = p.y + r.clientTop);
			}
			return {
				width: t.width * d.x,
				height: t.height * d.y,
				x: t.x * d.x - f.scrollLeft * d.x + h.x,
				y: t.y * d.y - f.scrollTop * d.y + h.y,
			};
		},
		isElement: Yi,
		getDimensions(e) {
			return qr(e) ? sb(e) : e.getBoundingClientRect();
		},
		getOffsetParent: em,
		getDocumentElement: Zi,
		getScale: Cs,
		async getElementRects(e) {
			const { reference: t, floating: r, strategy: o } = e;
			const s = this.getOffsetParent || em,
				c = this.getDimensions;
			return {
				reference: JT(t, await s(r), o),
				floating: { x: 0, y: 0, ...(await c(r)) },
			};
		},
		getClientRects: (e) => [...e.getClientRects()],
		isRTL: (e) => Hr(e).direction === "rtl",
	},
	eC = (e, t, r) => {
		const o = new Map(),
			s = { platform: QT, ...r },
			c = { ...s.platform, _c: o };
		return BT(e, t, { ...s, platform: c });
	};
function pb(e, t) {
	for (const r in t) {
		Object.hasOwn(t, r) &&
			(typeof t[r] === "object" && e[r] ? pb(e[r], t[r]) : (e[r] = t[r]));
	}
}
const kr = {
	disabled: !1,
	distance: 5,
	skidding: 0,
	container: "body",
	boundary: void 0,
	instantMove: !1,
	disposeTimeout: 150,
	popperTriggers: [],
	strategy: "absolute",
	preventOverflow: !0,
	flip: !0,
	shift: !0,
	overflowPadding: 0,
	arrowPadding: 0,
	arrowOverflow: !0,
	autoHideOnMousedown: !1,
	themes: {
		tooltip: {
			placement: "top",
			triggers: ["hover", "focus", "touch"],
			hideTriggers: (e) => [...e, "click"],
			delay: { show: 200, hide: 0 },
			handleResize: !1,
			html: !1,
			loadingContent: "...",
		},
		dropdown: {
			placement: "bottom",
			triggers: ["click"],
			delay: 0,
			handleResize: !0,
			autoHide: !0,
		},
		menu: {
			$extend: "dropdown",
			triggers: ["hover", "focus"],
			popperTriggers: ["hover"],
			delay: { show: 0, hide: 400 },
		},
	},
};
function ea(e, t) {
	let r = kr.themes[e] || {},
		o;
	do {
		(o = r[t]),
			typeof o > "u"
				? (r.$extend
					? (r = kr.themes[r.$extend] || {})
					: ((r = null), (o = kr[t])))
				: (r = undefined);
	} while (r);
	return o;
}
function tC(e) {
	const t = [e];
	let r = kr.themes[e] || {};
	do {
		r.$extend && !r.$resetCss
			? (t.push(r.$extend), (r = kr.themes[r.$extend] || {}))
			: (r = undefined);
	} while (r);
	return t.map((o) => `v-popper--theme-${o}`);
}
function tm(e) {
	const t = [e];
	let r = kr.themes[e] || {};
	do {
		r.$extend
			? (t.push(r.$extend), (r = kr.themes[r.$extend] || {}))
			: (r = undefined);
	} while (r);
	return t;
}
let Ps = !1;
if (typeof window < "u") {
	Ps = !1;
	try {
		const e = Object.defineProperty({}, "passive", {
			get() {
				Ps = !0;
			},
		});
		window.addEventListener("test", undefined, e);
	} catch {}
}
let gb = !1;
typeof window < "u" &&
	typeof navigator < "u" &&
	(gb = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
const vb = ["auto", "top", "bottom", "left", "right"].reduce(
		(e, t) => e.concat([t, `${t}-start`, `${t}-end`]),
		[],
	),
	nm = {
		hover: "mouseenter",
		focus: "focus",
		click: "click",
		touch: "touchstart",
		pointer: "pointerdown",
	},
	rm = {
		hover: "mouseleave",
		focus: "blur",
		click: "click",
		touch: "touchend",
		pointer: "pointerup",
	};
function im(e, t) {
	const r = e.indexOf(t);
	r !== -1 && e.splice(r, 1);
}
function nd() {
	return new Promise((e) =>
		requestAnimationFrame(() => {
			requestAnimationFrame(e);
		}),
	);
}
const Kn = [];
let _o;
const om = {};
function sm(e) {
	let t = om[e];
	return t || (t = om[e] = []), t;
}
let Dd = () => {};
typeof window < "u" && (Dd = window.Element);
function at(e) {
	return (t) => ea(t.theme, e);
}
const rd = "__floating-vue__popper",
	mb = () =>
		ut({
			name: "VPopper",
			provide() {
				return { [rd]: { parentPopper: this } };
			},
			inject: { [rd]: { default: undefined } },
			props: {
				theme: { type: String, required: !0 },
				targetNodes: { type: Function, required: !0 },
				referenceNode: { type: Function, default: undefined },
				popperNode: { type: Function, required: !0 },
				shown: { type: Boolean, default: !1 },
				showGroup: { type: String, default: undefined },
				ariaId: { default: undefined },
				disabled: { type: Boolean, default: at("disabled") },
				positioningDisabled: {
					type: Boolean,
					default: at("positioningDisabled"),
				},
				placement: {
					type: String,
					default: at("placement"),
					validator: (e) => vb.includes(e),
				},
				delay: { type: [String, Number, Object], default: at("delay") },
				distance: { type: [Number, String], default: at("distance") },
				skidding: { type: [Number, String], default: at("skidding") },
				triggers: { type: Array, default: at("triggers") },
				showTriggers: { type: [Array, Function], default: at("showTriggers") },
				hideTriggers: { type: [Array, Function], default: at("hideTriggers") },
				popperTriggers: { type: Array, default: at("popperTriggers") },
				popperShowTriggers: {
					type: [Array, Function],
					default: at("popperShowTriggers"),
				},
				popperHideTriggers: {
					type: [Array, Function],
					default: at("popperHideTriggers"),
				},
				container: {
					type: [String, Object, Dd, Boolean],
					default: at("container"),
				},
				boundary: { type: [String, Dd], default: at("boundary") },
				strategy: {
					type: String,
					validator: (e) => ["absolute", "fixed"].includes(e),
					default: at("strategy"),
				},
				autoHide: { type: [Boolean, Function], default: at("autoHide") },
				handleResize: { type: Boolean, default: at("handleResize") },
				instantMove: { type: Boolean, default: at("instantMove") },
				eagerMount: { type: Boolean, default: at("eagerMount") },
				popperClass: {
					type: [String, Array, Object],
					default: at("popperClass"),
				},
				computeTransformOrigin: {
					type: Boolean,
					default: at("computeTransformOrigin"),
				},
				autoMinSize: { type: Boolean, default: at("autoMinSize") },
				autoSize: { type: [Boolean, String], default: at("autoSize") },
				autoMaxSize: { type: Boolean, default: at("autoMaxSize") },
				autoBoundaryMaxSize: {
					type: Boolean,
					default: at("autoBoundaryMaxSize"),
				},
				preventOverflow: { type: Boolean, default: at("preventOverflow") },
				overflowPadding: {
					type: [Number, String],
					default: at("overflowPadding"),
				},
				arrowPadding: { type: [Number, String], default: at("arrowPadding") },
				arrowOverflow: { type: Boolean, default: at("arrowOverflow") },
				flip: { type: Boolean, default: at("flip") },
				shift: { type: Boolean, default: at("shift") },
				shiftCrossAxis: { type: Boolean, default: at("shiftCrossAxis") },
				noAutoFocus: { type: Boolean, default: at("noAutoFocus") },
				disposeTimeout: { type: Number, default: at("disposeTimeout") },
			},
			emits: {
				show: () => !0,
				hide: () => !0,
				"update:shown": (e) => !0,
				"apply-show": () => !0,
				"apply-hide": () => !0,
				"close-group": () => !0,
				"close-directive": () => !0,
				"auto-hide": () => !0,
				resize: () => !0,
			},
			data() {
				return {
					isShown: !1,
					isMounted: !1,
					skipTransition: !1,
					classes: { showFrom: !1, showTo: !1, hideFrom: !1, hideTo: !0 },
					result: {
						x: 0,
						y: 0,
						placement: "",
						strategy: this.strategy,
						arrow: { x: 0, y: 0, centerOffset: 0 },
						transformOrigin: undefined,
					},
					randomId: `popper_${[Math.random(), Date.now()]
						.map((e) => e.toString(36).slice(2, 10))
						.join("_")}`,
					shownChildren: new Set(),
					lastAutoHide: !0,
					pendingHide: !1,
					containsGlobalTarget: !1,
					isDisposed: !0,
					mouseDownContains: !1,
				};
			},
			computed: {
				popperId() {
					return this.ariaId != undefined ? this.ariaId : this.randomId;
				},
				shouldMountContent() {
					return this.eagerMount || this.isMounted;
				},
				slotData() {
					return {
						popperId: this.popperId,
						isShown: this.isShown,
						shouldMountContent: this.shouldMountContent,
						skipTransition: this.skipTransition,
						autoHide:
							typeof this.autoHide === "function"
								? this.lastAutoHide
								: this.autoHide,
						show: this.show,
						hide: this.hide,
						handleResize: this.handleResize,
						onResize: this.onResize,
						classes: { ...this.classes, popperClass: this.popperClass },
						result: this.positioningDisabled ? undefined : this.result,
						attrs: this.$attrs,
					};
				},
				parentPopper() {
					let e;
					return (e = this[rd]) == undefined ? void 0 : e.parentPopper;
				},
				hasPopperShowTriggerHover() {
					let e, t;
					return (
						((e = this.popperTriggers) == undefined
							? void 0
							: e.includes("hover")) ||
						((t = this.popperShowTriggers) == undefined
							? void 0
							: t.includes("hover"))
					);
				},
			},
			watch: {
				shown: "$_autoShowHide",
				disabled(e) {
					e ? this.dispose() : this.init();
				},
				async container() {
					this.isShown &&
						(this.$_ensureTeleport(), await this.$_computePosition());
				},
				triggers: { handler: "$_refreshListeners", deep: !0 },
				positioningDisabled: "$_refreshListeners",
				...[
					"placement",
					"distance",
					"skidding",
					"boundary",
					"strategy",
					"overflowPadding",
					"arrowPadding",
					"preventOverflow",
					"shift",
					"shiftCrossAxis",
					"flip",
				].reduce((e, t) => ((e[t] = "$_computePosition"), e), {}),
			},
			created() {
				this.autoMinSize &&
					console.warn(
						'[floating-vue] `autoMinSize` option is deprecated. Use `autoSize="min"` instead.',
					),
					this.autoMaxSize &&
						console.warn(
							"[floating-vue] `autoMaxSize` option is deprecated. Use `autoBoundaryMaxSize` instead.",
						);
			},
			mounted() {
				this.init(), this.$_detachPopperNode();
			},
			activated() {
				this.$_autoShowHide();
			},
			deactivated() {
				this.hide();
			},
			beforeUnmount() {
				this.dispose();
			},
			methods: {
				show({ event: e, skipDelay: t = !1, force: r = !1 } = {}) {
					let o, s;
					((o = this.parentPopper) != undefined &&
						o.lockedChild &&
						this.parentPopper.lockedChild !== this) ||
						((this.pendingHide = !1),
						(r || !this.disabled) &&
							(((s = this.parentPopper) == undefined
								? void 0
								: s.lockedChild) === this &&
								(this.parentPopper.lockedChild = undefined),
							this.$_scheduleShow(e, t),
							this.$emit("show"),
							(this.$_showFrameLocked = !0),
							requestAnimationFrame(() => {
								this.$_showFrameLocked = !1;
							})),
						this.$emit("update:shown", !0));
				},
				hide({ event: e, skipDelay: t = !1 } = {}) {
					let r;
					if (!this.$_hideInProgress) {
						if (this.shownChildren.size > 0) {
							this.pendingHide = !0;
							return;
						}
						if (this.hasPopperShowTriggerHover && this.$_isAimingPopper()) {
							this.parentPopper &&
								((this.parentPopper.lockedChild = this),
								clearTimeout(this.parentPopper.lockedChildTimer),
								(this.parentPopper.lockedChildTimer = setTimeout(() => {
									this.parentPopper.lockedChild === this &&
										(this.parentPopper.lockedChild.hide({ skipDelay: t }),
										(this.parentPopper.lockedChild = undefined));
								}, 1e3)));
							return;
						}
						((r = this.parentPopper) == undefined ? void 0 : r.lockedChild) ===
							this && (this.parentPopper.lockedChild = undefined),
							(this.pendingHide = !1),
							this.$_scheduleHide(e, t),
							this.$emit("hide"),
							this.$emit("update:shown", !1);
					}
				},
				init() {
					let e;
					this.isDisposed &&
						((this.isDisposed = !1),
						(this.isMounted = !1),
						(this.$_events = []),
						(this.$_preventShow = !1),
						(this.$_referenceNode =
							((e = this.referenceNode) == undefined ? void 0 : e.call(this)) ??
							this.$el),
						(this.$_targetNodes = this.targetNodes().filter(
							(t) => t.nodeType === t.ELEMENT_NODE,
						)),
						(this.$_popperNode = this.popperNode()),
						(this.$_innerNode =
							this.$_popperNode.querySelector(".v-popper__inner")),
						(this.$_arrowNode = this.$_popperNode.querySelector(
							".v-popper__arrow-container",
						)),
						this.$_swapTargetAttrs("title", "data-original-title"),
						this.$_detachPopperNode(),
						this.triggers.length && this.$_addEventListeners(),
						this.shown && this.show());
				},
				dispose() {
					this.isDisposed ||
						((this.isDisposed = !0),
						this.$_removeEventListeners(),
						this.hide({ skipDelay: !0 }),
						this.$_detachPopperNode(),
						(this.isMounted = !1),
						(this.isShown = !1),
						this.$_updateParentShownChildren(!1),
						this.$_swapTargetAttrs("data-original-title", "title"));
				},
				async onResize() {
					this.isShown &&
						(await this.$_computePosition(), this.$emit("resize"));
				},
				async $_computePosition() {
					if (this.isDisposed || this.positioningDisabled) {
						return;
					}
					const e = { strategy: this.strategy, middleware: [] };
					(this.distance || this.skidding) &&
						e.middleware.push(
							KT({ mainAxis: this.distance, crossAxis: this.skidding }),
						);
					const t = this.placement.startsWith("auto");
					if (
						(t
							? e.middleware.push(
									VT({ alignment: this.placement.split("-")[1] ?? "" }),
								)
							: (e.placement = this.placement),
						this.preventOverflow &&
							(this.shift &&
								e.middleware.push(
									XT({
										padding: this.overflowPadding,
										boundary: this.boundary,
										crossAxis: this.shiftCrossAxis,
									}),
								),
							!t &&
								this.flip &&
								e.middleware.push(
									jT({
										padding: this.overflowPadding,
										boundary: this.boundary,
									}),
								)),
						e.middleware.push(
							WT({ element: this.$_arrowNode, padding: this.arrowPadding }),
						),
						this.arrowOverflow &&
							e.middleware.push({
								name: "arrowOverflow",
								fn: ({ placement: o, rects: s, middlewareData: c }) => {
									let f;
									const { centerOffset: d } = c.arrow;
									return (
										o.startsWith("top") || o.startsWith("bottom")
											? (f = Math.abs(d) > s.reference.width / 2)
											: (f = Math.abs(d) > s.reference.height / 2),
										{ data: { overflow: f } }
									);
								},
							}),
						this.autoMinSize || this.autoSize)
					) {
						const o = this.autoSize
							? this.autoSize
							: (this.autoMinSize
								? "min"
								: null);
						e.middleware.push({
							name: "autoSize",
							fn: ({ rects: s, placement: c, middlewareData: f }) => {
								let d;
								if ((d = f.autoSize) != undefined && d.skip) {
									return {};
								}
								let h, p;
								return (
									c.startsWith("top") || c.startsWith("bottom")
										? (h = s.reference.width)
										: (p = s.reference.height),
									(this.$_innerNode.style[
										o === "min"
											? "minWidth"
											: (o === "max"
												? "maxWidth"
												: "width")
									] = h != undefined ? `${h}px` : undefined),
									(this.$_innerNode.style[
										o === "min"
											? "minHeight"
											: (o === "max"
												? "maxHeight"
												: "height")
									] = p != undefined ? `${p}px` : undefined),
									{ data: { skip: !0 }, reset: { rects: !0 } }
								);
							},
						});
					}
					(this.autoMaxSize || this.autoBoundaryMaxSize) &&
						((this.$_innerNode.style.maxWidth = undefined),
						(this.$_innerNode.style.maxHeight = undefined),
						e.middleware.push(
							YT({
								boundary: this.boundary,
								padding: this.overflowPadding,
								apply: ({ availableWidth: o, availableHeight: s }) => {
									(this.$_innerNode.style.maxWidth =
										o != undefined ? `${o}px` : undefined),
										(this.$_innerNode.style.maxHeight =
											s != undefined ? `${s}px` : undefined);
								},
							}),
						));
					const r = await eC(this.$_referenceNode, this.$_popperNode, e);
					Object.assign(this.result, {
						x: r.x,
						y: r.y,
						placement: r.placement,
						strategy: r.strategy,
						arrow: {
							...r.middlewareData.arrow,
							...r.middlewareData.arrowOverflow,
						},
					});
				},
				$_scheduleShow(e, t = !1) {
					if (
						(this.$_updateParentShownChildren(!0),
						(this.$_hideInProgress = !1),
						clearTimeout(this.$_scheduleTimer),
						_o &&
							this.instantMove &&
							_o.instantMove &&
							_o !== this.parentPopper)
					) {
						_o.$_applyHide(!0), this.$_applyShow(!0);
						return;
					}
					t
						? this.$_applyShow()
						: (this.$_scheduleTimer = setTimeout(
								this.$_applyShow.bind(this),
								this.$_computeDelay("show"),
							));
				},
				$_scheduleHide(e, t = !1) {
					if (this.shownChildren.size > 0) {
						this.pendingHide = !0;
						return;
					}
					this.$_updateParentShownChildren(!1),
						(this.$_hideInProgress = !0),
						clearTimeout(this.$_scheduleTimer),
						this.isShown && (_o = this),
						t
							? this.$_applyHide()
							: (this.$_scheduleTimer = setTimeout(
									this.$_applyHide.bind(this),
									this.$_computeDelay("hide"),
								));
				},
				$_computeDelay(e) {
					const t = this.delay;
					return Number.parseInt((t && t[e]) || t || 0);
				},
				async $_applyShow(e = !1) {
					clearTimeout(this.$_disposeTimer),
						clearTimeout(this.$_scheduleTimer),
						(this.skipTransition = e),
						!this.isShown &&
							(this.$_ensureTeleport(),
							await nd(),
							await this.$_computePosition(),
							await this.$_applyShowEffect(),
							this.positioningDisabled ||
								this.$_registerEventListeners(
									[...Jc(this.$_referenceNode), ...Jc(this.$_popperNode)],
									"scroll",
									() => {
										this.$_computePosition();
									},
								));
				},
				async $_applyShowEffect() {
					if (this.$_hideInProgress) {
						return;
					}
					if (this.computeTransformOrigin) {
						const t = this.$_referenceNode.getBoundingClientRect(),
							r = this.$_popperNode.querySelector(".v-popper__wrapper"),
							o = r.parentNode.getBoundingClientRect(),
							s = t.x + t.width / 2 - (o.left + r.offsetLeft),
							c = t.y + t.height / 2 - (o.top + r.offsetTop);
						this.result.transformOrigin = `${s}px ${c}px`;
					}
					(this.isShown = !0),
						this.$_applyAttrsToTarget({
							"aria-describedby": this.popperId,
							"data-popper-shown": "",
						});
					const e = this.showGroup;
					if (e) {
						let t;
						for (let r = 0; r < Kn.length; r++) {
							(t = Kn[r]),
								t.showGroup !== e && (t.hide(), t.$emit("close-group"));
						}
					}
					Kn.push(this), document.body.classList.add("v-popper--some-open");
					for (const t of tm(this.theme)) {
						sm(t).push(this),
							document.body.classList.add(`v-popper--some-open--${t}`);
					}
					this.$emit("apply-show"),
						(this.classes.showFrom = !0),
						(this.classes.showTo = !1),
						(this.classes.hideFrom = !1),
						(this.classes.hideTo = !1),
						await nd(),
						(this.classes.showFrom = !1),
						(this.classes.showTo = !0),
						this.noAutoFocus || this.$_popperNode.focus();
				},
				async $_applyHide(e = !1) {
					if (this.shownChildren.size > 0) {
						(this.pendingHide = !0), (this.$_hideInProgress = !1);
						return;
					}
					if ((clearTimeout(this.$_scheduleTimer), !this.isShown)) {
						return;
					}
					(this.skipTransition = e),
						im(Kn, this),
						Kn.length === 0 &&
							document.body.classList.remove("v-popper--some-open");
					for (const r of tm(this.theme)) {
						const o = sm(r);
						im(o, this),
							o.length === 0 &&
								document.body.classList.remove(`v-popper--some-open--${r}`);
					}
					_o === this && (_o = undefined),
						(this.isShown = !1),
						this.$_applyAttrsToTarget({
							"aria-describedby": void 0,
							"data-popper-shown": void 0,
						}),
						clearTimeout(this.$_disposeTimer);
					const t = this.disposeTimeout;
					t !== null &&
						(this.$_disposeTimer = setTimeout(() => {
							this.$_popperNode &&
								(this.$_detachPopperNode(), (this.isMounted = !1));
						}, t)),
						this.$_removeEventListeners("scroll"),
						this.$emit("apply-hide"),
						(this.classes.showFrom = !1),
						(this.classes.showTo = !1),
						(this.classes.hideFrom = !0),
						(this.classes.hideTo = !1),
						await nd(),
						(this.classes.hideFrom = !1),
						(this.classes.hideTo = !0);
				},
				$_autoShowHide() {
					this.shown ? this.show() : this.hide();
				},
				$_ensureTeleport() {
					if (this.isDisposed) {
						return;
					}
					let e = this.container;
					if (
						(typeof e === "string"
							? (e = window.document.querySelector(e))
							: e === !1 && (e = this.$_targetNodes[0].parentNode),
						!e)
					) {
						throw new Error("No container for popover: " + this.container);
					}
					e.append(this.$_popperNode), (this.isMounted = !0);
				},
				$_addEventListeners() {
					const e = (r) => {
						(this.isShown && !this.$_hideInProgress) ||
							((r.usedByTooltip = !0),
							!this.$_preventShow && this.show({ event: r }));
					};
					this.$_registerTriggerListeners(
						this.$_targetNodes,
						nm,
						this.triggers,
						this.showTriggers,
						e,
					),
						this.$_registerTriggerListeners(
							[this.$_popperNode],
							nm,
							this.popperTriggers,
							this.popperShowTriggers,
							e,
						);
					const t = (r) => {
						r.usedByTooltip || this.hide({ event: r });
					};
					this.$_registerTriggerListeners(
						this.$_targetNodes,
						rm,
						this.triggers,
						this.hideTriggers,
						t,
					),
						this.$_registerTriggerListeners(
							[this.$_popperNode],
							rm,
							this.popperTriggers,
							this.popperHideTriggers,
							t,
						);
				},
				$_registerEventListeners(e, t, r) {
					this.$_events.push({ targetNodes: e, eventType: t, handler: r }),
						e.forEach((o) =>
							o.addEventListener(t, r, Ps ? { passive: !0 } : void 0),
						);
				},
				$_registerTriggerListeners(e, t, r, o, s) {
					let c = r;
					o != undefined && (c = typeof o === "function" ? o(c) : o),
						c.forEach((f) => {
							const d = t[f];
							d && this.$_registerEventListeners(e, d, s);
						});
				},
				$_removeEventListeners(e) {
					const t = [];
					this.$_events.forEach((r) => {
						const { targetNodes: o, eventType: s, handler: c } = r;
						!e || e === s
							? o.forEach((f) => f.removeEventListener(s, c))
							: t.push(r);
					}),
						(this.$_events = t);
				},
				$_refreshListeners() {
					this.isDisposed ||
						(this.$_removeEventListeners(), this.$_addEventListeners());
				},
				$_handleGlobalClose(e, t = !1) {
					this.$_showFrameLocked ||
						(this.hide({ event: e }),
						e.closePopover
							? this.$emit("close-directive")
							: this.$emit("auto-hide"),
						t &&
							((this.$_preventShow = !0),
							setTimeout(() => {
								this.$_preventShow = !1;
							}, 300)));
				},
				$_detachPopperNode() {
					this.$_popperNode.parentNode &&
						this.$_popperNode.parentNode.removeChild(this.$_popperNode);
				},
				$_swapTargetAttrs(e, t) {
					for (const r of this.$_targetNodes) {
						const o = r.getAttribute(e);
						o && (r.removeAttribute(e), r.setAttribute(t, o));
					}
				},
				$_applyAttrsToTarget(e) {
					for (const t of this.$_targetNodes) {
						for (const r in e) {
							const o = e[r];
							o == undefined ? t.removeAttribute(r) : t.setAttribute(r, o);
						}
					}
				},
				$_updateParentShownChildren(e) {
					let t = this.parentPopper;
					while (t) {
						e
							? t.shownChildren.add(this.randomId)
							: (t.shownChildren.delete(this.randomId),
								t.pendingHide && t.hide()),
							(t = t.parentPopper);
					}
				},
				$_isAimingPopper() {
					const e = this.$_referenceNode.getBoundingClientRect();
					if (Il >= e.left && Il <= e.right && Fl >= e.top && Fl <= e.bottom) {
						const t = this.$_popperNode.getBoundingClientRect(),
							r = Il - Ii,
							o = Fl - Fi,
							s =
								t.left +
								t.width / 2 -
								Ii +
								(t.top + t.height / 2) -
								Fi +
								t.width +
								t.height,
							c = Ii + r * s,
							f = Fi + o * s;
						return (
							cc(Ii, Fi, c, f, t.left, t.top, t.left, t.bottom) ||
							cc(Ii, Fi, c, f, t.left, t.top, t.right, t.top) ||
							cc(Ii, Fi, c, f, t.right, t.top, t.right, t.bottom) ||
							cc(Ii, Fi, c, f, t.left, t.bottom, t.right, t.bottom)
						);
					}
					return !1;
				},
			},
			render() {
				return this.$slots.default(this.slotData);
			},
		});
if (typeof document < "u" && typeof window < "u") {
	if (gb) {
		const e = Ps ? { passive: !0, capture: !0 } : !0;
		document.addEventListener("touchstart", (t) => lm(t, !0), e),
			document.addEventListener("touchend", (t) => am(t, !0), e);
	} else {
		window.addEventListener("mousedown", (e) => lm(e, !1), !0),
			window.addEventListener("click", (e) => am(e, !1), !0);
	}
	window.addEventListener("resize", rC);
}
function lm(e, t) {
	if (kr.autoHideOnMousedown) {
		yb(e, t);
	} else {
		for (let r = 0; r < Kn.length; r++) {
			const o = Kn[r];
			try {
				o.mouseDownContains = o.popperNode().contains(e.target);
			} catch {}
		}
	}
}
function am(e, t) {
	kr.autoHideOnMousedown || yb(e, t);
}
function yb(e, t) {
	const r = {};
	for (let o = Kn.length - 1; o >= 0; o--) {
		const s = Kn[o];
		try {
			const c = (s.containsGlobalTarget =
				s.mouseDownContains || s.popperNode().contains(e.target));
			(s.pendingHide = !1),
				requestAnimationFrame(() => {
					if (((s.pendingHide = !1), !r[s.randomId] && cm(s, c, e))) {
						if (
							(s.$_handleGlobalClose(e, t),
							!e.closeAllPopover && e.closePopover && c)
						) {
							let d = s.parentPopper;
							while (d) {
								(r[d.randomId] = !0), (d = d.parentPopper);
							}
							return;
						}
						let f = s.parentPopper;
						while (f && cm(f, f.containsGlobalTarget, e)) {
							f.$_handleGlobalClose(e, t), (f = f.parentPopper);
						}
					}
				});
		} catch {}
	}
}
function cm(e, t, r) {
	return r.closeAllPopover || (r.closePopover && t) || (nC(e, r) && !t);
}
function nC(e, t) {
	if (typeof e.autoHide === "function") {
		const r = e.autoHide(t);
		return (e.lastAutoHide = r), r;
	}
	return e.autoHide;
}
function rC() {
	for (let e = 0; e < Kn.length; e++) {
		Kn[e].$_computePosition();
	}
}
function um() {
	for (let e = 0; e < Kn.length; e++) {
		Kn[e].hide();
	}
}
let Ii = 0,
	Fi = 0,
	Il = 0,
	Fl = 0;
typeof window < "u" &&
	window.addEventListener(
		"mousemove",
		(e) => {
			(Ii = Il), (Fi = Fl), (Il = e.clientX), (Fl = e.clientY);
		},
		Ps ? { passive: !0 } : void 0,
	);
function cc(e, t, r, o, s, c, f, d) {
	const h =
			((f - s) * (t - c) - (d - c) * (e - s)) /
			((d - c) * (r - e) - (f - s) * (o - t)),
		p =
			((r - e) * (t - c) - (o - t) * (e - s)) /
			((d - c) * (r - e) - (f - s) * (o - t));
	return h >= 0 && h <= 1 && p >= 0 && p <= 1;
}
const iC = { extends: mb() },
	Ou = (e, t) => {
		const r = e.__vccOpts || e;
		for (const [o, s] of t) {
			r[o] = s;
		}
		return r;
	};
function oC(e, t, r, o, s, c) {
	return (
		oe(),
		me(
			"div",
			{
				ref: "reference",
				class: st(["v-popper", { "v-popper--shown": e.slotData.isShown }]),
			},
			[vn(e.$slots, "default", i_(Ky(e.slotData)))],
			2,
		)
	);
}
const sC = Ou(iC, [["render", oC]]);
function lC() {
	const e = window.navigator.userAgent,
		t = e.indexOf("MSIE ");
	if (t > 0) {
		return Number.parseInt(e.slice(t + 5, e.indexOf(".", t)), 10);
	}
	const r = e.indexOf("Trident/");
	if (r > 0) {
		const o = e.indexOf("rv:");
		return Number.parseInt(e.slice(o + 3, e.indexOf(".", o)), 10);
	}
	const s = e.indexOf("Edge/");
	return s > 0 ? Number.parseInt(e.slice(s + 5, e.indexOf(".", s)), 10) : -1;
}
let Lc;
function zd() {
	zd.init || ((zd.init = !0), (Lc = lC() !== -1));
}
const Ru = {
	name: "ResizeObserver",
	props: {
		emitOnMount: { type: Boolean, default: !1 },
		ignoreWidth: { type: Boolean, default: !1 },
		ignoreHeight: { type: Boolean, default: !1 },
	},
	emits: ["notify"],
	mounted() {
		zd(),
			un(() => {
				(this._w = this.$el.offsetWidth),
					(this._h = this.$el.offsetHeight),
					this.emitOnMount && this.emitSize();
			});
		const e = document.createElement("object");
		(this._resizeObject = e),
			e.setAttribute("aria-hidden", "true"),
			e.setAttribute("tabindex", -1),
			(e.onload = this.addResizeHandlers),
			(e.type = "text/html"),
			Lc && this.$el.append(e),
			(e.data = "about:blank"),
			Lc || this.$el.append(e);
	},
	beforeUnmount() {
		this.removeResizeHandlers();
	},
	methods: {
		compareAndNotify() {
			((!this.ignoreWidth && this._w !== this.$el.offsetWidth) ||
				(!this.ignoreHeight && this._h !== this.$el.offsetHeight)) &&
				((this._w = this.$el.offsetWidth),
				(this._h = this.$el.offsetHeight),
				this.emitSize());
		},
		emitSize() {
			this.$emit("notify", { width: this._w, height: this._h });
		},
		addResizeHandlers() {
			this._resizeObject.contentDocument.defaultView.addEventListener(
				"resize",
				this.compareAndNotify,
			),
				this.compareAndNotify();
		},
		removeResizeHandlers() {
			this._resizeObject &&
				this._resizeObject.onload &&
				(!Lc &&
					this._resizeObject.contentDocument &&
					this._resizeObject.contentDocument.defaultView.removeEventListener(
						"resize",
						this.compareAndNotify,
					),
				this.$el.removeChild(this._resizeObject),
				(this._resizeObject.onload = undefined),
				(this._resizeObject = undefined));
		},
	},
};
const aC = py();
dy("data-v-b329ee4c");
const cC = { class: "resize-observer", tabindex: "-1" };
hy();
const uC = aC((e, t, r, o, s, c) => (oe(), rt("div", cC)));
Ru.render = uC;
Ru.__scopeId = "data-v-b329ee4c";
Ru.__file = "src/components/ResizeObserver.vue";
const bb = (e = "theme") => ({
		computed: {
			themeClass() {
				return tC(this[e]);
			},
		},
	}),
	fC = ut({
		name: "VPopperContent",
		components: { ResizeObserver: Ru },
		mixins: [bb()],
		props: {
			popperId: String,
			theme: String,
			shown: Boolean,
			mounted: Boolean,
			skipTransition: Boolean,
			autoHide: Boolean,
			handleResize: Boolean,
			classes: Object,
			result: Object,
		},
		emits: ["hide", "resize"],
		methods: {
			toPx(e) {
				return e != undefined && !isNaN(e) ? `${e}px` : undefined;
			},
		},
	}),
	dC = ["id", "aria-hidden", "tabindex", "data-popper-placement"],
	hC = { ref: "inner", class: "v-popper__inner" },
	pC = Y("div", { class: "v-popper__arrow-outer" }, undefined, -1),
	gC = Y("div", { class: "v-popper__arrow-inner" }, undefined, -1),
	vC = [pC, gC];
function mC(e, t, r, o, s, c) {
	const f = Po("ResizeObserver");
	return (
		oe(),
		me(
			"div",
			{
				id: e.popperId,
				ref: "popover",
				class: st([
					"v-popper__popper",
					[
						e.themeClass,
						e.classes.popperClass,
						{
							"v-popper__popper--shown": e.shown,
							"v-popper__popper--hidden": !e.shown,
							"v-popper__popper--show-from": e.classes.showFrom,
							"v-popper__popper--show-to": e.classes.showTo,
							"v-popper__popper--hide-from": e.classes.hideFrom,
							"v-popper__popper--hide-to": e.classes.hideTo,
							"v-popper__popper--skip-transition": e.skipTransition,
							"v-popper__popper--arrow-overflow":
								e.result && e.result.arrow.overflow,
							"v-popper__popper--no-positioning": !e.result,
						},
					],
				]),
				style: Jt(
					e.result
						? {
								position: e.result.strategy,
								transform: `translate3d(${Math.round(e.result.x)}px,${Math.round(e.result.y)}px,0)`,
							}
						: void 0,
				),
				"aria-hidden": e.shown ? "false" : "true",
				tabindex: e.autoHide ? 0 : void 0,
				"data-popper-placement": e.result ? e.result.placement : void 0,
				onKeyup:
					t[2] || (t[2] = Pd((d) => e.autoHide && e.$emit("hide"), ["esc"])),
			},
			[
				Y("div", {
					class: "v-popper__backdrop",
					onClick: t[0] || (t[0] = (d) => e.autoHide && e.$emit("hide")),
				}),
				Y(
					"div",
					{
						class: "v-popper__wrapper",
						style: Jt(
							e.result ? { transformOrigin: e.result.transformOrigin } : void 0,
						),
					},
					[
						Y(
							"div",
							hC,
							[
								e.mounted
									? (oe(),
										me(
											ct,
											{ key: 0 },
											[
												Y("div", undefined, [vn(e.$slots, "default")]),
												e.handleResize
													? (oe(),
														rt(f, {
															key: 0,
															onNotify:
																t[1] || (t[1] = (d) => e.$emit("resize", d)),
														}))
													: Ye("", !0),
											],
											64,
										))
									: Ye("", !0),
							],
							512,
						),
						Y(
							"div",
							{
								ref: "arrow",
								class: "v-popper__arrow-container",
								style: Jt(
									e.result
										? {
												left: e.toPx(e.result.arrow.x),
												top: e.toPx(e.result.arrow.y),
											}
										: void 0,
								),
							},
							vC,
							4,
						),
					],
					4,
				),
			],
			46,
			dC,
		)
	);
}
const wb = Ou(fC, [["render", mC]]),
	xb = {
		methods: {
			show(...e) {
				return this.$refs.popper.show(...e);
			},
			hide(...e) {
				return this.$refs.popper.hide(...e);
			},
			dispose(...e) {
				return this.$refs.popper.dispose(...e);
			},
			onResize(...e) {
				return this.$refs.popper.onResize(...e);
			},
		},
	};
let Id = () => {};
typeof window < "u" && (Id = window.Element);
const yC = ut({
	name: "VPopperWrapper",
	components: { Popper: sC, PopperContent: wb },
	mixins: [xb, bb("finalTheme")],
	props: {
		theme: { type: String, default: undefined },
		referenceNode: { type: Function, default: undefined },
		shown: { type: Boolean, default: !1 },
		showGroup: { type: String, default: undefined },
		ariaId: { default: undefined },
		disabled: { type: Boolean, default: void 0 },
		positioningDisabled: { type: Boolean, default: void 0 },
		placement: { type: String, default: void 0 },
		delay: { type: [String, Number, Object], default: void 0 },
		distance: { type: [Number, String], default: void 0 },
		skidding: { type: [Number, String], default: void 0 },
		triggers: { type: Array, default: void 0 },
		showTriggers: { type: [Array, Function], default: void 0 },
		hideTriggers: { type: [Array, Function], default: void 0 },
		popperTriggers: { type: Array, default: void 0 },
		popperShowTriggers: { type: [Array, Function], default: void 0 },
		popperHideTriggers: { type: [Array, Function], default: void 0 },
		container: { type: [String, Object, Id, Boolean], default: void 0 },
		boundary: { type: [String, Id], default: void 0 },
		strategy: { type: String, default: void 0 },
		autoHide: { type: [Boolean, Function], default: void 0 },
		handleResize: { type: Boolean, default: void 0 },
		instantMove: { type: Boolean, default: void 0 },
		eagerMount: { type: Boolean, default: void 0 },
		popperClass: { type: [String, Array, Object], default: void 0 },
		computeTransformOrigin: { type: Boolean, default: void 0 },
		autoMinSize: { type: Boolean, default: void 0 },
		autoSize: { type: [Boolean, String], default: void 0 },
		autoMaxSize: { type: Boolean, default: void 0 },
		autoBoundaryMaxSize: { type: Boolean, default: void 0 },
		preventOverflow: { type: Boolean, default: void 0 },
		overflowPadding: { type: [Number, String], default: void 0 },
		arrowPadding: { type: [Number, String], default: void 0 },
		arrowOverflow: { type: Boolean, default: void 0 },
		flip: { type: Boolean, default: void 0 },
		shift: { type: Boolean, default: void 0 },
		shiftCrossAxis: { type: Boolean, default: void 0 },
		noAutoFocus: { type: Boolean, default: void 0 },
		disposeTimeout: { type: Number, default: void 0 },
	},
	emits: {
		show: () => !0,
		hide: () => !0,
		"update:shown": (e) => !0,
		"apply-show": () => !0,
		"apply-hide": () => !0,
		"close-group": () => !0,
		"close-directive": () => !0,
		"auto-hide": () => !0,
		resize: () => !0,
	},
	computed: {
		finalTheme() {
			return this.theme ?? this.$options.vPopperTheme;
		},
	},
	methods: {
		getTargetNodes() {
			return [...this.$el.children].filter(
				(e) => e !== this.$refs.popperContent.$el,
			);
		},
	},
});
function bC(e, t, r, o, s, c) {
	const f = Po("PopperContent"),
		d = Po("Popper");
	return (
		oe(),
		rt(
			d,
			hi({ ref: "popper" }, e.$props, {
				theme: e.finalTheme,
				"target-nodes": e.getTargetNodes,
				"popper-node": () => e.$refs.popperContent.$el,
				class: [e.themeClass],
				onShow: t[0] || (t[0] = () => e.$emit("show")),
				onHide: t[1] || (t[1] = () => e.$emit("hide")),
				"onUpdate:shown": t[2] || (t[2] = (h) => e.$emit("update:shown", h)),
				onApplyShow: t[3] || (t[3] = () => e.$emit("apply-show")),
				onApplyHide: t[4] || (t[4] = () => e.$emit("apply-hide")),
				onCloseGroup: t[5] || (t[5] = () => e.$emit("close-group")),
				onCloseDirective: t[6] || (t[6] = () => e.$emit("close-directive")),
				onAutoHide: t[7] || (t[7] = () => e.$emit("auto-hide")),
				onResize: t[8] || (t[8] = () => e.$emit("resize")),
			}),
			{
				default: ot(
					({
						popperId: h,
						isShown: p,
						shouldMountContent: v,
						skipTransition: m,
						autoHide: b,
						show: w,
						hide: M,
						handleResize: C,
						onResize: E,
						classes: L,
						result: N,
					}) => [
						vn(e.$slots, "default", { shown: p, show: w, hide: M }),
						Pe(
							f,
							{
								ref: "popperContent",
								"popper-id": h,
								theme: e.finalTheme,
								shown: p,
								mounted: v,
								"skip-transition": m,
								"auto-hide": b,
								"handle-resize": C,
								classes: L,
								result: N,
								onHide: M,
								onResize: E,
							},
							{
								default: ot(() => [
									vn(e.$slots, "popper", { shown: p, hide: M }),
								]),
								_: 2,
							},
							1032,
							[
								"popper-id",
								"theme",
								"shown",
								"mounted",
								"skip-transition",
								"auto-hide",
								"handle-resize",
								"classes",
								"result",
								"onHide",
								"onResize",
							],
						),
					],
				),
				_: 3,
			},
			16,
			["theme", "target-nodes", "popper-node", "class"],
		)
	);
}
const zh = Ou(yC, [["render", bC]]),
	wC = { ...zh, name: "VDropdown", vPopperTheme: "dropdown" },
	xC = { ...zh, name: "VMenu", vPopperTheme: "menu" },
	Sb = { ...zh, name: "VTooltip", vPopperTheme: "tooltip" },
	SC = ut({
		name: "VTooltipDirective",
		components: { Popper: mb(), PopperContent: wb },
		mixins: [xb],
		inheritAttrs: !1,
		props: {
			theme: { type: String, default: "tooltip" },
			html: { type: Boolean, default: (e) => ea(e.theme, "html") },
			content: { type: [String, Number, Function], default: undefined },
			loadingContent: {
				type: String,
				default: (e) => ea(e.theme, "loadingContent"),
			},
			targetNodes: { type: Function, required: !0 },
		},
		data() {
			return { asyncContent: undefined };
		},
		computed: {
			isContentAsync() {
				return typeof this.content === "function";
			},
			loading() {
				return this.isContentAsync && this.asyncContent == undefined;
			},
			finalContent() {
				return this.isContentAsync
					? (this.loading
						? this.loadingContent
						: this.asyncContent)
					: this.content;
			},
		},
		watch: {
			content: {
				handler() {
					this.fetchContent(!0);
				},
				immediate: !0,
			},
			async finalContent() {
				await this.$nextTick(), this.$refs.popper.onResize();
			},
		},
		created() {
			this.$_fetchId = 0;
		},
		methods: {
			fetchContent(e) {
				if (
					typeof this.content === "function" &&
					this.$_isShown &&
					(e || (!this.$_loading && this.asyncContent == undefined))
				) {
					(this.asyncContent = undefined), (this.$_loading = !0);
					const t = ++this.$_fetchId,
						r = this.content(this);
					r.then ? r.then((o) => this.onResult(t, o)) : this.onResult(t, r);
				}
			},
			onResult(e, t) {
				e === this.$_fetchId &&
					((this.$_loading = !1), (this.asyncContent = t));
			},
			onShow() {
				(this.$_isShown = !0), this.fetchContent();
			},
			onHide() {
				this.$_isShown = !1;
			},
		},
	}),
	_C = ["innerHTML"],
	kC = ["textContent"];
function TC(e, t, r, o, s, c) {
	const f = Po("PopperContent"),
		d = Po("Popper");
	return (
		oe(),
		rt(
			d,
			hi({ ref: "popper" }, e.$attrs, {
				theme: e.theme,
				"target-nodes": e.targetNodes,
				"popper-node": () => e.$refs.popperContent.$el,
				onApplyShow: e.onShow,
				onApplyHide: e.onHide,
			}),
			{
				default: ot(
					({
						popperId: h,
						isShown: p,
						shouldMountContent: v,
						skipTransition: m,
						autoHide: b,
						hide: w,
						handleResize: M,
						onResize: C,
						classes: E,
						result: L,
					}) => [
						Pe(
							f,
							{
								ref: "popperContent",
								class: st({ "v-popper--tooltip-loading": e.loading }),
								"popper-id": h,
								theme: e.theme,
								shown: p,
								mounted: v,
								"skip-transition": m,
								"auto-hide": b,
								"handle-resize": M,
								classes: E,
								result: L,
								onHide: w,
								onResize: C,
							},
							{
								default: ot(() => [
									e.html
										? (oe(),
											me(
												"div",
												{ key: 0, innerHTML: e.finalContent },
												undefined,
												8,
												_C,
											))
										: (oe(),
											me(
												"div",
												{ key: 1, textContent: He(e.finalContent) },
												undefined,
												8,
												kC,
											)),
								]),
								_: 2,
							},
							1032,
							[
								"class",
								"popper-id",
								"theme",
								"shown",
								"mounted",
								"skip-transition",
								"auto-hide",
								"handle-resize",
								"classes",
								"result",
								"onHide",
								"onResize",
							],
						),
					],
				),
				_: 1,
			},
			16,
			["theme", "target-nodes", "popper-node", "onApplyShow", "onApplyHide"],
		)
	);
}
const CC = Ou(SC, [["render", TC]]),
	_b = "v-popper--has-tooltip";
function EC(e, t) {
	let r = e.placement;
	if (!r && t) {
		for (const o of vb) {
			t[o] && (r = o);
		}
	}
	return r || (r = ea(e.theme || "tooltip", "placement")), r;
}
function kb(e, t, r) {
	let o;
	const s = typeof t;
	return (
		s === "string"
			? (o = { content: t })
			: (t && s === "object"
				? (o = t)
				: (o = { content: !1 })),
		(o.placement = EC(o, r)),
		(o.targetNodes = () => [e]),
		(o.referenceNode = () => e),
		o
	);
}
let id,
	ta,
	LC = 0;
function AC() {
	if (id) {
		return;
	}
	(ta = We([])),
		(id = nb({
			name: "VTooltipDirectiveApp",
			setup() {
				return { directives: ta };
			},
			render() {
				return this.directives.map((t) =>
					ya(CC, {
						...t.options,
						shown: t.shown || t.options.shown,
						key: t.id,
					}),
				);
			},
			devtools: { hide: !0 },
		}));
	const e = document.createElement("div");
	document.body.append(e), id.mount(e);
}
function Tb(e, t, r) {
	AC();
	const o = We(kb(e, t, r)),
		s = We(!1),
		c = { id: LC++, options: o, shown: s };
	return (
		ta.value.push(c),
		e.classList && e.classList.add(_b),
		(e.$_popper = {
			options: o,
			item: c,
			show() {
				s.value = !0;
			},
			hide() {
				s.value = !1;
			},
		})
	);
}
function Ih(e) {
	if (e.$_popper) {
		const t = ta.value.indexOf(e.$_popper.item);
		t !== -1 && ta.value.splice(t, 1),
			delete e.$_popper,
			delete e.$_popperOldShown,
			delete e.$_popperMountTarget;
	}
	e.classList && e.classList.remove(_b);
}
function fm(e, { value: t, modifiers: r }) {
	const o = kb(e, t, r);
	if (!o.content || ea(o.theme || "tooltip", "disabled")) {
		Ih(e);
	} else {
		let s;
		e.$_popper ? ((s = e.$_popper), (s.options.value = o)) : (s = Tb(e, t, r)),
			typeof t.shown < "u" &&
				t.shown !== e.$_popperOldShown &&
				((e.$_popperOldShown = t.shown), t.shown ? s.show() : s.hide());
	}
}
const Cb = {
	beforeMount: fm,
	updated: fm,
	beforeUnmount(e) {
		Ih(e);
	},
};
function dm(e) {
	e.addEventListener("mousedown", Qc),
		e.addEventListener("click", Qc),
		e.addEventListener("touchstart", Eb, Ps ? { passive: !0 } : !1);
}
function hm(e) {
	e.removeEventListener("mousedown", Qc),
		e.removeEventListener("click", Qc),
		e.removeEventListener("touchstart", Eb),
		e.removeEventListener("touchend", Lb),
		e.removeEventListener("touchcancel", Ab);
}
function Qc(e) {
	const t = e.currentTarget;
	(e.closePopover = !t.$_vclosepopover_touch),
		(e.closeAllPopover =
			t.$_closePopoverModifiers && !!t.$_closePopoverModifiers.all);
}
function Eb(e) {
	if (e.changedTouches.length === 1) {
		const t = e.currentTarget;
		t.$_vclosepopover_touch = !0;
		const r = e.changedTouches[0];
		(t.$_vclosepopover_touchPoint = r),
			t.addEventListener("touchend", Lb),
			t.addEventListener("touchcancel", Ab);
	}
}
function Lb(e) {
	const t = e.currentTarget;
	if (((t.$_vclosepopover_touch = !1), e.changedTouches.length === 1)) {
		const r = e.changedTouches[0],
			o = t.$_vclosepopover_touchPoint;
		(e.closePopover =
			Math.abs(r.screenY - o.screenY) < 20 &&
			Math.abs(r.screenX - o.screenX) < 20),
			(e.closeAllPopover =
				t.$_closePopoverModifiers && !!t.$_closePopoverModifiers.all);
	}
}
function Ab(e) {
	const t = e.currentTarget;
	t.$_vclosepopover_touch = !1;
}
const MC = {
		beforeMount(e, { value: t, modifiers: r }) {
			(e.$_closePopoverModifiers = r), (typeof t > "u" || t) && dm(e);
		},
		updated(e, { value: t, oldValue: r, modifiers: o }) {
			(e.$_closePopoverModifiers = o),
				t !== r && (typeof t > "u" || t ? dm(e) : hm(e));
		},
		beforeUnmount(e) {
			hm(e);
		},
	},
	NC = Cb,
	Mb = Sb;
function $C(e, t = {}) {
	e.$_vTooltipInstalled ||
		((e.$_vTooltipInstalled = !0),
		pb(kr, t),
		e.directive("tooltip", Cb),
		e.directive("close-popper", MC),
		e.component("VTooltip", Sb),
		e.component("VDropdown", wC),
		e.component("VMenu", xC));
}
const Nb = { version: "5.2.2", install: $C, options: kr };
function $b(e) {
	return e != undefined;
}
function Fh(e) {
	return e == undefined && (e = []), Array.isArray(e) ? e : [e];
}
const PC = /^[A-Za-z]:\//;
function OC(e = "") {
	return e && e.replaceAll("\\\\", "/").replace(PC, (t) => t.toUpperCase());
}
const RC = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/,
	pm = /^\/([A-Za-z]:)?$/;
function DC() {
	return typeof process < "u" && typeof process.cwd === "function"
		? process.cwd().replaceAll("\\\\", "/")
		: "/";
}
const gm = (...e) => {
	e = e.map((o) => OC(o));
	let t = "",
		r = !1;
	for (let o = e.length - 1; o >= -1 && !r; o--) {
		const s = o >= 0 ? e[o] : DC();
		!s || s.length === 0 || ((t = `${s}/${t}`), (r = vm(s)));
	}
	return (t = zC(t, !r)), r && !vm(t) ? `/${t}` : (t.length > 0 ? t : ".");
};
function zC(e, t) {
	let r = "",
		o = 0,
		s = -1,
		c = 0,
		f;
	for (let d = 0; d <= e.length; ++d) {
		if (d < e.length) {
			f = e[d];
		} else {
			if (f === "/") {
				break;
			}
			f = "/";
		}
		if (f === "/") {
			if (!(s === d - 1 || c === 1)) {
				if (c === 2) {
					if (
						r.length < 2 ||
						o !== 2 ||
						r[r.length - 1] !== "." ||
						r[r.length - 2] !== "."
					) {
						if (r.length > 2) {
							const h = r.lastIndexOf("/");
							h === -1
								? ((r = ""), (o = 0))
								: ((r = r.slice(0, h)),
									(o = r.length - 1 - r.lastIndexOf("/"))),
								(s = d),
								(c = 0);
							continue;
						}
						if (r.length > 0) {
							(r = ""), (o = 0), (s = d), (c = 0);
							continue;
						}
					}
					t && ((r += r.length > 0 ? "/.." : ".."), (o = 2));
				} else {
					r.length > 0
						? (r += `/${e.slice(s + 1, d)}`)
						: (r = e.slice(s + 1, d)),
						(o = d - s - 1);
				}
			}
			(s = d), (c = 0);
		} else {
			f === "." && c !== -1 ? ++c : (c = -1);
		}
	}
	return r;
}
const vm = (e) => RC.test(e),
	IC = (e, t) => {
		const r = gm(e).replace(pm, "$1").split("/"),
			o = gm(t).replace(pm, "$1").split("/");
		if (o[0][1] === ":" && r[0][1] === ":" && r[0] !== o[0]) {
			return o.join("/");
		}
		const s = [...r];
		for (const c of s) {
			if (o[0] !== c) {
				break;
			}
			r.shift(), o.shift();
		}
		return [...r.map(() => ".."), ...o].join("/");
	};
function FC(e) {
	let t = 0;
	if (e.length === 0) {
		return `${t}`;
	}
	for (let r = 0; r < e.length; r++) {
		const o = e.codePointAt(r);
		(t = (t << 5) - t + o), (t &= t);
	}
	return `${t}`;
}
function Pb(e, t, r, o) {
	const s = IC(t, e),
		c = {
			id: FC(`${s}${r || ""}`),
			name: s,
			type: "suite",
			mode: "run",
			filepath: e,
			tasks: [],
			meta: Object.create(null),
			projectName: r,
			file: void 0,
			pool: o,
		};
	return (c.file = c), c;
}
function Os(e) {
	return e.type === "test" || e.type === "custom";
}
function Ob(e) {
	const t = [],
		r = Fh(e);
	for (const o of r) {
		if (Os(o)) {
			t.push(o);
		} else {
			for (const s of o.tasks) {
				if (Os(s)) {
					t.push(s);
				} else {
					const c = Ob(s);
					for (const f of c) {
						t.push(f);
					}
				}
			}
		}
	}
	return t;
}
function Hh(e = []) {
	return Fh(e).flatMap((t) => (Os(t) ? [t] : [t, ...Hh(t.tasks)]));
}
function HC(e) {
	const t = [e.name];
	let r = e;
	while (r != undefined && r.suite) {
		(r = r.suite), r != undefined && r.name && t.unshift(r.name);
	}
	return r !== e.file && t.unshift(e.file.name), t;
}
const qC = 6e4;
function Rb(e) {
	return e;
}
const BC = Rb,
	{ clearTimeout: WC, setTimeout: UC } = globalThis,
	VC = Math.random.bind(Math);
function jC(e, t) {
	const {
			post: r,
			on: o,
			off: s = () => {},
			eventNames: c = [],
			serialize: f = Rb,
			deserialize: d = BC,
			resolver: h,
			bind: p = "rpc",
			timeout: v = qC,
		} = t,
		m = new Map();
	let b,
		w = !1;
	const M = new Proxy(
		{},
		{
			get(L, N) {
				if (N === "$functions") {
					return e;
				}
				if (N === "$close") {
					return C;
				}
				if (N === "then" && !c.includes("then") && !("then" in e)) {
					return;
				}
				const P = (...z) => {
					r(f({ m: N, a: z, t: "q" }));
				};
				if (c.includes(N)) {
					return (P.asEvent = P), P;
				}
				const A = async (...z) => {
					if (w) {
						throw new Error(`[birpc] rpc is closed, cannot call "${N}"`);
					}
					if (b) {
						try {
							await b;
						} finally {
							b = void 0;
						}
					}
					return new Promise((W, U) => {
						let G;
						const re = KC();
						let Q;
						v >= 0 &&
							((Q = UC(() => {
								let te;
								try {
									throw (
										((te = t.onTimeoutError) == undefined || te.call(t, N, z),
										new Error(`[birpc] timeout on calling "${N}"`))
									);
								} catch (error) {
									U(error);
								}
								m.delete(re);
							}, v)),
							typeof Q === "object" &&
								(Q = (G = Q.unref) == undefined ? void 0 : G.call(Q))),
							m.set(re, { resolve: W, reject: U, timeoutId: Q, method: N }),
							r(f({ m: N, a: z, i: re, t: "q" }));
					});
				};
				return (A.asEvent = P), A;
			},
		},
	);
	function C() {
		(w = !0),
			m.forEach(({ reject: L, method: N }) => {
				L(new Error(`[birpc] rpc is closed, cannot call "${N}"`));
			}),
			m.clear(),
			s(E);
	}
	async function E(L, ...N) {
		const P = d(L);
		if (P.t === "q") {
			const { m: A, a: z } = P;
			let W, U;
			const re = h ? h(A, e[A]) : e[A];
			if (re) {
				try {
					W = await re.apply(p === "rpc" ? M : e, z);
				} catch (error) {
					U = error;
				}
			} else {
				U = new Error(`[birpc] function "${A}" not found`);
			}
			P.i &&
				(U && t.onError && t.onError(U, A, z),
				r(f({ t: "s", i: P.i, r: W, e: U }), ...N));
		} else {
			const { i: A, r: z, e: W } = P,
				U = m.get(A);
			U && (WC(U.timeoutId), W ? U.reject(W) : U.resolve(z)), m.delete(A);
		}
	}
	return (b = o(E)), M;
}
const GC = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function KC(e = 21) {
	let t = "",
		r = e;
	while (r--) {
		t += GC[(VC() * 64) | 0];
	}
	return t;
}
const { parse: XC, stringify: YC } = JSON,
	{ keys: ZC } = Object,
	na = String,
	Db = "string",
	mm = {},
	eu = "object",
	zb = (e, t) => t,
	JC = (e) => (e instanceof na ? na(e) : e),
	QC = (e, t) => (typeof t === Db ? new na(t) : t),
	Ib = (e, t, r, o) => {
		const s = [];
		for (let c = ZC(r), { length: f } = c, d = 0; d < f; d++) {
			const h = c[d],
				p = r[h];
			if (p instanceof na) {
				const v = e[p];
				typeof v === eu && !t.has(v)
					? (t.add(v), (r[h] = mm), s.push({ k: h, a: [e, t, v, o] }))
					: (r[h] = o.call(r, h, v));
			} else {
				r[h] !== mm && (r[h] = o.call(r, h, p));
			}
		}
		for (let { length: c } = s, f = 0; f < c; f++) {
			const { k: d, a: h } = s[f];
			r[d] = o.call(r, d, Ib.apply(undefined, h));
		}
		return r;
	},
	ym = (e, t, r) => {
		const o = na(t.push(r) - 1);
		return e.set(r, o), o;
	},
	Fd = (e, t) => {
		const r = XC(e, QC).map(JC),
			o = r[0],
			s = t || zb,
			c = typeof o === eu && o ? Ib(r, new Set(), o, s) : o;
		return s.call({ "": c }, "", c);
	},
	eE = (e, t, r) => {
		const o =
				t && typeof t === eu
					? (v, m) => (v === "" || t.indexOf(v) > -1 ? m : void 0)
					: t || zb,
			s = new Map(),
			c = [],
			f = [];
		let d = +ym(s, c, o.call({ "": e }, "", e)),
			h = !d;
		while (d < c.length) {
			(h = !0), (f[d] = YC(c[d++], p, r));
		}
		return "[" + f.join(",") + "]";
		function p(v, m) {
			if (h) {
				return (h = !h), m;
			}
			const b = o.call(this, v, m);
			switch (typeof b) {
				case eu: {
					if (b === null) {return b;}
				}
				case Db: {
					return s.get(b) || ym(s, c, b);
				}
			}
			return b;
		}
	};
class Fb {
	constructor() {
		fs(this, "filesMap", new Map());
		fs(this, "pathsSet", new Set());
		fs(this, "idMap", new Map());
	}
	getPaths() {
		return [...this.pathsSet];
	}
	getFiles(t) {
		return t
			? t.flatMap((r) => this.filesMap.get(r)).filter((r) => r && !r.local)
			: [...this.filesMap.values()].flat().filter((r) => !r.local);
	}
	getFilepaths() {
		return [...this.filesMap.keys()];
	}
	getFailedFilepaths() {
		return this.getFiles()
			.filter((t) => {
				let r;
				return ((r = t.result) == undefined ? void 0 : r.state) === "fail";
			})
			.map((t) => t.filepath);
	}
	collectPaths(t = []) {
		t.forEach((r) => {
			this.pathsSet.add(r);
		});
	}
	collectFiles(t = []) {
		t.forEach((r) => {
			const o = this.filesMap.get(r.filepath) || [],
				s = o.filter(
					(f) =>
						f.projectName !== r.projectName ||
						f.meta.typecheck !== r.meta.typecheck,
				),
				c = o.find((f) => f.projectName === r.projectName);
			c && (r.logs = c.logs),
				s.push(r),
				this.filesMap.set(r.filepath, s),
				this.updateId(r);
		});
	}
	clearFiles(t, r = []) {
		const o = t;
		r.forEach((s) => {
			const c = this.filesMap.get(s),
				f = Pb(s, o.config.root, o.config.name || "");
			if (((f.local = !0), this.idMap.set(f.id, f), !c)) {
				this.filesMap.set(s, [f]);
				return;
			}
			const d = c.filter((h) => h.projectName !== o.config.name);
			d.length > 0
				? this.filesMap.set(s, [...d, f])
				: this.filesMap.set(s, [f]);
		});
	}
	updateId(t) {
		this.idMap.get(t.id) !== t &&
			(this.idMap.set(t.id, t),
			t.type === "suite" &&
				t.tasks.forEach((r) => {
					this.updateId(r);
				}));
	}
	updateTasks(t) {
		for (const [r, o, s] of t) {
			const c = this.idMap.get(r);
			c &&
				((c.result = o),
				(c.meta = s),
				(o == undefined ? void 0 : o.state) === "skip" && (c.mode = "skip"));
		}
	}
	updateUserLog(t) {
		const r = t.taskId && this.idMap.get(t.taskId);
		r && (r.logs || (r.logs = []), r.logs.push(t));
	}
}
function qh(e) {
	return Ob(e).some((t) => {
		let r, o;
		return (o = (r = t.result) == undefined ? void 0 : r.errors) == undefined
			? void 0
			: o.some(
					(s) =>
						typeof (s == undefined ? void 0 : s.message) === "string" &&
						s.message.match(/Snapshot .* mismatched/),
				);
	});
}
function tE(e, t = {}) {
	const {
		handlers: r = {},
		autoReconnect: o = !0,
		reconnectInterval: s = 2e3,
		reconnectTries: c = 10,
		connectTimeout: f = 6e4,
		reactive: d = (N) => N,
		WebSocketConstructor: h = globalThis.WebSocket,
	} = t;
	let p = c;
	const v = d(
		{ ws: new h(e), state: new Fb(), waitForConnection: L, reconnect: C },
		"state",
	);
	(v.state.filesMap = d(v.state.filesMap, "filesMap")),
		(v.state.idMap = d(v.state.idMap, "idMap"));
	let m;
	const b = {
			onSpecsCollected(N) {
				let P;
				N == undefined ||
					N.forEach(([A, z]) => {
						v.state.clearFiles({ config: A }, [z]);
					}),
					(P = r.onSpecsCollected) == undefined || P.call(r, N);
			},
			onPathsCollected(N) {
				let P;
				v.state.collectPaths(N),
					(P = r.onPathsCollected) == undefined || P.call(r, N);
			},
			onCollected(N) {
				let P;
				v.state.collectFiles(N),
					(P = r.onCollected) == undefined || P.call(r, N);
			},
			onTaskUpdate(N) {
				let P;
				v.state.updateTasks(N),
					(P = r.onTaskUpdate) == undefined || P.call(r, N);
			},
			onUserConsoleLog(N) {
				let P;
				v.state.updateUserLog(N),
					(P = r.onUserConsoleLog) == undefined || P.call(r, N);
			},
			onFinished(N, P) {
				let A;
				(A = r.onFinished) == undefined || A.call(r, N, P);
			},
			onFinishedReportCoverage() {
				let N;
				(N = r.onFinishedReportCoverage) == undefined || N.call(r);
			},
		},
		w = {
			post: (N) => v.ws.send(N),
			on: (N) => (m = N),
			serialize: (N) =>
				eE(N, (P, A) =>
					A instanceof Error
						? { name: A.name, message: A.message, stack: A.stack }
						: A,
				),
			deserialize: Fd,
			onTimeoutError(N) {
				throw new Error(`[vitest-ws-client]: Timeout calling "${N}"`);
			},
		};
	v.rpc = jC(b, w);
	let M;
	function C(N = !1) {
		N && (p = c), (v.ws = new h(e)), E();
	}
	function E() {
		(M = new Promise((N, P) => {
			let z, W;
			const A =
				(W =
					(z = setTimeout(() => {
						P(new Error(`Cannot connect to the server in ${f / 1e3} seconds`));
					}, f)) == undefined
						? void 0
						: z.unref) == undefined
					? void 0
					: W.call(z);
			v.ws.OPEN === v.ws.readyState && N(),
				v.ws.addEventListener("open", () => {
					(p = c), N(), clearTimeout(A);
				});
		})),
			v.ws.addEventListener("message", (N) => {
				m(N.data);
			}),
			v.ws.addEventListener("close", () => {
				(p -= 1), o && p > 0 && setTimeout(C, s);
			});
	}
	E();
	function L() {
		return M;
	}
	return v;
}
function Du(e) {
	return W0() ? (c_(e), !0) : !1;
}
function Vr(e) {
	return typeof e === "function" ? e() : I(e);
}
const nE = typeof window < "u" && typeof document < "u";
typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
const rE = Object.prototype.toString,
	iE = (e) => rE.call(e) === "[object Object]",
	ra = () => {};
function Hb(e, t) {
	function r(...o) {
		return new Promise((s, c) => {
			Promise.resolve(
				e(() => t.apply(this, o), { fn: t, thisArg: this, args: o }),
			)
				.then(s)
				.catch(c);
		});
	}
	return r;
}
const qb = (e) => e();
function Bb(e, t = {}) {
	let r,
		o,
		s = ra;
	const c = (d) => {
		clearTimeout(d), s(), (s = ra);
	};
	return (d) => {
		const h = Vr(e),
			p = Vr(t.maxWait);
		return (
			r && c(r),
			h <= 0 || (p !== void 0 && p <= 0)
				? (o && (c(o), (o = undefined)), Promise.resolve(d()))
				: new Promise((v, m) => {
						(s = t.rejectOnCancel ? m : v),
							p &&
								!o &&
								(o = setTimeout(() => {
									r && c(r), (o = undefined), v(d());
								}, p)),
							(r = setTimeout(() => {
								o && c(o), (o = undefined), v(d());
							}, h));
					})
		);
	};
}
function oE(e = qb) {
	const t = We(!0);
	function r() {
		t.value = !1;
	}
	function o() {
		t.value = !0;
	}
	const s = (...c) => {
		t.value && e(...c);
	};
	return { isActive: ha(t), pause: r, resume: o, eventFilter: s };
}
function sE(e) {
	return va();
}
function lE(...e) {
	if (e.length !== 1) {
		return Su(...e);
	}
	const t = e[0];
	return typeof t === "function" ? ha(sy(() => ({ get: t, set: ra }))) : We(t);
}
function uc(e, t = 200, r = {}) {
	return Hb(Bb(t, r), e);
}
function Wb(e, t, r = {}) {
	const { eventFilter: o = qb, ...s } = r;
	return Bt(e, Hb(o, t), s);
}
function Ub(e, t, r = {}) {
	const { eventFilter: o, ...s } = r,
		{ eventFilter: c, pause: f, resume: d, isActive: h } = oE(o);
	return {
		stop: Wb(e, t, { ...s, eventFilter: c }),
		pause: f,
		resume: d,
		isActive: h,
	};
}
function Bh(e, t = !0, r) {
	sE() ? Bs(e, r) : (t ? e() : un(e));
}
function aE(e = !1, t = {}) {
	const { truthyValue: r = !0, falsyValue: o = !1 } = t,
		s = At(e),
		c = We(e);
	function f(d) {
		if (arguments.length > 0) {
			return (c.value = d), c.value;
		}
		{
			const h = Vr(r);
			return (c.value = c.value === h ? Vr(o) : h), c.value;
		}
	}
	return s ? f : [c, f];
}
function Vb(e, t, r = {}) {
	const { debounce: o = 0, maxWait: s = void 0, ...c } = r;
	return Wb(e, t, { ...c, eventFilter: Bb(o, { maxWait: s }) });
}
function cE(e, t, r) {
	const o = Bt(e, (...s) => (un(() => o()), t(...s)), r);
	return o;
}
function uE(e, t, r) {
	let o;
	At(r) ? (o = { evaluating: r }) : (o = {});
	const {
			lazy: s = !1,
			evaluating: c = void 0,
			shallow: f = !0,
			onError: d = ra,
		} = o,
		h = We(!s),
		p = f ? jr(t) : We(t);
	let v = 0;
	return (
		Mh(async (m) => {
			if (!h.value) {
				return;
			}
			v++;
			const b = v;
			let w = !1;
			c &&
				Promise.resolve().then(() => {
					c.value = !0;
				});
			try {
				const M = await e((C) => {
					m(() => {
						c && (c.value = !1), w || C();
					});
				});
				b === v && (p.value = M);
			} catch (error) {
				d(error);
			} finally {
				c && b === v && (c.value = !1), (w = !0);
			}
		}),
		s ? Te(() => ((h.value = !0), p.value)) : p
	);
}
const sr = nE ? window : void 0;
function tu(e) {
	let t;
	const r = Vr(e);
	return (t = r == undefined ? void 0 : r.$el) != undefined ? t : r;
}
function Rs(...e) {
	let t, r, o, s;
	if (
		(typeof e[0] === "string" || Array.isArray(e[0])
			? (([r, o, s] = e), (t = sr))
			: ([t, r, o, s] = e),
		!t)
	) {
		return ra;
	}
	Array.isArray(r) || (r = [r]), Array.isArray(o) || (o = [o]);
	const c = [],
		f = () => {
			c.forEach((v) => v()), (c.length = 0);
		},
		d = (v, m, b, w) => (
			v.addEventListener(m, b, w), () => v.removeEventListener(m, b, w)
		),
		h = Bt(
			() => [tu(t), Vr(s)],
			([v, m]) => {
				if ((f(), !v)) {
					return;
				}
				const b = iE(m) ? { ...m } : m;
				c.push(...r.flatMap((w) => o.map((M) => d(v, w, M, b))));
			},
			{ immediate: !0, flush: "post" },
		),
		p = () => {
			h(), f();
		};
	return Du(p), p;
}
function fE(e) {
	return typeof e === "function"
		? e
		: typeof e === "string"
			? (t) => t.key === e
			: Array.isArray(e)
				? (t) => e.includes(t.key)
				: () => !0;
}
function jb(...e) {
	let t,
		r,
		o = {};
	e.length === 3
		? ((t = e[0]), (r = e[1]), (o = e[2]))
		: e.length === 2
			? typeof e[1] === "object"
				? ((t = !0), (r = e[0]), (o = e[1]))
				: ((t = e[0]), (r = e[1]))
			: ((t = !0), (r = e[0]));
	const {
			target: s = sr,
			eventName: c = "keydown",
			passive: f = !1,
			dedupe: d = !1,
		} = o,
		h = fE(t);
	return Rs(
		s,
		c,
		(v) => {
			(v.repeat && Vr(d)) || (h(v) && r(v));
		},
		f,
	);
}
function dE() {
	const e = We(!1),
		t = va();
	return (
		t &&
			Bs(() => {
				e.value = !0;
			}, t),
		e
	);
}
function Gb(e) {
	const t = dE();
	return Te(() => (t.value, !!e()));
}
function hE(e, t = {}) {
	const { immediate: r = !0, fpsLimit: o = void 0, window: s = sr } = t,
		c = We(!1),
		f = o ? 1e3 / o : undefined;
	let d = 0,
		h;
	function p(b) {
		if (!(c.value && s)) {
			return;
		}
		d || (d = b);
		const w = b - d;
		if (f && w < f) {
			h = s.requestAnimationFrame(p);
			return;
		}
		(d = b), e({ delta: w, timestamp: b }), (h = s.requestAnimationFrame(p));
	}
	function v() {
		!c.value &&
			s &&
			((c.value = !0), (d = 0), (h = s.requestAnimationFrame(p)));
	}
	function m() {
		(c.value = !1),
			h != undefined && s && (s.cancelAnimationFrame(h), (h = undefined));
	}
	return r && v(), Du(m), { isActive: ha(c), pause: m, resume: v };
}
function Kb(e, t = {}) {
	const { window: r = sr } = t,
		o = Gb(() => r && "matchMedia" in r && typeof r.matchMedia === "function");
	let s;
	const c = We(!1),
		f = (p) => {
			c.value = p.matches;
		},
		d = () => {
			s &&
				("removeEventListener" in s
					? s.removeEventListener("change", f)
					: s.removeListener(f));
		},
		h = Mh(() => {
			o.value &&
				(d(),
				(s = r.matchMedia(Vr(e))),
				"addEventListener" in s
					? s.addEventListener("change", f)
					: s.addListener(f),
				(c.value = s.matches));
		});
	return (
		Du(() => {
			h(), d(), (s = void 0);
		}),
		c
	);
}
const fc =
		typeof globalThis < "u"
			? globalThis
			: typeof window < "u"
				? window
				: typeof global < "u"
					? global
					: typeof self < "u"
						? self
						: {},
	dc = "__vueuse_ssr_handlers__",
	pE = gE();
function gE() {
	return dc in fc || (fc[dc] = fc[dc] || {}), fc[dc];
}
function Xb(e, t) {
	return pE[e] || t;
}
function Yb(e) {
	return Kb("(prefers-color-scheme: dark)", e);
}
function vE(e) {
	return e == undefined
		? "any"
		: e instanceof Set
			? "set"
			: e instanceof Map
				? "map"
				: e instanceof Date
					? "date"
					: typeof e === "boolean"
						? "boolean"
						: typeof e === "string"
							? "string"
							: typeof e === "object"
								? "object"
								: Number.isNaN(e)
									? "any"
									: "number";
}
const mE = {
		boolean: { read: (e) => e === "true", write: (e) => String(e) },
		object: { read: (e) => JSON.parse(e), write: (e) => JSON.stringify(e) },
		number: { read: (e) => Number.parseFloat(e), write: (e) => String(e) },
		any: { read: (e) => e, write: (e) => String(e) },
		string: { read: (e) => e, write: (e) => String(e) },
		map: {
			read: (e) => new Map(JSON.parse(e)),
			write: (e) => JSON.stringify([...e.entries()]),
		},
		set: {
			read: (e) => new Set(JSON.parse(e)),
			write: (e) => JSON.stringify([...e]),
		},
		date: { read: (e) => new Date(e), write: (e) => e.toISOString() },
	},
	bm = "vueuse-storage";
function Zb(e, t, r, o = {}) {
	let s;
	const {
			flush: c = "pre",
			deep: f = !0,
			listenToStorageChanges: d = !0,
			writeDefaults: h = !0,
			mergeDefaults: p = !1,
			shallow: v,
			window: m = sr,
			eventFilter: b,
			onError: w = (G) => {
				console.error(G);
			},
			initOnMounted: M,
		} = o,
		C = (v ? jr : We)(typeof t === "function" ? t() : t);
	if (!r) {
		try {
			r = Xb("getDefaultStorage", () => {
				let G;
				return (G = sr) == undefined ? void 0 : G.localStorage;
			})();
		} catch (error) {
			w(error);
		}
	}
	if (!r) {
		return C;
	}
	const E = Vr(t),
		L = vE(E),
		N = (s = o.serializer) != undefined ? s : mE[L],
		{ pause: P, resume: A } = Ub(C, () => W(C.value), {
			flush: c,
			deep: f,
			eventFilter: b,
		});
	m &&
		d &&
		Bh(() => {
			r instanceof Storage ? Rs(m, "storage", re) : Rs(m, bm, Q), M && re();
		}),
		M || re();
	function z(G, te) {
		if (m) {
			const Z = { key: e, oldValue: G, newValue: te, storageArea: r };
			m.dispatchEvent(
				r instanceof Storage
					? new StorageEvent("storage", Z)
					: new CustomEvent(bm, { detail: Z }),
			);
		}
	}
	function W(G) {
		try {
			const te = r.getItem(e);
			if (G == undefined) {
				z(te, undefined), r.removeItem(e);
			} else {
				const Z = N.write(G);
				te !== Z && (r.setItem(e, Z), z(te, Z));
			}
		} catch (error) {
			w(error);
		}
	}
	function U(G) {
		const te = G ? G.newValue : r.getItem(e);
		if (te == undefined) {
			return h && E != undefined && r.setItem(e, N.write(E)), E;
		}
		if (!G && p) {
			const Z = N.read(te);
			return typeof p === "function"
				? p(Z, E)
				: (L === "object" && !Array.isArray(Z)
					? { ...E, ...Z }
					: Z);
		}
		return typeof te !== "string" ? te : N.read(te);
	}
	function re(G) {
		if (!(G && G.storageArea !== r)) {
			if (G && G.key == undefined) {
				C.value = E;
				return;
			}
			if (!(G && G.key !== e)) {
				P();
				try {
					(G == undefined ? void 0 : G.newValue) !== N.write(C.value) &&
						(C.value = U(G));
				} catch (error) {
					w(error);
				} finally {
					G ? un(A) : A();
				}
			}
		}
	}
	function Q(G) {
		re(G.detail);
	}
	return C;
}
const yE =
	"*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
function bE(e = {}) {
	const {
			selector: t = "html",
			attribute: r = "class",
			initialValue: o = "auto",
			window: s = sr,
			storage: c,
			storageKey: f = "vueuse-color-scheme",
			listenToStorageChanges: d = !0,
			storageRef: h,
			emitAuto: p,
			disableTransition: v = !0,
		} = e,
		m = { auto: "", light: "light", dark: "dark", ...e.modes },
		b = Yb({ window: s }),
		w = Te(() => (b.value ? "dark" : "light")),
		M =
			h ||
			(f == undefined
				? lE(o)
				: Zb(f, o, c, { window: s, listenToStorageChanges: d })),
		C = Te(() => (M.value === "auto" ? w.value : M.value)),
		E = Xb("updateHTMLAttrs", (A, z, W) => {
			const U =
				typeof A === "string"
					? (s == null
						? void 0
						: s.document.querySelector(A))
					: tu(A);
			if (!U) {
				return;
			}
			const re = new Set(),
				Q = new Set();
			let G;
			if (z === "class") {
				const Z = W.split(/\s/g);
				Object.values(m)
					.flatMap((q) => (q || "").split(/\s/g))
					.filter(Boolean)
					.forEach((q) => {
						Z.includes(q) ? re.add(q) : Q.add(q);
					});
			} else {
				G = { key: z, value: W };
			}
			if (re.size === 0 && Q.size === 0 && G === null) {
				return;
			}
			let te;
			v &&
				((te = s.document.createElement("style")),
				te.append(document.createTextNode(yE)),
				s.document.head.append(te));
			for (const Z of re) {
				U.classList.add(Z);
			}
			for (const Z of Q) {
				U.classList.remove(Z);
			}
			G && U.setAttribute(G.key, G.value),
				v && (s.getComputedStyle(te).opacity, document.head.removeChild(te));
		});
	function L(A) {
		let z;
		E(t, r, (z = m[A]) != undefined ? z : A);
	}
	function N(A) {
		e.onChanged ? e.onChanged(A, L) : L(A);
	}
	Bt(C, N, { flush: "post", immediate: !0 }), Bh(() => N(C.value));
	const P = Te({
		get() {
			return p ? M.value : C.value;
		},
		set(A) {
			M.value = A;
		},
	});
	try {
		return Object.assign(P, { store: M, system: w, state: C });
	} catch {
		return P;
	}
}
function wE(e = {}) {
	const { valueDark: t = "dark", valueLight: r = "", window: o = sr } = e,
		s = bE({
			...e,
			onChanged: (d, h) => {
				let p;
				e.onChanged
					? (p = e.onChanged) == undefined || p.call(e, d === "dark", h, d)
					: h(d);
			},
			modes: { dark: t, light: r },
		}),
		c = Te(() =>
			s.system ? s.system.value : (Yb({ window: o }).value ? "dark" : "light"),
		);
	return Te({
		get() {
			return s.value === "dark";
		},
		set(d) {
			const h = d ? "dark" : "light";
			c.value === h ? (s.value = "auto") : (s.value = h);
		},
	});
}
function xE(e, t, r = {}) {
	const { window: o = sr, ...s } = r;
	let c;
	const f = Gb(() => o && "ResizeObserver" in o),
		d = () => {
			c && (c.disconnect(), (c = void 0));
		},
		h = Te(() => {
			const m = Vr(e);
			return Array.isArray(m) ? m.map((b) => tu(b)) : [tu(m)];
		}),
		p = Bt(
			h,
			(m) => {
				if ((d(), f.value && o)) {
					c = new ResizeObserver(t);
					for (const b of m) {
						b && c.observe(b, s);
					}
				}
			},
			{ immediate: !0, flush: "post" },
		),
		v = () => {
			d(), p();
		};
	return Du(v), { isSupported: f, stop: v };
}
function zu(e, t, r = {}) {
	const { window: o = sr } = r;
	return Zb(e, t, o == undefined ? void 0 : o.localStorage, r);
}
function SE(e = "history", t = {}) {
	const {
		initialValue: r = {},
		removeNullishValues: o = !0,
		removeFalsyValues: s = !1,
		write: c = !0,
		window: f = sr,
	} = t;
	if (!f) {
		return Zn(r);
	}
	const d = Zn({});
	function h() {
		if (e === "history") {
			return f.location.search || "";
		}
		if (e === "hash") {
			const L = f.location.hash || "",
				N = L.indexOf("?");
			return N > 0 ? L.slice(N) : "";
		}
		return (f.location.hash || "").replace(/^#/, "");
	}
	function p(L) {
		const N = L.toString();
		if (e === "history") {
			return `${N ? `?${N}` : ""}${f.location.hash || ""}`;
		}
		if (e === "hash-params") {
			return `${f.location.search || ""}${N ? `#${N}` : ""}`;
		}
		const P = f.location.hash || "#",
			A = P.indexOf("?");
		return A > 0
			? `${P.slice(0, A)}${N ? `?${N}` : ""}`
			: `${P}${N ? `?${N}` : ""}`;
	}
	function v() {
		return new URLSearchParams(h());
	}
	function m(L) {
		const N = new Set(Object.keys(d));
		for (const P of L.keys()) {
			const A = L.getAll(P);
			(d[P] = A.length > 1 ? A : L.get(P) || ""), N.delete(P);
		}
		[...N].forEach((P) => delete d[P]);
	}
	const { pause: b, resume: w } = Ub(
		d,
		() => {
			const L = new URLSearchParams("");
			Object.keys(d).forEach((N) => {
				const P = d[N];
				Array.isArray(P)
					? P.forEach((A) => L.append(N, A))
					: ((o && P == null) || (s && !P)
						? L.delete(N)
						: L.set(N, P));
			}),
				M(L);
		},
		{ deep: !0 },
	);
	function M(L, N) {
		b(),
			N && m(L),
			f.history.replaceState(
				f.history.state,
				f.document.title,
				f.location.pathname + p(L),
			),
			w();
	}
	function C() {
		c && M(v(), !0);
	}
	Rs(f, "popstate", C, !1), e !== "history" && Rs(f, "hashchange", C, !1);
	const E = v();
	return E.keys().next().value ? m(E) : Object.assign(d, r), d;
}
function Wh(e = {}) {
	const {
			window: t = sr,
			initialWidth: r = Number.POSITIVE_INFINITY,
			initialHeight: o = Number.POSITIVE_INFINITY,
			listenOrientation: s = !0,
			includeScrollbar: c = !0,
			type: f = "inner",
		} = e,
		d = We(r),
		h = We(o),
		p = () => {
			t &&
				(f === "outer"
					? ((d.value = t.outerWidth), (h.value = t.outerHeight))
					: (c
						? ((d.value = t.innerWidth), (h.value = t.innerHeight))
						: ((d.value = t.document.documentElement.clientWidth),
							(h.value = t.document.documentElement.clientHeight))));
		};
	if ((p(), Bh(p), Rs("resize", p, { passive: !0 }), s)) {
		const v = Kb("(orientation: portrait)");
		Bt(v, () => p());
	}
	return { width: d, height: h };
}
const Hd = jr([]),
	Bn = jr([]),
	Er = zu("vitest-ui_task-tree-opened", [], { shallow: !0 }),
	nu = Te(() => new Set(Er.value)),
	ln = zu("vitest-ui_task-tree-filter", {
		expandAll: void 0,
		failed: !1,
		success: !1,
		skipped: !1,
		onlyTests: !1,
		search: "",
	}),
	zn = We(ln.value.search),
	_E = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function Jb(e) {
	return e.replaceAll(/[&<>"']/g, (t) => _E[t]);
}
const kE = Te(() => {
		const e = zn.value.toLowerCase();
		return e.length > 0 ? new RegExp(`(${Jb(e)})`, "gi") : undefined;
	}),
	Qb = Te(() => zn.value.trim() !== ""),
	et = Zn({
		failed: ln.value.failed,
		success: ln.value.success,
		skipped: ln.value.skipped,
		onlyTests: ln.value.onlyTests,
	}),
	qd = Te(() => !!(et.failed || et.success || et.skipped)),
	Iu = jr([]),
	Ds = We(!1),
	wm = Te(() => {
		const e = ln.value.expandAll;
		return Er.value.length > 0 ? e !== !0 : e !== !1;
	}),
	TE = Te(() => {
		const e = Qb.value,
			t = qd.value,
			r = et.onlyTests,
			o = Ce.summary.filesFailed,
			s = Ce.summary.filesSuccess,
			c = Ce.summary.filesSkipped,
			f = Ce.summary.filesRunning,
			d = Iu.value;
		return Ce.collectTestsTotal(e || t, r, d, {
			failed: o,
			success: s,
			skipped: c,
			running: f,
		});
	});
function Fu(e) {
	return Object.hasOwn(e, "tasks");
}
function CE(e, t) {
	return typeof e !== "string" || typeof t !== "string"
		? !1
		: e.toLowerCase().includes(t.toLowerCase());
}
function ew(e) {
	if (!e) {
		return "";
	}
	const t = [...e].reduce((o, s, c) => o + s.codePointAt(0) + c, 0),
		r = ["blue", "yellow", "cyan", "green", "magenta"];
	return r[t % r.length];
}
function EE(e) {
	return e.type === "test" || e.type === "custom";
}
function LE(e) {
	return e.mode === "run" && (e.type === "test" || e.type === "custom");
}
function Mn(e) {
	return e.type === "file";
}
function vi(e) {
	return e.type === "file" || e.type === "suite";
}
function AE(e = Ce.root.tasks) {
	return e.sort((t, r) =>
		`${t.filepath}:${t.projectName}`.localeCompare(
			`${r.filepath}:${r.projectName}`,
		),
	);
}
function ia(e, t = !1) {
	let o, s, c, f, d;
	let r = Ce.nodes.get(e.id);
	if (
		(r
			? ((r.typecheck = !!e.meta && "typecheck" in e.meta),
				(r.state = (o = e.result) == undefined ? void 0 : o.state),
				(r.mode = e.mode),
				(r.duration = (s = e.result) == undefined ? void 0 : s.duration),
				(r.collectDuration = e.collectDuration),
				(r.setupDuration = e.setupDuration),
				(r.environmentLoad = e.environmentLoad),
				(r.prepareDuration = e.prepareDuration))
			: ((r = {
					id: e.id,
					parentId: "root",
					name: e.name,
					mode: e.mode,
					expandable: !0,
					expanded: nu.value.size > 0 && nu.value.has(e.id),
					type: "file",
					children: new Set(),
					tasks: [],
					typecheck: !!e.meta && "typecheck" in e.meta,
					indent: 0,
					duration:
						((c = e.result) == undefined ? void 0 : c.duration) != undefined
							? Math.round((f = e.result) == undefined ? void 0 : f.duration)
							: void 0,
					filepath: e.filepath,
					projectName: e.projectName || "",
					projectNameColor: ew(e.projectName),
					collectDuration: e.collectDuration,
					setupDuration: e.setupDuration,
					environmentLoad: e.environmentLoad,
					prepareDuration: e.prepareDuration,
					state: (d = e.result) == undefined ? void 0 : d.state,
				}),
				Ce.nodes.set(e.id, r),
				Ce.root.tasks.push(r)),
		t)
	) {
		for (let h = 0; h < e.tasks.length; h++) {
			wa(e.id, e.tasks[h], !0);
		}
	}
}
function tw(e, t) {
	const r = Ce.nodes.get(e);
	if (!(r && vi(r))) {
		return;
	}
	const o = xt.state.idMap.get(e);
	if (o && Fu(o)) {
		return wa(r.parentId, o, t && o.tasks.length > 0), [r, o];
	}
}
function ME(e) {
	const t = Ce.nodes.get(e);
	if (!t) {
		return;
	}
	const r = xt.state.idMap.get(e);
	!(r && Os(r)) || wa(t.parentId, r, !1);
}
function wa(e, t, r) {
	let f, d, h, p, v;
	const o = Ce.nodes.get(e);
	let s;
	const c =
		((f = t.result) == undefined ? void 0 : f.duration) != undefined
			? Math.round((d = t.result) == undefined ? void 0 : d.duration)
			: void 0;
	if (
		o &&
		((s = Ce.nodes.get(t.id)),
		s
			? (o.children.has(t.id) || (o.tasks.push(s), o.children.add(t.id)),
				(s.mode = t.mode),
				(s.duration = c),
				(s.state = (h = t.result) == undefined ? void 0 : h.state))
			: (Os(t)
					? (s = {
							id: t.id,
							fileId: t.file.id,
							parentId: e,
							name: t.name,
							mode: t.mode,
							type: t.type,
							expandable: !1,
							expanded: !1,
							indent: o.indent + 1,
							duration: c,
							state: (p = t.result) == undefined ? void 0 : p.state,
						})
					: (s = {
							id: t.id,
							fileId: t.file.id,
							parentId: e,
							name: t.name,
							mode: t.mode,
							type: "suite",
							expandable: !0,
							expanded: nu.value.size > 0 && nu.value.has(t.id),
							children: new Set(),
							tasks: [],
							indent: o.indent + 1,
							duration: c,
							state: (v = t.result) == undefined ? void 0 : v.state,
						}),
				Ce.nodes.set(t.id, s),
				o.tasks.push(s),
				o.children.add(t.id)),
		s && r && Fu(t))
	) {
		for (let m = 0; m < t.tasks.length; m++) {
			wa(s.id, t.tasks[m], r);
		}
	}
}
function NE(e) {
	const t = Ce.nodes.get(e);
	if (!(t && vi(t))) {
		return;
	}
	const r = new Set(Er.value);
	r.delete(t.id);
	const o = [...PE(t)];
	(Er.value = [...r]), (Bn.value = o);
}
function $E() {
	Bd(Ce.root.tasks);
	const e = Bn.value.filter(Mn);
	Bd(e), (Er.value = []), (ln.value.expandAll = !0), (Bn.value = e);
}
function Bd(e) {
	for (const t of e) {
		vi(t) && ((t.expanded = !1), Bd(t.tasks));
	}
}
function* nw(e, t) {
	if ((t && (yield e.id), vi(e))) {
		for (let r = 0; r < e.tasks.length; r++) {
			yield* nw(e.tasks[r], !0);
		}
	}
}
function* PE(e) {
	const t = e.id,
		r = new Set(nw(e, !1));
	for (let o = 0; o < Bn.value.length; o++) {
		const s = Bn.value[o];
		if (s.id === t) {
			(s.expanded = !1), yield s;
			continue;
		}
		if (r.has(s.id)) {
			r.delete(s.id);
			continue;
		}
		yield s;
	}
}
function OE(e, t, r) {
	return e ? ow(e, t, r) : !1;
}
function Uh(e, t) {
	const r = [...rw(e, t)];
	(Bn.value = r), (Iu.value = r.filter(Mn).map((o) => lr(o.id)));
}
function* rw(e, t) {
	for (const r of AE()) {
		yield* iw(r, e, t);
	}
}
function* iw(e, t, r) {
	const o = new Set(),
		s = new Map(),
		c = [];
	let f;
	if (r.onlyTests) {
		for (const [m, b] of Wd(e, o, (w) => xm(w, t, r))) {
			c.push([m, b]);
		}
	} else {
		for (const [m, b] of Wd(e, o, (w) => xm(w, t, r))) {
			vi(b)
				? (s.set(b.id, m),
					Mn(b)
						? (m && (f = b.id), c.push([m, b]))
						: c.push([m || s.get(b.parentId) === !0, b]))
				: c.push([m || s.get(b.parentId) === !0, b]);
		}
		!(f || Mn(e)) && "fileId" in e && (f = e.fileId);
	}
	const d = new Set(),
		h = [...DE(c, r.onlyTests, o, d, f)].reverse(),
		p = Ce.nodes,
		v = new Set(
			h
				.filter((m) => {
					let b;
					return (
						Mn(m) ||
						(vi(m) &&
							((b = p.get(m.parentId)) == undefined ? void 0 : b.expanded))
					);
				})
				.map((m) => m.id),
		);
	yield* h.filter((m) => {
		let b;
		return (
			Mn(m) ||
			(v.has(m.parentId) &&
				((b = p.get(m.parentId)) == undefined ? void 0 : b.expanded))
		);
	});
}
function RE(e, t, r, o, s) {
	if (o) {
		if (Mn(t)) {
			return s.has(t.id) ? t : void 0;
		}
		if (r.has(t.id)) {
			const c = Ce.nodes.get(t.parentId);
			return c && Mn(c) && s.add(c.id), t;
		}
	} else if (e || r.has(t.id) || s.has(t.id)) {
		const c = Ce.nodes.get(t.parentId);
		return c && Mn(c) && s.add(c.id), t;
	}
}
function* DE(e, t, r, o, s) {
	for (let c = e.length - 1; c >= 0; c--) {
		const [f, d] = e[c],
			h = vi(d);
		if (!t && s && r.has(s) && "fileId" in d && d.fileId === s) {
			h && r.add(d.id);
			let p = Ce.nodes.get(d.parentId);
			while (p) {
				r.add(p.id), Mn(p) && o.add(p.id), (p = Ce.nodes.get(p.parentId));
			}
			yield d;
			continue;
		}
		if (h) {
			const p = RE(f, d, r, t, o);
			p && (yield p);
		} else if (f) {
			const p = Ce.nodes.get(d.parentId);
			p && Mn(p) && o.add(p.id), yield d;
		}
	}
}
function zE(e, t) {
	let r, o;
	return (t.success || t.failed) &&
		"result" in e &&
		((t.success &&
			((r = e.result) == undefined ? void 0 : r.state) === "pass") ||
			(t.failed && ((o = e.result) == undefined ? void 0 : o.state) === "fail"))
		? !0
		: (t.skipped && "mode" in e
			? e.mode === "skip" || e.mode === "todo"
			: !1);
}
function ow(e, t, r) {
	if (t.length === 0 || CE(e.name, t)) {
		if (r.success || r.failed || r.skipped) {
			if (zE(e, r)) {
				return !0;
			}
		} else {
			return !0;
		}
	}
	return !1;
}
function* Wd(e, t, r) {
	const o = r(e);
	if (o) {
		if (EE(e)) {
			let s = Ce.nodes.get(e.parentId);
			while (s) {
				t.add(s.id), (s = Ce.nodes.get(s.parentId));
			}
		} else if (Mn(e)) {
			t.add(e.id);
		} else {
			t.add(e.id);
			let s = Ce.nodes.get(e.parentId);
			while (s) {
				t.add(s.id), (s = Ce.nodes.get(s.parentId));
			}
		}
	}
	if ((yield [o, e], vi(e))) {
		for (let s = 0; s < e.tasks.length; s++) {
			yield* Wd(e.tasks[s], t, r);
		}
	}
}
function xm(e, t, r) {
	const o = xt.state.idMap.get(e.id);
	return o ? ow(o, t, r) : !1;
}
function IE(e, t, r) {
	const o = tw(e, !1);
	if (!o) {
		return;
	}
	const [s, c] = o;
	for (const p of c.tasks) {
		wa(s.id, p, !1);
	}
	s.expanded = !0;
	const f = new Set(Er.value);
	f.add(s.id);
	const d = new Set(iw(s, t, r)),
		h = [...qE(s, d)];
	(Er.value = [...f]), (Bn.value = h);
}
function FE(e, t) {
	Vh(Ce.root.tasks, !1);
	const r = [...rw(e, t)];
	(ln.value.expandAll = !1),
		(Er.value = []),
		(Bn.value = r),
		(Iu.value = r.filter(Mn).map((o) => lr(o.id)));
}
function HE(e, t) {
	if (e.size > 0) {
		for (const r of Bn.value) {
			e.has(r.id) && (r.expanded = !0);
		}
	} else {
		t && Vh(Bn.value.filter(Mn), !0);
	}
}
function Vh(e, t) {
	for (const r of e) {
		vi(r) && ((r.expanded = !0), Vh(r.tasks, !1));
	}
	t && ((ln.value.expandAll = !1), (Er.value = []));
}
function* qE(e, t) {
	const r = e.id,
		o = new Set([...t].map((s) => s.id));
	for (const s of Bn.value) {
		s.id === r
			? ((s.expanded = !0), o.has(s.id) || (yield e), yield* t)
			: o.has(s.id) || (yield s);
	}
}
function BE(e, t, r, o) {
	e
		.map((s) => [`${s.filepath}:${s.projectName || ""}`, s])
		.sort(([s], [c]) => s.localeCompare(c))
		.map(([, s]) => ia(s, t)),
		(Hd.value = [...Ce.root.tasks]),
		Uh(r.trim(), {
			failed: o.failed,
			success: o.success,
			skipped: o.skipped,
			onlyTests: o.onlyTests,
		});
}
function WE(e) {
	queueMicrotask(() => {
		const t = Ce.pendingTasks,
			r = xt.state.idMap;
		for (const o of e) {
			if (o[1]) {
				const c = r.get(o[0]);
				if (c) {
					let f = t.get(c.file.id);
					f || ((f = new Set()), t.set(c.file.id, f)), f.add(c.id);
				}
			}
		}
	});
}
function Sm(e, t, r, o, s) {
	e && XE(r);
	const c = !e;
	queueMicrotask(() => {
		t ? jE(c) : GE(c);
	}),
		queueMicrotask(() => {
			YE(r);
		}),
		queueMicrotask(() => {
			t &&
				((r.failedSnapshot = Hd.value && qh(Hd.value.map((f) => lr(f.id)))),
				(r.failedSnapshotEnabled = !0));
		}),
		queueMicrotask(() => {
			KE(o, s, t);
		});
}
function* UE() {
	yield* Bn.value.filter(LE);
}
function VE() {
	const e = xt.state.idMap;
	let t;
	for (const r of UE()) {
		(t = e.get(r.parentId)),
			t &&
				Fu(t) &&
				t.mode === "todo" &&
				((t = e.get(r.id)), t && (t.mode = "todo"));
	}
}
function jE(e) {
	const t = xt.state.getFiles(),
		r = Ce.nodes,
		o = t.filter((c) => !r.has(c.id));
	for (let c = 0; c < o.length; c++) {
		ia(o[c], e), ru(o[c].tasks);
	}
	const s = Ce.root.tasks;
	for (let c = 0; c < s.length; c++) {
		const f = s[c],
			d = lr(f.id);
		if (!d) {
			continue;
		}
		ia(d, e);
		const h = d.tasks;
		h != undefined && h.length && ru(d.tasks);
	}
}
function GE(e) {
	const t = new Map(Ce.pendingTasks.entries());
	Ce.pendingTasks.clear();
	const r = Ce.nodes,
		o = [...t.keys()]
			.filter((d) => !r.has(d))
			.map((d) => lr(d))
			.filter(Boolean);
	let s;
	for (let d = 0; d < o.length; d++) {
		(s = o[d]), ia(s, !1), ru(s.tasks), t.delete(s.id);
	}
	const c = xt.state.idMap,
		f = Ce.root.tasks;
	for (let d = 0; d < f.length; d++) {
		const h = f[d],
			p = lr(h.id);
		if (!p) {
			continue;
		}
		const v = t.get(p.id);
		v && (ia(p, e), ru([...v].map((m) => c.get(m)).filter(Boolean)));
	}
}
function KE(e, t, r = !1) {
	const o = ln.value.expandAll,
		s = o !== !0,
		c = new Set(Er.value),
		f = (c.size > 0 && o === !1) || s;
	queueMicrotask(() => {
		_m(e, t, r);
	}),
		Ds.value ||
			queueMicrotask(() => {
				(Bn.value.length || r) && (Ds.value = !0);
			}),
		f &&
			(queueMicrotask(() => {
				HE(c, r), s && (ln.value.expandAll = !1);
			}),
			queueMicrotask(() => {
				_m(e, t, r);
			}));
}
function _m(e, t, r) {
	Uh(e, t), r && VE();
}
function ru(e) {
	let t;
	for (let r = 0; r < e.length; r++) {
		(t = e[r]), Fu(t) ? tw(t.id, !0) : ME(t.id);
	}
}
function XE(e) {
	(e.files = 0),
		(e.time = ""),
		(e.filesFailed = 0),
		(e.filesSuccess = 0),
		(e.filesIgnore = 0),
		(e.filesRunning = 0),
		(e.filesSkipped = 0),
		(e.filesTodo = 0),
		(e.testsFailed = 0),
		(e.testsSuccess = 0),
		(e.testsIgnore = 0),
		(e.testsSkipped = 0),
		(e.testsTodo = 0),
		(e.totalTests = 0),
		(e.failedSnapshotEnabled = !1);
}
function YE(e) {
	let f, d, h, p, v, m;
	const t = xt.state.idMap,
		r = new Map(Ce.root.tasks.filter((b) => t.has(b.id)).map((b) => [b.id, b])),
		o = [...r.values()].map((b) => [b.id, lr(b.id)]),
		s = {
			files: r.size,
			time: "",
			filesFailed: 0,
			filesSuccess: 0,
			filesIgnore: 0,
			filesRunning: 0,
			filesSkipped: 0,
			filesTodo: 0,
			filesSnapshotFailed: 0,
			testsFailed: 0,
			testsSuccess: 0,
			testsIgnore: 0,
			testsSkipped: 0,
			testsTodo: 0,
			totalTests: 0,
			failedSnapshot: !1,
			failedSnapshotEnabled: !1,
		};
	let c = 0;
	for (const [b, w] of o) {
		if (!w) {
			continue;
		}
		const M = r.get(b);
		M &&
			((M.mode = w.mode),
			(M.setupDuration = w.setupDuration),
			(M.prepareDuration = w.prepareDuration),
			(M.environmentLoad = w.environmentLoad),
			(M.collectDuration = w.collectDuration),
			(M.duration =
				((f = w.result) == undefined ? void 0 : f.duration) != undefined
					? Math.round((d = w.result) == undefined ? void 0 : d.duration)
					: void 0),
			(M.state = (h = w.result) == undefined ? void 0 : h.state)),
			(c += Math.max(0, w.collectDuration || 0)),
			(c += Math.max(0, w.setupDuration || 0)),
			(c += Math.max(
				0,
				((p = w.result) == undefined ? void 0 : p.duration) || 0,
			)),
			(c += Math.max(0, w.environmentLoad || 0)),
			(c += Math.max(0, w.prepareDuration || 0)),
			(s.time = c > 1e3 ? `${(c / 1e3).toFixed(2)}s` : `${Math.round(c)}ms`),
			((v = w.result) == undefined ? void 0 : v.state) === "fail"
				? s.filesFailed++
				: ((m = w.result) == undefined ? void 0 : m.state) === "pass"
					? s.filesSuccess++
					: w.mode === "skip"
						? (s.filesIgnore++, s.filesSkipped++)
						: w.mode === "todo"
							? (s.filesIgnore++, s.filesTodo++)
							: s.filesRunning++;
		const {
			failed: C,
			success: E,
			skipped: L,
			total: N,
			ignored: P,
			todo: A,
		} = sw(w);
		(s.totalTests += N),
			(s.testsFailed += C),
			(s.testsSuccess += E),
			(s.testsSkipped += L),
			(s.testsTodo += A),
			(s.testsIgnore += P);
	}
	(e.files = s.files),
		(e.time = s.time),
		(e.filesFailed = s.filesFailed),
		(e.filesSuccess = s.filesSuccess),
		(e.filesIgnore = s.filesIgnore),
		(e.filesRunning = s.filesRunning),
		(e.filesSkipped = s.filesSkipped),
		(e.filesTodo = s.filesTodo),
		(e.testsFailed = s.testsFailed),
		(e.testsSuccess = s.testsSuccess),
		(e.testsFailed = s.testsFailed),
		(e.testsTodo = s.testsTodo),
		(e.testsIgnore = s.testsIgnore),
		(e.testsSkipped = s.testsSkipped),
		(e.totalTests = s.totalTests);
}
function sw(e, t = "", r) {
	let s, c;
	const o = {
		failed: 0,
		success: 0,
		skipped: 0,
		running: 0,
		total: 0,
		ignored: 0,
		todo: 0,
	};
	for (const f of lw(e)) {
		(!r || OE(f, t, r)) &&
			(o.total++,
			((s = f.result) == undefined ? void 0 : s.state) === "fail"
				? o.failed++
				: ((c = f.result) == undefined ? void 0 : c.state) === "pass"
					? o.success++
					: f.mode === "skip"
						? (o.ignored++, o.skipped++)
						: f.mode === "todo" && (o.ignored++, o.todo++));
	}
	return (o.running = o.total - o.failed - o.success - o.ignored), o;
}
function ZE(e, t, r, o, s, c) {
	let f, d;
	if (t) {
		return r
			.map((h) => sw(h, s, c))
			.reduce(
				(h, { failed: p, success: v, ignored: m, running: b }) => (
					(h.failed += p),
					(h.success += v),
					(h.skipped += m),
					(h.running += b),
					h
				),
				{ failed: 0, success: 0, skipped: 0, running: 0 },
			);
	}
	if (e) {
		const h = { failed: 0, success: 0, skipped: 0, running: 0 },
			p = !(c.success || c.failed),
			v = c.failed || p,
			m = c.success || p;
		for (const b of r) {
			((f = b.result) == undefined ? void 0 : f.state) === "fail"
				? (h.failed += v ? 1 : 0)
				: (((d = b.result) == null ? void 0 : d.state) === "pass"
					? (h.success += m ? 1 : 0)
					: b.mode === "skip" || b.mode === "todo" || h.running++);
		}
		return h;
	}
	return o;
}
function* lw(e) {
	const t = Fh(e);
	let r;
	for (let o = 0; o < t.length; o++) {
		(r = t[o]), Os(r) ? yield r : yield* lw(r.tasks);
	}
}
class JE {
	constructor(
		t = !1,
		r = 500,
		o = { id: "vitest-root-node", expandable: !0, expanded: !0, tasks: [] },
		s = new Map(),
		c = new Map(),
		f = Zn({
			files: 0,
			time: "",
			filesFailed: 0,
			filesSuccess: 0,
			filesIgnore: 0,
			filesRunning: 0,
			filesSkipped: 0,
			filesSnapshotFailed: 0,
			filesTodo: 0,
			testsFailed: 0,
			testsSuccess: 0,
			testsIgnore: 0,
			testsSkipped: 0,
			testsTodo: 0,
			totalTests: 0,
			failedSnapshot: !1,
			failedSnapshotEnabled: !1,
		}),
	) {
		fs(this, "rafCollector");
		fs(this, "resumeEndRunId");
		(this.onTaskUpdateCalled = t),
			(this.resumeEndTimeout = r),
			(this.root = o),
			(this.pendingTasks = s),
			(this.nodes = c),
			(this.summary = f),
			(this.rafCollector = hE(this.runCollect.bind(this), {
				fpsLimit: 10,
				immediate: !1,
			}));
	}
	loadFiles(t) {
		BE(t, !0, zn.value.trim(), {
			failed: et.failed,
			success: et.success,
			skipped: et.skipped,
			onlyTests: et.onlyTests,
		});
	}
	startRun() {
		(this.resumeEndRunId = setTimeout(
			() => this.endRun(),
			this.resumeEndTimeout,
		)),
			this.collect(!0, !1);
	}
	resumeRun(t) {
		WE(t),
			this.onTaskUpdateCalled ||
				(clearTimeout(this.resumeEndRunId),
				(this.onTaskUpdateCalled = !0),
				this.collect(!0, !1, !1),
				this.rafCollector.resume());
	}
	endRun() {
		this.rafCollector.pause(),
			(this.onTaskUpdateCalled = !1),
			this.collect(!1, !0);
	}
	runCollect() {
		this.collect(!1, !1);
	}
	collect(t, r, o = !0) {
		o
			? queueMicrotask(() => {
					Sm(t, r, this.summary, zn.value.trim(), {
						failed: et.failed,
						success: et.success,
						skipped: et.skipped,
						onlyTests: et.onlyTests,
					});
				})
			: Sm(t, r, this.summary, zn.value.trim(), {
					failed: et.failed,
					success: et.success,
					skipped: et.skipped,
					onlyTests: et.onlyTests,
				});
	}
	collectTestsTotal(t, r, o, s) {
		return ZE(t, r, o, s, zn.value.trim(), {
			failed: et.failed,
			success: et.success,
			skipped: et.skipped,
			onlyTests: et.onlyTests,
		});
	}
	collapseNode(t) {
		queueMicrotask(() => {
			NE(t);
		});
	}
	expandNode(t) {
		queueMicrotask(() => {
			IE(t, zn.value.trim(), {
				failed: et.failed,
				success: et.success,
				skipped: et.skipped,
				onlyTests: et.onlyTests,
			});
		});
	}
	collapseAllNodes() {
		queueMicrotask(() => {
			$E();
		});
	}
	expandAllNodes() {
		queueMicrotask(() => {
			FE(zn.value.trim(), {
				failed: et.failed,
				success: et.success,
				skipped: et.skipped,
				onlyTests: et.onlyTests,
			});
		});
	}
	filterNodes() {
		queueMicrotask(() => {
			Uh(zn.value.trim(), {
				failed: et.failed,
				success: et.success,
				skipped: et.skipped,
				onlyTests: et.onlyTests,
			});
		});
	}
}
const Ce = new JE(),
	Dr = We([414, 896]),
	jh = SE("hash", {
		initialValue: { file: "", view: undefined, line: undefined },
	}),
	eo = Su(jh, "file"),
	jn = Su(jh, "view"),
	Ud = Su(jh, "line"),
	iu = We("idle"),
	QE = Te(() => iu.value === "idle"),
	Wi = We([]),
	zs = We(),
	Es = We(!0),
	to = We(!1),
	ou = We(!0),
	gs = Te(() => {
		let e;
		return (e = Bu.value) == undefined ? void 0 : e.coverage;
	}),
	Vd = Te(() => {
		let e;
		return (e = gs.value) == undefined ? void 0 : e.enabled;
	}),
	vs = Te(() => Vd.value && !!gs.value.htmlReporter),
	br = zu("vitest-ui_splitpanes-mainSizes", [33, 67], { initOnMounted: !0 }),
	Mo = zu("vitest-ui_splitpanes-detailSizes", [33, 67], { initOnMounted: !0 }),
	gn = Zn({
		navigation: br.value[0],
		details: { size: br.value[1], browser: Mo.value[0], main: Mo.value[1] },
	}),
	km = Te(() => {
		let e;
		if (vs.value) {
			const t = gs.value.reportsDirectory.lastIndexOf("/"),
				r = (e = gs.value.htmlReporter) == undefined ? void 0 : e.subdir;
			return r
				? `/${gs.value.reportsDirectory.slice(t + 1)}/${r}/index.html`
				: `/${gs.value.reportsDirectory.slice(t + 1)}/index.html`;
		}
	});
Bt(
	iu,
	(e) => {
		ou.value = e === "running";
	},
	{ immediate: !0 },
);
function eL() {
	const e = eo.value;
	if (e && e.length > 0) {
		const t = lr(e);
		t
			? ((zs.value = t), (Es.value = !1), (to.value = !1))
			: cE(
					() => xt.state.getFiles(),
					() => {
						(zs.value = lr(e)), (Es.value = !1), (to.value = !1);
					},
				);
	}
	return Es;
}
function su(e) {
	(Es.value = e), (to.value = !1), e && ((zs.value = void 0), (eo.value = ""));
}
function aw(e, t) {
	(eo.value = e.file.id),
		(Ud.value = undefined),
		t != undefined &&
			(un(() => {
				Ud.value = t;
			}),
			(jn.value = "editor")),
		(zs.value = lr(e.file.id)),
		su(!1);
}
function tL() {
	(to.value = !0), (Es.value = !1), (zs.value = void 0), (eo.value = "");
}
function nL() {
	(gn.details.browser = 100), (gn.details.main = 0), (Mo.value = [100, 0]);
}
function rL() {
	(gn.details.browser = 33), (gn.details.main = 67), (Mo.value = [33, 67]);
}
function iL() {
	(gn.navigation = 33), (gn.details.size = 67), (br.value = [33, 67]);
}
const oL = {
		setCurrentFileId(e) {
			(eo.value = e), (zs.value = lr(e)), su(!1);
		},
		async setIframeViewport(e, t) {
			(Dr.value = [e, t]), await new Promise((r) => requestAnimationFrame(r));
		},
	},
	sL = location.port,
	lL = [location.hostname, sL].filter(Boolean).join(":"),
	aL = `${
		location.protocol === "https:" ? "wss:" : "ws:"
	}//${lL}/__vitest_api__?token=${window.VITEST_API_TOKEN}`,
	Br = !!window.METADATA_PATH,
	cL = 44,
	Tm = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	uL = new Uint8Array(64),
	cw = new Uint8Array(128);
for (let e = 0; e < Tm.length; e++) {
	const t = Tm.codePointAt(e);
	(uL[e] = t), (cw[t] = e);
}
function kl(e, t) {
	let r = 0,
		o = 0,
		s = 0;
	do {
		const f = e.next();
		(s = cw[f]), (r |= (s & 31) << o), (o += 5);
	} while (s & 32);
	const c = r & 1;
	return (r >>>= 1), c && (r = -2_147_483_648 | -r), t + r;
}
function Cm(e, t) {
	return e.pos >= t ? !1 : e.peek() !== cL;
}
class fL {
	constructor(t) {
		(this.pos = 0), (this.buffer = t);
	}
	next() {
		return this.buffer.codePointAt(this.pos++);
	}
	peek() {
		return this.buffer.codePointAt(this.pos);
	}
	indexOf(t) {
		const { buffer: r, pos: o } = this,
			s = r.indexOf(t, o);
		return s === -1 ? r.length : s;
	}
}
function dL(e) {
	const { length: t } = e,
		r = new fL(e),
		o = [];
	let s = 0,
		c = 0,
		f = 0,
		d = 0,
		h = 0;
	do {
		const p = r.indexOf(";"),
			v = [];
		let m = !0,
			b = 0;
		for (s = 0; r.pos < p; ) {
			let w;
			(s = kl(r, s)),
				s < b && (m = !1),
				(b = s),
				Cm(r, p)
					? ((c = kl(r, c)),
						(f = kl(r, f)),
						(d = kl(r, d)),
						Cm(r, p)
							? ((h = kl(r, h)), (w = [s, c, f, d, h]))
							: (w = [s, c, f, d]))
					: (w = [s]),
				v.push(w),
				r.pos++;
		}
		m || hL(v), o.push(v), (r.pos = p + 1);
	} while (r.pos <= t);
	return o;
}
function hL(e) {
	e.sort(pL);
}
function pL(e, t) {
	return e[0] - t[0];
}
const gL = /^[\w+.-]+:\/\//,
	vL =
		/^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/,
	mL = /^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;
let qt;
((e) => {
	(e[(e.Empty = 1)] = "Empty"),
		(e[(e.Hash = 2)] = "Hash"),
		(e[(e.Query = 3)] = "Query"),
		(e[(e.RelativePath = 4)] = "RelativePath"),
		(e[(e.AbsolutePath = 5)] = "AbsolutePath"),
		(e[(e.SchemeRelative = 6)] = "SchemeRelative"),
		(e[(e.Absolute = 7)] = "Absolute");
})(qt || (qt = {}));
function yL(e) {
	return gL.test(e);
}
function bL(e) {
	return e.startsWith("//");
}
function uw(e) {
	return e.startsWith("/");
}
function wL(e) {
	return e.startsWith("file:");
}
function Em(e) {
	return /^[.?#]/.test(e);
}
function hc(e) {
	const t = vL.exec(e);
	return fw(
		t[1],
		t[2] || "",
		t[3],
		t[4] || "",
		t[5] || "/",
		t[6] || "",
		t[7] || "",
	);
}
function xL(e) {
	const t = mL.exec(e),
		r = t[2];
	return fw(
		"file:",
		"",
		t[1] || "",
		"",
		uw(r) ? r : "/" + r,
		t[3] || "",
		t[4] || "",
	);
}
function fw(e, t, r, o, s, c, f) {
	return {
		scheme: e,
		user: t,
		host: r,
		port: o,
		path: s,
		query: c,
		hash: f,
		type: qt.Absolute,
	};
}
function Lm(e) {
	if (bL(e)) {
		const r = hc("http:" + e);
		return (r.scheme = ""), (r.type = qt.SchemeRelative), r;
	}
	if (uw(e)) {
		const r = hc("http://foo.com" + e);
		return (r.scheme = ""), (r.host = ""), (r.type = qt.AbsolutePath), r;
	}
	if (wL(e)) {
		return xL(e);
	}
	if (yL(e)) {
		return hc(e);
	}
	const t = hc("http://foo.com/" + e);
	return (
		(t.scheme = ""),
		(t.host = ""),
		(t.type = e
			? e.startsWith("?")
				? qt.Query
				: e.startsWith("#")
					? qt.Hash
					: qt.RelativePath
			: qt.Empty),
		t
	);
}
function SL(e) {
	if (e.endsWith("/..")) {
		return e;
	}
	const t = e.lastIndexOf("/");
	return e.slice(0, t + 1);
}
function _L(e, t) {
	dw(t, t.type),
		e.path === "/" ? (e.path = t.path) : (e.path = SL(t.path) + e.path);
}
function dw(e, t) {
	const r = t <= qt.RelativePath,
		o = e.path.split("/");
	let s = 1,
		c = 0,
		f = !1;
	for (let h = 1; h < o.length; h++) {
		const p = o[h];
		if (!p) {
			f = !0;
			continue;
		}
		if (((f = !1), p !== ".")) {
			if (p === "..") {
				c ? ((f = !0), c--, s--) : r && (o[s++] = p);
				continue;
			}
			(o[s++] = p), c++;
		}
	}
	let d = "";
	for (let h = 1; h < s; h++) {
		d += "/" + o[h];
	}
	(!d || (f && !d.endsWith("/.."))) && (d += "/"), (e.path = d);
}
function kL(e, t) {
	if (!(e || t)) {
		return "";
	}
	const r = Lm(e);
	let o = r.type;
	if (t && o !== qt.Absolute) {
		const c = Lm(t),
			f = c.type;
		switch (o) {
			case qt.Empty: {
				r.hash = c.hash;
			}
			case qt.Hash: {
				r.query = c.query;
			}
			case qt.Query:
			case qt.RelativePath: {
				_L(r, c);
			}
			case qt.AbsolutePath: {
				(r.user = c.user), (r.host = c.host), (r.port = c.port);
			}
			case qt.SchemeRelative: {
				r.scheme = c.scheme;
			}
		}
		f > o && (o = f);
	}
	dw(r, o);
	const s = r.query + r.hash;
	switch (o) {
		case qt.Hash:
		case qt.Query: {
			return s;
		}
		case qt.RelativePath: {
			const c = r.path.slice(1);
			return c ? (Em(t || e) && !Em(c) ? "./" + c + s : c + s) : s || ".";
		}
		case qt.AbsolutePath: {
			return r.path + s;
		}
		default: {
			return r.scheme + "//" + r.user + r.host + r.port + r.path + s;
		}
	}
}
function Am(e, t) {
	return t && !t.endsWith("/") && (t += "/"), kL(e, t);
}
function TL(e) {
	if (!e) {
		return "";
	}
	const t = e.lastIndexOf("/");
	return e.slice(0, t + 1);
}
const no = 0,
	CL = 1,
	EL = 2,
	LL = 3,
	AL = 4;
function ML(e, t) {
	const r = Mm(e, 0);
	if (r === e.length) {
		return e;
	}
	t || (e = [...e]);
	for (let o = r; o < e.length; o = Mm(e, o + 1)) {
		e[o] = $L(e[o], t);
	}
	return e;
}
function Mm(e, t) {
	for (let r = t; r < e.length; r++) {
		if (!NL(e[r])) {return r;}
	}
	return e.length;
}
function NL(e) {
	for (let t = 1; t < e.length; t++) {
		if (e[t][no] < e[t - 1][no]) {return !1;}
	}
	return !0;
}
function $L(e, t) {
	return t || (e = [...e]), e.sort(PL);
}
function PL(e, t) {
	return e[no] - t[no];
}
let lu = !1;
function OL(e, t, r, o) {
	while (r <= o) {
		const s = r + ((o - r) >> 1),
			c = e[s][no] - t;
		if (c === 0) {
			return (lu = !0), s;
		}
		c < 0 ? (r = s + 1) : (o = s - 1);
	}
	return (lu = !1), r - 1;
}
function RL(e, t, r) {
	for (let o = r + 1; o < e.length && e[o][no] === t; r = o++) {}
	return r;
}
function DL(e, t, r) {
	for (let o = r - 1; o >= 0 && e[o][no] === t; r = o--) {}
	return r;
}
function zL() {
	return { lastKey: -1, lastNeedle: -1, lastIndex: -1 };
}
function IL(e, t, r, o) {
	const { lastKey: s, lastNeedle: c, lastIndex: f } = r;
	let d = 0,
		h = e.length - 1;
	if (o === s) {
		if (t === c) {
			return (lu = f !== -1 && e[f][no] === t), f;
		}
		t >= c ? (d = f === -1 ? 0 : f) : (h = f);
	}
	return (r.lastKey = o), (r.lastNeedle = t), (r.lastIndex = OL(e, t, d, h));
}
const FL = "`line` must be greater than 0 (lines start at line 1)",
	HL =
		"`column` must be greater than or equal to 0 (columns start at column 0)",
	Nm = -1,
	qL = 1;
class BL {
	constructor(t, r) {
		const o = typeof t === "string";
		if (!o && t._decodedMemo) {
			return t;
		}
		const s = o ? JSON.parse(t) : t,
			{
				version: c,
				file: f,
				names: d,
				sourceRoot: h,
				sources: p,
				sourcesContent: v,
			} = s;
		(this.version = c),
			(this.file = f),
			(this.names = d || []),
			(this.sourceRoot = h),
			(this.sources = p),
			(this.sourcesContent = v),
			(this.ignoreList = s.ignoreList || s.x_google_ignoreList || void 0);
		const m = Am(h || "", TL(r));
		this.resolvedSources = p.map((w) => Am(w || "", m));
		const { mappings: b } = s;
		typeof b === "string"
			? ((this._encoded = b), (this._decoded = void 0))
			: ((this._encoded = void 0), (this._decoded = ML(b, o))),
			(this._decodedMemo = zL()),
			(this._bySources = void 0),
			(this._bySourceMemos = void 0);
	}
}
function WL(e) {
	let t;
	return (t = e)._decoded || (t._decoded = dL(e._encoded));
}
function UL(e, t) {
	let { line: r, column: o, bias: s } = t;
	if ((r--, r < 0)) {
		throw new Error(FL);
	}
	if (o < 0) {
		throw new Error(HL);
	}
	const c = WL(e);
	if (r >= c.length) {
		return pc(undefined, undefined, undefined, undefined);
	}
	const f = c[r],
		d = VL(f, e._decodedMemo, r, o, s || qL);
	if (d === -1) {
		return pc(undefined, undefined, undefined, undefined);
	}
	const h = f[d];
	if (h.length === 1) {
		return pc(undefined, undefined, undefined, undefined);
	}
	const { names: p, resolvedSources: v } = e;
	return pc(v[h[CL]], h[EL] + 1, h[LL], h.length === 5 ? p[h[AL]] : undefined);
}
function pc(e, t, r, o) {
	return { source: e, line: t, column: r, name: o };
}
function VL(e, t, r, o, s) {
	let c = IL(e, o, t, r);
	return (
		lu ? (c = (s === Nm ? RL : DL)(e, o, c)) : s === Nm && c++,
		c === -1 || c === e.length ? -1 : c
	);
}
const jL = /^[A-Za-z]:\//;
function GL(e = "") {
	return e && e.replaceAll("\\\\", "/").replace(jL, (t) => t.toUpperCase());
}
const KL = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
function XL() {
	return typeof process < "u" && typeof process.cwd === "function"
		? process.cwd().replaceAll("\\\\", "/")
		: "/";
}
const YL = (...e) => {
	e = e.map((o) => GL(o));
	let t = "",
		r = !1;
	for (let o = e.length - 1; o >= -1 && !r; o--) {
		const s = o >= 0 ? e[o] : XL();
		!s || s.length === 0 || ((t = `${s}/${t}`), (r = $m(s)));
	}
	return (t = ZL(t, !r)), r && !$m(t) ? `/${t}` : (t.length > 0 ? t : ".");
};
function ZL(e, t) {
	let r = "",
		o = 0,
		s = -1,
		c = 0,
		f;
	for (let d = 0; d <= e.length; ++d) {
		if (d < e.length) {
			f = e[d];
		} else {
			if (f === "/") {
				break;
			}
			f = "/";
		}
		if (f === "/") {
			if (!(s === d - 1 || c === 1)) {
				if (c === 2) {
					if (
						r.length < 2 ||
						o !== 2 ||
						r[r.length - 1] !== "." ||
						r[r.length - 2] !== "."
					) {
						if (r.length > 2) {
							const h = r.lastIndexOf("/");
							h === -1
								? ((r = ""), (o = 0))
								: ((r = r.slice(0, h)),
									(o = r.length - 1 - r.lastIndexOf("/"))),
								(s = d),
								(c = 0);
							continue;
						}
						if (r.length > 0) {
							(r = ""), (o = 0), (s = d), (c = 0);
							continue;
						}
					}
					t && ((r += r.length > 0 ? "/.." : ".."), (o = 2));
				} else {
					r.length > 0
						? (r += `/${e.slice(s + 1, d)}`)
						: (r = e.slice(s + 1, d)),
						(o = d - s - 1);
				}
			}
			(s = d), (c = 0);
		} else {
			f === "." && c !== -1 ? ++c : (c = -1);
		}
	}
	return r;
}
const $m = (e) => KL.test(e),
	hw = /^\s*at .*(?:\S:\d+|\(native\))/m,
	JL = /^(?:eval@)?(?:\[native code\])?$/,
	QL = [
		"node:internal",
		/\/packages\/\w+\/dist\//,
		/\/@vitest\/\w+\/dist\//,
		"/vitest/dist/",
		"/vitest/src/",
		"/vite-node/dist/",
		"/vite-node/src/",
		"/node_modules/chai/",
		"/node_modules/tinypool/",
		"/node_modules/tinyspy/",
		"/deps/chunk-",
		"/deps/@vitest",
		"/deps/loupe",
		"/deps/chai",
		/node:\w+/,
		/__vitest_test__/,
		/__vitest_browser__/,
		/\/deps\/vitest_/,
	];
function pw(e) {
	if (!e.includes(":")) {
		return [e];
	}
	const r = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(e.replaceAll(/^\(|\)$/g, ""));
	if (!r) {
		return [e];
	}
	let o = r[1];
	if (
		(o.startsWith("async ") && (o = o.slice(6)),
		(o.startsWith("http:") || o.startsWith("https:")) &&
			(o = new URL(o).pathname),
		o.startsWith("/@fs/"))
	) {
		const s = /^\/@fs\/[a-zA-Z]:\//.test(o);
		o = o.slice(s ? 5 : 4);
	}
	return [o, r[2] || void 0, r[3] || void 0];
}
function eA(e) {
	let t = e.trim();
	if (
		JL.test(t) ||
		(t.includes(" > eval") &&
			(t = t.replaceAll(
				/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g,
				":$1",
			)),
		!(t.includes("@") || t.includes(":")))
	) {
		return;
	}
	const r = /((.*".+"[^@]*)?[^@]*)(@)/,
		o = t.match(r),
		s = o && o[1] ? o[1] : void 0,
		[c, f, d] = pw(t.replace(r, ""));
	return c && f && d
		? {
				file: c,
				method: s || "",
				line: Number.parseInt(f),
				column: Number.parseInt(d),
			}
		: undefined;
}
function tA(e) {
	let t = e.trim();
	if (!hw.test(t)) {
		return ;
	}
	t.includes("(eval ") &&
		(t = t
			.replaceAll("eval code", "eval")
			.replaceAll(/(\(eval at [^()]*)|(,.*$)/g, ""));
	let r = t
		.replace(/^\s+/, "")
		.replaceAll("\\(eval code", "(")
		.replace(/^.*?\s+/, "");
	const o = r.match(/ (\(.+\)$)/);
	r = o ? r.replace(o[0], "") : r;
	const [s, c, f] = pw(o ? o[1] : r);
	let d = (o && r) || "",
		h = s && ["eval", "<anonymous>"].includes(s) ? void 0 : s;
	return h && c && f
		? (d.startsWith("async ") && (d = d.slice(6)),
			h.startsWith("file://") && (h = h.slice(7)),
			(h = YL(h)),
			d && (d = d.replaceAll(/__vite_ssr_import_\d+__\./g, "")),
			{
				method: d,
				file: h,
				line: Number.parseInt(c),
				column: Number.parseInt(f),
			})
		: undefined;
}
function nA(e, t = {}) {
	const { ignoreStackEntries: r = QL } = t;
	let o = hw.test(e) ? iA(e) : rA(e);
	return (
		r.length && (o = o.filter((s) => !r.some((c) => s.file.match(c)))),
		o.map((s) => {
			let c;
			t.getFileName && (s.file = t.getFileName(s.file));
			const f = (c = t.getSourceMap) == undefined ? void 0 : c.call(t, s.file);
			if (!f || typeof f !== "object" || !f.version) {
				return s;
			}
			const d = new BL(f),
				{ line: h, column: p } = UL(d, s);
			return h != undefined && p != undefined
				? { ...s, line: h, column: p }
				: s;
		})
	);
}
function rA(e) {
	return e
		.split(`
`)
		.map((t) => eA(t))
		.filter($b);
}
function iA(e) {
	return e
		.split(`
`)
		.map((t) => tA(t))
		.filter($b);
}
const Oo =
	typeof globalThis < "u"
		? globalThis
		: typeof window < "u"
			? window
			: typeof global < "u"
				? global
				: typeof self < "u"
					? self
					: {};
function gw(e) {
	return e && e.__esModule && Object.hasOwn(e, "default") ? e.default : e;
}
const vw = {},
	pi = {};
const oA = "Á",
	sA = "á",
	lA = "Ă",
	aA = "ă",
	cA = "∾",
	uA = "∿",
	fA = "∾̳",
	dA = "Â",
	hA = "â",
	pA = "´",
	gA = "А",
	vA = "а",
	mA = "Æ",
	yA = "æ",
	bA = "⁡",
	wA = "𝔄",
	xA = "𝔞",
	SA = "À",
	_A = "à",
	kA = "ℵ",
	TA = "ℵ",
	CA = "Α",
	EA = "α",
	LA = "Ā",
	AA = "ā",
	MA = "⨿",
	NA = "&",
	$A = "&",
	PA = "⩕",
	OA = "⩓",
	RA = "∧",
	DA = "⩜",
	zA = "⩘",
	IA = "⩚",
	FA = "∠",
	HA = "⦤",
	qA = "∠",
	BA = "⦨",
	WA = "⦩",
	UA = "⦪",
	VA = "⦫",
	jA = "⦬",
	GA = "⦭",
	KA = "⦮",
	XA = "⦯",
	YA = "∡",
	ZA = "∟",
	JA = "⊾",
	QA = "⦝",
	eM = "∢",
	tM = "Å",
	nM = "⍼",
	rM = "Ą",
	iM = "ą",
	oM = "𝔸",
	sM = "𝕒",
	lM = "⩯",
	aM = "≈",
	cM = "⩰",
	uM = "≊",
	fM = "≋",
	dM = "'",
	hM = "⁡",
	pM = "≈",
	gM = "≊",
	vM = "Å",
	mM = "å",
	yM = "𝒜",
	bM = "𝒶",
	wM = "≔",
	xM = "*",
	SM = "≈",
	_M = "≍",
	kM = "Ã",
	TM = "ã",
	CM = "Ä",
	EM = "ä",
	LM = "∳",
	AM = "⨑",
	MM = "≌",
	NM = "϶",
	$M = "‵",
	PM = "∽",
	OM = "⋍",
	RM = "∖",
	DM = "⫧",
	zM = "⊽",
	IM = "⌅",
	FM = "⌆",
	HM = "⌅",
	qM = "⎵",
	BM = "⎶",
	WM = "≌",
	UM = "Б",
	VM = "б",
	jM = "„",
	GM = "∵",
	KM = "∵",
	XM = "∵",
	YM = "⦰",
	ZM = "϶",
	JM = "ℬ",
	QM = "ℬ",
	eN = "Β",
	tN = "β",
	nN = "ℶ",
	rN = "≬",
	iN = "𝔅",
	oN = "𝔟",
	sN = "⋂",
	lN = "◯",
	aN = "⋃",
	cN = "⨀",
	uN = "⨁",
	fN = "⨂",
	dN = "⨆",
	hN = "★",
	pN = "▽",
	gN = "△",
	vN = "⨄",
	mN = "⋁",
	yN = "⋀",
	bN = "⤍",
	wN = "⧫",
	xN = "▪",
	SN = "▴",
	_N = "▾",
	kN = "◂",
	TN = "▸",
	CN = "␣",
	EN = "▒",
	LN = "░",
	AN = "▓",
	MN = "█",
	NN = "=⃥",
	$N = "≡⃥",
	PN = "⫭",
	ON = "⌐",
	RN = "𝔹",
	DN = "𝕓",
	zN = "⊥",
	IN = "⊥",
	FN = "⋈",
	HN = "⧉",
	qN = "┐",
	BN = "╕",
	WN = "╖",
	UN = "╗",
	VN = "┌",
	jN = "╒",
	GN = "╓",
	KN = "╔",
	XN = "─",
	YN = "═",
	ZN = "┬",
	JN = "╤",
	QN = "╥",
	e$ = "╦",
	t$ = "┴",
	n$ = "╧",
	r$ = "╨",
	i$ = "╩",
	o$ = "⊟",
	s$ = "⊞",
	l$ = "⊠",
	a$ = "┘",
	c$ = "╛",
	u$ = "╜",
	f$ = "╝",
	d$ = "└",
	h$ = "╘",
	p$ = "╙",
	g$ = "╚",
	v$ = "│",
	m$ = "║",
	y$ = "┼",
	b$ = "╪",
	w$ = "╫",
	x$ = "╬",
	S$ = "┤",
	_$ = "╡",
	k$ = "╢",
	T$ = "╣",
	C$ = "├",
	E$ = "╞",
	L$ = "╟",
	A$ = "╠",
	M$ = "‵",
	N$ = "˘",
	$$ = "˘",
	P$ = "¦",
	O$ = "𝒷",
	R$ = "ℬ",
	D$ = "⁏",
	z$ = "∽",
	I$ = "⋍",
	F$ = "⧅",
	H$ = "\\",
	q$ = "⟈",
	B$ = "•",
	W$ = "•",
	U$ = "≎",
	V$ = "⪮",
	j$ = "≏",
	G$ = "≎",
	K$ = "≏",
	X$ = "Ć",
	Y$ = "ć",
	Z$ = "⩄",
	J$ = "⩉",
	Q$ = "⩋",
	eP = "∩",
	tP = "⋒",
	nP = "⩇",
	rP = "⩀",
	iP = "ⅅ",
	oP = "∩︀",
	sP = "⁁",
	lP = "ˇ",
	aP = "ℭ",
	cP = "⩍",
	uP = "Č",
	fP = "č",
	dP = "Ç",
	hP = "ç",
	pP = "Ĉ",
	gP = "ĉ",
	vP = "∰",
	mP = "⩌",
	yP = "⩐",
	bP = "Ċ",
	wP = "ċ",
	xP = "¸",
	SP = "¸",
	_P = "⦲",
	kP = "¢",
	TP = "·",
	CP = "·",
	EP = "𝔠",
	LP = "ℭ",
	AP = "Ч",
	MP = "ч",
	NP = "✓",
	$P = "✓",
	PP = "Χ",
	OP = "χ",
	RP = "ˆ",
	DP = "≗",
	zP = "↺",
	IP = "↻",
	FP = "⊛",
	HP = "⊚",
	qP = "⊝",
	BP = "⊙",
	WP = "®",
	UP = "Ⓢ",
	VP = "⊖",
	jP = "⊕",
	GP = "⊗",
	KP = "○",
	XP = "⧃",
	YP = "≗",
	ZP = "⨐",
	JP = "⫯",
	QP = "⧂",
	eO = "∲",
	tO = "”",
	nO = "’",
	rO = "♣",
	iO = "♣",
	oO = ":",
	sO = "∷",
	lO = "⩴",
	aO = "≔",
	cO = "≔",
	uO = ",",
	fO = "@",
	dO = "∁",
	hO = "∘",
	pO = "∁",
	gO = "ℂ",
	vO = "≅",
	mO = "⩭",
	yO = "≡",
	bO = "∮",
	wO = "∯",
	xO = "∮",
	SO = "𝕔",
	_O = "ℂ",
	kO = "∐",
	TO = "∐",
	CO = "©",
	EO = "©",
	LO = "℗",
	AO = "∳",
	MO = "↵",
	NO = "✗",
	$O = "⨯",
	PO = "𝒞",
	OO = "𝒸",
	RO = "⫏",
	DO = "⫑",
	zO = "⫐",
	IO = "⫒",
	FO = "⋯",
	HO = "⤸",
	qO = "⤵",
	BO = "⋞",
	WO = "⋟",
	UO = "↶",
	VO = "⤽",
	jO = "⩈",
	GO = "⩆",
	KO = "≍",
	XO = "∪",
	YO = "⋓",
	ZO = "⩊",
	JO = "⊍",
	QO = "⩅",
	eR = "∪︀",
	tR = "↷",
	nR = "⤼",
	rR = "⋞",
	iR = "⋟",
	oR = "⋎",
	sR = "⋏",
	lR = "¤",
	aR = "↶",
	cR = "↷",
	uR = "⋎",
	fR = "⋏",
	dR = "∲",
	hR = "∱",
	pR = "⌭",
	gR = "†",
	vR = "‡",
	mR = "ℸ",
	yR = "↓",
	bR = "↡",
	wR = "⇓",
	xR = "‐",
	SR = "⫤",
	_R = "⊣",
	kR = "⤏",
	TR = "˝",
	CR = "Ď",
	ER = "ď",
	LR = "Д",
	AR = "д",
	MR = "‡",
	NR = "⇊",
	$R = "ⅅ",
	PR = "ⅆ",
	OR = "⤑",
	RR = "⩷",
	DR = "°",
	zR = "∇",
	IR = "Δ",
	FR = "δ",
	HR = "⦱",
	qR = "⥿",
	BR = "𝔇",
	WR = "𝔡",
	UR = "⥥",
	VR = "⇃",
	jR = "⇂",
	GR = "´",
	KR = "˙",
	XR = "˝",
	YR = "`",
	ZR = "˜",
	JR = "⋄",
	QR = "⋄",
	eD = "⋄",
	tD = "♦",
	nD = "♦",
	rD = "¨",
	iD = "ⅆ",
	oD = "ϝ",
	sD = "⋲",
	lD = "÷",
	aD = "÷",
	cD = "⋇",
	uD = "⋇",
	fD = "Ђ",
	dD = "ђ",
	hD = "⌞",
	pD = "⌍",
	gD = "$",
	vD = "𝔻",
	mD = "𝕕",
	yD = "¨",
	bD = "˙",
	wD = "⃜",
	xD = "≐",
	SD = "≑",
	_D = "≐",
	kD = "∸",
	TD = "∔",
	CD = "⊡",
	ED = "⌆",
	LD = "∯",
	AD = "¨",
	MD = "⇓",
	ND = "⇐",
	$D = "⇔",
	PD = "⫤",
	OD = "⟸",
	RD = "⟺",
	DD = "⟹",
	zD = "⇒",
	ID = "⊨",
	FD = "⇑",
	HD = "⇕",
	qD = "∥",
	BD = "⤓",
	WD = "↓",
	UD = "↓",
	VD = "⇓",
	jD = "⇵",
	GD = "̑",
	KD = "⇊",
	XD = "⇃",
	YD = "⇂",
	ZD = "⥐",
	JD = "⥞",
	QD = "⥖",
	ez = "↽",
	tz = "⥟",
	nz = "⥗",
	rz = "⇁",
	iz = "↧",
	oz = "⊤",
	sz = "⤐",
	lz = "⌟",
	az = "⌌",
	cz = "𝒟",
	uz = "𝒹",
	fz = "Ѕ",
	dz = "ѕ",
	hz = "⧶",
	pz = "Đ",
	gz = "đ",
	vz = "⋱",
	mz = "▿",
	yz = "▾",
	bz = "⇵",
	wz = "⥯",
	xz = "⦦",
	Sz = "Џ",
	_z = "џ",
	kz = "⟿",
	Tz = "É",
	Cz = "é",
	Ez = "⩮",
	Lz = "Ě",
	Az = "ě",
	Mz = "Ê",
	Nz = "ê",
	$z = "≖",
	Pz = "≕",
	Oz = "Э",
	Rz = "э",
	Dz = "⩷",
	zz = "Ė",
	Iz = "ė",
	Fz = "≑",
	Hz = "ⅇ",
	qz = "≒",
	Bz = "𝔈",
	Wz = "𝔢",
	Uz = "⪚",
	Vz = "È",
	jz = "è",
	Gz = "⪖",
	Kz = "⪘",
	Xz = "⪙",
	Yz = "∈",
	Zz = "⏧",
	Jz = "ℓ",
	Qz = "⪕",
	e2 = "⪗",
	t2 = "Ē",
	n2 = "ē",
	r2 = "∅",
	i2 = "∅",
	o2 = "◻",
	s2 = "∅",
	l2 = "▫",
	a2 = " ",
	c2 = " ",
	u2 = " ",
	f2 = "Ŋ",
	d2 = "ŋ",
	h2 = " ",
	p2 = "Ę",
	g2 = "ę",
	v2 = "𝔼",
	m2 = "𝕖",
	y2 = "⋕",
	b2 = "⧣",
	w2 = "⩱",
	x2 = "ε",
	S2 = "Ε",
	_2 = "ε",
	k2 = "ϵ",
	T2 = "≖",
	C2 = "≕",
	E2 = "≂",
	L2 = "⪖",
	A2 = "⪕",
	M2 = "⩵",
	N2 = "=",
	$2 = "≂",
	P2 = "≟",
	O2 = "⇌",
	R2 = "≡",
	D2 = "⩸",
	z2 = "⧥",
	I2 = "⥱",
	F2 = "≓",
	H2 = "ℯ",
	q2 = "ℰ",
	B2 = "≐",
	W2 = "⩳",
	U2 = "≂",
	V2 = "Η",
	j2 = "η",
	G2 = "Ð",
	K2 = "ð",
	X2 = "Ë",
	Y2 = "ë",
	Z2 = "€",
	J2 = "!",
	Q2 = "∃",
	eI = "∃",
	tI = "ℰ",
	nI = "ⅇ",
	rI = "ⅇ",
	iI = "≒",
	oI = "Ф",
	sI = "ф",
	lI = "♀",
	aI = "ﬃ",
	cI = "ﬀ",
	uI = "ﬄ",
	fI = "𝔉",
	dI = "𝔣",
	hI = "ﬁ",
	pI = "◼",
	gI = "▪",
	vI = "fj",
	mI = "♭",
	yI = "ﬂ",
	bI = "▱",
	wI = "ƒ",
	xI = "𝔽",
	SI = "𝕗",
	_I = "∀",
	kI = "∀",
	TI = "⋔",
	CI = "⫙",
	EI = "ℱ",
	LI = "⨍",
	AI = "½",
	MI = "⅓",
	NI = "¼",
	$I = "⅕",
	PI = "⅙",
	OI = "⅛",
	RI = "⅔",
	DI = "⅖",
	zI = "¾",
	II = "⅗",
	FI = "⅜",
	HI = "⅘",
	qI = "⅚",
	BI = "⅝",
	WI = "⅞",
	UI = "⁄",
	VI = "⌢",
	jI = "𝒻",
	GI = "ℱ",
	KI = "ǵ",
	XI = "Γ",
	YI = "γ",
	ZI = "Ϝ",
	JI = "ϝ",
	QI = "⪆",
	eF = "Ğ",
	tF = "ğ",
	nF = "Ģ",
	rF = "Ĝ",
	iF = "ĝ",
	oF = "Г",
	sF = "г",
	lF = "Ġ",
	aF = "ġ",
	cF = "≥",
	uF = "≧",
	fF = "⪌",
	dF = "⋛",
	hF = "≥",
	pF = "≧",
	gF = "⩾",
	vF = "⪩",
	mF = "⩾",
	yF = "⪀",
	bF = "⪂",
	wF = "⪄",
	xF = "⋛︀",
	SF = "⪔",
	_F = "𝔊",
	kF = "𝔤",
	TF = "≫",
	CF = "⋙",
	EF = "⋙",
	LF = "ℷ",
	AF = "Ѓ",
	MF = "ѓ",
	NF = "⪥",
	$F = "≷",
	PF = "⪒",
	OF = "⪤",
	RF = "⪊",
	DF = "⪊",
	zF = "⪈",
	IF = "≩",
	FF = "⪈",
	HF = "≩",
	qF = "⋧",
	BF = "𝔾",
	WF = "𝕘",
	UF = "`",
	VF = "≥",
	jF = "⋛",
	GF = "≧",
	KF = "⪢",
	XF = "≷",
	YF = "⩾",
	ZF = "≳",
	JF = "𝒢",
	QF = "ℊ",
	eH = "≳",
	tH = "⪎",
	nH = "⪐",
	rH = "⪧",
	iH = "⩺",
	oH = ">",
	sH = ">",
	lH = "≫",
	aH = "⋗",
	cH = "⦕",
	uH = "⩼",
	fH = "⪆",
	dH = "⥸",
	hH = "⋗",
	pH = "⋛",
	gH = "⪌",
	vH = "≷",
	mH = "≳",
	yH = "≩︀",
	bH = "≩︀",
	wH = "ˇ",
	xH = " ",
	SH = "½",
	_H = "ℋ",
	kH = "Ъ",
	TH = "ъ",
	CH = "⥈",
	EH = "↔",
	LH = "⇔",
	AH = "↭",
	MH = "^",
	NH = "ℏ",
	$H = "Ĥ",
	PH = "ĥ",
	OH = "♥",
	RH = "♥",
	DH = "…",
	zH = "⊹",
	IH = "𝔥",
	FH = "ℌ",
	HH = "ℋ",
	qH = "⤥",
	BH = "⤦",
	WH = "⇿",
	UH = "∻",
	VH = "↩",
	jH = "↪",
	GH = "𝕙",
	KH = "ℍ",
	XH = "―",
	YH = "─",
	ZH = "𝒽",
	JH = "ℋ",
	QH = "ℏ",
	eq = "Ħ",
	tq = "ħ",
	nq = "≎",
	rq = "≏",
	iq = "⁃",
	oq = "‐",
	sq = "Í",
	lq = "í",
	aq = "⁣",
	cq = "Î",
	uq = "î",
	fq = "И",
	dq = "и",
	hq = "İ",
	pq = "Е",
	gq = "е",
	vq = "¡",
	mq = "⇔",
	yq = "𝔦",
	bq = "ℑ",
	wq = "Ì",
	xq = "ì",
	Sq = "ⅈ",
	_q = "⨌",
	kq = "∭",
	Tq = "⧜",
	Cq = "℩",
	Eq = "Ĳ",
	Lq = "ĳ",
	Aq = "Ī",
	Mq = "ī",
	Nq = "ℑ",
	$q = "ⅈ",
	Pq = "ℐ",
	Oq = "ℑ",
	Rq = "ı",
	Dq = "ℑ",
	zq = "⊷",
	Iq = "Ƶ",
	Fq = "⇒",
	Hq = "℅",
	qq = "∞",
	Bq = "⧝",
	Wq = "ı",
	Uq = "⊺",
	Vq = "∫",
	jq = "∬",
	Gq = "ℤ",
	Kq = "∫",
	Xq = "⊺",
	Yq = "⋂",
	Zq = "⨗",
	Jq = "⨼",
	Qq = "⁣",
	eB = "⁢",
	tB = "Ё",
	nB = "ё",
	rB = "Į",
	iB = "į",
	oB = "𝕀",
	sB = "𝕚",
	lB = "Ι",
	aB = "ι",
	cB = "⨼",
	uB = "¿",
	fB = "𝒾",
	dB = "ℐ",
	hB = "∈",
	pB = "⋵",
	gB = "⋹",
	vB = "⋴",
	mB = "⋳",
	yB = "∈",
	bB = "⁢",
	wB = "Ĩ",
	xB = "ĩ",
	SB = "І",
	_B = "і",
	kB = "Ï",
	TB = "ï",
	CB = "Ĵ",
	EB = "ĵ",
	LB = "Й",
	AB = "й",
	MB = "𝔍",
	NB = "𝔧",
	$B = "ȷ",
	PB = "𝕁",
	OB = "𝕛",
	RB = "𝒥",
	DB = "𝒿",
	zB = "Ј",
	IB = "ј",
	FB = "Є",
	HB = "є",
	qB = "Κ",
	BB = "κ",
	WB = "ϰ",
	UB = "Ķ",
	VB = "ķ",
	jB = "К",
	GB = "к",
	KB = "𝔎",
	XB = "𝔨",
	YB = "ĸ",
	ZB = "Х",
	JB = "х",
	QB = "Ќ",
	e3 = "ќ",
	t3 = "𝕂",
	n3 = "𝕜",
	r3 = "𝒦",
	i3 = "𝓀",
	o3 = "⇚",
	s3 = "Ĺ",
	l3 = "ĺ",
	a3 = "⦴",
	c3 = "ℒ",
	u3 = "Λ",
	f3 = "λ",
	d3 = "⟨",
	h3 = "⟪",
	p3 = "⦑",
	g3 = "⟨",
	v3 = "⪅",
	m3 = "ℒ",
	y3 = "«",
	b3 = "⇤",
	w3 = "⤟",
	x3 = "←",
	S3 = "↞",
	_3 = "⇐",
	k3 = "⤝",
	T3 = "↩",
	C3 = "↫",
	E3 = "⤹",
	L3 = "⥳",
	A3 = "↢",
	M3 = "⤙",
	N3 = "⤛",
	$3 = "⪫",
	P3 = "⪭",
	O3 = "⪭︀",
	R3 = "⤌",
	D3 = "⤎",
	z3 = "❲",
	I3 = "{",
	F3 = "[",
	H3 = "⦋",
	q3 = "⦏",
	B3 = "⦍",
	W3 = "Ľ",
	U3 = "ľ",
	V3 = "Ļ",
	j3 = "ļ",
	G3 = "⌈",
	K3 = "{",
	X3 = "Л",
	Y3 = "л",
	Z3 = "⤶",
	J3 = "“",
	Q3 = "„",
	e5 = "⥧",
	t5 = "⥋",
	n5 = "↲",
	r5 = "≤",
	i5 = "≦",
	o5 = "⟨",
	s5 = "⇤",
	l5 = "←",
	a5 = "←",
	c5 = "⇐",
	u5 = "⇆",
	f5 = "↢",
	d5 = "⌈",
	h5 = "⟦",
	p5 = "⥡",
	g5 = "⥙",
	v5 = "⇃",
	m5 = "⌊",
	y5 = "↽",
	b5 = "↼",
	w5 = "⇇",
	x5 = "↔",
	S5 = "↔",
	_5 = "⇔",
	k5 = "⇆",
	T5 = "⇋",
	C5 = "↭",
	E5 = "⥎",
	L5 = "↤",
	A5 = "⊣",
	M5 = "⥚",
	N5 = "⋋",
	$5 = "⧏",
	P5 = "⊲",
	O5 = "⊴",
	R5 = "⥑",
	D5 = "⥠",
	z5 = "⥘",
	I5 = "↿",
	F5 = "⥒",
	H5 = "↼",
	q5 = "⪋",
	B5 = "⋚",
	W5 = "≤",
	U5 = "≦",
	V5 = "⩽",
	j5 = "⪨",
	G5 = "⩽",
	K5 = "⩿",
	X5 = "⪁",
	Y5 = "⪃",
	Z5 = "⋚︀",
	J5 = "⪓",
	Q5 = "⪅",
	e8 = "⋖",
	t8 = "⋚",
	n8 = "⪋",
	r8 = "⋚",
	i8 = "≦",
	o8 = "≶",
	s8 = "≶",
	l8 = "⪡",
	a8 = "≲",
	c8 = "⩽",
	u8 = "≲",
	f8 = "⥼",
	d8 = "⌊",
	h8 = "𝔏",
	p8 = "𝔩",
	g8 = "≶",
	v8 = "⪑",
	m8 = "⥢",
	y8 = "↽",
	b8 = "↼",
	w8 = "⥪",
	x8 = "▄",
	S8 = "Љ",
	_8 = "љ",
	k8 = "⇇",
	T8 = "≪",
	C8 = "⋘",
	E8 = "⌞",
	L8 = "⇚",
	A8 = "⥫",
	M8 = "◺",
	N8 = "Ŀ",
	$8 = "ŀ",
	P8 = "⎰",
	O8 = "⎰",
	R8 = "⪉",
	D8 = "⪉",
	z8 = "⪇",
	I8 = "≨",
	F8 = "⪇",
	H8 = "≨",
	q8 = "⋦",
	B8 = "⟬",
	W8 = "⇽",
	U8 = "⟦",
	V8 = "⟵",
	j8 = "⟵",
	G8 = "⟸",
	K8 = "⟷",
	X8 = "⟷",
	Y8 = "⟺",
	Z8 = "⟼",
	J8 = "⟶",
	Q8 = "⟶",
	eW = "⟹",
	tW = "↫",
	nW = "↬",
	rW = "⦅",
	iW = "𝕃",
	oW = "𝕝",
	sW = "⨭",
	lW = "⨴",
	aW = "∗",
	cW = "_",
	uW = "↙",
	fW = "↘",
	dW = "◊",
	hW = "◊",
	pW = "⧫",
	gW = "(",
	vW = "⦓",
	mW = "⇆",
	yW = "⌟",
	bW = "⇋",
	wW = "⥭",
	xW = "‎",
	SW = "⊿",
	_W = "‹",
	kW = "𝓁",
	TW = "ℒ",
	CW = "↰",
	EW = "↰",
	LW = "≲",
	AW = "⪍",
	MW = "⪏",
	NW = "[",
	$W = "‘",
	PW = "‚",
	OW = "Ł",
	RW = "ł",
	DW = "⪦",
	zW = "⩹",
	IW = "<",
	FW = "<",
	HW = "≪",
	qW = "⋖",
	BW = "⋋",
	WW = "⋉",
	UW = "⥶",
	VW = "⩻",
	jW = "◃",
	GW = "⊴",
	KW = "◂",
	XW = "⦖",
	YW = "⥊",
	ZW = "⥦",
	JW = "≨︀",
	QW = "≨︀",
	e4 = "¯",
	t4 = "♂",
	n4 = "✠",
	r4 = "✠",
	i4 = "↦",
	o4 = "↦",
	s4 = "↧",
	l4 = "↤",
	a4 = "↥",
	c4 = "▮",
	u4 = "⨩",
	f4 = "М",
	d4 = "м",
	h4 = "—",
	p4 = "∺",
	g4 = "∡",
	v4 = " ",
	m4 = "ℳ",
	y4 = "𝔐",
	b4 = "𝔪",
	w4 = "℧",
	x4 = "µ",
	S4 = "*",
	_4 = "⫰",
	k4 = "∣",
	T4 = "·",
	C4 = "⊟",
	E4 = "−",
	L4 = "∸",
	A4 = "⨪",
	M4 = "∓",
	N4 = "⫛",
	$4 = "…",
	P4 = "∓",
	O4 = "⊧",
	R4 = "𝕄",
	D4 = "𝕞",
	z4 = "∓",
	I4 = "𝓂",
	F4 = "ℳ",
	H4 = "∾",
	q4 = "Μ",
	B4 = "μ",
	W4 = "⊸",
	U4 = "⊸",
	V4 = "∇",
	j4 = "Ń",
	G4 = "ń",
	K4 = "∠⃒",
	X4 = "≉",
	Y4 = "⩰̸",
	Z4 = "≋̸",
	J4 = "ŉ",
	Q4 = "≉",
	eU = "♮",
	tU = "ℕ",
	nU = "♮",
	rU = " ",
	iU = "≎̸",
	oU = "≏̸",
	sU = "⩃",
	lU = "Ň",
	aU = "ň",
	cU = "Ņ",
	uU = "ņ",
	fU = "≇",
	dU = "⩭̸",
	hU = "⩂",
	pU = "Н",
	gU = "н",
	vU = "–",
	mU = "⤤",
	yU = "↗",
	bU = "⇗",
	wU = "↗",
	xU = "≠",
	SU = "≐̸",
	_U = "​",
	kU = "​",
	TU = "​",
	CU = "​",
	EU = "≢",
	LU = "⤨",
	AU = "≂̸",
	MU = "≫",
	NU = "≪",
	$U = `
`,
	PU = "∄",
	OU = "∄",
	RU = "𝔑",
	DU = "𝔫",
	zU = "≧̸",
	IU = "≱",
	FU = "≱",
	HU = "≧̸",
	qU = "⩾̸",
	BU = "⩾̸",
	WU = "⋙̸",
	UU = "≵",
	VU = "≫⃒",
	jU = "≯",
	GU = "≯",
	KU = "≫̸",
	XU = "↮",
	YU = "⇎",
	ZU = "⫲",
	JU = "∋",
	QU = "⋼",
	e6 = "⋺",
	t6 = "∋",
	n6 = "Њ",
	r6 = "њ",
	i6 = "↚",
	o6 = "⇍",
	s6 = "‥",
	l6 = "≦̸",
	a6 = "≰",
	c6 = "↚",
	u6 = "⇍",
	f6 = "↮",
	d6 = "⇎",
	h6 = "≰",
	p6 = "≦̸",
	g6 = "⩽̸",
	v6 = "⩽̸",
	m6 = "≮",
	y6 = "⋘̸",
	b6 = "≴",
	w6 = "≪⃒",
	x6 = "≮",
	S6 = "⋪",
	_6 = "⋬",
	k6 = "≪̸",
	T6 = "∤",
	C6 = "⁠",
	E6 = " ",
	L6 = "𝕟",
	A6 = "ℕ",
	M6 = "⫬",
	N6 = "¬",
	$6 = "≢",
	P6 = "≭",
	O6 = "∦",
	R6 = "∉",
	D6 = "≠",
	z6 = "≂̸",
	I6 = "∄",
	F6 = "≯",
	H6 = "≱",
	q6 = "≧̸",
	B6 = "≫̸",
	W6 = "≹",
	U6 = "⩾̸",
	V6 = "≵",
	j6 = "≎̸",
	G6 = "≏̸",
	K6 = "∉",
	X6 = "⋵̸",
	Y6 = "⋹̸",
	Z6 = "∉",
	J6 = "⋷",
	Q6 = "⋶",
	eV = "⧏̸",
	tV = "⋪",
	nV = "⋬",
	rV = "≮",
	iV = "≰",
	oV = "≸",
	sV = "≪̸",
	lV = "⩽̸",
	aV = "≴",
	cV = "⪢̸",
	uV = "⪡̸",
	fV = "∌",
	dV = "∌",
	hV = "⋾",
	pV = "⋽",
	gV = "⊀",
	vV = "⪯̸",
	mV = "⋠",
	yV = "∌",
	bV = "⧐̸",
	wV = "⋫",
	xV = "⋭",
	SV = "⊏̸",
	_V = "⋢",
	kV = "⊐̸",
	TV = "⋣",
	CV = "⊂⃒",
	EV = "⊈",
	LV = "⊁",
	AV = "⪰̸",
	MV = "⋡",
	NV = "≿̸",
	$V = "⊃⃒",
	PV = "⊉",
	OV = "≁",
	RV = "≄",
	DV = "≇",
	zV = "≉",
	IV = "∤",
	FV = "∦",
	HV = "∦",
	qV = "⫽⃥",
	BV = "∂̸",
	WV = "⨔",
	UV = "⊀",
	VV = "⋠",
	jV = "⊀",
	GV = "⪯̸",
	KV = "⪯̸",
	XV = "⤳̸",
	YV = "↛",
	ZV = "⇏",
	JV = "↝̸",
	QV = "↛",
	ej = "⇏",
	tj = "⋫",
	nj = "⋭",
	rj = "⊁",
	ij = "⋡",
	oj = "⪰̸",
	sj = "𝒩",
	lj = "𝓃",
	aj = "∤",
	cj = "∦",
	uj = "≁",
	fj = "≄",
	dj = "≄",
	hj = "∤",
	pj = "∦",
	gj = "⋢",
	vj = "⋣",
	mj = "⊄",
	yj = "⫅̸",
	bj = "⊈",
	wj = "⊂⃒",
	xj = "⊈",
	Sj = "⫅̸",
	_j = "⊁",
	kj = "⪰̸",
	Tj = "⊅",
	Cj = "⫆̸",
	Ej = "⊉",
	Lj = "⊃⃒",
	Aj = "⊉",
	Mj = "⫆̸",
	Nj = "≹",
	$j = "Ñ",
	Pj = "ñ",
	Oj = "≸",
	Rj = "⋪",
	Dj = "⋬",
	zj = "⋫",
	Ij = "⋭",
	Fj = "Ν",
	Hj = "ν",
	qj = "#",
	Bj = "№",
	Wj = " ",
	Uj = "≍⃒",
	Vj = "⊬",
	jj = "⊭",
	Gj = "⊮",
	Kj = "⊯",
	Xj = "≥⃒",
	Yj = ">⃒",
	Zj = "⤄",
	Jj = "⧞",
	Qj = "⤂",
	eG = "≤⃒",
	tG = "<⃒",
	nG = "⊴⃒",
	rG = "⤃",
	iG = "⊵⃒",
	oG = "∼⃒",
	sG = "⤣",
	lG = "↖",
	aG = "⇖",
	cG = "↖",
	uG = "⤧",
	fG = "Ó",
	dG = "ó",
	hG = "⊛",
	pG = "Ô",
	gG = "ô",
	vG = "⊚",
	mG = "О",
	yG = "о",
	bG = "⊝",
	wG = "Ő",
	xG = "ő",
	SG = "⨸",
	_G = "⊙",
	kG = "⦼",
	TG = "Œ",
	CG = "œ",
	EG = "⦿",
	LG = "𝔒",
	AG = "𝔬",
	MG = "˛",
	NG = "Ò",
	$G = "ò",
	PG = "⧁",
	OG = "⦵",
	RG = "Ω",
	DG = "∮",
	zG = "↺",
	IG = "⦾",
	FG = "⦻",
	HG = "‾",
	qG = "⧀",
	BG = "Ō",
	WG = "ō",
	UG = "Ω",
	VG = "ω",
	jG = "Ο",
	GG = "ο",
	KG = "⦶",
	XG = "⊖",
	YG = "𝕆",
	ZG = "𝕠",
	JG = "⦷",
	QG = "“",
	e9 = "‘",
	t9 = "⦹",
	n9 = "⊕",
	r9 = "↻",
	i9 = "⩔",
	o9 = "∨",
	s9 = "⩝",
	l9 = "ℴ",
	a9 = "ℴ",
	c9 = "ª",
	u9 = "º",
	f9 = "⊶",
	d9 = "⩖",
	h9 = "⩗",
	p9 = "⩛",
	g9 = "Ⓢ",
	v9 = "𝒪",
	m9 = "ℴ",
	y9 = "Ø",
	b9 = "ø",
	w9 = "⊘",
	x9 = "Õ",
	S9 = "õ",
	_9 = "⨶",
	k9 = "⨷",
	T9 = "⊗",
	C9 = "Ö",
	E9 = "ö",
	L9 = "⌽",
	A9 = "‾",
	M9 = "⏞",
	N9 = "⎴",
	$9 = "⏜",
	P9 = "¶",
	O9 = "∥",
	R9 = "∥",
	D9 = "⫳",
	z9 = "⫽",
	I9 = "∂",
	F9 = "∂",
	H9 = "П",
	q9 = "п",
	B9 = "%",
	W9 = ".",
	U9 = "‰",
	V9 = "⊥",
	j9 = "‱",
	G9 = "𝔓",
	K9 = "𝔭",
	X9 = "Φ",
	Y9 = "φ",
	Z9 = "ϕ",
	J9 = "ℳ",
	Q9 = "☎",
	e7 = "Π",
	t7 = "π",
	n7 = "⋔",
	r7 = "ϖ",
	i7 = "ℏ",
	o7 = "ℎ",
	s7 = "ℏ",
	l7 = "⨣",
	a7 = "⊞",
	c7 = "⨢",
	u7 = "+",
	f7 = "∔",
	d7 = "⨥",
	h7 = "⩲",
	p7 = "±",
	g7 = "±",
	v7 = "⨦",
	m7 = "⨧",
	y7 = "±",
	b7 = "ℌ",
	w7 = "⨕",
	x7 = "𝕡",
	S7 = "ℙ",
	_7 = "£",
	k7 = "⪷",
	T7 = "⪻",
	C7 = "≺",
	E7 = "≼",
	L7 = "⪷",
	A7 = "≺",
	M7 = "≼",
	N7 = "≺",
	$7 = "⪯",
	P7 = "≼",
	O7 = "≾",
	R7 = "⪯",
	D7 = "⪹",
	z7 = "⪵",
	I7 = "⋨",
	F7 = "⪯",
	H7 = "⪳",
	q7 = "≾",
	B7 = "′",
	W7 = "″",
	U7 = "ℙ",
	V7 = "⪹",
	j7 = "⪵",
	G7 = "⋨",
	K7 = "∏",
	X7 = "∏",
	Y7 = "⌮",
	Z7 = "⌒",
	J7 = "⌓",
	Q7 = "∝",
	eK = "∝",
	tK = "∷",
	nK = "∝",
	rK = "≾",
	iK = "⊰",
	oK = "𝒫",
	sK = "𝓅",
	lK = "Ψ",
	aK = "ψ",
	cK = " ",
	uK = "𝔔",
	fK = "𝔮",
	dK = "⨌",
	hK = "𝕢",
	pK = "ℚ",
	gK = "⁗",
	vK = "𝒬",
	mK = "𝓆",
	yK = "ℍ",
	bK = "⨖",
	wK = "?",
	xK = "≟",
	SK = '"',
	_K = '"',
	kK = "⇛",
	TK = "∽̱",
	CK = "Ŕ",
	EK = "ŕ",
	LK = "√",
	AK = "⦳",
	MK = "⟩",
	NK = "⟫",
	$K = "⦒",
	PK = "⦥",
	OK = "⟩",
	RK = "»",
	DK = "⥵",
	zK = "⇥",
	IK = "⤠",
	FK = "⤳",
	HK = "→",
	qK = "↠",
	BK = "⇒",
	WK = "⤞",
	UK = "↪",
	VK = "↬",
	jK = "⥅",
	GK = "⥴",
	KK = "⤖",
	XK = "↣",
	YK = "↝",
	ZK = "⤚",
	JK = "⤜",
	QK = "∶",
	eX = "ℚ",
	tX = "⤍",
	nX = "⤏",
	rX = "⤐",
	iX = "❳",
	oX = "}",
	sX = "]",
	lX = "⦌",
	aX = "⦎",
	cX = "⦐",
	uX = "Ř",
	fX = "ř",
	dX = "Ŗ",
	hX = "ŗ",
	pX = "⌉",
	gX = "}",
	vX = "Р",
	mX = "р",
	yX = "⤷",
	bX = "⥩",
	wX = "”",
	xX = "”",
	SX = "↳",
	_X = "ℜ",
	kX = "ℛ",
	TX = "ℜ",
	CX = "ℝ",
	EX = "ℜ",
	LX = "▭",
	AX = "®",
	MX = "®",
	NX = "∋",
	$X = "⇋",
	PX = "⥯",
	OX = "⥽",
	RX = "⌋",
	DX = "𝔯",
	zX = "ℜ",
	IX = "⥤",
	FX = "⇁",
	HX = "⇀",
	qX = "⥬",
	BX = "Ρ",
	WX = "ρ",
	UX = "ϱ",
	VX = "⟩",
	jX = "⇥",
	GX = "→",
	KX = "→",
	XX = "⇒",
	YX = "⇄",
	ZX = "↣",
	JX = "⌉",
	QX = "⟧",
	eY = "⥝",
	tY = "⥕",
	nY = "⇂",
	rY = "⌋",
	iY = "⇁",
	oY = "⇀",
	sY = "⇄",
	lY = "⇌",
	aY = "⇉",
	cY = "↝",
	uY = "↦",
	fY = "⊢",
	dY = "⥛",
	hY = "⋌",
	pY = "⧐",
	gY = "⊳",
	vY = "⊵",
	mY = "⥏",
	yY = "⥜",
	bY = "⥔",
	wY = "↾",
	xY = "⥓",
	SY = "⇀",
	_Y = "˚",
	kY = "≓",
	TY = "⇄",
	CY = "⇌",
	EY = "‏",
	LY = "⎱",
	AY = "⎱",
	MY = "⫮",
	NY = "⟭",
	$Y = "⇾",
	PY = "⟧",
	OY = "⦆",
	RY = "𝕣",
	DY = "ℝ",
	zY = "⨮",
	IY = "⨵",
	FY = "⥰",
	HY = ")",
	qY = "⦔",
	BY = "⨒",
	WY = "⇉",
	UY = "⇛",
	VY = "›",
	jY = "𝓇",
	GY = "ℛ",
	KY = "↱",
	XY = "↱",
	YY = "]",
	ZY = "’",
	JY = "’",
	QY = "⋌",
	eZ = "⋊",
	tZ = "▹",
	nZ = "⊵",
	rZ = "▸",
	iZ = "⧎",
	oZ = "⧴",
	sZ = "⥨",
	lZ = "℞",
	aZ = "Ś",
	cZ = "ś",
	uZ = "‚",
	fZ = "⪸",
	dZ = "Š",
	hZ = "š",
	pZ = "⪼",
	gZ = "≻",
	vZ = "≽",
	mZ = "⪰",
	yZ = "⪴",
	bZ = "Ş",
	wZ = "ş",
	xZ = "Ŝ",
	SZ = "ŝ",
	_Z = "⪺",
	kZ = "⪶",
	TZ = "⋩",
	CZ = "⨓",
	EZ = "≿",
	LZ = "С",
	AZ = "с",
	MZ = "⊡",
	NZ = "⋅",
	$Z = "⩦",
	PZ = "⤥",
	OZ = "↘",
	RZ = "⇘",
	DZ = "↘",
	zZ = "§",
	IZ = ";",
	FZ = "⤩",
	HZ = "∖",
	qZ = "∖",
	BZ = "✶",
	WZ = "𝔖",
	UZ = "𝔰",
	VZ = "⌢",
	jZ = "♯",
	GZ = "Щ",
	KZ = "щ",
	XZ = "Ш",
	YZ = "ш",
	ZZ = "↓",
	JZ = "←",
	QZ = "∣",
	eJ = "∥",
	tJ = "→",
	nJ = "↑",
	rJ = "­",
	iJ = "Σ",
	oJ = "σ",
	sJ = "ς",
	lJ = "ς",
	aJ = "∼",
	cJ = "⩪",
	uJ = "≃",
	fJ = "≃",
	dJ = "⪞",
	hJ = "⪠",
	pJ = "⪝",
	gJ = "⪟",
	vJ = "≆",
	mJ = "⨤",
	yJ = "⥲",
	bJ = "←",
	wJ = "∘",
	xJ = "∖",
	SJ = "⨳",
	_J = "⧤",
	kJ = "∣",
	TJ = "⌣",
	CJ = "⪪",
	EJ = "⪬",
	LJ = "⪬︀",
	AJ = "Ь",
	MJ = "ь",
	NJ = "⌿",
	$J = "⧄",
	PJ = "/",
	OJ = "𝕊",
	RJ = "𝕤",
	DJ = "♠",
	zJ = "♠",
	IJ = "∥",
	FJ = "⊓",
	HJ = "⊓︀",
	qJ = "⊔",
	BJ = "⊔︀",
	WJ = "√",
	UJ = "⊏",
	VJ = "⊑",
	jJ = "⊏",
	GJ = "⊑",
	KJ = "⊐",
	XJ = "⊒",
	YJ = "⊐",
	ZJ = "⊒",
	JJ = "□",
	QJ = "□",
	eQ = "⊓",
	tQ = "⊏",
	nQ = "⊑",
	rQ = "⊐",
	iQ = "⊒",
	oQ = "⊔",
	sQ = "▪",
	lQ = "□",
	aQ = "▪",
	cQ = "→",
	uQ = "𝒮",
	fQ = "𝓈",
	dQ = "∖",
	hQ = "⌣",
	pQ = "⋆",
	gQ = "⋆",
	vQ = "☆",
	mQ = "★",
	yQ = "ϵ",
	bQ = "ϕ",
	wQ = "¯",
	xQ = "⊂",
	SQ = "⋐",
	_Q = "⪽",
	kQ = "⫅",
	TQ = "⊆",
	CQ = "⫃",
	EQ = "⫁",
	LQ = "⫋",
	AQ = "⊊",
	MQ = "⪿",
	NQ = "⥹",
	$Q = "⊂",
	PQ = "⋐",
	OQ = "⊆",
	RQ = "⫅",
	DQ = "⊆",
	zQ = "⊊",
	IQ = "⫋",
	FQ = "⫇",
	HQ = "⫕",
	qQ = "⫓",
	BQ = "⪸",
	WQ = "≻",
	UQ = "≽",
	VQ = "≻",
	jQ = "⪰",
	GQ = "≽",
	KQ = "≿",
	XQ = "⪰",
	YQ = "⪺",
	ZQ = "⪶",
	JQ = "⋩",
	QQ = "≿",
	eee = "∋",
	tee = "∑",
	nee = "∑",
	ree = "♪",
	iee = "¹",
	oee = "²",
	see = "³",
	lee = "⊃",
	aee = "⋑",
	cee = "⪾",
	uee = "⫘",
	fee = "⫆",
	dee = "⊇",
	hee = "⫄",
	pee = "⊃",
	gee = "⊇",
	vee = "⟉",
	mee = "⫗",
	yee = "⥻",
	bee = "⫂",
	wee = "⫌",
	xee = "⊋",
	See = "⫀",
	_ee = "⊃",
	kee = "⋑",
	Tee = "⊇",
	Cee = "⫆",
	Eee = "⊋",
	Lee = "⫌",
	Aee = "⫈",
	Mee = "⫔",
	Nee = "⫖",
	$ee = "⤦",
	Pee = "↙",
	Oee = "⇙",
	Ree = "↙",
	Dee = "⤪",
	zee = "ß",
	Iee = "	",
	Fee = "⌖",
	Hee = "Τ",
	qee = "τ",
	Bee = "⎴",
	Wee = "Ť",
	Uee = "ť",
	Vee = "Ţ",
	jee = "ţ",
	Gee = "Т",
	Kee = "т",
	Xee = "⃛",
	Yee = "⌕",
	Zee = "𝔗",
	Jee = "𝔱",
	Qee = "∴",
	ete = "∴",
	tte = "∴",
	nte = "Θ",
	rte = "θ",
	ite = "ϑ",
	ote = "ϑ",
	ste = "≈",
	lte = "∼",
	ate = "  ",
	cte = " ",
	ute = " ",
	fte = "≈",
	dte = "∼",
	hte = "Þ",
	pte = "þ",
	gte = "˜",
	vte = "∼",
	mte = "≃",
	yte = "≅",
	bte = "≈",
	wte = "⨱",
	xte = "⊠",
	Ste = "×",
	_te = "⨰",
	kte = "∭",
	Tte = "⤨",
	Cte = "⌶",
	Ete = "⫱",
	Lte = "⊤",
	Ate = "𝕋",
	Mte = "𝕥",
	Nte = "⫚",
	$te = "⤩",
	Pte = "‴",
	Ote = "™",
	Rte = "™",
	Dte = "▵",
	zte = "▿",
	Ite = "◃",
	Fte = "⊴",
	Hte = "≜",
	qte = "▹",
	Bte = "⊵",
	Wte = "◬",
	Ute = "≜",
	Vte = "⨺",
	jte = "⃛",
	Gte = "⨹",
	Kte = "⧍",
	Xte = "⨻",
	Yte = "⏢",
	Zte = "𝒯",
	Jte = "𝓉",
	Qte = "Ц",
	ene = "ц",
	tne = "Ћ",
	nne = "ћ",
	rne = "Ŧ",
	ine = "ŧ",
	one = "≬",
	sne = "↞",
	lne = "↠",
	ane = "Ú",
	cne = "ú",
	une = "↑",
	fne = "↟",
	dne = "⇑",
	hne = "⥉",
	pne = "Ў",
	gne = "ў",
	vne = "Ŭ",
	mne = "ŭ",
	yne = "Û",
	bne = "û",
	wne = "У",
	xne = "у",
	Sne = "⇅",
	_ne = "Ű",
	kne = "ű",
	Tne = "⥮",
	Cne = "⥾",
	Ene = "𝔘",
	Lne = "𝔲",
	Ane = "Ù",
	Mne = "ù",
	Nne = "⥣",
	$ne = "↿",
	Pne = "↾",
	One = "▀",
	Rne = "⌜",
	Dne = "⌜",
	zne = "⌏",
	Ine = "◸",
	Fne = "Ū",
	Hne = "ū",
	qne = "¨",
	Bne = "_",
	Wne = "⏟",
	Une = "⎵",
	Vne = "⏝",
	jne = "⋃",
	Gne = "⊎",
	Kne = "Ų",
	Xne = "ų",
	Yne = "𝕌",
	Zne = "𝕦",
	Jne = "⤒",
	Qne = "↑",
	ere = "↑",
	tre = "⇑",
	nre = "⇅",
	rre = "↕",
	ire = "↕",
	ore = "⇕",
	sre = "⥮",
	lre = "↿",
	are = "↾",
	cre = "⊎",
	ure = "↖",
	fre = "↗",
	dre = "υ",
	hre = "ϒ",
	pre = "ϒ",
	gre = "Υ",
	vre = "υ",
	mre = "↥",
	yre = "⊥",
	bre = "⇈",
	wre = "⌝",
	xre = "⌝",
	Sre = "⌎",
	_re = "Ů",
	kre = "ů",
	Tre = "◹",
	Cre = "𝒰",
	Ere = "𝓊",
	Lre = "⋰",
	Are = "Ũ",
	Mre = "ũ",
	Nre = "▵",
	$re = "▴",
	Pre = "⇈",
	Ore = "Ü",
	Rre = "ü",
	Dre = "⦧",
	zre = "⦜",
	Ire = "ϵ",
	Fre = "ϰ",
	Hre = "∅",
	qre = "ϕ",
	Bre = "ϖ",
	Wre = "∝",
	Ure = "↕",
	Vre = "⇕",
	jre = "ϱ",
	Gre = "ς",
	Kre = "⊊︀",
	Xre = "⫋︀",
	Yre = "⊋︀",
	Zre = "⫌︀",
	Jre = "ϑ",
	Qre = "⊲",
	eie = "⊳",
	tie = "⫨",
	nie = "⫫",
	rie = "⫩",
	iie = "В",
	oie = "в",
	sie = "⊢",
	lie = "⊨",
	aie = "⊩",
	cie = "⊫",
	uie = "⫦",
	fie = "⊻",
	die = "∨",
	hie = "⋁",
	pie = "≚",
	gie = "⋮",
	vie = "|",
	mie = "‖",
	yie = "|",
	bie = "‖",
	wie = "∣",
	xie = "|",
	Sie = "❘",
	_ie = "≀",
	kie = " ",
	Tie = "𝔙",
	Cie = "𝔳",
	Eie = "⊲",
	Lie = "⊂⃒",
	Aie = "⊃⃒",
	Mie = "𝕍",
	Nie = "𝕧",
	$ie = "∝",
	Pie = "⊳",
	Oie = "𝒱",
	Rie = "𝓋",
	Die = "⫋︀",
	zie = "⊊︀",
	Iie = "⫌︀",
	Fie = "⊋︀",
	Hie = "⊪",
	qie = "⦚",
	Bie = "Ŵ",
	Wie = "ŵ",
	Uie = "⩟",
	Vie = "∧",
	jie = "⋀",
	Gie = "≙",
	Kie = "℘",
	Xie = "𝔚",
	Yie = "𝔴",
	Zie = "𝕎",
	Jie = "𝕨",
	Qie = "℘",
	eoe = "≀",
	toe = "≀",
	noe = "𝒲",
	roe = "𝓌",
	ioe = "⋂",
	ooe = "◯",
	soe = "⋃",
	loe = "▽",
	aoe = "𝔛",
	coe = "𝔵",
	uoe = "⟷",
	foe = "⟺",
	doe = "Ξ",
	hoe = "ξ",
	poe = "⟵",
	goe = "⟸",
	voe = "⟼",
	moe = "⋻",
	yoe = "⨀",
	boe = "𝕏",
	woe = "𝕩",
	xoe = "⨁",
	Soe = "⨂",
	_oe = "⟶",
	koe = "⟹",
	Toe = "𝒳",
	Coe = "𝓍",
	Eoe = "⨆",
	Loe = "⨄",
	Aoe = "△",
	Moe = "⋁",
	Noe = "⋀",
	$oe = "Ý",
	Poe = "ý",
	Ooe = "Я",
	Roe = "я",
	Doe = "Ŷ",
	zoe = "ŷ",
	Ioe = "Ы",
	Foe = "ы",
	Hoe = "¥",
	qoe = "𝔜",
	Boe = "𝔶",
	Woe = "Ї",
	Uoe = "ї",
	Voe = "𝕐",
	joe = "𝕪",
	Goe = "𝒴",
	Koe = "𝓎",
	Xoe = "Ю",
	Yoe = "ю",
	Zoe = "ÿ",
	Joe = "Ÿ",
	Qoe = "Ź",
	ese = "ź",
	tse = "Ž",
	nse = "ž",
	rse = "З",
	ise = "з",
	ose = "Ż",
	sse = "ż",
	lse = "ℨ",
	ase = "​",
	cse = "Ζ",
	use = "ζ",
	fse = "𝔷",
	dse = "ℨ",
	hse = "Ж",
	pse = "ж",
	gse = "⇝",
	vse = "𝕫",
	mse = "ℤ",
	yse = "𝒵",
	bse = "𝓏",
	wse = "‍",
	xse = "‌",
	mw = {
		Aacute: oA,
		aacute: sA,
		Abreve: lA,
		abreve: aA,
		ac: cA,
		acd: uA,
		acE: fA,
		Acirc: dA,
		acirc: hA,
		acute: pA,
		Acy: gA,
		acy: vA,
		AElig: mA,
		aelig: yA,
		af: bA,
		Afr: wA,
		afr: xA,
		Agrave: SA,
		agrave: _A,
		alefsym: kA,
		aleph: TA,
		Alpha: CA,
		alpha: EA,
		Amacr: LA,
		amacr: AA,
		amalg: MA,
		amp: NA,
		AMP: $A,
		andand: PA,
		And: OA,
		and: RA,
		andd: DA,
		andslope: zA,
		andv: IA,
		ang: FA,
		ange: HA,
		angle: qA,
		angmsdaa: BA,
		angmsdab: WA,
		angmsdac: UA,
		angmsdad: VA,
		angmsdae: jA,
		angmsdaf: GA,
		angmsdag: KA,
		angmsdah: XA,
		angmsd: YA,
		angrt: ZA,
		angrtvb: JA,
		angrtvbd: QA,
		angsph: eM,
		angst: tM,
		angzarr: nM,
		Aogon: rM,
		aogon: iM,
		Aopf: oM,
		aopf: sM,
		apacir: lM,
		ap: aM,
		apE: cM,
		ape: uM,
		apid: fM,
		apos: dM,
		ApplyFunction: hM,
		approx: pM,
		approxeq: gM,
		Aring: vM,
		aring: mM,
		Ascr: yM,
		ascr: bM,
		Assign: wM,
		ast: xM,
		asymp: SM,
		asympeq: _M,
		Atilde: kM,
		atilde: TM,
		Auml: CM,
		auml: EM,
		awconint: LM,
		awint: AM,
		backcong: MM,
		backepsilon: NM,
		backprime: $M,
		backsim: PM,
		backsimeq: OM,
		Backslash: RM,
		Barv: DM,
		barvee: zM,
		barwed: IM,
		Barwed: FM,
		barwedge: HM,
		bbrk: qM,
		bbrktbrk: BM,
		bcong: WM,
		Bcy: UM,
		bcy: VM,
		bdquo: jM,
		becaus: GM,
		because: KM,
		Because: XM,
		bemptyv: YM,
		bepsi: ZM,
		bernou: JM,
		Bernoullis: QM,
		Beta: eN,
		beta: tN,
		beth: nN,
		between: rN,
		Bfr: iN,
		bfr: oN,
		bigcap: sN,
		bigcirc: lN,
		bigcup: aN,
		bigodot: cN,
		bigoplus: uN,
		bigotimes: fN,
		bigsqcup: dN,
		bigstar: hN,
		bigtriangledown: pN,
		bigtriangleup: gN,
		biguplus: vN,
		bigvee: mN,
		bigwedge: yN,
		bkarow: bN,
		blacklozenge: wN,
		blacksquare: xN,
		blacktriangle: SN,
		blacktriangledown: _N,
		blacktriangleleft: kN,
		blacktriangleright: TN,
		blank: CN,
		blk12: EN,
		blk14: LN,
		blk34: AN,
		block: MN,
		bne: NN,
		bnequiv: $N,
		bNot: PN,
		bnot: ON,
		Bopf: RN,
		bopf: DN,
		bot: zN,
		bottom: IN,
		bowtie: FN,
		boxbox: HN,
		boxdl: qN,
		boxdL: BN,
		boxDl: WN,
		boxDL: UN,
		boxdr: VN,
		boxdR: jN,
		boxDr: GN,
		boxDR: KN,
		boxh: XN,
		boxH: YN,
		boxhd: ZN,
		boxHd: JN,
		boxhD: QN,
		boxHD: e$,
		boxhu: t$,
		boxHu: n$,
		boxhU: r$,
		boxHU: i$,
		boxminus: o$,
		boxplus: s$,
		boxtimes: l$,
		boxul: a$,
		boxuL: c$,
		boxUl: u$,
		boxUL: f$,
		boxur: d$,
		boxuR: h$,
		boxUr: p$,
		boxUR: g$,
		boxv: v$,
		boxV: m$,
		boxvh: y$,
		boxvH: b$,
		boxVh: w$,
		boxVH: x$,
		boxvl: S$,
		boxvL: _$,
		boxVl: k$,
		boxVL: T$,
		boxvr: C$,
		boxvR: E$,
		boxVr: L$,
		boxVR: A$,
		bprime: M$,
		breve: N$,
		Breve: $$,
		brvbar: P$,
		bscr: O$,
		Bscr: R$,
		bsemi: D$,
		bsim: z$,
		bsime: I$,
		bsolb: F$,
		bsol: H$,
		bsolhsub: q$,
		bull: B$,
		bullet: W$,
		bump: U$,
		bumpE: V$,
		bumpe: j$,
		Bumpeq: G$,
		bumpeq: K$,
		Cacute: X$,
		cacute: Y$,
		capand: Z$,
		capbrcup: J$,
		capcap: Q$,
		cap: eP,
		Cap: tP,
		capcup: nP,
		capdot: rP,
		CapitalDifferentialD: iP,
		caps: oP,
		caret: sP,
		caron: lP,
		Cayleys: aP,
		ccaps: cP,
		Ccaron: uP,
		ccaron: fP,
		Ccedil: dP,
		ccedil: hP,
		Ccirc: pP,
		ccirc: gP,
		Cconint: vP,
		ccups: mP,
		ccupssm: yP,
		Cdot: bP,
		cdot: wP,
		cedil: xP,
		Cedilla: SP,
		cemptyv: _P,
		cent: kP,
		centerdot: TP,
		CenterDot: CP,
		cfr: EP,
		Cfr: LP,
		CHcy: AP,
		chcy: MP,
		check: NP,
		checkmark: $P,
		Chi: PP,
		chi: OP,
		circ: RP,
		circeq: DP,
		circlearrowleft: zP,
		circlearrowright: IP,
		circledast: FP,
		circledcirc: HP,
		circleddash: qP,
		CircleDot: BP,
		circledR: WP,
		circledS: UP,
		CircleMinus: VP,
		CirclePlus: jP,
		CircleTimes: GP,
		cir: KP,
		cirE: XP,
		cire: YP,
		cirfnint: ZP,
		cirmid: JP,
		cirscir: QP,
		ClockwiseContourIntegral: eO,
		CloseCurlyDoubleQuote: tO,
		CloseCurlyQuote: nO,
		clubs: rO,
		clubsuit: iO,
		colon: oO,
		Colon: sO,
		Colone: lO,
		colone: aO,
		coloneq: cO,
		comma: uO,
		commat: fO,
		comp: dO,
		compfn: hO,
		complement: pO,
		complexes: gO,
		cong: vO,
		congdot: mO,
		Congruent: yO,
		conint: bO,
		Conint: wO,
		ContourIntegral: xO,
		copf: SO,
		Copf: _O,
		coprod: kO,
		Coproduct: TO,
		copy: CO,
		COPY: EO,
		copysr: LO,
		CounterClockwiseContourIntegral: AO,
		crarr: MO,
		cross: NO,
		Cross: $O,
		Cscr: PO,
		cscr: OO,
		csub: RO,
		csube: DO,
		csup: zO,
		csupe: IO,
		ctdot: FO,
		cudarrl: HO,
		cudarrr: qO,
		cuepr: BO,
		cuesc: WO,
		cularr: UO,
		cularrp: VO,
		cupbrcap: jO,
		cupcap: GO,
		CupCap: KO,
		cup: XO,
		Cup: YO,
		cupcup: ZO,
		cupdot: JO,
		cupor: QO,
		cups: eR,
		curarr: tR,
		curarrm: nR,
		curlyeqprec: rR,
		curlyeqsucc: iR,
		curlyvee: oR,
		curlywedge: sR,
		curren: lR,
		curvearrowleft: aR,
		curvearrowright: cR,
		cuvee: uR,
		cuwed: fR,
		cwconint: dR,
		cwint: hR,
		cylcty: pR,
		dagger: gR,
		Dagger: vR,
		daleth: mR,
		darr: yR,
		Darr: bR,
		dArr: wR,
		dash: xR,
		Dashv: SR,
		dashv: _R,
		dbkarow: kR,
		dblac: TR,
		Dcaron: CR,
		dcaron: ER,
		Dcy: LR,
		dcy: AR,
		ddagger: MR,
		ddarr: NR,
		DD: $R,
		dd: PR,
		DDotrahd: OR,
		ddotseq: RR,
		deg: DR,
		Del: zR,
		Delta: IR,
		delta: FR,
		demptyv: HR,
		dfisht: qR,
		Dfr: BR,
		dfr: WR,
		dHar: UR,
		dharl: VR,
		dharr: jR,
		DiacriticalAcute: GR,
		DiacriticalDot: KR,
		DiacriticalDoubleAcute: XR,
		DiacriticalGrave: YR,
		DiacriticalTilde: ZR,
		diam: JR,
		diamond: QR,
		Diamond: eD,
		diamondsuit: tD,
		diams: nD,
		die: rD,
		DifferentialD: iD,
		digamma: oD,
		disin: sD,
		div: lD,
		divide: aD,
		divideontimes: cD,
		divonx: uD,
		DJcy: fD,
		djcy: dD,
		dlcorn: hD,
		dlcrop: pD,
		dollar: gD,
		Dopf: vD,
		dopf: mD,
		Dot: yD,
		dot: bD,
		DotDot: wD,
		doteq: xD,
		doteqdot: SD,
		DotEqual: _D,
		dotminus: kD,
		dotplus: TD,
		dotsquare: CD,
		doublebarwedge: ED,
		DoubleContourIntegral: LD,
		DoubleDot: AD,
		DoubleDownArrow: MD,
		DoubleLeftArrow: ND,
		DoubleLeftRightArrow: $D,
		DoubleLeftTee: PD,
		DoubleLongLeftArrow: OD,
		DoubleLongLeftRightArrow: RD,
		DoubleLongRightArrow: DD,
		DoubleRightArrow: zD,
		DoubleRightTee: ID,
		DoubleUpArrow: FD,
		DoubleUpDownArrow: HD,
		DoubleVerticalBar: qD,
		DownArrowBar: BD,
		downarrow: WD,
		DownArrow: UD,
		Downarrow: VD,
		DownArrowUpArrow: jD,
		DownBreve: GD,
		downdownarrows: KD,
		downharpoonleft: XD,
		downharpoonright: YD,
		DownLeftRightVector: ZD,
		DownLeftTeeVector: JD,
		DownLeftVectorBar: QD,
		DownLeftVector: ez,
		DownRightTeeVector: tz,
		DownRightVectorBar: nz,
		DownRightVector: rz,
		DownTeeArrow: iz,
		DownTee: oz,
		drbkarow: sz,
		drcorn: lz,
		drcrop: az,
		Dscr: cz,
		dscr: uz,
		DScy: fz,
		dscy: dz,
		dsol: hz,
		Dstrok: pz,
		dstrok: gz,
		dtdot: vz,
		dtri: mz,
		dtrif: yz,
		duarr: bz,
		duhar: wz,
		dwangle: xz,
		DZcy: Sz,
		dzcy: _z,
		dzigrarr: kz,
		Eacute: Tz,
		eacute: Cz,
		easter: Ez,
		Ecaron: Lz,
		ecaron: Az,
		Ecirc: Mz,
		ecirc: Nz,
		ecir: $z,
		ecolon: Pz,
		Ecy: Oz,
		ecy: Rz,
		eDDot: Dz,
		Edot: zz,
		edot: Iz,
		eDot: Fz,
		ee: Hz,
		efDot: qz,
		Efr: Bz,
		efr: Wz,
		eg: Uz,
		Egrave: Vz,
		egrave: jz,
		egs: Gz,
		egsdot: Kz,
		el: Xz,
		Element: Yz,
		elinters: Zz,
		ell: Jz,
		els: Qz,
		elsdot: e2,
		Emacr: t2,
		emacr: n2,
		empty: r2,
		emptyset: i2,
		EmptySmallSquare: o2,
		emptyv: s2,
		EmptyVerySmallSquare: l2,
		emsp13: a2,
		emsp14: c2,
		emsp: u2,
		ENG: f2,
		eng: d2,
		ensp: h2,
		Eogon: p2,
		eogon: g2,
		Eopf: v2,
		eopf: m2,
		epar: y2,
		eparsl: b2,
		eplus: w2,
		epsi: x2,
		Epsilon: S2,
		epsilon: _2,
		epsiv: k2,
		eqcirc: T2,
		eqcolon: C2,
		eqsim: E2,
		eqslantgtr: L2,
		eqslantless: A2,
		Equal: M2,
		equals: N2,
		EqualTilde: $2,
		equest: P2,
		Equilibrium: O2,
		equiv: R2,
		equivDD: D2,
		eqvparsl: z2,
		erarr: I2,
		erDot: F2,
		escr: H2,
		Escr: q2,
		esdot: B2,
		Esim: W2,
		esim: U2,
		Eta: V2,
		eta: j2,
		ETH: G2,
		eth: K2,
		Euml: X2,
		euml: Y2,
		euro: Z2,
		excl: J2,
		exist: Q2,
		Exists: eI,
		expectation: tI,
		exponentiale: nI,
		ExponentialE: rI,
		fallingdotseq: iI,
		Fcy: oI,
		fcy: sI,
		female: lI,
		ffilig: aI,
		fflig: cI,
		ffllig: uI,
		Ffr: fI,
		ffr: dI,
		filig: hI,
		FilledSmallSquare: pI,
		FilledVerySmallSquare: gI,
		fjlig: vI,
		flat: mI,
		fllig: yI,
		fltns: bI,
		fnof: wI,
		Fopf: xI,
		fopf: SI,
		forall: _I,
		ForAll: kI,
		fork: TI,
		forkv: CI,
		Fouriertrf: EI,
		fpartint: LI,
		frac12: AI,
		frac13: MI,
		frac14: NI,
		frac15: $I,
		frac16: PI,
		frac18: OI,
		frac23: RI,
		frac25: DI,
		frac34: zI,
		frac35: II,
		frac38: FI,
		frac45: HI,
		frac56: qI,
		frac58: BI,
		frac78: WI,
		frasl: UI,
		frown: VI,
		fscr: jI,
		Fscr: GI,
		gacute: KI,
		Gamma: XI,
		gamma: YI,
		Gammad: ZI,
		gammad: JI,
		gap: QI,
		Gbreve: eF,
		gbreve: tF,
		Gcedil: nF,
		Gcirc: rF,
		gcirc: iF,
		Gcy: oF,
		gcy: sF,
		Gdot: lF,
		gdot: aF,
		ge: cF,
		gE: uF,
		gEl: fF,
		gel: dF,
		geq: hF,
		geqq: pF,
		geqslant: gF,
		gescc: vF,
		ges: mF,
		gesdot: yF,
		gesdoto: bF,
		gesdotol: wF,
		gesl: xF,
		gesles: SF,
		Gfr: _F,
		gfr: kF,
		gg: TF,
		Gg: CF,
		ggg: EF,
		gimel: LF,
		GJcy: AF,
		gjcy: MF,
		gla: NF,
		gl: $F,
		glE: PF,
		glj: OF,
		gnap: RF,
		gnapprox: DF,
		gne: zF,
		gnE: IF,
		gneq: FF,
		gneqq: HF,
		gnsim: qF,
		Gopf: BF,
		gopf: WF,
		grave: UF,
		GreaterEqual: VF,
		GreaterEqualLess: jF,
		GreaterFullEqual: GF,
		GreaterGreater: KF,
		GreaterLess: XF,
		GreaterSlantEqual: YF,
		GreaterTilde: ZF,
		Gscr: JF,
		gscr: QF,
		gsim: eH,
		gsime: tH,
		gsiml: nH,
		gtcc: rH,
		gtcir: iH,
		gt: oH,
		GT: sH,
		Gt: lH,
		gtdot: aH,
		gtlPar: cH,
		gtquest: uH,
		gtrapprox: fH,
		gtrarr: dH,
		gtrdot: hH,
		gtreqless: pH,
		gtreqqless: gH,
		gtrless: vH,
		gtrsim: mH,
		gvertneqq: yH,
		gvnE: bH,
		Hacek: wH,
		hairsp: xH,
		half: SH,
		hamilt: _H,
		HARDcy: kH,
		hardcy: TH,
		harrcir: CH,
		harr: EH,
		hArr: LH,
		harrw: AH,
		Hat: MH,
		hbar: NH,
		Hcirc: $H,
		hcirc: PH,
		hearts: OH,
		heartsuit: RH,
		hellip: DH,
		hercon: zH,
		hfr: IH,
		Hfr: FH,
		HilbertSpace: HH,
		hksearow: qH,
		hkswarow: BH,
		hoarr: WH,
		homtht: UH,
		hookleftarrow: VH,
		hookrightarrow: jH,
		hopf: GH,
		Hopf: KH,
		horbar: XH,
		HorizontalLine: YH,
		hscr: ZH,
		Hscr: JH,
		hslash: QH,
		Hstrok: eq,
		hstrok: tq,
		HumpDownHump: nq,
		HumpEqual: rq,
		hybull: iq,
		hyphen: oq,
		Iacute: sq,
		iacute: lq,
		ic: aq,
		Icirc: cq,
		icirc: uq,
		Icy: fq,
		icy: dq,
		Idot: hq,
		IEcy: pq,
		iecy: gq,
		iexcl: vq,
		iff: mq,
		ifr: yq,
		Ifr: bq,
		Igrave: wq,
		igrave: xq,
		ii: Sq,
		iiiint: _q,
		iiint: kq,
		iinfin: Tq,
		iiota: Cq,
		IJlig: Eq,
		ijlig: Lq,
		Imacr: Aq,
		imacr: Mq,
		image: Nq,
		ImaginaryI: $q,
		imagline: Pq,
		imagpart: Oq,
		imath: Rq,
		Im: Dq,
		imof: zq,
		imped: Iq,
		Implies: Fq,
		incare: Hq,
		in: "∈",
		infin: qq,
		infintie: Bq,
		inodot: Wq,
		intcal: Uq,
		int: Vq,
		Int: jq,
		integers: Gq,
		Integral: Kq,
		intercal: Xq,
		Intersection: Yq,
		intlarhk: Zq,
		intprod: Jq,
		InvisibleComma: Qq,
		InvisibleTimes: eB,
		IOcy: tB,
		iocy: nB,
		Iogon: rB,
		iogon: iB,
		Iopf: oB,
		iopf: sB,
		Iota: lB,
		iota: aB,
		iprod: cB,
		iquest: uB,
		iscr: fB,
		Iscr: dB,
		isin: hB,
		isindot: pB,
		isinE: gB,
		isins: vB,
		isinsv: mB,
		isinv: yB,
		it: bB,
		Itilde: wB,
		itilde: xB,
		Iukcy: SB,
		iukcy: _B,
		Iuml: kB,
		iuml: TB,
		Jcirc: CB,
		jcirc: EB,
		Jcy: LB,
		jcy: AB,
		Jfr: MB,
		jfr: NB,
		jmath: $B,
		Jopf: PB,
		jopf: OB,
		Jscr: RB,
		jscr: DB,
		Jsercy: zB,
		jsercy: IB,
		Jukcy: FB,
		jukcy: HB,
		Kappa: qB,
		kappa: BB,
		kappav: WB,
		Kcedil: UB,
		kcedil: VB,
		Kcy: jB,
		kcy: GB,
		Kfr: KB,
		kfr: XB,
		kgreen: YB,
		KHcy: ZB,
		khcy: JB,
		KJcy: QB,
		kjcy: e3,
		Kopf: t3,
		kopf: n3,
		Kscr: r3,
		kscr: i3,
		lAarr: o3,
		Lacute: s3,
		lacute: l3,
		laemptyv: a3,
		lagran: c3,
		Lambda: u3,
		lambda: f3,
		lang: d3,
		Lang: h3,
		langd: p3,
		langle: g3,
		lap: v3,
		Laplacetrf: m3,
		laquo: y3,
		larrb: b3,
		larrbfs: w3,
		larr: x3,
		Larr: S3,
		lArr: _3,
		larrfs: k3,
		larrhk: T3,
		larrlp: C3,
		larrpl: E3,
		larrsim: L3,
		larrtl: A3,
		latail: M3,
		lAtail: N3,
		lat: $3,
		late: P3,
		lates: O3,
		lbarr: R3,
		lBarr: D3,
		lbbrk: z3,
		lbrace: I3,
		lbrack: F3,
		lbrke: H3,
		lbrksld: q3,
		lbrkslu: B3,
		Lcaron: W3,
		lcaron: U3,
		Lcedil: V3,
		lcedil: j3,
		lceil: G3,
		lcub: K3,
		Lcy: X3,
		lcy: Y3,
		ldca: Z3,
		ldquo: J3,
		ldquor: Q3,
		ldrdhar: e5,
		ldrushar: t5,
		ldsh: n5,
		le: r5,
		lE: i5,
		LeftAngleBracket: o5,
		LeftArrowBar: s5,
		leftarrow: l5,
		LeftArrow: a5,
		Leftarrow: c5,
		LeftArrowRightArrow: u5,
		leftarrowtail: f5,
		LeftCeiling: d5,
		LeftDoubleBracket: h5,
		LeftDownTeeVector: p5,
		LeftDownVectorBar: g5,
		LeftDownVector: v5,
		LeftFloor: m5,
		leftharpoondown: y5,
		leftharpoonup: b5,
		leftleftarrows: w5,
		leftrightarrow: x5,
		LeftRightArrow: S5,
		Leftrightarrow: _5,
		leftrightarrows: k5,
		leftrightharpoons: T5,
		leftrightsquigarrow: C5,
		LeftRightVector: E5,
		LeftTeeArrow: L5,
		LeftTee: A5,
		LeftTeeVector: M5,
		leftthreetimes: N5,
		LeftTriangleBar: $5,
		LeftTriangle: P5,
		LeftTriangleEqual: O5,
		LeftUpDownVector: R5,
		LeftUpTeeVector: D5,
		LeftUpVectorBar: z5,
		LeftUpVector: I5,
		LeftVectorBar: F5,
		LeftVector: H5,
		lEg: q5,
		leg: B5,
		leq: W5,
		leqq: U5,
		leqslant: V5,
		lescc: j5,
		les: G5,
		lesdot: K5,
		lesdoto: X5,
		lesdotor: Y5,
		lesg: Z5,
		lesges: J5,
		lessapprox: Q5,
		lessdot: e8,
		lesseqgtr: t8,
		lesseqqgtr: n8,
		LessEqualGreater: r8,
		LessFullEqual: i8,
		LessGreater: o8,
		lessgtr: s8,
		LessLess: l8,
		lesssim: a8,
		LessSlantEqual: c8,
		LessTilde: u8,
		lfisht: f8,
		lfloor: d8,
		Lfr: h8,
		lfr: p8,
		lg: g8,
		lgE: v8,
		lHar: m8,
		lhard: y8,
		lharu: b8,
		lharul: w8,
		lhblk: x8,
		LJcy: S8,
		ljcy: _8,
		llarr: k8,
		ll: T8,
		Ll: C8,
		llcorner: E8,
		Lleftarrow: L8,
		llhard: A8,
		lltri: M8,
		Lmidot: N8,
		lmidot: $8,
		lmoustache: P8,
		lmoust: O8,
		lnap: R8,
		lnapprox: D8,
		lne: z8,
		lnE: I8,
		lneq: F8,
		lneqq: H8,
		lnsim: q8,
		loang: B8,
		loarr: W8,
		lobrk: U8,
		longleftarrow: V8,
		LongLeftArrow: j8,
		Longleftarrow: G8,
		longleftrightarrow: K8,
		LongLeftRightArrow: X8,
		Longleftrightarrow: Y8,
		longmapsto: Z8,
		longrightarrow: J8,
		LongRightArrow: Q8,
		Longrightarrow: eW,
		looparrowleft: tW,
		looparrowright: nW,
		lopar: rW,
		Lopf: iW,
		lopf: oW,
		loplus: sW,
		lotimes: lW,
		lowast: aW,
		lowbar: cW,
		LowerLeftArrow: uW,
		LowerRightArrow: fW,
		loz: dW,
		lozenge: hW,
		lozf: pW,
		lpar: gW,
		lparlt: vW,
		lrarr: mW,
		lrcorner: yW,
		lrhar: bW,
		lrhard: wW,
		lrm: xW,
		lrtri: SW,
		lsaquo: _W,
		lscr: kW,
		Lscr: TW,
		lsh: CW,
		Lsh: EW,
		lsim: LW,
		lsime: AW,
		lsimg: MW,
		lsqb: NW,
		lsquo: $W,
		lsquor: PW,
		Lstrok: OW,
		lstrok: RW,
		ltcc: DW,
		ltcir: zW,
		lt: IW,
		LT: FW,
		Lt: HW,
		ltdot: qW,
		lthree: BW,
		ltimes: WW,
		ltlarr: UW,
		ltquest: VW,
		ltri: jW,
		ltrie: GW,
		ltrif: KW,
		ltrPar: XW,
		lurdshar: YW,
		luruhar: ZW,
		lvertneqq: JW,
		lvnE: QW,
		macr: e4,
		male: t4,
		malt: n4,
		maltese: r4,
		Map: "⤅",
		map: i4,
		mapsto: o4,
		mapstodown: s4,
		mapstoleft: l4,
		mapstoup: a4,
		marker: c4,
		mcomma: u4,
		Mcy: f4,
		mcy: d4,
		mdash: h4,
		mDDot: p4,
		measuredangle: g4,
		MediumSpace: v4,
		Mellintrf: m4,
		Mfr: y4,
		mfr: b4,
		mho: w4,
		micro: x4,
		midast: S4,
		midcir: _4,
		mid: k4,
		middot: T4,
		minusb: C4,
		minus: E4,
		minusd: L4,
		minusdu: A4,
		MinusPlus: M4,
		mlcp: N4,
		mldr: $4,
		mnplus: P4,
		models: O4,
		Mopf: R4,
		mopf: D4,
		mp: z4,
		mscr: I4,
		Mscr: F4,
		mstpos: H4,
		Mu: q4,
		mu: B4,
		multimap: W4,
		mumap: U4,
		nabla: V4,
		Nacute: j4,
		nacute: G4,
		nang: K4,
		nap: X4,
		napE: Y4,
		napid: Z4,
		napos: J4,
		napprox: Q4,
		natural: eU,
		naturals: tU,
		natur: nU,
		nbsp: rU,
		nbump: iU,
		nbumpe: oU,
		ncap: sU,
		Ncaron: lU,
		ncaron: aU,
		Ncedil: cU,
		ncedil: uU,
		ncong: fU,
		ncongdot: dU,
		ncup: hU,
		Ncy: pU,
		ncy: gU,
		ndash: vU,
		nearhk: mU,
		nearr: yU,
		neArr: bU,
		nearrow: wU,
		ne: xU,
		nedot: SU,
		NegativeMediumSpace: _U,
		NegativeThickSpace: kU,
		NegativeThinSpace: TU,
		NegativeVeryThinSpace: CU,
		nequiv: EU,
		nesear: LU,
		nesim: AU,
		NestedGreaterGreater: MU,
		NestedLessLess: NU,
		NewLine: $U,
		nexist: PU,
		nexists: OU,
		Nfr: RU,
		nfr: DU,
		ngE: zU,
		nge: IU,
		ngeq: FU,
		ngeqq: HU,
		ngeqslant: qU,
		nges: BU,
		nGg: WU,
		ngsim: UU,
		nGt: VU,
		ngt: jU,
		ngtr: GU,
		nGtv: KU,
		nharr: XU,
		nhArr: YU,
		nhpar: ZU,
		ni: JU,
		nis: QU,
		nisd: e6,
		niv: t6,
		NJcy: n6,
		njcy: r6,
		nlarr: i6,
		nlArr: o6,
		nldr: s6,
		nlE: l6,
		nle: a6,
		nleftarrow: c6,
		nLeftarrow: u6,
		nleftrightarrow: f6,
		nLeftrightarrow: d6,
		nleq: h6,
		nleqq: p6,
		nleqslant: g6,
		nles: v6,
		nless: m6,
		nLl: y6,
		nlsim: b6,
		nLt: w6,
		nlt: x6,
		nltri: S6,
		nltrie: _6,
		nLtv: k6,
		nmid: T6,
		NoBreak: C6,
		NonBreakingSpace: E6,
		nopf: L6,
		Nopf: A6,
		Not: M6,
		not: N6,
		NotCongruent: $6,
		NotCupCap: P6,
		NotDoubleVerticalBar: O6,
		NotElement: R6,
		NotEqual: D6,
		NotEqualTilde: z6,
		NotExists: I6,
		NotGreater: F6,
		NotGreaterEqual: H6,
		NotGreaterFullEqual: q6,
		NotGreaterGreater: B6,
		NotGreaterLess: W6,
		NotGreaterSlantEqual: U6,
		NotGreaterTilde: V6,
		NotHumpDownHump: j6,
		NotHumpEqual: G6,
		notin: K6,
		notindot: X6,
		notinE: Y6,
		notinva: Z6,
		notinvb: J6,
		notinvc: Q6,
		NotLeftTriangleBar: eV,
		NotLeftTriangle: tV,
		NotLeftTriangleEqual: nV,
		NotLess: rV,
		NotLessEqual: iV,
		NotLessGreater: oV,
		NotLessLess: sV,
		NotLessSlantEqual: lV,
		NotLessTilde: aV,
		NotNestedGreaterGreater: cV,
		NotNestedLessLess: uV,
		notni: fV,
		notniva: dV,
		notnivb: hV,
		notnivc: pV,
		NotPrecedes: gV,
		NotPrecedesEqual: vV,
		NotPrecedesSlantEqual: mV,
		NotReverseElement: yV,
		NotRightTriangleBar: bV,
		NotRightTriangle: wV,
		NotRightTriangleEqual: xV,
		NotSquareSubset: SV,
		NotSquareSubsetEqual: _V,
		NotSquareSuperset: kV,
		NotSquareSupersetEqual: TV,
		NotSubset: CV,
		NotSubsetEqual: EV,
		NotSucceeds: LV,
		NotSucceedsEqual: AV,
		NotSucceedsSlantEqual: MV,
		NotSucceedsTilde: NV,
		NotSuperset: $V,
		NotSupersetEqual: PV,
		NotTilde: OV,
		NotTildeEqual: RV,
		NotTildeFullEqual: DV,
		NotTildeTilde: zV,
		NotVerticalBar: IV,
		nparallel: FV,
		npar: HV,
		nparsl: qV,
		npart: BV,
		npolint: WV,
		npr: UV,
		nprcue: VV,
		nprec: jV,
		npreceq: GV,
		npre: KV,
		nrarrc: XV,
		nrarr: YV,
		nrArr: ZV,
		nrarrw: JV,
		nrightarrow: QV,
		nRightarrow: ej,
		nrtri: tj,
		nrtrie: nj,
		nsc: rj,
		nsccue: ij,
		nsce: oj,
		Nscr: sj,
		nscr: lj,
		nshortmid: aj,
		nshortparallel: cj,
		nsim: uj,
		nsime: fj,
		nsimeq: dj,
		nsmid: hj,
		nspar: pj,
		nsqsube: gj,
		nsqsupe: vj,
		nsub: mj,
		nsubE: yj,
		nsube: bj,
		nsubset: wj,
		nsubseteq: xj,
		nsubseteqq: Sj,
		nsucc: _j,
		nsucceq: kj,
		nsup: Tj,
		nsupE: Cj,
		nsupe: Ej,
		nsupset: Lj,
		nsupseteq: Aj,
		nsupseteqq: Mj,
		ntgl: Nj,
		Ntilde: $j,
		ntilde: Pj,
		ntlg: Oj,
		ntriangleleft: Rj,
		ntrianglelefteq: Dj,
		ntriangleright: zj,
		ntrianglerighteq: Ij,
		Nu: Fj,
		nu: Hj,
		num: qj,
		numero: Bj,
		numsp: Wj,
		nvap: Uj,
		nvdash: Vj,
		nvDash: jj,
		nVdash: Gj,
		nVDash: Kj,
		nvge: Xj,
		nvgt: Yj,
		nvHarr: Zj,
		nvinfin: Jj,
		nvlArr: Qj,
		nvle: eG,
		nvlt: tG,
		nvltrie: nG,
		nvrArr: rG,
		nvrtrie: iG,
		nvsim: oG,
		nwarhk: sG,
		nwarr: lG,
		nwArr: aG,
		nwarrow: cG,
		nwnear: uG,
		Oacute: fG,
		oacute: dG,
		oast: hG,
		Ocirc: pG,
		ocirc: gG,
		ocir: vG,
		Ocy: mG,
		ocy: yG,
		odash: bG,
		Odblac: wG,
		odblac: xG,
		odiv: SG,
		odot: _G,
		odsold: kG,
		OElig: TG,
		oelig: CG,
		ofcir: EG,
		Ofr: LG,
		ofr: AG,
		ogon: MG,
		Ograve: NG,
		ograve: $G,
		ogt: PG,
		ohbar: OG,
		ohm: RG,
		oint: DG,
		olarr: zG,
		olcir: IG,
		olcross: FG,
		oline: HG,
		olt: qG,
		Omacr: BG,
		omacr: WG,
		Omega: UG,
		omega: VG,
		Omicron: jG,
		omicron: GG,
		omid: KG,
		ominus: XG,
		Oopf: YG,
		oopf: ZG,
		opar: JG,
		OpenCurlyDoubleQuote: QG,
		OpenCurlyQuote: e9,
		operp: t9,
		oplus: n9,
		orarr: r9,
		Or: i9,
		or: o9,
		ord: s9,
		order: l9,
		orderof: a9,
		ordf: c9,
		ordm: u9,
		origof: f9,
		oror: d9,
		orslope: h9,
		orv: p9,
		oS: g9,
		Oscr: v9,
		oscr: m9,
		Oslash: y9,
		oslash: b9,
		osol: w9,
		Otilde: x9,
		otilde: S9,
		otimesas: _9,
		Otimes: k9,
		otimes: T9,
		Ouml: C9,
		ouml: E9,
		ovbar: L9,
		OverBar: A9,
		OverBrace: M9,
		OverBracket: N9,
		OverParenthesis: $9,
		para: P9,
		parallel: O9,
		par: R9,
		parsim: D9,
		parsl: z9,
		part: I9,
		PartialD: F9,
		Pcy: H9,
		pcy: q9,
		percnt: B9,
		period: W9,
		permil: U9,
		perp: V9,
		pertenk: j9,
		Pfr: G9,
		pfr: K9,
		Phi: X9,
		phi: Y9,
		phiv: Z9,
		phmmat: J9,
		phone: Q9,
		Pi: e7,
		pi: t7,
		pitchfork: n7,
		piv: r7,
		planck: i7,
		planckh: o7,
		plankv: s7,
		plusacir: l7,
		plusb: a7,
		pluscir: c7,
		plus: u7,
		plusdo: f7,
		plusdu: d7,
		pluse: h7,
		PlusMinus: p7,
		plusmn: g7,
		plussim: v7,
		plustwo: m7,
		pm: y7,
		Poincareplane: b7,
		pointint: w7,
		popf: x7,
		Popf: S7,
		pound: _7,
		prap: k7,
		Pr: T7,
		pr: C7,
		prcue: E7,
		precapprox: L7,
		prec: A7,
		preccurlyeq: M7,
		Precedes: N7,
		PrecedesEqual: $7,
		PrecedesSlantEqual: P7,
		PrecedesTilde: O7,
		preceq: R7,
		precnapprox: D7,
		precneqq: z7,
		precnsim: I7,
		pre: F7,
		prE: H7,
		precsim: q7,
		prime: B7,
		Prime: W7,
		primes: U7,
		prnap: V7,
		prnE: j7,
		prnsim: G7,
		prod: K7,
		Product: X7,
		profalar: Y7,
		profline: Z7,
		profsurf: J7,
		prop: Q7,
		Proportional: eK,
		Proportion: tK,
		propto: nK,
		prsim: rK,
		prurel: iK,
		Pscr: oK,
		pscr: sK,
		Psi: lK,
		psi: aK,
		puncsp: cK,
		Qfr: uK,
		qfr: fK,
		qint: dK,
		qopf: hK,
		Qopf: pK,
		qprime: gK,
		Qscr: vK,
		qscr: mK,
		quaternions: yK,
		quatint: bK,
		quest: wK,
		questeq: xK,
		quot: SK,
		QUOT: _K,
		rAarr: kK,
		race: TK,
		Racute: CK,
		racute: EK,
		radic: LK,
		raemptyv: AK,
		rang: MK,
		Rang: NK,
		rangd: $K,
		range: PK,
		rangle: OK,
		raquo: RK,
		rarrap: DK,
		rarrb: zK,
		rarrbfs: IK,
		rarrc: FK,
		rarr: HK,
		Rarr: qK,
		rArr: BK,
		rarrfs: WK,
		rarrhk: UK,
		rarrlp: VK,
		rarrpl: jK,
		rarrsim: GK,
		Rarrtl: KK,
		rarrtl: XK,
		rarrw: YK,
		ratail: ZK,
		rAtail: JK,
		ratio: QK,
		rationals: eX,
		rbarr: tX,
		rBarr: nX,
		RBarr: rX,
		rbbrk: iX,
		rbrace: oX,
		rbrack: sX,
		rbrke: lX,
		rbrksld: aX,
		rbrkslu: cX,
		Rcaron: uX,
		rcaron: fX,
		Rcedil: dX,
		rcedil: hX,
		rceil: pX,
		rcub: gX,
		Rcy: vX,
		rcy: mX,
		rdca: yX,
		rdldhar: bX,
		rdquo: wX,
		rdquor: xX,
		rdsh: SX,
		real: _X,
		realine: kX,
		realpart: TX,
		reals: CX,
		Re: EX,
		rect: LX,
		reg: AX,
		REG: MX,
		ReverseElement: NX,
		ReverseEquilibrium: $X,
		ReverseUpEquilibrium: PX,
		rfisht: OX,
		rfloor: RX,
		rfr: DX,
		Rfr: zX,
		rHar: IX,
		rhard: FX,
		rharu: HX,
		rharul: qX,
		Rho: BX,
		rho: WX,
		rhov: UX,
		RightAngleBracket: VX,
		RightArrowBar: jX,
		rightarrow: GX,
		RightArrow: KX,
		Rightarrow: XX,
		RightArrowLeftArrow: YX,
		rightarrowtail: ZX,
		RightCeiling: JX,
		RightDoubleBracket: QX,
		RightDownTeeVector: eY,
		RightDownVectorBar: tY,
		RightDownVector: nY,
		RightFloor: rY,
		rightharpoondown: iY,
		rightharpoonup: oY,
		rightleftarrows: sY,
		rightleftharpoons: lY,
		rightrightarrows: aY,
		rightsquigarrow: cY,
		RightTeeArrow: uY,
		RightTee: fY,
		RightTeeVector: dY,
		rightthreetimes: hY,
		RightTriangleBar: pY,
		RightTriangle: gY,
		RightTriangleEqual: vY,
		RightUpDownVector: mY,
		RightUpTeeVector: yY,
		RightUpVectorBar: bY,
		RightUpVector: wY,
		RightVectorBar: xY,
		RightVector: SY,
		ring: _Y,
		risingdotseq: kY,
		rlarr: TY,
		rlhar: CY,
		rlm: EY,
		rmoustache: LY,
		rmoust: AY,
		rnmid: MY,
		roang: NY,
		roarr: $Y,
		robrk: PY,
		ropar: OY,
		ropf: RY,
		Ropf: DY,
		roplus: zY,
		rotimes: IY,
		RoundImplies: FY,
		rpar: HY,
		rpargt: qY,
		rppolint: BY,
		rrarr: WY,
		Rrightarrow: UY,
		rsaquo: VY,
		rscr: jY,
		Rscr: GY,
		rsh: KY,
		Rsh: XY,
		rsqb: YY,
		rsquo: ZY,
		rsquor: JY,
		rthree: QY,
		rtimes: eZ,
		rtri: tZ,
		rtrie: nZ,
		rtrif: rZ,
		rtriltri: iZ,
		RuleDelayed: oZ,
		ruluhar: sZ,
		rx: lZ,
		Sacute: aZ,
		sacute: cZ,
		sbquo: uZ,
		scap: fZ,
		Scaron: dZ,
		scaron: hZ,
		Sc: pZ,
		sc: gZ,
		sccue: vZ,
		sce: mZ,
		scE: yZ,
		Scedil: bZ,
		scedil: wZ,
		Scirc: xZ,
		scirc: SZ,
		scnap: _Z,
		scnE: kZ,
		scnsim: TZ,
		scpolint: CZ,
		scsim: EZ,
		Scy: LZ,
		scy: AZ,
		sdotb: MZ,
		sdot: NZ,
		sdote: $Z,
		searhk: PZ,
		searr: OZ,
		seArr: RZ,
		searrow: DZ,
		sect: zZ,
		semi: IZ,
		seswar: FZ,
		setminus: HZ,
		setmn: qZ,
		sext: BZ,
		Sfr: WZ,
		sfr: UZ,
		sfrown: VZ,
		sharp: jZ,
		SHCHcy: GZ,
		shchcy: KZ,
		SHcy: XZ,
		shcy: YZ,
		ShortDownArrow: ZZ,
		ShortLeftArrow: JZ,
		shortmid: QZ,
		shortparallel: eJ,
		ShortRightArrow: tJ,
		ShortUpArrow: nJ,
		shy: rJ,
		Sigma: iJ,
		sigma: oJ,
		sigmaf: sJ,
		sigmav: lJ,
		sim: aJ,
		simdot: cJ,
		sime: uJ,
		simeq: fJ,
		simg: dJ,
		simgE: hJ,
		siml: pJ,
		simlE: gJ,
		simne: vJ,
		simplus: mJ,
		simrarr: yJ,
		slarr: bJ,
		SmallCircle: wJ,
		smallsetminus: xJ,
		smashp: SJ,
		smeparsl: _J,
		smid: kJ,
		smile: TJ,
		smt: CJ,
		smte: EJ,
		smtes: LJ,
		SOFTcy: AJ,
		softcy: MJ,
		solbar: NJ,
		solb: $J,
		sol: PJ,
		Sopf: OJ,
		sopf: RJ,
		spades: DJ,
		spadesuit: zJ,
		spar: IJ,
		sqcap: FJ,
		sqcaps: HJ,
		sqcup: qJ,
		sqcups: BJ,
		Sqrt: WJ,
		sqsub: UJ,
		sqsube: VJ,
		sqsubset: jJ,
		sqsubseteq: GJ,
		sqsup: KJ,
		sqsupe: XJ,
		sqsupset: YJ,
		sqsupseteq: ZJ,
		square: JJ,
		Square: QJ,
		SquareIntersection: eQ,
		SquareSubset: tQ,
		SquareSubsetEqual: nQ,
		SquareSuperset: rQ,
		SquareSupersetEqual: iQ,
		SquareUnion: oQ,
		squarf: sQ,
		squ: lQ,
		squf: aQ,
		srarr: cQ,
		Sscr: uQ,
		sscr: fQ,
		ssetmn: dQ,
		ssmile: hQ,
		sstarf: pQ,
		Star: gQ,
		star: vQ,
		starf: mQ,
		straightepsilon: yQ,
		straightphi: bQ,
		strns: wQ,
		sub: xQ,
		Sub: SQ,
		subdot: _Q,
		subE: kQ,
		sube: TQ,
		subedot: CQ,
		submult: EQ,
		subnE: LQ,
		subne: AQ,
		subplus: MQ,
		subrarr: NQ,
		subset: $Q,
		Subset: PQ,
		subseteq: OQ,
		subseteqq: RQ,
		SubsetEqual: DQ,
		subsetneq: zQ,
		subsetneqq: IQ,
		subsim: FQ,
		subsub: HQ,
		subsup: qQ,
		succapprox: BQ,
		succ: WQ,
		succcurlyeq: UQ,
		Succeeds: VQ,
		SucceedsEqual: jQ,
		SucceedsSlantEqual: GQ,
		SucceedsTilde: KQ,
		succeq: XQ,
		succnapprox: YQ,
		succneqq: ZQ,
		succnsim: JQ,
		succsim: QQ,
		SuchThat: eee,
		sum: tee,
		Sum: nee,
		sung: ree,
		sup1: iee,
		sup2: oee,
		sup3: see,
		sup: lee,
		Sup: aee,
		supdot: cee,
		supdsub: uee,
		supE: fee,
		supe: dee,
		supedot: hee,
		Superset: pee,
		SupersetEqual: gee,
		suphsol: vee,
		suphsub: mee,
		suplarr: yee,
		supmult: bee,
		supnE: wee,
		supne: xee,
		supplus: See,
		supset: _ee,
		Supset: kee,
		supseteq: Tee,
		supseteqq: Cee,
		supsetneq: Eee,
		supsetneqq: Lee,
		supsim: Aee,
		supsub: Mee,
		supsup: Nee,
		swarhk: $ee,
		swarr: Pee,
		swArr: Oee,
		swarrow: Ree,
		swnwar: Dee,
		szlig: zee,
		Tab: Iee,
		target: Fee,
		Tau: Hee,
		tau: qee,
		tbrk: Bee,
		Tcaron: Wee,
		tcaron: Uee,
		Tcedil: Vee,
		tcedil: jee,
		Tcy: Gee,
		tcy: Kee,
		tdot: Xee,
		telrec: Yee,
		Tfr: Zee,
		tfr: Jee,
		there4: Qee,
		therefore: ete,
		Therefore: tte,
		Theta: nte,
		theta: rte,
		thetasym: ite,
		thetav: ote,
		thickapprox: ste,
		thicksim: lte,
		ThickSpace: ate,
		ThinSpace: cte,
		thinsp: ute,
		thkap: fte,
		thksim: dte,
		THORN: hte,
		thorn: pte,
		tilde: gte,
		Tilde: vte,
		TildeEqual: mte,
		TildeFullEqual: yte,
		TildeTilde: bte,
		timesbar: wte,
		timesb: xte,
		times: Ste,
		timesd: _te,
		tint: kte,
		toea: Tte,
		topbot: Cte,
		topcir: Ete,
		top: Lte,
		Topf: Ate,
		topf: Mte,
		topfork: Nte,
		tosa: $te,
		tprime: Pte,
		trade: Ote,
		TRADE: Rte,
		triangle: Dte,
		triangledown: zte,
		triangleleft: Ite,
		trianglelefteq: Fte,
		triangleq: Hte,
		triangleright: qte,
		trianglerighteq: Bte,
		tridot: Wte,
		trie: Ute,
		triminus: Vte,
		TripleDot: jte,
		triplus: Gte,
		trisb: Kte,
		tritime: Xte,
		trpezium: Yte,
		Tscr: Zte,
		tscr: Jte,
		TScy: Qte,
		tscy: ene,
		TSHcy: tne,
		tshcy: nne,
		Tstrok: rne,
		tstrok: ine,
		twixt: one,
		twoheadleftarrow: sne,
		twoheadrightarrow: lne,
		Uacute: ane,
		uacute: cne,
		uarr: une,
		Uarr: fne,
		uArr: dne,
		Uarrocir: hne,
		Ubrcy: pne,
		ubrcy: gne,
		Ubreve: vne,
		ubreve: mne,
		Ucirc: yne,
		ucirc: bne,
		Ucy: wne,
		ucy: xne,
		udarr: Sne,
		Udblac: _ne,
		udblac: kne,
		udhar: Tne,
		ufisht: Cne,
		Ufr: Ene,
		ufr: Lne,
		Ugrave: Ane,
		ugrave: Mne,
		uHar: Nne,
		uharl: $ne,
		uharr: Pne,
		uhblk: One,
		ulcorn: Rne,
		ulcorner: Dne,
		ulcrop: zne,
		ultri: Ine,
		Umacr: Fne,
		umacr: Hne,
		uml: qne,
		UnderBar: Bne,
		UnderBrace: Wne,
		UnderBracket: Une,
		UnderParenthesis: Vne,
		Union: jne,
		UnionPlus: Gne,
		Uogon: Kne,
		uogon: Xne,
		Uopf: Yne,
		uopf: Zne,
		UpArrowBar: Jne,
		uparrow: Qne,
		UpArrow: ere,
		Uparrow: tre,
		UpArrowDownArrow: nre,
		updownarrow: rre,
		UpDownArrow: ire,
		Updownarrow: ore,
		UpEquilibrium: sre,
		upharpoonleft: lre,
		upharpoonright: are,
		uplus: cre,
		UpperLeftArrow: ure,
		UpperRightArrow: fre,
		upsi: dre,
		Upsi: hre,
		upsih: pre,
		Upsilon: gre,
		upsilon: vre,
		UpTeeArrow: mre,
		UpTee: yre,
		upuparrows: bre,
		urcorn: wre,
		urcorner: xre,
		urcrop: Sre,
		Uring: _re,
		uring: kre,
		urtri: Tre,
		Uscr: Cre,
		uscr: Ere,
		utdot: Lre,
		Utilde: Are,
		utilde: Mre,
		utri: Nre,
		utrif: $re,
		uuarr: Pre,
		Uuml: Ore,
		uuml: Rre,
		uwangle: Dre,
		vangrt: zre,
		varepsilon: Ire,
		varkappa: Fre,
		varnothing: Hre,
		varphi: qre,
		varpi: Bre,
		varpropto: Wre,
		varr: Ure,
		vArr: Vre,
		varrho: jre,
		varsigma: Gre,
		varsubsetneq: Kre,
		varsubsetneqq: Xre,
		varsupsetneq: Yre,
		varsupsetneqq: Zre,
		vartheta: Jre,
		vartriangleleft: Qre,
		vartriangleright: eie,
		vBar: tie,
		Vbar: nie,
		vBarv: rie,
		Vcy: iie,
		vcy: oie,
		vdash: sie,
		vDash: lie,
		Vdash: aie,
		VDash: cie,
		Vdashl: uie,
		veebar: fie,
		vee: die,
		Vee: hie,
		veeeq: pie,
		vellip: gie,
		verbar: vie,
		Verbar: mie,
		vert: yie,
		Vert: bie,
		VerticalBar: wie,
		VerticalLine: xie,
		VerticalSeparator: Sie,
		VerticalTilde: _ie,
		VeryThinSpace: kie,
		Vfr: Tie,
		vfr: Cie,
		vltri: Eie,
		vnsub: Lie,
		vnsup: Aie,
		Vopf: Mie,
		vopf: Nie,
		vprop: $ie,
		vrtri: Pie,
		Vscr: Oie,
		vscr: Rie,
		vsubnE: Die,
		vsubne: zie,
		vsupnE: Iie,
		vsupne: Fie,
		Vvdash: Hie,
		vzigzag: qie,
		Wcirc: Bie,
		wcirc: Wie,
		wedbar: Uie,
		wedge: Vie,
		Wedge: jie,
		wedgeq: Gie,
		weierp: Kie,
		Wfr: Xie,
		wfr: Yie,
		Wopf: Zie,
		wopf: Jie,
		wp: Qie,
		wr: eoe,
		wreath: toe,
		Wscr: noe,
		wscr: roe,
		xcap: ioe,
		xcirc: ooe,
		xcup: soe,
		xdtri: loe,
		Xfr: aoe,
		xfr: coe,
		xharr: uoe,
		xhArr: foe,
		Xi: doe,
		xi: hoe,
		xlarr: poe,
		xlArr: goe,
		xmap: voe,
		xnis: moe,
		xodot: yoe,
		Xopf: boe,
		xopf: woe,
		xoplus: xoe,
		xotime: Soe,
		xrarr: _oe,
		xrArr: koe,
		Xscr: Toe,
		xscr: Coe,
		xsqcup: Eoe,
		xuplus: Loe,
		xutri: Aoe,
		xvee: Moe,
		xwedge: Noe,
		Yacute: $oe,
		yacute: Poe,
		YAcy: Ooe,
		yacy: Roe,
		Ycirc: Doe,
		ycirc: zoe,
		Ycy: Ioe,
		ycy: Foe,
		yen: Hoe,
		Yfr: qoe,
		yfr: Boe,
		YIcy: Woe,
		yicy: Uoe,
		Yopf: Voe,
		yopf: joe,
		Yscr: Goe,
		yscr: Koe,
		YUcy: Xoe,
		yucy: Yoe,
		yuml: Zoe,
		Yuml: Joe,
		Zacute: Qoe,
		zacute: ese,
		Zcaron: tse,
		zcaron: nse,
		Zcy: rse,
		zcy: ise,
		Zdot: ose,
		zdot: sse,
		zeetrf: lse,
		ZeroWidthSpace: ase,
		Zeta: cse,
		zeta: use,
		zfr: fse,
		Zfr: dse,
		ZHcy: hse,
		zhcy: pse,
		zigrarr: gse,
		zopf: vse,
		Zopf: mse,
		Zscr: yse,
		zscr: bse,
		zwj: wse,
		zwnj: xse,
	},
	Sse = "Á",
	_se = "á",
	kse = "Â",
	Tse = "â",
	Cse = "´",
	Ese = "Æ",
	Lse = "æ",
	Ase = "À",
	Mse = "à",
	Nse = "&",
	$se = "&",
	Pse = "Å",
	Ose = "å",
	Rse = "Ã",
	Dse = "ã",
	zse = "Ä",
	Ise = "ä",
	Fse = "¦",
	Hse = "Ç",
	qse = "ç",
	Bse = "¸",
	Wse = "¢",
	Use = "©",
	Vse = "©",
	jse = "¤",
	Gse = "°",
	Kse = "÷",
	Xse = "É",
	Yse = "é",
	Zse = "Ê",
	Jse = "ê",
	Qse = "È",
	ele = "è",
	tle = "Ð",
	nle = "ð",
	rle = "Ë",
	ile = "ë",
	ole = "½",
	sle = "¼",
	lle = "¾",
	ale = ">",
	cle = ">",
	ule = "Í",
	fle = "í",
	dle = "Î",
	hle = "î",
	ple = "¡",
	gle = "Ì",
	vle = "ì",
	mle = "¿",
	yle = "Ï",
	ble = "ï",
	wle = "«",
	xle = "<",
	Sle = "<",
	_le = "¯",
	kle = "µ",
	Tle = "·",
	Cle = " ",
	Ele = "¬",
	Lle = "Ñ",
	Ale = "ñ",
	Mle = "Ó",
	Nle = "ó",
	$le = "Ô",
	Ple = "ô",
	Ole = "Ò",
	Rle = "ò",
	Dle = "ª",
	zle = "º",
	Ile = "Ø",
	Fle = "ø",
	Hle = "Õ",
	qle = "õ",
	Ble = "Ö",
	Wle = "ö",
	Ule = "¶",
	Vle = "±",
	jle = "£",
	Gle = '"',
	Kle = '"',
	Xle = "»",
	Yle = "®",
	Zle = "®",
	Jle = "§",
	Qle = "­",
	eae = "¹",
	tae = "²",
	nae = "³",
	rae = "ß",
	iae = "Þ",
	oae = "þ",
	sae = "×",
	lae = "Ú",
	aae = "ú",
	cae = "Û",
	uae = "û",
	fae = "Ù",
	dae = "ù",
	hae = "¨",
	pae = "Ü",
	gae = "ü",
	vae = "Ý",
	mae = "ý",
	yae = "¥",
	bae = "ÿ",
	wae = {
		Aacute: Sse,
		aacute: _se,
		Acirc: kse,
		acirc: Tse,
		acute: Cse,
		AElig: Ese,
		aelig: Lse,
		Agrave: Ase,
		agrave: Mse,
		amp: Nse,
		AMP: $se,
		Aring: Pse,
		aring: Ose,
		Atilde: Rse,
		atilde: Dse,
		Auml: zse,
		auml: Ise,
		brvbar: Fse,
		Ccedil: Hse,
		ccedil: qse,
		cedil: Bse,
		cent: Wse,
		copy: Use,
		COPY: Vse,
		curren: jse,
		deg: Gse,
		divide: Kse,
		Eacute: Xse,
		eacute: Yse,
		Ecirc: Zse,
		ecirc: Jse,
		Egrave: Qse,
		egrave: ele,
		ETH: tle,
		eth: nle,
		Euml: rle,
		euml: ile,
		frac12: ole,
		frac14: sle,
		frac34: lle,
		gt: ale,
		GT: cle,
		Iacute: ule,
		iacute: fle,
		Icirc: dle,
		icirc: hle,
		iexcl: ple,
		Igrave: gle,
		igrave: vle,
		iquest: mle,
		Iuml: yle,
		iuml: ble,
		laquo: wle,
		lt: xle,
		LT: Sle,
		macr: _le,
		micro: kle,
		middot: Tle,
		nbsp: Cle,
		not: Ele,
		Ntilde: Lle,
		ntilde: Ale,
		Oacute: Mle,
		oacute: Nle,
		Ocirc: $le,
		ocirc: Ple,
		Ograve: Ole,
		ograve: Rle,
		ordf: Dle,
		ordm: zle,
		Oslash: Ile,
		oslash: Fle,
		Otilde: Hle,
		otilde: qle,
		Ouml: Ble,
		ouml: Wle,
		para: Ule,
		plusmn: Vle,
		pound: jle,
		quot: Gle,
		QUOT: Kle,
		raquo: Xle,
		reg: Yle,
		REG: Zle,
		sect: Jle,
		shy: Qle,
		sup1: eae,
		sup2: tae,
		sup3: nae,
		szlig: rae,
		THORN: iae,
		thorn: oae,
		times: sae,
		Uacute: lae,
		uacute: aae,
		Ucirc: cae,
		ucirc: uae,
		Ugrave: fae,
		ugrave: dae,
		uml: hae,
		Uuml: pae,
		uuml: gae,
		Yacute: vae,
		yacute: mae,
		yen: yae,
		yuml: bae,
	},
	xae = "&",
	Sae = "'",
	_ae = ">",
	kae = "<",
	Tae = '"',
	yw = { amp: xae, apos: Sae, gt: _ae, lt: kae, quot: Tae };
const Gh = {};
const Cae = {
	0: 65_533,
	128: 8364,
	130: 8218,
	131: 402,
	132: 8222,
	133: 8230,
	134: 8224,
	135: 8225,
	136: 710,
	137: 8240,
	138: 352,
	139: 8249,
	140: 338,
	142: 381,
	145: 8216,
	146: 8217,
	147: 8220,
	148: 8221,
	149: 8226,
	150: 8211,
	151: 8212,
	152: 732,
	153: 8482,
	154: 353,
	155: 8250,
	156: 339,
	158: 382,
	159: 376,
};
const Eae =
	(Oo && Oo.__importDefault) ||
	((e) => (e && e.__esModule ? e : { default: e }));
Object.defineProperty(Gh, "__esModule", { value: !0 });
const Pm = Eae(Cae),
	Lae =
		String.fromCodePoint ||
		((e) => {
			let t = "";
			return (
				e > 65_535 &&
					((e -= 65_536),
					(t += String.fromCodePoint(((e >>> 10) & 1023) | 55_296)),
					(e = 56_320 | (e & 1023))),
				(t += String.fromCodePoint(e)),
				t
			);
		});
function Aae(e) {
	return (e >= 55_296 && e <= 57_343) || e > 1_114_111
		? "�"
		: (e in Pm.default && (e = Pm.default[e]), Lae(e));
}
Gh.default = Aae;
const Hu =
	(Oo && Oo.__importDefault) ||
	((e) => (e && e.__esModule ? e : { default: e }));
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.decodeHTML = pi.decodeHTMLStrict = pi.decodeXML = void 0;
const jd = Hu(mw),
	Mae = Hu(wae),
	Nae = Hu(yw),
	Om = Hu(Gh),
	$ae = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
pi.decodeXML = bw(Nae.default);
pi.decodeHTMLStrict = bw(jd.default);
function bw(e) {
	const t = ww(e);
	return (r) => String(r).replace($ae, t);
}
const Rm = (e, t) => (e < t ? 1 : -1);
pi.decodeHTML = (() => {
	for (
		var e = Object.keys(Mae.default).sort(Rm),
			t = Object.keys(jd.default).sort(Rm),
			r = 0,
			o = 0;
		r < t.length;
		r++
	) {
		e[o] === t[r] ? ((t[r] += ";?"), o++) : (t[r] += ";");
	}
	const s = new RegExp(
			"&(?:" + t.join("|") + String.raw`|#[xX][\da-fA-F]+;?|#\d+;?)`,
			"g",
		),
		c = ww(jd.default);
	function f(d) {
		return d.slice(-1) !== ";" && (d += ";"), c(d);
	}
	return (d) => String(d).replace(s, f);
})();
function ww(e) {
	return (r) => {
		if (r.charAt(1) === "#") {
			const o = r.charAt(2);
			return o === "X" || o === "x"
				? Om.default(Number.parseInt(r.slice(3), 16))
				: Om.default(Number.parseInt(r.slice(2), 10));
		}
		return e[r.slice(1, -1)] || r;
	};
}
const Xn = {},
	xw =
		(Oo && Oo.__importDefault) ||
		((e) => (e && e.__esModule ? e : { default: e }));
Object.defineProperty(Xn, "__esModule", { value: !0 });
Xn.escapeUTF8 =
	Xn.escape =
	Xn.encodeNonAsciiHTML =
	Xn.encodeHTML =
	Xn.encodeXML =
		void 0;
const Pae = xw(yw),
	Sw = kw(Pae.default),
	_w = Tw(Sw);
Xn.encodeXML = Lw(Sw);
const Oae = xw(mw),
	Kh = kw(Oae.default),
	Rae = Tw(Kh);
Xn.encodeHTML = zae(Kh, Rae);
Xn.encodeNonAsciiHTML = Lw(Kh);
function kw(e) {
	return Object.keys(e)
		.sort()
		.reduce((t, r) => ((t[e[r]] = "&" + r + ";"), t), {});
}
function Tw(e) {
	for (var t = [], r = [], o = 0, s = Object.keys(e); o < s.length; o++) {
		const c = s[o];
		c.length === 1 ? t.push("\\" + c) : r.push(c);
	}
	t.sort();
	for (let f = 0; f < t.length - 1; f++) {
		for (
			var d = f;
			d < t.length - 1 && t[d].codePointAt(1) + 1 === t[d + 1].codePointAt(1);
		) {
			d += 1;
		}
		const h = 1 + d - f;
		h < 3 || t.splice(f, h, t[f] + "-" + t[d]);
	}
	return r.unshift("[" + t.join("") + "]"), new RegExp(r.join("|"), "g");
}
const Cw =
		/(?:[\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g,
	Dae =
		String.prototype.codePointAt != undefined
			? (e) => e.codePointAt(0)
			: (e) =>
					(e.codePointAt(0) - 55_296) * 1024 +
					e.codePointAt(1) -
					56_320 +
					65_536;
function qu(e) {
	return (
		"&#x" +
		(e.length > 1 ? Dae(e) : e.codePointAt(0)).toString(16).toUpperCase() +
		";"
	);
}
function zae(e, t) {
	return (r) => r.replace(t, (o) => e[o]).replace(Cw, qu);
}
const Ew = new RegExp(_w.source + "|" + Cw.source, "g");
function Iae(e) {
	return e.replace(Ew, qu);
}
Xn.escape = Iae;
function Fae(e) {
	return e.replace(_w, qu);
}
Xn.escapeUTF8 = Fae;
function Lw(e) {
	return (t) => t.replace(Ew, (r) => e[r] || qu(r));
}
((e) => {
	Object.defineProperty(e, "__esModule", { value: !0 }),
		(e.decodeXMLStrict =
			e.decodeHTML5Strict =
			e.decodeHTML4Strict =
			e.decodeHTML5 =
			e.decodeHTML4 =
			e.decodeHTMLStrict =
			e.decodeHTML =
			e.decodeXML =
			e.encodeHTML5 =
			e.encodeHTML4 =
			e.escapeUTF8 =
			e.escape =
			e.encodeNonAsciiHTML =
			e.encodeHTML =
			e.encodeXML =
			e.encode =
			e.decodeStrict =
			e.decode =
				void 0);
	const t = pi,
		r = Xn;
	function o(h, p) {
		return (!p || p <= 0 ? t.decodeXML : t.decodeHTML)(h);
	}
	e.decode = o;
	function s(h, p) {
		return (!p || p <= 0 ? t.decodeXML : t.decodeHTMLStrict)(h);
	}
	e.decodeStrict = s;
	function c(h, p) {
		return (!p || p <= 0 ? r.encodeXML : r.encodeHTML)(h);
	}
	e.encode = c;
	const f = Xn;
	Object.defineProperty(e, "encodeXML", {
		enumerable: !0,
		get() {
			return f.encodeXML;
		},
	}),
		Object.defineProperty(e, "encodeHTML", {
			enumerable: !0,
			get() {
				return f.encodeHTML;
			},
		}),
		Object.defineProperty(e, "encodeNonAsciiHTML", {
			enumerable: !0,
			get() {
				return f.encodeNonAsciiHTML;
			},
		}),
		Object.defineProperty(e, "escape", {
			enumerable: !0,
			get() {
				return f.escape;
			},
		}),
		Object.defineProperty(e, "escapeUTF8", {
			enumerable: !0,
			get() {
				return f.escapeUTF8;
			},
		}),
		Object.defineProperty(e, "encodeHTML4", {
			enumerable: !0,
			get() {
				return f.encodeHTML;
			},
		}),
		Object.defineProperty(e, "encodeHTML5", {
			enumerable: !0,
			get() {
				return f.encodeHTML;
			},
		});
	const d = pi;
	Object.defineProperty(e, "decodeXML", {
		enumerable: !0,
		get() {
			return d.decodeXML;
		},
	}),
		Object.defineProperty(e, "decodeHTML", {
			enumerable: !0,
			get() {
				return d.decodeHTML;
			},
		}),
		Object.defineProperty(e, "decodeHTMLStrict", {
			enumerable: !0,
			get() {
				return d.decodeHTMLStrict;
			},
		}),
		Object.defineProperty(e, "decodeHTML4", {
			enumerable: !0,
			get() {
				return d.decodeHTML;
			},
		}),
		Object.defineProperty(e, "decodeHTML5", {
			enumerable: !0,
			get() {
				return d.decodeHTML;
			},
		}),
		Object.defineProperty(e, "decodeHTML4Strict", {
			enumerable: !0,
			get() {
				return d.decodeHTMLStrict;
			},
		}),
		Object.defineProperty(e, "decodeHTML5Strict", {
			enumerable: !0,
			get() {
				return d.decodeHTMLStrict;
			},
		}),
		Object.defineProperty(e, "decodeXMLStrict", {
			enumerable: !0,
			get() {
				return d.decodeXML;
			},
		});
})(vw);
function Hae(e, t) {
	if (!(e instanceof t)) {
		throw new TypeError("Cannot call a class as a function");
	}
}
function qae(e, t) {
	for (let r = 0; r < t.length; r++) {
		const o = t[r];
		(o.enumerable = o.enumerable || !1),
			(o.configurable = !0),
			"value" in o && (o.writable = !0),
			Object.defineProperty(e, o.key, o);
	}
}
function Bae(e, t, r) {
	return t && qae(e.prototype, t), e;
}
function Aw(e, t) {
	let r = (typeof Symbol < "u" && e[Symbol.iterator]) || e["@@iterator"];
	if (!r) {
		if (Array.isArray(e) || (r = Wae(e)) || t) {
			r && (e = r);
			let o = 0,
				s = () => {};
			return {
				s,
				n() {
					return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
				},
				e(p) {
					throw p;
				},
				f: s,
			};
		}
		throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
	}
	let c = !0,
		f = !1,
		d;
	return {
		s() {
			r = r.call(e);
		},
		n() {
			const p = r.next();
			return (c = p.done), p;
		},
		e(p) {
			(f = !0), (d = p);
		},
		f() {
			try {
				!c && r.return != undefined && r.return();
			} finally {
				if (f) {
					throw d;
				}
			}
		},
	};
}
function Wae(e, t) {
	if (e) {
		if (typeof e === "string") {
			return Dm(e, t);
		}
		let r = Object.prototype.toString.call(e).slice(8, -1);
		if (
			(r === "Object" && e.constructor && (r = e.constructor.name),
			r === "Map" || r === "Set")
		) {
			return [...e];
		}
		if (
			r === "Arguments" ||
			/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
		) {
			return Dm(e, t);
		}
	}
}
function Dm(e, t) {
	(t == undefined || t > e.length) && (t = e.length);
	for (var r = 0, o = new Array(t); r < t; r++) {
		o[r] = e[r];
	}
	return o;
}
const Uae = vw,
	zm = {
		fg: "#FFF",
		bg: "#000",
		newline: !1,
		escapeXML: !1,
		stream: !1,
		colors: Vae(),
	};
function Vae() {
	const e = {
		0: "#000",
		1: "#A00",
		2: "#0A0",
		3: "#A50",
		4: "#00A",
		5: "#A0A",
		6: "#0AA",
		7: "#AAA",
		8: "#555",
		9: "#F55",
		10: "#5F5",
		11: "#FF5",
		12: "#55F",
		13: "#F5F",
		14: "#5FF",
		15: "#FFF",
	};
	return (
		gc(0, 5).forEach((t) => {
			gc(0, 5).forEach((r) => {
				gc(0, 5).forEach((o) => jae(t, r, o, e));
			});
		}),
		gc(0, 23).forEach((t) => {
			const r = t + 232,
				o = Mw(t * 10 + 8);
			e[r] = "#" + o + o + o;
		}),
		e
	);
}
function jae(e, t, r, o) {
	const s = 16 + e * 36 + t * 6 + r,
		c = e > 0 ? e * 40 + 55 : 0,
		f = t > 0 ? t * 40 + 55 : 0,
		d = r > 0 ? r * 40 + 55 : 0;
	o[s] = Gae([c, f, d]);
}
function Mw(e) {
	for (var t = e.toString(16); t.length < 2; ) {
		t = "0" + t;
	}
	return t;
}
function Gae(e) {
	let t = [],
		r = Aw(e),
		o;
	try {
		for (r.s(); !(o = r.n()).done; ) {
			const s = o.value;
			t.push(Mw(s));
		}
	} catch (error) {
		r.e(error);
	} finally {
		r.f();
	}
	return "#" + t.join("");
}
function Im(e, t, r, o) {
	let s;
	return (
		t === "text"
			? (s = Zae(r, o))
			: t === "display"
				? (s = Xae(e, r, o))
				: t === "xterm256Foreground"
					? (s = Mc(e, o.colors[r]))
					: t === "xterm256Background"
						? (s = Nc(e, o.colors[r]))
						: t === "rgb" && (s = Kae(e, r)),
		s
	);
}
function Kae(e, t) {
	t = t.slice(2).slice(0, -1);
	const r = +t.slice(0, 2),
		o = t.slice(5).split(";"),
		s = o.map((c) => ("0" + Number(c).toString(16)).slice(-2)).join("");
	return Ac(e, (r === 38 ? "color:#" : "background-color:#") + s);
}
function Xae(e, t, r) {
	t = Number.parseInt(t, 10);
	let o = {
			"-1"() {
				return "<br/>";
			},
			0() {
				return e.length && Nw(e);
			},
			1() {
				return ji(e, "b");
			},
			3() {
				return ji(e, "i");
			},
			4() {
				return ji(e, "u");
			},
			8() {
				return Ac(e, "display:none");
			},
			9() {
				return ji(e, "strike");
			},
			22() {
				return Ac(
					e,
					"font-weight:normal;text-decoration:none;font-style:normal",
				);
			},
			23() {
				return Hm(e, "i");
			},
			24() {
				return Hm(e, "u");
			},
			39() {
				return Mc(e, r.fg);
			},
			49() {
				return Nc(e, r.bg);
			},
			53() {
				return Ac(e, "text-decoration:overline");
			},
		},
		s;
	return (
		o[t]
			? (s = o[t]())
			: t > 4 && t < 7
				? (s = ji(e, "blink"))
				: t > 29 && t < 38
					? (s = Mc(e, r.colors[t - 30]))
					: t > 39 && t < 48
						? (s = Nc(e, r.colors[t - 40]))
						: t > 89 && t < 98
							? (s = Mc(e, r.colors[8 + (t - 90)]))
							: t > 99 && t < 108 && (s = Nc(e, r.colors[8 + (t - 100)])),
		s
	);
}
function Nw(e) {
	const t = [...e];
	return (
		(e.length = 0),
		t
			.reverse()
			.map((r) => "</" + r + ">")
			.join("")
	);
}
function gc(e, t) {
	for (var r = [], o = e; o <= t; o++) {
		r.push(o);
	}
	return r;
}
function Yae(e) {
	return (t) => (e === null || t.category !== e) && e !== "all";
}
function Fm(e) {
	e = Number.parseInt(e, 10);
	let t;
	return (
		e === 0
			? (t = "all")
			: e === 1
				? (t = "bold")
				: e > 2 && e < 5
					? (t = "underline")
					: e > 4 && e < 7
						? (t = "blink")
						: e === 8
							? (t = "hide")
							: e === 9
								? (t = "strike")
								: (e > 29 && e < 38) || e === 39 || (e > 89 && e < 98)
									? (t = "foreground-color")
									: ((e > 39 && e < 48) || e === 49 || (e > 99 && e < 108)) &&
										(t = "background-color"),
		t
	);
}
function Zae(e, t) {
	return t.escapeXML ? Uae.encodeXML(e) : e;
}
function ji(e, t, r) {
	return (
		r || (r = ""),
		e.push(t),
		"<".concat(t).concat(r ? ' style="'.concat(r, '"') : "", ">")
	);
}
function Ac(e, t) {
	return ji(e, "span", t);
}
function Mc(e, t) {
	return ji(e, "span", "color:" + t);
}
function Nc(e, t) {
	return ji(e, "span", "background-color:" + t);
}
function Hm(e, t) {
	let r;
	if ((e.slice(-1)[0] === t && (r = e.pop()), r)) {
		return "</" + t + ">";
	}
}
function Jae(e, t, r) {
	let o = !1,
		s = 3;
	function c() {
		return "";
	}
	function f(z, W) {
		return r("xterm256Foreground", W), "";
	}
	function d(z, W) {
		return r("xterm256Background", W), "";
	}
	function h(z) {
		return t.newline ? r("display", -1) : r("text", z), "";
	}
	function p(z, W) {
		(o = !0),
			W.trim().length === 0 && (W = "0"),
			(W = W.trimRight(";").split(";"));
		let U = Aw(W),
			re;
		try {
			for (U.s(); !(re = U.n()).done; ) {
				const Q = re.value;
				r("display", Q);
			}
		} catch (error) {
			U.e(error);
		} finally {
			U.f();
		}
		return "";
	}
	function v(z) {
		return r("text", z), "";
	}
	function m(z) {
		return r("rgb", z), "";
	}
	const b = [
		{ pattern: /^\u0008+/, sub: c },
		{ pattern: /^\u001B\[[012]?K/, sub: c },
		{ pattern: /^\u001B\[\(B/, sub: c },
		{ pattern: /^\u001B\[[34]8;2;\d+;\d+;\d+m/, sub: m },
		{ pattern: /^\u001B\[38;5;(\d+)m/, sub: f },
		{ pattern: /^\u001B\[48;5;(\d+)m/, sub: d },
		{ pattern: /^\n/, sub: h },
		{ pattern: /^\r+\n/, sub: h },
		{ pattern: /^\r/, sub: h },
		{ pattern: /^\u001B\[((?:\d{1,3};?)+|)m/, sub: p },
		{ pattern: /^\u001B\[\d?J/, sub: c },
		{ pattern: /^\u001B\[\d{0,3};\d{0,3}f/, sub: c },
		{ pattern: /^\u001B\[?[\d;]{0,3}/, sub: c },
		{ pattern: /^(([^\u001B\u0008\r\n])+)/, sub: v },
	];
	function w(z, W) {
		(W > s && o) || ((o = !1), (e = e.replace(z.pattern, z.sub)));
	}
	let M = [],
		C = e,
		E = C.length;
	e: while (E > 0) {
		for (let L = 0, N = 0, P = b.length; N < P; L = ++N) {
			const A = b[L];
			if ((w(A, L), e.length !== E)) {
				E = e.length;
				continue e;
			}
		}
		if (e.length === E) {
			break;
		}
		M.push(0), (E = e.length);
	}
	return M;
}
function Qae(e, t, r) {
	return (
		t !== "text" &&
			((e = e.filter(Yae(Fm(r)))),
			e.push({ token: t, data: r, category: Fm(r) })),
		e
	);
}
const ece = (() => {
		function e(t) {
			Hae(this, e),
				(t = t || {}),
				t.colors && (t.colors = { ...zm.colors, ...t.colors }),
				(this.options = { ...zm, ...t }),
				(this.stack = []),
				(this.stickyStack = []);
		}
		return (
			Bae(e, [
				{
					key: "toHtml",
					value(r) {
						r = typeof r === "string" ? [r] : r;
						const s = this.stack,
							c = this.options,
							f = [];
						return (
							this.stickyStack.forEach((d) => {
								const h = Im(s, d.token, d.data, c);
								h && f.push(h);
							}),
							Jae(r.join(""), c, (d, h) => {
								const p = Im(s, d, h, c);
								p && f.push(p),
									c.stream && (this.stickyStack = Qae(this.stickyStack, d, h));
							}),
							s.length && f.push(Nw(s)),
							f.join("")
						);
					},
				},
			]),
			e
		);
	})(),
	tce = ece;
const nce = gw(tce);
function rce(e, t) {
	return t && e.endsWith(t);
}
async function $w(e, t, r) {
	const o = encodeURI(`${e}:${t}:${r}`);
	await fetch(`/__open-in-editor?file=${o}`);
}
function Xh(e) {
	return new nce({ fg: e ? "#FFF" : "#000", bg: e ? "#000" : "#FFF" });
}
function ice(e) {
	return e === null || (typeof e !== "function" && typeof e !== "object");
}
function Pw(e) {
	let t = e;
	if (
		(ice(e) &&
			(t = { message: String(t).split(/\n/g)[0], stack: String(t), name: "" }),
		!e)
	) {
		const r = new Error("unknown error");
		t = { message: r.message, stack: r.stack, name: "" };
	}
	return (
		(t.stacks = nA(t.stack || t.stackStr || "", { ignoreStackEntries: [] })), t
	);
}
const Yn = Uint8Array,
	ms = Uint16Array,
	oce = Int32Array,
	Ow = new Yn([
		0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
		5, 5, 5, 0, 0, 0, 0,
	]),
	Rw = new Yn([
		0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
		11, 11, 12, 12, 13, 13, 0, 0,
	]),
	sce = new Yn([
		16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
	]),
	Dw = (e, t) => {
		for (var r = new ms(31), o = 0; o < 31; ++o) {
			r[o] = t += 1 << e[o - 1];
		}
		for (var s = new oce(r[30]), o = 1; o < 30; ++o) {
			for (let c = r[o]; c < r[o + 1]; ++c) {
				s[c] = ((c - r[o]) << 5) | o;
			}
		}
		return { b: r, r: s };
	},
	zw = Dw(Ow, 2),
	Iw = zw.b,
	lce = zw.r;
(Iw[28] = 258), (lce[258] = 28);
const ace = Dw(Rw, 0),
	cce = ace.b,
	Gd = new ms(32_768);
for (var Et = 0; Et < 32_768; ++Et) {
	let Di = ((Et & 43_690) >> 1) | ((Et & 21_845) << 1);
	(Di = ((Di & 52_428) >> 2) | ((Di & 13_107) << 2)),
		(Di = ((Di & 61_680) >> 4) | ((Di & 3855) << 4)),
		(Gd[Et] = (((Di & 65_280) >> 8) | ((Di & 255) << 8)) >> 1);
}
const Hl = (e, t, r) => {
		for (var o = e.length, s = 0, c = new ms(t); s < o; ++s) {
			e[s] && ++c[e[s] - 1];
		}
		const f = new ms(t);
		for (s = 1; s < t; ++s) {
			f[s] = (f[s - 1] + c[s - 1]) << 1;
		}
		let d;
		if (r) {
			d = new ms(1 << t);
			const h = 15 - t;
			for (s = 0; s < o; ++s) {
				if (e[s]) {
					for (
						let p = (s << 4) | e[s],
							v = t - e[s],
							m = f[e[s] - 1]++ << v,
							b = m | ((1 << v) - 1);
						m <= b;
						++m
					) {
						d[Gd[m] >> h] = p;
					}
				}
			}
		} else {
			for (d = new ms(o), s = 0; s < o; ++s)
				{e[s] && (d[s] = Gd[f[e[s] - 1]++] >> (15 - e[s]));}
		}
		return d;
	},
	xa = new Yn(288);
for (var Et = 0; Et < 144; ++Et) {
	xa[Et] = 8;
}
for (var Et = 144; Et < 256; ++Et) {
	xa[Et] = 9;
}
for (var Et = 256; Et < 280; ++Et) {
	xa[Et] = 7;
}
for (var Et = 280; Et < 288; ++Et) {
	xa[Et] = 8;
}
const Fw = new Yn(32);
for (var Et = 0; Et < 32; ++Et) {
	Fw[Et] = 5;
}
const uce = Hl(xa, 9, 1),
	fce = Hl(Fw, 5, 1),
	od = (e) => {
		for (var t = e[0], r = 1; r < e.length; ++r) {
			e[r] > t && (t = e[r]);
		}
		return t;
	},
	yr = (e, t, r) => {
		const o = (t / 8) | 0;
		return ((e[o] | (e[o + 1] << 8)) >> (t & 7)) & r;
	},
	sd = (e, t) => {
		const r = (t / 8) | 0;
		return (e[r] | (e[r + 1] << 8) | (e[r + 2] << 16)) >> (t & 7);
	},
	dce = (e) => ((e + 7) / 8) | 0,
	Hw = (e, t, r) => (
		(t == undefined || t < 0) && (t = 0),
		(r == undefined || r > e.length) && (r = e.length),
		new Yn(e.subarray(t, r))
	),
	hce = [
		"unexpected EOF",
		"invalid block type",
		"invalid length/literal",
		"invalid distance",
		"stream finished",
		"no stream handler",
		,
		"no callback",
		"invalid UTF-8 data",
		"extra field too long",
		"date not in range 1980-2099",
		"filename too long",
		"stream finishing",
		"invalid zip data",
	],
	Dn = (e, t, r) => {
		const o = new Error(t || hce[e]);
		if (
			((o.code = e),
			Error.captureStackTrace && Error.captureStackTrace(o, Dn),
			!r)
		) {
			throw o;
		}
		return o;
	},
	Yh = (e, t, r, o) => {
		const s = e.length,
			c = 0;
		if (!s || (t.f && !t.l)) {
			return r || new Yn(0);
		}
		const f = !r,
			d = f || t.i != 2,
			h = t.i;
		f && (r = new Yn(s * 3));
		let p = (Ee) => {
				const Ze = r.length;
				if (Ee > Ze) {
					const O = new Yn(Math.max(Ze * 2, Ee));
					O.set(r), (r = O);
				}
			},
			v = t.f || 0,
			m = t.p || 0,
			b = t.b || 0,
			w = t.l,
			M = t.d,
			C = t.m,
			E = t.n,
			L = s * 8;
		do {
			if (!w) {
				v = yr(e, m, 1);
				const N = yr(e, m + 1, 3);
				if (((m += 3), N)) {
					if (N == 1) {
						(w = uce), (M = fce), (C = 9), (E = 5);
					} else if (N == 2) {
						const W = yr(e, m, 31) + 257,
							U = yr(e, m + 10, 15) + 4,
							re = W + yr(e, m + 5, 31) + 1;
						m += 14;
						for (var Q = new Yn(re), G = new Yn(19), te = 0; te < U; ++te) {
							G[sce[te]] = yr(e, m + te * 3, 7);
						}
						m += U * 3;
						for (
							var Z = od(G), q = (1 << Z) - 1, F = Hl(G, Z, 1), te = 0;
							te < re;
						) {
							const k = F[yr(e, m, q)];
							m += k & 15;
							var P = k >> 4;
							if (P < 16) {
								Q[te++] = P;
							} else {
								var B = 0,
									V = 0;
								for (
									P == 16
										? ((V = 3 + yr(e, m, 3)), (m += 2), (B = Q[te - 1]))
										: (P == 17
											? ((V = 3 + yr(e, m, 7)), (m += 3))
											: P == 18 && ((V = 11 + yr(e, m, 127)), (m += 7)));
									V--;
								) {
									Q[te++] = B;
								}
							}
						}
						var ie = Q.subarray(0, W),
							ye = Q.subarray(W);
						(C = od(ie)), (E = od(ye)), (w = Hl(ie, C, 1)), (M = Hl(ye, E, 1));
					} else {
						Dn(1);
					}
				} else {
					var P = dce(m) + 4,
						A = e[P - 4] | (e[P - 3] << 8),
						z = P + A;
					if (z > s) {
						h && Dn(0);
						break;
					}
					d && p(b + A),
						r.set(e.subarray(P, z), b),
						(t.b = b += A),
						(t.p = m = z * 8),
						(t.f = v);
					continue;
				}
				if (m > L) {
					h && Dn(0);
					break;
				}
			}
			d && p(b + 131_072);
			for (var Ne = (1 << C) - 1, Ue = (1 << E) - 1, je = m; ; je = m) {
				var B = w[sd(e, m) & Ne],
					it = B >> 4;
				if (((m += B & 15), m > L)) {
					h && Dn(0);
					break;
				}
				if ((B || Dn(2), it < 256)) {
					r[b++] = it;
				} else if (it == 256) {
					(je = m), (w = undefined);
					break;
				} else {
					let tt = it - 254;
					if (it > 264) {
						var te = it - 257,
							Je = Ow[te];
						(tt = yr(e, m, (1 << Je) - 1) + Iw[te]), (m += Je);
					}
					const Ae = M[sd(e, m) & Ue],
						X = Ae >> 4;
					Ae || Dn(3), (m += Ae & 15);
					var ye = cce[X];
					if (X > 3) {
						var Je = Rw[X];
						(ye += sd(e, m) & ((1 << Je) - 1)), (m += Je);
					}
					if (m > L) {
						h && Dn(0);
						break;
					}
					d && p(b + 131_072);
					const ae = b + tt;
					if (b < ye) {
						const de = c - ye,
							$e = Math.min(ye, ae);
						for (de + b < 0 && Dn(3); b < $e; ++b) {
							r[b] = o[de + b];
						}
					}
					for (; b < ae; ++b) {
						r[b] = r[b - ye];
					}
				}
			}
			(t.l = w),
				(t.p = je),
				(t.b = b),
				(t.f = v),
				w && ((v = 1), (t.m = C), (t.d = M), (t.n = E));
		} while (!v);
		return b != r.length && f ? Hw(r, 0, b) : r.subarray(0, b);
	},
	pce = new Yn(0),
	gce = (e) => {
		(e[0] != 31 || e[1] != 139 || e[2] != 8) && Dn(6, "invalid gzip data");
		let t = e[3],
			r = 10;
		t & 4 && (r += (e[10] | (e[11] << 8)) + 2);
		for (let o = ((t >> 3) & 1) + ((t >> 4) & 1); o > 0; o -= !e[r++]) {}
		return r + (t & 2);
	},
	vce = (e) => {
		const t = e.length;
		return (
			(e[t - 4] | (e[t - 3] << 8) | (e[t - 2] << 16) | (e[t - 1] << 24)) >>> 0
		);
	},
	mce = (e, t) => (
		((e[0] & 15) != 8 || e[0] >> 4 > 7 || ((e[0] << 8) | e[1]) % 31) &&
			Dn(6, "invalid zlib data"),
		((e[1] >> 5) & 1) == +!t &&
			Dn(
				6,
				"invalid zlib data: " +
					(e[1] & 32 ? "need" : "unexpected") +
					" dictionary",
			),
		((e[1] >> 3) & 4) + 2
	);
function yce(e, t) {
	return Yh(e, { i: 2 }, t, t);
}
function bce(e, t) {
	const r = gce(e);
	return (
		r + 8 > e.length && Dn(6, "invalid gzip data"),
		Yh(e.subarray(r, -8), { i: 2 }, new Yn(vce(e)), t)
	);
}
function wce(e, t) {
	return Yh(e.subarray(mce(e, t), -4), { i: 2 }, t, t);
}
function xce(e, t) {
	return e[0] == 31 && e[1] == 139 && e[2] == 8
		? bce(e, t)
		: ((e[0] & 15) != 8 || e[0] >> 4 > 7 || ((e[0] << 8) | e[1]) % 31
			? yce(e, t)
			: wce(e, t));
}
let Kd = typeof TextDecoder < "u" && new TextDecoder(),
	Sce = 0;
try {
	Kd.decode(pce, { stream: !0 }), (Sce = 1);
} catch {}
const _ce = (e) => {
	for (let t = "", r = 0; ; ) {
		let o = e[r++],
			s = (o > 127) + (o > 223) + (o > 239);
		if (r + s > e.length) {
			return { s: t, r: Hw(e, r - 1) };
		}
		s
			? s == 3
				? ((o =
						(((o & 15) << 18) |
							((e[r++] & 63) << 12) |
							((e[r++] & 63) << 6) |
							(e[r++] & 63)) -
						65_536),
					(t += String.fromCodePoint(55_296 | (o >> 10), 56_320 | (o & 1023))))
				: s & 1
					? (t += String.fromCodePoint(((o & 31) << 6) | (e[r++] & 63)))
					: (t += String.fromCodePoint(
							((o & 15) << 12) | ((e[r++] & 63) << 6) | (e[r++] & 63),
						))
			: (t += String.fromCodePoint(o));
	}
};
function kce(e, t) {
	const r;
	if (Kd) {
		return Kd.decode(e);
	}
	const o = _ce(e),
		s = o.s,
		r = o.r;
	return r.length && Dn(8), s;
}
const ld = () => {},
	kn = () => Promise.resolve();
function Tce() {
	const e = Zn({
		state: new Fb(),
		waitForConnection: f,
		reconnect: s,
		ws: new EventTarget(),
	});
	(e.state.filesMap = Zn(e.state.filesMap)),
		(e.state.idMap = Zn(e.state.idMap));
	let t;
	const r = {
		getFiles: () => t.files,
		getPaths: () => t.paths,
		getConfig: () => t.config,
		getModuleGraph: async (d, h) => {
			let p;
			return (p = t.moduleGraph[d]) == undefined ? void 0 : p[h];
		},
		getUnhandledErrors: () => t.unhandledErrors,
		getTransformResult: kn,
		onDone: ld,
		onTaskUpdate: ld,
		writeFile: kn,
		rerun: kn,
		updateSnapshot: kn,
		resolveSnapshotPath: kn,
		snapshotSaved: kn,
		onAfterSuiteRun: kn,
		onCancel: kn,
		getCountOfFailedTests: () => 0,
		sendLog: kn,
		resolveSnapshotRawPath: kn,
		readSnapshotFile: kn,
		saveSnapshotFile: kn,
		readTestFile: async (d) => t.sources[d],
		removeSnapshotFile: kn,
		onUnhandledError: ld,
		saveTestFile: kn,
		getProvidedContext: () => ({}),
		getTestFiles: kn,
	};
	e.rpc = r;
	let o;
	function s() {
		c();
	}
	async function c() {
		let v;
		const d = await fetch(window.METADATA_PATH),
			h =
				((v = d.headers.get("content-type")) == undefined
					? void 0
					: v.toLowerCase()) || "";
		if (h.includes("application/gzip") || h.includes("application/x-gzip")) {
			const m = new Uint8Array(await d.arrayBuffer()),
				b = kce(xce(m));
			t = Fd(b);
		} else {
			t = Fd(await d.text());
		}
		const p = new Event("open");
		e.ws.dispatchEvent(p);
	}
	c();
	function f() {
		return o;
	}
	return e;
}
const xt = (() =>
		Br
			? Tce()
			: tE(aL, {
					reactive: (t, r) => (r === "state" ? Zn(t) : jr(t)),
					handlers: {
						onTaskUpdate(t) {
							Ce.resumeRun(t), (iu.value = "running");
						},
						onFinished(t, r) {
							Ce.endRun(), (iu.value = "idle"), (Wi.value = (r || []).map(Pw));
						},
						onFinishedReportCoverage() {
							const t = document.querySelector("iframe#vitest-ui-coverage");
							t instanceof HTMLIFrameElement &&
								t.contentWindow &&
								t.contentWindow.location.reload();
						},
					},
				}))(),
	Bu = jr({}),
	Eo = We("CONNECTING"),
	Zt = Te(() => {
		const e = eo.value;
		return e ? lr(e) : void 0;
	}),
	qw = Te(
		() =>
			Hh(Zt.value).flatMap((e) => (e == undefined ? void 0 : e.logs) || []) ||
			[],
	);
function lr(e) {
	const t = xt.state.idMap.get(e);
	return t || void 0;
}
const Cce = Te(() => Eo.value === "OPEN"),
	ad = Te(() => Eo.value === "CONNECTING");
Te(() => Eo.value === "CLOSED");
function Ece() {
	return Zh(xt.state.getFiles());
}
function Lce(e) {
	const t = Ce.nodes;
	e.forEach((r) => {
		delete r.result,
			Hh(r).forEach((s) => {
				if ((delete s.result, t.has(s.id))) {
					const c = t.get(s.id);
					c && ((c.state = void 0), (c.duration = void 0));
				}
			});
		const o = t.get(r.id);
		o &&
			((o.state = void 0),
			(o.duration = void 0),
			Mn(o) && (o.collectDuration = void 0));
	});
}
function Zh(e) {
	return Lce(e), Ce.startRun(), xt.rpc.rerun(e.map((t) => t.filepath));
}
const Ro = window.__vitest_browser_runner__;
window.__vitest_ui_api__ = oL;
Bt(
	() => xt.ws,
	(e) => {
		(Eo.value = Br ? "OPEN" : "CONNECTING"),
			e.addEventListener("open", async () => {
				(Eo.value = "OPEN"), xt.state.filesMap.clear();
				let [t, r, o] = await Promise.all([
					xt.rpc.getFiles(),
					xt.rpc.getConfig(),
					xt.rpc.getUnhandledErrors(),
				]);
				r.standalone &&
					(t = (await xt.rpc.getTestFiles()).map(
						([{ name: c, root: f }, d]) => {
							const h = Pb(d, f, c);
							return (h.mode = "skip"), h;
						},
					)),
					Ce.loadFiles(t),
					xt.state.collectFiles(t),
					Ce.startRun(),
					(Wi.value = (o || []).map(Pw)),
					(Bu.value = r);
			}),
			e.addEventListener("close", () => {
				setTimeout(() => {
					Eo.value === "CONNECTING" && (Eo.value = "CLOSED");
				}, 1e3);
			});
	},
	{ immediate: !0 },
);
const Ace = { "text-2xl": "" },
	Mce = { "text-lg": "", op50: "" },
	Nce = ut({
		__name: "ConnectionOverlay",
		setup(e) {
			return (t, r) =>
				I(Cce)
					? Ye("", !0)
					: (oe(),
						me(
							"div",
							{
								key: 0,
								fixed: "",
								"inset-0": "",
								p2: "",
								"z-10": "",
								"select-none": "",
								text: "center sm",
								bg: "overlay",
								"backdrop-blur-sm": "",
								"backdrop-saturate-0": "",
								onClick:
									r[0] ||
									(r[0] = (...o) => I(xt).reconnect && I(xt).reconnect(...o)),
							},
							[
								Y(
									"div",
									{
										"h-full": "",
										flex: "~ col gap-2",
										"items-center": "",
										"justify-center": "",
										class: st(I(ad) ? "animate-pulse" : ""),
									},
									[
										Y(
											"div",
											{
												text: "5xl",
												class: st(
													I(ad)
														? "i-carbon:renew animate-spin animate-reverse"
														: "i-carbon-wifi-off",
												),
											},
											undefined,
											2,
										),
										Y(
											"div",
											Ace,
											He(I(ad) ? "Connecting..." : "Disconnected"),
											1,
										),
										Y(
											"div",
											Mce,
											" Check your terminal or start a new server with `" +
												He(
													I(Ro)
														? `vitest --browser=${I(Ro).config.browser.name}`
														: "vitest --ui",
												) +
												"` ",
											1,
										),
									],
									2,
								),
							],
						));
		},
	}),
	$ce = ["aria-label", "opacity", "disabled", "hover"],
	wi = ut({
		__name: "IconButton",
		props: {
			icon: {},
			title: {},
			disabled: { type: Boolean },
			active: { type: Boolean },
		},
		setup(e) {
			return (t, r) => (
				oe(),
				me(
					"button",
					{
						"aria-label": t.title,
						role: "button",
						opacity: t.disabled ? 10 : 70,
						rounded: "",
						disabled: t.disabled,
						hover: t.disabled || t.active ? "" : "bg-active op100",
						class: st([
							"w-1.4em h-1.4em flex",
							[{ "bg-gray-500:35 op100": t.active }],
						]),
					},
					[
						vn(t.$slots, "default", {}, () => [
							Y("span", { class: st(t.icon), ma: "", block: "" }, undefined, 2),
						]),
					],
					10,
					$ce,
				)
			);
		},
	}),
	Pce = { h: "full", flex: "~ col" },
	Oce = {
		p: "3",
		"h-10": "",
		flex: "~ gap-2",
		"items-center": "",
		"bg-header": "",
		border: "b base",
	},
	Rce = {
		p: "l3 y2 r2",
		flex: "~ gap-2",
		"items-center": "",
		"bg-header": "",
		border: "b-2 base",
	},
	Dce = { class: "pointer-events-none", "text-sm": "" },
	zce = { key: 0 },
	Ice = { id: "tester-container", relative: "" },
	Fce = ["data-scale"],
	qm = 20,
	Hce = 100,
	qce = ut({
		__name: "BrowserIframe",
		setup(e) {
			const t = {
				"small-mobile": [320, 568],
				"large-mobile": [414, 896],
				tablet: [834, 1112],
			};
			function r(p) {
				const v = t[p];
				return Dr.value[0] === v[0] && Dr.value[1] === v[1];
			}
			async function o(p) {
				Dr.value = t[p];
			}
			const { width: s, height: c } = Wh(),
				f = Te(() => {
					const m =
							s.value * (gn.details.size / 100) * (gn.details.browser / 100) -
							qm,
						b = c.value - Hce;
					return { width: m, height: b };
				}),
				d = Te(() => {
					const [p, v] = Dr.value,
						{ width: m, height: b } = f.value,
						w = m > p ? 1 : m / p,
						M = b > v ? 1 : b / v;
					return Math.min(1, w, M);
				}),
				h = Te(() => {
					const p = f.value.width,
						v = Dr.value[0];
					return `${Math.trunc((p + qm - v) / 2)}px`;
				});
			return (p, v) => {
				const m = wi,
					b = Gr("tooltip");
				return (
					oe(),
					me("div", Pce, [
						Y("div", Oce, [
							mt(
								Pe(
									m,
									{
										title: "Show Navigation Panel",
										"rotate-180": "",
										icon: "i-carbon:side-panel-close",
										onClick: v[0] || (v[0] = (w) => I(iL)()),
									},
									undefined,
									512,
								),
								[
									[Gi, I(gn).navigation <= 2],
									[b, "Show Navigation Panel", void 0, { bottom: !0 }],
								],
							),
							v[6] ||
								(v[6] = Y(
									"div",
									{ class: "i-carbon-content-delivery-network" },
									undefined,
									-1,
								)),
							v[7] ||
								(v[7] = Y(
									"span",
									{
										"pl-1": "",
										"font-bold": "",
										"text-sm": "",
										"flex-auto": "",
										"ws-nowrap": "",
										"overflow-hidden": "",
										truncate: "",
									},
									"Browser UI",
									-1,
								)),
							mt(
								Pe(
									m,
									{
										title: "Hide Right Panel",
										icon: "i-carbon:side-panel-close",
										"rotate-180": "",
										onClick: v[1] || (v[1] = (w) => I(nL)()),
									},
									undefined,
									512,
								),
								[
									[Gi, I(gn).details.main > 0],
									[b, "Hide Right Panel", void 0, { bottom: !0 }],
								],
							),
							mt(
								Pe(
									m,
									{
										title: "Show Right Panel",
										icon: "i-carbon:side-panel-close",
										onClick: v[2] || (v[2] = (w) => I(rL)()),
									},
									undefined,
									512,
								),
								[
									[Gi, I(gn).details.main === 0],
									[b, "Show Right Panel", void 0, { bottom: !0 }],
								],
							),
						]),
						Y("div", Rce, [
							mt(
								Pe(
									m,
									{
										title: "Small mobile",
										icon: "i-carbon:mobile",
										active: r("small-mobile"),
										onClick: v[3] || (v[3] = (w) => o("small-mobile")),
									},
									undefined,
									8,
									["active"],
								),
								[[b, "Small mobile", void 0, { bottom: !0 }]],
							),
							mt(
								Pe(
									m,
									{
										title: "Large mobile",
										icon: "i-carbon:mobile-add",
										active: r("large-mobile"),
										onClick: v[4] || (v[4] = (w) => o("large-mobile")),
									},
									undefined,
									8,
									["active"],
								),
								[[b, "Large mobile", void 0, { bottom: !0 }]],
							),
							mt(
								Pe(
									m,
									{
										title: "Tablet",
										icon: "i-carbon:tablet",
										active: r("tablet"),
										onClick: v[5] || (v[5] = (w) => o("tablet")),
									},
									undefined,
									8,
									["active"],
								),
								[[b, "Tablet", void 0, { bottom: !0 }]],
							),
							Y("span", Dce, [
								pt(He(I(Dr)[0]) + "x" + He(I(Dr)[1]) + "px ", 1),
								I(d) < 1
									? (oe(),
										me(
											"span",
											zce,
											"(" + He((I(d) * 100).toFixed(0)) + "%)",
											1,
										))
									: Ye("", !0),
							]),
						]),
						Y("div", Ice, [
							Y(
								"div",
								{
									id: "tester-ui",
									class:
										"flex h-full justify-center items-center font-light op70",
									"data-scale": I(d),
									style: Jt({
										"--viewport-width": `${I(Dr)[0]}px`,
										"--viewport-height": `${I(Dr)[1]}px`,
										"--tester-transform": `scale(${I(d)})`,
										"--tester-margin-left": I(h),
									}),
								},
								" Select a test to run ",
								12,
								Fce,
							),
						]),
					])
				);
			};
		},
	}),
	Bce = Kr(qce, [["__scopeId", "data-v-28536a8a"]]),
	Bw = ut({
		__name: "Modal",
		props: Wc(
			{ direction: { default: "bottom" } },
			{
				modelValue: { type: Boolean, default: !1 },
				modelModifiers: {},
			},
		),
		emits: ["update:modelValue"],
		setup(e) {
			const t = Nh(e, "modelValue"),
				r = Te(() => {
					switch (e.direction) {
						case "bottom": {
							return "bottom-0 left-0 right-0 border-t";
						}
						case "top": {
							return "top-0 left-0 right-0 border-b";
						}
						case "left": {
							return "bottom-0 left-0 top-0 border-r";
						}
						case "right": {
							return "bottom-0 top-0 right-0 border-l";
						}
						default: {
							return "";
						}
					}
				}),
				o = Te(() => {
					switch (e.direction) {
						case "bottom": {
							return "translateY(100%)";
						}
						case "top": {
							return "translateY(-100%)";
						}
						case "left": {
							return "translateX(-100%)";
						}
						case "right": {
							return "translateX(100%)";
						}
						default: {
							return "";
						}
					}
				}),
				s = () => (t.value = !1);
			return (c, f) => (
				oe(),
				me(
					"div",
					{
						class: st([
							"fixed inset-0 z-40",
							t.value ? "" : "pointer-events-none",
						]),
					},
					[
						Y(
							"div",
							{
								class: st([
									"bg-base inset-0 absolute transition-opacity duration-500 ease-out",
									t.value ? "opacity-50" : "opacity-0",
								]),
								onClick: s,
							},
							undefined,
							2,
						),
						Y(
							"div",
							{
								class: st([
									"bg-base border-base absolute transition-all duration-200 ease-out scrolls",
									[I(r)],
								]),
								style: Jt(t.value ? {} : { transform: I(o) }),
							},
							[vn(c.$slots, "default")],
							6,
						),
					],
					2,
				)
			);
		},
	}),
	Wce = {
		"w-350": "",
		"max-w-screen": "",
		"h-full": "",
		flex: "",
		"flex-col": "",
	},
	Uce = { "p-4": "", relative: "", border: "base b" },
	Vce = { op50: "", "font-mono": "", "text-sm": "" },
	jce = { op50: "", "font-mono": "", "text-sm": "" },
	Gce = { class: "scrolls", grid: "~ cols-1 rows-[min-content]", "p-4": "" },
	Kce = ["src", "alt"],
	Xce = { key: 1 },
	Yce = ut({
		__name: "ScreenshotError",
		props: { file: {}, name: {}, url: {} },
		emits: ["close"],
		setup(e, { emit: t }) {
			const r = t;
			return (
				jb("Escape", () => {
					r("close");
				}),
				(o, s) => {
					const c = wi;
					return (
						oe(),
						me("div", Wce, [
							Y("div", Uce, [
								s[1] || (s[1] = Y("p", undefined, "Screenshot error", -1)),
								Y("p", Vce, He(o.file), 1),
								Y("p", jce, He(o.name), 1),
								Pe(c, {
									icon: "i-carbon:close",
									title: "Close",
									absolute: "",
									"top-5px": "",
									"right-5px": "",
									"text-2xl": "",
									onClick: s[0] || (s[0] = (f) => r("close")),
								}),
							]),
							Y("div", Gce, [
								o.url
									? (oe(),
										me(
											"img",
											{
												key: 0,
												src: o.url,
												alt: `Screenshot error for '${o.name}' test in file '${o.file}'`,
												border: "base t r b l dotted red-500",
											},
											undefined,
											8,
											Kce,
										))
									: (oe(),
										me(
											"div",
											Xce,
											" Something was wrong, the image cannot be resolved. ",
										)),
							]),
						])
					);
				}
			);
		},
	}),
	Zce = Kr(Yce, [["__scopeId", "data-v-93900314"]]);
function ql(e) {
	return e
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
		.replaceAll("'", "&#39;");
}
const Sa = wE(),
	Jce = aE(Sa),
	Qce = { class: "scrolls scrolls-rounded task-error" },
	eue = ["onClickPassive"],
	tue = ["innerHTML"],
	nue = ut({
		__name: "ViewReportError",
		props: { root: {}, filename: {}, error: {} },
		setup(e) {
			const t = e;
			function r(f) {
				return f.startsWith(t.root) ? f.slice(t.root.length) : f;
			}
			const o = Te(() => Xh(Sa.value)),
				s = Te(() => {
					let f;
					return !!((f = t.error) != undefined && f.diff);
				}),
				c = Te(() =>
					t.error.diff ? o.value.toHtml(ql(t.error.diff)) : void 0,
				);
			return (f, d) => {
				const h = Gr("tooltip");
				return (
					oe(),
					me("div", Qce, [
						Y("pre", undefined, [
							Y("b", undefined, He(f.error.name || f.error.nameStr), 1),
							pt(": " + He(f.error.message), 1),
						]),
						(oe(!0),
						me(
							ct,
							undefined,
							gi(
								f.error.stacks,
								(p, v) => (
									oe(),
									me(
										"div",
										{
											key: v,
											class: "op80 flex gap-x-2 items-center",
											"data-testid": "stack",
										},
										[
											Y(
												"pre",
												undefined,
												" - " +
													He(r(p.file)) +
													":" +
													He(p.line) +
													":" +
													He(p.column),
												1,
											),
											I(rce)(p.file, f.filename)
												? mt(
														(oe(),
														me(
															"div",
															{
																key: 0,
																class:
																	"i-carbon-launch c-red-600 dark:c-red-400 hover:cursor-pointer min-w-1em min-h-1em",
																tabindex: "0",
																"aria-label": "Open in Editor",
																onClickPassive: (m) =>
																	I($w)(p.file, p.line, p.column),
															},
															undefined,
															40,
															eue,
														)),
														[[h, "Open in Editor", void 0, { bottom: !0 }]],
													)
												: Ye("", !0),
										],
									)
								),
							),
							128,
						)),
						I(s)
							? (oe(),
								me(
									"pre",
									{ key: 0, "data-testid": "diff", innerHTML: I(c) },
									undefined,
									8,
									tue,
								))
							: Ye("", !0),
					])
				);
			};
		},
	}),
	rue = Kr(nue, [["__scopeId", "data-v-9dd6eaea"]]),
	iue = { "h-full": "", class: "scrolls" },
	oue = { flex: "~ gap-2 items-center" },
	sue = {
		key: 0,
		class: "scrolls scrolls-rounded task-error",
		"data-testid": "task-error",
	},
	lue = ["innerHTML"],
	aue = {
		key: 1,
		bg: "green-500/10",
		text: "green-500 sm",
		p: "x4 y2",
		"m-2": "",
		rounded: "",
	},
	cue = ut({
		__name: "ViewReport",
		props: { file: {} },
		setup(e) {
			const t = e;
			function r(b, w) {
				let M;
				return ((M = b.result) == undefined ? void 0 : M.state) !== "fail"
					? []
					: (b.type === "test" || b.type === "custom"
						? [{ ...b, level: w }]
						: [{ ...b, level: w }, ...b.tasks.flatMap((C) => r(C, w + 1))]);
			}
			function o(b, w) {
				let E, L, N;
				let M = "";
				(E = w.message) != undefined &&
					E.includes("\u001B") &&
					(M = `<b>${w.nameStr || w.name}</b>: ${b.toHtml(ql(w.message))}`);
				const C = (L = w.stackStr) == undefined ? void 0 : L.includes("\u001B");
				return (
					(C || ((N = w.stack) != undefined && N.includes("\u001B"))) &&
						(M.length > 0
							? (M += b.toHtml(ql(C ? w.stackStr : w.stack)))
							: (M = `<b>${w.nameStr || w.name}</b>: ${w.message}${b.toHtml(
									ql(C ? w.stackStr : w.stack),
								)}`)),
					M.length > 0 ? M : undefined
				);
			}
			function s(b, w) {
				const M = Xh(b);
				return w.map((C) => {
					let N;
					const E = C.result;
					if (!E) {
						return C;
					}
					const L =
						(N = E.errors) == undefined
							? void 0
							: N.map((P) => o(M, P))
									.filter((P) => P != undefined)
									.join("<br><br>");
					return L != undefined && L.length && (E.htmlError = L), C;
				});
			}
			const c = Te(() => {
				let E, L;
				const b = t.file,
					w =
						((E = b == undefined ? void 0 : b.tasks) == undefined
							? void 0
							: E.flatMap((N) => r(N, 0))) ?? [],
					M = b == undefined ? void 0 : b.result;
				if (
					(L = M == undefined ? void 0 : M.errors) == undefined ? void 0 : L[0]
				) {
					const N = {
						id: b.id,
						file: b,
						name: b.name,
						level: 0,
						type: "suite",
						mode: "run",
						meta: {},
						tasks: [],
						result: M,
					};
					w.unshift(N);
				}
				return w.length > 0 ? s(Sa.value, w) : w;
			});
			function f(b) {
				let M;
				const w = (M = b.meta) == undefined ? void 0 : M.failScreenshotPath;
				w && fetch(`/__open-in-editor?file=${encodeURIComponent(w)}`);
			}
			const d = We(!1),
				h = We(Date.now()),
				p = We(),
				v = Te(() => {
					let M;
					const b = (M = p.value) == undefined ? void 0 : M.id,
						w = h.value;
					return b
						? `/__screenshot-error?id=${encodeURIComponent(b)}&t=${w}`
						: void 0;
				});
			function m(b) {
				(p.value = b), (h.value = Date.now()), (d.value = !0);
			}
			return (b, w) => {
				const M = wi,
					C = rue,
					E = Zce,
					L = Bw,
					N = Gr("tooltip");
				return (
					oe(),
					me("div", iue, [
						I(c).length > 0
							? (oe(!0),
								me(
									ct,
									{ key: 0 },
									gi(I(c), (P) => {
										let A, z, W, U;
										return (
											oe(),
											me("div", { key: P.id }, [
												Y(
													"div",
													{
														bg: "red-500/10",
														text: "red-500 sm",
														p: "x3 y2",
														"m-2": "",
														rounded: "",
														style: Jt({
															"margin-left": `${
																(A = P.result) != undefined && A.htmlError
																	? 0.5
																	: 2 * P.level + 0.5
															}rem`,
														}),
													},
													[
														Y("div", oue, [
															Y("span", undefined, He(P.name), 1),
															I(Ro) &&
															(z = P.meta) != undefined &&
															z.failScreenshotPath
																? (oe(),
																	me(
																		ct,
																		{ key: 0 },
																		[
																			mt(
																				Pe(
																					M,
																					{
																						class: "!op-100",
																						icon: "i-carbon:image",
																						title: "View screenshot error",
																						onClick: (re) => m(P),
																					},
																					undefined,
																					8,
																					["onClick"],
																				),
																				[
																					[
																						N,
																						"View screenshot error",
																						void 0,
																						{ bottom: !0 },
																					],
																				],
																			),
																			mt(
																				Pe(
																					M,
																					{
																						class: "!op-100",
																						icon: "i-carbon:image-reference",
																						title:
																							"Open screenshot error in editor",
																						onClick: (re) => f(P),
																					},
																					undefined,
																					8,
																					["onClick"],
																				),
																				[
																					[
																						N,
																						"Open screenshot error in editor",
																						void 0,
																						{
																							bottom: !0,
																						},
																					],
																				],
																			),
																		],
																		64,
																	))
																: Ye("", !0),
														]),
														(W = P.result) != undefined && W.htmlError
															? (oe(),
																me("div", sue, [
																	Y(
																		"pre",
																		{ innerHTML: P.result.htmlError },
																		undefined,
																		8,
																		lue,
																	),
																]))
															: ((U = P.result) != null && U.errors
																? (oe(!0),
																	me(
																		ct,
																		{ key: 1 },
																		gi(P.result.errors, (re, Q) => {
																			var G;
																			return (
																				oe(),
																				rt(
																					C,
																					{
																						key: Q,
																						error: re,
																						filename:
																							(G = b.file) == null
																								? void 0
																								: G.name,
																						root: I(Bu).root,
																					},
																					null,
																					8,
																					["error", "filename", "root"],
																				)
																			);
																		}),
																		128,
																	))
																: Ye("", !0)),
													],
													4,
												),
											])
										);
									}),
									128,
								))
							: (oe(), me("div", aue, " All tests passed in this file ")),
						I(Ro)
							? (oe(),
								rt(
									L,
									{
										key: 2,
										modelValue: I(d),
										"onUpdate:modelValue":
											w[1] ||
											(w[1] = (P) => (At(d) ? (d.value = P) : undefined)),
										direction: "right",
									},
									{
										default: ot(() => [
											I(p)
												? (oe(),
													rt(
														Wy,
														{ key: 0 },
														{
															default: ot(() => [
																Pe(
																	E,
																	{
																		file: I(p).file.filepath,
																		name: I(p).name,
																		url: I(v),
																		onClose:
																			w[0] || (w[0] = (P) => (d.value = !1)),
																	},
																	undefined,
																	8,
																	["file", "name", "url"],
																),
															]),
															_: 1,
														},
													))
												: Ye("", !0),
										]),
										_: 1,
									},
									8,
									["modelValue"],
								))
							: Ye("", !0),
					])
				);
			};
		},
	}),
	uue = Kr(cue, [["__scopeId", "data-v-bd862be2"]]),
	fue = { border: "b base", "p-4": "" },
	due = ["innerHTML"],
	hue = ut({
		__name: "ViewConsoleOutputEntry",
		props: { taskName: {}, type: {}, time: {}, content: {} },
		setup(e) {
			function t(r) {
				return new Date(r).toLocaleTimeString();
			}
			return (r, o) => (
				oe(),
				me("div", fue, [
					Y(
						"div",
						{
							"text-xs": "",
							"mb-1": "",
							class: st(
								r.type === "stderr" ? "text-red-600 dark:text-red-300" : "op30",
							),
						},
						He(t(r.time)) + " | " + He(r.taskName) + " | " + He(r.type),
						3,
					),
					Y(
						"pre",
						{ "data-type": "html", innerHTML: r.content },
						undefined,
						8,
						due,
					),
				])
			);
		},
	}),
	pue = {
		key: 0,
		"h-full": "",
		class: "scrolls",
		flex: "",
		"flex-col": "",
		"data-testid": "logs",
	},
	gue = { key: 1, p6: "" },
	vue = ut({
		__name: "ViewConsoleOutput",
		setup(e) {
			const t = Te(() => {
				const o = qw.value;
				if (o) {
					const s = Xh(Sa.value);
					return o.map(({ taskId: c, type: f, time: d, content: h }) => ({
						taskId: c,
						type: f,
						time: d,
						content: s.toHtml(ql(h)),
					}));
				}
			});
			function r(o) {
				const s = o && xt.state.idMap.get(o);
				return s && "filepath" in s
					? s.name
					: (s ? HC(s).slice(1).join(" > ") : "-") || "-";
			}
			return (o, s) => {
				let f;
				const c = hue;
				return (f = I(t)) != undefined && f.length > 0
					? (oe(),
						me("div", pue, [
							(oe(!0),
							me(
								ct,
								undefined,
								gi(
									I(t),
									({ taskId: d, type: h, time: p, content: v }) => (
										oe(),
										me("div", { key: d, "font-mono": "" }, [
											Pe(
												c,
												{ "task-name": r(d), type: h, time: p, content: v },
												undefined,
												8,
												["task-name", "type", "time", "content"],
											),
										])
									),
								),
								128,
							)),
						]))
					: (oe(),
						me(
							"p",
							gue,
							s[0] ||
								(s[0] = [
									pt(
										" Log something in your test and it would print here. (e.g. ",
									),
									Y("pre", { inline: "" }, "console.log(foo)", -1),
									pt(") "),
								]),
						));
			};
		},
	});
const Ww = { exports: {} };
((e, t) => {
	((r, o) => {
		e.exports = o();
	})(Oo, () => {
		let r = navigator.userAgent,
			o = navigator.platform,
			s = /gecko\/\d/i.test(r),
			c = /MSIE \d/.test(r),
			f = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(r),
			d = /Edge\/(\d+)/.exec(r),
			h = c || f || d,
			p = h && (c ? document.documentMode || 6 : +(d || f)[1]),
			v = !d && /WebKit\//.test(r),
			m = v && /Qt\/\d+\.\d+/.test(r),
			b = !d && /Chrome\/(\d+)/.exec(r),
			w = b && +b[1],
			M = /Opera\//.test(r),
			C = /Apple Computer/.test(navigator.vendor),
			E = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(r),
			L = /PhantomJS/.test(r),
			N = C && (/Mobile\/\w+/.test(r) || navigator.maxTouchPoints > 2),
			P = /Android/.test(r),
			A = N || P || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(r),
			z = N || /Mac/.test(o),
			W = /\bCrOS\b/.test(r),
			U = /win/i.test(o),
			re = M && r.match(/Version\/(\d*\.\d*)/);
		re && (re = Number(re[1])), re && re >= 15 && ((M = !1), (v = !0));
		const Q = z && (m || (M && (re == undefined || re < 12.11))),
			G = s || (h && p >= 9);
		function te(n) {
			return new RegExp(String.raw`(^|\s)` + n + String.raw`(?:$|\s)\s*`);
		}
		const Z = (n, i) => {
			const a = n.className,
				l = te(i).exec(a);
			if (l) {
				const u = a.slice(l.index + l[0].length);
				n.className = a.slice(0, l.index) + (u ? l[1] + u : "");
			}
		};
		function q(n) {
			for (let i = n.childNodes.length; i > 0; --i) {
				n.removeChild(n.firstChild);
			}
			return n;
		}
		function F(n, i) {
			return q(n).append(i);
		}
		function k(n, i, a, l) {
			const u = document.createElement(n);
			if (
				(a && (u.className = a),
				l && (u.style.cssText = l),
				typeof i === "string")
			) {
				u.append(document.createTextNode(i));
			} else if (i) {
				for (let g = 0; g < i.length; ++g) {
					u.append(i[g]);
				}
			}
			return u;
		}
		function B(n, i, a, l) {
			const u = k(n, i, a, l);
			return u.setAttribute("role", "presentation"), u;
		}
		let V;
		document.createRange
			? (V = (n, i, a, l) => {
					const u = document.createRange();
					return u.setEnd(l || n, a), u.setStart(n, i), u;
				})
			: (V = (n, i, a) => {
					const l = document.body.createTextRange();
					try {
						l.moveToElementText(n.parentNode);
					} catch {
						return l;
					}
					return (
						l.collapse(!0),
						l.moveEnd("character", a),
						l.moveStart("character", i),
						l
					);
				});
		function ie(n, i) {
			if ((i.nodeType == 3 && (i = i.parentNode), n.contains)) {
				return n.contains(i);
			}
			do {
				if ((i.nodeType == 11 && (i = i.host), i == n)) {return !0;}
			} while ((i = i.parentNode));
		}
		function ye(n) {
			let i = n.ownerDocument || n,
				a;
			try {
				a = n.activeElement;
			} catch {
				a = i.body || undefined;
			}
			while (a && a.shadowRoot && a.shadowRoot.activeElement) {
				a = a.shadowRoot.activeElement;
			}
			return a;
		}
		function Ne(n, i) {
			const a = n.className;
			te(i).test(a) || (n.className += (a ? " " : "") + i);
		}
		function Ue(n, i) {
			for (let a = n.split(" "), l = 0; l < a.length; l++) {
				a[l] && !te(a[l]).test(i) && (i += " " + a[l]);
			}
			return i;
		}
		let je = (n) => {
			n.select();
		};
		N
			? (je = (n) => {
					(n.selectionStart = 0), (n.selectionEnd = n.value.length);
				})
			: h &&
				(je = (n) => {
					try {
						n.select();
					} catch {}
				});
		function it(n) {
			return n.display.wrapper.ownerDocument;
		}
		function tt(n) {
			return Je(n.display.wrapper);
		}
		function Je(n) {
			return n.getRootNode ? n.getRootNode() : n.ownerDocument;
		}
		function Ae(n) {
			return it(n).defaultView;
		}
		function X(n) {
			const i = Array.prototype.slice.call(arguments, 1);
			return () => n.apply(undefined, i);
		}
		function ae(n, i, a) {
			i || (i = {});
			for (const l in n) {
				Object.hasOwn(n, l) &&
					(a !== !1 || !Object.hasOwn(i, l)) &&
					(i[l] = n[l]);
			}
			return i;
		}
		function de(n, i, a, l, u) {
			i == undefined &&
				((i = n.search(/[^\s\u00A0]/)), i == -1 && (i = n.length));
			for (let g = l || 0, y = u || 0; ; ) {
				const x = n.indexOf("	", g);
				if (x < 0 || x >= i) {
					return y + (i - g);
				}
				(y += x - g), (y += a - (y % a)), (g = x + 1);
			}
		}
		const $e = function $e() {
			(this.id = undefined),
				(this.f = undefined),
				(this.time = 0),
				(this.handler = X(this.onTimeout, this));
		};
		($e.prototype.onTimeout = (n) => {
			(n.id = 0),
				n.time <= Date.now()
					? n.f()
					: setTimeout(n.handler, n.time - Date.now());
		}),
			($e.prototype.set = function set(n, i) {
				this.f = i;
				const a = Date.now() + n;
				(!this.id || a < this.time) &&
					(clearTimeout(this.id),
					(this.id = setTimeout(this.handler, n)),
					(this.time = a));
			});
		function Ee(n, i) {
			for (let a = 0; a < n.length; ++a) {
				if (n[a] == i) {return a;}
			}
			return -1;
		}
		const Ze = 50,
			O = {
				toString() {
					return "CodeMirror.Pass";
				},
			},
			H = { scroll: !1 },
			J = { origin: "*mouse" },
			fe = { origin: "+move" };
		function le(n, i, a) {
			for (let l = 0, u = 0; ; ) {
				let g = n.indexOf("	", l);
				g == -1 && (g = n.length);
				const y = g - l;
				if (g == n.length || u + y >= i) {
					return l + Math.min(y, i - u);
				}
				if (((u += g - l), (u += a - (u % a)), (l = g + 1), u >= i)) {
					return l;
				}
			}
		}
		const he = [""];
		function _e(n) {
			while (he.length <= n) {
				he.push(ue(he) + " ");
			}
			return he[n];
		}
		function ue(n) {
			return n[n.length - 1];
		}
		function be(n, i) {
			for (var a = [], l = 0; l < n.length; l++) {
				a[l] = i(n[l], l);
			}
			return a;
		}
		function ve(n, i, a) {
			for (var l = 0, u = a(i); l < n.length && a(n[l]) <= u; ) {
				l++;
			}
			n.splice(l, 0, i);
		}
		function qe() {}
		function Le(n, i) {
			let a;
			return (
				Object.create
					? (a = Object.create(n))
					: ((qe.prototype = n), (a = new qe())),
				i && ae(i, a),
				a
			);
		}
		const De =
			/[\u00DF\u0587\u0590-\u05F4\u0600-\u06FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC\uAC00-\uD7AF]/;
		function Be(n) {
			return (
				/\w/.test(n) ||
				(n > "" && (n.toUpperCase() != n.toLowerCase() || De.test(n)))
			);
		}
		function Xe(n, i) {
			return i
				? (i.source.indexOf("\\w") > -1 && Be(n)
					? !0
					: i.test(n))
				: Be(n);
		}
		function gt(n) {
			for (const i in n) {
				if (Object.hasOwn(n, i) && n[i]) {return !1;}
			}
			return !0;
		}
		const nt =
			/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065E\u0670\u06D6-\u06DC\u06DE-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0900-\u0902\u093C\u0941-\u0948\u094D\u0951-\u0955\u0962\u0963\u0981\u09BC\u09BE\u09C1-\u09C4\u09CD\u09D7\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3E\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE\u0BC0\u0BCD\u0BD7\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC2\u0CC6\u0CCC\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D3E\u0D41-\u0D44\u0D4D\u0D57\u0D62\u0D63\u0DCA\u0DCF\u0DD2-\u0DD4\u0DD6\u0DDF\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F90-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1DC0-\u1DE6\u1DFD-\u1DFF\u200C\u200D\u20D0-\u20F0\u2CEF-\u2CF1\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uDC00-\uDFFF\uFB1E\uFE00-\uFE0F\uFE20-\uFE26\uFF9E\uFF9F]/;
		function lt(n) {
			return n.codePointAt(0) >= 768 && nt.test(n);
		}
		function Tt(n, i, a) {
			while ((a < 0 ? i > 0 : i < n.length) && lt(n.charAt(i))) {
				i += a;
			}
			return i;
		}
		function Rt(n, i, a) {
			for (const l = i > a ? -1 : 1; ; ) {
				if (i == a) {
					return i;
				}
				const u = (i + a) / 2,
					g = l < 0 ? Math.ceil(u) : Math.floor(u);
				if (g == i) {
					return n(g) ? i : a;
				}
				n(g) ? (a = g) : (i = g + l);
			}
		}
		function Dt(n, i, a, l) {
			if (!n) {
				return l(i, a, "ltr", 0);
			}
			for (var u = !1, g = 0; g < n.length; ++g) {
				const y = n[g];
				((y.from < a && y.to > i) || (i == a && y.to == i)) &&
					(l(
						Math.max(y.from, i),
						Math.min(y.to, a),
						y.level == 1 ? "rtl" : "ltr",
						g,
					),
					(u = !0));
			}
			u || l(i, a, "ltr");
		}
		let Wn;
		function ar(n, i, a) {
			let l;
			Wn = undefined;
			for (let u = 0; u < n.length; ++u) {
				const g = n[u];
				if (g.from < i && g.to > i) {
					return u;
				}
				g.to == i && (g.from != g.to && a == "before" ? (l = u) : (Wn = u)),
					g.from == i && (g.from != g.to && a != "before" ? (l = u) : (Wn = u));
			}
			return l ?? Wn;
		}
		const tn = (() => {
			const n =
					"bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
				i =
					"nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";
			function a(_) {
				return _ <= 247
					? n.charAt(_)
					: _ >= 1424 && _ <= 1524
						? "R"
						: _ >= 1536 && _ <= 1785
							? i.charAt(_ - 1536)
							: _ >= 1774 && _ <= 2220
								? "r"
								: _ >= 8192 && _ <= 8203
									? "w"
									: _ == 8204
										? "b"
										: "L";
			}
			const l = /[\u0590-\u05F4\u0600-\u06FF\u0700-\u08AC]/,
				u = /[stwN]/,
				g = /[LRr]/,
				y = /[Lb1n]/,
				x = /[1n]/;
			function S(_, $, D) {
				(this.level = _), (this.from = $), (this.to = D);
			}
			return (_, $) => {
				const D = $ == "ltr" ? "L" : "R";
				if (_.length === 0 || ($ == "ltr" && !l.test(_))) {
					return !1;
				}
				for (var K = _.length, j = [], ne = 0; ne < K; ++ne) {
					j.push(a(_.codePointAt(ne)));
				}
				for (let ce = 0, ge = D; ce < K; ++ce) {
					const we = j[ce];
					we == "m" ? (j[ce] = ge) : (ge = we);
				}
				for (let ke = 0, xe = D; ke < K; ++ke) {
					const Me = j[ke];
					Me == "1" && xe == "r"
						? (j[ke] = "n")
						: g.test(Me) && ((xe = Me), Me == "r" && (j[ke] = "R"));
				}
				for (let Ie = 1, Re = j[0]; Ie < K - 1; ++Ie) {
					const Qe = j[Ie];
					Qe == "+" && Re == "1" && j[Ie + 1] == "1"
						? (j[Ie] = "1")
						: Qe == "," &&
							Re == j[Ie + 1] &&
							(Re == "1" || Re == "n") &&
							(j[Ie] = Re),
						(Re = Qe);
				}
				for (let St = 0; St < K; ++St) {
					const Xt = j[St];
					if (Xt == ",") {
						j[St] = "N";
					} else if (Xt == "%") {
						let Lt = void 0;
						for (Lt = St + 1; Lt < K && j[Lt] == "%"; ++Lt) {}
						for (
							let Rn =
									(St && j[St - 1] == "!") || (Lt < K && j[Lt] == "1")
										? "1"
										: "N",
								xn = St;
							xn < Lt;
							++xn
						) {
							j[xn] = Rn;
						}
						St = Lt - 1;
					}
				}
				for (let It = 0, Sn = D; It < K; ++It) {
					const Qt = j[It];
					Sn == "L" && Qt == "1" ? (j[It] = "L") : g.test(Qt) && (Sn = Qt);
				}
				for (let Ut = 0; Ut < K; ++Ut) {
					if (u.test(j[Ut])) {
						let Ft = void 0;
						for (Ft = Ut + 1; Ft < K && u.test(j[Ft]); ++Ft) {}
						for (
							let Pt = (Ut ? j[Ut - 1] : D) == "L",
								_n = (Ft < K ? j[Ft] : D) == "L",
								cs = Pt == _n ? (Pt ? "L" : "R") : D,
								Pi = Ut;
							Pi < Ft;
							++Pi
						) {
							j[Pi] = cs;
						}
						Ut = Ft - 1;
					}
				}
				for (var sn = [], Or, Yt = 0; Yt < K; ) {
					if (y.test(j[Yt])) {
						const Bf = Yt;
						for (++Yt; Yt < K && y.test(j[Yt]); ++Yt) {}
						sn.push(new S(0, Bf, Yt));
					} else {
						let ri = Yt,
							mo = sn.length,
							yo = $ == "rtl" ? 1 : 0;
						for (++Yt; Yt < K && j[Yt] != "L"; ++Yt) {}
						for (let dn = ri; dn < Yt; ) {
							if (x.test(j[dn])) {
								ri < dn && (sn.splice(mo, 0, new S(1, ri, dn)), (mo += yo));
								const us = dn;
								for (++dn; dn < Yt && x.test(j[dn]); ++dn) {}
								sn.splice(mo, 0, new S(2, us, dn)), (mo += yo), (ri = dn);
							} else {
								++dn;
							}
						}
						ri < Yt && sn.splice(mo, 0, new S(1, ri, Yt));
					}
				}
				return (
					$ == "ltr" &&
						(sn[0].level == 1 &&
							(Or = _.match(/^\s+/)) &&
							((sn[0].from = Or[0].length),
							sn.unshift(new S(0, 0, Or[0].length))),
						ue(sn).level == 1 &&
							(Or = _.match(/\s+$/)) &&
							((ue(sn).to -= Or[0].length),
							sn.push(new S(0, K - Or[0].length, K)))),
					$ == "rtl" ? sn.reverse() : sn
				);
			};
		})();
		function Ve(n, i) {
			let a = n.order;
			return a == undefined && (a = n.order = tn(n.text, i)), a;
		}
		const so = [],
			ze = (n, i, a) => {
				if (n.addEventListener) {
					n.addEventListener(i, a, !1);
				} else if (n.attachEvent) {
					n.attachEvent("on" + i, a);
				} else {
					const l = n._handlers || (n._handlers = {});
					l[i] = (l[i] || so).concat(a);
				}
			};
		function Yr(n, i) {
			return (n._handlers && n._handlers[i]) || so;
		}
		function nn(n, i, a) {
			if (n.removeEventListener) {
				n.removeEventListener(i, a, !1);
			} else if (n.detachEvent) {
				n.detachEvent("on" + i, a);
			} else {
				const l = n._handlers,
					u = l && l[i];
				if (u) {
					const g = Ee(u, a);
					g > -1 && (l[i] = u.slice(0, g).concat(u.slice(g + 1)));
				}
			}
		}
		function Mt(n, i) {
			const a = Yr(n, i);
			if (a.length > 0) {
				for (
					let l = Array.prototype.slice.call(arguments, 2), u = 0;
					u < a.length;
					++u
				) {
					a[u].apply(undefined, l);
				}
			}
		}
		function Nt(n, i, a) {
			return (
				typeof i === "string" &&
					(i = {
						type: i,
						preventDefault() {
							this.defaultPrevented = !0;
						},
					}),
				Mt(n, a || i.type, n, i),
				mn(i) || i.codemirrorIgnore
			);
		}
		function er(n) {
			const i = n._handlers && n._handlers.cursorActivity;
			if (i) {
				for (
					let a =
							n.curOp.cursorActivityHandlers ||
							(n.curOp.cursorActivityHandlers = []),
						l = 0;
					l < i.length;
					++l
				) {
					Ee(a, i[l]) == -1 && a.push(i[l]);
				}
			}
		}
		function Pn(n, i) {
			return Yr(n, i).length > 0;
		}
		function cr(n) {
			(n.prototype.on = function on(i, a) {
				ze(this, i, a);
			}),
				(n.prototype.off = function off(i, a) {
					nn(this, i, a);
				});
		}
		function rn(n) {
			n.preventDefault ? n.preventDefault() : (n.returnValue = !1);
		}
		function Io(n) {
			n.stopPropagation ? n.stopPropagation() : (n.cancelBubble = !0);
		}
		function mn(n) {
			return n.defaultPrevented != undefined
				? n.defaultPrevented
				: n.returnValue == !1;
		}
		function xi(n) {
			rn(n), Io(n);
		}
		function Us(n) {
			return n.target || n.srcElement;
		}
		function ur(n) {
			let i = n.which;
			return (
				i == undefined &&
					(n.button & 1
						? (i = 1)
						: (n.button & 2
							? (i = 3)
							: n.button & 4 && (i = 2))),
				z && n.ctrlKey && i == 1 && (i = 3),
				i
			);
		}
		let Ku = (() => {
				if (h && p < 9) {
					return !1;
				}
				const n = k("div");
				return "draggable" in n || "dragDrop" in n;
			})(),
			Fo;
		function Ca(n) {
			if (Fo == undefined) {
				const i = k("span", "​");
				F(n, k("span", [i, document.createTextNode("x")])),
					n.firstChild.offsetHeight != 0 &&
						(Fo = i.offsetWidth <= 1 && i.offsetHeight > 2 && !(h && p < 8));
			}
			const a = Fo
				? k("span", "​")
				: k(
						"span",
						" ",
						undefined,
						"display: inline-block; width: 1px; margin-right: -1px",
					);
			return a.setAttribute("cm-text", ""), a;
		}
		let Vs;
		function Si(n) {
			if (Vs != undefined) {
				return Vs;
			}
			const i = F(n, document.createTextNode("AخA")),
				a = V(i, 0, 1).getBoundingClientRect(),
				l = V(i, 1, 2).getBoundingClientRect();
			return q(n), !a || a.left == a.right ? !1 : (Vs = l.right - a.right < 3);
		}
		let tr =
				`

b`.split(/\n/).length != 3
					? (n) => {
							for (var i = 0, a = [], l = n.length; i <= l; ) {
								let u = n.indexOf(
									`
`,
									i,
								);
								u == -1 && (u = n.length);
								const g = n.slice(i, n.charAt(u - 1) == "\r" ? u - 1 : u),
									y = g.indexOf("\r");
								y != -1
									? (a.push(g.slice(0, y)), (i += y + 1))
									: (a.push(g), (i = u + 1));
							}
							return a;
						}
					: (n) => n.split(/\r\n?|\n/),
			_i = window.getSelection
				? (n) => {
						try {
							return n.selectionStart != n.selectionEnd;
						} catch {
							return !1;
						}
					}
				: (n) => {
						let i;
						try {
							i = n.ownerDocument.selection.createRange();
						} catch {}
						return !i || i.parentElement() != n
							? !1
							: i.compareEndPoints("StartToEnd", i) != 0;
					},
			Ea = (() => {
				const n = k("div");
				return "oncopy" in n
					? !0
					: (n.setAttribute("oncopy", "return;"),
						typeof n.oncopy === "function");
			})(),
			fr;
		function Xu(n) {
			if (fr != undefined) {
				return fr;
			}
			const i = F(n, k("span", "x")),
				a = i.getBoundingClientRect(),
				l = V(i, 0, 1).getBoundingClientRect();
			return (fr = Math.abs(a.left - l.left) > 1);
		}
		const Ho = {},
			dr = {};
		function hr(n, i) {
			arguments.length > 2 &&
				(i.dependencies = Array.prototype.slice.call(arguments, 2)),
				(Ho[n] = i);
		}
		function lo(n, i) {
			dr[n] = i;
		}
		function qo(n) {
			if (typeof n === "string" && Object.hasOwn(dr, n)) {
				n = dr[n];
			} else if (n && typeof n.name === "string" && Object.hasOwn(dr, n.name)) {
				let i = dr[n.name];
				typeof i === "string" && (i = { name: i }),
					(n = Le(i, n)),
					(n.name = i.name);
			} else {
				if (typeof n === "string" && /^[\w-]+\/[\w-]+\+xml$/.test(n)) {
					return qo("application/xml");
				}
				if (typeof n === "string" && /^[\w-]+\/[\w-]+\+json$/.test(n)) {
					return qo("application/json");
				}
			}
			return typeof n === "string" ? { name: n } : n || { name: "null" };
		}
		function Bo(n, i) {
			i = qo(i);
			const a = Ho[i.name];
			if (!a) {
				return Bo(n, "text/plain");
			}
			const l = a(n, i);
			if (Object.hasOwn(ki, i.name)) {
				const u = ki[i.name];
				for (const g in u) {
					Object.hasOwn(u, g) &&
						(Object.hasOwn(l, g) && (l["_" + g] = l[g]), (l[g] = u[g]));
				}
			}
			if (
				((l.name = i.name),
				i.helperType && (l.helperType = i.helperType),
				i.modeProps)
			) {
				for (const y in i.modeProps) {
					l[y] = i.modeProps[y];
				}
			}
			return l;
		}
		const ki = {};
		function Wo(n, i) {
			const a = Object.hasOwn(ki, n) ? ki[n] : (ki[n] = {});
			ae(i, a);
		}
		function Mr(n, i) {
			if (i === !0) {
				return i;
			}
			if (n.copyState) {
				return n.copyState(i);
			}
			const a = {};
			for (const l in i) {
				let u = i[l];
				Array.isArray(u) && (u = u.concat([])), (a[l] = u);
			}
			return a;
		}
		function js(n, i) {
			for (
				var a;
				n.innerMode && ((a = n.innerMode(i)), !(!a || a.mode == n));
			) {
				(i = a.state), (n = a.mode);
			}
			return a || { mode: n, state: i };
		}
		function Uo(n, i, a) {
			return n.startState ? n.startState(i, a) : !0;
		}
		const $t = function $t(n, i, a) {
			(this.pos = this.start = 0),
				(this.string = n),
				(this.tabSize = i || 8),
				(this.lastColumnPos = this.lastColumnValue = 0),
				(this.lineStart = 0),
				(this.lineOracle = a);
		};
		($t.prototype.eol = function eol() {
			return this.pos >= this.string.length;
		}),
			($t.prototype.sol = function sol() {
				return this.pos == this.lineStart;
			}),
			($t.prototype.peek = function peek() {
				return this.string.charAt(this.pos) || void 0;
			}),
			($t.prototype.next = function next() {
				if (this.pos < this.string.length) {
					return this.string.charAt(this.pos++);
				}
			}),
			($t.prototype.eat = function eat(n) {
				let i = this.string.charAt(this.pos),
					a;
				if (
					(typeof n === "string"
						? (a = i == n)
						: (a = i && (n.test ? n.test(i) : n(i))),
					a)
				) {
					return ++this.pos, i;
				}
			}),
			($t.prototype.eatWhile = function eatWhile(n) {
				for (var i = this.pos; this.eat(n); ) {}
				return this.pos > i;
			}),
			($t.prototype.eatSpace = function eatSpace() {
				for (
					var n = this.pos;
					/[\s\u00A0]/.test(this.string.charAt(this.pos));
				) {
					++this.pos;
				}
				return this.pos > n;
			}),
			($t.prototype.skipToEnd = function skipToEnd() {
				this.pos = this.string.length;
			}),
			($t.prototype.skipTo = function skipTo(n) {
				const i = this.string.indexOf(n, this.pos);
				if (i > -1) {
					return (this.pos = i), !0;
				}
			}),
			($t.prototype.backUp = function backUp(n) {
				this.pos -= n;
			}),
			($t.prototype.column = function column() {
				return (
					this.lastColumnPos < this.start &&
						((this.lastColumnValue = de(
							this.string,
							this.start,
							this.tabSize,
							this.lastColumnPos,
							this.lastColumnValue,
						)),
						(this.lastColumnPos = this.start)),
					this.lastColumnValue -
						(this.lineStart ? de(this.string, this.lineStart, this.tabSize) : 0)
				);
			}),
			($t.prototype.indentation = function indentation() {
				return (
					de(this.string, undefined, this.tabSize) -
					(this.lineStart ? de(this.string, this.lineStart, this.tabSize) : 0)
				);
			}),
			($t.prototype.match = function match(n, i, a) {
				if (typeof n === "string") {
					const l = (y) => (a ? y.toLowerCase() : y),
						u = this.string.slice(this.pos, n.length);
					if (l(u) == l(n)) {
						return i !== !1 && (this.pos += n.length), !0;
					}
				} else {
					const g = this.string.slice(this.pos).match(n);
					return g && g.index > 0
						? undefined
						: (g && i !== !1 && (this.pos += g[0].length), g);
				}
			}),
			($t.prototype.current = function current() {
				return this.string.slice(this.start, this.pos);
			}),
			($t.prototype.hideFirstChars = function hideFirstChars(n, i) {
				this.lineStart += n;
				try {
					return i();
				} finally {
					this.lineStart -= n;
				}
			}),
			($t.prototype.lookAhead = function lookAhead(n) {
				const i = this.lineOracle;
				return i && i.lookAhead(n);
			}),
			($t.prototype.baseToken = function baseToken() {
				const n = this.lineOracle;
				return n && n.baseToken(this.pos);
			});
		function Oe(n, i) {
			if (((i -= n.first), i < 0 || i >= n.size)) {
				throw new Error(
					"There is no line " + (i + n.first) + " in the document.",
				);
			}
			for (var a = n; !a.lines; ) {
				for (let l = 0; ; ++l) {
					const u = a.children[l],
						g = u.chunkSize();
					if (i < g) {
						a = u;
						break;
					}
					i -= g;
				}
			}
			return a.lines[i];
		}
		function Zr(n, i, a) {
			let l = [],
				u = i.line;
			return (
				n.iter(i.line, a.line + 1, (g) => {
					let y = g.text;
					u == a.line && (y = y.slice(0, a.ch)),
						u == i.line && (y = y.slice(i.ch)),
						l.push(y),
						++u;
				}),
				l
			);
		}
		function Gs(n, i, a) {
			const l = [];
			return (
				n.iter(i, a, (u) => {
					l.push(u.text);
				}),
				l
			);
		}
		function Un(n, i) {
			const a = i - n.height;
			if (a) {
				for (let l = n; l; l = l.parent) {
					l.height += a;
				}
			}
		}
		function T(n) {
			if (n.parent == undefined) {
				return ;
			}
			for (
				var i = n.parent, a = Ee(i.lines, n), l = i.parent;
				l;
				i = l, l = l.parent
			) {
				for (let u = 0; l.children[u] != i; ++u) {
					a += l.children[u].chunkSize();
				}
			}
			return a + i.first;
		}
		function R(n, i) {
			let a = n.first;
			e: do {
				for (let l = 0; l < n.children.length; ++l) {
					const u = n.children[l],
						g = u.height;
					if (i < g) {
						n = u;
						continue e;
					}
					(i -= g), (a += u.chunkSize());
				}
				return a;
			} while (!n.lines);
			for (var y = 0; y < n.lines.length; ++y) {
				const x = n.lines[y],
					S = x.height;
				if (i < S) {
					break;
				}
				i -= S;
			}
			return a + y;
		}
		function se(n, i) {
			return i >= n.first && i < n.first + n.size;
		}
		function pe(n, i) {
			return String(n.lineNumberFormatter(i + n.firstLineNumber));
		}
		function ee(n, i, a) {
			if ((a === void 0 && (a = undefined), !(this instanceof ee))) {
				return new ee(n, i, a);
			}
			(this.line = n), (this.ch = i), (this.sticky = a);
		}
		function Se(n, i) {
			return n.line - i.line || n.ch - i.ch;
		}
		function ft(n, i) {
			return n.sticky == i.sticky && Se(n, i) == 0;
		}
		function Vt(n) {
			return ee(n.line, n.ch);
		}
		function yn(n, i) {
			return Se(n, i) < 0 ? i : n;
		}
		function Vo(n, i) {
			return Se(n, i) < 0 ? n : i;
		}
		function hp(n, i) {
			return Math.max(n.first, Math.min(i, n.first + n.size - 1));
		}
		function Ge(n, i) {
			if (i.line < n.first) {
				return ee(n.first, 0);
			}
			const a = n.first + n.size - 1;
			return i.line > a
				? ee(a, Oe(n, a).text.length)
				: K1(i, Oe(n, i.line).text.length);
		}
		function K1(n, i) {
			const a = n.ch;
			return a == undefined || a > i
				? ee(n.line, i)
				: (a < 0
					? ee(n.line, 0)
					: n);
		}
		function pp(n, i) {
			for (var a = [], l = 0; l < i.length; l++) {
				a[l] = Ge(n, i[l]);
			}
			return a;
		}
		const La = function La(n, i) {
				(this.state = n), (this.lookAhead = i);
			},
			Nr = function Nr(n, i, a, l) {
				(this.state = i),
					(this.doc = n),
					(this.line = a),
					(this.maxLookAhead = l || 0),
					(this.baseTokens = undefined),
					(this.baseTokenPos = 1);
			};
		(Nr.prototype.lookAhead = function lookAhead(n) {
			const i = this.doc.getLine(this.line + n);
			return (
				i != undefined && n > this.maxLookAhead && (this.maxLookAhead = n), i
			);
		}),
			(Nr.prototype.baseToken = function baseToken(n) {
				if (!this.baseTokens) {
					return ;
				}
				while (this.baseTokens[this.baseTokenPos] <= n) {
					this.baseTokenPos += 2;
				}
				const i = this.baseTokens[this.baseTokenPos + 1];
				return {
					type: i && i.replace(/( |^)overlay .*/, ""),
					size: this.baseTokens[this.baseTokenPos] - n,
				};
			}),
			(Nr.prototype.nextLine = function nextLine() {
				this.line++, this.maxLookAhead > 0 && this.maxLookAhead--;
			}),
			(Nr.fromSaved = (n, i, a) =>
				i instanceof La
					? new Nr(n, Mr(n.mode, i.state), a, i.lookAhead)
					: new Nr(n, Mr(n.mode, i), a)),
			(Nr.prototype.save = function save(n) {
				const i = n !== !1 ? Mr(this.doc.mode, this.state) : this.state;
				return this.maxLookAhead > 0 ? new La(i, this.maxLookAhead) : i;
			});
		function gp(n, i, a, l) {
			const u = [n.state.modeGen],
				g = {};
			xp(n, i.text, n.doc.mode, a, (_, $) => u.push(_, $), g, l);
			for (
				let y = a.state,
					x = (_) => {
						a.baseTokens = u;
						let $ = n.state.overlays[_],
							D = 1,
							K = 0;
						(a.state = !0),
							xp(
								n,
								i.text,
								$.mode,
								a,
								(j, ne) => {
									for (var ce = D; K < j; ) {
										const ge = u[D];
										ge > j && u.splice(D, 1, j, u[D + 1], ge),
											(D += 2),
											(K = Math.min(j, ge));
									}
									if (ne) {
										if ($.opaque) {
											u.splice(ce, D - ce, j, "overlay " + ne), (D = ce + 2);
										} else {
											for (; ce < D; ce += 2) {
												const we = u[ce + 1];
												u[ce + 1] = (we ? we + " " : "") + "overlay " + ne;
											}
										}
									}
								},
								g,
							),
							(a.state = y),
							(a.baseTokens = undefined),
							(a.baseTokenPos = 1);
					},
					S = 0;
				S < n.state.overlays.length;
				++S
			) {
				x(S);
			}
			return { styles: u, classes: g.bgClass || g.textClass ? g : undefined };
		}
		function vp(n, i, a) {
			if (!i.styles || i.styles[0] != n.state.modeGen) {
				const l = Ks(n, T(i)),
					u =
						i.text.length > n.options.maxHighlightLength &&
						Mr(n.doc.mode, l.state),
					g = gp(n, i, l);
				u && (l.state = u),
					(i.stateAfter = l.save(!u)),
					(i.styles = g.styles),
					g.classes
						? (i.styleClasses = g.classes)
						: i.styleClasses && (i.styleClasses = undefined),
					a === n.doc.highlightFrontier &&
						(n.doc.modeFrontier = Math.max(
							n.doc.modeFrontier,
							++n.doc.highlightFrontier,
						));
			}
			return i.styles;
		}
		function Ks(n, i, a) {
			const l = n.doc,
				u = n.display;
			if (!l.mode.startState) {
				return new Nr(l, !0, i);
			}
			const g = X1(n, i, a),
				y = g > l.first && Oe(l, g - 1).stateAfter,
				x = y ? Nr.fromSaved(l, y, g) : new Nr(l, Uo(l.mode), g);
			return (
				l.iter(g, i, (S) => {
					Yu(n, S.text, x);
					const _ = x.line;
					(S.stateAfter =
						_ == i - 1 || _ % 5 == 0 || (_ >= u.viewFrom && _ < u.viewTo)
							? x.save()
							: undefined),
						x.nextLine();
				}),
				a && (l.modeFrontier = x.line),
				x
			);
		}
		function Yu(n, i, a, l) {
			const u = n.doc.mode,
				g = new $t(i, n.options.tabSize, a);
			for (g.start = g.pos = l || 0, i == "" && mp(u, a.state); !g.eol(); ) {
				Zu(u, g, a.state), (g.start = g.pos);
			}
		}
		function mp(n, i) {
			if (n.blankLine) {
				return n.blankLine(i);
			}
			if (n.innerMode) {
				const a = js(n, i);
				if (a.mode.blankLine) {
					return a.mode.blankLine(a.state);
				}
			}
		}
		function Zu(n, i, a, l) {
			for (let u = 0; u < 10; u++) {
				l && (l[0] = js(n, a).mode);
				const g = n.token(i, a);
				if (i.pos > i.start) {
					return g;
				}
			}
			throw new Error("Mode " + n.name + " failed to advance stream.");
		}
		const yp = function yp(n, i, a) {
			(this.start = n.start),
				(this.end = n.pos),
				(this.string = n.current()),
				(this.type = i || undefined),
				(this.state = a);
		};
		function bp(n, i, a, l) {
			let u = n.doc,
				g = u.mode,
				y;
			i = Ge(u, i);
			let x = Oe(u, i.line),
				S = Ks(n, i.line, a),
				_ = new $t(x.text, n.options.tabSize, S),
				$;
			for (l && ($ = []); (l || _.pos < i.ch) && !_.eol(); ) {
				(_.start = _.pos),
					(y = Zu(g, _, S.state)),
					l && $.push(new yp(_, y, Mr(u.mode, S.state)));
			}
			return l ? $ : new yp(_, y, S.state);
		}
		function wp(n, i) {
			if (n) {
				for (;;) {
					const a = n.match(/(?:^|\s+)line-(background-)?(\S+)/);
					if (!a) {
						break;
					}
					n = n.slice(0, a.index) + n.slice(a.index + a[0].length);
					const l = a[1] ? "bgClass" : "textClass";
					i[l] == undefined
						? (i[l] = a[2])
						: new RegExp(
								String.raw`(?:^|\s)` + a[2] + String.raw`(?:$|\s)`,
							).test(i[l]) || (i[l] += " " + a[2]);
				}
			}
			return n;
		}
		function xp(n, i, a, l, u, g, y) {
			let x = a.flattenSpans;
			x == undefined && (x = n.options.flattenSpans);
			let S = 0,
				_,
				$ = new $t(i, n.options.tabSize, l),
				D,
				K = n.options.addModeClass && [undefined];
			for (i == "" && wp(mp(a, l.state), g); !$.eol(); ) {
				if (
					($.pos > n.options.maxHighlightLength
						? ((x = !1),
							y && Yu(n, i, l, $.pos),
							($.pos = i.length),
							(D = undefined))
						: (D = wp(Zu(a, $, l.state, K), g)),
					K)
				) {
					const j = K[0].name;
					j && (D = "m-" + (D ? j + " " + D : j));
				}
				if (!x || _ != D) {
					while (S < $.start) {
						(S = Math.min($.start, S + 5e3)), u(S, _);
					}
					_ = D;
				}
				$.start = $.pos;
			}
			while (S < $.pos) {
				const ne = Math.min($.pos, S + 5e3);
				u(ne, _), (S = ne);
			}
		}
		function X1(n, i, a) {
			for (
				var l,
					u,
					g = n.doc,
					y = a ? -1 : i - (n.doc.mode.innerMode ? 1e3 : 100),
					x = i;
				x > y;
				--x
			) {
				if (x <= g.first) {
					return g.first;
				}
				const S = Oe(g, x - 1),
					_ = S.stateAfter;
				if (
					_ &&
					(!a || x + (_ instanceof La ? _.lookAhead : 0) <= g.modeFrontier)
				) {
					return x;
				}
				const $ = de(S.text, undefined, n.options.tabSize);
				(u == undefined || l > $) && ((u = x - 1), (l = $));
			}
			return u;
		}
		function Y1(n, i) {
			if (
				((n.modeFrontier = Math.min(n.modeFrontier, i)),
				!(n.highlightFrontier < i - 10))
			) {
				for (var a = n.first, l = i - 1; l > a; l--) {
					const u = Oe(n, l).stateAfter;
					if (u && (!(u instanceof La) || l + u.lookAhead < i)) {
						a = l + 1;
						break;
					}
				}
				n.highlightFrontier = Math.min(n.highlightFrontier, a);
			}
		}
		let Sp = !1,
			Jr = !1;
		function Z1() {
			Sp = !0;
		}
		function J1() {
			Jr = !0;
		}
		function Aa(n, i, a) {
			(this.marker = n), (this.from = i), (this.to = a);
		}
		function Xs(n, i) {
			if (n) {
				for (let a = 0; a < n.length; ++a) {
					const l = n[a];
					if (l.marker == i) {
						return l;
					}
				}
			}
		}
		function Q1(n, i) {
			for (var a, l = 0; l < n.length; ++l) {
				n[l] != i && (a || (a = [])).push(n[l]);
			}
			return a;
		}
		function ex(n, i, a) {
			const l =
				a &&
				window.WeakSet &&
				(a.markedSpans || (a.markedSpans = new WeakSet()));
			l && n.markedSpans && l.has(n.markedSpans)
				? n.markedSpans.push(i)
				: ((n.markedSpans = n.markedSpans ? n.markedSpans.concat([i]) : [i]),
					l && l.add(n.markedSpans)),
				i.marker.attachLine(n);
		}
		function tx(n, i, a) {
			let l;
			if (n) {
				for (let u = 0; u < n.length; ++u) {
					const g = n[u],
						y = g.marker,
						x =
							g.from == undefined ||
							(y.inclusiveLeft ? g.from <= i : g.from < i);
					if (
						x ||
						(g.from == i && y.type == "bookmark" && !(a && g.marker.insertLeft))
					) {
						const S =
							g.to == undefined || (y.inclusiveRight ? g.to >= i : g.to > i);
						(l || (l = [])).push(new Aa(y, g.from, S ? undefined : g.to));
					}
				}
			}
			return l;
		}
		function nx(n, i, a) {
			let l;
			if (n) {
				for (let u = 0; u < n.length; ++u) {
					const g = n[u],
						y = g.marker,
						x = g.to == undefined || (y.inclusiveRight ? g.to >= i : g.to > i);
					if (
						x ||
						(g.from == i && y.type == "bookmark" && (!a || g.marker.insertLeft))
					) {
						const S =
							g.from == undefined ||
							(y.inclusiveLeft ? g.from <= i : g.from < i);
						(l || (l = [])).push(
							new Aa(
								y,
								S ? undefined : g.from - i,
								g.to == undefined ? undefined : g.to - i,
							),
						);
					}
				}
			}
			return l;
		}
		function Ju(n, i) {
			if (i.full) {
				return ;
			}
			const a = se(n, i.from.line) && Oe(n, i.from.line).markedSpans,
				l = se(n, i.to.line) && Oe(n, i.to.line).markedSpans;
			if (!(a || l)) {
				return ;
			}
			let u = i.from.ch,
				g = i.to.ch,
				y = Se(i.from, i.to) == 0,
				x = tx(a, u, y),
				S = nx(l, g, y),
				_ = i.text.length == 1,
				$ = ue(i.text).length + (_ ? u : 0);
			if (x) {
				for (let D = 0; D < x.length; ++D) {
					const K = x[D];
					if (K.to == undefined) {
						const j = Xs(S, K.marker);
						j
							? _ && (K.to = j.to == undefined ? undefined : j.to + $)
							: (K.to = u);
					}
				}
			}
			if (S) {
				for (let ne = 0; ne < S.length; ++ne) {
					const ce = S[ne];
					if ((ce.to != undefined && (ce.to += $), ce.from == undefined)) {
						const ge = Xs(x, ce.marker);
						ge || ((ce.from = $), _ && (x || (x = [])).push(ce));
					} else {
						(ce.from += $), _ && (x || (x = [])).push(ce);
					}
				}
			}
			x && (x = _p(x)), S && S != x && (S = _p(S));
			const we = [x];
			if (!_) {
				let ke = i.text.length - 2,
					xe;
				if (ke > 0 && x) {
					for (let Me = 0; Me < x.length; ++Me) {
						x[Me].to == undefined &&
							(xe || (xe = [])).push(
								new Aa(x[Me].marker, undefined, undefined),
							);
					}
				}
				for (let Ie = 0; Ie < ke; ++Ie) {
					we.push(xe);
				}
				we.push(S);
			}
			return we;
		}
		function _p(n) {
			for (let i = 0; i < n.length; ++i) {
				const a = n[i];
				a.from != undefined &&
					a.from == a.to &&
					a.marker.clearWhenEmpty !== !1 &&
					n.splice(i--, 1);
			}
			return n.length > 0 ? n : undefined;
		}
		function rx(n, i, a) {
			let l;
			if (
				(n.iter(i.line, a.line + 1, (j) => {
					if (j.markedSpans) {
						for (let ne = 0; ne < j.markedSpans.length; ++ne) {
							const ce = j.markedSpans[ne].marker;
							ce.readOnly &&
								(!l || Ee(l, ce) == -1) &&
								(l || (l = [])).push(ce);
						}
					}
				}),
				!l)
			) {
				return;
			}
			for (var u = [{ from: i, to: a }], g = 0; g < l.length; ++g) {
				for (let y = l[g], x = y.find(0), S = 0; S < u.length; ++S) {
					const _ = u[S];
					if (!(Se(_.to, x.from) < 0 || Se(_.from, x.to) > 0)) {
						const $ = [S, 1],
							D = Se(_.from, x.from),
							K = Se(_.to, x.to);
						(D < 0 || !(y.inclusiveLeft || D)) &&
							$.push({ from: _.from, to: x.from }),
							(K > 0 || !(y.inclusiveRight || K)) &&
								$.push({ from: x.to, to: _.to }),
							u.splice.apply(u, $),
							(S += $.length - 3);
					}
				}
			}
			return u;
		}
		function kp(n) {
			const i = n.markedSpans;
			if (i) {
				for (let a = 0; a < i.length; ++a) {
					i[a].marker.detachLine(n);
				}
				n.markedSpans = undefined;
			}
		}
		function Tp(n, i) {
			if (i) {
				for (let a = 0; a < i.length; ++a) {
					i[a].marker.attachLine(n);
				}
				n.markedSpans = i;
			}
		}
		function Ma(n) {
			return n.inclusiveLeft ? -1 : 0;
		}
		function Na(n) {
			return n.inclusiveRight ? 1 : 0;
		}
		function Qu(n, i) {
			const a = n.lines.length - i.lines.length;
			if (a != 0) {
				return a;
			}
			const l = n.find(),
				u = i.find(),
				g = Se(l.from, u.from) || Ma(n) - Ma(i);
			if (g) {
				return -g;
			}
			const y = Se(l.to, u.to) || Na(n) - Na(i);
			return y || i.id - n.id;
		}
		function Cp(n, i) {
			let a = Jr && n.markedSpans,
				l;
			if (a) {
				for (let u = void 0, g = 0; g < a.length; ++g) {
					(u = a[g]),
						u.marker.collapsed &&
							(i ? u.from : u.to) == undefined &&
							(!l || Qu(l, u.marker) < 0) &&
							(l = u.marker);
				}
			}
			return l;
		}
		function Ep(n) {
			return Cp(n, !0);
		}
		function $a(n) {
			return Cp(n, !1);
		}
		function ix(n, i) {
			let a = Jr && n.markedSpans,
				l;
			if (a) {
				for (let u = 0; u < a.length; ++u) {
					const g = a[u];
					g.marker.collapsed &&
						(g.from == undefined || g.from < i) &&
						(g.to == undefined || g.to > i) &&
						(!l || Qu(l, g.marker) < 0) &&
						(l = g.marker);
				}
			}
			return l;
		}
		function Lp(n, i, a, l, u) {
			const g = Oe(n, i),
				y = Jr && g.markedSpans;
			if (y) {
				for (let x = 0; x < y.length; ++x) {
					const S = y[x];
					if (S.marker.collapsed) {
						const _ = S.marker.find(0),
							$ = Se(_.from, a) || Ma(S.marker) - Ma(u),
							D = Se(_.to, l) || Na(S.marker) - Na(u);
						if (
							!(($ >= 0 && D <= 0) || ($ <= 0 && D >= 0)) &&
							(($ <= 0 &&
								(S.marker.inclusiveRight && u.inclusiveLeft
									? Se(_.to, a) >= 0
									: Se(_.to, a) > 0)) ||
								($ >= 0 &&
									(S.marker.inclusiveRight && u.inclusiveLeft
										? Se(_.from, l) <= 0
										: Se(_.from, l) < 0)))
						) {
							return !0;
						}
					}
				}
			}
		}
		function pr(n) {
			for (let i; (i = Ep(n)); ) {
				n = i.find(-1, !0).line;
			}
			return n;
		}
		function ox(n) {
			for (let i; (i = $a(n)); ) {
				n = i.find(1, !0).line;
			}
			return n;
		}
		function sx(n) {
			for (var i, a; (i = $a(n)); ) {
				(n = i.find(1, !0).line), (a || (a = [])).push(n);
			}
			return a;
		}
		function ef(n, i) {
			const a = Oe(n, i),
				l = pr(a);
			return a == l ? i : T(l);
		}
		function Ap(n, i) {
			if (i > n.lastLine()) {
				return i;
			}
			let a = Oe(n, i),
				l;
			if (!Ti(n, a)) {
				return i;
			}
			while ((l = $a(a))) {
				a = l.find(1, !0).line;
			}
			return T(a) + 1;
		}
		function Ti(n, i) {
			const a = Jr && i.markedSpans;
			if (a) {
				for (let l = void 0, u = 0; u < a.length; ++u) {
					if (((l = a[u]), !!l.marker.collapsed)) {
						if (l.from == undefined) {
							return !0;
						}
						if (
							!l.marker.widgetNode &&
							l.from == 0 &&
							l.marker.inclusiveLeft &&
							tf(n, i, l)
						) {
							return !0;
						}
					}
				}
			}
		}
		function tf(n, i, a) {
			if (a.to == undefined) {
				const l = a.marker.find(1, !0);
				return tf(n, l.line, Xs(l.line.markedSpans, a.marker));
			}
			if (a.marker.inclusiveRight && a.to == i.text.length) {
				return !0;
			}
			for (let u = void 0, g = 0; g < i.markedSpans.length; ++g) {
				if (
					((u = i.markedSpans[g]),
					u.marker.collapsed &&
						!u.marker.widgetNode &&
						u.from == a.to &&
						(u.to == undefined || u.to != a.from) &&
						(u.marker.inclusiveLeft || a.marker.inclusiveRight) &&
						tf(n, i, u))
				) {
					return !0;
				}
			}
		}
		function Qr(n) {
			n = pr(n);
			for (var i = 0, a = n.parent, l = 0; l < a.lines.length; ++l) {
				const u = a.lines[l];
				if (u == n) {
					break;
				}
				i += u.height;
			}
			for (let g = a.parent; g; a = g, g = a.parent) {
				for (let y = 0; y < g.children.length; ++y) {
					const x = g.children[y];
					if (x == a) {
						break;
					}
					i += x.height;
				}
			}
			return i;
		}
		function Pa(n) {
			if (n.height == 0) {
				return 0;
			}
			for (var i = n.text.length, a, l = n; (a = Ep(l)); ) {
				const u = a.find(0, !0);
				(l = u.from.line), (i += u.from.ch - u.to.ch);
			}
			for (l = n; (a = $a(l)); ) {
				const g = a.find(0, !0);
				(i -= l.text.length - g.from.ch),
					(l = g.to.line),
					(i += l.text.length - g.to.ch);
			}
			return i;
		}
		function nf(n) {
			const i = n.display,
				a = n.doc;
			(i.maxLine = Oe(a, a.first)),
				(i.maxLineLength = Pa(i.maxLine)),
				(i.maxLineChanged = !0),
				a.iter((l) => {
					const u = Pa(l);
					u > i.maxLineLength && ((i.maxLineLength = u), (i.maxLine = l));
				});
		}
		const jo = function jo(n, i, a) {
			(this.text = n), Tp(this, i), (this.height = a ? a(this) : 1);
		};
		(jo.prototype.lineNo = function lineNo() {
			return T(this);
		}),
			cr(jo);
		function lx(n, i, a, l) {
			(n.text = i),
				n.stateAfter && (n.stateAfter = undefined),
				n.styles && (n.styles = undefined),
				n.order != undefined && (n.order = undefined),
				kp(n),
				Tp(n, a);
			const u = l ? l(n) : 1;
			u != n.height && Un(n, u);
		}
		function ax(n) {
			(n.parent = undefined), kp(n);
		}
		const cx = {},
			ux = {};
		function Mp(n, i) {
			if (!n || /^\s*$/.test(n)) {
				return ;
			}
			const a = i.addModeClass ? ux : cx;
			return a[n] || (a[n] = n.replaceAll(/\S+/g, "cm-$&"));
		}
		function Np(n, i) {
			const a = B(
					"span",
					undefined,
					undefined,
					v ? "padding-right: .1px" : undefined,
				),
				l = {
					pre: B("pre", [a], "CodeMirror-line"),
					content: a,
					col: 0,
					pos: 0,
					cm: n,
					trailingSpace: !1,
					splitSpaces: n.getOption("lineWrapping"),
				};
			i.measure = {};
			for (let u = 0; u <= (i.rest ? i.rest.length : 0); u++) {
				let g = u ? i.rest[u - 1] : i.line,
					y = void 0;
				(l.pos = 0),
					(l.addToken = dx),
					Si(n.display.measure) &&
						(y = Ve(g, n.doc.direction)) &&
						(l.addToken = px(l.addToken, y)),
					(l.map = []);
				const x = i != n.display.externalMeasured && T(g);
				gx(g, l, vp(n, g, x)),
					g.styleClasses &&
						(g.styleClasses.bgClass &&
							(l.bgClass = Ue(g.styleClasses.bgClass, l.bgClass || "")),
						g.styleClasses.textClass &&
							(l.textClass = Ue(g.styleClasses.textClass, l.textClass || ""))),
					l.map.length === 0 &&
						l.map.push(0, 0, l.content.append(Ca(n.display.measure))),
					u == 0
						? ((i.measure.map = l.map), (i.measure.cache = {}))
						: ((i.measure.maps || (i.measure.maps = [])).push(l.map),
							(i.measure.caches || (i.measure.caches = [])).push({}));
			}
			if (v) {
				const S = l.content.lastChild;
				(/\bcm-tab\b/.test(S.className) ||
					(S.querySelector && S.querySelector(".cm-tab"))) &&
					(l.content.className = "cm-tab-wrap-hack");
			}
			return (
				Mt(n, "renderLine", n, i.line, l.pre),
				l.pre.className &&
					(l.textClass = Ue(l.pre.className, l.textClass || "")),
				l
			);
		}
		function fx(n) {
			const i = k("span", "•", "cm-invalidchar");
			return (
				(i.title = String.raw`\u` + n.codePointAt(0).toString(16)),
				i.setAttribute("aria-label", i.title),
				i
			);
		}
		function dx(n, i, a, l, u, g, y) {
			if (i) {
				let x = n.splitSpaces ? hx(i, n.trailingSpace) : i,
					S = n.cm.state.specialChars,
					_ = !1,
					$;
				if (S.test(i)) {
					$ = document.createDocumentFragment();
					for (let D = 0; ; ) {
						S.lastIndex = D;
						const K = S.exec(i),
							j = K ? K.index - D : i.length - D;
						if (j) {
							const ne = document.createTextNode(x.slice(D, D + j));
							h && p < 9 ? $.append(k("span", [ne])) : $.append(ne),
								n.map.push(n.pos, n.pos + j, ne),
								(n.col += j),
								(n.pos += j);
						}
						if (!K) {
							break;
						}
						D += j + 1;
						let ce = void 0;
						if (K[0] == "	") {
							const ge = n.cm.options.tabSize,
								we = ge - (n.col % ge);
							(ce = $.append(k("span", _e(we), "cm-tab"))),
								ce.setAttribute("role", "presentation"),
								ce.setAttribute("cm-text", "	"),
								(n.col += we);
						} else {
							K[0] == "\r" ||
							K[0] ==
								`
`
								? ((ce = $.append(
										k("span", K[0] == "\r" ? "␍" : "␤", "cm-invalidchar"),
									)),
									ce.setAttribute("cm-text", K[0]),
									(n.col += 1))
								: ((ce = n.cm.options.specialCharPlaceholder(K[0])),
									ce.setAttribute("cm-text", K[0]),
									h && p < 9 ? $.append(k("span", [ce])) : $.append(ce),
									(n.col += 1));
						}
						n.map.push(n.pos, n.pos + 1, ce), n.pos++;
					}
				} else {
					(n.col += i.length),
						($ = document.createTextNode(x)),
						n.map.push(n.pos, n.pos + i.length, $),
						h && p < 9 && (_ = !0),
						(n.pos += i.length);
				}
				if (
					((n.trailingSpace = x.codePointAt(i.length - 1) == 32),
					a || l || u || _ || g || y)
				) {
					let ke = a || "";
					l && (ke += l), u && (ke += u);
					const xe = k("span", [$], ke, g);
					if (y) {
						for (const Me in y) {
							Object.hasOwn(y, Me) &&
								Me != "style" &&
								Me != "class" &&
								xe.setAttribute(Me, y[Me]);
						}
					}
					return n.content.append(xe);
				}
				n.content.append($);
			}
		}
		function hx(n, i) {
			if (n.length > 1 && !/ {2}/.test(n)) {
				return n;
			}
			for (var a = i, l = "", u = 0; u < n.length; u++) {
				let g = n.charAt(u);
				g == " " &&
					a &&
					(u == n.length - 1 || n.codePointAt(u + 1) == 32) &&
					(g = " "),
					(l += g),
					(a = g == " ");
			}
			return l;
		}
		function px(n, i) {
			return (a, l, u, g, y, x, S) => {
				u = u ? u + " cm-force-border" : "cm-force-border";
				for (let _ = a.pos, $ = _ + l.length; ; ) {
					for (
						var D = void 0, K = 0;
						K < i.length && ((D = i[K]), !(D.to > _ && D.from <= _));
						K++
					) {}
					if (D.to >= $) {
						return n(a, l, u, g, y, x, S);
					}
					n(a, l.slice(0, D.to - _), u, g, undefined, x, S),
						(g = undefined),
						(l = l.slice(D.to - _)),
						(_ = D.to);
				}
			};
		}
		function $p(n, i, a, l) {
			let u = !l && a.widgetNode;
			u && n.map.push(n.pos, n.pos + i, u),
				!l &&
					n.cm.display.input.needsContentAttribute &&
					(u || (u = n.content.append(document.createElement("span"))),
					u.setAttribute("cm-marker", a.id)),
				u && (n.cm.display.input.setUneditable(u), n.content.append(u)),
				(n.pos += i),
				(n.trailingSpace = !1);
		}
		function gx(n, i, a) {
			let l = n.markedSpans,
				u = n.text,
				g = 0;
			if (!l) {
				for (let y = 1; y < a.length; y += 2) {
					i.addToken(i, u.slice(g, (g = a[y])), Mp(a[y + 1], i.cm.options));
				}
				return;
			}
			for (
				let x = u.length, S = 0, _ = 1, $ = "", D, K, j = 0, ne, ce, ge, we, ke;
				;
			) {
				if (j == S) {
					(ne = ce = ge = K = ""),
						(ke = undefined),
						(we = undefined),
						(j = 1 / 0);
					for (var xe = [], Me = void 0, Ie = 0; Ie < l.length; ++Ie) {
						const Re = l[Ie],
							Qe = Re.marker;
						if (Qe.type == "bookmark" && Re.from == S && Qe.widgetNode) {
							xe.push(Qe);
						} else if (
							Re.from <= S &&
							(Re.to == undefined ||
								Re.to > S ||
								(Qe.collapsed && Re.to == S && Re.from == S))
						) {
							if (
								(Re.to != undefined &&
									Re.to != S &&
									j > Re.to &&
									((j = Re.to), (ce = "")),
								Qe.className && (ne += " " + Qe.className),
								Qe.css && (K = (K ? K + ";" : "") + Qe.css),
								Qe.startStyle && Re.from == S && (ge += " " + Qe.startStyle),
								Qe.endStyle &&
									Re.to == j &&
									(Me || (Me = [])).push(Qe.endStyle, Re.to),
								Qe.title && ((ke || (ke = {})).title = Qe.title),
								Qe.attributes)
							) {
								for (const St in Qe.attributes) {
									(ke || (ke = {}))[St] = Qe.attributes[St];
								}
							}
							Qe.collapsed && (!we || Qu(we.marker, Qe) < 0) && (we = Re);
						} else {
							Re.from > S && j > Re.from && (j = Re.from);
						}
					}
					if (Me) {
						for (let Xt = 0; Xt < Me.length; Xt += 2) {
							Me[Xt + 1] == j && (ce += " " + Me[Xt]);
						}
					}
					if (!we || we.from == S) {
						for (let Lt = 0; Lt < xe.length; ++Lt) {
							$p(i, 0, xe[Lt]);
						}
					}
					if (we && (we.from || 0) == S) {
						if (
							($p(
								i,
								(we.to == undefined ? x + 1 : we.to) - S,
								we.marker,
								we.from == undefined,
							),
							we.to == undefined)
						) {
							return;
						}
						we.to == S && (we = !1);
					}
				}
				if (S >= x) {
					break;
				}
				for (const Rn = Math.min(x, j); ; ) {
					if ($) {
						const xn = S + $.length;
						if (!we) {
							const It = xn > Rn ? $.slice(0, Rn - S) : $;
							i.addToken(
								i,
								It,
								D ? D + ne : ne,
								ge,
								S + It.length == j ? ce : "",
								K,
								ke,
							);
						}
						if (xn >= Rn) {
							($ = $.slice(Rn - S)), (S = Rn);
							break;
						}
						(S = xn), (ge = "");
					}
					($ = u.slice(g, (g = a[_++]))), (D = Mp(a[_++], i.cm.options));
				}
			}
		}
		function Pp(n, i, a) {
			(this.line = i),
				(this.rest = sx(i)),
				(this.size = this.rest ? T(ue(this.rest)) - a + 1 : 1),
				(this.node = this.text = undefined),
				(this.hidden = Ti(n, i));
		}
		function Oa(n, i, a) {
			for (var l = [], u, g = i; g < a; g = u) {
				const y = new Pp(n.doc, Oe(n.doc, g), g);
				(u = g + y.size), l.push(y);
			}
			return l;
		}
		let Go;
		function vx(n) {
			Go
				? Go.ops.push(n)
				: (n.ownsGroup = Go = { ops: [n], delayedCallbacks: [] });
		}
		function mx(n) {
			let i = n.delayedCallbacks,
				a = 0;
			do {
				for (; a < i.length; a++) {
					i[a].call(undefined);
				}
				for (let l = 0; l < n.ops.length; l++) {
					const u = n.ops[l];
					if (u.cursorActivityHandlers) {
						while (u.cursorActivityCalled < u.cursorActivityHandlers.length) {
							u.cursorActivityHandlers[u.cursorActivityCalled++].call(
								undefined,
								u.cm,
							);
						}
					}
				}
			} while (a < i.length);
		}
		function yx(n, i) {
			const a = n.ownsGroup;
			if (a) {
				try {
					mx(a);
				} finally {
					(Go = undefined), i(a);
				}
			}
		}
		let Ys;
		function jt(n, i) {
			const a = Yr(n, i);
			if (a.length > 0) {
				let l = Array.prototype.slice.call(arguments, 2),
					u;
				Go
					? (u = Go.delayedCallbacks)
					: (Ys
						? (u = Ys)
						: ((u = Ys = []), setTimeout(bx, 0)));
				for (
					let g = (x) => {
							u.push(() => a[x].apply(undefined, l));
						},
						y = 0;
					y < a.length;
					++y
				) {
					g(y);
				}
			}
		}
		function bx() {
			const n = Ys;
			Ys = undefined;
			for (let i = 0; i < n.length; ++i) {
				n[i]();
			}
		}
		function Op(n, i, a, l) {
			for (let u = 0; u < i.changes.length; u++) {
				const g = i.changes[u];
				g == "text"
					? xx(n, i)
					: g == "gutter"
						? Dp(n, i, a, l)
						: g == "class"
							? rf(n, i)
							: g == "widget" && Sx(n, i, l);
			}
			i.changes = undefined;
		}
		function Zs(n) {
			return (
				n.node == n.text &&
					((n.node = k("div", undefined, undefined, "position: relative")),
					n.text.parentNode && n.text.parentNode.replaceChild(n.node, n.text),
					n.node.append(n.text),
					h && p < 8 && (n.node.style.zIndex = 2)),
				n.node
			);
		}
		function wx(n, i) {
			let a = i.bgClass
				? i.bgClass + " " + (i.line.bgClass || "")
				: i.line.bgClass;
			if ((a && (a += " CodeMirror-linebackground"), i.background)) {
				a
					? (i.background.className = a)
					: (i.background.parentNode.removeChild(i.background),
						(i.background = undefined));
			} else if (a) {
				const l = Zs(i);
				(i.background = l.insertBefore(k("div", undefined, a), l.firstChild)),
					n.display.input.setUneditable(i.background);
			}
		}
		function Rp(n, i) {
			const a = n.display.externalMeasured;
			return a && a.line == i.line
				? ((n.display.externalMeasured = undefined),
					(i.measure = a.measure),
					a.built)
				: Np(n, i);
		}
		function xx(n, i) {
			const a = i.text.className,
				l = Rp(n, i);
			i.text == i.node && (i.node = l.pre),
				i.text.parentNode.replaceChild(l.pre, i.text),
				(i.text = l.pre),
				l.bgClass != i.bgClass || l.textClass != i.textClass
					? ((i.bgClass = l.bgClass), (i.textClass = l.textClass), rf(n, i))
					: a && (i.text.className = a);
		}
		function rf(n, i) {
			wx(n, i),
				i.line.wrapClass
					? (Zs(i).className = i.line.wrapClass)
					: i.node != i.text && (i.node.className = "");
			const a = i.textClass
				? i.textClass + " " + (i.line.textClass || "")
				: i.line.textClass;
			i.text.className = a || "";
		}
		function Dp(n, i, a, l) {
			if (
				(i.gutter && (i.node.removeChild(i.gutter), (i.gutter = undefined)),
				i.gutterBackground &&
					(i.node.removeChild(i.gutterBackground),
					(i.gutterBackground = undefined)),
				i.line.gutterClass)
			) {
				const u = Zs(i);
				(i.gutterBackground = k(
					"div",
					undefined,
					"CodeMirror-gutter-background " + i.line.gutterClass,
					"left: " +
						(n.options.fixedGutter ? l.fixedPos : -l.gutterTotalWidth) +
						"px; width: " +
						l.gutterTotalWidth +
						"px",
				)),
					n.display.input.setUneditable(i.gutterBackground),
					u.insertBefore(i.gutterBackground, i.text);
			}
			const g = i.line.gutterMarkers;
			if (n.options.lineNumbers || g) {
				const y = Zs(i),
					x = (i.gutter = k(
						"div",
						undefined,
						"CodeMirror-gutter-wrapper",
						"left: " +
							(n.options.fixedGutter ? l.fixedPos : -l.gutterTotalWidth) +
							"px",
					));
				if (
					(x.setAttribute("aria-hidden", "true"),
					n.display.input.setUneditable(x),
					y.insertBefore(x, i.text),
					i.line.gutterClass && (x.className += " " + i.line.gutterClass),
					n.options.lineNumbers &&
						!(g && g["CodeMirror-linenumbers"]) &&
						(i.lineNumber = x.append(
							k(
								"div",
								pe(n.options, a),
								"CodeMirror-linenumber CodeMirror-gutter-elt",
								"left: " +
									l.gutterLeft["CodeMirror-linenumbers"] +
									"px; width: " +
									n.display.lineNumInnerWidth +
									"px",
							),
						)),
					g)
				) {
					for (let S = 0; S < n.display.gutterSpecs.length; ++S) {
						const _ = n.display.gutterSpecs[S].className,
							$ = Object.hasOwn(g, _) && g[_];
						$ &&
							x.append(
								k(
									"div",
									[$],
									"CodeMirror-gutter-elt",
									"left: " +
										l.gutterLeft[_] +
										"px; width: " +
										l.gutterWidth[_] +
										"px",
								),
							);
					}
				}
			}
		}
		function Sx(n, i, a) {
			i.alignable && (i.alignable = undefined);
			for (
				let l = te("CodeMirror-linewidget"), u = i.node.firstChild, g = void 0;
				u;
				u = g
			) {
				(g = u.nextSibling), l.test(u.className) && i.node.removeChild(u);
			}
			zp(n, i, a);
		}
		function _x(n, i, a, l) {
			const u = Rp(n, i);
			return (
				(i.text = i.node = u.pre),
				u.bgClass && (i.bgClass = u.bgClass),
				u.textClass && (i.textClass = u.textClass),
				rf(n, i),
				Dp(n, i, a, l),
				zp(n, i, l),
				i.node
			);
		}
		function zp(n, i, a) {
			if ((Ip(n, i.line, i, a, !0), i.rest)) {
				for (let l = 0; l < i.rest.length; l++) {
					Ip(n, i.rest[l], i, a, !1);
				}
			}
		}
		function Ip(n, i, a, l, u) {
			if (i.widgets) {
				for (let g = Zs(a), y = 0, x = i.widgets; y < x.length; ++y) {
					const S = x[y],
						_ = k(
							"div",
							[S.node],
							"CodeMirror-linewidget" + (S.className ? " " + S.className : ""),
						);
					S.handleMouseEvents || _.setAttribute("cm-ignore-events", "true"),
						kx(S, _, a, l),
						n.display.input.setUneditable(_),
						u && S.above ? g.insertBefore(_, a.gutter || a.text) : g.append(_),
						jt(S, "redraw");
				}
			}
		}
		function kx(n, i, a, l) {
			if (n.noHScroll) {
				(a.alignable || (a.alignable = [])).push(i);
				let u = l.wrapperWidth;
				(i.style.left = l.fixedPos + "px"),
					n.coverGutter ||
						((u -= l.gutterTotalWidth),
						(i.style.paddingLeft = l.gutterTotalWidth + "px")),
					(i.style.width = u + "px");
			}
			n.coverGutter &&
				((i.style.zIndex = 5),
				(i.style.position = "relative"),
				n.noHScroll || (i.style.marginLeft = -l.gutterTotalWidth + "px"));
		}
		function Js(n) {
			if (n.height != undefined) {
				return n.height;
			}
			const i = n.doc.cm;
			if (!i) {
				return 0;
			}
			if (!ie(document.body, n.node)) {
				let a = "position: relative;";
				n.coverGutter &&
					(a += "margin-left: -" + i.display.gutters.offsetWidth + "px;"),
					n.noHScroll &&
						(a += "width: " + i.display.wrapper.clientWidth + "px;"),
					F(i.display.measure, k("div", [n.node], undefined, a));
			}
			return (n.height = n.node.parentNode.offsetHeight);
		}
		function ei(n, i) {
			for (let a = Us(i); a != n.wrapper; a = a.parentNode) {
				if (
					!a ||
					(a.nodeType == 1 && a.getAttribute("cm-ignore-events") == "true") ||
					(a.parentNode == n.sizer && a != n.mover)
				) {
					return !0;
				}
			}
		}
		function Ra(n) {
			return n.lineSpace.offsetTop;
		}
		function of(n) {
			return n.mover.offsetHeight - n.lineSpace.offsetHeight;
		}
		function Fp(n) {
			if (n.cachedPaddingH) {
				return n.cachedPaddingH;
			}
			const i = F(n.measure, k("pre", "x", "CodeMirror-line-like")),
				a = window.getComputedStyle
					? window.getComputedStyle(i)
					: i.currentStyle,
				l = {
					left: Number.parseInt(a.paddingLeft),
					right: Number.parseInt(a.paddingRight),
				};
			return !(isNaN(l.left) || isNaN(l.right)) && (n.cachedPaddingH = l), l;
		}
		function $r(n) {
			return Ze - n.display.nativeBarWidth;
		}
		function ao(n) {
			return n.display.scroller.clientWidth - $r(n) - n.display.barWidth;
		}
		function sf(n) {
			return n.display.scroller.clientHeight - $r(n) - n.display.barHeight;
		}
		function Tx(n, i, a) {
			const l = n.options.lineWrapping,
				u = l && ao(n);
			if (!i.measure.heights || (l && i.measure.width != u)) {
				const g = (i.measure.heights = []);
				if (l) {
					i.measure.width = u;
					for (
						let y = i.text.firstChild.getClientRects(), x = 0;
						x < y.length - 1;
						x++
					) {
						const S = y[x],
							_ = y[x + 1];
						Math.abs(S.bottom - _.bottom) > 2 &&
							g.push((S.bottom + _.top) / 2 - a.top);
					}
				}
				g.push(a.bottom - a.top);
			}
		}
		function Hp(n, i, a) {
			if (n.line == i) {
				return { map: n.measure.map, cache: n.measure.cache };
			}
			if (n.rest) {
				for (let l = 0; l < n.rest.length; l++) {
					if (n.rest[l] == i) {
						return { map: n.measure.maps[l], cache: n.measure.caches[l] };
					}
				}
				for (let u = 0; u < n.rest.length; u++) {
					if (T(n.rest[u]) > a) {
						return {
							map: n.measure.maps[u],
							cache: n.measure.caches[u],
							before: !0,
						};
					}
				}
			}
		}
		function Cx(n, i) {
			i = pr(i);
			const a = T(i),
				l = (n.display.externalMeasured = new Pp(n.doc, i, a));
			l.lineN = a;
			const u = (l.built = Np(n, l));
			return (l.text = u.pre), F(n.display.lineMeasure, u.pre), l;
		}
		function qp(n, i, a, l) {
			return Pr(n, Ko(n, i), a, l);
		}
		function lf(n, i) {
			if (i >= n.display.viewFrom && i < n.display.viewTo) {
				return n.display.view[fo(n, i)];
			}
			const a = n.display.externalMeasured;
			if (a && i >= a.lineN && i < a.lineN + a.size) {
				return a;
			}
		}
		function Ko(n, i) {
			let a = T(i),
				l = lf(n, a);
			l && !l.text
				? (l = undefined)
				: l && l.changes && (Op(n, l, a, df(n)), (n.curOp.forceUpdate = !0)),
				l || (l = Cx(n, i));
			const u = Hp(l, i, a);
			return {
				line: i,
				view: l,
				rect: undefined,
				map: u.map,
				cache: u.cache,
				before: u.before,
				hasHeights: !1,
			};
		}
		function Pr(n, i, a, l, u) {
			i.before && (a = -1);
			let g = a + (l || ""),
				y;
			return (
				Object.hasOwn(i.cache, g)
					? (y = i.cache[g])
					: (i.rect || (i.rect = i.view.text.getBoundingClientRect()),
						i.hasHeights || (Tx(n, i.view, i.rect), (i.hasHeights = !0)),
						(y = Lx(n, i, a, l)),
						y.bogus || (i.cache[g] = y)),
				{
					left: y.left,
					right: y.right,
					top: u ? y.rtop : y.top,
					bottom: u ? y.rbottom : y.bottom,
				}
			);
		}
		const Bp = { left: 0, right: 0, top: 0, bottom: 0 };
		function Wp(n, i, a) {
			for (var l, u, g, y, x, S, _ = 0; _ < n.length; _ += 3) {
				if (
					((x = n[_]),
					(S = n[_ + 1]),
					i < x
						? ((u = 0), (g = 1), (y = "left"))
						: (i < S
							? ((u = i - x), (g = u + 1))
							: (_ == n.length - 3 || (i == S && n[_ + 3] > i)) &&
								((g = S - x), (u = g - 1), i >= S && (y = "right"))),
					u != undefined)
				) {
					if (
						((l = n[_ + 2]),
						x == S && a == (l.insertLeft ? "left" : "right") && (y = a),
						a == "left" && u == 0)
					) {
						while (_ && n[_ - 2] == n[_ - 3] && n[_ - 1].insertLeft) {
							(l = n[(_ -= 3) + 2]), (y = "left");
						}
					}
					if (a == "right" && u == S - x) {
						while (
							_ < n.length - 3 &&
							n[_ + 3] == n[_ + 4] &&
							!n[_ + 5].insertLeft
						) {
							(l = n[(_ += 3) + 2]), (y = "right");
						}
					}
					break;
				}
			}
			return {
				node: l,
				start: u,
				end: g,
				collapse: y,
				coverStart: x,
				coverEnd: S,
			};
		}
		function Ex(n, i) {
			let a = Bp;
			if (i == "left") {
				for (let l = 0; l < n.length && (a = n[l]).left == a.right; l++) {}
			} else {
				for (let u = n.length - 1; u >= 0 && (a = n[u]).left == a.right; u--){;}
			}
			return a;
		}
		function Lx(n, i, a, l) {
			let u = Wp(i.map, a, l),
				g = u.node,
				y = u.start,
				x = u.end,
				S = u.collapse,
				_;
			if (g.nodeType == 3) {
				for (let $ = 0; $ < 4; $++) {
					while (y && lt(i.line.text.charAt(u.coverStart + y))) {
						--y;
					}
					while (
						u.coverStart + x < u.coverEnd &&
						lt(i.line.text.charAt(u.coverStart + x))
					) {
						++x;
					}
					if (
						(h && p < 9 && y == 0 && x == u.coverEnd - u.coverStart
							? (_ = g.parentNode.getBoundingClientRect())
							: (_ = Ex(V(g, y, x).getClientRects(), l)),
						_.left || _.right || y == 0)
					) {
						break;
					}
					(x = y), (y -= 1), (S = "right");
				}
				h && p < 11 && (_ = Ax(n.display.measure, _));
			} else {
				y > 0 && (S = l = "right");
				let D;
				n.options.lineWrapping && (D = g.getClientRects()).length > 1
					? (_ = D[l == "right" ? D.length - 1 : 0])
					: (_ = g.getBoundingClientRect());
			}
			if (h && p < 9 && !y && !(_ && (_.left || _.right))) {
				const K = g.parentNode.getClientRects()[0];
				K
					? (_ = {
							left: K.left,
							right: K.left + Yo(n.display),
							top: K.top,
							bottom: K.bottom,
						})
					: (_ = Bp);
			}
			for (
				var j = _.top - i.rect.top,
					ne = _.bottom - i.rect.top,
					ce = (j + ne) / 2,
					ge = i.view.measure.heights,
					we = 0;
				we < ge.length - 1 && !(ce < ge[we]);
				we++
			) {}
			const ke = we ? ge[we - 1] : 0,
				xe = ge[we],
				Me = {
					left: (S == "right" ? _.right : _.left) - i.rect.left,
					right: (S == "left" ? _.left : _.right) - i.rect.left,
					top: ke,
					bottom: xe,
				};
			return (
				!(_.left || _.right) && (Me.bogus = !0),
				n.options.singleCursorHeightPerLine ||
					((Me.rtop = j), (Me.rbottom = ne)),
				Me
			);
		}
		function Ax(n, i) {
			if (
				!window.screen ||
				screen.logicalXDPI == undefined ||
				screen.logicalXDPI == screen.deviceXDPI ||
				!Xu(n)
			) {
				return i;
			}
			const a = screen.logicalXDPI / screen.deviceXDPI,
				l = screen.logicalYDPI / screen.deviceYDPI;
			return {
				left: i.left * a,
				right: i.right * a,
				top: i.top * l,
				bottom: i.bottom * l,
			};
		}
		function Up(n) {
			if (
				n.measure &&
				((n.measure.cache = {}), (n.measure.heights = undefined), n.rest)
			) {
				for (let i = 0; i < n.rest.length; i++) {
					n.measure.caches[i] = {};
				}
			}
		}
		function Vp(n) {
			(n.display.externalMeasure = undefined), q(n.display.lineMeasure);
			for (let i = 0; i < n.display.view.length; i++) {
				Up(n.display.view[i]);
			}
		}
		function Qs(n) {
			Vp(n),
				(n.display.cachedCharWidth =
					n.display.cachedTextHeight =
					n.display.cachedPaddingH =
						undefined),
				n.options.lineWrapping || (n.display.maxLineChanged = !0),
				(n.display.lineNumChars = undefined);
		}
		function jp(n) {
			return b && P
				? -(
						n.body.getBoundingClientRect().left -
						Number.parseInt(getComputedStyle(n.body).marginLeft)
					)
				: n.defaultView.pageXOffset || (n.documentElement || n.body).scrollLeft;
		}
		function Gp(n) {
			return b && P
				? -(
						n.body.getBoundingClientRect().top -
						Number.parseInt(getComputedStyle(n.body).marginTop)
					)
				: n.defaultView.pageYOffset || (n.documentElement || n.body).scrollTop;
		}
		function af(n) {
			let i = pr(n),
				a = i.widgets,
				l = 0;
			if (a) {
				for (let u = 0; u < a.length; ++u) {
					a[u].above && (l += Js(a[u]));
				}
			}
			return l;
		}
		function Da(n, i, a, l, u) {
			if (!u) {
				const g = af(i);
				(a.top += g), (a.bottom += g);
			}
			if (l == "line") {
				return a;
			}
			l || (l = "local");
			let y = Qr(i);
			if (
				(l == "local" ? (y += Ra(n.display)) : (y -= n.display.viewOffset),
				l == "page" || l == "window")
			) {
				const x = n.display.lineSpace.getBoundingClientRect();
				y += x.top + (l == "window" ? 0 : Gp(it(n)));
				const S = x.left + (l == "window" ? 0 : jp(it(n)));
				(a.left += S), (a.right += S);
			}
			return (a.top += y), (a.bottom += y), a;
		}
		function Kp(n, i, a) {
			if (a == "div") {
				return i;
			}
			let l = i.left,
				u = i.top;
			if (a == "page") {
				(l -= jp(it(n))), (u -= Gp(it(n)));
			} else if (a == "local" || !a) {
				const g = n.display.sizer.getBoundingClientRect();
				(l += g.left), (u += g.top);
			}
			const y = n.display.lineSpace.getBoundingClientRect();
			return { left: l - y.left, top: u - y.top };
		}
		function za(n, i, a, l, u) {
			return l || (l = Oe(n.doc, i.line)), Da(n, l, qp(n, l, i.ch, u), a);
		}
		function gr(n, i, a, l, u, g) {
			(l = l || Oe(n.doc, i.line)), u || (u = Ko(n, l));
			function y(ne, ce) {
				const ge = Pr(n, u, ne, ce ? "right" : "left", g);
				return (
					ce ? (ge.left = ge.right) : (ge.right = ge.left), Da(n, l, ge, a)
				);
			}
			let x = Ve(l, n.doc.direction),
				S = i.ch,
				_ = i.sticky;
			if (
				(S >= l.text.length
					? ((S = l.text.length), (_ = "before"))
					: S <= 0 && ((S = 0), (_ = "after")),
				!x)
			) {
				return y(_ == "before" ? S - 1 : S, _ == "before");
			}
			function $(ne, ce, ge) {
				const we = x[ce],
					ke = we.level == 1;
				return y(ge ? ne - 1 : ne, ke != ge);
			}
			const D = ar(x, S, _),
				K = Wn,
				j = $(S, D, _ == "before");
			return K != undefined && (j.other = $(S, K, _ != "before")), j;
		}
		function Xp(n, i) {
			let a = 0;
			(i = Ge(n.doc, i)), n.options.lineWrapping || (a = Yo(n.display) * i.ch);
			const l = Oe(n.doc, i.line),
				u = Qr(l) + Ra(n.display);
			return { left: a, right: a, top: u, bottom: u + l.height };
		}
		function cf(n, i, a, l, u) {
			const g = ee(n, i, a);
			return (g.xRel = u), l && (g.outside = l), g;
		}
		function uf(n, i, a) {
			const l = n.doc;
			if (((a += n.display.viewOffset), a < 0)) {
				return cf(l.first, 0, undefined, -1, -1);
			}
			let u = R(l, a),
				g = l.first + l.size - 1;
			if (u > g) {
				return cf(l.first + l.size - 1, Oe(l, g).text.length, undefined, 1, 1);
			}
			i < 0 && (i = 0);
			for (let y = Oe(l, u); ; ) {
				const x = Mx(n, y, u, i, a),
					S = ix(y, x.ch + (x.xRel > 0 || x.outside > 0 ? 1 : 0));
				if (!S) {
					return x;
				}
				const _ = S.find(1);
				if (_.line == u) {
					return _;
				}
				y = Oe(l, (u = _.line));
			}
		}
		function Yp(n, i, a, l) {
			l -= af(i);
			let u = i.text.length,
				g = Rt((y) => Pr(n, a, y - 1).bottom <= l, u, 0);
			return (u = Rt((y) => Pr(n, a, y).top > l, g, u)), { begin: g, end: u };
		}
		function Zp(n, i, a, l) {
			a || (a = Ko(n, i));
			const u = Da(n, i, Pr(n, a, l), "line").top;
			return Yp(n, i, a, u);
		}
		function ff(n, i, a, l) {
			return n.bottom <= a ? !1 : (n.top > a ? !0 : (l ? n.left : n.right) > i);
		}
		function Mx(n, i, a, l, u) {
			u -= Qr(i);
			let g = Ko(n, i),
				y = af(i),
				x = 0,
				S = i.text.length,
				_ = !0,
				$ = Ve(i, n.doc.direction);
			if ($) {
				const D = (n.options.lineWrapping ? $x : Nx)(n, i, a, g, $, l, u);
				(_ = D.level != 1),
					(x = _ ? D.from : D.to - 1),
					(S = _ ? D.to : D.from - 1);
			}
			let K,
				j,
				ne = Rt(
					(Ie) => {
						const Re = Pr(n, g, Ie);
						return (
							(Re.top += y),
							(Re.bottom += y),
							ff(Re, l, u, !1)
								? (Re.top <= u && Re.left <= l && ((K = Ie), (j = Re)), !0)
								: !1
						);
					},
					x,
					S,
				),
				ce,
				ge,
				we = !1;
			if (j) {
				const ke = l - j.left < j.right - l,
					xe = ke == _;
				(ne = K + (xe ? 0 : 1)),
					(ge = xe ? "after" : "before"),
					(ce = ke ? j.left : j.right);
			} else {
				!_ && (ne == S || ne == x) && ne++,
					(ge =
						ne == 0
							? "after"
							: ne == i.text.length
								? "before"
								: Pr(n, g, ne - (_ ? 1 : 0)).bottom + y <= u == _
									? "after"
									: "before");
				const Me = gr(n, ee(a, ne, ge), "line", i, g);
				(ce = Me.left), (we = u < Me.top ? -1 : (u >= Me.bottom ? 1 : 0));
			}
			return (ne = Tt(i.text, ne, 1)), cf(a, ne, ge, we, l - ce);
		}
		function Nx(n, i, a, l, u, g, y) {
			let x = Rt(
					(D) => {
						const K = u[D],
							j = K.level != 1;
						return ff(
							gr(
								n,
								ee(a, j ? K.to : K.from, j ? "before" : "after"),
								"line",
								i,
								l,
							),
							g,
							y,
							!0,
						);
					},
					0,
					u.length - 1,
				),
				S = u[x];
			if (x > 0) {
				const _ = S.level != 1,
					$ = gr(
						n,
						ee(a, _ ? S.from : S.to, _ ? "after" : "before"),
						"line",
						i,
						l,
					);
				ff($, g, y, !0) && $.top > y && (S = u[x - 1]);
			}
			return S;
		}
		function $x(n, i, a, l, u, g, y) {
			let x = Yp(n, i, l, y),
				S = x.begin,
				_ = x.end;
			/\s/.test(i.text.charAt(_ - 1)) && _--;
			for (var $, D, K = 0; K < u.length; K++) {
				const j = u[K];
				if (!(j.from >= _ || j.to <= S)) {
					const ne = j.level != 1,
						ce = Pr(
							n,
							l,
							ne ? Math.min(_, j.to) - 1 : Math.max(S, j.from),
						).right,
						ge = ce < g ? g - ce + 1e9 : ce - g;
					(!$ || D > ge) && (($ = j), (D = ge));
				}
			}
			return (
				$ || ($ = u[u.length - 1]),
				$.from < S && ($ = { from: S, to: $.to, level: $.level }),
				$.to > _ && ($ = { from: $.from, to: _, level: $.level }),
				$
			);
		}
		let co;
		function Xo(n) {
			if (n.cachedTextHeight != undefined) {
				return n.cachedTextHeight;
			}
			if (co == undefined) {
				co = k("pre", undefined, "CodeMirror-line-like");
				for (let i = 0; i < 49; ++i) {
					co.append(document.createTextNode("x")), co.append(k("br"));
				}
				co.append(document.createTextNode("x"));
			}
			F(n.measure, co);
			const a = co.offsetHeight / 50;
			return a > 3 && (n.cachedTextHeight = a), q(n.measure), a || 1;
		}
		function Yo(n) {
			if (n.cachedCharWidth != undefined) {
				return n.cachedCharWidth;
			}
			const i = k("span", "xxxxxxxxxx"),
				a = k("pre", [i], "CodeMirror-line-like");
			F(n.measure, a);
			const l = i.getBoundingClientRect(),
				u = (l.right - l.left) / 10;
			return u > 2 && (n.cachedCharWidth = u), u || 10;
		}
		function df(n) {
			for (
				var i = n.display,
					a = {},
					l = {},
					u = i.gutters.clientLeft,
					g = i.gutters.firstChild,
					y = 0;
				g;
				g = g.nextSibling, ++y
			) {
				const x = n.display.gutterSpecs[y].className;
				(a[x] = g.offsetLeft + g.clientLeft + u), (l[x] = g.clientWidth);
			}
			return {
				fixedPos: hf(i),
				gutterTotalWidth: i.gutters.offsetWidth,
				gutterLeft: a,
				gutterWidth: l,
				wrapperWidth: i.wrapper.clientWidth,
			};
		}
		function hf(n) {
			return (
				n.scroller.getBoundingClientRect().left -
				n.sizer.getBoundingClientRect().left
			);
		}
		function Jp(n) {
			const i = Xo(n.display),
				a = n.options.lineWrapping,
				l =
					a && Math.max(5, n.display.scroller.clientWidth / Yo(n.display) - 3);
			return (u) => {
				if (Ti(n.doc, u)) {
					return 0;
				}
				let g = 0;
				if (u.widgets) {
					for (let y = 0; y < u.widgets.length; y++) {
						u.widgets[y].height && (g += u.widgets[y].height);
					}
				}
				return a ? g + (Math.ceil(u.text.length / l) || 1) * i : g + i;
			};
		}
		function pf(n) {
			const i = n.doc,
				a = Jp(n);
			i.iter((l) => {
				const u = a(l);
				u != l.height && Un(l, u);
			});
		}
		function uo(n, i, a, l) {
			const u = n.display;
			if (!a && Us(i).getAttribute("cm-not-content") == "true") {
				return ;
			}
			let g,
				y,
				x = u.lineSpace.getBoundingClientRect();
			try {
				(g = i.clientX - x.left), (y = i.clientY - x.top);
			} catch {
				return;
			}
			let S = uf(n, g, y),
				_;
			if (l && S.xRel > 0 && (_ = Oe(n.doc, S.line).text).length == S.ch) {
				const $ = de(_, _.length, n.options.tabSize) - _.length;
				S = ee(
					S.line,
					Math.max(0, Math.round((g - Fp(n.display).left) / Yo(n.display)) - $),
				);
			}
			return S;
		}
		function fo(n, i) {
			if (i >= n.display.viewTo || ((i -= n.display.viewFrom), i < 0)) {
				return ;
			}
			for (let a = n.display.view, l = 0; l < a.length; l++) {
				if (((i -= a[l].size), i < 0)) {
					return l;
				}
			}
		}
		function bn(n, i, a, l) {
			i == undefined && (i = n.doc.first),
				a == undefined && (a = n.doc.first + n.doc.size),
				l || (l = 0);
			const u = n.display;
			if (
				(l &&
					a < u.viewTo &&
					(u.updateLineNumbers == undefined || u.updateLineNumbers > i) &&
					(u.updateLineNumbers = i),
				(n.curOp.viewChanged = !0),
				i >= u.viewTo)
			) {
				Jr && ef(n.doc, i) < u.viewTo && Ei(n);
			} else if (a <= u.viewFrom) {
				Jr && Ap(n.doc, a + l) > u.viewFrom
					? Ei(n)
					: ((u.viewFrom += l), (u.viewTo += l));
			} else if (i <= u.viewFrom && a >= u.viewTo) {
				Ei(n);
			} else if (i <= u.viewFrom) {
				const g = Ia(n, a, a + l, 1);
				g
					? ((u.view = u.view.slice(g.index)),
						(u.viewFrom = g.lineN),
						(u.viewTo += l))
					: Ei(n);
			} else if (a >= u.viewTo) {
				const y = Ia(n, i, i, -1);
				y ? ((u.view = u.view.slice(0, y.index)), (u.viewTo = y.lineN)) : Ei(n);
			} else {
				const x = Ia(n, i, i, -1),
					S = Ia(n, a, a + l, 1);
				x && S
					? ((u.view = u.view
							.slice(0, x.index)
							.concat(Oa(n, x.lineN, S.lineN))
							.concat(u.view.slice(S.index))),
						(u.viewTo += l))
					: Ei(n);
			}
			const _ = u.externalMeasured;
			_ &&
				(a < _.lineN
					? (_.lineN += l)
					: i < _.lineN + _.size && (u.externalMeasured = undefined));
		}
		function Ci(n, i, a) {
			n.curOp.viewChanged = !0;
			const l = n.display,
				u = n.display.externalMeasured;
			if (
				(u &&
					i >= u.lineN &&
					i < u.lineN + u.size &&
					(l.externalMeasured = undefined),
				!(i < l.viewFrom || i >= l.viewTo))
			) {
				const g = l.view[fo(n, i)];
				if (g.node != undefined) {
					const y = g.changes || (g.changes = []);
					Ee(y, a) == -1 && y.push(a);
				}
			}
		}
		function Ei(n) {
			(n.display.viewFrom = n.display.viewTo = n.doc.first),
				(n.display.view = []),
				(n.display.viewOffset = 0);
		}
		function Ia(n, i, a, l) {
			let u = fo(n, i),
				g,
				y = n.display.view;
			if (!Jr || a == n.doc.first + n.doc.size) {
				return { index: u, lineN: a };
			}
			for (var x = n.display.viewFrom, S = 0; S < u; S++) {
				x += y[S].size;
			}
			if (x != i) {
				if (l > 0) {
					if (u == y.length - 1) {
						return ;
					}
					(g = x + y[u].size - i), u++;
				} else {
					g = x - i;
				}
				(i += g), (a += g);
			}
			while (ef(n.doc, a) != a) {
				if (u == (l < 0 ? 0 : y.length - 1)) {
					return ;
				}
				(a += l * y[u - (l < 0 ? 1 : 0)].size), (u += l);
			}
			return { index: u, lineN: a };
		}
		function Px(n, i, a) {
			const l = n.display,
				u = l.view;
			u.length === 0 || i >= l.viewTo || a <= l.viewFrom
				? ((l.view = Oa(n, i, a)), (l.viewFrom = i))
				: (l.viewFrom > i
						? (l.view = Oa(n, i, l.viewFrom).concat(l.view))
						: l.viewFrom < i && (l.view = l.view.slice(fo(n, i))),
					(l.viewFrom = i),
					l.viewTo < a
						? (l.view = l.view.concat(Oa(n, l.viewTo, a)))
						: l.viewTo > a && (l.view = l.view.slice(0, fo(n, a)))),
				(l.viewTo = a);
		}
		function Qp(n) {
			for (var i = n.display.view, a = 0, l = 0; l < i.length; l++) {
				const u = i[l];
				!u.hidden && (!u.node || u.changes) && ++a;
			}
			return a;
		}
		function el(n) {
			n.display.input.showSelection(n.display.input.prepareSelection());
		}
		function eg(n, i) {
			i === void 0 && (i = !0);
			const a = n.doc,
				l = {},
				u = (l.cursors = document.createDocumentFragment()),
				g = (l.selection = document.createDocumentFragment()),
				y = n.options.$customCursor;
			y && (i = !0);
			for (let x = 0; x < a.sel.ranges.length; x++) {
				if (!(!i && x == a.sel.primIndex)) {
					const S = a.sel.ranges[x];
					if (
						!(
							S.from().line >= n.display.viewTo ||
							S.to().line < n.display.viewFrom
						)
					) {
						const _ = S.empty();
						if (y) {
							const $ = y(n, S);
							$ && gf(n, $, u);
						} else {
							(_ || n.options.showCursorWhenSelecting) && gf(n, S.head, u);
						}
						_ || Ox(n, S, g);
					}
				}
			}
			return l;
		}
		function gf(n, i, a) {
			const l = gr(
					n,
					i,
					"div",
					undefined,
					undefined,
					!n.options.singleCursorHeightPerLine,
				),
				u = a.append(k("div", " ", "CodeMirror-cursor"));
			if (
				((u.style.left = l.left + "px"),
				(u.style.top = l.top + "px"),
				(u.style.height =
					Math.max(0, l.bottom - l.top) * n.options.cursorHeight + "px"),
				/\bcm-fat-cursor\b/.test(n.getWrapperElement().className))
			) {
				const g = za(n, i, "div"),
					y = g.right - g.left;
				u.style.width = (y > 0 ? y : n.defaultCharWidth()) + "px";
			}
			if (l.other) {
				const x = a.append(
					k("div", " ", "CodeMirror-cursor CodeMirror-secondarycursor"),
				);
				(x.style.display = ""),
					(x.style.left = l.other.left + "px"),
					(x.style.top = l.other.top + "px"),
					(x.style.height = (l.other.bottom - l.other.top) * 0.85 + "px");
			}
		}
		function Fa(n, i) {
			return n.top - i.top || n.left - i.left;
		}
		function Ox(n, i, a) {
			const l = n.display,
				u = n.doc,
				g = document.createDocumentFragment(),
				y = Fp(n.display),
				x = y.left,
				S = Math.max(l.sizerWidth, ao(n) - l.sizer.offsetLeft) - y.right,
				_ = u.direction == "ltr";
			function $(xe, Me, Ie, Re) {
				Me < 0 && (Me = 0),
					(Me = Math.round(Me)),
					(Re = Math.round(Re)),
					g.append(
						k(
							"div",
							undefined,
							"CodeMirror-selected",
							"position: absolute; left: " +
								xe +
								`px;
                             top: ` +
								Me +
								"px; width: " +
								(Ie ?? S - xe) +
								`px;
                             height: ` +
								(Re - Me) +
								"px",
						),
					);
			}
			function D(xe, Me, Ie) {
				let Re = Oe(u, xe),
					Qe = Re.text.length,
					St,
					Xt;
				function Lt(It, Sn) {
					return za(n, ee(xe, It), "div", Re, Sn);
				}
				function Rn(It, Sn, Qt) {
					const Ut = Zp(n, Re, undefined, It),
						Ft = (Sn == "ltr") == (Qt == "after") ? "left" : "right",
						Pt =
							Qt == "after"
								? Ut.begin
								: Ut.end - (/\s/.test(Re.text.charAt(Ut.end - 1)) ? 2 : 1);
					return Lt(Pt, Ft)[Ft];
				}
				const xn = Ve(Re, u.direction);
				return (
					Dt(xn, Me || 0, Ie ?? Qe, (It, Sn, Qt, Ut) => {
						const Ft = Qt == "ltr",
							Pt = Lt(It, Ft ? "left" : "right"),
							_n = Lt(Sn - 1, Ft ? "right" : "left"),
							cs = Me == undefined && It == 0,
							Pi = Ie == undefined && Sn == Qe,
							sn = Ut == 0,
							Or = !xn || Ut == xn.length - 1;
						if (_n.top - Pt.top <= 3) {
							const Yt = (_ ? cs : Pi) && sn,
								Bf = (_ ? Pi : cs) && Or,
								ri = Yt ? x : (Ft ? Pt : _n).left,
								mo = Bf ? S : (Ft ? _n : Pt).right;
							$(ri, Pt.top, mo - ri, Pt.bottom);
						} else {
							let yo, dn, us, Wf;
							Ft
								? ((yo = _ && cs && sn ? x : Pt.left),
									(dn = _ ? S : Rn(It, Qt, "before")),
									(us = _ ? x : Rn(Sn, Qt, "after")),
									(Wf = _ && Pi && Or ? S : _n.right))
								: ((yo = _ ? Rn(It, Qt, "before") : x),
									(dn = !_ && cs && sn ? S : Pt.right),
									(us = !_ && Pi && Or ? x : _n.left),
									(Wf = _ ? Rn(Sn, Qt, "after") : S)),
								$(yo, Pt.top, dn - yo, Pt.bottom),
								Pt.bottom < _n.top && $(x, Pt.bottom, undefined, _n.top),
								$(us, _n.top, Wf - us, _n.bottom);
						}
						(!St || Fa(Pt, St) < 0) && (St = Pt),
							Fa(_n, St) < 0 && (St = _n),
							(!Xt || Fa(Pt, Xt) < 0) && (Xt = Pt),
							Fa(_n, Xt) < 0 && (Xt = _n);
					}),
					{ start: St, end: Xt }
				);
			}
			const K = i.from(),
				j = i.to();
			if (K.line == j.line) {
				D(K.line, K.ch, j.ch);
			} else {
				const ne = Oe(u, K.line),
					ce = Oe(u, j.line),
					ge = pr(ne) == pr(ce),
					we = D(K.line, K.ch, ge ? ne.text.length + 1 : undefined).end,
					ke = D(j.line, ge ? 0 : undefined, j.ch).start;
				ge &&
					(we.top < ke.top - 2
						? ($(we.right, we.top, undefined, we.bottom),
							$(x, ke.top, ke.left, ke.bottom))
						: $(we.right, we.top, ke.left - we.right, we.bottom)),
					we.bottom < ke.top && $(x, we.bottom, undefined, ke.top);
			}
			a.append(g);
		}
		function vf(n) {
			if (n.state.focused) {
				const i = n.display;
				clearInterval(i.blinker);
				let a = !0;
				(i.cursorDiv.style.visibility = ""),
					n.options.cursorBlinkRate > 0
						? (i.blinker = setInterval(() => {
								n.hasFocus() || Zo(n),
									(i.cursorDiv.style.visibility = (a = !a) ? "" : "hidden");
							}, n.options.cursorBlinkRate))
						: n.options.cursorBlinkRate < 0 &&
							(i.cursorDiv.style.visibility = "hidden");
			}
		}
		function tg(n) {
			n.hasFocus() || (n.display.input.focus(), n.state.focused || yf(n));
		}
		function mf(n) {
			(n.state.delayingBlurEvent = !0),
				setTimeout(() => {
					n.state.delayingBlurEvent &&
						((n.state.delayingBlurEvent = !1), n.state.focused && Zo(n));
				}, 100);
		}
		function yf(n, i) {
			n.state.delayingBlurEvent &&
				!n.state.draggingText &&
				(n.state.delayingBlurEvent = !1),
				n.options.readOnly != "nocursor" &&
					(n.state.focused ||
						(Mt(n, "focus", n, i),
						(n.state.focused = !0),
						Ne(n.display.wrapper, "CodeMirror-focused"),
						!n.curOp &&
							n.display.selForContextMenu != n.doc.sel &&
							(n.display.input.reset(),
							v && setTimeout(() => n.display.input.reset(!0), 20)),
						n.display.input.receivedFocus()),
					vf(n));
		}
		function Zo(n, i) {
			n.state.delayingBlurEvent ||
				(n.state.focused &&
					(Mt(n, "blur", n, i),
					(n.state.focused = !1),
					Z(n.display.wrapper, "CodeMirror-focused")),
				clearInterval(n.display.blinker),
				setTimeout(() => {
					n.state.focused || (n.display.shift = !1);
				}, 150));
		}
		function Ha(n) {
			for (
				var i = n.display,
					a = i.lineDiv.offsetTop,
					l = Math.max(0, i.scroller.getBoundingClientRect().top),
					u = i.lineDiv.getBoundingClientRect().top,
					g = 0,
					y = 0;
				y < i.view.length;
				y++
			) {
				let x = i.view[y],
					S = n.options.lineWrapping,
					_ = void 0,
					$ = 0;
				if (!x.hidden) {
					if (((u += x.line.height), h && p < 8)) {
						const D = x.node.offsetTop + x.node.offsetHeight;
						(_ = D - a), (a = D);
					} else {
						const K = x.node.getBoundingClientRect();
						(_ = K.bottom - K.top),
							!S &&
								x.text.firstChild &&
								($ =
									x.text.firstChild.getBoundingClientRect().right - K.left - 1);
					}
					const j = x.line.height - _;
					if (
						(j > 0.005 || j < -0.005) &&
						(u < l && (g -= j), Un(x.line, _), ng(x.line), x.rest)
					) {
						for (let ne = 0; ne < x.rest.length; ne++) {
							ng(x.rest[ne]);
						}
					}
					if ($ > n.display.sizerWidth) {
						const ce = Math.ceil($ / Yo(n.display));
						ce > n.display.maxLineLength &&
							((n.display.maxLineLength = ce),
							(n.display.maxLine = x.line),
							(n.display.maxLineChanged = !0));
					}
				}
			}
			Math.abs(g) > 2 && (i.scroller.scrollTop += g);
		}
		function ng(n) {
			if (n.widgets) {
				for (let i = 0; i < n.widgets.length; ++i) {
					const a = n.widgets[i],
						l = a.node.parentNode;
					l && (a.height = l.offsetHeight);
				}
			}
		}
		function qa(n, i, a) {
			let l =
				a && a.top != undefined ? Math.max(0, a.top) : n.scroller.scrollTop;
			l = Math.floor(l - Ra(n));
			let u =
					a && a.bottom != undefined ? a.bottom : l + n.wrapper.clientHeight,
				g = R(i, l),
				y = R(i, u);
			if (a && a.ensure) {
				const x = a.ensure.from.line,
					S = a.ensure.to.line;
				x < g
					? ((g = x), (y = R(i, Qr(Oe(i, x)) + n.wrapper.clientHeight)))
					: Math.min(S, i.lastLine()) >= y &&
						((g = R(i, Qr(Oe(i, S)) - n.wrapper.clientHeight)), (y = S));
			}
			return { from: g, to: Math.max(y, g + 1) };
		}
		function Rx(n, i) {
			if (!Nt(n, "scrollCursorIntoView")) {
				let a = n.display,
					l = a.sizer.getBoundingClientRect(),
					u,
					g = a.wrapper.ownerDocument;
				if (
					(i.top + l.top < 0
						? (u = !0)
						: i.bottom + l.top >
								(g.defaultView.innerHeight || g.documentElement.clientHeight) &&
							(u = !1),
					u != undefined && !L)
				) {
					const y = k(
						"div",
						"​",
						undefined,
						`position: absolute;
                         top: ` +
							(i.top - a.viewOffset - Ra(n.display)) +
							`px;
                         height: ` +
							(i.bottom - i.top + $r(n) + a.barHeight) +
							`px;
                         left: ` +
							i.left +
							"px; width: " +
							Math.max(2, i.right - i.left) +
							"px;",
					);
					n.display.lineSpace.append(y),
						y.scrollIntoView(u),
						n.display.lineSpace.removeChild(y);
				}
			}
		}
		function Dx(n, i, a, l) {
			l == undefined && (l = 0);
			let u;
			!n.options.lineWrapping &&
				i == a &&
				((a = i.sticky == "before" ? ee(i.line, i.ch + 1, "before") : i),
				(i = i.ch
					? ee(i.line, i.sticky == "before" ? i.ch - 1 : i.ch, "after")
					: i));
			for (let g = 0; g < 5; g++) {
				let y = !1,
					x = gr(n, i),
					S = !a || a == i ? x : gr(n, a);
				u = {
					left: Math.min(x.left, S.left),
					top: Math.min(x.top, S.top) - l,
					right: Math.max(x.left, S.left),
					bottom: Math.max(x.bottom, S.bottom) + l,
				};
				const _ = bf(n, u),
					$ = n.doc.scrollTop,
					D = n.doc.scrollLeft;
				if (
					(_.scrollTop != undefined &&
						(nl(n, _.scrollTop), Math.abs(n.doc.scrollTop - $) > 1 && (y = !0)),
					_.scrollLeft != undefined &&
						(ho(n, _.scrollLeft),
						Math.abs(n.doc.scrollLeft - D) > 1 && (y = !0)),
					!y)
				) {
					break;
				}
			}
			return u;
		}
		function zx(n, i) {
			const a = bf(n, i);
			a.scrollTop != undefined && nl(n, a.scrollTop),
				a.scrollLeft != undefined && ho(n, a.scrollLeft);
		}
		function bf(n, i) {
			const a = n.display,
				l = Xo(n.display);
			i.top < 0 && (i.top = 0);
			const u =
					n.curOp && n.curOp.scrollTop != undefined
						? n.curOp.scrollTop
						: a.scroller.scrollTop,
				g = sf(n),
				y = {};
			i.bottom - i.top > g && (i.bottom = i.top + g);
			const x = n.doc.height + of(a),
				S = i.top < l,
				_ = i.bottom > x - l;
			if (i.top < u) {
				y.scrollTop = S ? 0 : i.top;
			} else if (i.bottom > u + g) {
				const $ = Math.min(i.top, (_ ? x : i.bottom) - g);
				$ != u && (y.scrollTop = $);
			}
			const D = n.options.fixedGutter ? 0 : a.gutters.offsetWidth,
				K =
					n.curOp && n.curOp.scrollLeft != undefined
						? n.curOp.scrollLeft
						: a.scroller.scrollLeft - D,
				j = ao(n) - a.gutters.offsetWidth,
				ne = i.right - i.left > j;
			return (
				ne && (i.right = i.left + j),
				i.left < 10
					? (y.scrollLeft = 0)
					: (i.left < K
						? (y.scrollLeft = Math.max(0, i.left + D - (ne ? 0 : 10)))
						: i.right > j + K - 3 &&
							(y.scrollLeft = i.right + (ne ? 0 : 10) - j)),
				y
			);
		}
		function wf(n, i) {
			i != undefined &&
				(Ba(n),
				(n.curOp.scrollTop =
					(n.curOp.scrollTop == undefined
						? n.doc.scrollTop
						: n.curOp.scrollTop) + i));
		}
		function Jo(n) {
			Ba(n);
			const i = n.getCursor();
			n.curOp.scrollToPos = {
				from: i,
				to: i,
				margin: n.options.cursorScrollMargin,
			};
		}
		function tl(n, i, a) {
			(i != undefined || a != undefined) && Ba(n),
				i != undefined && (n.curOp.scrollLeft = i),
				a != undefined && (n.curOp.scrollTop = a);
		}
		function Ix(n, i) {
			Ba(n), (n.curOp.scrollToPos = i);
		}
		function Ba(n) {
			const i = n.curOp.scrollToPos;
			if (i) {
				n.curOp.scrollToPos = undefined;
				const a = Xp(n, i.from),
					l = Xp(n, i.to);
				rg(n, a, l, i.margin);
			}
		}
		function rg(n, i, a, l) {
			const u = bf(n, {
				left: Math.min(i.left, a.left),
				top: Math.min(i.top, a.top) - l,
				right: Math.max(i.right, a.right),
				bottom: Math.max(i.bottom, a.bottom) + l,
			});
			tl(n, u.scrollLeft, u.scrollTop);
		}
		function nl(n, i) {
			Math.abs(n.doc.scrollTop - i) < 2 ||
				(s || Sf(n, { top: i }), ig(n, i, !0), s && Sf(n), ol(n, 100));
		}
		function ig(n, i, a) {
			(i = Math.max(
				0,
				Math.min(
					n.display.scroller.scrollHeight - n.display.scroller.clientHeight,
					i,
				),
			)),
				!(n.display.scroller.scrollTop == i && !a) &&
					((n.doc.scrollTop = i),
					n.display.scrollbars.setScrollTop(i),
					n.display.scroller.scrollTop != i &&
						(n.display.scroller.scrollTop = i));
		}
		function ho(n, i, a, l) {
			(i = Math.max(
				0,
				Math.min(
					i,
					n.display.scroller.scrollWidth - n.display.scroller.clientWidth,
				),
			)),
				!(
					(a ? i == n.doc.scrollLeft : Math.abs(n.doc.scrollLeft - i) < 2) && !l
				) &&
					((n.doc.scrollLeft = i),
					cg(n),
					n.display.scroller.scrollLeft != i &&
						(n.display.scroller.scrollLeft = i),
					n.display.scrollbars.setScrollLeft(i));
		}
		function rl(n) {
			const i = n.display,
				a = i.gutters.offsetWidth,
				l = Math.round(n.doc.height + of(n.display));
			return {
				clientHeight: i.scroller.clientHeight,
				viewHeight: i.wrapper.clientHeight,
				scrollWidth: i.scroller.scrollWidth,
				clientWidth: i.scroller.clientWidth,
				viewWidth: i.wrapper.clientWidth,
				barLeft: n.options.fixedGutter ? a : 0,
				docHeight: l,
				scrollHeight: l + $r(n) + i.barHeight,
				nativeBarWidth: i.nativeBarWidth,
				gutterWidth: a,
			};
		}
		const po = function po(n, i, a) {
			this.cm = a;
			const l = (this.vert = k(
					"div",
					[k("div", undefined, undefined, "min-width: 1px")],
					"CodeMirror-vscrollbar",
				)),
				u = (this.horiz = k(
					"div",
					[k("div", undefined, undefined, "height: 100%; min-height: 1px")],
					"CodeMirror-hscrollbar",
				));
			(l.tabIndex = u.tabIndex = -1),
				n(l),
				n(u),
				ze(l, "scroll", () => {
					l.clientHeight && i(l.scrollTop, "vertical");
				}),
				ze(u, "scroll", () => {
					u.clientWidth && i(u.scrollLeft, "horizontal");
				}),
				(this.checkedZeroWidth = !1),
				h &&
					p < 8 &&
					(this.horiz.style.minHeight = this.vert.style.minWidth = "18px");
		};
		(po.prototype.update = function update(n) {
			const i = n.scrollWidth > n.clientWidth + 1,
				a = n.scrollHeight > n.clientHeight + 1,
				l = n.nativeBarWidth;
			if (a) {
				(this.vert.style.display = "block"),
					(this.vert.style.bottom = i ? l + "px" : "0");
				const u = n.viewHeight - (i ? l : 0);
				this.vert.firstChild.style.height =
					Math.max(0, n.scrollHeight - n.clientHeight + u) + "px";
			} else {
				(this.vert.scrollTop = 0),
					(this.vert.style.display = ""),
					(this.vert.firstChild.style.height = "0");
			}
			if (i) {
				(this.horiz.style.display = "block"),
					(this.horiz.style.right = a ? l + "px" : "0"),
					(this.horiz.style.left = n.barLeft + "px");
				const g = n.viewWidth - n.barLeft - (a ? l : 0);
				this.horiz.firstChild.style.width =
					Math.max(0, n.scrollWidth - n.clientWidth + g) + "px";
			} else {
				(this.horiz.style.display = ""),
					(this.horiz.firstChild.style.width = "0");
			}
			return (
				!this.checkedZeroWidth &&
					n.clientHeight > 0 &&
					(l == 0 && this.zeroWidthHack(), (this.checkedZeroWidth = !0)),
				{ right: a ? l : 0, bottom: i ? l : 0 }
			);
		}),
			(po.prototype.setScrollLeft = function setScrollLeft(n) {
				this.horiz.scrollLeft != n && (this.horiz.scrollLeft = n),
					this.disableHoriz &&
						this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz");
			}),
			(po.prototype.setScrollTop = function setScrollTop(n) {
				this.vert.scrollTop != n && (this.vert.scrollTop = n),
					this.disableVert &&
						this.enableZeroWidthBar(this.vert, this.disableVert, "vert");
			}),
			(po.prototype.zeroWidthHack = function zeroWidthHack() {
				const n = z && !E ? "12px" : "18px";
				(this.horiz.style.height = this.vert.style.width = n),
					(this.horiz.style.visibility = this.vert.style.visibility = "hidden"),
					(this.disableHoriz = new $e()),
					(this.disableVert = new $e());
			}),
			(po.prototype.enableZeroWidthBar = (n, i, a) => {
				n.style.visibility = "";
				function l() {
					const u = n.getBoundingClientRect(),
						g =
							a == "vert"
								? document.elementFromPoint(u.right - 1, (u.top + u.bottom) / 2)
								: document.elementFromPoint(
										(u.right + u.left) / 2,
										u.bottom - 1,
									);
					g != n ? (n.style.visibility = "hidden") : i.set(1e3, l);
				}
				i.set(1e3, l);
			}),
			(po.prototype.clear = function clear() {
				const n = this.horiz.parentNode;
				n.removeChild(this.horiz), n.removeChild(this.vert);
			});
		const il = () => {};
		(il.prototype.update = () => ({ bottom: 0, right: 0 })),
			(il.prototype.setScrollLeft = () => {}),
			(il.prototype.setScrollTop = () => {}),
			(il.prototype.clear = () => {});
		function Qo(n, i) {
			i || (i = rl(n));
			let a = n.display.barWidth,
				l = n.display.barHeight;
			og(n, i);
			for (
				let u = 0;
				(u < 4 && a != n.display.barWidth) || l != n.display.barHeight;
				u++
			) {
				a != n.display.barWidth && n.options.lineWrapping && Ha(n),
					og(n, rl(n)),
					(a = n.display.barWidth),
					(l = n.display.barHeight);
			}
		}
		function og(n, i) {
			const a = n.display,
				l = a.scrollbars.update(i);
			(a.sizer.style.paddingRight = (a.barWidth = l.right) + "px"),
				(a.sizer.style.paddingBottom = (a.barHeight = l.bottom) + "px"),
				(a.heightForcer.style.borderBottom = l.bottom + "px solid transparent"),
				l.right && l.bottom
					? ((a.scrollbarFiller.style.display = "block"),
						(a.scrollbarFiller.style.height = l.bottom + "px"),
						(a.scrollbarFiller.style.width = l.right + "px"))
					: (a.scrollbarFiller.style.display = ""),
				l.bottom &&
				n.options.coverGutterNextToScrollbar &&
				n.options.fixedGutter
					? ((a.gutterFiller.style.display = "block"),
						(a.gutterFiller.style.height = l.bottom + "px"),
						(a.gutterFiller.style.width = i.gutterWidth + "px"))
					: (a.gutterFiller.style.display = "");
		}
		const sg = { native: po, null: il };
		function lg(n) {
			n.display.scrollbars &&
				(n.display.scrollbars.clear(),
				n.display.scrollbars.addClass &&
					Z(n.display.wrapper, n.display.scrollbars.addClass)),
				(n.display.scrollbars = new sg[n.options.scrollbarStyle](
					(i) => {
						n.display.wrapper.insertBefore(i, n.display.scrollbarFiller),
							ze(i, "mousedown", () => {
								n.state.focused && setTimeout(() => n.display.input.focus(), 0);
							}),
							i.setAttribute("cm-not-content", "true");
					},
					(i, a) => {
						a == "horizontal" ? ho(n, i) : nl(n, i);
					},
					n,
				)),
				n.display.scrollbars.addClass &&
					Ne(n.display.wrapper, n.display.scrollbars.addClass);
		}
		let Fx = 0;
		function go(n) {
			(n.curOp = {
				cm: n,
				viewChanged: !1,
				startHeight: n.doc.height,
				forceUpdate: !1,
				updateInput: 0,
				typing: !1,
				changeObjs: undefined,
				cursorActivityHandlers: undefined,
				cursorActivityCalled: 0,
				selectionChanged: !1,
				updateMaxLine: !1,
				scrollLeft: undefined,
				scrollTop: undefined,
				scrollToPos: undefined,
				focus: !1,
				id: ++Fx,
				markArrays: undefined,
			}),
				vx(n.curOp);
		}
		function vo(n) {
			const i = n.curOp;
			i &&
				yx(i, (a) => {
					for (let l = 0; l < a.ops.length; l++) {
						a.ops[l].cm.curOp = undefined;
					}
					Hx(a);
				});
		}
		function Hx(n) {
			for (var i = n.ops, a = 0; a < i.length; a++) {
				qx(i[a]);
			}
			for (let l = 0; l < i.length; l++) {
				Bx(i[l]);
			}
			for (let u = 0; u < i.length; u++) {
				Wx(i[u]);
			}
			for (let g = 0; g < i.length; g++) {
				Ux(i[g]);
			}
			for (let y = 0; y < i.length; y++) {
				Vx(i[y]);
			}
		}
		function qx(n) {
			const i = n.cm,
				a = i.display;
			Gx(i),
				n.updateMaxLine && nf(i),
				(n.mustUpdate =
					n.viewChanged ||
					n.forceUpdate ||
					n.scrollTop != undefined ||
					(n.scrollToPos &&
						(n.scrollToPos.from.line < a.viewFrom ||
							n.scrollToPos.to.line >= a.viewTo)) ||
					(a.maxLineChanged && i.options.lineWrapping)),
				(n.update =
					n.mustUpdate &&
					new Wa(
						i,
						n.mustUpdate && { top: n.scrollTop, ensure: n.scrollToPos },
						n.forceUpdate,
					));
		}
		function Bx(n) {
			n.updatedDisplay = n.mustUpdate && xf(n.cm, n.update);
		}
		function Wx(n) {
			const i = n.cm,
				a = i.display;
			n.updatedDisplay && Ha(i),
				(n.barMeasure = rl(i)),
				a.maxLineChanged &&
					!i.options.lineWrapping &&
					((n.adjustWidthTo = qp(i, a.maxLine, a.maxLine.text.length).left + 3),
					(i.display.sizerWidth = n.adjustWidthTo),
					(n.barMeasure.scrollWidth = Math.max(
						a.scroller.clientWidth,
						a.sizer.offsetLeft + n.adjustWidthTo + $r(i) + i.display.barWidth,
					)),
					(n.maxScrollLeft = Math.max(
						0,
						a.sizer.offsetLeft + n.adjustWidthTo - ao(i),
					))),
				(n.updatedDisplay || n.selectionChanged) &&
					(n.preparedSelection = a.input.prepareSelection());
		}
		function Ux(n) {
			const i = n.cm;
			n.adjustWidthTo != undefined &&
				((i.display.sizer.style.minWidth = n.adjustWidthTo + "px"),
				n.maxScrollLeft < i.doc.scrollLeft &&
					ho(i, Math.min(i.display.scroller.scrollLeft, n.maxScrollLeft), !0),
				(i.display.maxLineChanged = !1));
			const a = n.focus && n.focus == ye(tt(i));
			n.preparedSelection &&
				i.display.input.showSelection(n.preparedSelection, a),
				(n.updatedDisplay || n.startHeight != i.doc.height) &&
					Qo(i, n.barMeasure),
				n.updatedDisplay && kf(i, n.barMeasure),
				n.selectionChanged && vf(i),
				i.state.focused && n.updateInput && i.display.input.reset(n.typing),
				a && tg(n.cm);
		}
		function Vx(n) {
			const i = n.cm,
				a = i.display,
				l = i.doc;
			if (
				(n.updatedDisplay && ag(i, n.update),
				a.wheelStartX != undefined &&
					(n.scrollTop != undefined ||
						n.scrollLeft != undefined ||
						n.scrollToPos) &&
					(a.wheelStartX = a.wheelStartY = undefined),
				n.scrollTop != undefined && ig(i, n.scrollTop, n.forceScroll),
				n.scrollLeft != undefined && ho(i, n.scrollLeft, !0, !0),
				n.scrollToPos)
			) {
				const u = Dx(
					i,
					Ge(l, n.scrollToPos.from),
					Ge(l, n.scrollToPos.to),
					n.scrollToPos.margin,
				);
				Rx(i, u);
			}
			const g = n.maybeHiddenMarkers,
				y = n.maybeUnhiddenMarkers;
			if (g) {
				for (let x = 0; x < g.length; ++x) {
					g[x].lines.length || Mt(g[x], "hide");
				}
			}
			if (y) {
				for (let S = 0; S < y.length; ++S) {
					y[S].lines.length && Mt(y[S], "unhide");
				}
			}
			a.wrapper.offsetHeight && (l.scrollTop = i.display.scroller.scrollTop),
				n.changeObjs && Mt(i, "changes", i, n.changeObjs),
				n.update && n.update.finish();
		}
		function On(n, i) {
			if (n.curOp) {
				return i();
			}
			go(n);
			try {
				return i();
			} finally {
				vo(n);
			}
		}
		function Gt(n, i) {
			return () => {
				if (n.curOp) {
					return i.apply(n, arguments);
				}
				go(n);
				try {
					return i.apply(n, arguments);
				} finally {
					vo(n);
				}
			};
		}
		function fn(n) {
			return function () {
				if (this.curOp) {
					return n.apply(this, arguments);
				}
				go(this);
				try {
					return n.apply(this, arguments);
				} finally {
					vo(this);
				}
			};
		}
		function Kt(n) {
			return function () {
				const i = this.cm;
				if (!i || i.curOp) {
					return n.apply(this, arguments);
				}
				go(i);
				try {
					return n.apply(this, arguments);
				} finally {
					vo(i);
				}
			};
		}
		function ol(n, i) {
			n.doc.highlightFrontier < n.display.viewTo &&
				n.state.highlight.set(i, X(jx, n));
		}
		function jx(n) {
			const i = n.doc;
			if (!(i.highlightFrontier >= n.display.viewTo)) {
				const a = Date.now() + n.options.workTime,
					l = Ks(n, i.highlightFrontier),
					u = [];
				i.iter(
					l.line,
					Math.min(i.first + i.size, n.display.viewTo + 500),
					(g) => {
						if (l.line >= n.display.viewFrom) {
							const y = g.styles,
								x =
									g.text.length > n.options.maxHighlightLength
										? Mr(i.mode, l.state)
										: undefined,
								S = gp(n, g, l, !0);
							x && (l.state = x), (g.styles = S.styles);
							const _ = g.styleClasses,
								$ = S.classes;
							$ ? (g.styleClasses = $) : _ && (g.styleClasses = undefined);
							for (
								var D =
										!y ||
										y.length != g.styles.length ||
										(_ != $ &&
											(!(_ && $) ||
												_.bgClass != $.bgClass ||
												_.textClass != $.textClass)),
									K = 0;
								!D && K < y.length;
								++K
							) {
								D = y[K] != g.styles[K];
							}
							D && u.push(l.line), (g.stateAfter = l.save()), l.nextLine();
						} else {
							g.text.length <= n.options.maxHighlightLength && Yu(n, g.text, l),
								(g.stateAfter = l.line % 5 == 0 ? l.save() : undefined),
								l.nextLine();
						}
						if (Date.now() > a) {
							return ol(n, n.options.workDelay), !0;
						}
					},
				),
					(i.highlightFrontier = l.line),
					(i.modeFrontier = Math.max(i.modeFrontier, l.line)),
					u.length &&
						On(n, () => {
							for (let g = 0; g < u.length; g++) {
								Ci(n, u[g], "text");
							}
						});
			}
		}
		const Wa = function Wa(n, i, a) {
			const l = n.display;
			(this.viewport = i),
				(this.visible = qa(l, n.doc, i)),
				(this.editorIsHidden = !l.wrapper.offsetWidth),
				(this.wrapperHeight = l.wrapper.clientHeight),
				(this.wrapperWidth = l.wrapper.clientWidth),
				(this.oldDisplayWidth = ao(n)),
				(this.force = a),
				(this.dims = df(n)),
				(this.events = []);
		};
		(Wa.prototype.signal = function signal(n, i) {
			Pn(n, i) && this.events.push(arguments);
		}),
			(Wa.prototype.finish = function finish() {
				for (let n = 0; n < this.events.length; n++) {
					Mt.apply(undefined, this.events[n]);
				}
			});
		function Gx(n) {
			const i = n.display;
			!i.scrollbarsClipped &&
				i.scroller.offsetWidth &&
				((i.nativeBarWidth = i.scroller.offsetWidth - i.scroller.clientWidth),
				(i.heightForcer.style.height = $r(n) + "px"),
				(i.sizer.style.marginBottom = -i.nativeBarWidth + "px"),
				(i.sizer.style.borderRightWidth = $r(n) + "px"),
				(i.scrollbarsClipped = !0));
		}
		function Kx(n) {
			if (n.hasFocus()) {
				return ;
			}
			const i = ye(tt(n));
			if (!(i && ie(n.display.lineDiv, i))) {
				return ;
			}
			const a = { activeElt: i };
			if (window.getSelection) {
				const l = Ae(n).getSelection();
				l.anchorNode &&
					l.extend &&
					ie(n.display.lineDiv, l.anchorNode) &&
					((a.anchorNode = l.anchorNode),
					(a.anchorOffset = l.anchorOffset),
					(a.focusNode = l.focusNode),
					(a.focusOffset = l.focusOffset));
			}
			return a;
		}
		function Xx(n) {
			if (
				!(!(n && n.activeElt) || n.activeElt == ye(Je(n.activeElt))) &&
				(n.activeElt.focus(),
				!/^(INPUT|TEXTAREA)$/.test(n.activeElt.nodeName) &&
					n.anchorNode &&
					ie(document.body, n.anchorNode) &&
					ie(document.body, n.focusNode))
			) {
				const i = n.activeElt.ownerDocument,
					a = i.defaultView.getSelection(),
					l = i.createRange();
				l.setEnd(n.anchorNode, n.anchorOffset),
					l.collapse(!1),
					a.removeAllRanges(),
					a.addRange(l),
					a.extend(n.focusNode, n.focusOffset);
			}
		}
		function xf(n, i) {
			const a = n.display,
				l = n.doc;
			if (i.editorIsHidden) {
				return Ei(n), !1;
			}
			if (
				!i.force &&
				i.visible.from >= a.viewFrom &&
				i.visible.to <= a.viewTo &&
				(a.updateLineNumbers == undefined || a.updateLineNumbers >= a.viewTo) &&
				a.renderedView == a.view &&
				Qp(n) == 0
			) {
				return !1;
			}
			ug(n) && (Ei(n), (i.dims = df(n)));
			let u = l.first + l.size,
				g = Math.max(i.visible.from - n.options.viewportMargin, l.first),
				y = Math.min(u, i.visible.to + n.options.viewportMargin);
			a.viewFrom < g &&
				g - a.viewFrom < 20 &&
				(g = Math.max(l.first, a.viewFrom)),
				a.viewTo > y && a.viewTo - y < 20 && (y = Math.min(u, a.viewTo)),
				Jr && ((g = ef(n.doc, g)), (y = Ap(n.doc, y)));
			const x =
				g != a.viewFrom ||
				y != a.viewTo ||
				a.lastWrapHeight != i.wrapperHeight ||
				a.lastWrapWidth != i.wrapperWidth;
			Px(n, g, y),
				(a.viewOffset = Qr(Oe(n.doc, a.viewFrom))),
				(n.display.mover.style.top = a.viewOffset + "px");
			const S = Qp(n);
			if (
				!x &&
				S == 0 &&
				!i.force &&
				a.renderedView == a.view &&
				(a.updateLineNumbers == undefined || a.updateLineNumbers >= a.viewTo)
			) {
				return !1;
			}
			const _ = Kx(n);
			return (
				S > 4 && (a.lineDiv.style.display = "none"),
				Yx(n, a.updateLineNumbers, i.dims),
				S > 4 && (a.lineDiv.style.display = ""),
				(a.renderedView = a.view),
				Xx(_),
				q(a.cursorDiv),
				q(a.selectionDiv),
				(a.gutters.style.height = a.sizer.style.minHeight = 0),
				x &&
					((a.lastWrapHeight = i.wrapperHeight),
					(a.lastWrapWidth = i.wrapperWidth),
					ol(n, 400)),
				(a.updateLineNumbers = undefined),
				!0
			);
		}
		function ag(n, i) {
			for (let a = i.viewport, l = !0; ; l = !1) {
				if (!(l && n.options.lineWrapping) || i.oldDisplayWidth == ao(n)) {
					if (
						(a &&
							a.top != undefined &&
							(a = {
								top: Math.min(n.doc.height + of(n.display) - sf(n), a.top),
							}),
						(i.visible = qa(n.display, n.doc, a)),
						i.visible.from >= n.display.viewFrom &&
							i.visible.to <= n.display.viewTo)
					) {
						break;
					}
				} else {
					l && (i.visible = qa(n.display, n.doc, a));
				}
				if (!xf(n, i)) {
					break;
				}
				Ha(n);
				const u = rl(n);
				el(n), Qo(n, u), kf(n, u), (i.force = !1);
			}
			i.signal(n, "update", n),
				(n.display.viewFrom != n.display.reportedViewFrom ||
					n.display.viewTo != n.display.reportedViewTo) &&
					(i.signal(
						n,
						"viewportChange",
						n,
						n.display.viewFrom,
						n.display.viewTo,
					),
					(n.display.reportedViewFrom = n.display.viewFrom),
					(n.display.reportedViewTo = n.display.viewTo));
		}
		function Sf(n, i) {
			const a = new Wa(n, i);
			if (xf(n, a)) {
				Ha(n), ag(n, a);
				const l = rl(n);
				el(n), Qo(n, l), kf(n, l), a.finish();
			}
		}
		function Yx(n, i, a) {
			let l = n.display,
				u = n.options.lineNumbers,
				g = l.lineDiv,
				y = g.firstChild;
			function x(ne) {
				const ce = ne.nextSibling;
				return (
					v && z && n.display.currentWheelTarget == ne
						? (ne.style.display = "none")
						: ne.parentNode.removeChild(ne),
					ce
				);
			}
			for (let S = l.view, _ = l.viewFrom, $ = 0; $ < S.length; $++) {
				const D = S[$];
				if (!D.hidden) {
					if (!D.node || D.node.parentNode != g) {
						const K = _x(n, D, _, a);
						g.insertBefore(K, y);
					} else {
						while (y != D.node) {
							y = x(y);
						}
						let j = u && i != undefined && i <= _ && D.lineNumber;
						D.changes &&
							(Ee(D.changes, "gutter") > -1 && (j = !1), Op(n, D, _, a)),
							j &&
								(q(D.lineNumber),
								D.lineNumber.append(document.createTextNode(pe(n.options, _)))),
							(y = D.node.nextSibling);
					}
				}
				_ += D.size;
			}
			while (y) {
				y = x(y);
			}
		}
		function _f(n) {
			const i = n.gutters.offsetWidth;
			(n.sizer.style.marginLeft = i + "px"), jt(n, "gutterChanged", n);
		}
		function kf(n, i) {
			(n.display.sizer.style.minHeight = i.docHeight + "px"),
				(n.display.heightForcer.style.top = i.docHeight + "px"),
				(n.display.gutters.style.height =
					i.docHeight + n.display.barHeight + $r(n) + "px");
		}
		function cg(n) {
			const i = n.display,
				a = i.view;
			if (i.alignWidgets || (i.gutters.firstChild && n.options.fixedGutter)) {
				for (
					var l = hf(i) - i.scroller.scrollLeft + n.doc.scrollLeft,
						u = i.gutters.offsetWidth,
						g = l + "px",
						y = 0;
					y < a.length;
					y++
				) {
					if (!a[y].hidden) {
						n.options.fixedGutter &&
							(a[y].gutter && (a[y].gutter.style.left = g),
							a[y].gutterBackground && (a[y].gutterBackground.style.left = g));
						const x = a[y].alignable;
						if (x) {
							for (let S = 0; S < x.length; S++) {
								x[S].style.left = g;
							}
						}
					}
				}
				n.options.fixedGutter && (i.gutters.style.left = l + u + "px");
			}
		}
		function ug(n) {
			if (!n.options.lineNumbers) {
				return !1;
			}
			const i = n.doc,
				a = pe(n.options, i.first + i.size - 1),
				l = n.display;
			if (a.length != l.lineNumChars) {
				const u = l.measure.append(
						k(
							"div",
							[k("div", a)],
							"CodeMirror-linenumber CodeMirror-gutter-elt",
						),
					),
					g = u.firstChild.offsetWidth,
					y = u.offsetWidth - g;
				return (
					(l.lineGutter.style.width = ""),
					(l.lineNumInnerWidth = Math.max(g, l.lineGutter.offsetWidth - y) + 1),
					(l.lineNumWidth = l.lineNumInnerWidth + y),
					(l.lineNumChars = l.lineNumInnerWidth ? a.length : -1),
					(l.lineGutter.style.width = l.lineNumWidth + "px"),
					_f(n.display),
					!0
				);
			}
			return !1;
		}
		function Tf(n, i) {
			for (var a = [], l = !1, u = 0; u < n.length; u++) {
				let g = n[u],
					y;
				if (
					(typeof g !== "string" && ((y = g.style), (g = g.className)),
					g == "CodeMirror-linenumbers")
				) {
					if (i) {
						l = !0;
					} else {
						continue;
					}
				}
				a.push({ className: g, style: y });
			}
			return (
				i &&
					!l &&
					a.push({ className: "CodeMirror-linenumbers", style: undefined }),
				a
			);
		}
		function fg(n) {
			const i = n.gutters,
				a = n.gutterSpecs;
			q(i), (n.lineGutter = undefined);
			for (let l = 0; l < a.length; ++l) {
				const u = a[l],
					g = u.className,
					y = u.style,
					x = i.append(k("div", undefined, "CodeMirror-gutter " + g));
				y && (x.style.cssText = y),
					g == "CodeMirror-linenumbers" &&
						((n.lineGutter = x),
						(x.style.width = (n.lineNumWidth || 1) + "px"));
			}
			(i.style.display = a.length > 0 ? "" : "none"), _f(n);
		}
		function sl(n) {
			fg(n.display), bn(n), cg(n);
		}
		function Zx(n, i, a, l) {
			(this.input = a),
				(this.scrollbarFiller = k(
					"div",
					undefined,
					"CodeMirror-scrollbar-filler",
				)),
				this.scrollbarFiller.setAttribute("cm-not-content", "true"),
				(this.gutterFiller = k("div", undefined, "CodeMirror-gutter-filler")),
				this.gutterFiller.setAttribute("cm-not-content", "true"),
				(this.lineDiv = B("div", undefined, "CodeMirror-code")),
				(this.selectionDiv = k(
					"div",
					undefined,
					undefined,
					"position: relative; z-index: 1",
				)),
				(this.cursorDiv = k("div", undefined, "CodeMirror-cursors")),
				(this.measure = k("div", undefined, "CodeMirror-measure")),
				(this.lineMeasure = k("div", undefined, "CodeMirror-measure")),
				(this.lineSpace = B(
					"div",
					[
						this.measure,
						this.lineMeasure,
						this.selectionDiv,
						this.cursorDiv,
						this.lineDiv,
					],
					undefined,
					"position: relative; outline: none",
				));
			const g = B("div", [this.lineSpace], "CodeMirror-lines");
			(this.mover = k("div", [g], undefined, "position: relative")),
				(this.sizer = k("div", [this.mover], "CodeMirror-sizer")),
				(this.sizerWidth = undefined),
				(this.heightForcer = k(
					"div",
					undefined,
					undefined,
					"position: absolute; height: " + Ze + "px; width: 1px;",
				)),
				(this.gutters = k("div", undefined, "CodeMirror-gutters")),
				(this.lineGutter = undefined),
				(this.scroller = k(
					"div",
					[this.sizer, this.heightForcer, this.gutters],
					"CodeMirror-scroll",
				)),
				this.scroller.setAttribute("tabIndex", "-1"),
				(this.wrapper = k(
					"div",
					[this.scrollbarFiller, this.gutterFiller, this.scroller],
					"CodeMirror",
				)),
				b && w >= 105 && (this.wrapper.style.clipPath = "inset(0px)"),
				this.wrapper.setAttribute("translate", "no"),
				h &&
					p < 8 &&
					((this.gutters.style.zIndex = -1),
					(this.scroller.style.paddingRight = 0)),
				!(v || (s && A)) && (this.scroller.draggable = !0),
				n && (n.appendChild ? n.append(this.wrapper) : n(this.wrapper)),
				(this.viewFrom = this.viewTo = i.first),
				(this.reportedViewFrom = this.reportedViewTo = i.first),
				(this.view = []),
				(this.renderedView = undefined),
				(this.externalMeasured = undefined),
				(this.viewOffset = 0),
				(this.lastWrapHeight = this.lastWrapWidth = 0),
				(this.updateLineNumbers = undefined),
				(this.nativeBarWidth = this.barHeight = this.barWidth = 0),
				(this.scrollbarsClipped = !1),
				(this.lineNumWidth =
					this.lineNumInnerWidth =
					this.lineNumChars =
						undefined),
				(this.alignWidgets = !1),
				(this.cachedCharWidth =
					this.cachedTextHeight =
					this.cachedPaddingH =
						undefined),
				(this.maxLine = undefined),
				(this.maxLineLength = 0),
				(this.maxLineChanged = !1),
				(this.wheelDX =
					this.wheelDY =
					this.wheelStartX =
					this.wheelStartY =
						undefined),
				(this.shift = !1),
				(this.selForContextMenu = undefined),
				(this.activeTouch = undefined),
				(this.gutterSpecs = Tf(l.gutters, l.lineNumbers)),
				fg(this),
				a.init(this);
		}
		let Ua = 0,
			ti;
		h ? (ti = -0.53) : s ? (ti = 15) : b ? (ti = -0.7) : C && (ti = -1 / 3);
		function dg(n) {
			let i = n.wheelDeltaX,
				a = n.wheelDeltaY;
			return (
				i == undefined &&
					n.detail &&
					n.axis == n.HORIZONTAL_AXIS &&
					(i = n.detail),
				a == undefined && n.detail && n.axis == n.VERTICAL_AXIS
					? (a = n.detail)
					: a == undefined && (a = n.wheelDelta),
				{ x: i, y: a }
			);
		}
		function Jx(n) {
			const i = dg(n);
			return (i.x *= ti), (i.y *= ti), i;
		}
		function hg(n, i) {
			b &&
				w == 102 &&
				(n.display.chromeScrollHack == undefined
					? (n.display.sizer.style.pointerEvents = "none")
					: clearTimeout(n.display.chromeScrollHack),
				(n.display.chromeScrollHack = setTimeout(() => {
					(n.display.chromeScrollHack = undefined),
						(n.display.sizer.style.pointerEvents = "");
				}, 100)));
			let a = dg(i),
				l = a.x,
				u = a.y,
				g = ti;
			i.deltaMode === 0 && ((l = i.deltaX), (u = i.deltaY), (g = 1));
			const y = n.display,
				x = y.scroller,
				S = x.scrollWidth > x.clientWidth,
				_ = x.scrollHeight > x.clientHeight;
			if ((l && S) || (u && _)) {
				if (u && z && v) {
					e: for (let $ = i.target, D = y.view; $ != x; $ = $.parentNode) {
						for (let K = 0; K < D.length; K++) {
							if (D[K].node == $) {
								n.display.currentWheelTarget = $;
								break e;
							}
						}
					}
				}
				if (l && !s && !M && g != undefined) {
					u && _ && nl(n, Math.max(0, x.scrollTop + u * g)),
						ho(n, Math.max(0, x.scrollLeft + l * g)),
						(!u || (u && _)) && rn(i),
						(y.wheelStartX = undefined);
					return;
				}
				if (u && g != undefined) {
					let j = u * g,
						ne = n.doc.scrollTop,
						ce = ne + y.wrapper.clientHeight;
					j < 0
						? (ne = Math.max(0, ne + j - 50))
						: (ce = Math.min(n.doc.height, ce + j + 50)),
						Sf(n, { top: ne, bottom: ce });
				}
				Ua < 20 &&
					i.deltaMode !== 0 &&
					(y.wheelStartX == undefined
						? ((y.wheelStartX = x.scrollLeft),
							(y.wheelStartY = x.scrollTop),
							(y.wheelDX = l),
							(y.wheelDY = u),
							setTimeout(() => {
								if (y.wheelStartX != undefined) {
									const ge = x.scrollLeft - y.wheelStartX,
										we = x.scrollTop - y.wheelStartY,
										ke =
											(we && y.wheelDY && we / y.wheelDY) ||
											(ge && y.wheelDX && ge / y.wheelDX);
									(y.wheelStartX = y.wheelStartY = undefined),
										ke && ((ti = (ti * Ua + ke) / (Ua + 1)), ++Ua);
								}
							}, 200))
						: ((y.wheelDX += l), (y.wheelDY += u)));
			}
		}
		const Vn = function Vn(n, i) {
			(this.ranges = n), (this.primIndex = i);
		};
		(Vn.prototype.primary = function primary() {
			return this.ranges[this.primIndex];
		}),
			(Vn.prototype.equals = function equals(n) {
				if (n == this) {
					return !0;
				}
				if (
					n.primIndex != this.primIndex ||
					n.ranges.length != this.ranges.length
				) {
					return !1;
				}
				for (let i = 0; i < this.ranges.length; i++) {
					const a = this.ranges[i],
						l = n.ranges[i];
					if (!(ft(a.anchor, l.anchor) && ft(a.head, l.head))) {
						return !1;
					}
				}
				return !0;
			}),
			(Vn.prototype.deepCopy = function deepCopy() {
				for (var n = [], i = 0; i < this.ranges.length; i++) {
					n[i] = new dt(Vt(this.ranges[i].anchor), Vt(this.ranges[i].head));
				}
				return new Vn(n, this.primIndex);
			}),
			(Vn.prototype.somethingSelected = function somethingSelected() {
				for (let n = 0; n < this.ranges.length; n++) {
					if (!this.ranges[n].empty()) {return !0;}
				}
				return !1;
			}),
			(Vn.prototype.contains = function contains(n, i) {
				i || (i = n);
				for (let a = 0; a < this.ranges.length; a++) {
					const l = this.ranges[a];
					if (Se(i, l.from()) >= 0 && Se(n, l.to()) <= 0) {
						return a;
					}
				}
				return -1;
			});
		const dt = function dt(n, i) {
			(this.anchor = n), (this.head = i);
		};
		(dt.prototype.from = function from() {
			return Vo(this.anchor, this.head);
		}),
			(dt.prototype.to = function to() {
				return yn(this.anchor, this.head);
			}),
			(dt.prototype.empty = function empty() {
				return (
					this.head.line == this.anchor.line && this.head.ch == this.anchor.ch
				);
			});
		function vr(n, i, a) {
			const l = n && n.options.selectionsMayTouch,
				u = i[a];
			i.sort((K, j) => Se(K.from(), j.from())), (a = Ee(i, u));
			for (let g = 1; g < i.length; g++) {
				const y = i[g],
					x = i[g - 1],
					S = Se(x.to(), y.from());
				if (l && !y.empty() ? S > 0 : S >= 0) {
					const _ = Vo(x.from(), y.from()),
						$ = yn(x.to(), y.to()),
						D = x.empty() ? y.from() == y.head : x.from() == x.head;
					g <= a && --a, i.splice(--g, 2, new dt(D ? $ : _, D ? _ : $));
				}
			}
			return new Vn(i, a);
		}
		function Li(n, i) {
			return new Vn([new dt(n, i || n)], 0);
		}
		function Ai(n) {
			return n.text
				? ee(
						n.from.line + n.text.length - 1,
						ue(n.text).length + (n.text.length == 1 ? n.from.ch : 0),
					)
				: n.to;
		}
		function pg(n, i) {
			if (Se(n, i.from) < 0) {
				return n;
			}
			if (Se(n, i.to) <= 0) {
				return Ai(i);
			}
			let a = n.line + i.text.length - (i.to.line - i.from.line) - 1,
				l = n.ch;
			return n.line == i.to.line && (l += Ai(i).ch - i.to.ch), ee(a, l);
		}
		function Cf(n, i) {
			for (var a = [], l = 0; l < n.sel.ranges.length; l++) {
				const u = n.sel.ranges[l];
				a.push(new dt(pg(u.anchor, i), pg(u.head, i)));
			}
			return vr(n.cm, a, n.sel.primIndex);
		}
		function gg(n, i, a) {
			return n.line == i.line
				? ee(a.line, n.ch - i.ch + a.ch)
				: ee(a.line + (n.line - i.line), n.ch);
		}
		function Qx(n, i, a) {
			for (var l = [], u = ee(n.first, 0), g = u, y = 0; y < i.length; y++) {
				const x = i[y],
					S = gg(x.from, u, g),
					_ = gg(Ai(x), u, g);
				if (((u = x.to), (g = _), a == "around")) {
					const $ = n.sel.ranges[y],
						D = Se($.head, $.anchor) < 0;
					l[y] = new dt(D ? _ : S, D ? S : _);
				} else {
					l[y] = new dt(S, S);
				}
			}
			return new Vn(l, n.sel.primIndex);
		}
		function Ef(n) {
			(n.doc.mode = Bo(n.options, n.doc.modeOption)), ll(n);
		}
		function ll(n) {
			n.doc.iter((i) => {
				i.stateAfter && (i.stateAfter = undefined),
					i.styles && (i.styles = undefined);
			}),
				(n.doc.modeFrontier = n.doc.highlightFrontier = n.doc.first),
				ol(n, 100),
				n.state.modeGen++,
				n.curOp && bn(n);
		}
		function vg(n, i) {
			return (
				i.from.ch == 0 &&
				i.to.ch == 0 &&
				ue(i.text) == "" &&
				(!n.cm || n.cm.options.wholeLineUpdateBefore)
			);
		}
		function Lf(n, i, a, l) {
			function u(ke) {
				return a ? a[ke] : undefined;
			}
			function g(ke, xe, Me) {
				lx(ke, xe, Me, l), jt(ke, "change", ke, i);
			}
			function y(ke, xe) {
				for (var Me = [], Ie = ke; Ie < xe; ++Ie) {
					Me.push(new jo(_[Ie], u(Ie), l));
				}
				return Me;
			}
			const x = i.from,
				S = i.to,
				_ = i.text,
				$ = Oe(n, x.line),
				D = Oe(n, S.line),
				K = ue(_),
				j = u(_.length - 1),
				ne = S.line - x.line;
			if (i.full) {
				n.insert(0, y(0, _.length)), n.remove(_.length, n.size - _.length);
			} else if (vg(n, i)) {
				const ce = y(0, _.length - 1);
				g(D, D.text, j),
					ne && n.remove(x.line, ne),
					ce.length && n.insert(x.line, ce);
			} else if ($ == D) {
				if (_.length == 1) {
					g($, $.text.slice(0, x.ch) + K + $.text.slice(S.ch), j);
				} else {
					const ge = y(1, _.length - 1);
					ge.push(new jo(K + $.text.slice(S.ch), j, l)),
						g($, $.text.slice(0, x.ch) + _[0], u(0)),
						n.insert(x.line + 1, ge);
				}
			} else if (_.length == 1) {
				g($, $.text.slice(0, x.ch) + _[0] + D.text.slice(S.ch), u(0)),
					n.remove(x.line + 1, ne);
			} else {
				g($, $.text.slice(0, x.ch) + _[0], u(0)),
					g(D, K + D.text.slice(S.ch), j);
				const we = y(1, _.length - 1);
				ne > 1 && n.remove(x.line + 1, ne - 1), n.insert(x.line + 1, we);
			}
			jt(n, "change", n, i);
		}
		function Mi(n, i, a) {
			function l(u, g, y) {
				if (u.linked) {
					for (let x = 0; x < u.linked.length; ++x) {
						const S = u.linked[x];
						if (S.doc != g) {
							const _ = y && S.sharedHist;
							(a && !_) || (i(S.doc, _), l(S.doc, u, _));
						}
					}
				}
			}
			l(n, undefined, !0);
		}
		function mg(n, i) {
			if (i.cm) {
				throw new Error("This document is already in use.");
			}
			(n.doc = i),
				(i.cm = n),
				pf(n),
				Ef(n),
				yg(n),
				(n.options.direction = i.direction),
				n.options.lineWrapping || nf(n),
				(n.options.mode = i.modeOption),
				bn(n);
		}
		function yg(n) {
			(n.doc.direction == "rtl" ? Ne : Z)(n.display.lineDiv, "CodeMirror-rtl");
		}
		function eS(n) {
			On(n, () => {
				yg(n), bn(n);
			});
		}
		function Va(n) {
			(this.done = []),
				(this.undone = []),
				(this.undoDepth = n ? n.undoDepth : 1 / 0),
				(this.lastModTime = this.lastSelTime = 0),
				(this.lastOp = this.lastSelOp = undefined),
				(this.lastOrigin = this.lastSelOrigin = undefined),
				(this.generation = this.maxGeneration = n ? n.maxGeneration : 1);
		}
		function Af(n, i) {
			const a = { from: Vt(i.from), to: Ai(i), text: Zr(n, i.from, i.to) };
			return (
				xg(n, a, i.from.line, i.to.line + 1),
				Mi(n, (l) => xg(l, a, i.from.line, i.to.line + 1), !0),
				a
			);
		}
		function bg(n) {
			while (n.length > 0) {
				const i = ue(n);
				if (i.ranges) {
					n.pop();
				} else {
					break;
				}
			}
		}
		function tS(n, i) {
			if (i) {
				return bg(n.done), ue(n.done);
			}
			if (n.done.length > 0 && !ue(n.done).ranges) {
				return ue(n.done);
			}
			if (n.done.length > 1 && !n.done[n.done.length - 2].ranges) {
				return n.done.pop(), ue(n.done);
			}
		}
		function wg(n, i, a, l) {
			const u = n.history;
			u.undone.length = 0;
			let g = Date.now(),
				y,
				x;
			if (
				(u.lastOp == l ||
					(u.lastOrigin == i.origin &&
						i.origin &&
						((i.origin.charAt(0) == "+" &&
							u.lastModTime >
								g - (n.cm ? n.cm.options.historyEventDelay : 500)) ||
							i.origin.charAt(0) == "*"))) &&
				(y = tS(u, u.lastOp == l))
			) {
				(x = ue(y.changes)),
					Se(i.from, i.to) == 0 && Se(i.from, x.to) == 0
						? (x.to = Ai(i))
						: y.changes.push(Af(n, i));
			} else {
				const S = ue(u.done);
				for (
					!(S && S.ranges) && ja(n.sel, u.done),
						y = { changes: [Af(n, i)], generation: u.generation },
						u.done.push(y);
					u.done.length > u.undoDepth;
				) {
					u.done.shift(), u.done[0].ranges || u.done.shift();
				}
			}
			u.done.push(a),
				(u.generation = ++u.maxGeneration),
				(u.lastModTime = u.lastSelTime = g),
				(u.lastOp = u.lastSelOp = l),
				(u.lastOrigin = u.lastSelOrigin = i.origin),
				x || Mt(n, "historyAdded");
		}
		function nS(n, i, a, l) {
			const u = i.charAt(0);
			return (
				u == "*" ||
				(u == "+" &&
					a.ranges.length == l.ranges.length &&
					a.somethingSelected() == l.somethingSelected() &&
					new Date() - n.history.lastSelTime <=
						(n.cm ? n.cm.options.historyEventDelay : 500))
			);
		}
		function rS(n, i, a, l) {
			const u = n.history,
				g = l && l.origin;
			a == u.lastSelOp ||
			(g &&
				u.lastSelOrigin == g &&
				((u.lastModTime == u.lastSelTime && u.lastOrigin == g) ||
					nS(n, g, ue(u.done), i)))
				? (u.done[u.done.length - 1] = i)
				: ja(i, u.done),
				(u.lastSelTime = Date.now()),
				(u.lastSelOrigin = g),
				(u.lastSelOp = a),
				l && l.clearRedo !== !1 && bg(u.undone);
		}
		function ja(n, i) {
			const a = ue(i);
			(a && a.ranges && a.equals(n)) || i.push(n);
		}
		function xg(n, i, a, l) {
			let u = i["spans_" + n.id],
				g = 0;
			n.iter(Math.max(n.first, a), Math.min(n.first + n.size, l), (y) => {
				y.markedSpans &&
					((u || (u = i["spans_" + n.id] = {}))[g] = y.markedSpans),
					++g;
			});
		}
		function iS(n) {
			if (!n) {
				return ;
			}
			for (var i, a = 0; a < n.length; ++a) {
				n[a].marker.explicitlyCleared
					? i || (i = n.slice(0, a))
					: i && i.push(n[a]);
			}
			return i ? (i.length > 0 ? i : undefined) : n;
		}
		function oS(n, i) {
			const a = i["spans_" + n.id];
			if (!a) {
				return ;
			}
			for (var l = [], u = 0; u < i.text.length; ++u) {
				l.push(iS(a[u]));
			}
			return l;
		}
		function Sg(n, i) {
			const a = oS(n, i),
				l = Ju(n, i);
			if (!a) {
				return l;
			}
			if (!l) {
				return a;
			}
			for (let u = 0; u < a.length; ++u) {
				const g = a[u],
					y = l[u];
				if (g && y) {
					e: for (let x = 0; x < y.length; ++x) {
						for (var S = y[x], _ = 0; _ < g.length; ++_) {
							if (g[_].marker == S.marker) {continue e;}
						}
						g.push(S);
					}
				} else {
					y && (a[u] = y);
				}
			}
			return a;
		}
		function es(n, i, a) {
			for (var l = [], u = 0; u < n.length; ++u) {
				const g = n[u];
				if (g.ranges) {
					l.push(a ? Vn.prototype.deepCopy.call(g) : g);
					continue;
				}
				const y = g.changes,
					x = [];
				l.push({ changes: x });
				for (let S = 0; S < y.length; ++S) {
					let _ = y[S],
						$ = void 0;
					if ((x.push({ from: _.from, to: _.to, text: _.text }), i)) {
						for (const D in _) {
							($ = D.match(/^spans_(\d+)$/)) &&
								Ee(i, Number($[1])) > -1 &&
								((ue(x)[D] = _[D]), delete _[D]);
						}
					}
				}
			}
			return l;
		}
		function Mf(n, i, a, l) {
			if (l) {
				let u = n.anchor;
				if (a) {
					const g = Se(i, u) < 0;
					g != Se(a, u) < 0 ? ((u = i), (i = a)) : g != Se(i, a) < 0 && (i = a);
				}
				return new dt(u, i);
			}
			return new dt(a || i, i);
		}
		function Ga(n, i, a, l, u) {
			u == undefined && (u = n.cm && (n.cm.display.shift || n.extend)),
				on(n, new Vn([Mf(n.sel.primary(), i, a, u)], 0), l);
		}
		function _g(n, i, a) {
			for (
				var l = [], u = n.cm && (n.cm.display.shift || n.extend), g = 0;
				g < n.sel.ranges.length;
				g++
			) {
				l[g] = Mf(n.sel.ranges[g], i[g], undefined, u);
			}
			const y = vr(n.cm, l, n.sel.primIndex);
			on(n, y, a);
		}
		function Nf(n, i, a, l) {
			const u = [...n.sel.ranges];
			(u[i] = a), on(n, vr(n.cm, u, n.sel.primIndex), l);
		}
		function kg(n, i, a, l) {
			on(n, Li(i, a), l);
		}
		function sS(n, i, a) {
			const l = {
				ranges: i.ranges,
				update(u) {
					this.ranges = [];
					for (let g = 0; g < u.length; g++) {
						this.ranges[g] = new dt(Ge(n, u[g].anchor), Ge(n, u[g].head));
					}
				},
				origin: a && a.origin,
			};
			return (
				Mt(n, "beforeSelectionChange", n, l),
				n.cm && Mt(n.cm, "beforeSelectionChange", n.cm, l),
				l.ranges != i.ranges ? vr(n.cm, l.ranges, l.ranges.length - 1) : i
			);
		}
		function Tg(n, i, a) {
			const l = n.history.done,
				u = ue(l);
			u && u.ranges ? ((l[l.length - 1] = i), Ka(n, i, a)) : on(n, i, a);
		}
		function on(n, i, a) {
			Ka(n, i, a), rS(n, n.sel, n.cm ? n.cm.curOp.id : Number.NaN, a);
		}
		function Ka(n, i, a) {
			(Pn(n, "beforeSelectionChange") ||
				(n.cm && Pn(n.cm, "beforeSelectionChange"))) &&
				(i = sS(n, i, a));
			const l =
				(a && a.bias) ||
				(Se(i.primary().head, n.sel.primary().head) < 0 ? -1 : 1);
			Cg(n, Lg(n, i, l, !0)),
				!(a && a.scroll === !1) &&
					n.cm &&
					n.cm.getOption("readOnly") != "nocursor" &&
					Jo(n.cm);
		}
		function Cg(n, i) {
			i.equals(n.sel) ||
				((n.sel = i),
				n.cm &&
					((n.cm.curOp.updateInput = 1),
					(n.cm.curOp.selectionChanged = !0),
					er(n.cm)),
				jt(n, "cursorActivity", n));
		}
		function Eg(n) {
			Cg(n, Lg(n, n.sel, undefined, !1));
		}
		function Lg(n, i, a, l) {
			for (var u, g = 0; g < i.ranges.length; g++) {
				const y = i.ranges[g],
					x = i.ranges.length == n.sel.ranges.length && n.sel.ranges[g],
					S = Xa(n, y.anchor, x && x.anchor, a, l),
					_ = y.head == y.anchor ? S : Xa(n, y.head, x && x.head, a, l);
				(u || S != y.anchor || _ != y.head) &&
					(u || (u = i.ranges.slice(0, g)), (u[g] = new dt(S, _)));
			}
			return u ? vr(n.cm, u, i.primIndex) : i;
		}
		function ts(n, i, a, l, u) {
			const g = Oe(n, i.line);
			if (g.markedSpans) {
				for (let y = 0; y < g.markedSpans.length; ++y) {
					const x = g.markedSpans[y],
						S = x.marker,
						_ = "selectLeft" in S ? !S.selectLeft : S.inclusiveLeft,
						$ = "selectRight" in S ? !S.selectRight : S.inclusiveRight;
					if (
						(x.from == undefined || (_ ? x.from <= i.ch : x.from < i.ch)) &&
						(x.to == undefined || ($ ? x.to >= i.ch : x.to > i.ch))
					) {
						if (u && (Mt(S, "beforeCursorEnter"), S.explicitlyCleared)) {
							if (g.markedSpans) {
								--y;
								continue;
							} else {
								break;
							}
						}
						if (!S.atomic) {
							continue;
						}
						if (a) {
							let D = S.find(l < 0 ? 1 : -1),
								K = void 0;
							if (
								((l < 0 ? $ : _) &&
									(D = Ag(n, D, -l, D && D.line == i.line ? g : undefined)),
								D &&
									D.line == i.line &&
									(K = Se(D, a)) &&
									(l < 0 ? K < 0 : K > 0))
							) {
								return ts(n, D, i, l, u);
							}
						}
						let j = S.find(l < 0 ? -1 : 1);
						return (
							(l < 0 ? _ : $) &&
								(j = Ag(n, j, l, j.line == i.line ? g : undefined)),
							j ? ts(n, j, i, l, u) : undefined
						);
					}
				}
			}
			return i;
		}
		function Xa(n, i, a, l, u) {
			const g = l || 1,
				y =
					ts(n, i, a, g, u) ||
					(!u && ts(n, i, a, g, !0)) ||
					ts(n, i, a, -g, u) ||
					(!u && ts(n, i, a, -g, !0));
			return y || ((n.cantEdit = !0), ee(n.first, 0));
		}
		function Ag(n, i, a, l) {
			return a < 0 && i.ch == 0
				? (i.line > n.first
					? Ge(n, ee(i.line - 1))
					: null)
				: a > 0 && i.ch == (l || Oe(n, i.line)).text.length
					? i.line < n.first + n.size - 1
						? ee(i.line + 1, 0)
						: undefined
					: new ee(i.line, i.ch + a);
		}
		function Mg(n) {
			n.setSelection(ee(n.firstLine(), 0), ee(n.lastLine()), H);
		}
		function Ng(n, i, a) {
			const l = {
				canceled: !1,
				from: i.from,
				to: i.to,
				text: i.text,
				origin: i.origin,
				cancel() {
					return (l.canceled = !0);
				},
			};
			return (
				a &&
					(l.update = (u, g, y, x) => {
						u && (l.from = Ge(n, u)),
							g && (l.to = Ge(n, g)),
							y && (l.text = y),
							x !== void 0 && (l.origin = x);
					}),
				Mt(n, "beforeChange", n, l),
				n.cm && Mt(n.cm, "beforeChange", n.cm, l),
				l.canceled
					? (n.cm && (n.cm.curOp.updateInput = 2), undefined)
					: { from: l.from, to: l.to, text: l.text, origin: l.origin }
			);
		}
		function ns(n, i, a) {
			if (n.cm) {
				if (!n.cm.curOp) {
					return Gt(n.cm, ns)(n, i, a);
				}
				if (n.cm.state.suppressEdits) {
					return;
				}
			}
			if (
				!(
					(Pn(n, "beforeChange") || (n.cm && Pn(n.cm, "beforeChange"))) &&
					((i = Ng(n, i, !0)), !i)
				)
			) {
				const l = Sp && !a && rx(n, i.from, i.to);
				if (l) {
					for (let u = l.length - 1; u >= 0; --u) {
						$g(n, {
							from: l[u].from,
							to: l[u].to,
							text: u ? [""] : i.text,
							origin: i.origin,
						});
					}
				} else {
					$g(n, i);
				}
			}
		}
		function $g(n, i) {
			if (!(i.text.length == 1 && i.text[0] == "" && Se(i.from, i.to) == 0)) {
				const a = Cf(n, i);
				wg(n, i, a, n.cm ? n.cm.curOp.id : Number.NaN), al(n, i, a, Ju(n, i));
				const l = [];
				Mi(n, (u, g) => {
					!g && Ee(l, u.history) == -1 && (Dg(u.history, i), l.push(u.history)),
						al(u, i, undefined, Ju(u, i));
				});
			}
		}
		function Ya(n, i, a) {
			const l = n.cm && n.cm.state.suppressEdits;
			if (!(l && !a)) {
				for (
					var u = n.history,
						g,
						y = n.sel,
						x = i == "undo" ? u.done : u.undone,
						S = i == "undo" ? u.undone : u.done,
						_ = 0;
					_ < x.length &&
					((g = x[_]), !(a ? g.ranges && !g.equals(n.sel) : !g.ranges));
					_++
				) {}
				if (_ != x.length) {
					for (u.lastOrigin = u.lastSelOrigin = undefined; ; ) {
						if (((g = x.pop()), g.ranges)) {
							if ((ja(g, S), a && !g.equals(n.sel))) {
								on(n, g, { clearRedo: !1 });
								return;
							}
							y = g;
						} else if (l) {
							x.push(g);
							return;
						} else {
							break;
						}
					}
					const $ = [];
					ja(y, S),
						S.push({ changes: $, generation: u.generation }),
						(u.generation = g.generation || ++u.maxGeneration);
					for (
						let D = Pn(n, "beforeChange") || (n.cm && Pn(n.cm, "beforeChange")),
							K = (ce) => {
								const ge = g.changes[ce];
								if (((ge.origin = i), D && !Ng(n, ge, !1))) {
									return (x.length = 0), {};
								}
								$.push(Af(n, ge));
								const we = ce ? Cf(n, ge) : ue(x);
								al(n, ge, we, Sg(n, ge)),
									!ce &&
										n.cm &&
										n.cm.scrollIntoView({ from: ge.from, to: Ai(ge) });
								const ke = [];
								Mi(n, (xe, Me) => {
									!Me &&
										Ee(ke, xe.history) == -1 &&
										(Dg(xe.history, ge), ke.push(xe.history)),
										al(xe, ge, undefined, Sg(xe, ge));
								});
							},
							j = g.changes.length - 1;
						j >= 0;
						--j
					) {
						const ne = K(j);
						if (ne) {
							return ne.v;
						}
					}
				}
			}
		}
		function Pg(n, i) {
			if (
				i != 0 &&
				((n.first += i),
				(n.sel = new Vn(
					be(
						n.sel.ranges,
						(u) =>
							new dt(
								ee(u.anchor.line + i, u.anchor.ch),
								ee(u.head.line + i, u.head.ch),
							),
					),
					n.sel.primIndex,
				)),
				n.cm)
			) {
				bn(n.cm, n.first, n.first - i, i);
				for (let a = n.cm.display, l = a.viewFrom; l < a.viewTo; l++) {
					Ci(n.cm, l, "gutter");
				}
			}
		}
		function al(n, i, a, l) {
			if (n.cm && !n.cm.curOp) {
				return Gt(n.cm, al)(n, i, a, l);
			}
			if (i.to.line < n.first) {
				Pg(n, i.text.length - 1 - (i.to.line - i.from.line));
				return;
			}
			if (!(i.from.line > n.lastLine())) {
				if (i.from.line < n.first) {
					const u = i.text.length - 1 - (n.first - i.from.line);
					Pg(n, u),
						(i = {
							from: ee(n.first, 0),
							to: ee(i.to.line + u, i.to.ch),
							text: [ue(i.text)],
							origin: i.origin,
						});
				}
				const g = n.lastLine();
				i.to.line > g &&
					(i = {
						from: i.from,
						to: ee(g, Oe(n, g).text.length),
						text: [i.text[0]],
						origin: i.origin,
					}),
					(i.removed = Zr(n, i.from, i.to)),
					a || (a = Cf(n, i)),
					n.cm ? lS(n.cm, i, l) : Lf(n, i, l),
					Ka(n, a, H),
					n.cantEdit && Xa(n, ee(n.firstLine(), 0)) && (n.cantEdit = !1);
			}
		}
		function lS(n, i, a) {
			let l = n.doc,
				u = n.display,
				g = i.from,
				y = i.to,
				x = !1,
				S = g.line;
			n.options.lineWrapping ||
				((S = T(pr(Oe(l, g.line)))),
				l.iter(S, y.line + 1, (j) => {
					if (j == u.maxLine) {
						return (x = !0), !0;
					}
				})),
				l.sel.contains(i.from, i.to) > -1 && er(n),
				Lf(l, i, a, Jp(n)),
				n.options.lineWrapping ||
					(l.iter(S, g.line + i.text.length, (j) => {
						const ne = Pa(j);
						ne > u.maxLineLength &&
							((u.maxLine = j),
							(u.maxLineLength = ne),
							(u.maxLineChanged = !0),
							(x = !1));
					}),
					x && (n.curOp.updateMaxLine = !0)),
				Y1(l, g.line),
				ol(n, 400);
			const _ = i.text.length - (y.line - g.line) - 1;
			i.full
				? bn(n)
				: (g.line == y.line && i.text.length == 1 && !vg(n.doc, i)
					? Ci(n, g.line, "text")
					: bn(n, g.line, y.line + 1, _));
			const $ = Pn(n, "changes"),
				D = Pn(n, "change");
			if (D || $) {
				const K = {
					from: g,
					to: y,
					text: i.text,
					removed: i.removed,
					origin: i.origin,
				};
				D && jt(n, "change", n, K),
					$ && (n.curOp.changeObjs || (n.curOp.changeObjs = [])).push(K);
			}
			n.display.selForContextMenu = undefined;
		}
		function rs(n, i, a, l, u) {
			let g;
			l || (l = a),
				Se(l, a) < 0 && ((g = [l, a]), (a = g[0]), (l = g[1])),
				typeof i === "string" && (i = n.splitLines(i)),
				ns(n, { from: a, to: l, text: i, origin: u });
		}
		function Og(n, i, a, l) {
			a < n.line ? (n.line += l) : i < n.line && ((n.line = i), (n.ch = 0));
		}
		function Rg(n, i, a, l) {
			for (let u = 0; u < n.length; ++u) {
				let g = n[u],
					y = !0;
				if (g.ranges) {
					g.copied || ((g = n[u] = g.deepCopy()), (g.copied = !0));
					for (let x = 0; x < g.ranges.length; x++) {
						Og(g.ranges[x].anchor, i, a, l), Og(g.ranges[x].head, i, a, l);
					}
					continue;
				}
				for (let S = 0; S < g.changes.length; ++S) {
					const _ = g.changes[S];
					if (a < _.from.line) {
						(_.from = ee(_.from.line + l, _.from.ch)),
							(_.to = ee(_.to.line + l, _.to.ch));
					} else if (i <= _.to.line) {
						y = !1;
						break;
					}
				}
				y || (n.splice(0, u + 1), (u = 0));
			}
		}
		function Dg(n, i) {
			const a = i.from.line,
				l = i.to.line,
				u = i.text.length - (l - a) - 1;
			Rg(n.done, a, l, u), Rg(n.undone, a, l, u);
		}
		function cl(n, i, a, l) {
			let u = i,
				g = i;
			return (
				typeof i === "number" ? (g = Oe(n, hp(n, i))) : (u = T(i)),
				u == undefined ? undefined : (l(g, u) && n.cm && Ci(n.cm, u, a), g)
			);
		}
		function ul(n) {
			(this.lines = n), (this.parent = undefined);
			for (var i = 0, a = 0; a < n.length; ++a) {
				(n[a].parent = this), (i += n[a].height);
			}
			this.height = i;
		}
		ul.prototype = {
			chunkSize() {
				return this.lines.length;
			},
			removeInner(n, i) {
				for (let a = n, l = n + i; a < l; ++a) {
					const u = this.lines[a];
					(this.height -= u.height), ax(u), jt(u, "delete");
				}
				this.lines.splice(n, i);
			},
			collapse(n) {
				n.push.apply(n, this.lines);
			},
			insertInner(n, i, a) {
				(this.height += a),
					(this.lines = this.lines
						.slice(0, n)
						.concat(i)
						.concat(this.lines.slice(n)));
				for (let l = 0; l < i.length; ++l) {
					i[l].parent = this;
				}
			},
			iterN(n, i, a) {
				for (const l = n + i; n < l; ++n) {
					if (a(this.lines[n])) {return !0;}
				}
			},
		};
		function fl(n) {
			this.children = n;
			for (var i = 0, a = 0, l = 0; l < n.length; ++l) {
				const u = n[l];
				(i += u.chunkSize()), (a += u.height), (u.parent = this);
			}
			(this.size = i), (this.height = a), (this.parent = undefined);
		}
		fl.prototype = {
			chunkSize() {
				return this.size;
			},
			removeInner(n, i) {
				this.size -= i;
				for (let a = 0; a < this.children.length; ++a) {
					const l = this.children[a],
						u = l.chunkSize();
					if (n < u) {
						const g = Math.min(i, u - n),
							y = l.height;
						if (
							(l.removeInner(n, g),
							(this.height -= y - l.height),
							u == g && (this.children.splice(a--, 1), (l.parent = undefined)),
							(i -= g) == 0)
						) {
							break;
						}
						n = 0;
					} else {
						n -= u;
					}
				}
				if (
					this.size - i < 25 &&
					(this.children.length > 1 || !(this.children[0] instanceof ul))
				) {
					const x = [];
					this.collapse(x),
						(this.children = [new ul(x)]),
						(this.children[0].parent = this);
				}
			},
			collapse(n) {
				for (let i = 0; i < this.children.length; ++i) {
					this.children[i].collapse(n);
				}
			},
			insertInner(n, i, a) {
				(this.size += i.length), (this.height += a);
				for (let l = 0; l < this.children.length; ++l) {
					const u = this.children[l],
						g = u.chunkSize();
					if (n <= g) {
						if ((u.insertInner(n, i, a), u.lines && u.lines.length > 50)) {
							for (
								var y = (u.lines.length % 25) + 25, x = y;
								x < u.lines.length;
							) {
								const S = new ul(u.lines.slice(x, (x += 25)));
								(u.height -= S.height),
									this.children.splice(++l, 0, S),
									(S.parent = this);
							}
							(u.lines = u.lines.slice(0, y)), this.maybeSpill();
						}
						break;
					}
					n -= g;
				}
			},
			maybeSpill() {
				if (!(this.children.length <= 10)) {
					let n = this;
					do {
						const i = n.children.splice(-5, 5),
							a = new fl(i);
						if (n.parent) {
							(n.size -= a.size), (n.height -= a.height);
							const u = Ee(n.parent.children, n);
							n.parent.children.splice(u + 1, 0, a);
						} else {
							const l = new fl(n.children);
							(l.parent = n), (n.children = [l, a]), (n = l);
						}
						a.parent = n.parent;
					} while (n.children.length > 10);
					n.parent.maybeSpill();
				}
			},
			iterN(n, i, a) {
				for (let l = 0; l < this.children.length; ++l) {
					const u = this.children[l],
						g = u.chunkSize();
					if (n < g) {
						const y = Math.min(i, g - n);
						if (u.iterN(n, y, a)) {
							return !0;
						}
						if ((i -= y) == 0) {
							break;
						}
						n = 0;
					} else {
						n -= g;
					}
				}
			},
		};
		const dl = function dl(n, i, a) {
			if (a) {
				for (const l in a) {
					Object.hasOwn(a, l) && (this[l] = a[l]);
				}
			}
			(this.doc = n), (this.node = i);
		};
		(dl.prototype.clear = function clear() {
			const n = this.doc.cm,
				i = this.line.widgets,
				a = this.line,
				l = T(a);
			if (!(l == undefined || !i)) {
				for (let u = 0; u < i.length; ++u) {
					i[u] == this && i.splice(u--, 1);
				}
				i.length || (a.widgets = undefined);
				const g = Js(this);
				Un(a, Math.max(0, a.height - g)),
					n &&
						(On(n, () => {
							zg(n, a, -g), Ci(n, l, "widget");
						}),
						jt(n, "lineWidgetCleared", n, this, l));
			}
		}),
			(dl.prototype.changed = function changed() {
				const i = this.height,
					a = this.doc.cm,
					l = this.line;
				this.height = undefined;
				const u = Js(this) - i;
				u &&
					(Ti(this.doc, l) || Un(l, l.height + u),
					a &&
						On(a, () => {
							(a.curOp.forceUpdate = !0),
								zg(a, l, u),
								jt(a, "lineWidgetChanged", a, this, T(l));
						}));
			}),
			cr(dl);
		function zg(n, i, a) {
			Qr(i) < ((n.curOp && n.curOp.scrollTop) || n.doc.scrollTop) && wf(n, a);
		}
		function aS(n, i, a, l) {
			const u = new dl(n, a, l),
				g = n.cm;
			return (
				g && u.noHScroll && (g.display.alignWidgets = !0),
				cl(n, i, "widget", (y) => {
					const x = y.widgets || (y.widgets = []);
					if (
						(u.insertAt == undefined
							? x.push(u)
							: x.splice(Math.min(x.length, Math.max(0, u.insertAt)), 0, u),
						(u.line = y),
						g && !Ti(n, y))
					) {
						const S = Qr(y) < n.scrollTop;
						Un(y, y.height + Js(u)),
							S && wf(g, u.height),
							(g.curOp.forceUpdate = !0);
					}
					return !0;
				}),
				g && jt(g, "lineWidgetAdded", g, u, typeof i === "number" ? i : T(i)),
				u
			);
		}
		let Ig = 0,
			Ni = function Ni(n, i) {
				(this.lines = []), (this.type = i), (this.doc = n), (this.id = ++Ig);
			};
		(Ni.prototype.clear = function clear() {
			if (!this.explicitlyCleared) {
				const n = this.doc.cm,
					i = n && !n.curOp;
				if ((i && go(n), Pn(this, "clear"))) {
					const a = this.find();
					a && jt(this, "clear", a.from, a.to);
				}
				for (var l, u, g = 0; g < this.lines.length; ++g) {
					const y = this.lines[g],
						x = Xs(y.markedSpans, this);
					n && !this.collapsed
						? Ci(n, T(y), "text")
						: n &&
							(x.to != undefined && (u = T(y)),
							x.from != undefined && (l = T(y))),
						(y.markedSpans = Q1(y.markedSpans, x)),
						x.from == undefined &&
							this.collapsed &&
							!Ti(this.doc, y) &&
							n &&
							Un(y, Xo(n.display));
				}
				if (n && this.collapsed && !n.options.lineWrapping) {
					for (let S = 0; S < this.lines.length; ++S) {
						const _ = pr(this.lines[S]),
							$ = Pa(_);
						$ > n.display.maxLineLength &&
							((n.display.maxLine = _),
							(n.display.maxLineLength = $),
							(n.display.maxLineChanged = !0));
					}
				}
				l != undefined && n && this.collapsed && bn(n, l, u + 1),
					(this.lines.length = 0),
					(this.explicitlyCleared = !0),
					this.atomic &&
						this.doc.cantEdit &&
						((this.doc.cantEdit = !1), n && Eg(n.doc)),
					n && jt(n, "markerCleared", n, this, l, u),
					i && vo(n),
					this.parent && this.parent.clear();
			}
		}),
			(Ni.prototype.find = function find(n, i) {
				n == undefined && this.type == "bookmark" && (n = 1);
				for (var a, l, u = 0; u < this.lines.length; ++u) {
					const g = this.lines[u],
						y = Xs(g.markedSpans, this);
					if (
						y.from != undefined &&
						((a = ee(i ? g : T(g), y.from)), n == -1)
					) {
						return a;
					}
					if (y.to != undefined && ((l = ee(i ? g : T(g), y.to)), n == 1)) {
						return l;
					}
				}
				return a && { from: a, to: l };
			}),
			(Ni.prototype.changed = function changed() {
				const i = this.find(-1, !0),
					l = this.doc.cm;
				!(i && l) ||
					On(l, () => {
						const u = i.line,
							g = T(i.line),
							y = lf(l, g);
						if (
							(y &&
								(Up(y), (l.curOp.selectionChanged = l.curOp.forceUpdate = !0)),
							(l.curOp.updateMaxLine = !0),
							!Ti(this.doc, u) && this.height != undefined)
						) {
							const x = this.height;
							this.height = undefined;
							const S = Js(this) - x;
							S && Un(u, u.height + S);
						}
						jt(l, "markerChanged", l, this);
					});
			}),
			(Ni.prototype.attachLine = function attachLine(n) {
				if (this.lines.length === 0 && this.doc.cm) {
					const i = this.doc.cm.curOp;
					(!i.maybeHiddenMarkers || Ee(i.maybeHiddenMarkers, this) == -1) &&
						(i.maybeUnhiddenMarkers || (i.maybeUnhiddenMarkers = [])).push(
							this,
						);
				}
				this.lines.push(n);
			}),
			(Ni.prototype.detachLine = function detachLine(n) {
				if (
					(this.lines.splice(Ee(this.lines, n), 1),
					this.lines.length === 0 && this.doc.cm)
				) {
					const i = this.doc.cm.curOp;
					(i.maybeHiddenMarkers || (i.maybeHiddenMarkers = [])).push(this);
				}
			}),
			cr(Ni);
		function is(n, i, a, l, u) {
			if (l && l.shared) {
				return cS(n, i, a, l, u);
			}
			if (n.cm && !n.cm.curOp) {
				return Gt(n.cm, is)(n, i, a, l, u);
			}
			const g = new Ni(n, u),
				y = Se(i, a);
			if ((l && ae(l, g, !1), y > 0 || (y == 0 && g.clearWhenEmpty !== !1))) {
				return g;
			}
			if (
				(g.replacedWith &&
					((g.collapsed = !0),
					(g.widgetNode = B("span", [g.replacedWith], "CodeMirror-widget")),
					l.handleMouseEvents ||
						g.widgetNode.setAttribute("cm-ignore-events", "true"),
					l.insertLeft && (g.widgetNode.insertLeft = !0)),
				g.collapsed)
			) {
				if (
					Lp(n, i.line, i, a, g) ||
					(i.line != a.line && Lp(n, a.line, i, a, g))
				) {
					throw new Error(
						"Inserting collapsed marker partially overlapping an existing one",
					);
				}
				J1();
			}
			g.addToHistory &&
				wg(n, { from: i, to: a, origin: "markText" }, n.sel, Number.NaN);
			let x = i.line,
				S = n.cm,
				_;
			if (
				(n.iter(x, a.line + 1, (D) => {
					S &&
						g.collapsed &&
						!S.options.lineWrapping &&
						pr(D) == S.display.maxLine &&
						(_ = !0),
						g.collapsed && x != i.line && Un(D, 0),
						ex(
							D,
							new Aa(
								g,
								x == i.line ? i.ch : undefined,
								x == a.line ? a.ch : undefined,
							),
							n.cm && n.cm.curOp,
						),
						++x;
				}),
				g.collapsed &&
					n.iter(i.line, a.line + 1, (D) => {
						Ti(n, D) && Un(D, 0);
					}),
				g.clearOnEnter && ze(g, "beforeCursorEnter", () => g.clear()),
				g.readOnly &&
					(Z1(),
					(n.history.done.length || n.history.undone.length) &&
						n.clearHistory()),
				g.collapsed && ((g.id = ++Ig), (g.atomic = !0)),
				S)
			) {
				if ((_ && (S.curOp.updateMaxLine = !0), g.collapsed)) {
					bn(S, i.line, a.line + 1);
				} else if (
					g.className ||
					g.startStyle ||
					g.endStyle ||
					g.css ||
					g.attributes ||
					g.title
				) {
					for (let $ = i.line; $ <= a.line; $++) {
						Ci(S, $, "text");
					}
				}
				g.atomic && Eg(S.doc), jt(S, "markerAdded", S, g);
			}
			return g;
		}
		const hl = function hl(n, i) {
			(this.markers = n), (this.primary = i);
			for (let a = 0; a < n.length; ++a) {
				n[a].parent = this;
			}
		};
		(hl.prototype.clear = function clear() {
			if (!this.explicitlyCleared) {
				this.explicitlyCleared = !0;
				for (let n = 0; n < this.markers.length; ++n) {
					this.markers[n].clear();
				}
				jt(this, "clear");
			}
		}),
			(hl.prototype.find = function find(n, i) {
				return this.primary.find(n, i);
			}),
			cr(hl);
		function cS(n, i, a, l, u) {
			(l = ae(l)), (l.shared = !1);
			let g = [is(n, i, a, l, u)],
				y = g[0],
				x = l.widgetNode;
			return (
				Mi(n, (S) => {
					x && (l.widgetNode = x.cloneNode(!0)),
						g.push(is(S, Ge(S, i), Ge(S, a), l, u));
					for (let _ = 0; _ < S.linked.length; ++_) {
						if (S.linked[_].isParent) {return;}
					}
					y = ue(g);
				}),
				new hl(g, y)
			);
		}
		function Fg(n) {
			return n.findMarks(
				ee(n.first, 0),
				n.clipPos(ee(n.lastLine())),
				(i) => i.parent,
			);
		}
		function uS(n, i) {
			for (let a = 0; a < i.length; a++) {
				const l = i[a],
					u = l.find(),
					g = n.clipPos(u.from),
					y = n.clipPos(u.to);
				if (Se(g, y)) {
					const x = is(n, g, y, l.primary, l.primary.type);
					l.markers.push(x), (x.parent = l);
				}
			}
		}
		function fS(n) {
			for (
				let i = (l) => {
						const u = n[l],
							g = [u.primary.doc];
						Mi(u.primary.doc, (S) => g.push(S));
						for (let y = 0; y < u.markers.length; y++) {
							const x = u.markers[y];
							Ee(g, x.doc) == -1 &&
								((x.parent = undefined), u.markers.splice(y--, 1));
						}
					},
					a = 0;
				a < n.length;
				a++
			) {
				i(a);
			}
		}
		let dS = 0,
			wn = function (n, i, a, l, u) {
				if (!(this instanceof wn)) {
					return new wn(n, i, a, l, u);
				}
				a == undefined && (a = 0),
					fl.call(this, [new ul([new jo("", undefined)])]),
					(this.first = a),
					(this.scrollTop = this.scrollLeft = 0),
					(this.cantEdit = !1),
					(this.cleanGeneration = 1),
					(this.modeFrontier = this.highlightFrontier = a);
				const g = ee(a, 0);
				(this.sel = Li(g)),
					(this.history = new Va(undefined)),
					(this.id = ++dS),
					(this.modeOption = i),
					(this.lineSep = l),
					(this.direction = u == "rtl" ? "rtl" : "ltr"),
					(this.extend = !1),
					typeof n === "string" && (n = this.splitLines(n)),
					Lf(this, { from: g, to: g, text: n }),
					on(this, Li(g), H);
			};
		(wn.prototype = Le(fl.prototype, {
			constructor: wn,
			iter(n, i, a) {
				a
					? this.iterN(n - this.first, i - n, a)
					: this.iterN(this.first, this.first + this.size, n);
			},
			insert(n, i) {
				for (var a = 0, l = 0; l < i.length; ++l) {
					a += i[l].height;
				}
				this.insertInner(n - this.first, i, a);
			},
			remove(n, i) {
				this.removeInner(n - this.first, i);
			},
			getValue(n) {
				const i = Gs(this, this.first, this.first + this.size);
				return n === !1 ? i : i.join(n || this.lineSeparator());
			},
			setValue: Kt(function (n) {
				const i = ee(this.first, 0),
					a = this.first + this.size - 1;
				ns(
					this,
					{
						from: i,
						to: ee(a, Oe(this, a).text.length),
						text: this.splitLines(n),
						origin: "setValue",
						full: !0,
					},
					!0,
				),
					this.cm && tl(this.cm, 0, 0),
					on(this, Li(i), H);
			}),
			replaceRange(n, i, a, l) {
				(i = Ge(this, i)), (a = a ? Ge(this, a) : i), rs(this, n, i, a, l);
			},
			getRange(n, i, a) {
				const l = Zr(this, Ge(this, n), Ge(this, i));
				return a === !1
					? l
					: (a === ""
						? l.join("")
						: l.join(a || this.lineSeparator()));
			},
			getLine(n) {
				const i = this.getLineHandle(n);
				return i && i.text;
			},
			getLineHandle(n) {
				if (se(this, n)) {
					return Oe(this, n);
				}
			},
			getLineNumber(n) {
				return T(n);
			},
			getLineHandleVisualStart(n) {
				return typeof n === "number" && (n = Oe(this, n)), pr(n);
			},
			lineCount() {
				return this.size;
			},
			firstLine() {
				return this.first;
			},
			lastLine() {
				return this.first + this.size - 1;
			},
			clipPos(n) {
				return Ge(this, n);
			},
			getCursor(n) {
				let i = this.sel.primary(),
					a;
				return (
					n == undefined || n == "head"
						? (a = i.head)
						: n == "anchor"
							? (a = i.anchor)
							: n == "end" || n == "to" || n === !1
								? (a = i.to())
								: (a = i.from()),
					a
				);
			},
			listSelections() {
				return this.sel.ranges;
			},
			somethingSelected() {
				return this.sel.somethingSelected();
			},
			setCursor: Kt(function (n, i, a) {
				kg(
					this,
					Ge(this, typeof n === "number" ? ee(n, i || 0) : n),
					undefined,
					a,
				);
			}),
			setSelection: Kt(function (n, i, a) {
				kg(this, Ge(this, n), Ge(this, i || n), a);
			}),
			extendSelection: Kt(function (n, i, a) {
				Ga(this, Ge(this, n), i && Ge(this, i), a);
			}),
			extendSelections: Kt(function (n, i) {
				_g(this, pp(this, n), i);
			}),
			extendSelectionsBy: Kt(function (n, i) {
				const a = be(this.sel.ranges, n);
				_g(this, pp(this, a), i);
			}),
			setSelections: Kt(function (n, i, a) {
				if (n.length > 0) {
					for (var l = [], u = 0; u < n.length; u++) {
						l[u] = new dt(
							Ge(this, n[u].anchor),
							Ge(this, n[u].head || n[u].anchor),
						);
					}
					i == undefined && (i = Math.min(n.length - 1, this.sel.primIndex)),
						on(this, vr(this.cm, l, i), a);
				}
			}),
			addSelection: Kt(function (n, i, a) {
				const l = [...this.sel.ranges];
				l.push(new dt(Ge(this, n), Ge(this, i || n))),
					on(this, vr(this.cm, l, l.length - 1), a);
			}),
			getSelection(n) {
				for (var i = this.sel.ranges, a, l = 0; l < i.length; l++) {
					const u = Zr(this, i[l].from(), i[l].to());
					a = a ? a.concat(u) : u;
				}
				return n === !1 ? a : a.join(n || this.lineSeparator());
			},
			getSelections(n) {
				for (var i = [], a = this.sel.ranges, l = 0; l < a.length; l++) {
					let u = Zr(this, a[l].from(), a[l].to());
					n !== !1 && (u = u.join(n || this.lineSeparator())), (i[l] = u);
				}
				return i;
			},
			replaceSelection(n, i, a) {
				for (var l = [], u = 0; u < this.sel.ranges.length; u++) {
					l[u] = n;
				}
				this.replaceSelections(l, i, a || "+input");
			},
			replaceSelections: Kt(function (n, i, a) {
				for (var l = [], u = this.sel, g = 0; g < u.ranges.length; g++) {
					const y = u.ranges[g];
					l[g] = {
						from: y.from(),
						to: y.to(),
						text: this.splitLines(n[g]),
						origin: a,
					};
				}
				for (
					var x = i && i != "end" && Qx(this, l, i), S = l.length - 1;
					S >= 0;
					S--
				) {
					ns(this, l[S]);
				}
				x ? Tg(this, x) : this.cm && Jo(this.cm);
			}),
			undo: Kt(function () {
				Ya(this, "undo");
			}),
			redo: Kt(function () {
				Ya(this, "redo");
			}),
			undoSelection: Kt(function () {
				Ya(this, "undo", !0);
			}),
			redoSelection: Kt(function () {
				Ya(this, "redo", !0);
			}),
			setExtending(n) {
				this.extend = n;
			},
			getExtending() {
				return this.extend;
			},
			historySize() {
				for (
					var n = this.history, i = 0, a = 0, l = 0;
					l < n.done.length;
					l++
				) {
					n.done[l].ranges || ++i;
				}
				for (let u = 0; u < n.undone.length; u++) {
					n.undone[u].ranges || ++a;
				}
				return { undo: i, redo: a };
			},
			clearHistory() {
				(this.history = new Va(this.history)),
					Mi(this, (i) => (i.history = this.history), !0);
			},
			markClean() {
				this.cleanGeneration = this.changeGeneration(!0);
			},
			changeGeneration(n) {
				return (
					n &&
						(this.history.lastOp =
							this.history.lastSelOp =
							this.history.lastOrigin =
								undefined),
					this.history.generation
				);
			},
			isClean(n) {
				return this.history.generation == (n || this.cleanGeneration);
			},
			getHistory() {
				return { done: es(this.history.done), undone: es(this.history.undone) };
			},
			setHistory(n) {
				const i = (this.history = new Va(this.history));
				(i.done = es([...n.done], undefined, !0)),
					(i.undone = es([...n.undone], undefined, !0));
			},
			setGutterMarker: Kt(function (n, i, a) {
				return cl(this, n, "gutter", (l) => {
					const u = l.gutterMarkers || (l.gutterMarkers = {});
					return (u[i] = a), !a && gt(u) && (l.gutterMarkers = undefined), !0;
				});
			}),
			clearGutter: Kt(function (n) {
				this.iter((a) => {
					a.gutterMarkers &&
						a.gutterMarkers[n] &&
						cl(
							this,
							a,
							"gutter",
							() => (
								(a.gutterMarkers[n] = undefined),
								gt(a.gutterMarkers) && (a.gutterMarkers = undefined),
								!0
							),
						);
				});
			}),
			lineInfo(n) {
				let i;
				if (typeof n === "number") {
					if (!se(this, n) || ((i = n), (n = Oe(this, n)), !n)) {
						return ;
					}
				} else if (((i = T(n)), i == undefined)) {
					return ;
				}
				return {
					line: i,
					handle: n,
					text: n.text,
					gutterMarkers: n.gutterMarkers,
					textClass: n.textClass,
					bgClass: n.bgClass,
					wrapClass: n.wrapClass,
					widgets: n.widgets,
				};
			},
			addLineClass: Kt(function (n, i, a) {
				return cl(this, n, i == "gutter" ? "gutter" : "class", (l) => {
					const u =
						i == "text"
							? "textClass"
							: i == "background"
								? "bgClass"
								: i == "gutter"
									? "gutterClass"
									: "wrapClass";
					if (l[u]) {
						if (te(a).test(l[u])) {
							return !1;
						}
						l[u] += " " + a;
					} else {
						l[u] = a;
					}
					return !0;
				});
			}),
			removeLineClass: Kt(function (n, i, a) {
				return cl(this, n, i == "gutter" ? "gutter" : "class", (l) => {
					const u =
							i == "text"
								? "textClass"
								: i == "background"
									? "bgClass"
									: i == "gutter"
										? "gutterClass"
										: "wrapClass",
						g = l[u];
					if (g) {
						if (a == undefined) {
							l[u] = undefined;
						} else {
							const y = g.match(te(a));
							if (!y) {
								return !1;
							}
							const x = y.index + y[0].length;
							l[u] =
								g.slice(0, y.index) +
									(!y.index || x == g.length ? "" : " ") +
									g.slice(x) || undefined;
						}
					} else {
						return !1;
					}
					return !0;
				});
			}),
			addLineWidget: Kt(function (n, i, a) {
				return aS(this, n, i, a);
			}),
			removeLineWidget(n) {
				n.clear();
			},
			markText(n, i, a) {
				return is(this, Ge(this, n), Ge(this, i), a, (a && a.type) || "range");
			},
			setBookmark(n, i) {
				const a = {
					replacedWith: i && (i.nodeType == undefined ? i.widget : i),
					insertLeft: i && i.insertLeft,
					clearWhenEmpty: !1,
					shared: i && i.shared,
					handleMouseEvents: i && i.handleMouseEvents,
				};
				return (n = Ge(this, n)), is(this, n, n, a, "bookmark");
			},
			findMarksAt(n) {
				n = Ge(this, n);
				const i = [],
					a = Oe(this, n.line).markedSpans;
				if (a) {
					for (let l = 0; l < a.length; ++l) {
						const u = a[l];
						(u.from == undefined || u.from <= n.ch) &&
							(u.to == undefined || u.to >= n.ch) &&
							i.push(u.marker.parent || u.marker);
					}
				}
				return i;
			},
			findMarks(n, i, a) {
				(n = Ge(this, n)), (i = Ge(this, i));
				let l = [],
					u = n.line;
				return (
					this.iter(n.line, i.line + 1, (g) => {
						const y = g.markedSpans;
						if (y) {
							for (let x = 0; x < y.length; x++) {
								const S = y[x];
								!(
									(S.to != undefined && u == n.line && n.ch >= S.to) ||
									(S.from == undefined && u != n.line) ||
									(S.from != undefined && u == i.line && S.from >= i.ch)
								) &&
									(!a || a(S.marker)) &&
									l.push(S.marker.parent || S.marker);
							}
						}
						++u;
					}),
					l
				);
			},
			getAllMarks() {
				const n = [];
				return (
					this.iter((i) => {
						const a = i.markedSpans;
						if (a) {
							for (let l = 0; l < a.length; ++l) {
								a[l].from != undefined && n.push(a[l].marker);
							}
						}
					}),
					n
				);
			},
			posFromIndex(n) {
				let i,
					a = this.first,
					l = this.lineSeparator().length;
				return (
					this.iter((u) => {
						const g = u.text.length + l;
						if (g > n) {
							return (i = n), !0;
						}
						(n -= g), ++a;
					}),
					Ge(this, ee(a, i))
				);
			},
			indexFromPos(n) {
				n = Ge(this, n);
				let i = n.ch;
				if (n.line < this.first || n.ch < 0) {
					return 0;
				}
				const a = this.lineSeparator().length;
				return (
					this.iter(this.first, n.line, (l) => {
						i += l.text.length + a;
					}),
					i
				);
			},
			copy(n) {
				const i = new wn(
					Gs(this, this.first, this.first + this.size),
					this.modeOption,
					this.first,
					this.lineSep,
					this.direction,
				);
				return (
					(i.scrollTop = this.scrollTop),
					(i.scrollLeft = this.scrollLeft),
					(i.sel = this.sel),
					(i.extend = !1),
					n &&
						((i.history.undoDepth = this.history.undoDepth),
						i.setHistory(this.getHistory())),
					i
				);
			},
			linkedDoc(n) {
				n || (n = {});
				let i = this.first,
					a = this.first + this.size;
				n.from != undefined && n.from > i && (i = n.from),
					n.to != undefined && n.to < a && (a = n.to);
				const l = new wn(
					Gs(this, i, a),
					n.mode || this.modeOption,
					i,
					this.lineSep,
					this.direction,
				);
				return (
					n.sharedHist && (l.history = this.history),
					(this.linked || (this.linked = [])).push({
						doc: l,
						sharedHist: n.sharedHist,
					}),
					(l.linked = [{ doc: this, isParent: !0, sharedHist: n.sharedHist }]),
					uS(l, Fg(this)),
					l
				);
			},
			unlinkDoc(n) {
				if ((n instanceof Ct && (n = n.doc), this.linked)) {
					for (let i = 0; i < this.linked.length; ++i) {
						const a = this.linked[i];
						if (a.doc == n) {
							this.linked.splice(i, 1), n.unlinkDoc(this), fS(Fg(this));
							break;
						}
					}
				}
				if (n.history == this.history) {
					const l = [n.id];
					Mi(n, (u) => l.push(u.id), !0),
						(n.history = new Va(undefined)),
						(n.history.done = es(this.history.done, l)),
						(n.history.undone = es(this.history.undone, l));
				}
			},
			iterLinkedDocs(n) {
				Mi(this, n);
			},
			getMode() {
				return this.mode;
			},
			getEditor() {
				return this.cm;
			},
			splitLines(n) {
				return this.lineSep ? n.split(this.lineSep) : tr(n);
			},
			lineSeparator() {
				return (
					this.lineSep ||
					`
`
				);
			},
			setDirection: Kt(function (n) {
				n != "rtl" && (n = "ltr"),
					n != this.direction &&
						((this.direction = n),
						this.iter((i) => (i.order = undefined)),
						this.cm && eS(this.cm));
			}),
		})),
			(wn.prototype.eachLine = wn.prototype.iter);
		let Hg = 0;
		function hS(n) {
			if ((qg(this), !(Nt(this, n) || ei(this.display, n)))) {
				rn(n), h && (Hg = Date.now());
				let a = uo(this, n, !0),
					l = n.dataTransfer.files;
				if (!(!a || this.isReadOnly())) {
					if (l && l.length > 0 && window.FileReader && window.File) {
						for (
							let u = l.length,
								g = Array(u),
								y = 0,
								x = () => {
									++y == u &&
										Gt(this, () => {
											a = Ge(this.doc, a);
											const j = {
												from: a,
												to: a,
												text: this.doc.splitLines(
													g
														.filter((ne) => ne != undefined)
														.join(this.doc.lineSeparator()),
												),
												origin: "paste",
											};
											ns(this.doc, j),
												Tg(this.doc, Li(Ge(this.doc, a), Ge(this.doc, Ai(j))));
										})();
								},
								S = (j, ne) => {
									if (
										this.options.allowDropFileTypes &&
										Ee(this.options.allowDropFileTypes, j.type) == -1
									) {
										x();
										return;
									}
									const ce = new FileReader();
									(ce.onerror = () => x()),
										(ce.onload = () => {
											const ge = ce.result;
											if (/[\u0000-\u0008\u000E-\u001F]{2}/.test(ge)) {
												x();
												return;
											}
											(g[ne] = ge), x();
										}),
										ce.readAsText(j);
								},
								_ = 0;
							_ < l.length;
							_++
						) {
							S(l[_], _);
						}
					} else {
						if (this.state.draggingText && this.doc.sel.contains(a) > -1) {
							this.state.draggingText(n),
								setTimeout(() => this.display.input.focus(), 20);
							return;
						}
						try {
							const $ = n.dataTransfer.getData("Text");
							if ($) {
								let D;
								if (
									(this.state.draggingText &&
										!this.state.draggingText.copy &&
										(D = this.listSelections()),
									Ka(this.doc, Li(a, a)),
									D)
								) {
									for (let K = 0; K < D.length; ++K) {
										rs(this.doc, "", D[K].anchor, D[K].head, "drag");
									}
								}
								this.replaceSelection($, "around", "paste"),
									this.display.input.focus();
							}
						} catch {}
					}
				}
			}
		}
		function pS(n, i) {
			if (h && (!n.state.draggingText || Date.now() - Hg < 100)) {
				xi(i);
				return;
			}
			if (
				!(Nt(n, i) || ei(n.display, i)) &&
				(i.dataTransfer.setData("Text", n.getSelection()),
				(i.dataTransfer.effectAllowed = "copyMove"),
				i.dataTransfer.setDragImage && !C)
			) {
				const a = k(
					"img",
					undefined,
					undefined,
					"position: fixed; left: 0; top: 0;",
				);
				(a.src =
					"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="),
					M &&
						((a.width = a.height = 1),
						n.display.wrapper.append(a),
						(a._top = a.offsetTop)),
					i.dataTransfer.setDragImage(a, 0, 0),
					M && a.parentNode.removeChild(a);
			}
		}
		function gS(n, i) {
			const a = uo(n, i);
			if (a) {
				const l = document.createDocumentFragment();
				gf(n, a, l),
					n.display.dragCursor ||
						((n.display.dragCursor = k(
							"div",
							undefined,
							"CodeMirror-cursors CodeMirror-dragcursors",
						)),
						n.display.lineSpace.insertBefore(
							n.display.dragCursor,
							n.display.cursorDiv,
						)),
					F(n.display.dragCursor, l);
			}
		}
		function qg(n) {
			n.display.dragCursor &&
				(n.display.lineSpace.removeChild(n.display.dragCursor),
				(n.display.dragCursor = undefined));
		}
		function Bg(n) {
			if (document.getElementsByClassName) {
				for (
					var i = document.querySelectorAll(".CodeMirror"), a = [], l = 0;
					l < i.length;
					l++
				) {
					const u = i[l].CodeMirror;
					u && a.push(u);
				}
				a.length &&
					a[0].operation(() => {
						for (let g = 0; g < a.length; g++) {
							n(a[g]);
						}
					});
			}
		}
		let Wg = !1;
		function vS() {
			Wg || (mS(), (Wg = !0));
		}
		function mS() {
			let n;
			ze(window, "resize", () => {
				n == undefined &&
					(n = setTimeout(() => {
						(n = undefined), Bg(yS);
					}, 100));
			}),
				ze(window, "blur", () => Bg(Zo));
		}
		function yS(n) {
			const i = n.display;
			(i.cachedCharWidth = i.cachedTextHeight = i.cachedPaddingH = undefined),
				(i.scrollbarsClipped = !1),
				n.setSize();
		}
		for (
			var $i = {
					3: "Pause",
					8: "Backspace",
					9: "Tab",
					13: "Enter",
					16: "Shift",
					17: "Ctrl",
					18: "Alt",
					19: "Pause",
					20: "CapsLock",
					27: "Esc",
					32: "Space",
					33: "PageUp",
					34: "PageDown",
					35: "End",
					36: "Home",
					37: "Left",
					38: "Up",
					39: "Right",
					40: "Down",
					44: "PrintScrn",
					45: "Insert",
					46: "Delete",
					59: ";",
					61: "=",
					91: "Mod",
					92: "Mod",
					93: "Mod",
					106: "*",
					107: "=",
					109: "-",
					110: ".",
					111: "/",
					145: "ScrollLock",
					173: "-",
					186: ";",
					187: "=",
					188: ",",
					189: "-",
					190: ".",
					191: "/",
					192: "`",
					219: "[",
					220: "\\",
					221: "]",
					222: "'",
					224: "Mod",
					63_232: "Up",
					63_233: "Down",
					63_234: "Left",
					63_235: "Right",
					63_272: "Delete",
					63_273: "Home",
					63_275: "End",
					63_276: "PageUp",
					63_277: "PageDown",
					63_302: "Insert",
				},
				pl = 0;
			pl < 10;
			pl++
		) {
			$i[pl + 48] = $i[pl + 96] = String(pl);
		}
		for (let Za = 65; Za <= 90; Za++) {
			$i[Za] = String.fromCodePoint(Za);
		}
		for (let gl = 1; gl <= 12; gl++) {
			$i[gl + 111] = $i[gl + 63_235] = "F" + gl;
		}
		const ni = {};
		(ni.basic = {
			Left: "goCharLeft",
			Right: "goCharRight",
			Up: "goLineUp",
			Down: "goLineDown",
			End: "goLineEnd",
			Home: "goLineStartSmart",
			PageUp: "goPageUp",
			PageDown: "goPageDown",
			Delete: "delCharAfter",
			Backspace: "delCharBefore",
			"Shift-Backspace": "delCharBefore",
			Tab: "defaultTab",
			"Shift-Tab": "indentAuto",
			Enter: "newlineAndIndent",
			Insert: "toggleOverwrite",
			Esc: "singleSelection",
		}),
			(ni.pcDefault = {
				"Ctrl-A": "selectAll",
				"Ctrl-D": "deleteLine",
				"Ctrl-Z": "undo",
				"Shift-Ctrl-Z": "redo",
				"Ctrl-Y": "redo",
				"Ctrl-Home": "goDocStart",
				"Ctrl-End": "goDocEnd",
				"Ctrl-Up": "goLineUp",
				"Ctrl-Down": "goLineDown",
				"Ctrl-Left": "goGroupLeft",
				"Ctrl-Right": "goGroupRight",
				"Alt-Left": "goLineStart",
				"Alt-Right": "goLineEnd",
				"Ctrl-Backspace": "delGroupBefore",
				"Ctrl-Delete": "delGroupAfter",
				"Ctrl-S": "save",
				"Ctrl-F": "find",
				"Ctrl-G": "findNext",
				"Shift-Ctrl-G": "findPrev",
				"Shift-Ctrl-F": "replace",
				"Shift-Ctrl-R": "replaceAll",
				"Ctrl-[": "indentLess",
				"Ctrl-]": "indentMore",
				"Ctrl-U": "undoSelection",
				"Shift-Ctrl-U": "redoSelection",
				"Alt-U": "redoSelection",
				fallthrough: "basic",
			}),
			(ni.emacsy = {
				"Ctrl-F": "goCharRight",
				"Ctrl-B": "goCharLeft",
				"Ctrl-P": "goLineUp",
				"Ctrl-N": "goLineDown",
				"Ctrl-A": "goLineStart",
				"Ctrl-E": "goLineEnd",
				"Ctrl-V": "goPageDown",
				"Shift-Ctrl-V": "goPageUp",
				"Ctrl-D": "delCharAfter",
				"Ctrl-H": "delCharBefore",
				"Alt-Backspace": "delWordBefore",
				"Ctrl-K": "killLine",
				"Ctrl-T": "transposeChars",
				"Ctrl-O": "openLine",
			}),
			(ni.macDefault = {
				"Cmd-A": "selectAll",
				"Cmd-D": "deleteLine",
				"Cmd-Z": "undo",
				"Shift-Cmd-Z": "redo",
				"Cmd-Y": "redo",
				"Cmd-Home": "goDocStart",
				"Cmd-Up": "goDocStart",
				"Cmd-End": "goDocEnd",
				"Cmd-Down": "goDocEnd",
				"Alt-Left": "goGroupLeft",
				"Alt-Right": "goGroupRight",
				"Cmd-Left": "goLineLeft",
				"Cmd-Right": "goLineRight",
				"Alt-Backspace": "delGroupBefore",
				"Ctrl-Alt-Backspace": "delGroupAfter",
				"Alt-Delete": "delGroupAfter",
				"Cmd-S": "save",
				"Cmd-F": "find",
				"Cmd-G": "findNext",
				"Shift-Cmd-G": "findPrev",
				"Cmd-Alt-F": "replace",
				"Shift-Cmd-Alt-F": "replaceAll",
				"Cmd-[": "indentLess",
				"Cmd-]": "indentMore",
				"Cmd-Backspace": "delWrappedLineLeft",
				"Cmd-Delete": "delWrappedLineRight",
				"Cmd-U": "undoSelection",
				"Shift-Cmd-U": "redoSelection",
				"Ctrl-Up": "goDocStart",
				"Ctrl-Down": "goDocEnd",
				fallthrough: ["basic", "emacsy"],
			}),
			(ni.default = z ? ni.macDefault : ni.pcDefault);
		function bS(n) {
			const i = n.split(/-(?!$)/);
			n = i[i.length - 1];
			for (var a, l, u, g, y = 0; y < i.length - 1; y++) {
				const x = i[y];
				if (/^(cmd|meta|m)$/i.test(x)) {
					g = !0;
				} else if (/^a(lt)?$/i.test(x)) {
					a = !0;
				} else if (/^(c|ctrl|control)$/i.test(x)) {
					l = !0;
				} else if (/^s(hift)?$/i.test(x)) {
					u = !0;
				} else {
					throw new Error("Unrecognized modifier name: " + x);
				}
			}
			return (
				a && (n = "Alt-" + n),
				l && (n = "Ctrl-" + n),
				g && (n = "Cmd-" + n),
				u && (n = "Shift-" + n),
				n
			);
		}
		function wS(n) {
			const i = {};
			for (const a in n) {
				if (Object.hasOwn(n, a)) {
					const l = n[a];
					if (/^(name|fallthrough|(de|at)tach)$/.test(a)) {
						continue;
					}
					if (l == "...") {
						delete n[a];
						continue;
					}
					for (let u = be(a.split(" "), bS), g = 0; g < u.length; g++) {
						let y = void 0,
							x = void 0;
						g == u.length - 1
							? ((x = u.join(" ")), (y = l))
							: ((x = u.slice(0, g + 1).join(" ")), (y = "..."));
						const S = i[x];
						if (!S) {
							i[x] = y;
						} else if (S != y) {
							throw new Error("Inconsistent bindings for " + x);
						}
					}
					delete n[a];
				}
			}
			for (const _ in i) {
				n[_] = i[_];
			}
			return n;
		}
		function os(n, i, a, l) {
			i = Ja(i);
			const u = i.call ? i.call(n, l) : i[n];
			if (u === !1) {
				return "nothing";
			}
			if (u === "...") {
				return "multi";
			}
			if (u != undefined && a(u)) {
				return "handled";
			}
			if (i.fallthrough) {
				if (Object.prototype.toString.call(i.fallthrough) != "[object Array]") {
					return os(n, i.fallthrough, a, l);
				}
				for (let g = 0; g < i.fallthrough.length; g++) {
					const y = os(n, i.fallthrough[g], a, l);
					if (y) {
						return y;
					}
				}
			}
		}
		function Ug(n) {
			const i = typeof n === "string" ? n : $i[n.keyCode];
			return i == "Ctrl" || i == "Alt" || i == "Shift" || i == "Mod";
		}
		function Vg(n, i, a) {
			const l = n;
			return (
				i.altKey && l != "Alt" && (n = "Alt-" + n),
				(Q ? i.metaKey : i.ctrlKey) && l != "Ctrl" && (n = "Ctrl-" + n),
				(Q ? i.ctrlKey : i.metaKey) && l != "Mod" && (n = "Cmd-" + n),
				!a && i.shiftKey && l != "Shift" && (n = "Shift-" + n),
				n
			);
		}
		function jg(n, i) {
			if (M && n.keyCode == 34 && n.char) {
				return !1;
			}
			let a = $i[n.keyCode];
			return a == undefined || n.altGraphKey
				? !1
				: (n.keyCode == 3 && n.code && (a = n.code), Vg(a, n, i));
		}
		function Ja(n) {
			return typeof n === "string" ? ni[n] : n;
		}
		function ss(n, i) {
			for (var a = n.doc.sel.ranges, l = [], u = 0; u < a.length; u++) {
				for (var g = i(a[u]); l.length > 0 && Se(g.from, ue(l).to) <= 0; ) {
					const y = l.pop();
					if (Se(y.from, g.from) < 0) {
						g.from = y.from;
						break;
					}
				}
				l.push(g);
			}
			On(n, () => {
				for (let x = l.length - 1; x >= 0; x--) {
					rs(n.doc, "", l[x].from, l[x].to, "+delete");
				}
				Jo(n);
			});
		}
		function $f(n, i, a) {
			const l = Tt(n.text, i + a, a);
			return l < 0 || l > n.text.length ? undefined : l;
		}
		function Pf(n, i, a) {
			const l = $f(n, i.ch, a);
			return l == undefined
				? undefined
				: new ee(i.line, l, a < 0 ? "after" : "before");
		}
		function Of(n, i, a, l, u) {
			if (n) {
				i.doc.direction == "rtl" && (u = -u);
				const g = Ve(a, i.doc.direction);
				if (g) {
					let y = u < 0 ? ue(g) : g[0],
						x = u < 0 == (y.level == 1),
						S = x ? "after" : "before",
						_;
					if (y.level > 0 || i.doc.direction == "rtl") {
						const $ = Ko(i, a);
						_ = u < 0 ? a.text.length - 1 : 0;
						const D = Pr(i, $, _).top;
						(_ = Rt(
							(K) => Pr(i, $, K).top == D,
							u < 0 == (y.level == 1) ? y.from : y.to - 1,
							_,
						)),
							S == "before" && (_ = $f(a, _, 1));
					} else {
						_ = u < 0 ? y.to : y.from;
					}
					return new ee(l, _, S);
				}
			}
			return new ee(l, u < 0 ? a.text.length : 0, u < 0 ? "before" : "after");
		}
		function xS(n, i, a, l) {
			const u = Ve(i, n.doc.direction);
			if (!u) {
				return Pf(i, a, l);
			}
			a.ch >= i.text.length
				? ((a.ch = i.text.length), (a.sticky = "before"))
				: a.ch <= 0 && ((a.ch = 0), (a.sticky = "after"));
			const g = ar(u, a.ch, a.sticky),
				y = u[g];
			if (
				n.doc.direction == "ltr" &&
				y.level % 2 == 0 &&
				(l > 0 ? y.to > a.ch : y.from < a.ch)
			) {
				return Pf(i, a, l);
			}
			let x = (we, ke) => $f(i, we instanceof ee ? we.ch : we, ke),
				S,
				_ = (we) =>
					n.options.lineWrapping
						? ((S = S || Ko(n, i)), Zp(n, i, S, we))
						: { begin: 0, end: i.text.length },
				$ = _(a.sticky == "before" ? x(a, -1) : a.ch);
			if (n.doc.direction == "rtl" || y.level == 1) {
				const D = (y.level == 1) == l < 0,
					K = x(a, D ? 1 : -1);
				if (
					K != undefined &&
					(D ? K <= y.to && K <= $.end : K >= y.from && K >= $.begin)
				) {
					const j = D ? "before" : "after";
					return new ee(a.line, K, j);
				}
			}
			let ne = (we, ke, xe) => {
					for (
						const Me = (St, Xt) =>
							Xt
								? new ee(a.line, x(St, 1), "before")
								: new ee(a.line, St, "after");
						we >= 0 && we < u.length;
						we += ke
					) {
						let Ie = u[we],
							Re = ke > 0 == (Ie.level != 1),
							Qe = Re ? xe.begin : x(xe.end, -1);
						if (
							(Ie.from <= Qe && Qe < Ie.to) ||
							((Qe = Re ? Ie.from : x(Ie.to, -1)),
							xe.begin <= Qe && Qe < xe.end)
						) {
							return Me(Qe, Re);
						}
					}
				},
				ce = ne(g + l, l, $);
			if (ce) {
				return ce;
			}
			const ge = l > 0 ? $.end : x($.begin, -1);
			return ge != undefined &&
				!(l > 0 && ge == i.text.length) &&
				((ce = ne(l > 0 ? 0 : u.length - 1, l, _(ge))), ce)
				? ce
				: undefined;
		}
		const vl = {
			selectAll: Mg,
			singleSelection(n) {
				return n.setSelection(n.getCursor("anchor"), n.getCursor("head"), H);
			},
			killLine(n) {
				return ss(n, (i) => {
					if (i.empty()) {
						const a = Oe(n.doc, i.head.line).text.length;
						return i.head.ch == a && i.head.line < n.lastLine()
							? { from: i.head, to: ee(i.head.line + 1, 0) }
							: { from: i.head, to: ee(i.head.line, a) };
					}
					return { from: i.from(), to: i.to() };
				});
			},
			deleteLine(n) {
				return ss(n, (i) => ({
					from: ee(i.from().line, 0),
					to: Ge(n.doc, ee(i.to().line + 1, 0)),
				}));
			},
			delLineLeft(n) {
				return ss(n, (i) => ({ from: ee(i.from().line, 0), to: i.from() }));
			},
			delWrappedLineLeft(n) {
				return ss(n, (i) => {
					const a = n.charCoords(i.head, "div").top + 5,
						l = n.coordsChar({ left: 0, top: a }, "div");
					return { from: l, to: i.from() };
				});
			},
			delWrappedLineRight(n) {
				return ss(n, (i) => {
					const a = n.charCoords(i.head, "div").top + 5,
						l = n.coordsChar(
							{ left: n.display.lineDiv.offsetWidth + 100, top: a },
							"div",
						);
					return { from: i.from(), to: l };
				});
			},
			undo(n) {
				return n.undo();
			},
			redo(n) {
				return n.redo();
			},
			undoSelection(n) {
				return n.undoSelection();
			},
			redoSelection(n) {
				return n.redoSelection();
			},
			goDocStart(n) {
				return n.extendSelection(ee(n.firstLine(), 0));
			},
			goDocEnd(n) {
				return n.extendSelection(ee(n.lastLine()));
			},
			goLineStart(n) {
				return n.extendSelectionsBy((i) => Gg(n, i.head.line), {
					origin: "+move",
					bias: 1,
				});
			},
			goLineStartSmart(n) {
				return n.extendSelectionsBy((i) => Kg(n, i.head), {
					origin: "+move",
					bias: 1,
				});
			},
			goLineEnd(n) {
				return n.extendSelectionsBy((i) => SS(n, i.head.line), {
					origin: "+move",
					bias: -1,
				});
			},
			goLineRight(n) {
				return n.extendSelectionsBy((i) => {
					const a = n.cursorCoords(i.head, "div").top + 5;
					return n.coordsChar(
						{ left: n.display.lineDiv.offsetWidth + 100, top: a },
						"div",
					);
				}, fe);
			},
			goLineLeft(n) {
				return n.extendSelectionsBy((i) => {
					const a = n.cursorCoords(i.head, "div").top + 5;
					return n.coordsChar({ left: 0, top: a }, "div");
				}, fe);
			},
			goLineLeftSmart(n) {
				return n.extendSelectionsBy((i) => {
					const a = n.cursorCoords(i.head, "div").top + 5,
						l = n.coordsChar({ left: 0, top: a }, "div");
					return l.ch < n.getLine(l.line).search(/\S/) ? Kg(n, i.head) : l;
				}, fe);
			},
			goLineUp(n) {
				return n.moveV(-1, "line");
			},
			goLineDown(n) {
				return n.moveV(1, "line");
			},
			goPageUp(n) {
				return n.moveV(-1, "page");
			},
			goPageDown(n) {
				return n.moveV(1, "page");
			},
			goCharLeft(n) {
				return n.moveH(-1, "char");
			},
			goCharRight(n) {
				return n.moveH(1, "char");
			},
			goColumnLeft(n) {
				return n.moveH(-1, "column");
			},
			goColumnRight(n) {
				return n.moveH(1, "column");
			},
			goWordLeft(n) {
				return n.moveH(-1, "word");
			},
			goGroupRight(n) {
				return n.moveH(1, "group");
			},
			goGroupLeft(n) {
				return n.moveH(-1, "group");
			},
			goWordRight(n) {
				return n.moveH(1, "word");
			},
			delCharBefore(n) {
				return n.deleteH(-1, "codepoint");
			},
			delCharAfter(n) {
				return n.deleteH(1, "char");
			},
			delWordBefore(n) {
				return n.deleteH(-1, "word");
			},
			delWordAfter(n) {
				return n.deleteH(1, "word");
			},
			delGroupBefore(n) {
				return n.deleteH(-1, "group");
			},
			delGroupAfter(n) {
				return n.deleteH(1, "group");
			},
			indentAuto(n) {
				return n.indentSelection("smart");
			},
			indentMore(n) {
				return n.indentSelection("add");
			},
			indentLess(n) {
				return n.indentSelection("subtract");
			},
			insertTab(n) {
				return n.replaceSelection("	");
			},
			insertSoftTab(n) {
				for (
					var i = [], a = n.listSelections(), l = n.options.tabSize, u = 0;
					u < a.length;
					u++
				) {
					const g = a[u].from(),
						y = de(n.getLine(g.line), g.ch, l);
					i.push(_e(l - (y % l)));
				}
				n.replaceSelections(i);
			},
			defaultTab(n) {
				n.somethingSelected()
					? n.indentSelection("add")
					: n.execCommand("insertTab");
			},
			transposeChars(n) {
				return On(n, () => {
					for (var i = n.listSelections(), a = [], l = 0; l < i.length; l++) {
						if (i[l].empty()) {
							let u = i[l].head,
								g = Oe(n.doc, u.line).text;
							if (g) {
								if (
									(u.ch == g.length && (u = new ee(u.line, u.ch - 1)), u.ch > 0)
								) {
									(u = new ee(u.line, u.ch + 1)),
										n.replaceRange(
											g.charAt(u.ch - 1) + g.charAt(u.ch - 2),
											ee(u.line, u.ch - 2),
											u,
											"+transpose",
										);
								} else if (u.line > n.doc.first) {
									const y = Oe(n.doc, u.line - 1).text;
									y &&
										((u = new ee(u.line, 1)),
										n.replaceRange(
											g.charAt(0) +
												n.doc.lineSeparator() +
												y.charAt(y.length - 1),
											ee(u.line - 1, y.length - 1),
											u,
											"+transpose",
										));
								}
							}
							a.push(new dt(u, u));
						}
					}
					n.setSelections(a);
				});
			},
			newlineAndIndent(n) {
				return On(n, () => {
					for (var i = n.listSelections(), a = i.length - 1; a >= 0; a--) {
						n.replaceRange(
							n.doc.lineSeparator(),
							i[a].anchor,
							i[a].head,
							"+input",
						);
					}
					i = n.listSelections();
					for (let l = 0; l < i.length; l++) {
						n.indentLine(i[l].from().line, undefined, !0);
					}
					Jo(n);
				});
			},
			openLine(n) {
				return n.replaceSelection(
					`
`,
					"start",
				);
			},
			toggleOverwrite(n) {
				return n.toggleOverwrite();
			},
		};
		function Gg(n, i) {
			const a = Oe(n.doc, i),
				l = pr(a);
			return l != a && (i = T(l)), Of(!0, n, l, i, 1);
		}
		function SS(n, i) {
			const a = Oe(n.doc, i),
				l = ox(a);
			return l != a && (i = T(l)), Of(!0, n, a, i, -1);
		}
		function Kg(n, i) {
			const a = Gg(n, i.line),
				l = Oe(n.doc, a.line),
				u = Ve(l, n.doc.direction);
			if (!u || u[0].level == 0) {
				const g = Math.max(a.ch, l.text.search(/\S/)),
					y = i.line == a.line && i.ch <= g && i.ch;
				return ee(a.line, y ? 0 : g, a.sticky);
			}
			return a;
		}
		function Qa(n, i, a) {
			if (typeof i === "string" && ((i = vl[i]), !i)) {
				return !1;
			}
			n.display.input.ensurePolled();
			let l = n.display.shift,
				u = !1;
			try {
				n.isReadOnly() && (n.state.suppressEdits = !0),
					a && (n.display.shift = !1),
					(u = i(n) != O);
			} finally {
				(n.display.shift = l), (n.state.suppressEdits = !1);
			}
			return u;
		}
		function _S(n, i, a) {
			for (let l = 0; l < n.state.keyMaps.length; l++) {
				const u = os(i, n.state.keyMaps[l], a, n);
				if (u) {
					return u;
				}
			}
			return (
				(n.options.extraKeys && os(i, n.options.extraKeys, a, n)) ||
				os(i, n.options.keyMap, a, n)
			);
		}
		const kS = new $e();
		function ml(n, i, a, l) {
			const u = n.state.keySeq;
			if (u) {
				if (Ug(i)) {
					return "handled";
				}
				if (
					(i.endsWith("'")
						? (n.state.keySeq = undefined)
						: kS.set(50, () => {
								n.state.keySeq == u &&
									((n.state.keySeq = undefined), n.display.input.reset());
							}),
					Xg(n, u + " " + i, a, l))
				) {
					return !0;
				}
			}
			return Xg(n, i, a, l);
		}
		function Xg(n, i, a, l) {
			const u = _S(n, i, l);
			return (
				u == "multi" && (n.state.keySeq = i),
				u == "handled" && jt(n, "keyHandled", n, i, a),
				(u == "handled" || u == "multi") && (rn(a), vf(n)),
				!!u
			);
		}
		function Yg(n, i) {
			const a = jg(i, !0);
			return a
				? (i.shiftKey && !n.state.keySeq
					? ml(n, "Shift-" + a, i, (l) => Qa(n, l, !0)) ||
						ml(n, a, i, (l) => {
							if (typeof l == "string" ? /^go[A-Z]/.test(l) : l.motion)
								return Qa(n, l);
						})
					: ml(n, a, i, (l) => Qa(n, l)))
				: !1;
		}
		function TS(n, i, a) {
			return ml(n, "'" + a + "'", i, (l) => Qa(n, l, !0));
		}
		let Rf;
		function Zg(n) {
			if (
				!(n.target && n.target != this.display.input.getField()) &&
				((this.curOp.focus = ye(tt(this))), !Nt(this, n))
			) {
				h && p < 11 && n.keyCode == 27 && (n.returnValue = !1);
				const a = n.keyCode;
				this.display.shift = a == 16 || n.shiftKey;
				const l = Yg(this, n);
				M &&
					((Rf = l ? a : undefined),
					!l &&
						a == 88 &&
						!Ea &&
						(z ? n.metaKey : n.ctrlKey) &&
						this.replaceSelection("", undefined, "cut")),
					s &&
						!z &&
						!l &&
						a == 46 &&
						n.shiftKey &&
						!n.ctrlKey &&
						document.execCommand &&
						document.execCommand("cut"),
					a == 18 &&
						!/\bCodeMirror-crosshair\b/.test(this.display.lineDiv.className) &&
						CS(this);
			}
		}
		function CS(n) {
			const i = n.display.lineDiv;
			Ne(i, "CodeMirror-crosshair");
			function a(l) {
				(l.keyCode == 18 || !l.altKey) &&
					(Z(i, "CodeMirror-crosshair"),
					nn(document, "keyup", a),
					nn(document, "mouseover", a));
			}
			ze(document, "keyup", a), ze(document, "mouseover", a);
		}
		function Jg(n) {
			n.keyCode == 16 && (this.doc.sel.shift = !1), Nt(this, n);
		}
		function Qg(n) {
			if (
				!(
					(n.target && n.target != this.display.input.getField()) ||
					ei(this.display, n) ||
					Nt(this, n) ||
					(n.ctrlKey && !n.altKey) ||
					(z && n.metaKey)
				)
			) {
				const a = n.keyCode,
					l = n.charCode;
				if (M && a == Rf) {
					(Rf = undefined), rn(n);
					return;
				}
				if (!(M && (!n.which || n.which < 10) && Yg(this, n))) {
					const u = String.fromCodePoint(l ?? a);
					u != "\b" && (TS(this, n, u) || this.display.input.onKeyPress(n));
				}
			}
		}
		const ES = 400,
			Df = function Df(n, i, a) {
				(this.time = n), (this.pos = i), (this.button = a);
			};
		Df.prototype.compare = function compare(n, i, a) {
			return this.time + ES > n && Se(i, this.pos) == 0 && a == this.button;
		};
		let yl, bl;
		function LS(n, i) {
			const a = Date.now();
			return bl && bl.compare(a, n, i)
				? ((yl = bl = undefined), "triple")
				: (yl && yl.compare(a, n, i)
					? ((bl = new Df(a, n, i)), (yl = null), "double")
					: ((yl = new Df(a, n, i)), (bl = null), "single"));
		}
		function ev(n) {
			const a = this.display;
			if (!(Nt(this, n) || (a.activeTouch && a.input.supportsTouch()))) {
				if ((a.input.ensurePolled(), (a.shift = n.shiftKey), ei(a, n))) {
					v ||
						((a.scroller.draggable = !1),
						setTimeout(() => (a.scroller.draggable = !0), 100));
					return;
				}
				if (!zf(this, n)) {
					const l = uo(this, n),
						u = ur(n),
						g = l ? LS(l, u) : "single";
					Ae(this).focus(),
						u == 1 && this.state.selectingText && this.state.selectingText(n),
						!(l && AS(this, u, l, g, n)) &&
							(u == 1
								? (l
									? NS(this, l, g, n)
									: Us(n) == a.scroller && rn(n))
								: (u == 2
									? (l && Ga(this.doc, l),
										setTimeout(() => a.input.focus(), 20))
									: u == 3 &&
										(G ? this.display.input.onContextMenu(n) : mf(this))));
				}
			}
		}
		function AS(n, i, a, l, u) {
			let g = "Click";
			return (
				l == "double"
					? (g = "Double" + g)
					: l == "triple" && (g = "Triple" + g),
				(g = (i == 1 ? "Left" : (i == 2 ? "Middle" : "Right")) + g),
				ml(n, Vg(g, u), u, (y) => {
					if ((typeof y === "string" && (y = vl[y]), !y)) {
						return !1;
					}
					let x = !1;
					try {
						n.isReadOnly() && (n.state.suppressEdits = !0), (x = y(n, a) != O);
					} finally {
						n.state.suppressEdits = !1;
					}
					return x;
				})
			);
		}
		function MS(n, i, a) {
			const l = n.getOption("configureMouse"),
				u = l ? l(n, i, a) : {};
			if (u.unit == undefined) {
				const g = W ? a.shiftKey && a.metaKey : a.altKey;
				u.unit = g
					? "rectangle"
					: i == "single"
						? "char"
						: i == "double"
							? "word"
							: "line";
			}
			return (
				(u.extend == undefined || n.doc.extend) &&
					(u.extend = n.doc.extend || a.shiftKey),
				u.addNew == undefined && (u.addNew = z ? a.metaKey : a.ctrlKey),
				u.moveOnDrag == undefined &&
					(u.moveOnDrag = !(z ? a.altKey : a.ctrlKey)),
				u
			);
		}
		function NS(n, i, a, l) {
			h ? setTimeout(X(tg, n), 0) : (n.curOp.focus = ye(tt(n)));
			let u = MS(n, a, l),
				g = n.doc.sel,
				y;
			n.options.dragDrop &&
			Ku &&
			!n.isReadOnly() &&
			a == "single" &&
			(y = g.contains(i)) > -1 &&
			(Se((y = g.ranges[y]).from(), i) < 0 || i.xRel > 0) &&
			(Se(y.to(), i) > 0 || i.xRel < 0)
				? $S(n, l, i, u)
				: PS(n, l, i, u);
		}
		function $S(n, i, a, l) {
			let u = n.display,
				g = !1,
				y = Gt(n, (_) => {
					v && (u.scroller.draggable = !1),
						(n.state.draggingText = !1),
						n.state.delayingBlurEvent &&
							(n.hasFocus() ? (n.state.delayingBlurEvent = !1) : mf(n)),
						nn(u.wrapper.ownerDocument, "mouseup", y),
						nn(u.wrapper.ownerDocument, "mousemove", x),
						nn(u.scroller, "dragstart", S),
						nn(u.scroller, "drop", y),
						g ||
							(rn(_),
							l.addNew || Ga(n.doc, a, undefined, undefined, l.extend),
							(v && !C) || (h && p == 9)
								? setTimeout(() => {
										u.wrapper.ownerDocument.body.focus({ preventScroll: !0 }),
											u.input.focus();
									}, 20)
								: u.input.focus());
				}),
				x = (_) => {
					g =
						g ||
						Math.abs(i.clientX - _.clientX) + Math.abs(i.clientY - _.clientY) >=
							10;
				},
				S = () => (g = !0);
			v && (u.scroller.draggable = !0),
				(n.state.draggingText = y),
				(y.copy = !l.moveOnDrag),
				ze(u.wrapper.ownerDocument, "mouseup", y),
				ze(u.wrapper.ownerDocument, "mousemove", x),
				ze(u.scroller, "dragstart", S),
				ze(u.scroller, "drop", y),
				(n.state.delayingBlurEvent = !0),
				setTimeout(() => u.input.focus(), 20),
				u.scroller.dragDrop && u.scroller.dragDrop();
		}
		function tv(n, i, a) {
			if (a == "char") {
				return new dt(i, i);
			}
			if (a == "word") {
				return n.findWordAt(i);
			}
			if (a == "line") {
				return new dt(ee(i.line, 0), Ge(n.doc, ee(i.line + 1, 0)));
			}
			const l = a(n, i);
			return new dt(l.from, l.to);
		}
		function PS(n, i, a, l) {
			h && mf(n);
			const u = n.display,
				g = n.doc;
			rn(i);
			let y,
				x,
				S = g.sel,
				_ = S.ranges;
			if (
				(l.addNew && !l.extend
					? ((x = g.sel.contains(a)), x > -1 ? (y = _[x]) : (y = new dt(a, a)))
					: ((y = g.sel.primary()), (x = g.sel.primIndex)),
				l.unit == "rectangle")
			) {
				l.addNew || (y = new dt(a, a)), (a = uo(n, i, !0, !0)), (x = -1);
			} else {
				const $ = tv(n, a, l.unit);
				l.extend ? (y = Mf(y, $.anchor, $.head, l.extend)) : (y = $);
			}
			l.addNew
				? x == -1
					? ((x = _.length),
						on(g, vr(n, _.concat([y]), x), { scroll: !1, origin: "*mouse" }))
					: _.length > 1 && _[x].empty() && l.unit == "char" && !l.extend
						? (on(g, vr(n, _.slice(0, x).concat(_.slice(x + 1)), 0), {
								scroll: !1,
								origin: "*mouse",
							}),
							(S = g.sel))
						: Nf(g, x, y, J)
				: ((x = 0), on(g, new Vn([y], 0), J), (S = g.sel));
			let D = a;
			function K(xe) {
				if (Se(D, xe) != 0) {
					if (((D = xe), l.unit == "rectangle")) {
						for (
							var Me = [],
								Ie = n.options.tabSize,
								Re = de(Oe(g, a.line).text, a.ch, Ie),
								Qe = de(Oe(g, xe.line).text, xe.ch, Ie),
								St = Math.min(Re, Qe),
								Xt = Math.max(Re, Qe),
								Lt = Math.min(a.line, xe.line),
								Rn = Math.min(n.lastLine(), Math.max(a.line, xe.line));
							Lt <= Rn;
							Lt++
						) {
							const xn = Oe(g, Lt).text,
								It = le(xn, St, Ie);
							St == Xt
								? Me.push(new dt(ee(Lt, It), ee(Lt, It)))
								: xn.length > It &&
									Me.push(new dt(ee(Lt, It), ee(Lt, le(xn, Xt, Ie))));
						}
						Me.length || Me.push(new dt(a, a)),
							on(g, vr(n, S.ranges.slice(0, x).concat(Me), x), {
								origin: "*mouse",
								scroll: !1,
							}),
							n.scrollIntoView(xe);
					} else {
						let Sn = y,
							Qt = tv(n, xe, l.unit),
							Ut = Sn.anchor,
							Ft;
						Se(Qt.anchor, Ut) > 0
							? ((Ft = Qt.head), (Ut = Vo(Sn.from(), Qt.anchor)))
							: ((Ft = Qt.anchor), (Ut = yn(Sn.to(), Qt.head)));
						const Pt = [...S.ranges];
						(Pt[x] = OS(n, new dt(Ge(g, Ut), Ft))), on(g, vr(n, Pt, x), J);
					}
				}
			}
			let j = u.wrapper.getBoundingClientRect(),
				ne = 0;
			function ce(xe) {
				const Me = ++ne,
					Ie = uo(n, xe, !0, l.unit == "rectangle");
				if (Ie) {
					if (Se(Ie, D) != 0) {
						(n.curOp.focus = ye(tt(n))), K(Ie);
						const Re = qa(u, g);
						(Ie.line >= Re.to || Ie.line < Re.from) &&
							setTimeout(
								Gt(n, () => {
									ne == Me && ce(xe);
								}),
								150,
							);
					} else {
						const Qe = xe.clientY < j.top ? -20 : (xe.clientY > j.bottom ? 20 : 0);
						Qe &&
							setTimeout(
								Gt(n, () => {
									ne == Me && ((u.scroller.scrollTop += Qe), ce(xe));
								}),
								50,
							);
					}
				}
			}
			function ge(xe) {
				(n.state.selectingText = !1),
					(ne = 1 / 0),
					xe && (rn(xe), u.input.focus()),
					nn(u.wrapper.ownerDocument, "mousemove", we),
					nn(u.wrapper.ownerDocument, "mouseup", ke),
					(g.history.lastSelOrigin = undefined);
			}
			const we = Gt(n, (xe) => {
					xe.buttons === 0 || !ur(xe) ? ge(xe) : ce(xe);
				}),
				ke = Gt(n, ge);
			(n.state.selectingText = ke),
				ze(u.wrapper.ownerDocument, "mousemove", we),
				ze(u.wrapper.ownerDocument, "mouseup", ke);
		}
		function OS(n, i) {
			const a = i.anchor,
				l = i.head,
				u = Oe(n.doc, a.line);
			if (Se(a, l) == 0 && a.sticky == l.sticky) {
				return i;
			}
			const g = Ve(u);
			if (!g) {
				return i;
			}
			const y = ar(g, a.ch, a.sticky),
				x = g[y];
			if (x.from != a.ch && x.to != a.ch) {
				return i;
			}
			const S = y + ((x.from == a.ch) == (x.level != 1) ? 0 : 1);
			if (S == 0 || S == g.length) {
				return i;
			}
			let _;
			if (l.line != a.line) {
				_ = (l.line - a.line) * (n.doc.direction == "ltr" ? 1 : -1) > 0;
			} else {
				const $ = ar(g, l.ch, l.sticky),
					D = $ - y || (l.ch - a.ch) * (x.level == 1 ? -1 : 1);
				$ == S - 1 || $ == S ? (_ = D < 0) : (_ = D > 0);
			}
			const K = g[S + (_ ? -1 : 0)],
				j = _ == (K.level == 1),
				ne = j ? K.from : K.to,
				ce = j ? "after" : "before";
			return a.ch == ne && a.sticky == ce
				? i
				: new dt(new ee(a.line, ne, ce), l);
		}
		function nv(n, i, a, l) {
			let u, g;
			if (i.touches) {
				(u = i.touches[0].clientX), (g = i.touches[0].clientY);
			} else {
				try {
					(u = i.clientX), (g = i.clientY);
				} catch {
					return !1;
				}
			}
			if (u >= Math.floor(n.display.gutters.getBoundingClientRect().right)) {
				return !1;
			}
			l && rn(i);
			const y = n.display,
				x = y.lineDiv.getBoundingClientRect();
			if (g > x.bottom || !Pn(n, a)) {
				return mn(i);
			}
			g -= x.top - y.viewOffset;
			for (let S = 0; S < n.display.gutterSpecs.length; ++S) {
				const _ = y.gutters.childNodes[S];
				if (_ && _.getBoundingClientRect().right >= u) {
					const $ = R(n.doc, g),
						D = n.display.gutterSpecs[S];
					return Mt(n, a, n, $, D.className, i), mn(i);
				}
			}
		}
		function zf(n, i) {
			return nv(n, i, "gutterClick", !0);
		}
		function rv(n, i) {
			ei(n.display, i) ||
				RS(n, i) ||
				Nt(n, i, "contextmenu") ||
				G ||
				n.display.input.onContextMenu(i);
		}
		function RS(n, i) {
			return Pn(n, "gutterContextMenu")
				? nv(n, i, "gutterContextMenu", !1)
				: !1;
		}
		function iv(n) {
			(n.display.wrapper.className =
				n.display.wrapper.className.replaceAll(/\s*cm-s-\S+/g, "") +
				n.options.theme.replaceAll(/(^|\s)\s*/g, " cm-s-")),
				Qs(n);
		}
		const ls = {
				toString() {
					return "CodeMirror.Init";
				},
			},
			ov = {},
			ec = {};
		function DS(n) {
			const i = n.optionHandlers;
			function a(l, u, g, y) {
				(n.defaults[l] = u),
					g &&
						(i[l] = y
							? (x, S, _) => {
									_ != ls && g(x, S, _);
								}
							: g);
			}
			(n.defineOption = a),
				(n.Init = ls),
				a("value", "", (l, u) => l.setValue(u), !0),
				a(
					"mode",
					undefined,
					(l, u) => {
						(l.doc.modeOption = u), Ef(l);
					},
					!0,
				),
				a("indentUnit", 2, Ef, !0),
				a("indentWithTabs", !1),
				a("smartIndent", !0),
				a(
					"tabSize",
					4,
					(l) => {
						ll(l), Qs(l), bn(l);
					},
					!0,
				),
				a("lineSeparator", undefined, (l, u) => {
					if (((l.doc.lineSep = u), !!u)) {
						let g = [],
							y = l.doc.first;
						l.doc.iter((S) => {
							for (let _ = 0; ; ) {
								const $ = S.text.indexOf(u, _);
								if ($ == -1) {
									break;
								}
								(_ = $ + u.length), g.push(ee(y, $));
							}
							y++;
						});
						for (let x = g.length - 1; x >= 0; x--) {
							rs(l.doc, u, g[x], ee(g[x].line, g[x].ch + u.length));
						}
					}
				}),
				a(
					"specialChars",
					/[\u0000-\u001F\u007F-\u009F\u00AD\u061C\u200B\u200E\u200F\u2028\u2029\u202D\u202E\u2066\u2067\u2069\uFEFF\uFFF9-\uFFFC]/g,
					(l, u, g) => {
						(l.state.specialChars = new RegExp(
							u.source + (u.test("	") ? "" : "|	"),
							"g",
						)),
							g != ls && l.refresh();
					},
				),
				a("specialCharPlaceholder", fx, (l) => l.refresh(), !0),
				a("electricChars", !0),
				a(
					"inputStyle",
					A ? "contenteditable" : "textarea",
					() => {
						throw new Error(
							"inputStyle can not (yet) be changed in a running editor",
						);
					},
					!0,
				),
				a("spellcheck", !1, (l, u) => (l.getInputField().spellcheck = u), !0),
				a("autocorrect", !1, (l, u) => (l.getInputField().autocorrect = u), !0),
				a(
					"autocapitalize",
					!1,
					(l, u) => (l.getInputField().autocapitalize = u),
					!0,
				),
				a("rtlMoveVisually", !U),
				a("wholeLineUpdateBefore", !0),
				a(
					"theme",
					"default",
					(l) => {
						iv(l), sl(l);
					},
					!0,
				),
				a("keyMap", "default", (l, u, g) => {
					const y = Ja(u),
						x = g != ls && Ja(g);
					x && x.detach && x.detach(l, y),
						y.attach && y.attach(l, x || undefined);
				}),
				a("extraKeys"),
				a("configureMouse"),
				a("lineWrapping", !1, IS, !0),
				a(
					"gutters",
					[],
					(l, u) => {
						(l.display.gutterSpecs = Tf(u, l.options.lineNumbers)), sl(l);
					},
					!0,
				),
				a(
					"fixedGutter",
					!0,
					(l, u) => {
						(l.display.gutters.style.left = u ? hf(l.display) + "px" : "0"),
							l.refresh();
					},
					!0,
				),
				a("coverGutterNextToScrollbar", !1, (l) => Qo(l), !0),
				a(
					"scrollbarStyle",
					"native",
					(l) => {
						lg(l),
							Qo(l),
							l.display.scrollbars.setScrollTop(l.doc.scrollTop),
							l.display.scrollbars.setScrollLeft(l.doc.scrollLeft);
					},
					!0,
				),
				a(
					"lineNumbers",
					!1,
					(l, u) => {
						(l.display.gutterSpecs = Tf(l.options.gutters, u)), sl(l);
					},
					!0,
				),
				a("firstLineNumber", 1, sl, !0),
				a("lineNumberFormatter", (l) => l, sl, !0),
				a("showCursorWhenSelecting", !1, el, !0),
				a("resetSelectionOnContextMenu", !0),
				a("lineWiseCopyCut", !0),
				a("pasteLinesPerSelection", !0),
				a("selectionsMayTouch", !1),
				a("readOnly", !1, (l, u) => {
					u == "nocursor" && (Zo(l), l.display.input.blur()),
						l.display.input.readOnlyChanged(u);
				}),
				a("screenReaderLabel", undefined, (l, u) => {
					(u = u === "" ? undefined : u),
						l.display.input.screenReaderLabelChanged(u);
				}),
				a(
					"disableInput",
					!1,
					(l, u) => {
						u || l.display.input.reset();
					},
					!0,
				),
				a("dragDrop", !0, zS),
				a("allowDropFileTypes"),
				a("cursorBlinkRate", 530),
				a("cursorScrollMargin", 0),
				a("cursorHeight", 1, el, !0),
				a("singleCursorHeightPerLine", !0, el, !0),
				a("workTime", 100),
				a("workDelay", 100),
				a("flattenSpans", !0, ll, !0),
				a("addModeClass", !1, ll, !0),
				a("pollInterval", 100),
				a("undoDepth", 200, (l, u) => (l.doc.history.undoDepth = u)),
				a("historyEventDelay", 1250),
				a("viewportMargin", 10, (l) => l.refresh(), !0),
				a("maxHighlightLength", 1e4, ll, !0),
				a("moveInputWithCursor", !0, (l, u) => {
					u || l.display.input.resetPosition();
				}),
				a(
					"tabindex",
					undefined,
					(l, u) => (l.display.input.getField().tabIndex = u || ""),
				),
				a("autofocus"),
				a("direction", "ltr", (l, u) => l.doc.setDirection(u), !0),
				a("phrases");
		}
		function zS(n, i, a) {
			const l = a && a != ls;
			if (!i != !l) {
				const u = n.display.dragFunctions,
					g = i ? ze : nn;
				g(n.display.scroller, "dragstart", u.start),
					g(n.display.scroller, "dragenter", u.enter),
					g(n.display.scroller, "dragover", u.over),
					g(n.display.scroller, "dragleave", u.leave),
					g(n.display.scroller, "drop", u.drop);
			}
		}
		function IS(n) {
			n.options.lineWrapping
				? (Ne(n.display.wrapper, "CodeMirror-wrap"),
					(n.display.sizer.style.minWidth = ""),
					(n.display.sizerWidth = undefined))
				: (Z(n.display.wrapper, "CodeMirror-wrap"), nf(n)),
				pf(n),
				bn(n),
				Qs(n),
				setTimeout(() => Qo(n), 100);
		}
		function Ct(n, i) {
			if (!(this instanceof Ct)) {
				return new Ct(n, i);
			}
			(this.options = i = i ? ae(i) : {}), ae(ov, i, !1);
			let l = i.value;
			typeof l === "string"
				? (l = new wn(l, i.mode, undefined, i.lineSeparator, i.direction))
				: i.mode && (l.modeOption = i.mode),
				(this.doc = l);
			const u = new Ct.inputStyles[i.inputStyle](this),
				g = (this.display = new Zx(n, l, u, i));
			(g.wrapper.CodeMirror = this),
				iv(this),
				i.lineWrapping &&
					(this.display.wrapper.className += " CodeMirror-wrap"),
				lg(this),
				(this.state = {
					keyMaps: [],
					overlays: [],
					modeGen: 0,
					overwrite: !1,
					delayingBlurEvent: !1,
					focused: !1,
					suppressEdits: !1,
					pasteIncoming: -1,
					cutIncoming: -1,
					selectingText: !1,
					draggingText: !1,
					highlight: new $e(),
					keySeq: undefined,
					specialChars: undefined,
				}),
				i.autofocus && !A && g.input.focus(),
				h && p < 11 && setTimeout(() => this.display.input.reset(!0), 20),
				FS(this),
				vS(),
				go(this),
				(this.curOp.forceUpdate = !0),
				mg(this, l),
				(i.autofocus && !A) || this.hasFocus()
					? setTimeout(() => {
							this.hasFocus() && !this.state.focused && yf(this);
						}, 20)
					: Zo(this);
			for (const y in ec) {
				Object.hasOwn(ec, y) && ec[y](this, i[y], ls);
			}
			ug(this), i.finishInit && i.finishInit(this);
			for (let x = 0; x < If.length; ++x) {
				If[x](this);
			}
			vo(this),
				v &&
					i.lineWrapping &&
					getComputedStyle(g.lineDiv).textRendering == "optimizelegibility" &&
					(g.lineDiv.style.textRendering = "auto");
		}
		(Ct.defaults = ov), (Ct.optionHandlers = ec);
		function FS(n) {
			const i = n.display;
			ze(i.scroller, "mousedown", Gt(n, ev)),
				h && p < 11
					? ze(
							i.scroller,
							"dblclick",
							Gt(n, (S) => {
								if (!Nt(n, S)) {
									const _ = uo(n, S);
									if (!(!_ || zf(n, S) || ei(n.display, S))) {
										rn(S);
										const $ = n.findWordAt(_);
										Ga(n.doc, $.anchor, $.head);
									}
								}
							}),
						)
					: ze(i.scroller, "dblclick", (S) => Nt(n, S) || rn(S)),
				ze(i.scroller, "contextmenu", (S) => rv(n, S)),
				ze(i.input.getField(), "contextmenu", (S) => {
					i.scroller.contains(S.target) || rv(n, S);
				});
			let a,
				l = { end: 0 };
			function u() {
				i.activeTouch &&
					((a = setTimeout(() => (i.activeTouch = undefined), 1e3)),
					(l = i.activeTouch),
					(l.end = Date.now()));
			}
			function g(S) {
				if (S.touches.length != 1) {
					return !1;
				}
				const _ = S.touches[0];
				return _.radiusX <= 1 && _.radiusY <= 1;
			}
			function y(S, _) {
				if (_.left == undefined) {
					return !0;
				}
				const $ = _.left - S.left,
					D = _.top - S.top;
				return $ * $ + D * D > 20 * 20;
			}
			ze(i.scroller, "touchstart", (S) => {
				if (!(Nt(n, S) || g(S) || zf(n, S))) {
					i.input.ensurePolled(), clearTimeout(a);
					const _ = Date.now();
					(i.activeTouch = {
						start: _,
						moved: !1,
						prev: _ - l.end <= 300 ? l : undefined,
					}),
						S.touches.length == 1 &&
							((i.activeTouch.left = S.touches[0].pageX),
							(i.activeTouch.top = S.touches[0].pageY));
				}
			}),
				ze(i.scroller, "touchmove", () => {
					i.activeTouch && (i.activeTouch.moved = !0);
				}),
				ze(i.scroller, "touchend", (S) => {
					const _ = i.activeTouch;
					if (
						_ &&
						!ei(i, S) &&
						_.left != undefined &&
						!_.moved &&
						new Date() - _.start < 300
					) {
						let $ = n.coordsChar(i.activeTouch, "page"),
							D;
						!_.prev || y(_, _.prev)
							? (D = new dt($, $))
							: (!_.prev.prev || y(_, _.prev.prev)
								? (D = n.findWordAt($))
								: (D = new dt(ee($.line, 0), Ge(n.doc, ee($.line + 1, 0))))),
							n.setSelection(D.anchor, D.head),
							n.focus(),
							rn(S);
					}
					u();
				}),
				ze(i.scroller, "touchcancel", u),
				ze(i.scroller, "scroll", () => {
					i.scroller.clientHeight &&
						(nl(n, i.scroller.scrollTop),
						ho(n, i.scroller.scrollLeft, !0),
						Mt(n, "scroll", n));
				}),
				ze(i.scroller, "mousewheel", (S) => hg(n, S)),
				ze(i.scroller, "DOMMouseScroll", (S) => hg(n, S)),
				ze(
					i.wrapper,
					"scroll",
					() => (i.wrapper.scrollTop = i.wrapper.scrollLeft = 0),
				),
				(i.dragFunctions = {
					enter(S) {
						Nt(n, S) || xi(S);
					},
					over(S) {
						Nt(n, S) || (gS(n, S), xi(S));
					},
					start(S) {
						return pS(n, S);
					},
					drop: Gt(n, hS),
					leave(S) {
						Nt(n, S) || qg(n);
					},
				});
			const x = i.input.getField();
			ze(x, "keyup", (S) => Jg.call(n, S)),
				ze(x, "keydown", Gt(n, Zg)),
				ze(x, "keypress", Gt(n, Qg)),
				ze(x, "focus", (S) => yf(n, S)),
				ze(x, "blur", (S) => Zo(n, S));
		}
		const If = [];
		Ct.defineInitHook = (n) => If.push(n);
		function wl(n, i, a, l) {
			let u = n.doc,
				g;
			a == undefined && (a = "add"),
				a == "smart" && (u.mode.indent ? (g = Ks(n, i).state) : (a = "prev"));
			const y = n.options.tabSize,
				x = Oe(u, i),
				S = de(x.text, undefined, y);
			x.stateAfter && (x.stateAfter = undefined);
			let _ = x.text.match(/^\s*/)[0],
				$;
			if (!(l || /\S/.test(x.text))) {
				($ = 0), (a = "not");
			} else if (
				a == "smart" &&
				(($ = u.mode.indent(g, x.text.slice(_.length), x.text)),
				$ == O || $ > 150)
			) {
				if (!l) {
					return;
				}
				a = "prev";
			}
			a == "prev"
				? (i > u.first
					? ($ = de(Oe(u, i - 1).text, null, y))
					: ($ = 0))
				: a == "add"
					? ($ = S + n.options.indentUnit)
					: a == "subtract"
						? ($ = S - n.options.indentUnit)
						: typeof a === "number" && ($ = S + a),
				($ = Math.max(0, $));
			let D = "",
				K = 0;
			if (n.options.indentWithTabs) {
				for (let j = Math.floor($ / y); j; --j) {
					(K += y), (D += "	");
				}
			}
			if ((K < $ && (D += _e($ - K)), D != _)) {
				return (
					rs(u, D, ee(i, 0), ee(i, _.length), "+input"),
					(x.stateAfter = undefined),
					!0
				);
			}
			for (let ne = 0; ne < u.sel.ranges.length; ne++) {
				const ce = u.sel.ranges[ne];
				if (ce.head.line == i && ce.head.ch < _.length) {
					const ge = ee(i, _.length);
					Nf(u, ne, new dt(ge, ge));
					break;
				}
			}
		}
		let mr;
		function tc(n) {
			mr = n;
		}
		function Ff(n, i, a, l, u) {
			const g = n.doc;
			(n.display.shift = !1), l || (l = g.sel);
			let y = Date.now() - 200,
				x = u == "paste" || n.state.pasteIncoming > y,
				S = tr(i),
				_;
			if (x && l.ranges.length > 1) {
				if (
					mr &&
					mr.text.join(`
`) == i
				) {
					if (l.ranges.length % mr.text.length == 0) {
						_ = [];
						for (let $ = 0; $ < mr.text.length; $++) {
							_.push(g.splitLines(mr.text[$]));
						}
					}
				} else {
					S.length == l.ranges.length &&
						n.options.pasteLinesPerSelection &&
						(_ = be(S, (we) => [we]));
				}
			}
			for (var D = n.curOp.updateInput, K = l.ranges.length - 1; K >= 0; K--) {
				let j = l.ranges[K],
					ne = j.from(),
					ce = j.to();
				j.empty() &&
					(a && a > 0
						? (ne = ee(ne.line, ne.ch - a))
						: (n.state.overwrite && !x
							? (ce = ee(
									ce.line,
									Math.min(Oe(g, ce.line).text.length, ce.ch + ue(S).length),
								))
							: x &&
								mr &&
								mr.lineWise &&
								mr.text.join(`
`) ==
									S.join(`
`) &&
								(ne = ce = ee(ne.line, 0))));
				const ge = {
					from: ne,
					to: ce,
					text: _ ? _[K % _.length] : S,
					origin:
						u || (x ? "paste" : (n.state.cutIncoming > y ? "cut" : "+input")),
				};
				ns(n.doc, ge), jt(n, "inputRead", n, ge);
			}
			i && !x && lv(n, i),
				Jo(n),
				n.curOp.updateInput < 2 && (n.curOp.updateInput = D),
				(n.curOp.typing = !0),
				(n.state.pasteIncoming = n.state.cutIncoming = -1);
		}
		function sv(n, i) {
			const a = n.clipboardData && n.clipboardData.getData("Text");
			if (a) {
				return (
					n.preventDefault(),
					!(i.isReadOnly() || i.options.disableInput) &&
						i.hasFocus() &&
						On(i, () => Ff(i, a, 0, undefined, "paste")),
					!0
				);
			}
		}
		function lv(n, i) {
			if (n.options.electricChars && n.options.smartIndent) {
				for (let a = n.doc.sel, l = a.ranges.length - 1; l >= 0; l--) {
					const u = a.ranges[l];
					if (
						!(
							u.head.ch > 100 ||
							(l && a.ranges[l - 1].head.line == u.head.line)
						)
					) {
						let g = n.getModeAt(u.head),
							y = !1;
						if (g.electricChars) {
							for (let x = 0; x < g.electricChars.length; x++) {
								if (i.indexOf(g.electricChars.charAt(x)) > -1) {
									y = wl(n, u.head.line, "smart");
									break;
								}
							}
						} else {
							g.electricInput &&
								g.electricInput.test(
									Oe(n.doc, u.head.line).text.slice(0, u.head.ch),
								) &&
								(y = wl(n, u.head.line, "smart"));
						}
						y && jt(n, "electricInput", n, u.head.line);
					}
				}
			}
		}
		function av(n) {
			for (var i = [], a = [], l = 0; l < n.doc.sel.ranges.length; l++) {
				const u = n.doc.sel.ranges[l].head.line,
					g = { anchor: ee(u, 0), head: ee(u + 1, 0) };
				a.push(g), i.push(n.getRange(g.anchor, g.head));
			}
			return { text: i, ranges: a };
		}
		function Hf(n, i, a, l) {
			n.setAttribute("autocorrect", a ? "on" : "off"),
				n.setAttribute("autocapitalize", l ? "on" : "off"),
				n.setAttribute("spellcheck", !!i);
		}
		function cv() {
			const n = k(
					"textarea",
					undefined,
					undefined,
					"position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; min-height: 1em; outline: none",
				),
				i = k(
					"div",
					[n],
					undefined,
					"overflow: hidden; position: relative; width: 3px; height: 0px;",
				);
			return (
				v ? (n.style.width = "1000px") : n.setAttribute("wrap", "off"),
				N && (n.style.border = "1px solid black"),
				i
			);
		}
		function HS(n) {
			const i = n.optionHandlers,
				a = (n.helpers = {});
			(n.prototype = {
				constructor: n,
				focus() {
					Ae(this).focus(), this.display.input.focus();
				},
				setOption(l, u) {
					const g = this.options,
						y = g[l];
					(g[l] == u && l != "mode") ||
						((g[l] = u),
						Object.hasOwn(i, l) && Gt(this, i[l])(this, u, y),
						Mt(this, "optionChange", this, l));
				},
				getOption(l) {
					return this.options[l];
				},
				getDoc() {
					return this.doc;
				},
				addKeyMap(l, u) {
					this.state.keyMaps[u ? "push" : "unshift"](Ja(l));
				},
				removeKeyMap(l) {
					for (let u = this.state.keyMaps, g = 0; g < u.length; ++g) {
						if (u[g] == l || u[g].name == l) {
							return u.splice(g, 1), !0;
						}
					}
				},
				addOverlay: fn(function (l, u) {
					const g = l.token ? l : n.getMode(this.options, l);
					if (g.startState) {
						throw new Error("Overlays may not be stateful.");
					}
					ve(
						this.state.overlays,
						{
							mode: g,
							modeSpec: l,
							opaque: u && u.opaque,
							priority: (u && u.priority) || 0,
						},
						(y) => y.priority,
					),
						this.state.modeGen++,
						bn(this);
				}),
				removeOverlay: fn(function (l) {
					for (let u = this.state.overlays, g = 0; g < u.length; ++g) {
						const y = u[g].modeSpec;
						if (y == l || (typeof l === "string" && y.name == l)) {
							u.splice(g, 1), this.state.modeGen++, bn(this);
							return;
						}
					}
				}),
				indentLine: fn(function (l, u, g) {
					typeof u !== "string" &&
						typeof u !== "number" &&
						(u == undefined
							? (u = this.options.smartIndent ? "smart" : "prev")
							: (u = u ? "add" : "subtract")),
						se(this.doc, l) && wl(this, l, u, g);
				}),
				indentSelection: fn(function (l) {
					for (let u = this.doc.sel.ranges, g = -1, y = 0; y < u.length; y++) {
						const x = u[y];
						if (x.empty()) {
							x.head.line > g &&
								(wl(this, x.head.line, l, !0),
								(g = x.head.line),
								y == this.doc.sel.primIndex && Jo(this));
						} else {
							const S = x.from(),
								_ = x.to(),
								$ = Math.max(g, S.line);
							g = Math.min(this.lastLine(), _.line - (_.ch ? 0 : 1)) + 1;
							for (let D = $; D < g; ++D) {
								wl(this, D, l);
							}
							const K = this.doc.sel.ranges;
							S.ch == 0 &&
								u.length == K.length &&
								K[y].from().ch > 0 &&
								Nf(this.doc, y, new dt(S, K[y].to()), H);
						}
					}
				}),
				getTokenAt(l, u) {
					return bp(this, l, u);
				},
				getLineTokens(l, u) {
					return bp(this, ee(l), u, !0);
				},
				getTokenTypeAt(l) {
					l = Ge(this.doc, l);
					let u = vp(this, Oe(this.doc, l.line)),
						g = 0,
						y = (u.length - 1) / 2,
						x = l.ch,
						S;
					if (x == 0) {
						S = u[2];
					} else {
						for (;;) {
							const _ = (g + y) >> 1;
							if ((_ ? u[_ * 2 - 1] : 0) >= x) {
								y = _;
							} else if (u[_ * 2 + 1] < x) {
								g = _ + 1;
							} else {
								S = u[_ * 2 + 2];
								break;
							}
						}
					}
					const $ = S ? S.indexOf("overlay ") : -1;
					return $ < 0 ? S : ($ == 0 ? null : S.slice(0, $ - 1));
				},
				getModeAt(l) {
					const u = this.doc.mode;
					return u.innerMode
						? n.innerMode(u, this.getTokenAt(l).state).mode
						: u;
				},
				getHelper(l, u) {
					return this.getHelpers(l, u)[0];
				},
				getHelpers(l, u) {
					const g = [];
					if (!Object.hasOwn(a, u)) {
						return g;
					}
					const y = a[u],
						x = this.getModeAt(l);
					if (typeof x[u] === "string") {
						y[x[u]] && g.push(y[x[u]]);
					} else if (x[u]) {
						for (let S = 0; S < x[u].length; S++) {
							const _ = y[x[u][S]];
							_ && g.push(_);
						}
					} else {
						x.helperType && y[x.helperType]
							? g.push(y[x.helperType])
							: y[x.name] && g.push(y[x.name]);
					}
					for (let $ = 0; $ < y._global.length; $++) {
						const D = y._global[$];
						D.pred(x, this) && Ee(g, D.val) == -1 && g.push(D.val);
					}
					return g;
				},
				getStateAfter(l, u) {
					const g = this.doc;
					return (
						(l = hp(g, l ?? g.first + g.size - 1)), Ks(this, l + 1, u).state
					);
				},
				cursorCoords(l, u) {
					let g,
						y = this.doc.sel.primary();
					return (
						l == undefined
							? (g = y.head)
							: (typeof l == "object"
								? (g = Ge(this.doc, l))
								: (g = l ? y.from() : y.to())),
						gr(this, g, u || "page")
					);
				},
				charCoords(l, u) {
					return za(this, Ge(this.doc, l), u || "page");
				},
				coordsChar(l, u) {
					return (l = Kp(this, l, u || "page")), uf(this, l.left, l.top);
				},
				lineAtHeight(l, u) {
					return (
						(l = Kp(this, { top: l, left: 0 }, u || "page").top),
						R(this.doc, l + this.display.viewOffset)
					);
				},
				heightAtLine(l, u, g) {
					let y = !1,
						x;
					if (typeof l === "number") {
						const S = this.doc.first + this.doc.size - 1;
						l < this.doc.first
							? (l = this.doc.first)
							: l > S && ((l = S), (y = !0)),
							(x = Oe(this.doc, l));
					} else {
						x = l;
					}
					return (
						Da(this, x, { top: 0, left: 0 }, u || "page", g || y).top +
						(y ? this.doc.height - Qr(x) : 0)
					);
				},
				defaultTextHeight() {
					return Xo(this.display);
				},
				defaultCharWidth() {
					return Yo(this.display);
				},
				getViewport() {
					return { from: this.display.viewFrom, to: this.display.viewTo };
				},
				addWidget(l, u, g, y, x) {
					const S = this.display;
					l = gr(this, Ge(this.doc, l));
					let _ = l.bottom,
						$ = l.left;
					if (
						((u.style.position = "absolute"),
						u.setAttribute("cm-ignore-events", "true"),
						this.display.input.setUneditable(u),
						S.sizer.append(u),
						y == "over")
					) {
						_ = l.top;
					} else if (y == "above" || y == "near") {
						const D = Math.max(S.wrapper.clientHeight, this.doc.height),
							K = Math.max(S.sizer.clientWidth, S.lineSpace.clientWidth);
						(y == "above" || l.bottom + u.offsetHeight > D) &&
						l.top > u.offsetHeight
							? (_ = l.top - u.offsetHeight)
							: l.bottom + u.offsetHeight <= D && (_ = l.bottom),
							$ + u.offsetWidth > K && ($ = K - u.offsetWidth);
					}
					(u.style.top = _ + "px"),
						(u.style.left = u.style.right = ""),
						x == "right"
							? (($ = S.sizer.clientWidth - u.offsetWidth),
								(u.style.right = "0px"))
							: (x == "left"
									? ($ = 0)
									: x == "middle" &&
										($ = (S.sizer.clientWidth - u.offsetWidth) / 2),
								(u.style.left = $ + "px")),
						g &&
							zx(this, {
								left: $,
								top: _,
								right: $ + u.offsetWidth,
								bottom: _ + u.offsetHeight,
							});
				},
				triggerOnKeyDown: fn(Zg),
				triggerOnKeyPress: fn(Qg),
				triggerOnKeyUp: Jg,
				triggerOnMouseDown: fn(ev),
				execCommand(l) {
					if (Object.hasOwn(vl, l)) {
						return vl[l].call(undefined, this);
					}
				},
				triggerElectric: fn(function (l) {
					lv(this, l);
				}),
				findPosH(l, u, g, y) {
					let x = 1;
					u < 0 && ((x = -1), (u = -u));
					for (
						var S = Ge(this.doc, l), _ = 0;
						_ < u && ((S = qf(this.doc, S, x, g, y)), !S.hitSide);
						++_
					) {}
					return S;
				},
				moveH: fn(function (l, u) {
					this.extendSelectionsBy(
						(y) =>
							this.display.shift || this.doc.extend || y.empty()
								? qf(this.doc, y.head, l, u, this.options.rtlMoveVisually)
								: (l < 0
									? y.from()
									: y.to()),
						fe,
					);
				}),
				deleteH: fn(function (l, u) {
					const g = this.doc.sel,
						y = this.doc;
					g.somethingSelected()
						? y.replaceSelection("", undefined, "+delete")
						: ss(this, (x) => {
								const S = qf(y, x.head, l, u, !1);
								return l < 0
									? { from: S, to: x.head }
									: { from: x.head, to: S };
							});
				}),
				findPosV(l, u, g, y) {
					let x = 1,
						S = y;
					u < 0 && ((x = -1), (u = -u));
					for (var _ = Ge(this.doc, l), $ = 0; $ < u; ++$) {
						const D = gr(this, _, "div");
						if (
							(S == undefined ? (S = D.left) : (D.left = S),
							(_ = uv(this, D, x, g)),
							_.hitSide)
						) {
							break;
						}
					}
					return _;
				},
				moveV: fn(function (l, u) {
					const y = this.doc,
						x = [],
						S = !(this.display.shift || y.extend) && y.sel.somethingSelected();
					if (
						(y.extendSelectionsBy(($) => {
							if (S) {
								return l < 0 ? $.from() : $.to();
							}
							const D = gr(this, $.head, "div");
							$.goalColumn != undefined && (D.left = $.goalColumn),
								x.push(D.left);
							const K = uv(this, D, l, u);
							return (
								u == "page" &&
									$ == y.sel.primary() &&
									wf(this, za(this, K, "div").top - D.top),
								K
							);
						}, fe),
						x.length)
					) {
						for (let _ = 0; _ < y.sel.ranges.length; _++) {
							y.sel.ranges[_].goalColumn = x[_];
						}
					}
				}),
				findWordAt(l) {
					let u = this.doc,
						g = Oe(u, l.line).text,
						y = l.ch,
						x = l.ch;
					if (g) {
						const S = this.getHelper(l, "wordChars");
						(l.sticky == "before" || x == g.length) && y ? --y : ++x;
						for (
							var _ = g.charAt(y),
								$ = Xe(_, S)
									? (D) => Xe(D, S)
									: (/\s/.test(_)
										? (D) => /\s/.test(D)
										: (D) => !(/\s/.test(D) || Xe(D)));
							y > 0 && $(g.charAt(y - 1));
						) {
							--y;
						}
						while (x < g.length && $(g.charAt(x))) {
							++x;
						}
					}
					return new dt(ee(l.line, y), ee(l.line, x));
				},
				toggleOverwrite(l) {
					(l != undefined && l == this.state.overwrite) ||
						((this.state.overwrite = !this.state.overwrite)
							? Ne(this.display.cursorDiv, "CodeMirror-overwrite")
							: Z(this.display.cursorDiv, "CodeMirror-overwrite"),
						Mt(this, "overwriteToggle", this, this.state.overwrite));
				},
				hasFocus() {
					return this.display.input.getField() == ye(tt(this));
				},
				isReadOnly() {
					return !!(this.options.readOnly || this.doc.cantEdit);
				},
				scrollTo: fn(function (l, u) {
					tl(this, l, u);
				}),
				getScrollInfo() {
					const l = this.display.scroller;
					return {
						left: l.scrollLeft,
						top: l.scrollTop,
						height: l.scrollHeight - $r(this) - this.display.barHeight,
						width: l.scrollWidth - $r(this) - this.display.barWidth,
						clientHeight: sf(this),
						clientWidth: ao(this),
					};
				},
				scrollIntoView: fn(function (l, u) {
					l == undefined
						? ((l = { from: this.doc.sel.primary().head, to: undefined }),
							u == undefined && (u = this.options.cursorScrollMargin))
						: (typeof l == "number"
							? (l = { from: ee(l, 0), to: null })
							: l.from == null && (l = { from: l, to: null })),
						l.to || (l.to = l.from),
						(l.margin = u || 0),
						l.from.line != undefined
							? Ix(this, l)
							: rg(this, l.from, l.to, l.margin);
				}),
				setSize: fn(function (l, u) {
					const y = (S) =>
						typeof S === "number" || /^\d+$/.test(String(S)) ? S + "px" : S;
					l != undefined && (this.display.wrapper.style.width = y(l)),
						u != undefined && (this.display.wrapper.style.height = y(u)),
						this.options.lineWrapping && Vp(this);
					let x = this.display.viewFrom;
					this.doc.iter(x, this.display.viewTo, (S) => {
						if (S.widgets) {
							for (let _ = 0; _ < S.widgets.length; _++) {
								if (S.widgets[_].noHScroll) {
									Ci(this, x, "widget");
									break;
								}
							}
						}
						++x;
					}),
						(this.curOp.forceUpdate = !0),
						Mt(this, "refresh", this);
				}),
				operation(l) {
					return On(this, l);
				},
				startOperation() {
					return go(this);
				},
				endOperation() {
					return vo(this);
				},
				refresh: fn(function () {
					const l = this.display.cachedTextHeight;
					bn(this),
						(this.curOp.forceUpdate = !0),
						Qs(this),
						tl(this, this.doc.scrollLeft, this.doc.scrollTop),
						_f(this.display),
						(l == undefined ||
							Math.abs(l - Xo(this.display)) > 0.5 ||
							this.options.lineWrapping) &&
							pf(this),
						Mt(this, "refresh", this);
				}),
				swapDoc: fn(function (l) {
					const u = this.doc;
					return (
						(u.cm = undefined),
						this.state.selectingText && this.state.selectingText(),
						mg(this, l),
						Qs(this),
						this.display.input.reset(),
						tl(this, l.scrollLeft, l.scrollTop),
						(this.curOp.forceScroll = !0),
						jt(this, "swapDoc", this, u),
						u
					);
				}),
				phrase(l) {
					const u = this.options.phrases;
					return u && Object.hasOwn(u, l) ? u[l] : l;
				},
				getInputField() {
					return this.display.input.getField();
				},
				getWrapperElement() {
					return this.display.wrapper;
				},
				getScrollerElement() {
					return this.display.scroller;
				},
				getGutterElement() {
					return this.display.gutters;
				},
			}),
				cr(n),
				(n.registerHelper = (l, u, g) => {
					Object.hasOwn(a, l) || (a[l] = n[l] = { _global: [] }), (a[l][u] = g);
				}),
				(n.registerGlobalHelper = (l, u, g, y) => {
					n.registerHelper(l, u, y), a[l]._global.push({ pred: g, val: y });
				});
		}
		function qf(n, i, a, l, u) {
			let g = i,
				y = a,
				x = Oe(n, i.line),
				S = u && n.direction == "rtl" ? -a : a;
			function _() {
				const ke = i.line + S;
				return ke < n.first || ke >= n.first + n.size
					? !1
					: ((i = new ee(ke, i.ch, i.sticky)), (x = Oe(n, ke)));
			}
			function $(ke) {
				let xe;
				if (l == "codepoint") {
					const Me = x.text.codePointAt(i.ch + (a > 0 ? 0 : -1));
					if (isNaN(Me)) {
						xe = undefined;
					} else {
						const Ie =
							a > 0 ? Me >= 55_296 && Me < 56_320 : Me >= 56_320 && Me < 57_343;
						xe = new ee(
							i.line,
							Math.max(0, Math.min(x.text.length, i.ch + a * (Ie ? 2 : 1))),
							-a,
						);
					}
				} else {
					u ? (xe = xS(n.cm, x, i, a)) : (xe = Pf(x, i, a));
				}
				if (xe == undefined) {
					if (!ke && _()) {
						i = Of(u, n.cm, x, i.line, S);
					} else {
						return !1;
					}
				} else {
					i = xe;
				}
				return !0;
			}
			if (l == "char" || l == "codepoint") {
				$();
			} else if (l == "column") {
				$(!0);
			} else if (l == "word" || l == "group") {
				for (
					let D,
						K = l == "group",
						j = n.cm && n.cm.getHelper(i, "wordChars"),
						ne = !0;
					!(a < 0 && !$(!ne));
					ne = !1
				) {
					let ce =
							x.text.charAt(i.ch) ||
							`
`,
						ge = Xe(ce, j)
							? "w"
							: K &&
									ce ==
										`
`
								? "n"
								: !K || /\s/.test(ce)
									? undefined
									: "p";
					if ((K && !ne && !ge && (ge = "s"), D && D != ge)) {
						a < 0 && ((a = 1), $(), (i.sticky = "after"));
						break;
					}
					if ((ge && (D = ge), a > 0 && !$(!ne))) {
						break;
					}
				}
			}
			const we = Xa(n, i, g, y, !0);
			return ft(g, we) && (we.hitSide = !0), we;
		}
		function uv(n, i, a, l) {
			let u = n.doc,
				g = i.left,
				y;
			if (l == "page") {
				const x = Math.min(
						n.display.wrapper.clientHeight,
						Ae(n).innerHeight || u(n).documentElement.clientHeight,
					),
					S = Math.max(x - 0.5 * Xo(n.display), 3);
				y = (a > 0 ? i.bottom : i.top) + a * S;
			} else {
				l == "line" && (y = a > 0 ? i.bottom + 3 : i.top - 3);
			}
			for (var _; (_ = uf(n, g, y)), !!_.outside; ) {
				if (a < 0 ? y <= 0 : y >= u.height) {
					_.hitSide = !0;
					break;
				}
				y += a * 5;
			}
			return _;
		}
		const yt = function yt(n) {
			(this.cm = n),
				(this.lastAnchorNode =
					this.lastAnchorOffset =
					this.lastFocusNode =
					this.lastFocusOffset =
						undefined),
				(this.polling = new $e()),
				(this.composing = undefined),
				(this.gracePeriod = !1),
				(this.readDOMTimeout = undefined);
		};
		(yt.prototype.init = function init(n) {
			const a = this,
				l = a.cm,
				u = (a.div = n.lineDiv);
			(u.contentEditable = !0),
				Hf(
					u,
					l.options.spellcheck,
					l.options.autocorrect,
					l.options.autocapitalize,
				);
			function g(x) {
				for (let S = x.target; S; S = S.parentNode) {
					if (S == u) {
						return !0;
					}
					if (/\bCodeMirror-(?:line)?widget\b/.test(S.className)) {
						break;
					}
				}
				return !1;
			}
			ze(u, "paste", (x) => {
				!g(x) ||
					Nt(l, x) ||
					sv(x, l) ||
					(p <= 11 &&
						setTimeout(
							Gt(l, () => this.updateFromDOM()),
							20,
						));
			}),
				ze(u, "compositionstart", (x) => {
					this.composing = { data: x.data, done: !1 };
				}),
				ze(u, "compositionupdate", (x) => {
					this.composing || (this.composing = { data: x.data, done: !1 });
				}),
				ze(u, "compositionend", (x) => {
					this.composing &&
						(x.data != this.composing.data && this.readFromDOMSoon(),
						(this.composing.done = !0));
				}),
				ze(u, "touchstart", () => a.forceCompositionEnd()),
				ze(u, "input", () => {
					this.composing || this.readFromDOMSoon();
				});
			function y(x) {
				if (!(!g(x) || Nt(l, x))) {
					if (l.somethingSelected()) {
						tc({ lineWise: !1, text: l.getSelections() }),
							x.type == "cut" && l.replaceSelection("", undefined, "cut");
					} else if (l.options.lineWiseCopyCut) {
						const S = av(l);
						tc({ lineWise: !0, text: S.text }),
							x.type == "cut" &&
								l.operation(() => {
									l.setSelections(S.ranges, 0, H),
										l.replaceSelection("", undefined, "cut");
								});
					} else {
						return;
					}
					if (x.clipboardData) {
						x.clipboardData.clearData();
						const _ = mr.text.join(`
`);
						if (
							(x.clipboardData.setData("Text", _),
							x.clipboardData.getData("Text") == _)
						) {
							x.preventDefault();
							return;
						}
					}
					const $ = cv(),
						D = $.firstChild;
					Hf(D),
						l.display.lineSpace.insertBefore($, l.display.lineSpace.firstChild),
						(D.value = mr.text.join(`
`));
					const K = ye(Je(u));
					je(D),
						setTimeout(() => {
							l.display.lineSpace.removeChild($),
								K.focus(),
								K == u && a.showPrimarySelection();
						}, 50);
				}
			}
			ze(u, "copy", y), ze(u, "cut", y);
		}),
			(yt.prototype.screenReaderLabelChanged =
				function screenReaderLabelChanged(n) {
					n
						? this.div.setAttribute("aria-label", n)
						: this.div.removeAttribute("aria-label");
				}),
			(yt.prototype.prepareSelection = function prepareSelection() {
				const n = eg(this.cm, !1);
				return (n.focus = ye(Je(this.div)) == this.div), n;
			}),
			(yt.prototype.showSelection = function showSelection(n, i) {
				!(n && this.cm.display.view.length > 0) ||
					((n.focus || i) && this.showPrimarySelection(),
					this.showMultipleSelections(n));
			}),
			(yt.prototype.getSelection = function getSelection() {
				return this.cm.display.wrapper.ownerDocument.getSelection();
			}),
			(yt.prototype.showPrimarySelection = function showPrimarySelection() {
				const n = this.getSelection(),
					i = this.cm,
					a = i.doc.sel.primary(),
					l = a.from(),
					u = a.to();
				if (
					i.display.viewTo == i.display.viewFrom ||
					l.line >= i.display.viewTo ||
					u.line < i.display.viewFrom
				) {
					n.removeAllRanges();
					return;
				}
				const g = nc(i, n.anchorNode, n.anchorOffset),
					y = nc(i, n.focusNode, n.focusOffset);
				if (
					!(
						g &&
						!g.bad &&
						y &&
						!y.bad &&
						Se(Vo(g, y), l) == 0 &&
						Se(yn(g, y), u) == 0
					)
				) {
					let x = i.display.view,
						S = (l.line >= i.display.viewFrom && fv(i, l)) || {
							node: x[0].measure.map[2],
							offset: 0,
						},
						_ = u.line < i.display.viewTo && fv(i, u);
					if (!_) {
						const $ = x[x.length - 1].measure,
							D = $.maps ? $.maps[$.maps.length - 1] : $.map;
						_ = {
							node: D[D.length - 1],
							offset: D[D.length - 2] - D[D.length - 3],
						};
					}
					if (!(S && _)) {
						n.removeAllRanges();
						return;
					}
					let K = n.rangeCount && n.getRangeAt(0),
						j;
					try {
						j = V(S.node, S.offset, _.offset, _.node);
					} catch {}
					j &&
						(!s && i.state.focused
							? (n.collapse(S.node, S.offset),
								j.collapsed || (n.removeAllRanges(), n.addRange(j)))
							: (n.removeAllRanges(), n.addRange(j)),
						K && n.anchorNode == undefined
							? n.addRange(K)
							: s && this.startGracePeriod()),
						this.rememberSelection();
				}
			}),
			(yt.prototype.startGracePeriod = function startGracePeriod() {
				clearTimeout(this.gracePeriod),
					(this.gracePeriod = setTimeout(() => {
						(this.gracePeriod = !1),
							this.selectionChanged() &&
								this.cm.operation(() => (this.cm.curOp.selectionChanged = !0));
					}, 20));
			}),
			(yt.prototype.showMultipleSelections = function showMultipleSelections(
				n,
			) {
				F(this.cm.display.cursorDiv, n.cursors),
					F(this.cm.display.selectionDiv, n.selection);
			}),
			(yt.prototype.rememberSelection = function rememberSelection() {
				const n = this.getSelection();
				(this.lastAnchorNode = n.anchorNode),
					(this.lastAnchorOffset = n.anchorOffset),
					(this.lastFocusNode = n.focusNode),
					(this.lastFocusOffset = n.focusOffset);
			}),
			(yt.prototype.selectionInEditor = function selectionInEditor() {
				const n = this.getSelection();
				if (!n.rangeCount) {
					return !1;
				}
				const i = n.getRangeAt(0).commonAncestorContainer;
				return ie(this.div, i);
			}),
			(yt.prototype.focus = function focus() {
				this.cm.options.readOnly != "nocursor" &&
					((!this.selectionInEditor() || ye(Je(this.div)) != this.div) &&
						this.showSelection(this.prepareSelection(), !0),
					this.div.focus());
			}),
			(yt.prototype.blur = function blur() {
				this.div.blur();
			}),
			(yt.prototype.getField = function getField() {
				return this.div;
			}),
			(yt.prototype.supportsTouch = () => !0),
			(yt.prototype.receivedFocus = function receivedFocus() {
				const i = this;
				this.selectionInEditor()
					? setTimeout(() => this.pollSelection(), 20)
					: On(this.cm, () => (i.cm.curOp.selectionChanged = !0));
				function a() {
					i.cm.state.focused &&
						(i.pollSelection(), i.polling.set(i.cm.options.pollInterval, a));
				}
				this.polling.set(this.cm.options.pollInterval, a);
			}),
			(yt.prototype.selectionChanged = function selectionChanged() {
				const n = this.getSelection();
				return (
					n.anchorNode != this.lastAnchorNode ||
					n.anchorOffset != this.lastAnchorOffset ||
					n.focusNode != this.lastFocusNode ||
					n.focusOffset != this.lastFocusOffset
				);
			}),
			(yt.prototype.pollSelection = function pollSelection() {
				if (
					!(
						this.readDOMTimeout != undefined ||
						this.gracePeriod ||
						!this.selectionChanged()
					)
				) {
					const n = this.getSelection(),
						i = this.cm;
					if (
						P &&
						b &&
						this.cm.display.gutterSpecs.length > 0 &&
						qS(n.anchorNode)
					) {
						this.cm.triggerOnKeyDown({
							type: "keydown",
							keyCode: 8,
							preventDefault: Math.abs,
						}),
							this.blur(),
							this.focus();
						return;
					}
					if (!this.composing) {
						this.rememberSelection();
						const a = nc(i, n.anchorNode, n.anchorOffset),
							l = nc(i, n.focusNode, n.focusOffset);
						a &&
							l &&
							On(i, () => {
								on(i.doc, Li(a, l), H),
									(a.bad || l.bad) && (i.curOp.selectionChanged = !0);
							});
					}
				}
			}),
			(yt.prototype.pollContent = function pollContent() {
				this.readDOMTimeout != undefined &&
					(clearTimeout(this.readDOMTimeout),
					(this.readDOMTimeout = undefined));
				let n = this.cm,
					i = n.display,
					a = n.doc.sel.primary(),
					l = a.from(),
					u = a.to();
				if (
					(l.ch == 0 &&
						l.line > n.firstLine() &&
						(l = ee(l.line - 1, Oe(n.doc, l.line - 1).length)),
					u.ch == Oe(n.doc, u.line).text.length &&
						u.line < n.lastLine() &&
						(u = ee(u.line + 1, 0)),
					l.line < i.viewFrom || u.line > i.viewTo - 1)
				) {
					return !1;
				}
				let g, y, x;
				l.line == i.viewFrom || (g = fo(n, l.line)) == 0
					? ((y = T(i.view[0].line)), (x = i.view[0].node))
					: ((y = T(i.view[g].line)), (x = i.view[g - 1].node.nextSibling));
				let S = fo(n, u.line),
					_,
					$;
				if (
					(S == i.view.length - 1
						? ((_ = i.viewTo - 1), ($ = i.lineDiv.lastChild))
						: ((_ = T(i.view[S + 1].line) - 1),
							($ = i.view[S + 1].node.previousSibling)),
					!x)
				) {
					return !1;
				}
				for (
					var D = n.doc.splitLines(BS(n, x, $, y, _)),
						K = Zr(n.doc, ee(y, 0), ee(_, Oe(n.doc, _).text.length));
					D.length > 1 && K.length > 1;
				) {
					if (ue(D) == ue(K)) {
						D.pop(), K.pop(), _--;
					} else if (D[0] == K[0]) {
						D.shift(), K.shift(), y++;
					} else {
						break;
					}
				}
				for (
					var j = 0,
						ne = 0,
						ce = D[0],
						ge = K[0],
						we = Math.min(ce.length, ge.length);
					j < we && ce.codePointAt(j) == ge.codePointAt(j);
				) {
					++j;
				}
				for (
					var ke = ue(D),
						xe = ue(K),
						Me = Math.min(
							ke.length - (D.length == 1 ? j : 0),
							xe.length - (K.length == 1 ? j : 0),
						);
					ne < Me &&
					ke.codePointAt(ke.length - ne - 1) ==
						xe.codePointAt(xe.length - ne - 1);
				) {
					++ne;
				}
				if (D.length == 1 && K.length == 1 && y == l.line) {
					while (
						j &&
						j > l.ch &&
						ke.codePointAt(ke.length - ne - 1) ==
							xe.codePointAt(xe.length - ne - 1)
					) {
						j--, ne++;
					}
				}
				(D[D.length - 1] = ke.slice(0, ke.length - ne).replace(/^\u200B+/, "")),
					(D[0] = D[0].slice(j).replace(/\u200B+$/, ""));
				const Ie = ee(y, j),
					Re = ee(_, K.length > 0 ? ue(K).length - ne : 0);
				if (D.length > 1 || D[0] || Se(Ie, Re)) {
					return rs(n.doc, D, Ie, Re, "+input"), !0;
				}
			}),
			(yt.prototype.ensurePolled = function ensurePolled() {
				this.forceCompositionEnd();
			}),
			(yt.prototype.reset = function reset() {
				this.forceCompositionEnd();
			}),
			(yt.prototype.forceCompositionEnd = function forceCompositionEnd() {
				this.composing &&
					(clearTimeout(this.readDOMTimeout),
					(this.composing = undefined),
					this.updateFromDOM(),
					this.div.blur(),
					this.div.focus());
			}),
			(yt.prototype.readFromDOMSoon = function readFromDOMSoon() {
				this.readDOMTimeout == undefined &&
					(this.readDOMTimeout = setTimeout(() => {
						if (((this.readDOMTimeout = undefined), this.composing)) {
							if (this.composing.done) {
								this.composing = undefined;
							} else {
								return;
							}
						}
						this.updateFromDOM();
					}, 80));
			}),
			(yt.prototype.updateFromDOM = function updateFromDOM() {
				(this.cm.isReadOnly() || !this.pollContent()) &&
					On(this.cm, () => bn(this.cm));
			}),
			(yt.prototype.setUneditable = (n) => {
				n.contentEditable = "false";
			}),
			(yt.prototype.onKeyPress = function onKeyPress(n) {
				n.charCode == 0 ||
					this.composing ||
					(n.preventDefault(),
					this.cm.isReadOnly() ||
						Gt(this.cm, Ff)(
							this.cm,
							String.fromCodePoint(
								n.charCode == undefined ? n.keyCode : n.charCode,
							),
							0,
						));
			}),
			(yt.prototype.readOnlyChanged = function readOnlyChanged(n) {
				this.div.contentEditable = String(n != "nocursor");
			}),
			(yt.prototype.onContextMenu = () => {}),
			(yt.prototype.resetPosition = () => {}),
			(yt.prototype.needsContentAttribute = !0);
		function fv(n, i) {
			const a = lf(n, i.line);
			if (!a || a.hidden) {
				return ;
			}
			let l = Oe(n.doc, i.line),
				u = Hp(a, l, i.line),
				g = Ve(l, n.doc.direction),
				y = "left";
			if (g) {
				const x = ar(g, i.ch);
				y = x % 2 ? "right" : "left";
			}
			const S = Wp(u.map, i.ch, y);
			return (S.offset = S.collapse == "right" ? S.end : S.start), S;
		}
		function qS(n) {
			for (let i = n; i; i = i.parentNode) {
				if (/CodeMirror-gutter-wrapper/.test(i.className)) {
					return !0;
				}
			}
			return !1;
		}
		function as(n, i) {
			return i && (n.bad = !0), n;
		}
		function BS(n, i, a, l, u) {
			let g = "",
				y = !1,
				x = n.doc.lineSeparator(),
				S = !1;
			function _(j) {
				return (ne) => ne.id == j;
			}
			function $() {
				y && ((g += x), S && (g += x), (y = S = !1));
			}
			function D(j) {
				j && ($(), (g += j));
			}
			function K(j) {
				if (j.nodeType == 1) {
					const ne = j.getAttribute("cm-text");
					if (ne) {
						D(ne);
						return;
					}
					let ce = j.getAttribute("cm-marker"),
						ge;
					if (ce) {
						const we = n.findMarks(ee(l, 0), ee(u + 1, 0), _(+ce));
						we.length &&
							(ge = we[0].find(0)) &&
							D(Zr(n.doc, ge.from, ge.to).join(x));
						return;
					}
					if (j.getAttribute("contenteditable") == "false") {
						return;
					}
					const ke = /^(pre|div|p|li|table|br)$/i.test(j.nodeName);
					if (!/^br$/i.test(j.nodeName) && j.textContent.length === 0) {
						return;
					}
					ke && $();
					for (let xe = 0; xe < j.childNodes.length; xe++) {
						K(j.childNodes[xe]);
					}
					/^(pre|p)$/i.test(j.nodeName) && (S = !0), ke && (y = !0);
				} else {
					j.nodeType == 3 &&
						D(j.nodeValue.replaceAll(/\u200B/g, "").replaceAll(/\u00A0/g, " "));
				}
			}
			while ((K(i), i != a)) {
				(i = i.nextSibling), (S = !1);
			}
			return g;
		}
		function nc(n, i, a) {
			let l;
			if (i == n.display.lineDiv) {
				if (((l = n.display.lineDiv.childNodes[a]), !l)) {
					return as(n.clipPos(ee(n.display.viewTo - 1)), !0);
				}
				(i = undefined), (a = 0);
			} else {
				for (l = i; ; l = l.parentNode) {
					if (!l || l == n.display.lineDiv) {
						return ;
					}
					if (l.parentNode && l.parentNode == n.display.lineDiv) {
						break;
					}
				}
			}
			for (let u = 0; u < n.display.view.length; u++) {
				const g = n.display.view[u];
				if (g.node == l) {
					return WS(g, i, a);
				}
			}
		}
		function WS(n, i, a) {
			let l = n.text.firstChild,
				u = !1;
			if (!(i && ie(l, i))) {
				return as(ee(T(n.line), 0), !0);
			}
			if (i == l && ((u = !0), (i = l.childNodes[a]), (a = 0), !i)) {
				const g = n.rest ? ue(n.rest) : n.line;
				return as(ee(T(g), g.text.length), u);
			}
			let y = i.nodeType == 3 ? i : undefined,
				x = i;
			for (
				!y &&
				i.childNodes.length == 1 &&
				i.firstChild.nodeType == 3 &&
				((y = i.firstChild), a && (a = y.nodeValue.length));
				x.parentNode != l;
			) {
				x = x.parentNode;
			}
			const S = n.measure,
				_ = S.maps;
			function $(ge, we, ke) {
				for (let xe = -1; xe < (_ ? _.length : 0); xe++) {
					for (
						let Me = xe < 0 ? S.map : _[xe], Ie = 0;
						Ie < Me.length;
						Ie += 3
					) {
						const Re = Me[Ie + 2];
						if (Re == ge || Re == we) {
							let Qe = T(xe < 0 ? n.line : n.rest[xe]),
								St = Me[Ie] + ke;
							return (
								(ke < 0 || Re != ge) && (St = Me[Ie + (ke ? 1 : 0)]), ee(Qe, St)
							);
						}
					}
				}
			}
			let D = $(y, x, a);
			if (D) {
				return as(D, u);
			}
			for (
				let K = x.nextSibling, j = y ? y.nodeValue.length - a : 0;
				K;
				K = K.nextSibling
			) {
				if (((D = $(K, K.firstChild, 0)), D)) {
					return as(ee(D.line, D.ch - j), u);
				}
				j += K.textContent.length;
			}
			for (let ne = x.previousSibling, ce = a; ne; ne = ne.previousSibling) {
				if (((D = $(ne, ne.firstChild, -1)), D)) {
					return as(ee(D.line, D.ch + ce), u);
				}
				ce += ne.textContent.length;
			}
		}
		const zt = function zt(n) {
			(this.cm = n),
				(this.prevInput = ""),
				(this.pollingFast = !1),
				(this.polling = new $e()),
				(this.hasSelection = !1),
				(this.composing = undefined),
				(this.resetting = !1);
		};
		(zt.prototype.init = function init(n) {
			const a = this,
				l = this.cm;
			this.createField(n);
			const u = this.textarea;
			n.wrapper.insertBefore(this.wrapper, n.wrapper.firstChild),
				N && (u.style.width = "0px"),
				ze(u, "input", () => {
					h && p >= 9 && this.hasSelection && (this.hasSelection = undefined),
						a.poll();
				}),
				ze(u, "paste", (y) => {
					Nt(l, y) ||
						sv(y, l) ||
						((l.state.pasteIncoming = Date.now()), a.fastPoll());
				});
			function g(y) {
				if (!Nt(l, y)) {
					if (l.somethingSelected()) {
						tc({ lineWise: !1, text: l.getSelections() });
					} else if (l.options.lineWiseCopyCut) {
						const x = av(l);
						tc({ lineWise: !0, text: x.text }),
							y.type == "cut"
								? l.setSelections(x.ranges, undefined, H)
								: ((a.prevInput = ""),
									(u.value = x.text.join(`
`)),
									je(u));
					} else {
						return;
					}
					y.type == "cut" && (l.state.cutIncoming = Date.now());
				}
			}
			ze(u, "cut", g),
				ze(u, "copy", g),
				ze(n.scroller, "paste", (y) => {
					if (!(ei(n, y) || Nt(l, y))) {
						if (!u.dispatchEvent) {
							(l.state.pasteIncoming = Date.now()), a.focus();
							return;
						}
						const x = new Event("paste");
						(x.clipboardData = y.clipboardData), u.dispatchEvent(x);
					}
				}),
				ze(n.lineSpace, "selectstart", (y) => {
					ei(n, y) || rn(y);
				}),
				ze(u, "compositionstart", () => {
					const y = l.getCursor("from");
					a.composing && a.composing.range.clear(),
						(a.composing = {
							start: y,
							range: l.markText(y, l.getCursor("to"), {
								className: "CodeMirror-composing",
							}),
						});
				}),
				ze(u, "compositionend", () => {
					a.composing &&
						(a.poll(), a.composing.range.clear(), (a.composing = undefined));
				});
		}),
			(zt.prototype.createField = function createField(n) {
				(this.wrapper = cv()), (this.textarea = this.wrapper.firstChild);
				const i = this.cm.options;
				Hf(this.textarea, i.spellcheck, i.autocorrect, i.autocapitalize);
			}),
			(zt.prototype.screenReaderLabelChanged =
				function screenReaderLabelChanged(n) {
					n
						? this.textarea.setAttribute("aria-label", n)
						: this.textarea.removeAttribute("aria-label");
				}),
			(zt.prototype.prepareSelection = function prepareSelection() {
				const n = this.cm,
					i = n.display,
					a = n.doc,
					l = eg(n);
				if (n.options.moveInputWithCursor) {
					const u = gr(n, a.sel.primary().head, "div"),
						g = i.wrapper.getBoundingClientRect(),
						y = i.lineDiv.getBoundingClientRect();
					(l.teTop = Math.max(
						0,
						Math.min(i.wrapper.clientHeight - 10, u.top + y.top - g.top),
					)),
						(l.teLeft = Math.max(
							0,
							Math.min(i.wrapper.clientWidth - 10, u.left + y.left - g.left),
						));
				}
				return l;
			}),
			(zt.prototype.showSelection = function showSelection(n) {
				const i = this.cm,
					a = i.display;
				F(a.cursorDiv, n.cursors),
					F(a.selectionDiv, n.selection),
					n.teTop != undefined &&
						((this.wrapper.style.top = n.teTop + "px"),
						(this.wrapper.style.left = n.teLeft + "px"));
			}),
			(zt.prototype.reset = function reset(n) {
				if (!(this.contextMenuPending || (this.composing && n))) {
					const i = this.cm;
					if (((this.resetting = !0), i.somethingSelected())) {
						this.prevInput = "";
						const a = i.getSelection();
						(this.textarea.value = a),
							i.state.focused && je(this.textarea),
							h && p >= 9 && (this.hasSelection = a);
					} else {
						n ||
							((this.prevInput = this.textarea.value = ""),
							h && p >= 9 && (this.hasSelection = undefined));
					}
					this.resetting = !1;
				}
			}),
			(zt.prototype.getField = function getField() {
				return this.textarea;
			}),
			(zt.prototype.supportsTouch = () => !1),
			(zt.prototype.focus = function focus() {
				if (
					this.cm.options.readOnly != "nocursor" &&
					(!A || ye(Je(this.textarea)) != this.textarea)
				) {
					try {
						this.textarea.focus();
					} catch {}
				}
			}),
			(zt.prototype.blur = function blur() {
				this.textarea.blur();
			}),
			(zt.prototype.resetPosition = function resetPosition() {
				this.wrapper.style.top = this.wrapper.style.left = 0;
			}),
			(zt.prototype.receivedFocus = function receivedFocus() {
				this.slowPoll();
			}),
			(zt.prototype.slowPoll = function slowPoll() {
				this.pollingFast ||
					this.polling.set(this.cm.options.pollInterval, () => {
						this.poll(), this.cm.state.focused && this.slowPoll();
					});
			}),
			(zt.prototype.fastPoll = function fastPoll() {
				let n = !1,
					i = this;
				i.pollingFast = !0;
				function a() {
					const l = i.poll();
					l || n
						? ((i.pollingFast = !1), i.slowPoll())
						: ((n = !0), i.polling.set(60, a));
				}
				i.polling.set(20, a);
			}),
			(zt.prototype.poll = function poll() {
				let i = this.cm,
					a = this.textarea,
					l = this.prevInput;
				if (
					this.contextMenuPending ||
					this.resetting ||
					!i.state.focused ||
					(_i(a) && !l && !this.composing) ||
					i.isReadOnly() ||
					i.options.disableInput ||
					i.state.keySeq
				) {
					return !1;
				}
				const u = a.value;
				if (u == l && !i.somethingSelected()) {
					return !1;
				}
				if (
					(h && p >= 9 && this.hasSelection === u) ||
					(z && /[\uF700-\uF7FF]/.test(u))
				) {
					return i.display.input.reset(), !1;
				}
				if (i.doc.sel == i.display.selForContextMenu) {
					const g = u.codePointAt(0);
					if ((g == 8203 && !l && (l = "​"), g == 8666)) {
						return this.reset(), this.cm.execCommand("undo");
					}
				}
				for (
					var y = 0, x = Math.min(l.length, u.length);
					y < x && l.codePointAt(y) == u.codePointAt(y);
				) {
					++y;
				}
				return (
					On(i, () => {
						Ff(
							i,
							u.slice(y),
							l.length - y,
							undefined,
							this.composing ? "*compose" : undefined,
						),
							u.length > 1e3 ||
							u.indexOf(`
`) > -1
								? (a.value = this.prevInput = "")
								: (this.prevInput = u),
							this.composing &&
								(this.composing.range.clear(),
								(this.composing.range = i.markText(
									this.composing.start,
									i.getCursor("to"),
									{
										className: "CodeMirror-composing",
									},
								)));
					}),
					!0
				);
			}),
			(zt.prototype.ensurePolled = function ensurePolled() {
				this.pollingFast && this.poll() && (this.pollingFast = !1);
			}),
			(zt.prototype.onKeyPress = function onKeyPress() {
				h && p >= 9 && (this.hasSelection = undefined), this.fastPoll();
			}),
			(zt.prototype.onContextMenu = function onContextMenu(n) {
				const i = this,
					a = i.cm,
					l = a.display,
					u = i.textarea;
				i.contextMenuPending && i.contextMenuPending();
				const g = uo(a, n),
					y = l.scroller.scrollTop;
				if (!g || M) {
					return;
				}
				const x = a.options.resetSelectionOnContextMenu;
				x && a.doc.sel.contains(g) == -1 && Gt(a, on)(a.doc, Li(g), H);
				const S = u.style.cssText,
					_ = i.wrapper.style.cssText,
					$ = i.wrapper.offsetParent.getBoundingClientRect();
				(i.wrapper.style.cssText = "position: static"),
					(u.style.cssText =
						`position: absolute; width: 30px; height: 30px;
      top: ` +
						(n.clientY - $.top - 5) +
						"px; left: " +
						(n.clientX - $.left - 5) +
						`px;
      z-index: 1000; background: ` +
						(h ? "rgba(255, 255, 255, .05)" : "transparent") +
						`;
      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);`);
				let D;
				v && (D = u.ownerDocument.defaultView.scrollY),
					l.input.focus(),
					v && u.ownerDocument.defaultView.scrollTo(undefined, D),
					l.input.reset(),
					a.somethingSelected() || (u.value = i.prevInput = " "),
					(i.contextMenuPending = j),
					(l.selForContextMenu = a.doc.sel),
					clearTimeout(l.detectingSelectAll);
				function K() {
					if (u.selectionStart != undefined) {
						const ce = a.somethingSelected(),
							ge = "​" + (ce ? u.value : "");
						(u.value = "⇚"),
							(u.value = ge),
							(i.prevInput = ce ? "" : "​"),
							(u.selectionStart = 1),
							(u.selectionEnd = ge.length),
							(l.selForContextMenu = a.doc.sel);
					}
				}
				function j() {
					if (
						i.contextMenuPending == j &&
						((i.contextMenuPending = !1),
						(i.wrapper.style.cssText = _),
						(u.style.cssText = S),
						h && p < 9 && l.scrollbars.setScrollTop((l.scroller.scrollTop = y)),
						u.selectionStart != undefined)
					) {
						(!h || (h && p < 9)) && K();
						let ce = 0,
							ge = () => {
								l.selForContextMenu == a.doc.sel &&
								u.selectionStart == 0 &&
								u.selectionEnd > 0 &&
								i.prevInput == "​"
									? Gt(a, Mg)(a)
									: (ce++ < 10
										? (l.detectingSelectAll = setTimeout(ge, 500))
										: ((l.selForContextMenu = null), l.input.reset()));
							};
						l.detectingSelectAll = setTimeout(ge, 200);
					}
				}
				if ((h && p >= 9 && K(), G)) {
					xi(n);
					const ne = () => {
						nn(window, "mouseup", ne), setTimeout(j, 20);
					};
					ze(window, "mouseup", ne);
				} else {
					setTimeout(j, 50);
				}
			}),
			(zt.prototype.readOnlyChanged = function readOnlyChanged(n) {
				n || this.reset(),
					(this.textarea.disabled = n == "nocursor"),
					(this.textarea.readOnly = !!n);
			}),
			(zt.prototype.setUneditable = () => {}),
			(zt.prototype.needsContentAttribute = !1);
		function US(n, i) {
			if (
				((i = i ? ae(i) : {}),
				(i.value = n.value),
				!i.tabindex && n.tabIndex && (i.tabindex = n.tabIndex),
				!i.placeholder && n.placeholder && (i.placeholder = n.placeholder),
				i.autofocus == undefined)
			) {
				const a = ye(Je(n));
				i.autofocus =
					a == n ||
					(n.getAttribute("autofocus") != undefined && a == document.body);
			}
			function l() {
				n.value = x.getValue();
			}
			let u;
			if (n.form && (ze(n.form, "submit", l), !i.leaveSubmitMethodAlone)) {
				const g = n.form;
				u = g.submit;
				try {
					const y = (g.submit = () => {
						l(), (g.submit = u), g.submit(), (g.submit = y);
					});
				} catch {}
			}
			(i.finishInit = (S) => {
				(S.save = l),
					(S.getTextArea = () => n),
					(S.toTextArea = () => {
						(S.toTextArea = isNaN),
							l(),
							n.parentNode.removeChild(S.getWrapperElement()),
							(n.style.display = ""),
							n.form &&
								(nn(n.form, "submit", l),
								!i.leaveSubmitMethodAlone &&
									typeof n.form.submit === "function" &&
									(n.form.submit = u));
					});
			}),
				(n.style.display = "none");
			const x = Ct((S) => n.parentNode.insertBefore(S, n.nextSibling), i);
			return x;
		}
		function VS(n) {
			(n.off = nn),
				(n.on = ze),
				(n.wheelEventPixels = Jx),
				(n.Doc = wn),
				(n.splitLines = tr),
				(n.countColumn = de),
				(n.findColumn = le),
				(n.isWordChar = Be),
				(n.Pass = O),
				(n.signal = Mt),
				(n.Line = jo),
				(n.changeEnd = Ai),
				(n.scrollbarModel = sg),
				(n.Pos = ee),
				(n.cmpPos = Se),
				(n.modes = Ho),
				(n.mimeModes = dr),
				(n.resolveMode = qo),
				(n.getMode = Bo),
				(n.modeExtensions = ki),
				(n.extendMode = Wo),
				(n.copyState = Mr),
				(n.startState = Uo),
				(n.innerMode = js),
				(n.commands = vl),
				(n.keyMap = ni),
				(n.keyName = jg),
				(n.isModifierKey = Ug),
				(n.lookupKey = os),
				(n.normalizeKeyMap = wS),
				(n.StringStream = $t),
				(n.SharedTextMarker = hl),
				(n.TextMarker = Ni),
				(n.LineWidget = dl),
				(n.e_preventDefault = rn),
				(n.e_stopPropagation = Io),
				(n.e_stop = xi),
				(n.addClass = Ne),
				(n.contains = ie),
				(n.rmClass = Z),
				(n.keyNames = $i);
		}
		DS(Ct), HS(Ct);
		const jS = "iter insert remove copy getEditor constructor".split(" ");
		for (const rc in wn.prototype) {
			Object.hasOwn(wn.prototype, rc) &&
				Ee(jS, rc) < 0 &&
				(Ct.prototype[rc] = ((n) =>
					function () {
						return n.apply(this.doc, arguments);
					})(wn.prototype[rc]));
		}
		return (
			cr(wn),
			(Ct.inputStyles = { textarea: zt, contenteditable: yt }),
			(Ct.defineMode = function defineMode(n) {
				!Ct.defaults.mode && n != "null" && (Ct.defaults.mode = n),
					hr.apply(this, arguments);
			}),
			(Ct.defineMIME = lo),
			Ct.defineMode("null", () => ({
				token(n) {
					return n.skipToEnd();
				},
			})),
			Ct.defineMIME("text/plain", "null"),
			(Ct.defineExtension = (n, i) => {
				Ct.prototype[n] = i;
			}),
			(Ct.defineDocExtension = (n, i) => {
				wn.prototype[n] = i;
			}),
			(Ct.fromTextArea = US),
			VS(Ct),
			(Ct.version = "5.65.18"),
			Ct
		);
	});
})(Ww);
const Ws = Ww.exports;
const mue = gw(Ws);
const yue = { exports: {} };
((e, t) => {
	((r) => {
		r(Ws);
	})((r) => {
		r.defineMode("javascript", (o, s) => {
			const c = o.indentUnit,
				f = s.statementIndent,
				d = s.jsonld,
				h = s.json || d,
				p = s.trackScope !== !1,
				v = s.typescript,
				m = s.wordCharacters || /[\w$\u00A1-\uFFFF]/,
				b = (() => {
					function T(Vt) {
						return { type: Vt, style: "keyword" };
					}
					const R = T("keyword a"),
						se = T("keyword b"),
						pe = T("keyword c"),
						ee = T("keyword d"),
						Se = T("operator"),
						ft = { type: "atom", style: "atom" };
					return {
						if: T("if"),
						while: R,
						with: R,
						else: se,
						do: se,
						try: se,
						finally: se,
						return: ee,
						break: ee,
						continue: ee,
						new: T("new"),
						delete: pe,
						void: pe,
						throw: pe,
						debugger: T("debugger"),
						var: T("var"),
						const: T("var"),
						let: T("var"),
						function: T("function"),
						catch: T("catch"),
						for: T("for"),
						switch: T("switch"),
						case: T("case"),
						default: T("default"),
						in: Se,
						typeof: Se,
						instanceof: Se,
						true: ft,
						false: ft,
						null: ft,
						undefined: ft,
						NaN: ft,
						Infinity: ft,
						this: T("this"),
						class: T("class"),
						super: T("atom"),
						yield: pe,
						export: T("export"),
						import: T("import"),
						extends: pe,
						await: pe,
					};
				})(),
				w = /[+\-*&%=<>!?|~^@]/,
				M =
					/^@(context|id|value|language|type|container|list|set|reverse|index|base|vocab|graph)"/;
			function C(T) {
				for (let R = !1, se, pe = !1; (se = T.next()) != undefined; ) {
					if (!R) {
						if (se == "/" && !pe) {
							return;
						}
						se == "[" ? (pe = !0) : pe && se == "]" && (pe = !1);
					}
					R = !R && se == "\\";
				}
			}
			let E, L;
			function N(T, R, se) {
				return (E = T), (L = se), R;
			}
			function P(T, R) {
				const se = T.next();
				if (se == '"' || se == "'") {
					return (R.tokenize = A(se)), R.tokenize(T, R);
				}
				if (se == "." && T.match(/^\d[\d_]*(?:[eE][+-]?[\d_]+)?/)) {
					return N("number", "number");
				}
				if (se == "." && T.match("..")) {
					return N("spread", "meta");
				}
				if (/[[\]{}(),;:.]/.test(se)) {
					return N(se);
				}
				if (se == "=" && T.eat(">")) {
					return N("=>", "operator");
				}
				if (se == "0" && T.match(/^(?:x[\dA-Fa-f_]+|o[0-7_]+|b[01_]+)n?/)) {
					return N("number", "number");
				}
				if (/\d/.test(se)) {
					return (
						T.match(/^[\d_]*(?:n|(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?)?/),
						N("number", "number")
					);
				}
				if (se == "/") {
					return T.eat("*")
						? ((R.tokenize = z), z(T, R))
						: T.eat("/")
							? (T.skipToEnd(), N("comment", "comment"))
							: Un(T, R, 1)
								? (C(T),
									T.match(/^\b(([gimyus])(?![gimyus]*\2))+\b/),
									N("regexp", "string-2"))
								: (T.eat("="), N("operator", "operator", T.current()));
				}
				if (se == "`") {
					return (R.tokenize = W), W(T, R);
				}
				if (se == "#" && T.peek() == "!") {
					return T.skipToEnd(), N("meta", "meta");
				}
				if (se == "#" && T.eatWhile(m)) {
					return N("variable", "property");
				}
				if (
					(se == "<" && T.match("!--")) ||
					(se == "-" && T.match("->") && !/\S/.test(T.string.slice(0, T.start)))
				) {
					return T.skipToEnd(), N("comment", "comment");
				}
				if (w.test(se)) {
					return (
						(se != ">" || !R.lexical || R.lexical.type != ">") &&
							(T.eat("=")
								? (se == "!" || se == "=") && T.eat("=")
								: /[<>*+\-|&?]/.test(se) &&
									(T.eat(se), se == ">" && T.eat(se))),
						se == "?" && T.eat(".")
							? N(".")
							: N("operator", "operator", T.current())
					);
				}
				if (m.test(se)) {
					T.eatWhile(m);
					const pe = T.current();
					if (R.lastType != ".") {
						if (b.propertyIsEnumerable(pe)) {
							const ee = b[pe];
							return N(ee.type, ee.style, pe);
						}
						if (
							pe == "async" &&
							T.match(/^(\s|\/\*([^*]|\*(?!\/))*?\*\/)*[[(\w]/, !1)
						) {
							return N("async", "keyword", pe);
						}
					}
					return N("variable", "variable", pe);
				}
			}
			function A(T) {
				return (R, se) => {
					let pe = !1,
						ee;
					if (d && R.peek() == "@" && R.match(M)) {
						return (se.tokenize = P), N("jsonld-keyword", "meta");
					}
					while ((ee = R.next()) != undefined && !(ee == T && !pe)) {
						pe = !pe && ee == "\\";
					}
					return pe || (se.tokenize = P), N("string", "string");
				};
			}
			function z(T, R) {
				for (let se = !1, pe; (pe = T.next()); ) {
					if (pe == "/" && se) {
						R.tokenize = P;
						break;
					}
					se = pe == "*";
				}
				return N("comment", "comment");
			}
			function W(T, R) {
				for (let se = !1, pe; (pe = T.next()) != undefined; ) {
					if (!se && (pe == "`" || (pe == "$" && T.eat("{")))) {
						R.tokenize = P;
						break;
					}
					se = !se && pe == "\\";
				}
				return N("quasi", "string-2", T.current());
			}
			const U = "([{}])";
			function re(T, R) {
				R.fatArrowAt && (R.fatArrowAt = undefined);
				let se = T.string.indexOf("=>", T.start);
				if (!(se < 0)) {
					if (v) {
						const pe = /:\s*(?:\w+(?:<[^>]*>|\[\])?|\{[^}]*\})\s*$/.exec(
							T.string.slice(T.start, se),
						);
						pe && (se = pe.index);
					}
					for (var ee = 0, Se = !1, ft = se - 1; ft >= 0; --ft) {
						const Vt = T.string.charAt(ft),
							yn = U.indexOf(Vt);
						if (yn >= 0 && yn < 3) {
							if (!ee) {
								++ft;
								break;
							}
							if (--ee == 0) {
								Vt == "(" && (Se = !0);
								break;
							}
						} else if (yn >= 3 && yn < 6) {
							++ee;
						} else if (m.test(Vt)) {
							Se = !0;
						} else if (/["'/`]/.test(Vt)) {
							for (; ; --ft) {
								if (ft == 0) {
									return;
								}
								const Vo = T.string.charAt(ft - 1);
								if (Vo == Vt && T.string.charAt(ft - 2) != "\\") {
									ft--;
									break;
								}
							}
						} else if (Se && !ee) {
							++ft;
							break;
						}
					}
					Se && !ee && (R.fatArrowAt = ft);
				}
			}
			const Q = {
				atom: !0,
				number: !0,
				variable: !0,
				string: !0,
				regexp: !0,
				this: !0,
				import: !0,
				"jsonld-keyword": !0,
			};
			function G(T, R, se, pe, ee, Se) {
				(this.indented = T),
					(this.column = R),
					(this.type = se),
					(this.prev = ee),
					(this.info = Se),
					pe != undefined && (this.align = pe);
			}
			function te(T, R) {
				if (!p) {
					return !1;
				}
				for (var se = T.localVars; se; se = se.next) {
					if (se.name == R) {return !0;}
				}
				for (let pe = T.context; pe; pe = pe.prev) {
					for (var se = pe.vars; se; se = se.next) {
						if (se.name == R) {return !0;}
					}
				}
			}
			function Z(T, R, se, pe, ee) {
				const Se = T.cc;
				for (
					q.state = T,
						q.stream = ee,
						q.marked = undefined,
						q.cc = Se,
						q.style = R,
						Object.hasOwn(T.lexical, "align") || (T.lexical.align = !0);
					;
				) {
					const ft = Se.length > 0 ? Se.pop() : (h ? Ee : de);
					if (ft(se, pe)) {
						while (Se.length > 0 && Se[Se.length - 1].lex) {
							Se.pop()();
						}
						return q.marked
							? q.marked
							: (se == "variable" && te(T, pe)
								? "variable-2"
								: R);
					}
				}
			}
			const q = {
				state: undefined,
				column: undefined,
				marked: undefined,
				cc: undefined,
			};
			function F() {
				for (let T = arguments.length - 1; T >= 0; T--) {
					q.cc.push(arguments[T]);
				}
			}
			function k() {
				return F.apply(undefined, arguments), !0;
			}
			function B(T, R) {
				for (let se = R; se; se = se.next) {
					if (se.name == T) {return !0;}
				}
				return !1;
			}
			function V(T) {
				const R = q.state;
				if (((q.marked = "def"), !!p)) {
					if (R.context) {
						if (R.lexical.info == "var" && R.context && R.context.block) {
							const se = ie(T, R.context);
							if (se != undefined) {
								R.context = se;
								return;
							}
						} else if (!B(T, R.localVars)) {
							R.localVars = new Ue(T, R.localVars);
							return;
						}
					}
					s.globalVars &&
						!B(T, R.globalVars) &&
						(R.globalVars = new Ue(T, R.globalVars));
				}
			}
			function ie(T, R) {
				if (R) {
					if (R.block) {
						const se = ie(T, R.prev);
						return se ? (se == R.prev ? R : new Ne(se, R.vars, !0)) : undefined;
					}
					return B(T, R.vars) ? R : new Ne(R.prev, new Ue(T, R.vars), !1);
				}
				return;
			}
			function ye(T) {
				return (
					T == "public" ||
					T == "private" ||
					T == "protected" ||
					T == "abstract" ||
					T == "readonly"
				);
			}
			function Ne(T, R, se) {
				(this.prev = T), (this.vars = R), (this.block = se);
			}
			function Ue(T, R) {
				(this.name = T), (this.next = R);
			}
			const je = new Ue("this", new Ue("arguments", undefined));
			function it() {
				(q.state.context = new Ne(q.state.context, q.state.localVars, !1)),
					(q.state.localVars = je);
			}
			function tt() {
				(q.state.context = new Ne(q.state.context, q.state.localVars, !0)),
					(q.state.localVars = undefined);
			}
			it.lex = tt.lex = !0;
			function Je() {
				(q.state.localVars = q.state.context.vars),
					(q.state.context = q.state.context.prev);
			}
			Je.lex = !0;
			function Ae(T, R) {
				const se = () => {
					let pe = q.state,
						ee = pe.indented;
					if (pe.lexical.type == "stat") {
						ee = pe.lexical.indented;
					} else {
						for (
							let Se = pe.lexical;
							Se && Se.type == ")" && Se.align;
							Se = Se.prev
						) {
							ee = Se.indented;
						}
					}
					pe.lexical = new G(
						ee,
						q.stream.column(),
						T,
						undefined,
						pe.lexical,
						R,
					);
				};
				return (se.lex = !0), se;
			}
			function X() {
				const T = q.state;
				T.lexical.prev &&
					(T.lexical.type == ")" && (T.indented = T.lexical.indented),
					(T.lexical = T.lexical.prev));
			}
			X.lex = !0;
			function ae(T) {
				function R(se) {
					return se == T
						? k()
						: (T == ";" || se == "}" || se == ")" || se == "]"
							? F()
							: k(R));
				}
				return R;
			}
			function de(T, R) {
				return T == "var"
					? k(Ae("vardef", R), Io, ae(";"), X)
					: T == "keyword a"
						? k(Ae("form"), O, de, X)
						: T == "keyword b"
							? k(Ae("form"), de, X)
							: T == "keyword d"
								? q.stream.match(/^\s*$/, !1)
									? k()
									: k(Ae("stat"), J, ae(";"), X)
								: T == "debugger"
									? k(ae(";"))
									: T == "{"
										? k(Ae("}"), tt, Rt, X, Je)
										: T == ";"
											? k()
											: T == "if"
												? (q.state.lexical.info == "else" &&
														q.state.cc[q.state.cc.length - 1] == X &&
														q.state.cc.pop()(),
													k(Ae("form"), O, de, X, Fo))
												: T == "function"
													? k(tr)
													: T == "for"
														? k(Ae("form"), tt, Ca, de, Je, X)
														: T == "class" || (v && R == "interface")
															? ((q.marked = "keyword"),
																k(Ae("form", T == "class" ? T : R), Ho, X))
															: T == "variable"
																? v && R == "declare"
																	? ((q.marked = "keyword"), k(de))
																	: v &&
																			(R == "module" ||
																				R == "enum" ||
																				R == "type") &&
																			q.stream.match(/^\s*\w/, !1)
																		? ((q.marked = "keyword"),
																			R == "enum"
																				? k(Oe)
																				: (R == "type"
																					? k(Ea, ae("operator"), Ve, ae(";"))
																					: k(
																							Ae("form"),
																							mn,
																							ae("{"),
																							Ae("}"),
																							Rt,
																							X,
																							X,
																						)))
																		: v && R == "namespace"
																			? ((q.marked = "keyword"),
																				k(Ae("form"), Ee, de, X))
																			: v && R == "abstract"
																				? ((q.marked = "keyword"), k(de))
																				: k(Ae("stat"), De)
																: T == "switch"
																	? k(
																			Ae("form"),
																			O,
																			ae("{"),
																			Ae("}", "switch"),
																			tt,
																			Rt,
																			X,
																			X,
																			Je,
																		)
																	: T == "case"
																		? k(Ee, ae(":"))
																		: T == "default"
																			? k(ae(":"))
																			: T == "catch"
																				? k(Ae("form"), it, $e, de, X, Je)
																				: T == "export"
																					? k(Ae("stat"), qo, X)
																					: T == "import"
																						? k(Ae("stat"), ki, X)
																						: T == "async"
																							? k(de)
																							: R == "@"
																								? k(Ee, de)
																								: F(Ae("stat"), Ee, ae(";"), X);
			}
			function $e(T) {
				if (T == "(") {
					return k(fr, ae(")"));
				}
			}
			function Ee(T, R) {
				return H(T, R, !1);
			}
			function Ze(T, R) {
				return H(T, R, !0);
			}
			function O(T) {
				return T != "(" ? F() : k(Ae(")"), J, ae(")"), X);
			}
			function H(T, R, se) {
				if (q.state.fatArrowAt == q.stream.start) {
					const pe = se ? be : ue;
					if (T == "(") {
						return k(it, Ae(")"), lt(fr, ")"), X, ae("=>"), pe, Je);
					}
					if (T == "variable") {
						return F(it, mn, ae("=>"), pe, Je);
					}
				}
				const ee = se ? le : fe;
				return Object.hasOwn(Q, T)
					? k(ee)
					: T == "function"
						? k(tr, ee)
						: T == "class" || (v && R == "interface")
							? ((q.marked = "keyword"), k(Ae("form"), Xu, X))
							: T == "keyword c" || T == "async"
								? k(se ? Ze : Ee)
								: T == "("
									? k(Ae(")"), J, ae(")"), X, ee)
									: T == "operator" || T == "spread"
										? k(se ? Ze : Ee)
										: T == "["
											? k(Ae("]"), $t, X, ee)
											: T == "{"
												? Tt(Xe, "}", undefined, ee)
												: T == "quasi"
													? F(he, ee)
													: T == "new"
														? k(ve(se))
														: k();
			}
			function J(T) {
				return /[;})\],]/.test(T) ? F() : F(Ee);
			}
			function fe(T, R) {
				return T == "," ? k(J) : le(T, R, !1);
			}
			function le(T, R, se) {
				const pe = se == !1 ? fe : le,
					ee = se == !1 ? Ee : Ze;
				if (T == "=>") {
					return k(it, se ? be : ue, Je);
				}
				if (T == "operator") {
					return /\+\+|--/.test(R) || (v && R == "!")
						? k(pe)
						: v && R == "<" && q.stream.match(/^([^<>]|<[^<>]*>)*>\s*\(/, !1)
							? k(Ae(">"), lt(Ve, ">"), X, pe)
							: R == "?"
								? k(Ee, ae(":"), ee)
								: k(ee);
				}
				if (T == "quasi") {
					return F(he, pe);
				}
				if (T != ";") {
					if (T == "(") {
						return Tt(Ze, ")", "call", pe);
					}
					if (T == ".") {
						return k(Be, pe);
					}
					if (T == "[") {
						return k(Ae("]"), J, ae("]"), X, pe);
					}
					if (v && R == "as") {
						return (q.marked = "keyword"), k(Ve, pe);
					}
					if (T == "regexp") {
						return (
							(q.state.lastType = q.marked = "operator"),
							q.stream.backUp(q.stream.pos - q.stream.start - 1),
							k(ee)
						);
					}
				}
			}
			function he(T, R) {
				return T != "quasi"
					? F()
					: (R.slice(R.length - 2) != "${"
						? k(he)
						: k(J, _e));
			}
			function _e(T) {
				if (T == "}") {
					return (q.marked = "string-2"), (q.state.tokenize = W), k(he);
				}
			}
			function ue(T) {
				return re(q.stream, q.state), F(T == "{" ? de : Ee);
			}
			function be(T) {
				return re(q.stream, q.state), F(T == "{" ? de : Ze);
			}
			function ve(T) {
				return (R) =>
					R == "."
						? k(T ? Le : qe)
						: (R == "variable" && v
							? k(Pn, T ? le : fe)
							: F(T ? Ze : Ee));
			}
			function qe(T, R) {
				if (R == "target") {
					return (q.marked = "keyword"), k(fe);
				}
			}
			function Le(T, R) {
				if (R == "target") {
					return (q.marked = "keyword"), k(le);
				}
			}
			function De(T) {
				return T == ":" ? k(X, de) : F(fe, ae(";"), X);
			}
			function Be(T) {
				if (T == "variable") {
					return (q.marked = "property"), k();
				}
			}
			function Xe(T, R) {
				if (T == "async") {
					return (q.marked = "property"), k(Xe);
				}
				if (T == "variable" || q.style == "keyword") {
					if (((q.marked = "property"), R == "get" || R == "set")) {
						return k(gt);
					}
					let se;
					return (
						v &&
							q.state.fatArrowAt == q.stream.start &&
							(se = q.stream.match(/^\s*:\s*/, !1)) &&
							(q.state.fatArrowAt = q.stream.pos + se[0].length),
						k(nt)
					);
				}
				if (T == "number" || T == "string") {
					return (q.marked = d ? "property" : q.style + " property"), k(nt);
				}
				if (T == "jsonld-keyword") {
					return k(nt);
				}
				if (v && ye(R)) {
					return (q.marked = "keyword"), k(Xe);
				}
				if (T == "[") {
					return k(Ee, Dt, ae("]"), nt);
				}
				if (T == "spread") {
					return k(Ze, nt);
				}
				if (R == "*") {
					return (q.marked = "keyword"), k(Xe);
				}
				if (T == ":") {
					return F(nt);
				}
			}
			function gt(T) {
				return T != "variable" ? F(nt) : ((q.marked = "property"), k(tr));
			}
			function nt(T) {
				if (T == ":") {
					return k(Ze);
				}
				if (T == "(") {
					return F(tr);
				}
			}
			function lt(T, R, se) {
				function pe(ee, Se) {
					if (se ? se.indexOf(ee) > -1 : ee == ",") {
						const ft = q.state.lexical;
						return (
							ft.info == "call" && (ft.pos = (ft.pos || 0) + 1),
							k((Vt, yn) => (Vt == R || yn == R ? F() : F(T)), pe)
						);
					}
					return ee == R || Se == R
						? k()
						: (se && se.indexOf(";") > -1
							? F(T)
							: k(ae(R)));
				}
				return (ee, Se) => (ee == R || Se == R ? k() : F(T, pe));
			}
			function Tt(T, R, se) {
				for (let pe = 3; pe < arguments.length; pe++) {
					q.cc.push(arguments[pe]);
				}
				return k(Ae(R, se), lt(T, R), X);
			}
			function Rt(T) {
				return T == "}" ? k() : F(de, Rt);
			}
			function Dt(T, R) {
				if (v) {
					if (T == ":") {
						return k(Ve);
					}
					if (R == "?") {
						return k(Dt);
					}
				}
			}
			function Wn(T, R) {
				if (v && (T == ":" || R == "in")) {
					return k(Ve);
				}
			}
			function ar(T) {
				if (v && T == ":") {
					return q.stream.match(/^\s*\w+\s+is\b/, !1) ? k(Ee, tn, Ve) : k(Ve);
				}
			}
			function tn(T, R) {
				if (R == "is") {
					return (q.marked = "keyword"), k();
				}
			}
			function Ve(T, R) {
				if (R == "keyof" || R == "typeof" || R == "infer" || R == "readonly") {
					return (q.marked = "keyword"), k(R == "typeof" ? Ze : Ve);
				}
				if (T == "variable" || R == "void") {
					return (q.marked = "type"), k(er);
				}
				if (R == "|" || R == "&") {
					return k(Ve);
				}
				if (T == "string" || T == "number" || T == "atom") {
					return k(er);
				}
				if (T == "[") {
					return k(Ae("]"), lt(Ve, "]", ","), X, er);
				}
				if (T == "{") {
					return k(Ae("}"), ze, X, er);
				}
				if (T == "(") {
					return k(lt(Nt, ")"), so, er);
				}
				if (T == "<") {
					return k(lt(Ve, ">"), Ve);
				}
				if (T == "quasi") {
					return F(nn, er);
				}
			}
			function so(T) {
				if (T == "=>") {
					return k(Ve);
				}
			}
			function ze(T) {
				return /[})\]]/.test(T)
					? k()
					: (T == "," || T == ";"
						? k(ze)
						: F(Yr, ze));
			}
			function Yr(T, R) {
				if (T == "variable" || q.style == "keyword") {
					return (q.marked = "property"), k(Yr);
				}
				if (R == "?" || T == "number" || T == "string") {
					return k(Yr);
				}
				if (T == ":") {
					return k(Ve);
				}
				if (T == "[") {
					return k(ae("variable"), Wn, ae("]"), Yr);
				}
				if (T == "(") {
					return F(_i, Yr);
				}
				if (!/[;})\],]/.test(T)) {
					return k();
				}
			}
			function nn(T, R) {
				return T != "quasi"
					? F()
					: (R.slice(R.length - 2) != "${"
						? k(nn)
						: k(Ve, Mt));
			}
			function Mt(T) {
				if (T == "}") {
					return (q.marked = "string-2"), (q.state.tokenize = W), k(nn);
				}
			}
			function Nt(T, R) {
				return (T == "variable" && q.stream.match(/^\s*[?:]/, !1)) || R == "?"
					? k(Nt)
					: T == ":"
						? k(Ve)
						: T == "spread"
							? k(Nt)
							: F(Ve);
			}
			function er(T, R) {
				if (R == "<") {
					return k(Ae(">"), lt(Ve, ">"), X, er);
				}
				if (R == "|" || T == "." || R == "&") {
					return k(Ve);
				}
				if (T == "[") {
					return k(Ve, ae("]"), er);
				}
				if (R == "extends" || R == "implements") {
					return (q.marked = "keyword"), k(Ve);
				}
				if (R == "?") {
					return k(Ve, ae(":"), Ve);
				}
			}
			function Pn(T, R) {
				if (R == "<") {
					return k(Ae(">"), lt(Ve, ">"), X, er);
				}
			}
			function cr() {
				return F(Ve, rn);
			}
			function rn(T, R) {
				if (R == "=") {
					return k(Ve);
				}
			}
			function Io(T, R) {
				return R == "enum"
					? ((q.marked = "keyword"), k(Oe))
					: F(mn, Dt, ur, Ku);
			}
			function mn(T, R) {
				if (v && ye(R)) {
					return (q.marked = "keyword"), k(mn);
				}
				if (T == "variable") {
					return V(R), k();
				}
				if (T == "spread") {
					return k(mn);
				}
				if (T == "[") {
					return Tt(Us, "]");
				}
				if (T == "{") {
					return Tt(xi, "}");
				}
			}
			function xi(T, R) {
				return T == "variable" && !q.stream.match(/^\s*:/, !1)
					? (V(R), k(ur))
					: (T == "variable" && (q.marked = "property"),
						T == "spread"
							? k(mn)
							: T == "}"
								? F()
								: T == "["
									? k(Ee, ae("]"), ae(":"), xi)
									: k(ae(":"), mn, ur));
			}
			function Us() {
				return F(mn, ur);
			}
			function ur(T, R) {
				if (R == "=") {
					return k(Ze);
				}
			}
			function Ku(T) {
				if (T == ",") {
					return k(Io);
				}
			}
			function Fo(T, R) {
				if (T == "keyword b" && R == "else") {
					return k(Ae("form", "else"), de, X);
				}
			}
			function Ca(T, R) {
				if (R == "await") {
					return k(Ca);
				}
				if (T == "(") {
					return k(Ae(")"), Vs, X);
				}
			}
			function Vs(T) {
				return T == "var" ? k(Io, Si) : (T == "variable" ? k(Si) : F(Si));
			}
			function Si(T, R) {
				return T == ")"
					? k()
					: T == ";"
						? k(Si)
						: R == "in" || R == "of"
							? ((q.marked = "keyword"), k(Ee, Si))
							: F(Ee, Si);
			}
			function tr(T, R) {
				if (R == "*") {
					return (q.marked = "keyword"), k(tr);
				}
				if (T == "variable") {
					return V(R), k(tr);
				}
				if (T == "(") {
					return k(it, Ae(")"), lt(fr, ")"), X, ar, de, Je);
				}
				if (v && R == "<") {
					return k(Ae(">"), lt(cr, ">"), X, tr);
				}
			}
			function _i(T, R) {
				if (R == "*") {
					return (q.marked = "keyword"), k(_i);
				}
				if (T == "variable") {
					return V(R), k(_i);
				}
				if (T == "(") {
					return k(it, Ae(")"), lt(fr, ")"), X, ar, Je);
				}
				if (v && R == "<") {
					return k(Ae(">"), lt(cr, ">"), X, _i);
				}
			}
			function Ea(T, R) {
				if (T == "keyword" || T == "variable") {
					return (q.marked = "type"), k(Ea);
				}
				if (R == "<") {
					return k(Ae(">"), lt(cr, ">"), X);
				}
			}
			function fr(T, R) {
				return (
					R == "@" && k(Ee, fr),
					T == "spread"
						? k(fr)
						: v && ye(R)
							? ((q.marked = "keyword"), k(fr))
							: v && T == "this"
								? k(Dt, ur)
								: F(mn, Dt, ur)
				);
			}
			function Xu(T, R) {
				return T == "variable" ? Ho(T, R) : dr(T, R);
			}
			function Ho(T, R) {
				if (T == "variable") {
					return V(R), k(dr);
				}
			}
			function dr(T, R) {
				if (R == "<") {
					return k(Ae(">"), lt(cr, ">"), X, dr);
				}
				if (R == "extends" || R == "implements" || (v && T == ",")) {
					return (
						R == "implements" && (q.marked = "keyword"), k(v ? Ve : Ee, dr)
					);
				}
				if (T == "{") {
					return k(Ae("}"), hr, X);
				}
			}
			function hr(T, R) {
				if (
					T == "async" ||
					(T == "variable" &&
						(R == "static" || R == "get" || R == "set" || (v && ye(R))) &&
						q.stream.match(/^\s+#?[\w$\u00A1-\uFFFF]/, !1))
				) {
					return (q.marked = "keyword"), k(hr);
				}
				if (T == "variable" || q.style == "keyword") {
					return (q.marked = "property"), k(lo, hr);
				}
				if (T == "number" || T == "string") {
					return k(lo, hr);
				}
				if (T == "[") {
					return k(Ee, Dt, ae("]"), lo, hr);
				}
				if (R == "*") {
					return (q.marked = "keyword"), k(hr);
				}
				if (v && T == "(") {
					return F(_i, hr);
				}
				if (T == ";" || T == ",") {
					return k(hr);
				}
				if (T == "}") {
					return k();
				}
				if (R == "@") {
					return k(Ee, hr);
				}
			}
			function lo(T, R) {
				if (R == "!" || R == "?") {
					return k(lo);
				}
				if (T == ":") {
					return k(Ve, ur);
				}
				if (R == "=") {
					return k(Ze);
				}
				const se = q.state.lexical.prev,
					pe = se && se.info == "interface";
				return F(pe ? _i : tr);
			}
			function qo(T, R) {
				return R == "*"
					? ((q.marked = "keyword"), k(Uo, ae(";")))
					: R == "default"
						? ((q.marked = "keyword"), k(Ee, ae(";")))
						: T == "{"
							? k(lt(Bo, "}"), Uo, ae(";"))
							: F(de);
			}
			function Bo(T, R) {
				if (R == "as") {
					return (q.marked = "keyword"), k(ae("variable"));
				}
				if (T == "variable") {
					return F(Ze, Bo);
				}
			}
			function ki(T) {
				return T == "string"
					? k()
					: T == "("
						? F(Ee)
						: T == "."
							? F(fe)
							: F(Wo, Mr, Uo);
			}
			function Wo(T, R) {
				return T == "{"
					? Tt(Wo, "}")
					: (T == "variable" && V(R),
						R == "*" && (q.marked = "keyword"),
						k(js));
			}
			function Mr(T) {
				if (T == ",") {
					return k(Wo, Mr);
				}
			}
			function js(T, R) {
				if (R == "as") {
					return (q.marked = "keyword"), k(Wo);
				}
			}
			function Uo(T, R) {
				if (R == "from") {
					return (q.marked = "keyword"), k(Ee);
				}
			}
			function $t(T) {
				return T == "]" ? k() : F(lt(Ze, "]"));
			}
			function Oe() {
				return F(Ae("form"), mn, ae("{"), Ae("}"), lt(Zr, "}"), X, X);
			}
			function Zr() {
				return F(mn, ur);
			}
			function Gs(T, R) {
				return (
					T.lastType == "operator" ||
					T.lastType == "," ||
					w.test(R.charAt(0)) ||
					/[,.]/.test(R.charAt(0))
				);
			}
			function Un(T, R, se) {
				return (
					(R.tokenize == P &&
						/^(?:operator|sof|keyword [bcd]|case|new|export|default|spread|[[{}(,;:]|=>)$/.test(
							R.lastType,
						)) ||
					(R.lastType == "quasi" &&
						/\{\s*$/.test(T.string.slice(0, T.pos - (se || 0))))
				);
			}
			return {
				startState(T) {
					const R = {
						tokenize: P,
						lastType: "sof",
						cc: [],
						lexical: new G((T || 0) - c, 0, "block", !1),
						localVars: s.localVars,
						context: s.localVars && new Ne(undefined, undefined, !1),
						indented: T || 0,
					};
					return (
						s.globalVars &&
							typeof s.globalVars === "object" &&
							(R.globalVars = s.globalVars),
						R
					);
				},
				token(T, R) {
					if (
						(T.sol() &&
							(Object.hasOwn(R.lexical, "align") || (R.lexical.align = !1),
							(R.indented = T.indentation()),
							re(T, R)),
						R.tokenize != z && T.eatSpace())
					) {
						return;
					}
					const se = R.tokenize(T, R);
					return E == "comment"
						? se
						: ((R.lastType =
								E == "operator" && (L == "++" || L == "--") ? "incdec" : E),
							Z(R, se, E, L, T));
				},
				indent(T, R) {
					if (T.tokenize == z || T.tokenize == W) {
						return r.Pass;
					}
					if (T.tokenize != P) {
						return 0;
					}
					let se = R && R.charAt(0),
						pe = T.lexical,
						ee;
					if (!/^\s*else\b/.test(R)) {
						for (let Se = T.cc.length - 1; Se >= 0; --Se) {
							const ft = T.cc[Se];
							if (ft == X) {
								pe = pe.prev;
							} else if (ft != Fo && ft != Je) {
								break;
							}
						}
					}
					while (
						(pe.type == "stat" || pe.type == "form") &&
						(se == "}" ||
							((ee = T.cc[T.cc.length - 1]) &&
								(ee == fe || ee == le) &&
								!/^[,.=+\-*:?[(]/.test(R)))
					) {
						pe = pe.prev;
					}
					f && pe.type == ")" && pe.prev.type == "stat" && (pe = pe.prev);
					const Vt = pe.type,
						yn = se == Vt;
					return Vt == "vardef"
						? pe.indented +
								(T.lastType == "operator" || T.lastType == ","
									? pe.info.length + 1
									: 0)
						: Vt == "form" && se == "{"
							? pe.indented
							: Vt == "form"
								? pe.indented + c
								: Vt == "stat"
									? pe.indented + (Gs(T, R) ? f || c : 0)
									: pe.info == "switch" && !yn && s.doubleIndentSwitch != !1
										? pe.indented + (/^(?:case|default)\b/.test(R) ? c : 2 * c)
										: pe.align
											? pe.column + (yn ? 0 : 1)
											: pe.indented + (yn ? 0 : c);
				},
				electricInput: /^\s*(?:case .*?:|default:|\{|\})$/,
				blockCommentStart: h ? undefined : "/*",
				blockCommentEnd: h ? undefined : "*/",
				blockCommentContinue: h ? undefined : " * ",
				lineComment: h ? undefined : "//",
				fold: "brace",
				closeBrackets: "()[]{}''\"\"``",
				helperType: h ? "json" : "javascript",
				jsonldMode: d,
				jsonMode: h,
				expressionAllowed: Un,
				skipExpression(T) {
					Z(T, "atom", "atom", "true", new r.StringStream("", 2, undefined));
				},
			};
		}),
			r.registerHelper("wordChars", "javascript", /[\w$]/),
			r.defineMIME("text/javascript", "javascript"),
			r.defineMIME("text/ecmascript", "javascript"),
			r.defineMIME("application/javascript", "javascript"),
			r.defineMIME("application/x-javascript", "javascript"),
			r.defineMIME("application/ecmascript", "javascript"),
			r.defineMIME("application/json", { name: "javascript", json: !0 }),
			r.defineMIME("application/x-json", { name: "javascript", json: !0 }),
			r.defineMIME("application/manifest+json", {
				name: "javascript",
				json: !0,
			}),
			r.defineMIME("application/ld+json", { name: "javascript", jsonld: !0 }),
			r.defineMIME("text/typescript", { name: "javascript", typescript: !0 }),
			r.defineMIME("application/typescript", {
				name: "javascript",
				typescript: !0,
			});
	});
})();
let bue = yue.exports,
	Bm = { exports: {} },
	Wm;
function Uw() {
	return (
		Wm ||
			((Wm = 1),
			((e, t) => {
				((r) => {
					r(Ws);
				})((r) => {
					const o = {
							autoSelfClosers: {
								area: !0,
								base: !0,
								br: !0,
								col: !0,
								command: !0,
								embed: !0,
								frame: !0,
								hr: !0,
								img: !0,
								input: !0,
								keygen: !0,
								link: !0,
								meta: !0,
								param: !0,
								source: !0,
								track: !0,
								wbr: !0,
								menuitem: !0,
							},
							implicitlyClosed: {
								dd: !0,
								li: !0,
								optgroup: !0,
								option: !0,
								p: !0,
								rp: !0,
								rt: !0,
								tbody: !0,
								td: !0,
								tfoot: !0,
								th: !0,
								tr: !0,
							},
							contextGrabbers: {
								dd: { dd: !0, dt: !0 },
								dt: { dd: !0, dt: !0 },
								li: { li: !0 },
								option: { option: !0, optgroup: !0 },
								optgroup: { optgroup: !0 },
								p: {
									address: !0,
									article: !0,
									aside: !0,
									blockquote: !0,
									dir: !0,
									div: !0,
									dl: !0,
									fieldset: !0,
									footer: !0,
									form: !0,
									h1: !0,
									h2: !0,
									h3: !0,
									h4: !0,
									h5: !0,
									h6: !0,
									header: !0,
									hgroup: !0,
									hr: !0,
									menu: !0,
									nav: !0,
									ol: !0,
									p: !0,
									pre: !0,
									section: !0,
									table: !0,
									ul: !0,
								},
								rp: { rp: !0, rt: !0 },
								rt: { rp: !0, rt: !0 },
								tbody: { tbody: !0, tfoot: !0 },
								td: { td: !0, th: !0 },
								tfoot: { tbody: !0 },
								th: { td: !0, th: !0 },
								thead: { tbody: !0, tfoot: !0 },
								tr: { tr: !0 },
							},
							doNotIndent: { pre: !0 },
							allowUnquoted: !0,
							allowMissing: !0,
							caseFold: !0,
						},
						s = {
							autoSelfClosers: {},
							implicitlyClosed: {},
							contextGrabbers: {},
							doNotIndent: {},
							allowUnquoted: !1,
							allowMissing: !1,
							allowMissingTagName: !1,
							caseFold: !1,
						};
					r.defineMode("xml", (c, f) => {
						const d = c.indentUnit,
							h = {},
							p = f.htmlMode ? o : s;
						for (var v in p) {
							h[v] = p[v];
						}
						for (var v in f) {
							h[v] = f[v];
						}
						let m, b;
						function w(k, B) {
							function V(Ne) {
								return (B.tokenize = Ne), Ne(k, B);
							}
							const ie = k.next();
							if (ie == "<") {
								return k.eat("!")
									? k.eat("[")
										? k.match("CDATA[")
											? V(E("atom", "]]>"))
											: undefined
										: k.match("--")
											? V(E("comment", "-->"))
											: k.match("DOCTYPE", !0, !0)
												? (k.eatWhile(/[\w._-]/), V(L(1)))
												: undefined
									: (k.eat("?")
										? (k.eatWhile(/[\w._-]/),
											(B.tokenize = E("meta", "?>")),
											"meta")
										: ((m = k.eat("/") ? "closeTag" : "openTag"),
											(B.tokenize = M),
											"tag bracket"));
							}
							if (ie == "&") {
								let ye;
								return (
									k.eat("#")
										? (k.eat("x")
											? (ye = k.eatWhile(/[a-fA-F\d]/) && k.eat(";"))
											: (ye = k.eatWhile(/[\d]/) && k.eat(";")))
										: (ye = k.eatWhile(/[\w.\-:]/) && k.eat(";")),
									ye ? "atom" : "error"
								);
							}
							return k.eatWhile(/[^&<]/), undefined;
						}
						w.isInText = !0;
						function M(k, B) {
							const V = k.next();
							if (V == ">" || (V == "/" && k.eat(">"))) {
								return (
									(B.tokenize = w),
									(m = V == ">" ? "endTag" : "selfcloseTag"),
									"tag bracket"
								);
							}
							if (V == "=") {
								return (m = "equals"), undefined;
							}
							if (V == "<") {
								(B.tokenize = w),
									(B.state = W),
									(B.tagName = B.tagStart = undefined);
								const ie = B.tokenize(k, B);
								return ie ? ie + " tag error" : "tag error";
							}
							return /['"]/.test(V)
								? ((B.tokenize = C(V)),
									(B.stringStartCol = k.column()),
									B.tokenize(k, B))
								: (k.match(/^[^\s\u00A0=<>"']*[^\s\u00A0=<>"'/]/), "word");
						}
						function C(k) {
							const B = (V, ie) => {
								while (!V.eol()) {
									if (V.next() == k) {
										ie.tokenize = M;
										break;
									}
								}
								return "string";
							};
							return (B.isInAttribute = !0), B;
						}
						function E(k, B) {
							return (V, ie) => {
								while (!V.eol()) {
									if (B.test(V)) {
										ie.tokenize = w;
										break;
									}
									V.next();
								}
								return k;
							};
						}
						function L(k) {
							return (B, V) => {
								for (let ie; (ie = B.next()) != undefined; ) {
									if (ie == "<") {
										return (V.tokenize = L(k + 1)), V.tokenize(B, V);
									}
									if (ie == ">") {
										if (k == 1) {
											V.tokenize = w;
											break;
										} else {
											return (V.tokenize = L(k - 1)), V.tokenize(B, V);
										}
									}
								}
								return "meta";
							};
						}
						function N(k) {
							return k && k.toLowerCase();
						}
						function P(k, B, V) {
							(this.prev = k.context),
								(this.tagName = B || ""),
								(this.indent = k.indented),
								(this.startOfLine = V),
								(Object.hasOwn(h.doNotIndent, B) ||
									(k.context && k.context.noIndent)) &&
									(this.noIndent = !0);
						}
						function A(k) {
							k.context && (k.context = k.context.prev);
						}
						function z(k, B) {
							for (let V; ; ) {
								if (
									!k.context ||
									((V = k.context.tagName),
									!(
										Object.hasOwn(h.contextGrabbers, N(V)) &&
										Object.hasOwn(h.contextGrabbers[N(V)], N(B))
									))
								) {
									return;
								}
								A(k);
							}
						}
						function W(k, B, V) {
							return k == "openTag"
								? ((V.tagStart = B.column()), U)
								: (k == "closeTag"
									? re
									: W);
						}
						function U(k, B, V) {
							return k == "word"
								? ((V.tagName = B.current()), (b = "tag"), te)
								: (h.allowMissingTagName && k == "endTag"
									? ((b = "tag bracket"), te(k, B, V))
									: ((b = "error"), U));
						}
						function re(k, B, V) {
							if (k == "word") {
								const ie = B.current();
								return (
									V.context &&
										V.context.tagName != ie &&
										Object.hasOwn(h.implicitlyClosed, N(V.context.tagName)) &&
										A(V),
									(V.context && V.context.tagName == ie) ||
									h.matchClosing === !1
										? ((b = "tag"), Q)
										: ((b = "tag error"), G)
								);
							}
							return h.allowMissingTagName && k == "endTag"
								? ((b = "tag bracket"), Q(k, B, V))
								: ((b = "error"), G);
						}
						function Q(k, B, V) {
							return k != "endTag" ? ((b = "error"), Q) : (A(V), W);
						}
						function G(k, B, V) {
							return (b = "error"), Q(k, B, V);
						}
						function te(k, B, V) {
							if (k == "word") {
								return (b = "attribute"), Z;
							}
							if (k == "endTag" || k == "selfcloseTag") {
								const ie = V.tagName,
									ye = V.tagStart;
								return (
									(V.tagName = V.tagStart = undefined),
									k == "selfcloseTag" || Object.hasOwn(h.autoSelfClosers, N(ie))
										? z(V, ie)
										: (z(V, ie), (V.context = new P(V, ie, ye == V.indented))),
									W
								);
							}
							return (b = "error"), te;
						}
						function Z(k, B, V) {
							return k == "equals"
								? q
								: (h.allowMissing || (b = "error"), te(k, B, V));
						}
						function q(k, B, V) {
							return k == "string"
								? F
								: (k == "word" && h.allowUnquoted
									? ((b = "string"), te)
									: ((b = "error"), te(k, B, V)));
						}
						function F(k, B, V) {
							return k == "string" ? F : te(k, B, V);
						}
						return {
							startState(k) {
								const B = {
									tokenize: w,
									state: W,
									indented: k || 0,
									tagName: undefined,
									tagStart: undefined,
									context: undefined,
								};
								return k != undefined && (B.baseIndent = k), B;
							},
							token(k, B) {
								if (
									(!B.tagName && k.sol() && (B.indented = k.indentation()),
									k.eatSpace())
								) {
									return ;
								}
								m = undefined;
								let V = B.tokenize(k, B);
								return (
									(V || m) &&
										V != "comment" &&
										((b = undefined),
										(B.state = B.state(m || V, k, B)),
										b && (V = b == "error" ? V + " error" : b)),
									V
								);
							},
							indent(k, B, V) {
								let ie = k.context;
								if (k.tokenize.isInAttribute) {
									return k.tagStart == k.indented
										? k.stringStartCol + 1
										: k.indented + d;
								}
								if (ie && ie.noIndent) {
									return r.Pass;
								}
								if (k.tokenize != M && k.tokenize != w) {
									return V ? V.match(/^(\s*)/)[0].length : 0;
								}
								if (k.tagName) {
									return h.multilineTagIndentPastTag !== !1
										? k.tagStart + k.tagName.length + 2
										: k.tagStart + d * (h.multilineTagIndentFactor || 1);
								}
								if (h.alignCDATA && /<!\[CDATA\[/.test(B)) {
									return 0;
								}
								const ye = B && /^<(\/)?([\w_:.-]*)/.exec(B);
								if (ye && ye[1]) {
									while (ie) {
										if (ie.tagName == ye[2]) {
											ie = ie.prev;
											break;
										} else if (
											Object.hasOwn(h.implicitlyClosed, N(ie.tagName))
										) {
											ie = ie.prev;
										} else {
											break;
										}
									}
								} else if (ye) {
									while (ie) {
										const Ne = h.contextGrabbers[N(ie.tagName)];
										if (Ne && Object.hasOwn(Ne, N(ye[2]))) {
											ie = ie.prev;
										} else {
											break;
										}
									}
								}
								while (ie && ie.prev && !ie.startOfLine) {
									ie = ie.prev;
								}
								return ie ? ie.indent + d : k.baseIndent || 0;
							},
							electricInput: /<\/[\s\w:]+>$/,
							blockCommentStart: "<!--",
							blockCommentEnd: "-->",
							configuration: h.htmlMode ? "html" : "xml",
							helperType: h.htmlMode ? "html" : "xml",
							skipAttribute(k) {
								k.state == q && (k.state = te);
							},
							xmlCurrentTag(k) {
								return k.tagName
									? { name: k.tagName, close: k.type == "closeTag" }
									: undefined;
							},
							xmlCurrentContext(k) {
								for (var B = [], V = k.context; V; V = V.prev) {
									B.push(V.tagName);
								}
								return B.reverse();
							},
						};
					}),
						r.defineMIME("text/xml", "xml"),
						r.defineMIME("application/xml", "xml"),
						Object.hasOwn(r.mimeModes, "text/html") ||
							r.defineMIME("text/html", { name: "xml", htmlMode: !0 });
				});
			})()),
		Bm.exports
	);
}
Uw();
((e, t) => {
	((r) => {
		r(Ws, Uw(), bue);
	})((r) => {
		function o(c, f, d, h) {
			(this.state = c), (this.mode = f), (this.depth = d), (this.prev = h);
		}
		function s(c) {
			return new o(
				r.copyState(c.mode, c.state),
				c.mode,
				c.depth,
				c.prev && s(c.prev),
			);
		}
		r.defineMode(
			"jsx",
			(c, f) => {
				const d = r.getMode(c, {
						name: "xml",
						allowMissing: !0,
						multilineTagIndentPastTag: !1,
						allowMissingTagName: !0,
					}),
					h = r.getMode(c, (f && f.base) || "javascript");
				function p(w) {
					const M = w.tagName;
					w.tagName = undefined;
					const C = d.indent(w, "", "");
					return (w.tagName = M), C;
				}
				function v(w, M) {
					return M.context.mode == d ? m(w, M, M.context) : b(w, M, M.context);
				}
				function m(w, M, C) {
					if (C.depth == 2) {
						return (
							/^.*?\*\//.test(w) ? (C.depth = 1) : w.skipToEnd(), "comment"
						);
					}
					if (w.peek() == "{") {
						d.skipAttribute(C.state);
						let E = p(C.state),
							L = C.state.context;
						if (L && w.match(/^[^>]*>\s*$/, !1)) {
							while (L.prev && !L.startOfLine) {
								L = L.prev;
							}
							L.startOfLine
								? (E -= c.indentUnit)
								: C.prev.state.lexical && (E = C.prev.state.lexical.indented);
						} else {
							C.depth == 1 && (E += c.indentUnit);
						}
						return (
							(M.context = new o(r.startState(h, E), h, 0, M.context)),
							undefined
						);
					}
					if (C.depth == 1) {
						if (w.peek() == "<") {
							return (
								d.skipAttribute(C.state),
								(M.context = new o(
									r.startState(d, p(C.state)),
									d,
									0,
									M.context,
								)),
								undefined
							);
						}
						if (w.match("//")) {
							return w.skipToEnd(), "comment";
						}
						if (w.match("/*")) {
							return (C.depth = 2), v(w, M);
						}
					}
					let N = d.token(w, C.state),
						P = w.current(),
						A;
					return (
						/\btag\b/.test(N)
							? P.endsWith(">")
								? C.state.context
									? (C.depth = 0)
									: (M.context = M.context.prev)
								: P.startsWith("<") && (C.depth = 1)
							: !N && (A = P.indexOf("{")) > -1 && w.backUp(P.length - A),
						N
					);
				}
				function b(w, M, C) {
					if (
						w.peek() == "<" &&
						!w.match(/^<([^<>]|<[^>]*>)+,\s*>/, !1) &&
						h.expressionAllowed(w, C.state)
					) {
						return (
							(M.context = new o(
								r.startState(d, h.indent(C.state, "", "")),
								d,
								0,
								M.context,
							)),
							h.skipExpression(C.state),
							undefined
						);
					}
					const E = h.token(w, C.state);
					if (!E && C.depth != undefined) {
						const L = w.current();
						L == "{"
							? C.depth++
							: L == "}" && --C.depth == 0 && (M.context = M.context.prev);
					}
					return E;
				}
				return {
					startState() {
						return { context: new o(r.startState(h), h) };
					},
					copyState(w) {
						return { context: s(w.context) };
					},
					token: v,
					indent(w, M, C) {
						return w.context.mode.indent(w.context.state, M, C);
					},
					innerMode(w) {
						return w.context;
					},
				};
			},
			"xml",
			"javascript",
		),
			r.defineMIME("text/jsx", "jsx"),
			r.defineMIME("text/typescript-jsx", {
				name: "jsx",
				base: { name: "javascript", typescript: !0 },
			});
	});
})();
((e, t) => {
	((r) => {
		r(Ws);
	})((r) => {
		r.defineOption("placeholder", "", (p, v, m) => {
			const b = m && m != r.Init;
			if (v && !b) {
				p.on("blur", f),
					p.on("change", d),
					p.on("swapDoc", d),
					r.on(
						p.getInputField(),
						"compositionupdate",
						(p.state.placeholderCompose = () => {
							c(p);
						}),
					),
					d(p);
			} else if (!v && b) {
				p.off("blur", f),
					p.off("change", d),
					p.off("swapDoc", d),
					r.off(
						p.getInputField(),
						"compositionupdate",
						p.state.placeholderCompose,
					),
					o(p);
				const w = p.getWrapperElement();
				w.className = w.className.replace(" CodeMirror-empty", "");
			}
			v && !p.hasFocus() && f(p);
		});
		function o(p) {
			p.state.placeholder &&
				(p.state.placeholder.parentNode.removeChild(p.state.placeholder),
				(p.state.placeholder = undefined));
		}
		function s(p) {
			o(p);
			const v = (p.state.placeholder = document.createElement("pre"));
			(v.style.cssText = "height: 0; overflow: visible"),
				(v.style.direction = p.getOption("direction")),
				(v.className = "CodeMirror-placeholder CodeMirror-line-like");
			let m = p.getOption("placeholder");
			typeof m === "string" && (m = document.createTextNode(m)),
				v.append(m),
				p.display.lineSpace.insertBefore(v, p.display.lineSpace.firstChild);
		}
		function c(p) {
			setTimeout(() => {
				let v = !1;
				if (p.lineCount() == 1) {
					const m = p.getInputField();
					v =
						m.nodeName == "TEXTAREA"
							? p.getLine(0).length === 0
							: !/[^\u200B]/.test(
									m.querySelector(".CodeMirror-line").textContent,
								);
				}
				v ? s(p) : o(p);
			}, 20);
		}
		function f(p) {
			h(p) && s(p);
		}
		function d(p) {
			const v = p.getWrapperElement(),
				m = h(p);
			(v.className =
				v.className.replace(" CodeMirror-empty", "") +
				(m ? " CodeMirror-empty" : "")),
				m ? s(p) : o(p);
		}
		function h(p) {
			return p.lineCount() === 1 && p.getLine(0) === "";
		}
	});
})();
((e, t) => {
	((r) => {
		r(Ws);
	})((r) => {
		function o(f, d, h) {
			(this.orientation = d),
				(this.scroll = h),
				(this.screen = this.total = this.size = 1),
				(this.pos = 0),
				(this.node = document.createElement("div")),
				(this.node.className = f + "-" + d),
				(this.inner = this.node.append(document.createElement("div")));
			const p = this;
			r.on(this.inner, "mousedown", (m) => {
				if (m.which != 1) {
					return;
				}
				r.e_preventDefault(m);
				const b = p.orientation == "horizontal" ? "pageX" : "pageY",
					w = m[b],
					M = p.pos;
				function C() {
					r.off(document, "mousemove", E), r.off(document, "mouseup", C);
				}
				function E(L) {
					if (L.which != 1) {
						return C();
					}
					p.moveTo(M + (L[b] - w) * (p.total / p.size));
				}
				r.on(document, "mousemove", E), r.on(document, "mouseup", C);
			}),
				r.on(this.node, "click", (m) => {
					r.e_preventDefault(m);
					let b = p.inner.getBoundingClientRect(),
						w;
					p.orientation == "horizontal"
						? (w = m.clientX < b.left ? -1 : (m.clientX > b.right ? 1 : 0))
						: (w = m.clientY < b.top ? -1 : (m.clientY > b.bottom ? 1 : 0)),
						p.moveTo(p.pos + w * p.screen);
				});
			function v(m) {
				const b =
						r.wheelEventPixels(m)[p.orientation == "horizontal" ? "x" : "y"],
					w = p.pos;
				p.moveTo(p.pos + b), p.pos != w && r.e_preventDefault(m);
			}
			r.on(this.node, "mousewheel", v), r.on(this.node, "DOMMouseScroll", v);
		}
		(o.prototype.setPos = function setPos(f, d) {
			return (
				f < 0 && (f = 0),
				f > this.total - this.screen && (f = this.total - this.screen),
				!d && f == this.pos
					? !1
					: ((this.pos = f),
						(this.inner.style[
							this.orientation == "horizontal" ? "left" : "top"
						] = f * (this.size / this.total) + "px"),
						!0)
			);
		}),
			(o.prototype.moveTo = function moveTo(f) {
				this.setPos(f) && this.scroll(f, this.orientation);
			});
		const s = 10;
		o.prototype.update = function update(f, d, h) {
			const p = this.screen != d || this.total != f || this.size != h;
			p && ((this.screen = d), (this.total = f), (this.size = h));
			let v = this.screen * (this.size / this.total);
			v < s && ((this.size -= s - v), (v = s)),
				(this.inner.style[
					this.orientation == "horizontal" ? "width" : "height"
				] = v + "px"),
				this.setPos(this.pos, p);
		};
		function c(f, d, h) {
			(this.addClass = f),
				(this.horiz = new o(f, "horizontal", h)),
				d(this.horiz.node),
				(this.vert = new o(f, "vertical", h)),
				d(this.vert.node),
				(this.width = undefined);
		}
		(c.prototype.update = function update(f) {
			if (this.width == undefined) {
				const d = window.getComputedStyle
					? window.getComputedStyle(this.horiz.node)
					: this.horiz.node.currentStyle;
				d && (this.width = Number.parseInt(d.height));
			}
			const h = this.width || 0,
				p = f.scrollWidth > f.clientWidth + 1,
				v = f.scrollHeight > f.clientHeight + 1;
			return (
				(this.vert.node.style.display = v ? "block" : "none"),
				(this.horiz.node.style.display = p ? "block" : "none"),
				v &&
					(this.vert.update(
						f.scrollHeight,
						f.clientHeight,
						f.viewHeight - (p ? h : 0),
					),
					(this.vert.node.style.bottom = p ? h + "px" : "0")),
				p &&
					(this.horiz.update(
						f.scrollWidth,
						f.clientWidth,
						f.viewWidth - (v ? h : 0) - f.barLeft,
					),
					(this.horiz.node.style.right = v ? h + "px" : "0"),
					(this.horiz.node.style.left = f.barLeft + "px")),
				{ right: v ? h : 0, bottom: p ? h : 0 }
			);
		}),
			(c.prototype.setScrollTop = function setScrollTop(f) {
				this.vert.setPos(f);
			}),
			(c.prototype.setScrollLeft = function setScrollLeft(f) {
				this.horiz.setPos(f);
			}),
			(c.prototype.clear = function clear() {
				const f = this.horiz.node.parentNode;
				f.removeChild(this.horiz.node), f.removeChild(this.vert.node);
			}),
			(r.scrollbarModel.simple = (f, d) =>
				new c("CodeMirror-simplescroll", f, d)),
			(r.scrollbarModel.overlay = (f, d) =>
				new c("CodeMirror-overlayscroll", f, d));
	});
})();
const rr = jr();
function wue(e, t, r = {}) {
	const o = mue.fromTextArea(e.value, {
		theme: "vars",
		...r,
		scrollbarStyle: "simple",
	});
	let s = !1;
	return (
		o.on("change", () => {
			if (s) {
				s = !1;
				return;
			}
			t.value = o.getValue();
		}),
		Bt(
			t,
			(c) => {
				if (c !== o.getValue()) {
					s = !0;
					const f = o.listSelections();
					o.replaceRange(
						c,
						o.posFromIndex(0),
						o.posFromIndex(Number.POSITIVE_INFINITY),
					),
						o.setSelections(f);
				}
			},
			{ immediate: !0 },
		),
		Cu(() => {
			rr.value = void 0;
		}),
		kh(o)
	);
}
async function xue(e) {
	let t;
	aw(e, ((t = e.location) == undefined ? void 0 : t.line) ?? 0);
}
const Sue = {
		relative: "",
		"font-mono": "",
		"text-sm": "",
		class: "codemirror-scrolls",
	},
	Vw = ut({
		__name: "CodeMirrorContainer",
		props: Wc(
			{ mode: {}, readOnly: { type: Boolean } },
			{ modelValue: {}, modelModifiers: {} },
		),
		emits: Wc(["save"], ["update:modelValue"]),
		setup(e, { emit: t }) {
			const r = t,
				o = Nh(e, "modelValue"),
				s = ok(),
				c = {
					js: "javascript",
					mjs: "javascript",
					cjs: "javascript",
					ts: { name: "javascript", typescript: !0 },
					mts: { name: "javascript", typescript: !0 },
					cts: { name: "javascript", typescript: !0 },
					jsx: { name: "javascript", jsx: !0 },
					tsx: { name: "javascript", typescript: !0, jsx: !0 },
				},
				f = We();
			return (
				Bs(async () => {
					const d = wue(f, o, {
						...s,
						mode: c[e.mode || ""] || e.mode,
						readOnly: e.readOnly ? !0 : void 0,
						extraKeys: {
							"Cmd-S"(h) {
								r("save", h.getValue());
							},
							"Ctrl-S"(h) {
								r("save", h.getValue());
							},
						},
					});
					d.setSize("100%", "100%"),
						d.clearHistory(),
						(rr.value = d),
						setTimeout(() => rr.value.refresh(), 100);
				}),
				(d, h) => (
					oe(),
					me("div", Sue, [
						Y("textarea", { ref_key: "el", ref: f }, undefined, 512),
					])
				)
			);
		},
	}),
	_ue = ut({
		__name: "ViewEditor",
		props: { file: {} },
		emits: ["draft"],
		setup(e, { emit: t }) {
			const r = e,
				o = t,
				s = We(""),
				c = jr(void 0),
				f = We(!1),
				d = We(!0);
			Bt(
				() => r.file,
				async () => {
					let A;
					d.value = !0;
					try {
						if (!(r.file && (A = r.file) != undefined && A.filepath)) {
							(s.value = ""), (c.value = s.value), (f.value = !1);
							return;
						}
						(s.value = (await xt.rpc.readTestFile(r.file.filepath)) || ""),
							(c.value = s.value),
							(f.value = !1);
					} finally {
						un(() => (d.value = !1));
					}
				},
				{ immediate: !0 },
			),
				Bt(
					() => [d.value, r.file, Ud.value],
					([A, z, W]) => {
						A ||
							(W != undefined
								? un(() => {
										let re;
										const U = { line: W ?? 0, ch: 0 };
										(re = rr.value) == undefined || re.scrollIntoView(U, 100),
											un(() => {
												let Q, G;
												(Q = rr.value) == undefined || Q.focus(),
													(G = rr.value) == undefined || G.setCursor(U);
											});
									})
								: un(() => {
										let U;
										(U = rr.value) == undefined || U.focus();
									}));
					},
					{ flush: "post" },
				);
			const h = Te(() => {
					let A, z;
					return (
						((z = (A = r.file) == undefined ? void 0 : A.filepath) == undefined
							? void 0
							: z.split(/\./g).pop()) || "js"
					);
				}),
				p = We(),
				v = Te(() => {
					let A;
					return (A = p.value) == undefined ? void 0 : A.cm;
				}),
				m = Te(() => {
					let A;
					return (
						((A = r.file) == undefined
							? void 0
							: A.tasks.filter((z) => {
									let W;
									return (
										((W = z.result) == undefined ? void 0 : W.state) === "fail"
									);
								})) || []
					);
				}),
				b = [],
				w = [],
				M = [],
				C = We(!1);
			function E() {
				M.forEach(([A, z, W]) => {
					A.removeEventListener("click", z), W();
				}),
					(M.length = 0);
			}
			xE(p, () => {
				let A;
				(A = rr.value) == undefined || A.refresh();
			});
			function L() {
				f.value = c.value !== rr.value.getValue();
			}
			Bt(
				f,
				(A) => {
					o("draft", A);
				},
				{ immediate: !0 },
			);
			function N(A) {
				const z = ((A == undefined ? void 0 : A.stacks) || []).filter((te) => {
						let Z;
						return (
							te.file &&
							te.file === ((Z = r.file) == undefined ? void 0 : Z.filepath)
						);
					}),
					W = z == undefined ? void 0 : z[0];
				if (!W) {
					return;
				}
				const U = document.createElement("div");
				U.className = "op80 flex gap-x-2 items-center";
				const re = document.createElement("pre");
				(re.className = "c-red-600 dark:c-red-400"),
					(re.textContent = `${" ".repeat(W.column)}^ ${
						(A == undefined ? void 0 : A.nameStr) || A.name
					}: ${(A == undefined ? void 0 : A.message) || ""}`),
					U.append(re);
				const Q = document.createElement("span");
				(Q.className =
					"i-carbon-launch c-red-600 dark:c-red-400 hover:cursor-pointer min-w-1em min-h-1em"),
					(Q.tabIndex = 0),
					(Q.ariaLabel = "Open in Editor"),
					Tb(Q, { content: "Open in Editor", placement: "bottom" }, !1);
				const G = async () => {
					await $w(W.file, W.line, W.column);
				};
				U.append(Q),
					M.push([Q, G, () => Ih(Q)]),
					w.push(rr.value.addLineClass(W.line - 1, "wrap", "bg-red-500/10")),
					b.push(rr.value.addLineWidget(W.line - 1, U));
			}
			Bt(
				[v, m],
				([A]) => {
					if (!A) {
						E();
						return;
					}
					setTimeout(() => {
						E(),
							b.forEach((z) => z.clear()),
							w.forEach((z) => {
								let W;
								return (W = rr.value) == undefined
									? void 0
									: W.removeLineClass(z, "wrap");
							}),
							(b.length = 0),
							(w.length = 0),
							A.on("changes", L),
							m.value.forEach((z) => {
								let W, U;
								(U = (W = z.result) == undefined ? void 0 : W.errors) ==
									undefined || U.forEach(N);
							}),
							C.value || A.clearHistory();
					}, 100);
				},
				{ flush: "post" },
			);
			async function P(A) {
				(C.value = !0),
					await xt.rpc.saveTestFile(r.file.filepath, A),
					(c.value = A),
					(f.value = !1);
			}
			return (A, z) => {
				const W = Vw;
				return (
					oe(),
					rt(
						W,
						hi(
							{
								ref_key: "editor",
								ref: p,
								modelValue: I(s),
								"onUpdate:modelValue":
									z[0] || (z[0] = (U) => (At(s) ? (s.value = U) : undefined)),
								"h-full": "",
							},
							{ lineNumbers: !0, readOnly: I(Br) },
							{ mode: I(h), "data-testid": "code-mirror", onSave: P },
						),
						undefined,
						16,
						["modelValue", "mode"],
					)
				);
			};
		},
	}),
	kue = {
		"w-350": "",
		"max-w-screen": "",
		"h-full": "",
		flex: "",
		"flex-col": "",
	},
	Tue = { "p-4": "", relative: "" },
	Cue = { op50: "", "font-mono": "", "text-sm": "" },
	Eue = { key: 0, "p-5": "" },
	Lue = {
		grid: "~ cols-2 rows-[min-content_auto]",
		"overflow-hidden": "",
		"flex-auto": "",
	},
	Aue = { key: 0 },
	Mue = { p: "x3 y-1", "bg-overlay": "", border: "base b t" },
	Nue = ut({
		__name: "ModuleTransformResultView",
		props: { id: {}, projectName: {} },
		emits: ["close"],
		setup(e, { emit: t }) {
			const r = e,
				o = t,
				s = uE(() => xt.rpc.getTransformResult(r.projectName, r.id, !!Ro)),
				c = Te(() => {
					let p;
					return (
						((p = r.id) == undefined ? void 0 : p.split(/\./g).pop()) || "js"
					);
				}),
				f = Te(() => {
					let p, v;
					return (
						((v = (p = s.value) == undefined ? void 0 : p.source) == undefined
							? void 0
							: v.trim()) || ""
					);
				}),
				d = Te(() => {
					let p, v;
					return (
						((v = (p = s.value) == undefined ? void 0 : p.code) == undefined
							? void 0
							: v.replace(/\/\/# sourceMappingURL=.*\n/, "").trim()) || ""
					);
				}),
				h = Te(() => {
					let p, v, m, b;
					return {
						mappings:
							((v = (p = s.value) == undefined ? void 0 : p.map) == undefined
								? void 0
								: v.mappings) ?? "",
						version:
							(b = (m = s.value) == undefined ? void 0 : m.map) == undefined
								? void 0
								: b.version,
					};
				});
			return (
				jb("Escape", () => {
					o("close");
				}),
				(p, v) => {
					const m = wi,
						b = Vw;
					return (
						oe(),
						me("div", kue, [
							Y("div", Tue, [
								v[1] || (v[1] = Y("p", undefined, "Module Info", -1)),
								Y("p", Cue, He(p.id), 1),
								Pe(m, {
									icon: "i-carbon-close",
									absolute: "",
									"top-5px": "",
									"right-5px": "",
									"text-2xl": "",
									onClick: v[0] || (v[0] = (w) => o("close")),
								}),
							]),
							I(s)
								? (oe(),
									me(
										ct,
										{ key: 1 },
										[
											Y("div", Lue, [
												v[2] ||
													(v[2] = Y(
														"div",
														{
															p: "x3 y-1",
															"bg-overlay": "",
															border: "base b t r",
														},
														" Source ",
														-1,
													)),
												v[3] ||
													(v[3] = Y(
														"div",
														{
															p: "x3 y-1",
															"bg-overlay": "",
															border: "base b t",
														},
														" Transformed ",
														-1,
													)),
												Pe(
													b,
													hi(
														{
															"h-full": "",
															"model-value": I(f),
															"read-only": "",
														},
														{ lineNumbers: !0 },
														{ mode: I(c) },
													),
													undefined,
													16,
													["model-value", "mode"],
												),
												Pe(
													b,
													hi(
														{
															"h-full": "",
															"model-value": I(d),
															"read-only": "",
														},
														{ lineNumbers: !0 },
														{ mode: I(c) },
													),
													undefined,
													16,
													["model-value", "mode"],
												),
											]),
											I(h).mappings !== ""
												? (oe(),
													me("div", Aue, [
														Y(
															"div",
															Mue,
															" Source map (v" + He(I(h).version) + ") ",
															1,
														),
														Pe(
															b,
															hi(
																{
																	"model-value": I(h).mappings,
																	"read-only": "",
																},
																{ lineNumbers: !0 },
																{ mode: I(c) },
															),
															undefined,
															16,
															["model-value", "mode"],
														),
													]))
												: Ye("", !0),
										],
										64,
									))
								: (oe(),
									me(
										"div",
										Eue,
										" No transform result found for this module. ",
									)),
						])
					);
				}
			);
		},
	});
function $ue(e, t) {
	let r;
	return (...o) => {
		r !== void 0 && clearTimeout(r), (r = setTimeout(() => e(...o), t));
	};
}
const Xd = "http://www.w3.org/1999/xhtml";
const Um = {
	svg: "http://www.w3.org/2000/svg",
	xhtml: Xd,
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace",
	xmlns: "http://www.w3.org/2000/xmlns/",
};
function Wu(e) {
	let t = (e += ""),
		r = t.indexOf(":");
	return (
		r >= 0 && (t = e.slice(0, r)) !== "xmlns" && (e = e.slice(r + 1)),
		Object.hasOwn(Um, t) ? { space: Um[t], local: e } : e
	);
}
function Pue(e) {
	return function () {
		const t = this.ownerDocument,
			r = this.namespaceURI;
		return r === Xd && t.documentElement.namespaceURI === Xd
			? t.createElement(e)
			: t.createElementNS(r, e);
	};
}
function Oue(e) {
	return function () {
		return this.ownerDocument.createElementNS(e.space, e.local);
	};
}
function jw(e) {
	const t = Wu(e);
	return (t.local ? Oue : Pue)(t);
}
function Rue() {}
function Jh(e) {
	return e == undefined
		? Rue
		: function () {
				return this.querySelector(e);
			};
}
function Due(e) {
	typeof e !== "function" && (e = Jh(e));
	for (
		var t = this._groups, r = t.length, o = new Array(r), s = 0;
		s < r;
		++s
	) {
		for (
			let c = t[s], f = c.length, d = (o[s] = new Array(f)), h, p, v = 0;
			v < f;
			++v
		) {
			(h = c[v]) &&
				(p = e.call(h, h.__data__, v, c)) &&
				("__data__" in h && (p.__data__ = h.__data__), (d[v] = p));
		}
	}
	return new Qn(o, this._parents);
}
function zue(e) {
	return e == undefined ? [] : (Array.isArray(e) ? e : Array.from(e));
}
function Iue() {
	return [];
}
function Gw(e) {
	return e == undefined
		? Iue
		: function () {
				return this.querySelectorAll(e);
			};
}
function Fue(e) {
	return function () {
		return zue(e.apply(this, arguments));
	};
}
function Hue(e) {
	typeof e === "function" ? (e = Fue(e)) : (e = Gw(e));
	for (var t = this._groups, r = t.length, o = [], s = [], c = 0; c < r; ++c) {
		for (let f = t[c], d = f.length, h, p = 0; p < d; ++p) {
			(h = f[p]) && (o.push(e.call(h, h.__data__, p, f)), s.push(h));
		}
	}
	return new Qn(o, s);
}
function Kw(e) {
	return function () {
		return this.matches(e);
	};
}
function Xw(e) {
	return (t) => t.matches(e);
}
const que = Array.prototype.find;
function Bue(e) {
	return function () {
		return que.call(this.children, e);
	};
}
function Wue() {
	return this.firstElementChild;
}
function Uue(e) {
	return this.select(
		e == undefined ? Wue : Bue(typeof e === "function" ? e : Xw(e)),
	);
}
const Vue = Array.prototype.filter;
function jue() {
	return [...this.children];
}
function Gue(e) {
	return function () {
		return Vue.call(this.children, e);
	};
}
function Kue(e) {
	return this.selectAll(
		e == undefined ? jue : Gue(typeof e === "function" ? e : Xw(e)),
	);
}
function Xue(e) {
	typeof e !== "function" && (e = Kw(e));
	for (
		var t = this._groups, r = t.length, o = new Array(r), s = 0;
		s < r;
		++s
	) {
		for (let c = t[s], f = c.length, d = (o[s] = []), h, p = 0; p < f; ++p) {
			(h = c[p]) && e.call(h, h.__data__, p, c) && d.push(h);
		}
	}
	return new Qn(o, this._parents);
}
function Yw(e) {
	return new Array(e.length);
}
function Yue() {
	return new Qn(this._enter || this._groups.map(Yw), this._parents);
}
function au(e, t) {
	(this.ownerDocument = e.ownerDocument),
		(this.namespaceURI = e.namespaceURI),
		(this._next = undefined),
		(this._parent = e),
		(this.__data__ = t);
}
au.prototype = {
	constructor: au,
	appendChild(e) {
		return this._parent.insertBefore(e, this._next);
	},
	insertBefore(e, t) {
		return this._parent.insertBefore(e, t);
	},
	querySelector(e) {
		return this._parent.querySelector(e);
	},
	querySelectorAll(e) {
		return this._parent.querySelectorAll(e);
	},
};
function Zue(e) {
	return () => e;
}
function Jue(e, t, r, o, s, c) {
	for (var f = 0, d, h = t.length, p = c.length; f < p; ++f) {
		(d = t[f]) ? ((d.__data__ = c[f]), (o[f] = d)) : (r[f] = new au(e, c[f]));
	}
	for (; f < h; ++f) {
		(d = t[f]) && (s[f] = d);
	}
}
function Que(e, t, r, o, s, c, f) {
	let d,
		h,
		p = new Map(),
		v = t.length,
		m = c.length,
		b = new Array(v),
		w;
	for (d = 0; d < v; ++d) {
		(h = t[d]) &&
			((b[d] = w = f.call(h, h.__data__, d, t) + ""),
			p.has(w) ? (s[d] = h) : p.set(w, h));
	}
	for (d = 0; d < m; ++d) {
		(w = f.call(e, c[d], d, c) + ""),
			(h = p.get(w))
				? ((o[d] = h), (h.__data__ = c[d]), p.delete(w))
				: (r[d] = new au(e, c[d]));
	}
	for (d = 0; d < v; ++d) {
		(h = t[d]) && p.get(b[d]) === h && (s[d] = h);
	}
}
function efe(e) {
	return e.__data__;
}
function tfe(e, t) {
	if (arguments.length === 0) {
		return Array.from(this, efe);
	}
	const r = t ? Que : Jue,
		o = this._parents,
		s = this._groups;
	typeof e !== "function" && (e = Zue(e));
	for (
		var c = s.length,
			f = new Array(c),
			d = new Array(c),
			h = new Array(c),
			p = 0;
		p < c;
		++p
	) {
		const v = o[p],
			m = s[p],
			b = m.length,
			w = nfe(e.call(v, v && v.__data__, p, o)),
			M = w.length,
			C = (d[p] = new Array(M)),
			E = (f[p] = new Array(M)),
			L = (h[p] = new Array(b));
		r(v, m, C, E, L, w, t);
		for (let N = 0, P = 0, A, z; N < M; ++N) {
			if ((A = C[N])) {
				for (N >= P && (P = N + 1); !(z = E[P]) && ++P < M; ) {}
				A._next = z || undefined;
			}
		}
	}
	return (f = new Qn(f, o)), (f._enter = d), (f._exit = h), f;
}
function nfe(e) {
	return typeof e === "object" && "length" in e ? e : [...e];
}
function rfe() {
	return new Qn(this._exit || this._groups.map(Yw), this._parents);
}
function ife(e, t, r) {
	let o = this.enter(),
		s = this,
		c = this.exit();
	return (
		typeof e === "function"
			? ((o = e(o)), o && (o = o.selection()))
			: (o = o.append(e + "")),
		t != undefined && ((s = t(s)), s && (s = s.selection())),
		r == undefined ? c.remove() : r(c),
		o && s ? o.merge(s).order() : s
	);
}
function ofe(e) {
	for (
		var t = e.selection ? e.selection() : e,
			r = this._groups,
			o = t._groups,
			s = r.length,
			c = o.length,
			f = Math.min(s, c),
			d = new Array(s),
			h = 0;
		h < f;
		++h
	) {
		for (
			let p = r[h], v = o[h], m = p.length, b = (d[h] = new Array(m)), w, M = 0;
			M < m;
			++M
		) {
			(w = p[M] || v[M]) && (b[M] = w);
		}
	}
	for (; h < s; ++h) {
		d[h] = r[h];
	}
	return new Qn(d, this._parents);
}
function sfe() {
	for (let e = this._groups, t = -1, r = e.length; ++t < r; ) {
		for (let o = e[t], s = o.length - 1, c = o[s], f; --s >= 0; ) {
			(f = o[s]) &&
				(c &&
					f.compareDocumentPosition(c) ^ 4 &&
					c.parentNode.insertBefore(f, c),
				(c = f));
		}
	}
	return this;
}
function lfe(e) {
	e || (e = afe);
	function t(m, b) {
		return m && b ? e(m.__data__, b.__data__) : !m - !b;
	}
	for (
		var r = this._groups, o = r.length, s = new Array(o), c = 0;
		c < o;
		++c
	) {
		for (
			var f = r[c], d = f.length, h = (s[c] = new Array(d)), p, v = 0;
			v < d;
			++v
		) {
			(p = f[v]) && (h[v] = p);
		}
		h.sort(t);
	}
	return new Qn(s, this._parents).order();
}
function afe(e, t) {
	return e < t ? -1 : e > t ? 1 : e >= t ? 0 : Number.NaN;
}
function cfe() {
	const e = arguments[0];
	return (arguments[0] = this), e.apply(undefined, arguments), this;
}
function ufe() {
	return [...this];
}
function ffe() {
	for (let e = this._groups, t = 0, r = e.length; t < r; ++t) {
		for (let o = e[t], s = 0, c = o.length; s < c; ++s) {
			const f = o[s];
			if (f) {
				return f;
			}
		}
	}
	return;
}
function dfe() {
	let e = 0;
	for (const t of this) {
		++e;
	}
	return e;
}
function hfe() {
	return !this.node();
}
function pfe(e) {
	for (let t = this._groups, r = 0, o = t.length; r < o; ++r) {
		for (let s = t[r], c = 0, f = s.length, d; c < f; ++c) {
			(d = s[c]) && e.call(d, d.__data__, c, s);
		}
	}
	return this;
}
function gfe(e) {
	return function () {
		this.removeAttribute(e);
	};
}
function vfe(e) {
	return function () {
		this.removeAttributeNS(e.space, e.local);
	};
}
function mfe(e, t) {
	return function () {
		this.setAttribute(e, t);
	};
}
function yfe(e, t) {
	return function () {
		this.setAttributeNS(e.space, e.local, t);
	};
}
function bfe(e, t) {
	return function () {
		const r = t.apply(this, arguments);
		r == undefined ? this.removeAttribute(e) : this.setAttribute(e, r);
	};
}
function wfe(e, t) {
	return function () {
		const r = t.apply(this, arguments);
		r == undefined
			? this.removeAttributeNS(e.space, e.local)
			: this.setAttributeNS(e.space, e.local, r);
	};
}
function xfe(e, t) {
	const r = Wu(e);
	if (arguments.length < 2) {
		const o = this.node();
		return r.local ? o.getAttributeNS(r.space, r.local) : o.getAttribute(r);
	}
	return this.each(
		(t == undefined
			? (r.local
				? vfe
				: gfe)
			: typeof t === "function"
				? r.local
					? wfe
					: bfe
				: r.local
					? yfe
					: mfe)(r, t),
	);
}
function Zw(e) {
	return (
		(e.ownerDocument && e.ownerDocument.defaultView) ||
		(e.document && e) ||
		e.defaultView
	);
}
function Sfe(e) {
	return function () {
		this.style.removeProperty(e);
	};
}
function _fe(e, t, r) {
	return function () {
		this.style.setProperty(e, t, r);
	};
}
function kfe(e, t, r) {
	return function () {
		const o = t.apply(this, arguments);
		o == undefined
			? this.style.removeProperty(e)
			: this.style.setProperty(e, o, r);
	};
}
function Tfe(e, t, r) {
	return arguments.length > 1
		? this.each(
				(t == undefined ? Sfe : (typeof t == "function" ? kfe : _fe))(
					e,
					t,
					r ?? "",
				),
			)
		: Is(this.node(), e);
}
function Is(e, t) {
	return (
		e.style.getPropertyValue(t) ||
		Zw(e).getComputedStyle(e).getPropertyValue(t)
	);
}
function Cfe(e) {
	return function () {
		delete this[e];
	};
}
function Efe(e, t) {
	return function () {
		this[e] = t;
	};
}
function Lfe(e, t) {
	return function () {
		const r = t.apply(this, arguments);
		r == undefined ? delete this[e] : (this[e] = r);
	};
}
function Afe(e, t) {
	return arguments.length > 1
		? this.each(
				(t == undefined ? Cfe : (typeof t == "function" ? Lfe : Efe))(e, t),
			)
		: this.node()[e];
}
function Jw(e) {
	return e.trim().split(/^|\s+/);
}
function Qh(e) {
	return e.classList || new Qw(e);
}
function Qw(e) {
	(this._node = e), (this._names = Jw(e.getAttribute("class") || ""));
}
Qw.prototype = {
	add(e) {
		const t = this._names.indexOf(e);
		t < 0 &&
			(this._names.push(e),
			this._node.setAttribute("class", this._names.join(" ")));
	},
	remove(e) {
		const t = this._names.indexOf(e);
		t >= 0 &&
			(this._names.splice(t, 1),
			this._node.setAttribute("class", this._names.join(" ")));
	},
	contains(e) {
		return this._names.indexOf(e) >= 0;
	},
};
function e1(e, t) {
	for (let r = Qh(e), o = -1, s = t.length; ++o < s; ) {
		r.add(t[o]);
	}
}
function t1(e, t) {
	for (let r = Qh(e), o = -1, s = t.length; ++o < s; ) {
		r.remove(t[o]);
	}
}
function Mfe(e) {
	return function () {
		e1(this, e);
	};
}
function Nfe(e) {
	return function () {
		t1(this, e);
	};
}
function $fe(e, t) {
	return function () {
		(t.apply(this, arguments) ? e1 : t1)(this, e);
	};
}
function Pfe(e, t) {
	const r = Jw(e + "");
	if (arguments.length < 2) {
		for (let o = Qh(this.node()), s = -1, c = r.length; ++s < c; ) {
			if (!o.contains(r[s])) {return !1;}
		}
		return !0;
	}
	return this.each((typeof t === "function" ? $fe : (t ? Mfe : Nfe))(r, t));
}
function Ofe() {
	this.textContent = "";
}
function Rfe(e) {
	return function () {
		this.textContent = e;
	};
}
function Dfe(e) {
	return function () {
		const t = e.apply(this, arguments);
		this.textContent = t ?? "";
	};
}
function zfe(e) {
	return arguments.length > 0
		? this.each(e == undefined ? Ofe : (typeof e === "function" ? Dfe : Rfe)(e))
		: this.node().textContent;
}
function Ife() {
	this.innerHTML = "";
}
function Ffe(e) {
	return function () {
		this.innerHTML = e;
	};
}
function Hfe(e) {
	return function () {
		const t = e.apply(this, arguments);
		this.innerHTML = t ?? "";
	};
}
function qfe(e) {
	return arguments.length > 0
		? this.each(e == undefined ? Ife : (typeof e === "function" ? Hfe : Ffe)(e))
		: this.node().innerHTML;
}
function Bfe() {
	this.nextSibling && this.parentNode.append(this);
}
function Wfe() {
	return this.each(Bfe);
}
function Ufe() {
	this.previousSibling &&
		this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Vfe() {
	return this.each(Ufe);
}
function jfe(e) {
	const t = typeof e === "function" ? e : jw(e);
	return this.select(function () {
		return this.append(t.apply(this, arguments));
	});
}
function Gfe() {
	return;
}
function Kfe(e, t) {
	const r = typeof e === "function" ? e : jw(e),
		o = t == undefined ? Gfe : (typeof t == "function" ? t : Jh(t));
	return this.select(function () {
		return this.insertBefore(
			r.apply(this, arguments),
			o.apply(this, arguments) || undefined,
		);
	});
}
function Xfe() {
	const e = this.parentNode;
	e && e.removeChild(this);
}
function Yfe() {
	return this.each(Xfe);
}
function Zfe() {
	const e = this.cloneNode(!1),
		t = this.parentNode;
	return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Jfe() {
	const e = this.cloneNode(!0),
		t = this.parentNode;
	return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Qfe(e) {
	return this.select(e ? Jfe : Zfe);
}
function ede(e) {
	return arguments.length > 0
		? this.property("__data__", e)
		: this.node().__data__;
}
function tde(e) {
	return function (t) {
		e.call(this, t, this.__data__);
	};
}
function nde(e) {
	return e
		.trim()
		.split(/^|\s+/)
		.map((t) => {
			let r = "",
				o = t.indexOf(".");
			return (
				o >= 0 && ((r = t.slice(o + 1)), (t = t.slice(0, o))),
				{ type: t, name: r }
			);
		});
}
function rde(e) {
	return function () {
		const t = this.__on;
		if (t) {
			for (var r = 0, o = -1, s = t.length, c; r < s; ++r) {
				(c = t[r]),
					(!e.type || c.type === e.type) && c.name === e.name
						? this.removeEventListener(c.type, c.listener, c.options)
						: (t[++o] = c);
			}
			++o ? (t.length = o) : delete this.__on;
		}
	};
}
function ide(e, t, r) {
	return function () {
		let o = this.__on,
			s,
			c = tde(t);
		if (o) {
			for (let f = 0, d = o.length; f < d; ++f) {
				if ((s = o[f]).type === e.type && s.name === e.name) {
					this.removeEventListener(s.type, s.listener, s.options),
						this.addEventListener(s.type, (s.listener = c), (s.options = r)),
						(s.value = t);
					return;
				}
			}
		}
		this.addEventListener(e.type, c, r),
			(s = { type: e.type, name: e.name, value: t, listener: c, options: r }),
			o ? o.push(s) : (this.__on = [s]);
	};
}
function ode(e, t, r) {
	let o = nde(e + ""),
		s,
		c = o.length,
		f;
	if (arguments.length < 2) {
		var d = this.node().__on;
		if (d) {
			for (let h = 0, p = d.length, v; h < p; ++h) {
				for (s = 0, v = d[h]; s < c; ++s) {
					if ((f = o[s]).type === v.type && f.name === v.name) {
						return v.value;
					}
				}
			}
		}
		return;
	}
	for (d = t ? ide : rde, s = 0; s < c; ++s) {
		this.each(d(o[s], t, r));
	}
	return this;
}
function n1(e, t, r) {
	let o = Zw(e),
		s = o.CustomEvent;
	typeof s === "function"
		? (s = new s(t, r))
		: ((s = o.document.createEvent("Event")),
			r
				? (s.initEvent(t, r.bubbles, r.cancelable), (s.detail = r.detail))
				: s.initEvent(t, !1, !1)),
		e.dispatchEvent(s);
}
function sde(e, t) {
	return function () {
		return n1(this, e, t);
	};
}
function lde(e, t) {
	return function () {
		return n1(this, e, t.apply(this, arguments));
	};
}
function ade(e, t) {
	return this.each((typeof t === "function" ? lde : sde)(e, t));
}
function* cde() {
	for (let e = this._groups, t = 0, r = e.length; t < r; ++t) {
		for (let o = e[t], s = 0, c = o.length, f; s < c; ++s) {
			(f = o[s]) && (yield f);
		}
	}
}
const r1 = [undefined];
function Qn(e, t) {
	(this._groups = e), (this._parents = t);
}
function _a() {
	return new Qn([[document.documentElement]], r1);
}
function ude() {
	return this;
}
Qn.prototype = _a.prototype = {
	constructor: Qn,
	select: Due,
	selectAll: Hue,
	selectChild: Uue,
	selectChildren: Kue,
	filter: Xue,
	data: tfe,
	enter: Yue,
	exit: rfe,
	join: ife,
	merge: ofe,
	selection: ude,
	order: sfe,
	sort: lfe,
	call: cfe,
	nodes: ufe,
	node: ffe,
	size: dfe,
	empty: hfe,
	each: pfe,
	attr: xfe,
	style: Tfe,
	property: Afe,
	classed: Pfe,
	text: zfe,
	html: qfe,
	raise: Wfe,
	lower: Vfe,
	append: jfe,
	insert: Kfe,
	remove: Yfe,
	clone: Qfe,
	datum: ede,
	on: ode,
	dispatch: ade,
	[Symbol.iterator]: cde,
};
function Fn(e) {
	return typeof e === "string"
		? new Qn([[document.querySelector(e)]], [document.documentElement])
		: new Qn([[e]], r1);
}
function fde(e) {
	let t;
	while ((t = e.sourceEvent)) {
		e = t;
	}
	return e;
}
function ai(e, t) {
	if (((e = fde(e)), t === void 0 && (t = e.currentTarget), t)) {
		const r = t.ownerSVGElement || t;
		if (r.createSVGPoint) {
			let o = r.createSVGPoint();
			return (
				(o.x = e.clientX),
				(o.y = e.clientY),
				(o = o.matrixTransform(t.getScreenCTM().inverse())),
				[o.x, o.y]
			);
		}
		if (t.getBoundingClientRect) {
			const s = t.getBoundingClientRect();
			return [
				e.clientX - s.left - t.clientLeft,
				e.clientY - s.top - t.clientTop,
			];
		}
	}
	return [e.pageX, e.pageY];
}
class En {
	constructor(t, r) {
		(this.x = t), (this.y = r);
	}
	static of([t, r]) {
		return new En(t, r);
	}
	add(t) {
		return new En(this.x + t.x, this.y + t.y);
	}
	subtract(t) {
		return new En(this.x - t.x, this.y - t.y);
	}
	multiply(t) {
		return new En(this.x * t, this.y * t);
	}
	divide(t) {
		return new En(this.x / t, this.y / t);
	}
	dot(t) {
		return this.x * t.x + this.y * t.y;
	}
	cross(t) {
		return this.x * t.y - t.x * this.y;
	}
	hadamard(t) {
		return new En(this.x * t.x, this.y * t.y);
	}
	length() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
	normalize() {
		const t = this.length();
		return new En(this.x / t, this.y / t);
	}
	rotateByRadians(t) {
		const r = Math.cos(t),
			o = Math.sin(t);
		return new En(this.x * r - this.y * o, this.x * o + this.y * r);
	}
	rotateByDegrees(t) {
		return this.rotateByRadians((t * Math.PI) / 180);
	}
}
const dde = { value: () => {} };
function ka() {
	for (var e = 0, t = arguments.length, r = {}, o; e < t; ++e) {
		if (!(o = arguments[e] + "") || o in r || /[\s.]/.test(o)) {
			throw new Error("illegal type: " + o);
		}
		r[o] = [];
	}
	return new $c(r);
}
function $c(e) {
	this._ = e;
}
function hde(e, t) {
	return e
		.trim()
		.split(/^|\s+/)
		.map((r) => {
			let o = "",
				s = r.indexOf(".");
			if (
				(s >= 0 && ((o = r.slice(s + 1)), (r = r.slice(0, s))),
				r && !Object.hasOwn(t, r))
			) {
				throw new Error("unknown type: " + r);
			}
			return { type: r, name: o };
		});
}
$c.prototype = ka.prototype = {
	constructor: $c,
	on(e, t) {
		let r = this._,
			o = hde(e + "", r),
			s,
			c = -1,
			f = o.length;
		if (arguments.length < 2) {
			while (++c < f) {
				if ((s = (e = o[c]).type) && (s = pde(r[s], e.name))) {return s;}
			}
			return;
		}
		if (t != undefined && typeof t !== "function") {
			throw new Error("invalid callback: " + t);
		}
		while (++c < f) {
			if ((s = (e = o[c]).type)) {
				r[s] = Vm(r[s], e.name, t);
			} else if (t == undefined) {
				for (s in r) {
					r[s] = Vm(r[s], e.name, undefined);
				}
			}
		}
		return this;
	},
	copy() {
		const e = {},
			t = this._;
		for (const r in t) {
			e[r] = [...t[r]];
		}
		return new $c(e);
	},
	call(e, t) {
		if ((s = arguments.length - 2) > 0) {
			for (var r = new Array(s), o = 0, s, c; o < s; ++o) {
				r[o] = arguments[o + 2];
			}
		}
		if (!Object.hasOwn(this._, e)) {
			throw new Error("unknown type: " + e);
		}
		for (c = this._[e], o = 0, s = c.length; o < s; ++o) {
			c[o].value.apply(t, r);
		}
	},
	apply(e, t, r) {
		if (!Object.hasOwn(this._, e)) {
			throw new Error("unknown type: " + e);
		}
		for (let o = this._[e], s = 0, c = o.length; s < c; ++s) {
			o[s].value.apply(t, r);
		}
	},
};
function pde(e, t) {
	for (let r = 0, o = e.length, s; r < o; ++r) {
		if ((s = e[r]).name === t) {return s.value;}
	}
}
function Vm(e, t, r) {
	for (let o = 0, s = e.length; o < s; ++o) {
		if (e[o].name === t) {
			(e[o] = dde), (e = e.slice(0, o).concat(e.slice(o + 1)));
			break;
		}
	}
	return r != undefined && e.push({ name: t, value: r }), e;
}
const gde = { passive: !1 },
	oa = { capture: !0, passive: !1 };
function cd(e) {
	e.stopImmediatePropagation();
}
function Ls(e) {
	e.preventDefault(), e.stopImmediatePropagation();
}
function i1(e) {
	const t = e.document.documentElement,
		r = Fn(e).on("dragstart.drag", Ls, oa);
	"onselectstart" in t
		? r.on("selectstart.drag", Ls, oa)
		: ((t.__noselect = t.style.MozUserSelect),
			(t.style.MozUserSelect = "none"));
}
function o1(e, t) {
	const r = e.document.documentElement,
		o = Fn(e).on("dragstart.drag");
	t &&
		(o.on("click.drag", Ls, oa),
		setTimeout(() => {
			o.on("click.drag");
		}, 0)),
		"onselectstart" in r
			? o.on("selectstart.drag")
			: ((r.style.MozUserSelect = r.__noselect), delete r.__noselect);
}
const vc = (e) => () => e;
function Yd(
	e,
	{
		sourceEvent: t,
		subject: r,
		target: o,
		identifier: s,
		active: c,
		x: f,
		y: d,
		dx: h,
		dy: p,
		dispatch: v,
	},
) {
	Object.defineProperties(this, {
		type: { value: e, enumerable: !0, configurable: !0 },
		sourceEvent: { value: t, enumerable: !0, configurable: !0 },
		subject: { value: r, enumerable: !0, configurable: !0 },
		target: { value: o, enumerable: !0, configurable: !0 },
		identifier: { value: s, enumerable: !0, configurable: !0 },
		active: { value: c, enumerable: !0, configurable: !0 },
		x: { value: f, enumerable: !0, configurable: !0 },
		y: { value: d, enumerable: !0, configurable: !0 },
		dx: { value: h, enumerable: !0, configurable: !0 },
		dy: { value: p, enumerable: !0, configurable: !0 },
		_: { value: v },
	});
}
Yd.prototype.on = function on() {
	const e = this._.on.apply(this._, arguments);
	return e === this._ ? this : e;
};
function vde(e) {
	return !(e.ctrlKey || e.button);
}
function mde() {
	return this.parentNode;
}
function yde(e, t) {
	return t ?? { x: e.x, y: e.y };
}
function bde() {
	return navigator.maxTouchPoints || "ontouchstart" in this;
}
function wde() {
	let e = vde,
		t = mde,
		r = yde,
		o = bde,
		s = {},
		c = ka("start", "drag", "end"),
		f = 0,
		d,
		h,
		p,
		v,
		m = 0;
	function b(A) {
		A.on("mousedown.drag", w)
			.filter(o)
			.on("touchstart.drag", E)
			.on("touchmove.drag", L, gde)
			.on("touchend.drag touchcancel.drag", N)
			.style("touch-action", "none")
			.style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
	}
	function w(A, z) {
		if (!(v || !e.call(this, A, z))) {
			const W = P(this, t.call(this, A, z), A, z, "mouse");
			W &&
				(Fn(A.view).on("mousemove.drag", M, oa).on("mouseup.drag", C, oa),
				i1(A.view),
				cd(A),
				(p = !1),
				(d = A.clientX),
				(h = A.clientY),
				W("start", A));
		}
	}
	function M(A) {
		if ((Ls(A), !p)) {
			const z = A.clientX - d,
				W = A.clientY - h;
			p = z * z + W * W > m;
		}
		s.mouse("drag", A);
	}
	function C(A) {
		Fn(A.view).on("mousemove.drag mouseup.drag"),
			o1(A.view, p),
			Ls(A),
			s.mouse("end", A);
	}
	function E(A, z) {
		if (e.call(this, A, z)) {
			let W = A.changedTouches,
				U = t.call(this, A, z),
				re = W.length,
				Q,
				G;
			for (Q = 0; Q < re; ++Q) {
				(G = P(this, U, A, z, W[Q].identifier, W[Q])) &&
					(cd(A), G("start", A, W[Q]));
			}
		}
	}
	function L(A) {
		let z = A.changedTouches,
			W = z.length,
			U,
			re;
		for (U = 0; U < W; ++U) {
			(re = s[z[U].identifier]) && (Ls(A), re("drag", A, z[U]));
		}
	}
	function N(A) {
		let z = A.changedTouches,
			W = z.length,
			U,
			re;
		for (
			v && clearTimeout(v),
				v = setTimeout(() => {
					v = undefined;
				}, 500),
				U = 0;
			U < W;
			++U
		) {
			(re = s[z[U].identifier]) && (cd(A), re("end", A, z[U]));
		}
	}
	function P(A, z, W, U, re, Q) {
		let G = c.copy(),
			te = ai(Q || W, z),
			Z,
			q,
			F;
		if (
			(F = r.call(
				A,
				new Yd("beforestart", {
					sourceEvent: W,
					target: b,
					identifier: re,
					active: f,
					x: te[0],
					y: te[1],
					dx: 0,
					dy: 0,
					dispatch: G,
				}),
				U,
			)) != undefined
		) {
			return (
				(Z = F.x - te[0] || 0),
				(q = F.y - te[1] || 0),
				function k(B, V, ie) {
					let ye = te,
						Ne;
					switch (B) {
						case "start": {
							(s[re] = k), (Ne = f++);
							break;
						}
						case "end": {
							delete s[re], --f;
						}
						case "drag": {
							(te = ai(ie || V, z)), (Ne = f);
							break;
						}
					}
					G.call(
						B,
						A,
						new Yd(B, {
							sourceEvent: V,
							subject: F,
							target: b,
							identifier: re,
							active: Ne,
							x: te[0] + Z,
							y: te[1] + q,
							dx: te[0] - ye[0],
							dy: te[1] - ye[1],
							dispatch: G,
						}),
						U,
					);
				}
			);
		}
	}
	return (
		(b.filter = (A) =>
			arguments.length > 0
				? ((e = typeof A === "function" ? A : vc(!!A)), b)
				: e),
		(b.container = (A) =>
			arguments.length > 0
				? ((t = typeof A === "function" ? A : vc(A)), b)
				: t),
		(b.subject = (A) =>
			arguments.length > 0
				? ((r = typeof A === "function" ? A : vc(A)), b)
				: r),
		(b.touchable = (A) =>
			arguments.length > 0
				? ((o = typeof A === "function" ? A : vc(!!A)), b)
				: o),
		(b.on = () => {
			const A = c.on.apply(c, arguments);
			return A === c ? b : A;
		}),
		(b.clickDistance = (A) =>
			arguments.length > 0 ? ((m = (A = +A) * A), b) : Math.sqrt(m)),
		b
	);
}
function ep(e, t, r) {
	(e.prototype = t.prototype = r), (r.constructor = e);
}
function s1(e, t) {
	const r = Object.create(e.prototype);
	for (const o in t) {
		r[o] = t[o];
	}
	return r;
}
function Ta() {}
const sa = 0.7,
	cu = 1 / sa,
	As = String.raw`\s*([+-]?\d+)\s*`,
	la = String.raw`\s*([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)\s*`,
	Wr = String.raw`\s*([+-]?(?:\d*\.)?\d+(?:[eE][+-]?\d+)?)%\s*`,
	xde = /^#([0-9a-f]{3,8})$/,
	Sde = new RegExp(`^rgb\\(${As},${As},${As}\\)$`),
	_de = new RegExp(`^rgb\\(${Wr},${Wr},${Wr}\\)$`),
	kde = new RegExp(`^rgba\\(${As},${As},${As},${la}\\)$`),
	Tde = new RegExp(`^rgba\\(${Wr},${Wr},${Wr},${la}\\)$`),
	Cde = new RegExp(`^hsl\\(${la},${Wr},${Wr}\\)$`),
	Ede = new RegExp(`^hsla\\(${la},${Wr},${Wr},${la}\\)$`),
	jm = {
		aliceblue: 15_792_383,
		antiquewhite: 16_444_375,
		aqua: 65_535,
		aquamarine: 8_388_564,
		azure: 15_794_175,
		beige: 16_119_260,
		bisque: 16_770_244,
		black: 0,
		blanchedalmond: 16_772_045,
		blue: 255,
		blueviolet: 9_055_202,
		brown: 10_824_234,
		burlywood: 14_596_231,
		cadetblue: 6_266_528,
		chartreuse: 8_388_352,
		chocolate: 13_789_470,
		coral: 16_744_272,
		cornflowerblue: 6_591_981,
		cornsilk: 16_775_388,
		crimson: 14_423_100,
		cyan: 65_535,
		darkblue: 139,
		darkcyan: 35_723,
		darkgoldenrod: 12_092_939,
		darkgray: 11_119_017,
		darkgreen: 25_600,
		darkgrey: 11_119_017,
		darkkhaki: 12_433_259,
		darkmagenta: 9_109_643,
		darkolivegreen: 5_597_999,
		darkorange: 16_747_520,
		darkorchid: 10_040_012,
		darkred: 9_109_504,
		darksalmon: 15_308_410,
		darkseagreen: 9_419_919,
		darkslateblue: 4_734_347,
		darkslategray: 3_100_495,
		darkslategrey: 3_100_495,
		darkturquoise: 52_945,
		darkviolet: 9_699_539,
		deeppink: 16_716_947,
		deepskyblue: 49_151,
		dimgray: 6_908_265,
		dimgrey: 6_908_265,
		dodgerblue: 2_003_199,
		firebrick: 11_674_146,
		floralwhite: 16_775_920,
		forestgreen: 2_263_842,
		fuchsia: 16_711_935,
		gainsboro: 14_474_460,
		ghostwhite: 16_316_671,
		gold: 16_766_720,
		goldenrod: 14_329_120,
		gray: 8_421_504,
		green: 32_768,
		greenyellow: 11_403_055,
		grey: 8_421_504,
		honeydew: 15_794_160,
		hotpink: 16_738_740,
		indianred: 13_458_524,
		indigo: 4_915_330,
		ivory: 16_777_200,
		khaki: 15_787_660,
		lavender: 15_132_410,
		lavenderblush: 16_773_365,
		lawngreen: 8_190_976,
		lemonchiffon: 16_775_885,
		lightblue: 11_393_254,
		lightcoral: 15_761_536,
		lightcyan: 14_745_599,
		lightgoldenrodyellow: 16_448_210,
		lightgray: 13_882_323,
		lightgreen: 9_498_256,
		lightgrey: 13_882_323,
		lightpink: 16_758_465,
		lightsalmon: 16_752_762,
		lightseagreen: 2_142_890,
		lightskyblue: 8_900_346,
		lightslategray: 7_833_753,
		lightslategrey: 7_833_753,
		lightsteelblue: 11_584_734,
		lightyellow: 16_777_184,
		lime: 65_280,
		limegreen: 3_329_330,
		linen: 16_445_670,
		magenta: 16_711_935,
		maroon: 8_388_608,
		mediumaquamarine: 6_737_322,
		mediumblue: 205,
		mediumorchid: 12_211_667,
		mediumpurple: 9_662_683,
		mediumseagreen: 3_978_097,
		mediumslateblue: 8_087_790,
		mediumspringgreen: 64_154,
		mediumturquoise: 4_772_300,
		mediumvioletred: 13_047_173,
		midnightblue: 1_644_912,
		mintcream: 16_121_850,
		mistyrose: 16_770_273,
		moccasin: 16_770_229,
		navajowhite: 16_768_685,
		navy: 128,
		oldlace: 16_643_558,
		olive: 8_421_376,
		olivedrab: 7_048_739,
		orange: 16_753_920,
		orangered: 16_729_344,
		orchid: 14_315_734,
		palegoldenrod: 15_657_130,
		palegreen: 10_025_880,
		paleturquoise: 11_529_966,
		palevioletred: 14_381_203,
		papayawhip: 16_773_077,
		peachpuff: 16_767_673,
		peru: 13_468_991,
		pink: 16_761_035,
		plum: 14_524_637,
		powderblue: 11_591_910,
		purple: 8_388_736,
		rebeccapurple: 6_697_881,
		red: 16_711_680,
		rosybrown: 12_357_519,
		royalblue: 4_286_945,
		saddlebrown: 9_127_187,
		salmon: 16_416_882,
		sandybrown: 16_032_864,
		seagreen: 3_050_327,
		seashell: 16_774_638,
		sienna: 10_506_797,
		silver: 12_632_256,
		skyblue: 8_900_331,
		slateblue: 6_970_061,
		slategray: 7_372_944,
		slategrey: 7_372_944,
		snow: 16_775_930,
		springgreen: 65_407,
		steelblue: 4_620_980,
		tan: 13_808_780,
		teal: 32_896,
		thistle: 14_204_888,
		tomato: 16_737_095,
		turquoise: 4_251_856,
		violet: 15_631_086,
		wheat: 16_113_331,
		white: 16_777_215,
		whitesmoke: 16_119_285,
		yellow: 16_776_960,
		yellowgreen: 10_145_074,
	};
ep(Ta, aa, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: Gm,
	formatHex: Gm,
	formatHex8: Lde,
	formatHsl: Ade,
	formatRgb: Km,
	toString: Km,
});
function Gm() {
	return this.rgb().formatHex();
}
function Lde() {
	return this.rgb().formatHex8();
}
function Ade() {
	return l1(this).formatHsl();
}
function Km() {
	return this.rgb().formatRgb();
}
function aa(e) {
	let t, r;
	return (
		(e = (e + "").trim().toLowerCase()),
		(t = xde.exec(e))
			? ((r = t[1].length),
				(t = Number.parseInt(t[1], 16)),
				r === 6
					? Xm(t)
					: r === 3
						? new qn(
								((t >> 8) & 15) | ((t >> 4) & 240),
								((t >> 4) & 15) | (t & 240),
								((t & 15) << 4) | (t & 15),
								1,
							)
						: r === 8
							? mc(
									(t >> 24) & 255,
									(t >> 16) & 255,
									(t >> 8) & 255,
									(t & 255) / 255,
								)
							: r === 4
								? mc(
										((t >> 12) & 15) | ((t >> 8) & 240),
										((t >> 8) & 15) | ((t >> 4) & 240),
										((t >> 4) & 15) | (t & 240),
										(((t & 15) << 4) | (t & 15)) / 255,
									)
								: undefined)
			: (t = Sde.exec(e))
				? new qn(t[1], t[2], t[3], 1)
				: (t = _de.exec(e))
					? new qn(
							(t[1] * 255) / 100,
							(t[2] * 255) / 100,
							(t[3] * 255) / 100,
							1,
						)
					: (t = kde.exec(e))
						? mc(t[1], t[2], t[3], t[4])
						: (t = Tde.exec(e))
							? mc(
									(t[1] * 255) / 100,
									(t[2] * 255) / 100,
									(t[3] * 255) / 100,
									t[4],
								)
							: (t = Cde.exec(e))
								? Jm(t[1], t[2] / 100, t[3] / 100, 1)
								: (t = Ede.exec(e))
									? Jm(t[1], t[2] / 100, t[3] / 100, t[4])
									: Object.hasOwn(jm, e)
										? Xm(jm[e])
										: e === "transparent"
											? new qn(Number.NaN, Number.NaN, Number.NaN, 0)
											: undefined
	);
}
function Xm(e) {
	return new qn((e >> 16) & 255, (e >> 8) & 255, e & 255, 1);
}
function mc(e, t, r, o) {
	return o <= 0 && (e = t = r = Number.NaN), new qn(e, t, r, o);
}
function Mde(e) {
	return (
		e instanceof Ta || (e = aa(e)),
		e ? ((e = e.rgb()), new qn(e.r, e.g, e.b, e.opacity)) : new qn()
	);
}
function Zd(e, t, r, o) {
	return arguments.length === 1 ? Mde(e) : new qn(e, t, r, o ?? 1);
}
function qn(e, t, r, o) {
	(this.r = +e), (this.g = +t), (this.b = +r), (this.opacity = +o);
}
ep(
	qn,
	Zd,
	s1(Ta, {
		brighter(e) {
			return (
				(e = e == undefined ? cu : cu ** e),
				new qn(this.r * e, this.g * e, this.b * e, this.opacity)
			);
		},
		darker(e) {
			return (
				(e = e == undefined ? sa : sa ** e),
				new qn(this.r * e, this.g * e, this.b * e, this.opacity)
			);
		},
		rgb() {
			return this;
		},
		clamp() {
			return new qn(No(this.r), No(this.g), No(this.b), uu(this.opacity));
		},
		displayable() {
			return (
				this.r >= -0.5 &&
				this.r < 255.5 &&
				this.g >= -0.5 &&
				this.g < 255.5 &&
				this.b >= -0.5 &&
				this.b < 255.5 &&
				this.opacity >= 0 &&
				this.opacity <= 1
			);
		},
		hex: Ym,
		formatHex: Ym,
		formatHex8: Nde,
		formatRgb: Zm,
		toString: Zm,
	}),
);
function Ym() {
	return `#${Lo(this.r)}${Lo(this.g)}${Lo(this.b)}`;
}
function Nde() {
	return `#${Lo(this.r)}${Lo(this.g)}${Lo(this.b)}${Lo(
		(isNaN(this.opacity) ? 1 : this.opacity) * 255,
	)}`;
}
function Zm() {
	const e = uu(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${No(this.r)}, ${No(this.g)}, ${No(this.b)}${
		e === 1 ? ")" : `, ${e})`
	}`;
}
function uu(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function No(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function Lo(e) {
	return (e = No(e)), (e < 16 ? "0" : "") + e.toString(16);
}
function Jm(e, t, r, o) {
	return (
		o <= 0
			? (e = t = r = Number.NaN)
			: (r <= 0 || r >= 1
				? (e = t = Number.NaN)
				: t <= 0 && (e = Number.NaN)),
		new xr(e, t, r, o)
	);
}
function l1(e) {
	if (e instanceof xr) {
		return new xr(e.h, e.s, e.l, e.opacity);
	}
	if ((e instanceof Ta || (e = aa(e)), !e)) {
		return new xr();
	}
	if (e instanceof xr) {
		return e;
	}
	e = e.rgb();
	let t = e.r / 255,
		r = e.g / 255,
		o = e.b / 255,
		s = Math.min(t, r, o),
		c = Math.max(t, r, o),
		f = Number.NaN,
		d = c - s,
		h = (c + s) / 2;
	return (
		d
			? (t === c
					? (f = (r - o) / d + (r < o) * 6)
					: (r === c
						? (f = (o - t) / d + 2)
						: (f = (t - r) / d + 4)),
				(d /= h < 0.5 ? c + s : 2 - c - s),
				(f *= 60))
			: (d = h > 0 && h < 1 ? 0 : f),
		new xr(f, d, h, e.opacity)
	);
}
function $de(e, t, r, o) {
	return arguments.length === 1 ? l1(e) : new xr(e, t, r, o ?? 1);
}
function xr(e, t, r, o) {
	(this.h = +e), (this.s = +t), (this.l = +r), (this.opacity = +o);
}
ep(
	xr,
	$de,
	s1(Ta, {
		brighter(e) {
			return (
				(e = e == undefined ? cu : cu ** e),
				new xr(this.h, this.s, this.l * e, this.opacity)
			);
		},
		darker(e) {
			return (
				(e = e == undefined ? sa : sa ** e),
				new xr(this.h, this.s, this.l * e, this.opacity)
			);
		},
		rgb() {
			const e = (this.h % 360) + (this.h < 0) * 360,
				t = isNaN(e) || isNaN(this.s) ? 0 : this.s,
				r = this.l,
				o = r + (r < 0.5 ? r : 1 - r) * t,
				s = 2 * r - o;
			return new qn(
				ud(e >= 240 ? e - 240 : e + 120, s, o),
				ud(e, s, o),
				ud(e < 120 ? e + 240 : e - 120, s, o),
				this.opacity,
			);
		},
		clamp() {
			return new xr(Qm(this.h), yc(this.s), yc(this.l), uu(this.opacity));
		},
		displayable() {
			return (
				((this.s >= 0 && this.s <= 1) || isNaN(this.s)) &&
				this.l >= 0 &&
				this.l <= 1 &&
				this.opacity >= 0 &&
				this.opacity <= 1
			);
		},
		formatHsl() {
			const e = uu(this.opacity);
			return `${e === 1 ? "hsl(" : "hsla("}${Qm(this.h)}, ${yc(this.s) * 100}%, ${
				yc(this.l) * 100
			}%${e === 1 ? ")" : `, ${e})`}`;
		},
	}),
);
function Qm(e) {
	return (e = (e || 0) % 360), e < 0 ? e + 360 : e;
}
function yc(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function ud(e, t, r) {
	return (
		(e < 60
			? t + ((r - t) * e) / 60
			: e < 180
				? r
				: e < 240
					? t + ((r - t) * (240 - e)) / 60
					: t) * 255
	);
}
const a1 = (e) => () => e;
function Pde(e, t) {
	return (r) => e + r * t;
}
function Ode(e, t, r) {
	return (e **= r), (t = t ** r - e), (r = 1 / r), (o) => (e + o * t) ** r;
}
function Rde(e) {
	return (e = +e) == 1
		? c1
		: (t, r) => (r - t ? Ode(t, r, e) : a1(isNaN(t) ? r : t));
}
function c1(e, t) {
	const r = t - e;
	return r ? Pde(e, r) : a1(isNaN(e) ? t : e);
}
const e0 = (function e(t) {
	const r = Rde(t);
	function o(s, c) {
		const f = r((s = Zd(s)).r, (c = Zd(c)).r),
			d = r(s.g, c.g),
			h = r(s.b, c.b),
			p = c1(s.opacity, c.opacity);
		return (v) => (
			(s.r = f(v)), (s.g = d(v)), (s.b = h(v)), (s.opacity = p(v)), s + ""
		);
	}
	return (o.gamma = e), o;
})(1);
function Ui(e, t) {
	return (e = +e), (t = +t), (r) => e * (1 - r) + t * r;
}
const Jd = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
	fd = new RegExp(Jd.source, "g");
function Dde(e) {
	return () => e;
}
function zde(e) {
	return (t) => e(t) + "";
}
function Ide(e, t) {
	let r = (Jd.lastIndex = fd.lastIndex = 0),
		o,
		s,
		c,
		f = -1,
		d = [],
		h = [];
	for (e += "", t += ""; (o = Jd.exec(e)) && (s = fd.exec(t)); ) {
		(c = s.index) > r &&
			((c = t.slice(r, c)), d[f] ? (d[f] += c) : (d[++f] = c)),
			(o = o[0]) === (s = s[0])
				? (d[f]
					? (d[f] += s)
					: (d[++f] = s))
				: ((d[++f] = undefined), h.push({ i: f, x: Ui(o, s) })),
			(r = fd.lastIndex);
	}
	return (
		r < t.length && ((c = t.slice(r)), d[f] ? (d[f] += c) : (d[++f] = c)),
		d.length < 2
			? (h[0]
				? zde(h[0].x)
				: Dde(t))
			: ((t = h.length),
				(p) => {
					for (let v = 0, m; v < t; ++v) {
						d[(m = h[v]).i] = m.x(p);
					}
					return d.join("");
				})
	);
}
const t0 = 180 / Math.PI,
	Qd = {
		translateX: 0,
		translateY: 0,
		rotate: 0,
		skewX: 0,
		scaleX: 1,
		scaleY: 1,
	};
function u1(e, t, r, o, s, c) {
	let f, d, h;
	return (
		(f = Math.sqrt(e * e + t * t)) && ((e /= f), (t /= f)),
		(h = e * r + t * o) && ((r -= e * h), (o -= t * h)),
		(d = Math.sqrt(r * r + o * o)) && ((r /= d), (o /= d), (h /= d)),
		e * o < t * r && ((e = -e), (t = -t), (h = -h), (f = -f)),
		{
			translateX: s,
			translateY: c,
			rotate: Math.atan2(t, e) * t0,
			skewX: Math.atan(h) * t0,
			scaleX: f,
			scaleY: d,
		}
	);
}
let bc;
function Fde(e) {
	const t = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(
		e + "",
	);
	return t.isIdentity ? Qd : u1(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Hde(e) {
	return e == undefined ||
		(bc || (bc = document.createElementNS("http://www.w3.org/2000/svg", "g")),
		bc.setAttribute("transform", e),
		!(e = bc.transform.baseVal.consolidate()))
		? Qd
		: ((e = e.matrix), u1(e.a, e.b, e.c, e.d, e.e, e.f));
}
function f1(e, t, r, o) {
	function s(p) {
		return p.length > 0 ? p.pop() + " " : "";
	}
	function c(p, v, m, b, w, M) {
		if (p !== m || v !== b) {
			const C = w.push("translate(", undefined, t, undefined, r);
			M.push({ i: C - 4, x: Ui(p, m) }, { i: C - 2, x: Ui(v, b) });
		} else {
			(m || b) && w.push("translate(" + m + t + b + r);
		}
	}
	function f(p, v, m, b) {
		p !== v
			? (p - v > 180 ? (v += 360) : v - p > 180 && (p += 360),
				b.push({ i: m.push(s(m) + "rotate(", undefined, o) - 2, x: Ui(p, v) }))
			: v && m.push(s(m) + "rotate(" + v + o);
	}
	function d(p, v, m, b) {
		p !== v
			? b.push({ i: m.push(s(m) + "skewX(", undefined, o) - 2, x: Ui(p, v) })
			: v && m.push(s(m) + "skewX(" + v + o);
	}
	function h(p, v, m, b, w, M) {
		if (p !== m || v !== b) {
			const C = w.push(s(w) + "scale(", undefined, ",", undefined, ")");
			M.push({ i: C - 4, x: Ui(p, m) }, { i: C - 2, x: Ui(v, b) });
		} else {
			(m !== 1 || b !== 1) && w.push(s(w) + "scale(" + m + "," + b + ")");
		}
	}
	return (p, v) => {
		const m = [],
			b = [];
		return (
			(p = e(p)),
			(v = e(v)),
			c(p.translateX, p.translateY, v.translateX, v.translateY, m, b),
			f(p.rotate, v.rotate, m, b),
			d(p.skewX, v.skewX, m, b),
			h(p.scaleX, p.scaleY, v.scaleX, v.scaleY, m, b),
			(p = v = undefined),
			(w) => {
				for (let M = -1, C = b.length, E; ++M < C; ) {
					m[(E = b[M]).i] = E.x(w);
				}
				return m.join("");
			}
		);
	};
}
const qde = f1(Fde, "px, ", "px)", "deg)"),
	Bde = f1(Hde, ", ", ")", ")"),
	Wde = 1e-12;
function n0(e) {
	return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Ude(e) {
	return ((e = Math.exp(e)) - 1 / e) / 2;
}
function Vde(e) {
	return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const jde = (function e(t, r, o) {
	function s(c, f) {
		let d = c[0],
			h = c[1],
			p = c[2],
			v = f[0],
			m = f[1],
			b = f[2],
			w = v - d,
			M = m - h,
			C = w * w + M * M,
			E,
			L;
		if (C < Wde) {
			(L = Math.log(b / p) / t),
				(E = (U) => [d + U * w, h + U * M, p * Math.exp(t * U * L)]);
		} else {
			const N = Math.sqrt(C),
				P = (b * b - p * p + o * C) / (2 * p * r * N),
				A = (b * b - p * p - o * C) / (2 * b * r * N),
				z = Math.log(Math.sqrt(P * P + 1) - P),
				W = Math.log(Math.sqrt(A * A + 1) - A);
			(L = (W - z) / t),
				(E = (U) => {
					const re = U * L,
						Q = n0(z),
						G = (p / (r * N)) * (Q * Vde(t * re + z) - Ude(z));
					return [d + G * w, h + G * M, (p * Q) / n0(t * re + z)];
				});
		}
		return (E.duration = (L * 1e3 * t) / Math.SQRT2), E;
	}
	return (
		(s.rho = (c) => {
			const f = Math.max(0.001, +c),
				d = f * f,
				h = d * d;
			return e(f, d, h);
		}),
		s
	);
})(Math.SQRT2, 2, 4);
let Fs = 0,
	Al = 0,
	Tl = 0,
	d1 = 1e3,
	fu,
	Ml,
	du = 0,
	Do = 0,
	Uu = 0,
	ca = typeof performance === "object" && performance.now ? performance : Date,
	h1 =
		typeof window === "object" && window.requestAnimationFrame
			? window.requestAnimationFrame.bind(window)
			: (e) => {
					setTimeout(e, 17);
				};
function tp() {
	return Do || (h1(Gde), (Do = ca.now() + Uu));
}
function Gde() {
	Do = 0;
}
function hu() {
	this._call = this._time = this._next = undefined;
}
hu.prototype = np.prototype = {
	constructor: hu,
	restart(e, t, r) {
		if (typeof e !== "function") {
			throw new TypeError("callback is not a function");
		}
		(r = (r == undefined ? tp() : +r) + (t == undefined ? 0 : +t)),
			!this._next &&
				Ml !== this &&
				(Ml ? (Ml._next = this) : (fu = this), (Ml = this)),
			(this._call = e),
			(this._time = r),
			eh();
	},
	stop() {
		this._call && ((this._call = undefined), (this._time = 1 / 0), eh());
	},
};
function np(e, t, r) {
	const o = new hu();
	return o.restart(e, t, r), o;
}
function Kde() {
	tp(), ++Fs;
	for (let e = fu, t; e; ) {
		(t = Do - e._time) >= 0 && e._call.call(void 0, t), (e = e._next);
	}
	--Fs;
}
function r0() {
	(Do = (du = ca.now()) + Uu), (Fs = Al = 0);
	try {
		Kde();
	} finally {
		(Fs = 0), Yde(), (Do = 0);
	}
}
function Xde() {
	const e = ca.now(),
		t = e - du;
	t > d1 && ((Uu -= t), (du = e));
}
function Yde() {
	for (var e, t = fu, r, o = 1 / 0; t; ) {
		t._call
			? (o > t._time && (o = t._time), (e = t), (t = t._next))
			: ((r = t._next),
				(t._next = undefined),
				(t = e ? (e._next = r) : (fu = r)));
	}
	(Ml = e), eh(o);
}
function eh(e) {
	if (!Fs) {
		Al && (Al = clearTimeout(Al));
		const t = e - Do;
		t > 24
			? (e < 1 / 0 && (Al = setTimeout(r0, e - ca.now() - Uu)),
				Tl && (Tl = clearInterval(Tl)))
			: (Tl || ((du = ca.now()), (Tl = setInterval(Xde, d1))),
				(Fs = 1),
				h1(r0));
	}
}
function i0(e, t, r) {
	const o = new hu();
	return (
		(t = t == undefined ? 0 : +t),
		o.restart(
			(s) => {
				o.stop(), e(s + t);
			},
			t,
			r,
		),
		o
	);
}
const Zde = ka("start", "end", "cancel", "interrupt"),
	Jde = [],
	p1 = 0,
	o0 = 1,
	th = 2,
	Pc = 3,
	s0 = 4,
	nh = 5,
	Oc = 6;
function Vu(e, t, r, o, s, c) {
	const f = e.__transition;
	if (!f) {
		e.__transition = {};
	} else if (r in f) {
		return;
	}
	Qde(e, r, {
		name: t,
		index: o,
		group: s,
		on: Zde,
		tween: Jde,
		time: c.time,
		delay: c.delay,
		duration: c.duration,
		ease: c.ease,
		timer: undefined,
		state: p1,
	});
}
function rp(e, t) {
	const r = Ar(e, t);
	if (r.state > p1) {
		throw new Error("too late; already scheduled");
	}
	return r;
}
function Xr(e, t) {
	const r = Ar(e, t);
	if (r.state > Pc) {
		throw new Error("too late; already running");
	}
	return r;
}
function Ar(e, t) {
	let r = e.__transition;
	if (!(r && (r = r[t]))) {
		throw new Error("transition not found");
	}
	return r;
}
function Qde(e, t, r) {
	let o = e.__transition,
		s;
	(o[t] = r), (r.timer = np(c, 0, r.time));
	function c(p) {
		(r.state = o0),
			r.timer.restart(f, r.delay, r.time),
			r.delay <= p && f(p - r.delay);
	}
	function f(p) {
		let v, m, b, w;
		if (r.state !== o0) {
			return h();
		}
		for (v in o) {
			if (((w = o[v]), w.name === r.name)) {
				if (w.state === Pc) {
					return i0(f);
				}
				w.state === s0
					? ((w.state = Oc),
						w.timer.stop(),
						w.on.call("interrupt", e, e.__data__, w.index, w.group),
						delete o[v])
					: +v < t &&
						((w.state = Oc),
						w.timer.stop(),
						w.on.call("cancel", e, e.__data__, w.index, w.group),
						delete o[v]);
			}
		}
		if (
			(i0(() => {
				r.state === Pc &&
					((r.state = s0), r.timer.restart(d, r.delay, r.time), d(p));
			}),
			(r.state = th),
			r.on.call("start", e, e.__data__, r.index, r.group),
			r.state === th)
		) {
			for (
				r.state = Pc, s = new Array((b = r.tween.length)), v = 0, m = -1;
				v < b;
				++v
			) {
				(w = r.tween[v].value.call(e, e.__data__, r.index, r.group)) &&
					(s[++m] = w);
			}
			s.length = m + 1;
		}
	}
	function d(p) {
		for (
			let v =
					p < r.duration
						? r.ease.call(undefined, p / r.duration)
						: (r.timer.restart(h), (r.state = nh), 1),
				m = -1,
				b = s.length;
			++m < b;
		) {
			s[m].call(e, v);
		}
		r.state === nh && (r.on.call("end", e, e.__data__, r.index, r.group), h());
	}
	function h() {
		(r.state = Oc), r.timer.stop(), delete o[t];
		for (const p in o) {
			return;
		}
		delete e.__transition;
	}
}
function Rc(e, t) {
	let r = e.__transition,
		o,
		s,
		c = !0,
		f;
	if (r) {
		t = t == undefined ? undefined : t + "";
		for (f in r) {
			if ((o = r[f]).name !== t) {
				c = !1;
				continue;
			}
			(s = o.state > th && o.state < nh),
				(o.state = Oc),
				o.timer.stop(),
				o.on.call(s ? "interrupt" : "cancel", e, e.__data__, o.index, o.group),
				delete r[f];
		}
		c && delete e.__transition;
	}
}
function ehe(e) {
	return this.each(function () {
		Rc(this, e);
	});
}
function the(e, t) {
	let r, o;
	return function () {
		const s = Xr(this, e),
			c = s.tween;
		if (c !== r) {
			o = r = c;
			for (let f = 0, d = o.length; f < d; ++f) {
				if (o[f].name === t) {
					(o = [...o]), o.splice(f, 1);
					break;
				}
			}
		}
		s.tween = o;
	};
}
function nhe(e, t, r) {
	let o, s;
	if (typeof r !== "function") {
		throw new TypeError();
	}
	return function () {
		const c = Xr(this, e),
			f = c.tween;
		if (f !== o) {
			s = [...(o = f)];
			for (var d = { name: t, value: r }, h = 0, p = s.length; h < p; ++h) {
				if (s[h].name === t) {
					s[h] = d;
					break;
				}
			}
			h === p && s.push(d);
		}
		c.tween = s;
	};
}
function rhe(e, t) {
	const r = this._id;
	if (((e += ""), arguments.length < 2)) {
		for (let o = Ar(this.node(), r).tween, s = 0, c = o.length, f; s < c; ++s) {
			if ((f = o[s]).name === e) {
				return f.value;
			}
		}
		return;
	}
	return this.each((t == undefined ? the : nhe)(r, e, t));
}
function ip(e, t, r) {
	const o = e._id;
	return (
		e.each(function () {
			const s = Xr(this, o);
			(s.value || (s.value = {}))[t] = r.apply(this, arguments);
		}),
		(s) => Ar(s, o).value[t]
	);
}
function g1(e, t) {
	let r;
	return (
		typeof t === "number"
			? Ui
			: t instanceof aa
				? e0
				: (r = aa(t))
					? ((t = r), e0)
					: Ide
	)(e, t);
}
function ihe(e) {
	return function () {
		this.removeAttribute(e);
	};
}
function ohe(e) {
	return function () {
		this.removeAttributeNS(e.space, e.local);
	};
}
function she(e, t, r) {
	let o,
		s = r + "",
		c;
	return function () {
		const f = this.getAttribute(e);
		return f === s ? undefined : (f === o ? c : (c = t((o = f), r)));
	};
}
function lhe(e, t, r) {
	let o,
		s = r + "",
		c;
	return function () {
		const f = this.getAttributeNS(e.space, e.local);
		return f === s ? undefined : (f === o ? c : (c = t((o = f), r)));
	};
}
function ahe(e, t, r) {
	let o, s, c;
	return function () {
		let f,
			d = r(this),
			h;
		return d == undefined
			? void this.removeAttribute(e)
			: ((f = this.getAttribute(e)),
				(h = d + ""),
				f === h
					? undefined
					: (f === o && h === s
						? c
						: ((s = h), (c = t((o = f), d)))));
	};
}
function che(e, t, r) {
	let o, s, c;
	return function () {
		let f,
			d = r(this),
			h;
		return d == undefined
			? void this.removeAttributeNS(e.space, e.local)
			: ((f = this.getAttributeNS(e.space, e.local)),
				(h = d + ""),
				f === h
					? undefined
					: (f === o && h === s
						? c
						: ((s = h), (c = t((o = f), d)))));
	};
}
function uhe(e, t) {
	const r = Wu(e),
		o = r === "transform" ? Bde : g1;
	return this.attrTween(
		e,
		typeof t === "function"
			? (r.local ? che : ahe)(r, o, ip(this, "attr." + e, t))
			: (t == null
				? (r.local ? ohe : ihe)(r)
				: (r.local ? lhe : she)(r, o, t)),
	);
}
function fhe(e, t) {
	return function (r) {
		this.setAttribute(e, t.call(this, r));
	};
}
function dhe(e, t) {
	return function (r) {
		this.setAttributeNS(e.space, e.local, t.call(this, r));
	};
}
function hhe(e, t) {
	let r, o;
	function s() {
		const c = t.apply(this, arguments);
		return c !== o && (r = (o = c) && dhe(e, c)), r;
	}
	return (s._value = t), s;
}
function phe(e, t) {
	let r, o;
	function s() {
		const c = t.apply(this, arguments);
		return c !== o && (r = (o = c) && fhe(e, c)), r;
	}
	return (s._value = t), s;
}
function ghe(e, t) {
	let r = "attr." + e;
	if (arguments.length < 2) {
		return (r = this.tween(r)) && r._value;
	}
	if (t == undefined) {
		return this.tween(r, undefined);
	}
	if (typeof t !== "function") {
		throw new TypeError();
	}
	const o = Wu(e);
	return this.tween(r, (o.local ? hhe : phe)(o, t));
}
function vhe(e, t) {
	return function () {
		rp(this, e).delay = +t.apply(this, arguments);
	};
}
function mhe(e, t) {
	return (
		(t = +t),
		function () {
			rp(this, e).delay = t;
		}
	);
}
function yhe(e) {
	const t = this._id;
	return arguments.length > 0
		? this.each((typeof e === "function" ? vhe : mhe)(t, e))
		: Ar(this.node(), t).delay;
}
function bhe(e, t) {
	return function () {
		Xr(this, e).duration = +t.apply(this, arguments);
	};
}
function whe(e, t) {
	return (
		(t = +t),
		function () {
			Xr(this, e).duration = t;
		}
	);
}
function xhe(e) {
	const t = this._id;
	return arguments.length > 0
		? this.each((typeof e === "function" ? bhe : whe)(t, e))
		: Ar(this.node(), t).duration;
}
function She(e, t) {
	if (typeof t !== "function") {
		throw new TypeError();
	}
	return function () {
		Xr(this, e).ease = t;
	};
}
function _he(e) {
	const t = this._id;
	return arguments.length > 0 ? this.each(She(t, e)) : Ar(this.node(), t).ease;
}
function khe(e, t) {
	return function () {
		const r = t.apply(this, arguments);
		if (typeof r !== "function") {
			throw new TypeError();
		}
		Xr(this, e).ease = r;
	};
}
function The(e) {
	if (typeof e !== "function") {
		throw new TypeError();
	}
	return this.each(khe(this._id, e));
}
function Che(e) {
	typeof e !== "function" && (e = Kw(e));
	for (
		var t = this._groups, r = t.length, o = new Array(r), s = 0;
		s < r;
		++s
	) {
		for (let c = t[s], f = c.length, d = (o[s] = []), h, p = 0; p < f; ++p) {
			(h = c[p]) && e.call(h, h.__data__, p, c) && d.push(h);
		}
	}
	return new mi(o, this._parents, this._name, this._id);
}
function Ehe(e) {
	if (e._id !== this._id) {
		throw new Error();
	}
	for (
		var t = this._groups,
			r = e._groups,
			o = t.length,
			s = r.length,
			c = Math.min(o, s),
			f = new Array(o),
			d = 0;
		d < c;
		++d
	) {
		for (
			let h = t[d], p = r[d], v = h.length, m = (f[d] = new Array(v)), b, w = 0;
			w < v;
			++w
		) {
			(b = h[w] || p[w]) && (m[w] = b);
		}
	}
	for (; d < o; ++d) {
		f[d] = t[d];
	}
	return new mi(f, this._parents, this._name, this._id);
}
function Lhe(e) {
	return (e + "")
		.trim()
		.split(/^|\s+/)
		.every((t) => {
			const r = t.indexOf(".");
			return r >= 0 && (t = t.slice(0, r)), !t || t === "start";
		});
}
function Ahe(e, t, r) {
	let o,
		s,
		c = Lhe(t) ? rp : Xr;
	return function () {
		const f = c(this, e),
			d = f.on;
		d !== o && (s = (o = d).copy()).on(t, r), (f.on = s);
	};
}
function Mhe(e, t) {
	const r = this._id;
	return arguments.length < 2
		? Ar(this.node(), r).on.on(e)
		: this.each(Ahe(r, e, t));
}
function Nhe(e) {
	return function () {
		const t = this.parentNode;
		for (const r in this.__transition) {
			if (+r !== e) {return;}
		}
		t && t.removeChild(this);
	};
}
function $he() {
	return this.on("end.remove", Nhe(this._id));
}
function Phe(e) {
	const t = this._name,
		r = this._id;
	typeof e !== "function" && (e = Jh(e));
	for (
		var o = this._groups, s = o.length, c = new Array(s), f = 0;
		f < s;
		++f
	) {
		for (
			let d = o[f], h = d.length, p = (c[f] = new Array(h)), v, m, b = 0;
			b < h;
			++b
		) {
			(v = d[b]) &&
				(m = e.call(v, v.__data__, b, d)) &&
				("__data__" in v && (m.__data__ = v.__data__),
				(p[b] = m),
				Vu(p[b], t, r, b, p, Ar(v, r)));
		}
	}
	return new mi(c, this._parents, t, r);
}
function Ohe(e) {
	const t = this._name,
		r = this._id;
	typeof e !== "function" && (e = Gw(e));
	for (var o = this._groups, s = o.length, c = [], f = [], d = 0; d < s; ++d) {
		for (let h = o[d], p = h.length, v, m = 0; m < p; ++m) {
			if ((v = h[m])) {
				for (
					var b = e.call(v, v.__data__, m, h),
						w,
						M = Ar(v, r),
						C = 0,
						E = b.length;
					C < E;
					++C
				) {
					(w = b[C]) && Vu(w, t, r, C, b, M);
				}
				c.push(b), f.push(v);
			}
		}
	}
	return new mi(c, f, t, r);
}
const Rhe = _a.prototype.constructor;
function Dhe() {
	return new Rhe(this._groups, this._parents);
}
function zhe(e, t) {
	let r, o, s;
	return function () {
		const c = Is(this, e),
			f = (this.style.removeProperty(e), Is(this, e));
		return c === f
			? undefined
			: (c === r && f === o
				? s
				: (s = t((r = c), (o = f))));
	};
}
function v1(e) {
	return function () {
		this.style.removeProperty(e);
	};
}
function Ihe(e, t, r) {
	let o,
		s = r + "",
		c;
	return function () {
		const f = Is(this, e);
		return f === s ? undefined : (f === o ? c : (c = t((o = f), r)));
	};
}
function Fhe(e, t, r) {
	let o, s, c;
	return function () {
		let f = Is(this, e),
			d = r(this),
			h = d + "";
		return (
			d == undefined && (h = d = (this.style.removeProperty(e), Is(this, e))),
			f === h
				? undefined
				: (f === o && h === s
					? c
					: ((s = h), (c = t((o = f), d))))
		);
	};
}
function Hhe(e, t) {
	let r,
		o,
		s,
		c = "style." + t,
		f = "end." + c,
		d;
	return function () {
		const h = Xr(this, e),
			p = h.on,
			v = h.value[c] == undefined ? d || (d = v1(t)) : void 0;
		(p !== r || s !== v) && (o = (r = p).copy()).on(f, (s = v)), (h.on = o);
	};
}
function qhe(e, t, r) {
	const o = (e += "") == "transform" ? qde : g1;
	return t == undefined
		? this.styleTween(e, zhe(e, o)).on("end.style." + e, v1(e))
		: (typeof t == "function"
			? this.styleTween(e, Fhe(e, o, ip(this, "style." + e, t))).each(
					Hhe(this._id, e),
				)
			: this.styleTween(e, Ihe(e, o, t), r).on("end.style." + e, null));
}
function Bhe(e, t, r) {
	return function (o) {
		this.style.setProperty(e, t.call(this, o), r);
	};
}
function Whe(e, t, r) {
	let o, s;
	function c() {
		const f = t.apply(this, arguments);
		return f !== s && (o = (s = f) && Bhe(e, f, r)), o;
	}
	return (c._value = t), c;
}
function Uhe(e, t, r) {
	let o = "style." + (e += "");
	if (arguments.length < 2) {
		return (o = this.tween(o)) && o._value;
	}
	if (t == undefined) {
		return this.tween(o, undefined);
	}
	if (typeof t !== "function") {
		throw new TypeError();
	}
	return this.tween(o, Whe(e, t, r ?? ""));
}
function Vhe(e) {
	return function () {
		this.textContent = e;
	};
}
function jhe(e) {
	return function () {
		const t = e(this);
		this.textContent = t ?? "";
	};
}
function Ghe(e) {
	return this.tween(
		"text",
		typeof e === "function"
			? jhe(ip(this, "text", e))
			: Vhe(e == undefined ? "" : e + ""),
	);
}
function Khe(e) {
	return function (t) {
		this.textContent = e.call(this, t);
	};
}
function Xhe(e) {
	let t, r;
	function o() {
		const s = e.apply(this, arguments);
		return s !== r && (t = (r = s) && Khe(s)), t;
	}
	return (o._value = e), o;
}
function Yhe(e) {
	let t = "text";
	if (arguments.length === 0) {
		return (t = this.tween(t)) && t._value;
	}
	if (e == undefined) {
		return this.tween(t, undefined);
	}
	if (typeof e !== "function") {
		throw new TypeError();
	}
	return this.tween(t, Xhe(e));
}
function Zhe() {
	for (
		var e = this._name,
			t = this._id,
			r = m1(),
			o = this._groups,
			s = o.length,
			c = 0;
		c < s;
		++c
	) {
		for (let f = o[c], d = f.length, h, p = 0; p < d; ++p) {
			if ((h = f[p])) {
				const v = Ar(h, t);
				Vu(h, e, r, p, f, {
					time: v.time + v.delay + v.duration,
					delay: 0,
					duration: v.duration,
					ease: v.ease,
				});
			}
		}
	}
	return new mi(o, this._parents, e, r);
}
function Jhe() {
	let e,
		t,
		o = this._id,
		s = this.size();
	return new Promise((c, f) => {
		const d = { value: f },
			h = {
				value() {
					--s === 0 && c();
				},
			};
		this.each(function () {
			const p = Xr(this, o),
				v = p.on;
			v !== e &&
				((t = (e = v).copy()),
				t._.cancel.push(d),
				t._.interrupt.push(d),
				t._.end.push(h)),
				(p.on = t);
		}),
			s === 0 && c();
	});
}
let Qhe = 0;
function mi(e, t, r, o) {
	(this._groups = e), (this._parents = t), (this._name = r), (this._id = o);
}
function m1() {
	return ++Qhe;
}
const oi = _a.prototype;
mi.prototype = {
	constructor: mi,
	select: Phe,
	selectAll: Ohe,
	selectChild: oi.selectChild,
	selectChildren: oi.selectChildren,
	filter: Che,
	merge: Ehe,
	selection: Dhe,
	transition: Zhe,
	call: oi.call,
	nodes: oi.nodes,
	node: oi.node,
	size: oi.size,
	empty: oi.empty,
	each: oi.each,
	on: Mhe,
	attr: uhe,
	attrTween: ghe,
	style: qhe,
	styleTween: Uhe,
	text: Ghe,
	textTween: Yhe,
	remove: $he,
	tween: rhe,
	delay: yhe,
	duration: xhe,
	ease: _he,
	easeVarying: The,
	end: Jhe,
	[Symbol.iterator]: oi[Symbol.iterator],
};
function epe(e) {
	return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
const tpe = { time: undefined, delay: 0, duration: 250, ease: epe };
function npe(e, t) {
	for (var r; !((r = e.__transition) && (r = r[t])); ) {
		if (!(e = e.parentNode)) {
			throw new Error(`transition ${t} not found`);
		}
	}
	return r;
}
function rpe(e) {
	let t, r;
	e instanceof mi
		? ((t = e._id), (e = e._name))
		: ((t = m1()),
			((r = tpe).time = tp()),
			(e = e == undefined ? undefined : e + ""));
	for (var o = this._groups, s = o.length, c = 0; c < s; ++c) {
		for (let f = o[c], d = f.length, h, p = 0; p < d; ++p) {
			(h = f[p]) && Vu(h, e, t, p, f, r || npe(h, t));
		}
	}
	return new mi(o, this._parents, e, t);
}
_a.prototype.interrupt = ehe;
_a.prototype.transition = rpe;
const wc = (e) => () => e;
function ipe(e, { sourceEvent: t, target: r, transform: o, dispatch: s }) {
	Object.defineProperties(this, {
		type: { value: e, enumerable: !0, configurable: !0 },
		sourceEvent: { value: t, enumerable: !0, configurable: !0 },
		target: { value: r, enumerable: !0, configurable: !0 },
		transform: { value: o, enumerable: !0, configurable: !0 },
		_: { value: s },
	});
}
function fi(e, t, r) {
	(this.k = e), (this.x = t), (this.y = r);
}
fi.prototype = {
	constructor: fi,
	scale(e) {
		return e === 1 ? this : new fi(this.k * e, this.x, this.y);
	},
	translate(e, t) {
		return (e === 0) & (t === 0)
			? this
			: new fi(this.k, this.x + this.k * e, this.y + this.k * t);
	},
	apply(e) {
		return [e[0] * this.k + this.x, e[1] * this.k + this.y];
	},
	applyX(e) {
		return e * this.k + this.x;
	},
	applyY(e) {
		return e * this.k + this.y;
	},
	invert(e) {
		return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
	},
	invertX(e) {
		return (e - this.x) / this.k;
	},
	invertY(e) {
		return (e - this.y) / this.k;
	},
	rescaleX(e) {
		return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
	},
	rescaleY(e) {
		return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
	},
	toString() {
		return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
	},
};
const op = new fi(1, 0, 0);
fi.prototype;
function dd(e) {
	e.stopImmediatePropagation();
}
function Cl(e) {
	e.preventDefault(), e.stopImmediatePropagation();
}
function ope(e) {
	return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function spe() {
	let e = this;
	return e instanceof SVGElement
		? ((e = e.ownerSVGElement || e),
			e.hasAttribute("viewBox")
				? ((e = e.viewBox.baseVal),
					[
						[e.x, e.y],
						[e.x + e.width, e.y + e.height],
					])
				: [
						[0, 0],
						[e.width.baseVal.value, e.height.baseVal.value],
					])
		: [
				[0, 0],
				[e.clientWidth, e.clientHeight],
			];
}
function l0() {
	return this.__zoom || op;
}
function lpe(e) {
	return (
		-e.deltaY *
		(e.deltaMode === 1 ? 0.05 : (e.deltaMode ? 1 : 0.002)) *
		(e.ctrlKey ? 10 : 1)
	);
}
function ape() {
	return navigator.maxTouchPoints || "ontouchstart" in this;
}
function cpe(e, t, r) {
	const o = e.invertX(t[0][0]) - r[0][0],
		s = e.invertX(t[1][0]) - r[1][0],
		c = e.invertY(t[0][1]) - r[0][1],
		f = e.invertY(t[1][1]) - r[1][1];
	return e.translate(
		s > o ? (o + s) / 2 : Math.min(0, o) || Math.max(0, s),
		f > c ? (c + f) / 2 : Math.min(0, c) || Math.max(0, f),
	);
}
function upe() {
	let e = ope,
		t = spe,
		r = cpe,
		o = lpe,
		s = ape,
		c = [0, 1 / 0],
		f = [
			[-1 / 0, -1 / 0],
			[1 / 0, 1 / 0],
		],
		d = 250,
		h = jde,
		p = ka("start", "zoom", "end"),
		v,
		m,
		b,
		w = 500,
		M = 150,
		C = 0,
		E = 10;
	function L(F) {
		F.property("__zoom", l0)
			.on("wheel.zoom", re, { passive: !1 })
			.on("mousedown.zoom", Q)
			.on("dblclick.zoom", G)
			.filter(s)
			.on("touchstart.zoom", te)
			.on("touchmove.zoom", Z)
			.on("touchend.zoom touchcancel.zoom", q)
			.style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
	}
	(L.transform = (F, k, B, V) => {
		const ie = F.selection ? F.selection() : F;
		ie.property("__zoom", l0),
			F !== ie
				? z(F, k, B, V)
				: ie.interrupt().each(function () {
						W(this, arguments)
							.event(V)
							.start()
							.zoom(
								undefined,
								typeof k === "function" ? k.apply(this, arguments) : k,
							)
							.end();
					});
	}),
		(L.scaleBy = (F, k, B, V) => {
			L.scaleTo(
				F,
				function () {
					const ie = this.__zoom.k,
						ye = typeof k === "function" ? k.apply(this, arguments) : k;
					return ie * ye;
				},
				B,
				V,
			);
		}),
		(L.scaleTo = (F, k, B, V) => {
			L.transform(
				F,
				function () {
					const ie = t.apply(this, arguments),
						ye = this.__zoom,
						Ne =
							B == undefined
								? A(ie)
								: (typeof B == "function"
									? B.apply(this, arguments)
									: B),
						Ue = ye.invert(Ne),
						je = typeof k === "function" ? k.apply(this, arguments) : k;
					return r(P(N(ye, je), Ne, Ue), ie, f);
				},
				B,
				V,
			);
		}),
		(L.translateBy = (F, k, B, V) => {
			L.transform(
				F,
				function () {
					return r(
						this.__zoom.translate(
							typeof k === "function" ? k.apply(this, arguments) : k,
							typeof B === "function" ? B.apply(this, arguments) : B,
						),
						t.apply(this, arguments),
						f,
					);
				},
				undefined,
				V,
			);
		}),
		(L.translateTo = (F, k, B, V, ie) => {
			L.transform(
				F,
				function () {
					const ye = t.apply(this, arguments),
						Ne = this.__zoom,
						Ue =
							V == undefined
								? A(ye)
								: (typeof V == "function"
									? V.apply(this, arguments)
									: V);
					return r(
						op
							.translate(Ue[0], Ue[1])
							.scale(Ne.k)
							.translate(
								typeof k === "function" ? -k.apply(this, arguments) : -k,
								typeof B === "function" ? -B.apply(this, arguments) : -B,
							),
						ye,
						f,
					);
				},
				V,
				ie,
			);
		});
	function N(F, k) {
		return (
			(k = Math.max(c[0], Math.min(c[1], k))),
			k === F.k ? F : new fi(k, F.x, F.y)
		);
	}
	function P(F, k, B) {
		const V = k[0] - B[0] * F.k,
			ie = k[1] - B[1] * F.k;
		return V === F.x && ie === F.y ? F : new fi(F.k, V, ie);
	}
	function A(F) {
		return [(+F[0][0] + +F[1][0]) / 2, (+F[0][1] + +F[1][1]) / 2];
	}
	function z(F, k, B, V) {
		F.on("start.zoom", function () {
			W(this, arguments).event(V).start();
		})
			.on("interrupt.zoom end.zoom", function () {
				W(this, arguments).event(V).end();
			})
			.tween("zoom", function () {
				const ye = arguments,
					Ne = W(this, ye).event(V),
					Ue = t.apply(this, ye),
					je =
						B == undefined
							? A(Ue)
							: (typeof B == "function"
								? B.apply(this, ye)
								: B),
					it = Math.max(Ue[1][0] - Ue[0][0], Ue[1][1] - Ue[0][1]),
					tt = this.__zoom,
					Je = typeof k === "function" ? k.apply(this, ye) : k,
					Ae = h(
						tt.invert(je).concat(it / tt.k),
						Je.invert(je).concat(it / Je.k),
					);
				return (X) => {
					if (X === 1) {
						X = Je;
					} else {
						const ae = Ae(X),
							de = it / ae[2];
						X = new fi(de, je[0] - ae[0] * de, je[1] - ae[1] * de);
					}
					Ne.zoom(undefined, X);
				};
			});
	}
	function W(F, k, B) {
		return (!B && F.__zooming) || new U(F, k);
	}
	function U(F, k) {
		(this.that = F),
			(this.args = k),
			(this.active = 0),
			(this.sourceEvent = undefined),
			(this.extent = t.apply(F, k)),
			(this.taps = 0);
	}
	U.prototype = {
		event(F) {
			return F && (this.sourceEvent = F), this;
		},
		start() {
			return (
				++this.active === 1 &&
					((this.that.__zooming = this), this.emit("start")),
				this
			);
		},
		zoom(F, k) {
			return (
				this.mouse &&
					F !== "mouse" &&
					(this.mouse[1] = k.invert(this.mouse[0])),
				this.touch0 &&
					F !== "touch" &&
					(this.touch0[1] = k.invert(this.touch0[0])),
				this.touch1 &&
					F !== "touch" &&
					(this.touch1[1] = k.invert(this.touch1[0])),
				(this.that.__zoom = k),
				this.emit("zoom"),
				this
			);
		},
		end() {
			return (
				--this.active === 0 && (delete this.that.__zooming, this.emit("end")),
				this
			);
		},
		emit(F) {
			const k = Fn(this.that).datum();
			p.call(
				F,
				this.that,
				new ipe(F, {
					sourceEvent: this.sourceEvent,
					target: L,
					type: F,
					transform: this.that.__zoom,
					dispatch: p,
				}),
				k,
			);
		},
	};
	function re(F, ...k) {
		if (!e.apply(this, arguments)) {
			return;
		}
		const B = W(this, k).event(F),
			V = this.__zoom,
			ie = Math.max(c[0], Math.min(c[1], V.k * 2 ** o.apply(this, arguments))),
			ye = ai(F);
		if (B.wheel) {
			(B.mouse[0][0] !== ye[0] || B.mouse[0][1] !== ye[1]) &&
				(B.mouse[1] = V.invert((B.mouse[0] = ye))),
				clearTimeout(B.wheel);
		} else {
			if (V.k === ie) {
				return;
			}
			(B.mouse = [ye, V.invert(ye)]), Rc(this), B.start();
		}
		Cl(F),
			(B.wheel = setTimeout(Ne, M)),
			B.zoom("mouse", r(P(N(V, ie), B.mouse[0], B.mouse[1]), B.extent, f));
		function Ne() {
			(B.wheel = undefined), B.end();
		}
	}
	function Q(F, ...k) {
		if (b || !e.apply(this, arguments)) {
			return;
		}
		const B = F.currentTarget,
			V = W(this, k, !0).event(F),
			ie = Fn(F.view).on("mousemove.zoom", je, !0).on("mouseup.zoom", it, !0),
			ye = ai(F, B),
			Ne = F.clientX,
			Ue = F.clientY;
		i1(F.view),
			dd(F),
			(V.mouse = [ye, this.__zoom.invert(ye)]),
			Rc(this),
			V.start();
		function je(tt) {
			if ((Cl(tt), !V.moved)) {
				const Je = tt.clientX - Ne,
					Ae = tt.clientY - Ue;
				V.moved = Je * Je + Ae * Ae > C;
			}
			V.event(tt).zoom(
				"mouse",
				r(P(V.that.__zoom, (V.mouse[0] = ai(tt, B)), V.mouse[1]), V.extent, f),
			);
		}
		function it(tt) {
			ie.on("mousemove.zoom mouseup.zoom"),
				o1(tt.view, V.moved),
				Cl(tt),
				V.event(tt).end();
		}
	}
	function G(F, ...k) {
		if (e.apply(this, arguments)) {
			const B = this.__zoom,
				V = ai(F.changedTouches ? F.changedTouches[0] : F, this),
				ie = B.invert(V),
				ye = B.k * (F.shiftKey ? 0.5 : 2),
				Ne = r(P(N(B, ye), V, ie), t.apply(this, k), f);
			Cl(F),
				d > 0
					? Fn(this).transition().duration(d).call(z, Ne, V, F)
					: Fn(this).call(L.transform, Ne, V, F);
		}
	}
	function te(F, ...k) {
		if (e.apply(this, arguments)) {
			let B = F.touches,
				V = B.length,
				ie = W(this, k, F.changedTouches.length === V).event(F),
				ye,
				Ne,
				Ue,
				je;
			for (dd(F), Ne = 0; Ne < V; ++Ne) {
				(Ue = B[Ne]),
					(je = ai(Ue, this)),
					(je = [je, this.__zoom.invert(je), Ue.identifier]),
					ie.touch0
						? !ie.touch1 &&
							ie.touch0[2] !== je[2] &&
							((ie.touch1 = je), (ie.taps = 0))
						: ((ie.touch0 = je), (ye = !0), (ie.taps = 1 + !!v));
			}
			v && (v = clearTimeout(v)),
				ye &&
					(ie.taps < 2 &&
						((m = je[0]),
						(v = setTimeout(() => {
							v = undefined;
						}, w))),
					Rc(this),
					ie.start());
		}
	}
	function Z(F, ...k) {
		if (this.__zooming) {
			let B = W(this, k).event(F),
				V = F.changedTouches,
				ie = V.length,
				ye,
				Ne,
				Ue,
				je;
			for (Cl(F), ye = 0; ye < ie; ++ye) {
				(Ne = V[ye]),
					(Ue = ai(Ne, this)),
					B.touch0 && B.touch0[2] === Ne.identifier
						? (B.touch0[0] = Ue)
						: B.touch1 && B.touch1[2] === Ne.identifier && (B.touch1[0] = Ue);
			}
			if (((Ne = B.that.__zoom), B.touch1)) {
				let it = B.touch0[0],
					tt = B.touch0[1],
					Je = B.touch1[0],
					Ae = B.touch1[1],
					X = (X = Je[0] - it[0]) * X + (X = Je[1] - it[1]) * X,
					ae = (ae = Ae[0] - tt[0]) * ae + (ae = Ae[1] - tt[1]) * ae;
				(Ne = N(Ne, Math.sqrt(X / ae))),
					(Ue = [(it[0] + Je[0]) / 2, (it[1] + Je[1]) / 2]),
					(je = [(tt[0] + Ae[0]) / 2, (tt[1] + Ae[1]) / 2]);
			} else if (B.touch0) {
				(Ue = B.touch0[0]), (je = B.touch0[1]);
			} else {
				return;
			}
			B.zoom("touch", r(P(Ne, Ue, je), B.extent, f));
		}
	}
	function q(F, ...k) {
		if (this.__zooming) {
			let B = W(this, k).event(F),
				V = F.changedTouches,
				ie = V.length,
				ye,
				Ne;
			for (
				dd(F),
					b && clearTimeout(b),
					b = setTimeout(() => {
						b = undefined;
					}, w),
					ye = 0;
				ye < ie;
				++ye
			) {
				(Ne = V[ye]),
					B.touch0 && B.touch0[2] === Ne.identifier
						? delete B.touch0
						: B.touch1 && B.touch1[2] === Ne.identifier && delete B.touch1;
			}
			if (
				(B.touch1 && !B.touch0 && ((B.touch0 = B.touch1), delete B.touch1),
				B.touch0)
			) {
				B.touch0[1] = this.__zoom.invert(B.touch0[0]);
			} else if (
				(B.end(),
				B.taps === 2 &&
					((Ne = ai(Ne, this)), Math.hypot(m[0] - Ne[0], m[1] - Ne[1]) < E))
			) {
				const Ue = Fn(this).on("dblclick.zoom");
				Ue && Ue.apply(this, arguments);
			}
		}
	}
	return (
		(L.wheelDelta = (F) =>
			arguments.length > 0
				? ((o = typeof F === "function" ? F : wc(+F)), L)
				: o),
		(L.filter = (F) =>
			arguments.length > 0
				? ((e = typeof F === "function" ? F : wc(!!F)), L)
				: e),
		(L.touchable = (F) =>
			arguments.length > 0
				? ((s = typeof F === "function" ? F : wc(!!F)), L)
				: s),
		(L.extent = (F) =>
			arguments.length > 0
				? ((t =
						typeof F === "function"
							? F
							: wc([
									[+F[0][0], +F[0][1]],
									[+F[1][0], +F[1][1]],
								])),
					L)
				: t),
		(L.scaleExtent = (F) =>
			arguments.length > 0
				? ((c[0] = +F[0]), (c[1] = +F[1]), L)
				: [c[0], c[1]]),
		(L.translateExtent = (F) =>
			arguments.length > 0
				? ((f[0][0] = +F[0][0]),
					(f[1][0] = +F[1][0]),
					(f[0][1] = +F[0][1]),
					(f[1][1] = +F[1][1]),
					L)
				: [
						[f[0][0], f[0][1]],
						[f[1][0], f[1][1]],
					]),
		(L.constrain = (F) => (arguments.length > 0 ? ((r = F), L) : r)),
		(L.duration = (F) => (arguments.length > 0 ? ((d = +F), L) : d)),
		(L.interpolate = (F) => (arguments.length > 0 ? ((h = F), L) : h)),
		(L.on = () => {
			const F = p.on.apply(p, arguments);
			return F === p ? L : F;
		}),
		(L.clickDistance = (F) =>
			arguments.length > 0 ? ((C = (F = +F) * F), L) : Math.sqrt(C)),
		(L.tapDistance = (F) => (arguments.length > 0 ? ((E = +F), L) : E)),
		L
	);
}
function fpe(e) {
	const t = +this._x.call(undefined, e),
		r = +this._y.call(undefined, e);
	return y1(this.cover(t, r), t, r, e);
}
function y1(e, t, r, o) {
	if (isNaN(t) || isNaN(r)) {
		return e;
	}
	let s,
		c = e._root,
		f = { data: o },
		d = e._x0,
		h = e._y0,
		p = e._x1,
		v = e._y1,
		m,
		b,
		w,
		M,
		C,
		E,
		L,
		N;
	if (!c) {
		return (e._root = f), e;
	}
	while (c.length > 0) {
		if (
			((C = t >= (m = (d + p) / 2)) ? (d = m) : (p = m),
			(E = r >= (b = (h + v) / 2)) ? (h = b) : (v = b),
			(s = c),
			!(c = c[(L = (E << 1) | C)]))
		) {
			return (s[L] = f), e;
		}
	}
	if (
		((w = +e._x.call(undefined, c.data)),
		(M = +e._y.call(undefined, c.data)),
		t === w && r === M)
	) {
		return (f.next = c), s ? (s[L] = f) : (e._root = f), e;
	}
	do {
		(s = s ? (s[L] = new Array(4)) : (e._root = new Array(4))),
			(C = t >= (m = (d + p) / 2)) ? (d = m) : (p = m),
			(E = r >= (b = (h + v) / 2)) ? (h = b) : (v = b);
	} while ((L = (E << 1) | C) === (N = ((M >= b) << 1) | (w >= m)));
	return (s[N] = c), (s[L] = f), e;
}
function dpe(e) {
	let t,
		r,
		o = e.length,
		s,
		c,
		f = new Array(o),
		d = new Array(o),
		h = 1 / 0,
		p = 1 / 0,
		v = -1 / 0,
		m = -1 / 0;
	for (r = 0; r < o; ++r) {
		isNaN((s = +this._x.call(undefined, (t = e[r])))) ||
			isNaN((c = +this._y.call(undefined, t))) ||
			((f[r] = s),
			(d[r] = c),
			s < h && (h = s),
			s > v && (v = s),
			c < p && (p = c),
			c > m && (m = c));
	}
	if (h > v || p > m) {
		return this;
	}
	for (this.cover(h, p).cover(v, m), r = 0; r < o; ++r) {
		y1(this, f[r], d[r], e[r]);
	}
	return this;
}
function hpe(e, t) {
	if (isNaN((e = +e)) || isNaN((t = +t))) {
		return this;
	}
	let r = this._x0,
		o = this._y0,
		s = this._x1,
		c = this._y1;
	if (isNaN(r)) {
		(s = (r = Math.floor(e)) + 1), (c = (o = Math.floor(t)) + 1);
	} else {
		for (
			var f = s - r || 1, d = this._root, h, p;
			r > e || e >= s || o > t || t >= c;
		) {
			switch (
				((p = ((t < o) << 1) | (e < r)),
				(h = new Array(4)),
				(h[p] = d),
				(d = h),
				(f *= 2),
				p)
			) {
				case 0: {
					(s = r + f), (c = o + f);
					break;
				}
				case 1: {
					(r = s - f), (c = o + f);
					break;
				}
				case 2: {
					(s = r + f), (o = c - f);
					break;
				}
				case 3: {
					(r = s - f), (o = c - f);
					break;
				}
			}
		}
		this._root && this._root.length && (this._root = d);
	}
	return (this._x0 = r), (this._y0 = o), (this._x1 = s), (this._y1 = c), this;
}
function ppe() {
	const e = [];
	return (
		this.visit((t) => {
			if (t.length === 0) {
				do {
					e.push(t.data);
				} while ((t = t.next));
			}
		}),
		e
	);
}
function gpe(e) {
	return arguments.length > 0
		? this.cover(+e[0][0], +e[0][1]).cover(+e[1][0], +e[1][1])
		: (isNaN(this._x0)
			? void 0
			: [
					[this._x0, this._y0],
					[this._x1, this._y1],
				]);
}
function An(e, t, r, o, s) {
	(this.node = e), (this.x0 = t), (this.y0 = r), (this.x1 = o), (this.y1 = s);
}
function vpe(e, t, r) {
	let o,
		s = this._x0,
		c = this._y0,
		f,
		d,
		h,
		p,
		v = this._x1,
		m = this._y1,
		b = [],
		w = this._root,
		M,
		C;
	for (
		w && b.push(new An(w, s, c, v, m)),
			r == undefined
				? (r = 1 / 0)
				: ((s = e - r), (c = t - r), (v = e + r), (m = t + r), (r *= r));
		(M = b.pop());
	) {
		if (
			!(
				!(w = M.node) ||
				(f = M.x0) > v ||
				(d = M.y0) > m ||
				(h = M.x1) < s ||
				(p = M.y1) < c
			)
		) {
			if (w.length > 0) {
				const E = (f + h) / 2,
					L = (d + p) / 2;
				b.push(
					new An(w[3], E, L, h, p),
					new An(w[2], f, L, E, p),
					new An(w[1], E, d, h, L),
					new An(w[0], f, d, E, L),
				),
					(C = ((t >= L) << 1) | (e >= E)) &&
						((M = b[b.length - 1]),
						(b[b.length - 1] = b[b.length - 1 - C]),
						(b[b.length - 1 - C] = M));
			} else {
				const N = e - +this._x.call(undefined, w.data),
					P = t - +this._y.call(undefined, w.data),
					A = N * N + P * P;
				if (A < r) {
					const z = Math.sqrt((r = A));
					(s = e - z), (c = t - z), (v = e + z), (m = t + z), (o = w.data);
				}
			}
		}
	}
	return o;
}
function mpe(e) {
	if (
		isNaN((v = +this._x.call(undefined, e))) ||
		isNaN((m = +this._y.call(undefined, e)))
	) {
		return this;
	}
	let t,
		r = this._root,
		o,
		s,
		c,
		f = this._x0,
		d = this._y0,
		h = this._x1,
		p = this._y1,
		v,
		m,
		b,
		w,
		M,
		C,
		E,
		L;
	if (!r) {
		return this;
	}
	if (r.length > 0) {
		for (;;) {
			if (
				((M = v >= (b = (f + h) / 2)) ? (f = b) : (h = b),
				(C = m >= (w = (d + p) / 2)) ? (d = w) : (p = w),
				(t = r),
				!(r = r[(E = (C << 1) | M)]))
			) {
				return this;
			}
			if (r.length === 0) {
				break;
			}
			(t[(E + 1) & 3] || t[(E + 2) & 3] || t[(E + 3) & 3]) &&
				((o = t), (L = E));
		}
	}
	while (r.data !== e) {
		if (((s = r), !(r = r.next))) {return this;}
	}
	return (
		(c = r.next) && delete r.next,
		s
			? (c ? (s.next = c) : delete s.next, this)
			: (t
				? (c ? (t[E] = c) : delete t[E],
					(r = t[0] || t[1] || t[2] || t[3]) &&
						r === (t[3] || t[2] || t[1] || t[0]) &&
						!r.length &&
						(o ? (o[L] = r) : (this._root = r)),
					this)
				: ((this._root = c), this))
	);
}
function ype(e) {
	for (let t = 0, r = e.length; t < r; ++t) {
		this.remove(e[t]);
	}
	return this;
}
function bpe() {
	return this._root;
}
function wpe() {
	let e = 0;
	return (
		this.visit((t) => {
			if (t.length === 0) {
				do {
					++e;
				} while ((t = t.next));
			}
		}),
		e
	);
}
function xpe(e) {
	let t = [],
		r,
		o = this._root,
		s,
		c,
		f,
		d,
		h;
	for (
		o && t.push(new An(o, this._x0, this._y0, this._x1, this._y1));
		(r = t.pop());
	) {
		if (
			!e((o = r.node), (c = r.x0), (f = r.y0), (d = r.x1), (h = r.y1)) &&
			o.length > 0
		) {
			const p = (c + d) / 2,
				v = (f + h) / 2;
			(s = o[3]) && t.push(new An(s, p, v, d, h)),
				(s = o[2]) && t.push(new An(s, c, v, p, h)),
				(s = o[1]) && t.push(new An(s, p, f, d, v)),
				(s = o[0]) && t.push(new An(s, c, f, p, v));
		}
	}
	return this;
}
function Spe(e) {
	let t = [],
		r = [],
		o;
	for (
		this._root &&
		t.push(new An(this._root, this._x0, this._y0, this._x1, this._y1));
		(o = t.pop());
	) {
		const s = o.node;
		if (s.length > 0) {
			let c,
				f = o.x0,
				d = o.y0,
				h = o.x1,
				p = o.y1,
				v = (f + h) / 2,
				m = (d + p) / 2;
			(c = s[0]) && t.push(new An(c, f, d, v, m)),
				(c = s[1]) && t.push(new An(c, v, d, h, m)),
				(c = s[2]) && t.push(new An(c, f, m, v, p)),
				(c = s[3]) && t.push(new An(c, v, m, h, p));
		}
		r.push(o);
	}
	while ((o = r.pop())) {
		e(o.node, o.x0, o.y0, o.x1, o.y1);
	}
	return this;
}
function _pe(e) {
	return e[0];
}
function kpe(e) {
	return arguments.length > 0 ? ((this._x = e), this) : this._x;
}
function Tpe(e) {
	return e[1];
}
function Cpe(e) {
	return arguments.length > 0 ? ((this._y = e), this) : this._y;
}
function sp(e, t, r) {
	const o = new lp(
		t ?? _pe,
		r ?? Tpe,
		Number.NaN,
		Number.NaN,
		Number.NaN,
		Number.NaN,
	);
	return e == undefined ? o : o.addAll(e);
}
function lp(e, t, r, o, s, c) {
	(this._x = e),
		(this._y = t),
		(this._x0 = r),
		(this._y0 = o),
		(this._x1 = s),
		(this._y1 = c),
		(this._root = void 0);
}
function a0(e) {
	for (var t = { data: e.data }, r = t; (e = e.next); ) {
		r = r.next = { data: e.data };
	}
	return t;
}
const $n = (sp.prototype = lp.prototype);
$n.copy = function copy() {
	let e = new lp(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
		t = this._root,
		r,
		o;
	if (!t) {
		return e;
	}
	if (t.length === 0) {
		return (e._root = a0(t)), e;
	}
	for (r = [{ source: t, target: (e._root = new Array(4)) }]; (t = r.pop()); ) {
		for (let s = 0; s < 4; ++s) {
			(o = t.source[s]) &&
				(o.length > 0
					? r.push({ source: o, target: (t.target[s] = new Array(4)) })
					: (t.target[s] = a0(o)));
		}
	}
	return e;
};
$n.add = fpe;
$n.addAll = dpe;
$n.cover = hpe;
$n.data = ppe;
$n.extent = gpe;
$n.find = vpe;
$n.remove = mpe;
$n.removeAll = ype;
$n.root = bpe;
$n.size = wpe;
$n.visit = xpe;
$n.visitAfter = Spe;
$n.x = kpe;
$n.y = Cpe;
function Nn(e) {
	return () => e;
}
function Ki(e) {
	return (e() - 0.5) * 1e-6;
}
function Epe(e) {
	return e.x + e.vx;
}
function Lpe(e) {
	return e.y + e.vy;
}
function Ape(e) {
	let t,
		r,
		o,
		s = 1,
		c = 1;
	typeof e !== "function" && (e = Nn(e == undefined ? 1 : +e));
	function f() {
		for (var p, v = t.length, m, b, w, M, C, E, L = 0; L < c; ++L) {
			for (m = sp(t, Epe, Lpe).visitAfter(d), p = 0; p < v; ++p) {
				(b = t[p]),
					(C = r[b.index]),
					(E = C * C),
					(w = b.x + b.vx),
					(M = b.y + b.vy),
					m.visit(N);
			}
		}
		function N(P, A, z, W, U) {
			let re = P.data,
				Q = P.r,
				G = C + Q;
			if (re) {
				if (re.index > b.index) {
					let te = w - re.x - re.vx,
						Z = M - re.y - re.vy,
						q = te * te + Z * Z;
					q < G * G &&
						(te === 0 && ((te = Ki(o)), (q += te * te)),
						Z === 0 && ((Z = Ki(o)), (q += Z * Z)),
						(q = ((G - (q = Math.sqrt(q))) / q) * s),
						(b.vx += (te *= q) * (G = (Q *= Q) / (E + Q))),
						(b.vy += (Z *= q) * G),
						(re.vx -= te * (G = 1 - G)),
						(re.vy -= Z * G));
				}
				return;
			}
			return A > w + G || W < w - G || z > M + G || U < M - G;
		}
	}
	function d(p) {
		if (p.data) {
			return (p.r = r[p.data.index]);
		}
		for (let v = (p.r = 0); v < 4; ++v) {
			p[v] && p[v].r > p.r && (p.r = p[v].r);
		}
	}
	function h() {
		if (t) {
			let p,
				v = t.length,
				m;
			for (r = new Array(v), p = 0; p < v; ++p) {
				(m = t[p]), (r[m.index] = +e(m, p, t));
			}
		}
	}
	return (
		(f.initialize = (p, v) => {
			(t = p), (o = v), h();
		}),
		(f.iterations = (p) => (arguments.length > 0 ? ((c = +p), f) : c)),
		(f.strength = (p) => (arguments.length > 0 ? ((s = +p), f) : s)),
		(f.radius = (p) =>
			arguments.length > 0
				? ((e = typeof p === "function" ? p : Nn(+p)), h(), f)
				: e),
		f
	);
}
function Mpe(e) {
	return e.index;
}
function c0(e, t) {
	const r = e.get(t);
	if (!r) {
		throw new Error("node not found: " + t);
	}
	return r;
}
function Npe(e) {
	let t = Mpe,
		r = m,
		o,
		s = Nn(30),
		c,
		f,
		d,
		h,
		p,
		v = 1;
	e == undefined && (e = []);
	function m(E) {
		return 1 / Math.min(d[E.source.index], d[E.target.index]);
	}
	function b(E) {
		for (let L = 0, N = e.length; L < v; ++L) {
			for (let P = 0, A, z, W, U, re, Q, G; P < N; ++P) {
				(A = e[P]),
					(z = A.source),
					(W = A.target),
					(U = W.x + W.vx - z.x - z.vx || Ki(p)),
					(re = W.y + W.vy - z.y - z.vy || Ki(p)),
					(Q = Math.sqrt(U * U + re * re)),
					(Q = ((Q - c[P]) / Q) * E * o[P]),
					(U *= Q),
					(re *= Q),
					(W.vx -= U * (G = h[P])),
					(W.vy -= re * G),
					(z.vx += U * (G = 1 - G)),
					(z.vy += re * G);
			}
		}
	}
	function w() {
		if (f) {
			let E,
				L = f.length,
				N = e.length,
				P = new Map(f.map((z, W) => [t(z, W, f), z])),
				A;
			for (E = 0, d = new Array(L); E < N; ++E) {
				(A = e[E]),
					(A.index = E),
					typeof A.source !== "object" && (A.source = c0(P, A.source)),
					typeof A.target !== "object" && (A.target = c0(P, A.target)),
					(d[A.source.index] = (d[A.source.index] || 0) + 1),
					(d[A.target.index] = (d[A.target.index] || 0) + 1);
			}
			for (E = 0, h = new Array(N); E < N; ++E) {
				(A = e[E]),
					(h[E] = d[A.source.index] / (d[A.source.index] + d[A.target.index]));
			}
			(o = new Array(N)), M(), (c = new Array(N)), C();
		}
	}
	function M() {
		if (f) {
			for (let E = 0, L = e.length; E < L; ++E) {
				o[E] = +r(e[E], E, e);
			}
		}
	}
	function C() {
		if (f) {
			for (let E = 0, L = e.length; E < L; ++E) {
				c[E] = +s(e[E], E, e);
			}
		}
	}
	return (
		(b.initialize = (E, L) => {
			(f = E), (p = L), w();
		}),
		(b.links = (E) => (arguments.length > 0 ? ((e = E), w(), b) : e)),
		(b.id = (E) => (arguments.length > 0 ? ((t = E), b) : t)),
		(b.iterations = (E) => (arguments.length > 0 ? ((v = +E), b) : v)),
		(b.strength = (E) =>
			arguments.length > 0
				? ((r = typeof E === "function" ? E : Nn(+E)), M(), b)
				: r),
		(b.distance = (E) =>
			arguments.length > 0
				? ((s = typeof E === "function" ? E : Nn(+E)), C(), b)
				: s),
		b
	);
}
const $pe = 1_664_525,
	Ppe = 1_013_904_223,
	u0 = 4_294_967_296;
function Ope() {
	let e = 1;
	return () => (e = ($pe * e + Ppe) % u0) / u0;
}
function Rpe(e) {
	return e.x;
}
function Dpe(e) {
	return e.y;
}
const zpe = 10,
	Ipe = Math.PI * (3 - Math.sqrt(5));
function Fpe(e) {
	let t,
		r = 1,
		o = 0.001,
		s = 1 - o ** (1 / 300),
		c = 0,
		f = 0.6,
		d = new Map(),
		h = np(m),
		p = ka("tick", "end"),
		v = Ope();
	e == undefined && (e = []);
	function m() {
		b(), p.call("tick", t), r < o && (h.stop(), p.call("end", t));
	}
	function b(C) {
		let E,
			L = e.length,
			N;
		C === void 0 && (C = 1);
		for (let P = 0; P < C; ++P) {
			for (
				r += (c - r) * s,
					d.forEach((A) => {
						A(r);
					}),
					E = 0;
				E < L;
				++E
			) {
				(N = e[E]),
					N.fx == undefined ? (N.x += N.vx *= f) : ((N.x = N.fx), (N.vx = 0)),
					N.fy == undefined ? (N.y += N.vy *= f) : ((N.y = N.fy), (N.vy = 0));
			}
		}
		return t;
	}
	function w() {
		for (let C = 0, E = e.length, L; C < E; ++C) {
			if (
				((L = e[C]),
				(L.index = C),
				L.fx != undefined && (L.x = L.fx),
				L.fy != undefined && (L.y = L.fy),
				isNaN(L.x) || isNaN(L.y))
			) {
				const N = zpe * Math.sqrt(0.5 + C),
					P = C * Ipe;
				(L.x = N * Math.cos(P)), (L.y = N * Math.sin(P));
			}
			(isNaN(L.vx) || isNaN(L.vy)) && (L.vx = L.vy = 0);
		}
	}
	function M(C) {
		return C.initialize && C.initialize(e, v), C;
	}
	return (
		w(),
		(t = {
			tick: b,
			restart() {
				return h.restart(m), t;
			},
			stop() {
				return h.stop(), t;
			},
			nodes(C) {
				return arguments.length > 0 ? ((e = C), w(), d.forEach(M), t) : e;
			},
			alpha(C) {
				return arguments.length > 0 ? ((r = +C), t) : r;
			},
			alphaMin(C) {
				return arguments.length > 0 ? ((o = +C), t) : o;
			},
			alphaDecay(C) {
				return arguments.length > 0 ? ((s = +C), t) : +s;
			},
			alphaTarget(C) {
				return arguments.length > 0 ? ((c = +C), t) : c;
			},
			velocityDecay(C) {
				return arguments.length > 0 ? ((f = 1 - C), t) : 1 - f;
			},
			randomSource(C) {
				return arguments.length > 0 ? ((v = C), d.forEach(M), t) : v;
			},
			force(C, E) {
				return arguments.length > 1
					? (E == undefined ? d.delete(C) : d.set(C, M(E)), t)
					: d.get(C);
			},
			find(C, E, L) {
				let N = 0,
					P = e.length,
					A,
					z,
					W,
					U,
					re;
				for (L == undefined ? (L = 1 / 0) : (L *= L), N = 0; N < P; ++N) {
					(U = e[N]),
						(A = C - U.x),
						(z = E - U.y),
						(W = A * A + z * z),
						W < L && ((re = U), (L = W));
				}
				return re;
			},
			on(C, E) {
				return arguments.length > 1 ? (p.on(C, E), t) : p.on(C);
			},
		})
	);
}
function Hpe() {
	let e,
		t,
		r,
		o,
		s = Nn(-30),
		c,
		f = 1,
		d = 1 / 0,
		h = 0.81;
	function p(w) {
		let M,
			C = e.length,
			E = sp(e, Rpe, Dpe).visitAfter(m);
		for (o = w, M = 0; M < C; ++M) {
			(t = e[M]), E.visit(b);
		}
	}
	function v() {
		if (e) {
			let w,
				M = e.length,
				C;
			for (c = new Array(M), w = 0; w < M; ++w) {
				(C = e[w]), (c[C.index] = +s(C, w, e));
			}
		}
	}
	function m(w) {
		let M = 0,
			C,
			E,
			L = 0,
			N,
			P,
			A;
		if (w.length > 0) {
			for (N = P = A = 0; A < 4; ++A) {
				(C = w[A]) &&
					(E = Math.abs(C.value)) &&
					((M += C.value), (L += E), (N += E * C.x), (P += E * C.y));
			}
			(w.x = N / L), (w.y = P / L);
		} else {
			(C = w), (C.x = C.data.x), (C.y = C.data.y);
			do {
				M += c[C.data.index];
			} while ((C = C.next));
		}
		w.value = M;
	}
	function b(w, M, C, E) {
		if (!w.value) {
			return !0;
		}
		let L = w.x - t.x,
			N = w.y - t.y,
			P = E - M,
			A = L * L + N * N;
		if ((P * P) / h < A) {
			return (
				A < d &&
					(L === 0 && ((L = Ki(r)), (A += L * L)),
					N === 0 && ((N = Ki(r)), (A += N * N)),
					A < f && (A = Math.sqrt(f * A)),
					(t.vx += (L * w.value * o) / A),
					(t.vy += (N * w.value * o) / A)),
				!0
			);
		}
		if (w.length > 0 || A >= d) {
			return;
		}
		(w.data !== t || w.next) &&
			(L === 0 && ((L = Ki(r)), (A += L * L)),
			N === 0 && ((N = Ki(r)), (A += N * N)),
			A < f && (A = Math.sqrt(f * A)));
		do {
			w.data !== t &&
				((P = (c[w.data.index] * o) / A), (t.vx += L * P), (t.vy += N * P));
		} while ((w = w.next));
	}
	return (
		(p.initialize = (w, M) => {
			(e = w), (r = M), v();
		}),
		(p.strength = (w) =>
			arguments.length > 0
				? ((s = typeof w === "function" ? w : Nn(+w)), v(), p)
				: s),
		(p.distanceMin = (w) =>
			arguments.length > 0 ? ((f = w * w), p) : Math.sqrt(f)),
		(p.distanceMax = (w) =>
			arguments.length > 0 ? ((d = w * w), p) : Math.sqrt(d)),
		(p.theta = (w) => (arguments.length > 0 ? ((h = w * w), p) : Math.sqrt(h))),
		p
	);
}
function qpe(e) {
	let t = Nn(0.1),
		r,
		o,
		s;
	typeof e !== "function" && (e = Nn(e == undefined ? 0 : +e));
	function c(d) {
		for (let h = 0, p = r.length, v; h < p; ++h) {
			(v = r[h]), (v.vx += (s[h] - v.x) * o[h] * d);
		}
	}
	function f() {
		if (r) {
			let d,
				h = r.length;
			for (o = new Array(h), s = new Array(h), d = 0; d < h; ++d) {
				o[d] = isNaN((s[d] = +e(r[d], d, r))) ? 0 : +t(r[d], d, r);
			}
		}
	}
	return (
		(c.initialize = (d) => {
			(r = d), f();
		}),
		(c.strength = (d) =>
			arguments.length > 0
				? ((t = typeof d === "function" ? d : Nn(+d)), f(), c)
				: t),
		(c.x = (d) =>
			arguments.length > 0
				? ((e = typeof d === "function" ? d : Nn(+d)), f(), c)
				: e),
		c
	);
}
function Bpe(e) {
	let t = Nn(0.1),
		r,
		o,
		s;
	typeof e !== "function" && (e = Nn(e == undefined ? 0 : +e));
	function c(d) {
		for (let h = 0, p = r.length, v; h < p; ++h) {
			(v = r[h]), (v.vy += (s[h] - v.y) * o[h] * d);
		}
	}
	function f() {
		if (r) {
			let d,
				h = r.length;
			for (o = new Array(h), s = new Array(h), d = 0; d < h; ++d) {
				o[d] = isNaN((s[d] = +e(r[d], d, r))) ? 0 : +t(r[d], d, r);
			}
		}
	}
	return (
		(c.initialize = (d) => {
			(r = d), f();
		}),
		(c.strength = (d) =>
			arguments.length > 0
				? ((t = typeof d === "function" ? d : Nn(+d)), f(), c)
				: t),
		(c.y = (d) =>
			arguments.length > 0
				? ((e = typeof d === "function" ? d : Nn(+d)), f(), c)
				: e),
		c
	);
}
const Wpe = Object.defineProperty,
	Upe = (e, t, r) =>
		t in e
			? Wpe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r })
			: (e[t] = r),
	Ht = (e, t, r) => Upe(e, typeof t !== "symbol" ? t + "" : t, r);
function Vpe() {
	return {
		drag: { end: 0, start: 0.1 },
		filter: { link: 1, type: 0.1, unlinked: { include: 0.1, exclude: 0.1 } },
		focus: { acquire: () => 0.1, release: () => 0.1 },
		initialize: 1,
		labels: { links: { hide: 0, show: 0 }, nodes: { hide: 0, show: 0 } },
		resize: 0.5,
	};
}
function f0(e) {
	if (typeof e === "object" && e !== null) {
		if (typeof Object.getPrototypeOf === "function") {
			const t = Object.getPrototypeOf(e);
			return t === Object.prototype || t === null;
		}
		return Object.prototype.toString.call(e) === "[object Object]";
	}
	return !1;
}
function Xi(...e) {
	return e.reduce((t, r) => {
		if (Array.isArray(r)) {
			throw new TypeError(
				"Arguments provided to deepmerge must be objects, not arrays.",
			);
		}
		return (
			Object.keys(r).forEach((o) => {
				["__proto__", "constructor", "prototype"].includes(o) ||
					(Array.isArray(t[o]) && Array.isArray(r[o])
						? (t[o] = Xi.options.mergeArrays
								? [...new Set(t[o].concat(r[o]))]
								: r[o])
						: (f0(t[o]) && f0(r[o])
							? (t[o] = Xi(t[o], r[o]))
							: (t[o] = r[o])));
			}),
			t
		);
	}, {});
}
const b1 = { mergeArrays: !0 };
Xi.options = b1;
Xi.withOptions = (e, ...t) => {
	Xi.options = { mergeArrays: !0, ...e };
	const r = Xi(...t);
	return (Xi.options = b1), r;
};
function jpe() {
	return {
		centering: { enabled: !0, strength: 0.1 },
		charge: { enabled: !0, strength: -1 },
		collision: { enabled: !0, strength: 1, radiusMultiplier: 2 },
		link: { enabled: !0, strength: 1, length: 128 },
	};
}
function Gpe() {
	return {
		includeUnlinked: !0,
		linkFilter: () => !0,
		nodeTypeFilter: void 0,
		showLinkLabels: !0,
		showNodeLabels: !0,
	};
}
function w1(e) {
	e.preventDefault(), e.stopPropagation();
}
function x1(e) {
	return typeof e === "number";
}
function ro(e, t) {
	return x1(e.nodeRadius) ? e.nodeRadius : e.nodeRadius(t);
}
function Kpe(e) {
	return `${e.source.id}-${e.target.id}`;
}
function S1(e) {
	return `link-arrow-${e}`.replaceAll(/[()]/g, "~");
}
function Xpe(e) {
	return `url(#${S1(e.color)})`;
}
function Ype(e) {
	return {
		size: e,
		padding: (t, r) => ro(r, t) + 2 * e,
		ref: [e / 2, e / 2],
		path: [
			[0, 0],
			[0, e],
			[e, e / 2],
		],
		viewBox: [0, 0, e, e].join(","),
	};
}
const _1 = { Arrow: (e) => Ype(e) },
	Zpe = (e, t, r) => [t / 2, r / 2],
	k1 = (e, t, r) => [d0(0, t), d0(0, r)];
function d0(e, t) {
	return Math.random() * (t - e) + e;
}
function Jpe(e) {
	const t = Object.fromEntries(e.nodes.map((r) => [r.id, [r.x, r.y]]));
	return (r, o, s) => {
		const [c, f] = t[r.id] ?? [];
		return c && f ? [c, f] : k1(r, o, s);
	};
}
const rh = { Centered: Zpe, Randomized: k1, Stable: Jpe };
function Qpe() {
	return {
		autoResize: !1,
		callbacks: {},
		hooks: {},
		initial: Gpe(),
		nodeRadius: 16,
		marker: _1.Arrow(4),
		modifiers: {},
		positionInitializer: rh.Centered,
		simulation: { alphas: Vpe(), forces: jpe() },
		zoom: { initial: 1, min: 0.1, max: 2 },
	};
}
function ege(e = {}) {
	return Xi.withOptions({ mergeArrays: !1 }, Qpe(), e);
}
function tge({
	applyZoom: e,
	container: t,
	onDoubleClick: r,
	onPointerMoved: o,
	onPointerUp: s,
	offset: [c, f],
	scale: d,
	zoom: h,
}) {
	const p = t
		.classed("graph", !0)
		.append("svg")
		.attr("height", "100%")
		.attr("width", "100%")
		.call(h)
		.on("contextmenu", (v) => w1(v))
		.on("dblclick", (v) => (r == undefined ? void 0 : r(v)))
		.on("dblclick.zoom")
		.on("pointermove", (v) => (o == undefined ? void 0 : o(v)))
		.on("pointerup", (v) => (s == undefined ? void 0 : s(v)))
		.style("cursor", "grab");
	return e && p.call(h.transform, op.translate(c, f).scale(d)), p.append("g");
}
function nge({ canvas: e, scale: t, xOffset: r, yOffset: o }) {
	e == undefined || e.attr("transform", `translate(${r},${o})scale(${t})`);
}
function rge({ config: e, onDragStart: t, onDragEnd: r }) {
	let o, s;
	const c = wde()
		.filter((f) =>
			f.type === "mousedown"
				? f.button === 0
				: (f.type === "touchstart"
					? f.touches.length === 1
					: !1),
		)
		.on("start", (f, d) => {
			f.active === 0 && t(f, d),
				Fn(f.sourceEvent.target).classed("grabbed", !0),
				(d.fx = d.x),
				(d.fy = d.y);
		})
		.on("drag", (f, d) => {
			(d.fx = f.x), (d.fy = f.y);
		})
		.on("end", (f, d) => {
			f.active === 0 && r(f, d),
				Fn(f.sourceEvent.target).classed("grabbed", !1),
				(d.fx = void 0),
				(d.fy = void 0);
		});
	return (s = (o = e.modifiers).drag) == undefined || s.call(o, c), c;
}
function ige({
	graph: e,
	filter: t,
	focusedNode: r,
	includeUnlinked: o,
	linkFilter: s,
}) {
	const c = e.links.filter(
			(h) => t.includes(h.source.type) && t.includes(h.target.type) && s(h),
		),
		f = (h) =>
			c.find((p) => p.source.id === h.id || p.target.id === h.id) !== void 0,
		d = e.nodes.filter((h) => t.includes(h.type) && (o || f(h)));
	return r === void 0 || !t.includes(r.type)
		? { nodes: d, links: c }
		: oge({ nodes: d, links: c }, r);
}
function oge(e, t) {
	const r = [...sge(e, t), ...lge(e, t)],
		o = r.flatMap((s) => [s.source, s.target]);
	return { nodes: [...new Set([...o, t])], links: [...new Set(r)] };
}
function sge(e, t) {
	return T1(e, t, (r, o) => r.target.id === o.id);
}
function lge(e, t) {
	return T1(e, t, (r, o) => r.source.id === o.id);
}
function T1(e, t, r) {
	const o = new Set(e.links),
		s = new Set([t]),
		c = [];
	while (o.size > 0) {
		const f = [...o].filter((d) => [...s].some((h) => r(d, h)));
		if (f.length === 0) {
			return c;
		}
		f.forEach((d) => {
			s.add(d.source), s.add(d.target), c.push(d), o.delete(d);
		});
	}
	return c;
}
function ih(e) {
	return e.x ?? 0;
}
function oh(e) {
	return e.y ?? 0;
}
function ap({ source: e, target: t }) {
	const r = new En(ih(e), oh(e)),
		o = new En(ih(t), oh(t)),
		s = o.subtract(r),
		c = s.length(),
		f = s.normalize(),
		d = f.multiply(-1);
	return { s: r, t: o, dist: c, norm: f, endNorm: d };
}
function C1({ center: e, node: t }) {
	const r = new En(ih(t), oh(t));
	let o = e;
	return (
		r.x === o.x && r.y === o.y && (o = o.add(new En(0, 1))), { n: r, c: o }
	);
}
function E1({ config: e, source: t, target: r }) {
	const { s: o, t: s, norm: c } = ap({ config: e, source: t, target: r }),
		f = o.add(c.multiply(ro(e, t) - 1)),
		d = s.subtract(c.multiply(e.marker.padding(r, e)));
	return { start: f, end: d };
}
function age(e) {
	const { start: t, end: r } = E1(e);
	return `M${t.x},${t.y}
          L${r.x},${r.y}`;
}
function cge(e) {
	const { start: t, end: r } = E1(e),
		o = r.subtract(t).multiply(0.5),
		s = t.add(o);
	return `translate(${s.x - 8},${s.y - 4})`;
}
function uge({ config: e, source: t, target: r }) {
	const {
			s: o,
			t: s,
			dist: c,
			norm: f,
			endNorm: d,
		} = ap({ config: e, source: t, target: r }),
		h = 10,
		p = f
			.rotateByDegrees(-h)
			.multiply(ro(e, t) - 1)
			.add(o),
		v = d
			.rotateByDegrees(h)
			.multiply(ro(e, r))
			.add(s)
			.add(d.rotateByDegrees(h).multiply(2 * e.marker.size)),
		m = 1.2 * c;
	return `M${p.x},${p.y}
          A${m},${m},0,0,1,${v.x},${v.y}`;
}
function fge({ center: e, config: t, node: r }) {
	const { n: o, c: s } = C1({ center: e, config: t, node: r }),
		c = ro(t, r),
		f = o.subtract(s),
		d = f.multiply(1 / f.length()),
		h = 40,
		p = d
			.rotateByDegrees(h)
			.multiply(c - 1)
			.add(o),
		v = d
			.rotateByDegrees(-h)
			.multiply(c)
			.add(o)
			.add(d.rotateByDegrees(-h).multiply(2 * t.marker.size));
	return `M${p.x},${p.y}
          A${c},${c},0,1,0,${v.x},${v.y}`;
}
function dge({ config: e, source: t, target: r }) {
	const { t: o, dist: s, endNorm: c } = ap({ config: e, source: t, target: r }),
		f = c
			.rotateByDegrees(10)
			.multiply(0.5 * s)
			.add(o);
	return `translate(${f.x},${f.y})`;
}
function hge({ center: e, config: t, node: r }) {
	const { n: o, c: s } = C1({ center: e, config: t, node: r }),
		c = o.subtract(s),
		f = c
			.multiply(1 / c.length())
			.multiply(3 * ro(t, r) + 8)
			.add(o);
	return `translate(${f.x},${f.y})`;
}
const Ms = {
	line: { labelTransform: cge, path: age },
	arc: { labelTransform: dge, path: uge },
	reflexive: { labelTransform: hge, path: fge },
};
function pge(e) {
	return e.append("g").classed("links", !0).selectAll("path");
}
function gge({ config: e, graph: t, selection: r, showLabels: o }) {
	const s =
		r == undefined
			? void 0
			: r
					.data(t.links, (c) => Kpe(c))
					.join((c) => {
						let f, d, h, p;
						const v = c.append("g"),
							m = v
								.append("path")
								.classed("link", !0)
								.style("marker-end", (w) => Xpe(w))
								.style("stroke", (w) => w.color);
						(d = (f = e.modifiers).link) == undefined || d.call(f, m);
						const b = v
							.append("text")
							.classed("link__label", !0)
							.style("fill", (w) => (w.label ? w.label.color : undefined))
							.style("font-size", (w) =>
								w.label ? w.label.fontSize : undefined,
							)
							.text((w) => (w.label ? w.label.text : undefined));
						return (
							(p = (h = e.modifiers).linkLabel) == undefined || p.call(h, b), v
						);
					});
	return (
		s == undefined ||
			s.select(".link__label").attr("opacity", (c) => (c.label && o ? 1 : 0)),
		s
	);
}
function vge(e) {
	mge(e), yge(e);
}
function mge({ center: e, config: t, graph: r, selection: o }) {
	o == undefined ||
		o
			.selectAll("path")
			.attr("d", (s) =>
				s.source.x === void 0 ||
				s.source.y === void 0 ||
				s.target.x === void 0 ||
				s.target.y === void 0
					? ""
					: s.source.id === s.target.id
						? Ms.reflexive.path({ config: t, node: s.source, center: e })
						: L1(r, s.source, s.target)
							? Ms.arc.path({ config: t, source: s.source, target: s.target })
							: Ms.line.path({ config: t, source: s.source, target: s.target }),
			);
}
function yge({ config: e, center: t, graph: r, selection: o }) {
	o == undefined ||
		o.select(".link__label").attr("transform", (s) =>
			s.source.x === void 0 ||
			s.source.y === void 0 ||
			s.target.x === void 0 ||
			s.target.y === void 0
				? "translate(0, 0)"
				: s.source.id === s.target.id
					? Ms.reflexive.labelTransform({
							config: e,
							node: s.source,
							center: t,
						})
					: L1(r, s.source, s.target)
						? Ms.arc.labelTransform({
								config: e,
								source: s.source,
								target: s.target,
							})
						: Ms.line.labelTransform({
								config: e,
								source: s.source,
								target: s.target,
							}),
		);
}
function L1(e, t, r) {
	return (
		t.id !== r.id &&
		e.links.some((o) => o.target.id === t.id && o.source.id === r.id) &&
		e.links.some((o) => o.target.id === r.id && o.source.id === t.id)
	);
}
function bge(e) {
	return e.append("defs").selectAll("marker");
}
function wge({ config: e, graph: t, selection: r }) {
	return r == undefined
		? void 0
		: r
				.data(xge(t), (o) => o)
				.join((o) => {
					const s = o
						.append("marker")
						.attr("id", (c) => S1(c))
						.attr("markerHeight", 4 * e.marker.size)
						.attr("markerWidth", 4 * e.marker.size)
						.attr("markerUnits", "userSpaceOnUse")
						.attr("orient", "auto")
						.attr("refX", e.marker.ref[0])
						.attr("refY", e.marker.ref[1])
						.attr("viewBox", e.marker.viewBox)
						.style("fill", (c) => c);
					return s.append("path").attr("d", Sge(e.marker.path)), s;
				});
}
function xge(e) {
	return [...new Set(e.links.map((t) => t.color))];
}
function Sge(e) {
	const [t, ...r] = e;
	if (!t) {
		return "M0,0";
	}
	const [o, s] = t;
	return r.reduce((c, [f, d]) => `${c}L${f},${d}`, `M${o},${s}`);
}
function _ge(e) {
	return e.append("g").classed("nodes", !0).selectAll("circle");
}
function kge({
	config: e,
	drag: t,
	graph: r,
	onNodeContext: o,
	onNodeSelected: s,
	selection: c,
	showLabels: f,
}) {
	const d =
		c == undefined
			? void 0
			: c
					.data(r.nodes, (h) => h.id)
					.join((h) => {
						let p, v, m, b;
						const w = h.append("g");
						t !== void 0 && w.call(t);
						const M = w
							.append("circle")
							.classed("node", !0)
							.attr("r", (E) => ro(e, E))
							.on("contextmenu", (E, L) => {
								w1(E), o(L);
							})
							.on("pointerdown", (E, L) => Cge(E, L, s ?? o))
							.style("fill", (E) => E.color);
						(v = (p = e.modifiers).node) == undefined || v.call(p, M);
						const C = w
							.append("text")
							.classed("node__label", !0)
							.attr("dy", "0.33em")
							.style("fill", (E) => (E.label ? E.label.color : undefined))
							.style("font-size", (E) =>
								E.label ? E.label.fontSize : undefined,
							)
							.style("stroke", "none")
							.text((E) => (E.label ? E.label.text : undefined));
						return (
							(b = (m = e.modifiers).nodeLabel) == undefined || b.call(m, C), w
						);
					});
	return (
		d == undefined || d.select(".node").classed("focused", (h) => h.isFocused),
		d == undefined || d.select(".node__label").attr("opacity", f ? 1 : 0),
		d
	);
}
const Tge = 500;
function Cge(e, t, r) {
	if (e.button !== void 0 && e.button !== 0) {
		return;
	}
	const o = t.lastInteractionTimestamp,
		s = Date.now();
	if (o === void 0 || s - o > Tge) {
		t.lastInteractionTimestamp = s;
		return;
	}
	(t.lastInteractionTimestamp = void 0), r(t);
}
function Ege(e) {
	e == undefined ||
		e.attr("transform", (t) => `translate(${t.x ?? 0},${t.y ?? 0})`);
}
function Lge({ center: e, config: t, graph: r, onTick: o }) {
	let s, c;
	const f = Fpe(r.nodes),
		d = t.simulation.forces.centering;
	if (d && d.enabled) {
		const m = d.strength;
		f.force("x", qpe(() => e().x).strength(m)).force(
			"y",
			Bpe(() => e().y).strength(m),
		);
	}
	const h = t.simulation.forces.charge;
	h && h.enabled && f.force("charge", Hpe().strength(h.strength));
	const p = t.simulation.forces.collision;
	p &&
		p.enabled &&
		f.force(
			"collision",
			Ape().radius((m) => p.radiusMultiplier * ro(t, m)),
		);
	const v = t.simulation.forces.link;
	return (
		v &&
			v.enabled &&
			f.force(
				"link",
				Npe(r.links)
					.id((m) => m.id)
					.distance(t.simulation.forces.link.length)
					.strength(v.strength),
			),
		f.on("tick", () => o()),
		(c = (s = t.modifiers).simulation) == undefined || c.call(s, f),
		f
	);
}
function Age({ canvasContainer: e, config: t, min: r, max: o, onZoom: s }) {
	let c, f;
	const d = upe()
		.scaleExtent([r, o])
		.filter((h) => {
			let p;
			return (
				h.button === 0 ||
				((p = h.touches) == undefined ? void 0 : p.length) >= 2
			);
		})
		.on("start", () => e().classed("grabbed", !0))
		.on("zoom", (h) => s(h))
		.on("end", () => e().classed("grabbed", !1));
	return (f = (c = t.modifiers).zoom) == undefined || f.call(c, d), d;
}
class Mge {
	constructor(t, r, o) {
		if (
			(Ht(this, "nodeTypes"),
			Ht(this, "_nodeTypeFilter"),
			Ht(this, "_includeUnlinked", !0),
			Ht(this, "_linkFilter", () => !0),
			Ht(this, "_showLinkLabels", !0),
			Ht(this, "_showNodeLabels", !0),
			Ht(this, "filteredGraph"),
			Ht(this, "width", 0),
			Ht(this, "height", 0),
			Ht(this, "simulation"),
			Ht(this, "canvas"),
			Ht(this, "linkSelection"),
			Ht(this, "nodeSelection"),
			Ht(this, "markerSelection"),
			Ht(this, "zoom"),
			Ht(this, "drag"),
			Ht(this, "xOffset", 0),
			Ht(this, "yOffset", 0),
			Ht(this, "scale"),
			Ht(this, "focusedNode"),
			Ht(this, "resizeObserver"),
			(this.container = t),
			(this.graph = r),
			(this.config = o),
			(this.scale = o.zoom.initial),
			this.resetView(),
			this.graph.nodes.forEach((s) => {
				const [c, f] = o.positionInitializer(
					s,
					this.effectiveWidth,
					this.effectiveHeight,
				);
				(s.x = s.x ?? c), (s.y = s.y ?? f);
			}),
			(this.nodeTypes = [...new Set(r.nodes.map((s) => s.type))]),
			(this._nodeTypeFilter = [...this.nodeTypes]),
			o.initial)
		) {
			const {
				includeUnlinked: s,
				nodeTypeFilter: c,
				linkFilter: f,
				showLinkLabels: d,
				showNodeLabels: h,
			} = o.initial;
			(this._includeUnlinked = s ?? this._includeUnlinked),
				(this._showLinkLabels = d ?? this._showLinkLabels),
				(this._showNodeLabels = h ?? this._showNodeLabels),
				(this._nodeTypeFilter = c ?? this._nodeTypeFilter),
				(this._linkFilter = f ?? this._linkFilter);
		}
		this.filterGraph(void 0),
			this.initGraph(),
			this.restart(o.simulation.alphas.initialize),
			o.autoResize &&
				((this.resizeObserver = new ResizeObserver($ue(() => this.resize()))),
				this.resizeObserver.observe(this.container));
	}
	get nodeTypeFilter() {
		return this._nodeTypeFilter;
	}
	get includeUnlinked() {
		return this._includeUnlinked;
	}
	set includeUnlinked(t) {
		(this._includeUnlinked = t), this.filterGraph(this.focusedNode);
		const { include: r, exclude: o } =
				this.config.simulation.alphas.filter.unlinked,
			s = t ? r : o;
		this.restart(s);
	}
	set linkFilter(t) {
		(this._linkFilter = t),
			this.filterGraph(this.focusedNode),
			this.restart(this.config.simulation.alphas.filter.link);
	}
	get linkFilter() {
		return this._linkFilter;
	}
	get showNodeLabels() {
		return this._showNodeLabels;
	}
	set showNodeLabels(t) {
		this._showNodeLabels = t;
		const { hide: r, show: o } = this.config.simulation.alphas.labels.nodes,
			s = t ? o : r;
		this.restart(s);
	}
	get showLinkLabels() {
		return this._showLinkLabels;
	}
	set showLinkLabels(t) {
		this._showLinkLabels = t;
		const { hide: r, show: o } = this.config.simulation.alphas.labels.links,
			s = t ? o : r;
		this.restart(s);
	}
	get effectiveWidth() {
		return this.width / this.scale;
	}
	get effectiveHeight() {
		return this.height / this.scale;
	}
	get effectiveCenter() {
		return En.of([this.width, this.height])
			.divide(2)
			.subtract(En.of([this.xOffset, this.yOffset]))
			.divide(this.scale);
	}
	resize() {
		const t = this.width,
			r = this.height,
			o = this.container.getBoundingClientRect().width,
			s = this.container.getBoundingClientRect().height,
			c = t.toFixed(0) !== o.toFixed(0),
			f = r.toFixed(0) !== s.toFixed(0);
		if (!(c || f)) {
			return;
		}
		(this.width = this.container.getBoundingClientRect().width),
			(this.height = this.container.getBoundingClientRect().height);
		const d = this.config.simulation.alphas.resize;
		this.restart(
			x1(d) ? d : d({ oldWidth: t, oldHeight: r, newWidth: o, newHeight: s }),
		);
	}
	restart(t) {
		let r;
		(this.markerSelection = wge({
			config: this.config,
			graph: this.filteredGraph,
			selection: this.markerSelection,
		})),
			(this.linkSelection = gge({
				config: this.config,
				graph: this.filteredGraph,
				selection: this.linkSelection,
				showLabels: this._showLinkLabels,
			})),
			(this.nodeSelection = kge({
				config: this.config,
				drag: this.drag,
				graph: this.filteredGraph,
				onNodeContext: (o) => this.toggleNodeFocus(o),
				onNodeSelected: this.config.callbacks.nodeClicked,
				selection: this.nodeSelection,
				showLabels: this._showNodeLabels,
			})),
			(r = this.simulation) == undefined || r.stop(),
			(this.simulation = Lge({
				center: () => this.effectiveCenter,
				config: this.config,
				graph: this.filteredGraph,
				onTick: () => this.onTick(),
			})
				.alpha(t)
				.restart());
	}
	filterNodesByType(t, r) {
		t
			? this._nodeTypeFilter.push(r)
			: (this._nodeTypeFilter = this._nodeTypeFilter.filter((o) => o !== r)),
			this.filterGraph(this.focusedNode),
			this.restart(this.config.simulation.alphas.filter.type);
	}
	shutdown() {
		let t, r;
		this.focusedNode !== void 0 &&
			((this.focusedNode.isFocused = !1), (this.focusedNode = void 0)),
			(t = this.resizeObserver) == undefined || t.unobserve(this.container),
			(r = this.simulation) == undefined || r.stop();
	}
	initGraph() {
		(this.zoom = Age({
			config: this.config,
			canvasContainer: () => Fn(this.container).select("svg"),
			min: this.config.zoom.min,
			max: this.config.zoom.max,
			onZoom: (t) => this.onZoom(t),
		})),
			(this.canvas = tge({
				applyZoom: this.scale !== 1,
				container: Fn(this.container),
				offset: [this.xOffset, this.yOffset],
				scale: this.scale,
				zoom: this.zoom,
			})),
			this.applyZoom(),
			(this.linkSelection = pge(this.canvas)),
			(this.nodeSelection = _ge(this.canvas)),
			(this.markerSelection = bge(this.canvas)),
			(this.drag = rge({
				config: this.config,
				onDragStart: () => {
					let t;
					return (t = this.simulation) == undefined
						? void 0
						: t.alphaTarget(this.config.simulation.alphas.drag.start).restart();
				},
				onDragEnd: () => {
					let t;
					return (t = this.simulation) == undefined
						? void 0
						: t.alphaTarget(this.config.simulation.alphas.drag.end).restart();
				},
			}));
	}
	onTick() {
		Ege(this.nodeSelection),
			vge({
				config: this.config,
				center: this.effectiveCenter,
				graph: this.filteredGraph,
				selection: this.linkSelection,
			});
	}
	resetView() {
		let t;
		(t = this.simulation) == undefined || t.stop(),
			Fn(this.container).selectChildren().remove(),
			(this.zoom = void 0),
			(this.canvas = void 0),
			(this.linkSelection = void 0),
			(this.nodeSelection = void 0),
			(this.markerSelection = void 0),
			(this.simulation = void 0),
			(this.width = this.container.getBoundingClientRect().width),
			(this.height = this.container.getBoundingClientRect().height);
	}
	onZoom(t) {
		let r, o, s;
		(this.xOffset = t.transform.x),
			(this.yOffset = t.transform.y),
			(this.scale = t.transform.k),
			this.applyZoom(),
			(o = (r = this.config.hooks).afterZoom) == undefined ||
				o.call(r, this.scale, this.xOffset, this.yOffset),
			(s = this.simulation) == undefined || s.restart();
	}
	applyZoom() {
		nge({
			canvas: this.canvas,
			scale: this.scale,
			xOffset: this.xOffset,
			yOffset: this.yOffset,
		});
	}
	toggleNodeFocus(t) {
		t.isFocused
			? (this.filterGraph(void 0),
				this.restart(this.config.simulation.alphas.focus.release(t)))
			: this.focusNode(t);
	}
	focusNode(t) {
		this.filterGraph(t),
			this.restart(this.config.simulation.alphas.focus.acquire(t));
	}
	filterGraph(t) {
		this.focusedNode !== void 0 &&
			((this.focusedNode.isFocused = !1), (this.focusedNode = void 0)),
			t !== void 0 &&
				this._nodeTypeFilter.includes(t.type) &&
				((t.isFocused = !0), (this.focusedNode = t)),
			(this.filteredGraph = ige({
				graph: this.graph,
				filter: this._nodeTypeFilter,
				focusedNode: this.focusedNode,
				includeUnlinked: this._includeUnlinked,
				linkFilter: this._linkFilter,
			}));
	}
}
function h0({ nodes: e, links: t }) {
	return { nodes: e ?? [], links: t ?? [] };
}
function Nge(e) {
	return { ...e };
}
function A1(e) {
	return { ...e, isFocused: !1, lastInteractionTimestamp: void 0 };
}
const $ge = { "h-full": "", "min-h-75": "", "flex-1": "", overflow: "hidden" },
	Pge = { flex: "", "items-center": "", "gap-4": "", "px-3": "", "py-2": "" },
	Oge = ["id", "checked", "onChange"],
	Rge = ["for"],
	Dge = ut({
		__name: "ViewModuleGraph",
		props: { graph: {}, projectName: {} },
		setup(e) {
			const t = e,
				{ graph: r } = $_(t),
				o = We(),
				s = We(!1),
				c = We(),
				f = We();
			Mh(
				() => {
					s.value === !1 && setTimeout(() => (c.value = void 0), 300);
				},
				{ flush: "post" },
			),
				Bs(() => {
					p();
				}),
				Cu(() => {
					let b;
					(b = f.value) == undefined || b.shutdown();
				}),
				Bt(r, p);
			function d(b, w) {
				let M;
				(M = f.value) == undefined || M.filterNodesByType(w, b);
			}
			function h(b) {
				(c.value = b), (s.value = !0);
			}
			function p() {
				let b;
				(b = f.value) == undefined || b.shutdown(),
					!!(r.value && o.value) &&
						(f.value = new Mge(
							o.value,
							r.value,
							ege({
								nodeRadius: 10,
								autoResize: !0,
								simulation: {
									alphas: {
										initialize: 1,
										resize: ({ newHeight: w, newWidth: M }) =>
											w === 0 && M === 0 ? 0 : 0.25,
									},
									forces: {
										collision: { radiusMultiplier: 10 },
										link: { length: 240 },
									},
								},
								marker: _1.Arrow(2),
								modifiers: { node: m },
								positionInitializer:
									r.value.nodes.length > 1 ? rh.Randomized : rh.Centered,
								zoom: { min: 0.5, max: 2 },
							}),
						));
			}
			const v = (b) => b.button === 0;
			function m(b) {
				if (Br) {
					return;
				}
				let w = 0,
					M = 0,
					C = 0;
				b.on("pointerdown", (E, L) => {
					L.type !== "external" &&
						(!(L.x && L.y && v(E)) || ((w = L.x), (M = L.y), (C = Date.now())));
				}).on("pointerup", (E, L) => {
					if (
						L.type === "external" ||
						!L.x ||
						!L.y ||
						!v(E) ||
						Date.now() - C > 500
					) {
						return;
					}
					const N = L.x - w,
						P = L.y - M;
					N ** 2 + P ** 2 < 100 && h(L.id);
				});
			}
			return (b, w) => {
				let N;
				const M = wi,
					C = Nue,
					E = Bw,
					L = Gr("tooltip");
				return (
					oe(),
					me("div", $ge, [
						Y("div", undefined, [
							Y("div", Pge, [
								(oe(!0),
								me(
									ct,
									undefined,
									gi(
										(N = I(f)) == undefined ? void 0 : N.nodeTypes.sort(),
										(P) => {
											let A;
											return (
												oe(),
												me(
													"div",
													{
														key: P,
														flex: "~ gap-1",
														"items-center": "",
														"select-none": "",
													},
													[
														Y(
															"input",
															{
																id: `type-${P}`,
																type: "checkbox",
																checked:
																	(A = I(f)) == undefined
																		? void 0
																		: A.nodeTypeFilter.includes(P),
																onChange: (z) => d(P, z.target.checked),
															},
															undefined,
															40,
															Oge,
														),
														Y(
															"label",
															{
																"font-light": "",
																"text-sm": "",
																"ws-nowrap": "",
																"overflow-hidden": "",
																capitalize: "",
																truncate: "",
																for: `type-${P}`,
																"border-b-2": "",
																style: Jt({
																	"border-color": `var(--color-node-${P})`,
																}),
															},
															He(P) + " Modules",
															13,
															Rge,
														),
													],
												)
											);
										},
									),
									128,
								)),
								w[2] || (w[2] = Y("div", { "flex-auto": "" }, undefined, -1)),
								Y("div", undefined, [
									mt(
										Pe(
											M,
											{ icon: "i-carbon-reset", onClick: p },
											undefined,
											512,
										),
										[[L, "Reset", void 0, { bottom: !0 }]],
									),
								]),
							]),
						]),
						Y("div", { ref_key: "el", ref: o }, undefined, 512),
						Pe(
							E,
							{
								modelValue: I(s),
								"onUpdate:modelValue":
									w[1] || (w[1] = (P) => (At(s) ? (s.value = P) : undefined)),
								direction: "right",
							},
							{
								default: ot(() => [
									I(c)
										? (oe(),
											rt(
												Wy,
												{ key: 0 },
												{
													default: ot(() => [
														Pe(
															C,
															{
																id: I(c),
																"project-name": b.projectName,
																onClose: w[0] || (w[0] = (P) => (s.value = !1)),
															},
															undefined,
															8,
															["id", "project-name"],
														),
													]),
													_: 1,
												},
											))
										: Ye("", !0),
								]),
								_: 1,
							},
							8,
							["modelValue"],
						),
					])
				);
			};
		},
	}),
	zge = {
		key: 0,
		"text-green-500": "",
		"flex-shrink-0": "",
		"i-carbon:checkmark": "",
	},
	Ige = {
		key: 1,
		"text-red-500": "",
		"flex-shrink-0": "",
		"i-carbon:compare": "",
	},
	Fge = {
		key: 2,
		"text-red-500": "",
		"flex-shrink-0": "",
		"i-carbon:close": "",
	},
	Hge = {
		key: 3,
		"text-gray-500": "",
		"flex-shrink-0": "",
		"i-carbon:document-blank": "",
	},
	qge = {
		key: 4,
		"text-gray-500": "",
		"flex-shrink-0": "",
		"i-carbon:redo": "",
		"rotate-90": "",
	},
	Bge = {
		key: 5,
		"text-yellow-500": "",
		"flex-shrink-0": "",
		"i-carbon:circle-dash": "",
		"animate-spin": "",
	},
	M1 = ut({
		__name: "StatusIcon",
		props: { state: {}, mode: {}, failedSnapshot: { type: Boolean } },
		setup(e) {
			return (t, r) => {
				const o = Gr("tooltip");
				return t.state === "pass"
					? (oe(), me("div", zge))
					: t.failedSnapshot
						? mt((oe(), me("div", Ige, undefined, 512)), [
								[
									o,
									"Contains failed snapshot",
									void 0,
									{
										right: !0,
									},
								],
							])
						: t.state === "fail"
							? (oe(), me("div", Fge))
							: t.mode === "todo"
								? mt((oe(), me("div", Hge, undefined, 512)), [
										[o, "Todo", void 0, { right: !0 }],
									])
								: t.mode === "skip" || t.state === "skip"
									? mt((oe(), me("div", qge, undefined, 512)), [
											[o, "Skipped", void 0, { right: !0 }],
										])
									: (oe(), me("div", Bge));
			};
		},
	});
function Wge(e) {
	const t = new Map(),
		r = new Map(),
		o = [];
	for (;;) {
		let s = 0;
		if (
			(e.forEach((c, f) => {
				let v;
				const { splits: d, finished: h } = c;
				if (h) {
					s++;
					const { raw: m, candidate: b } = c;
					t.set(m, b);
					return;
				}
				if (d.length === 0) {
					c.finished = !0;
					return;
				}
				const p = d[0];
				r.has(p)
					? ((c.candidate += c.candidate === "" ? p : `/${p}`),
						(v = r.get(p)) == undefined || v.push(f),
						d.shift())
					: (r.set(p, [f]), o.push(f));
			}),
			o.forEach((c) => {
				const f = e[c],
					d = f.splits.shift();
				f.candidate += f.candidate === "" ? d : `/${d}`;
			}),
			r.forEach((c) => {
				if (c.length === 1) {
					const f = c[0];
					e[f].finished = !0;
				}
			}),
			r.clear(),
			(o.length = 0),
			s === e.length)
		) {
			break;
		}
	}
	return t;
}
function Uge(e) {
	let t = e;
	t.includes("/node_modules/") && (t = e.split(/\/node_modules\//g).pop());
	const r = t.split(/\//g);
	return { raw: t, splits: r, candidate: "", finished: !1, id: e };
}
function Vge(e) {
	const t = e.map((o) => Uge(o)),
		r = Wge(t);
	return t.map(({ raw: o, id: s }) =>
		A1({
			color: "var(--color-node-external)",
			label: {
				color: "var(--color-node-external)",
				fontSize: "0.875rem",
				text: r.get(o) ?? "",
			},
			isFocused: !1,
			id: s,
			type: "external",
		}),
	);
}
function jge(e, t) {
	return A1({
		color: t ? "var(--color-node-root)" : "var(--color-node-inline)",
		label: {
			color: t ? "var(--color-node-root)" : "var(--color-node-inline)",
			fontSize: "0.875rem",
			text: e.split(/\//g).pop(),
		},
		isFocused: !1,
		id: e,
		type: "inline",
	});
}
function Gge(e, t) {
	if (!e) {
		return h0({});
	}
	const r = Vge(e.externalized),
		o = e.inlined.map((d) => jge(d, d === t)) ?? [],
		s = [...r, ...o],
		c = Object.fromEntries(s.map((d) => [d.id, d])),
		f = Object.entries(e.graph).flatMap(([d, h]) =>
			h
				.map((p) => {
					const v = c[d],
						m = c[p];
					if (!(v === void 0 || m === void 0)) {
						return Nge({
							source: v,
							target: m,
							color: "var(--color-link)",
							label: !1,
						});
					}
				})
				.filter((p) => p !== void 0),
		);
	return h0({ nodes: s, links: f });
}
const Kge = {
		key: 0,
		flex: "",
		"flex-col": "",
		"h-full": "",
		"max-h-full": "",
		"overflow-hidden": "",
		"data-testid": "file-detail",
	},
	Xge = {
		p: "2",
		"h-10": "",
		flex: "~ gap-2",
		"items-center": "",
		"bg-header": "",
		border: "b base",
	},
	Yge = { key: 0, class: "i-logos:typescript-icon", "flex-shrink-0": "" },
	Zge = {
		"flex-1": "",
		"font-light": "",
		"op-50": "",
		"ws-nowrap": "",
		truncate: "",
		"text-sm": "",
	},
	Jge = { class: "flex text-lg" },
	Qge = {
		flex: "~",
		"items-center": "",
		"bg-header": "",
		border: "b-2 base",
		"text-sm": "",
		"h-41px": "",
	},
	eve = {
		key: 0,
		class: "block w-1.4em h-1.4em i-carbon:circle-dash animate-spin animate-2s",
	},
	tve = { key: 1, class: "block w-1.4em h-1.4em i-carbon:chart-relationship" },
	nve = { flex: "", "flex-col": "", "flex-1": "", overflow: "hidden" },
	rve = ["flex-1"],
	ive = ut({
		__name: "FileDetails",
		setup(e) {
			const t = We({ nodes: [], links: [] }),
				r = We(!1),
				o = We(!1),
				s = We(!1),
				c = We(void 0),
				f = Te(() => {
					const E = Zt.value;
					if (E && E.filepath) {
						return {
							filepath: E.filepath,
							projectName: E.file.projectName || "",
						};
					}
				}),
				d = Te(() => Zt.value && qh(Zt.value)),
				h = Te(() => {
					let E, L;
					return !!(
						(L = (E = Zt.value) == undefined ? void 0 : E.meta) != undefined &&
						L.typecheck
					);
				});
			function p() {
				let L;
				const E = (L = Zt.value) == undefined ? void 0 : L.filepath;
				E && fetch(`/__open-in-editor?file=${encodeURIComponent(E)}`);
			}
			function v(E) {
				E === "graph" && (o.value = !0), (jn.value = E);
			}
			const m = Te(() => {
				let E;
				return (
					((E = qw.value) == undefined
						? void 0
						: E.reduce((L, { size: N }) => L + N, 0)) ?? 0
				);
			});
			function b(E) {
				r.value = E;
			}
			async function w() {
				let E;
				if (
					!(
						s.value ||
						((E = f.value) == undefined ? void 0 : E.filepath) === c.value
					)
				) {
					(s.value = !0), await un();
					try {
						const L = f.value;
						if (!L) {
							return;
						}
						(!c.value ||
							L.filepath !== c.value ||
							!(t.value.nodes.length > 0 || t.value.links.length > 0)) &&
							((t.value = Gge(
								await xt.rpc.getModuleGraph(L.projectName, L.filepath, !!Ro),
								L.filepath,
							)),
							(c.value = L.filepath)),
							v("graph");
					} finally {
						await new Promise((L) => setTimeout(L, 100)), (s.value = !1);
					}
				}
			}
			Vb(
				() => [f.value, jn.value],
				([, E]) => {
					E === "graph" && w();
				},
				{ debounce: 100, immediate: !0 },
			);
			const M = Te(() => {
					let E;
					return ew((E = Zt.value) == undefined ? void 0 : E.file.projectName);
				}),
				C = Te(() => {
					switch (M.value) {
						case "blue":
						case "green":
						case "magenta": {
							return "white";
						}
						default: {
							return "black";
						}
					}
				});
			return (E, L) => {
				let Q, G, te, Z;
				const N = M1,
					P = wi,
					A = Dge,
					z = _ue,
					W = vue,
					U = uue,
					re = Gr("tooltip");
				return I(Zt)
					? (oe(),
						me("div", Kge, [
							Y("div", undefined, [
								Y("div", Xge, [
									Pe(
										N,
										{
											state: (Q = I(Zt).result) == undefined ? void 0 : Q.state,
											mode: I(Zt).mode,
											"failed-snapshot": I(d),
										},
										undefined,
										8,
										["state", "mode", "failed-snapshot"],
									),
									I(h)
										? mt((oe(), me("div", Yge, undefined, 512)), [
												[
													re,
													"This is a typecheck test. It won't report results of the runtime tests",
													void 0,
													{ bottom: !0 },
												],
											])
										: Ye("", !0),
									(G = I(Zt)) != undefined && G.file.projectName
										? (oe(),
											me(
												"span",
												{
													key: 1,
													class: "rounded-full py-0.5 px-1 text-xs font-light",
													style: Jt({ backgroundColor: I(M), color: I(C) }),
												},
												He(I(Zt).file.projectName),
												5,
											))
										: Ye("", !0),
									Y(
										"div",
										Zge,
										He((te = I(Zt)) == undefined ? void 0 : te.name),
										1,
									),
									Y("div", Jge, [
										I(Br)
											? Ye("", !0)
											: mt(
													(oe(),
													rt(
														P,
														{
															key: 0,
															title: "Open in editor",
															icon: "i-carbon-launch",
															disabled: !(
																(Z = I(Zt)) != undefined && Z.filepath
															),
															onClick: p,
														},
														undefined,
														8,
														["disabled"],
													)),
													[[re, "Open in editor", void 0, { bottom: !0 }]],
												),
									]),
								]),
								Y("div", Qge, [
									Y(
										"button",
										{
											"tab-button": "",
											class: st([
												"flex items-center gap-2",
												{
													"tab-button-active": I(jn) == undefined,
												},
											]),
											"data-testid": "btn-report",
											onClick: L[0] || (L[0] = (q) => v()),
										},
										L[4] ||
											(L[4] = [
												Y(
													"span",
													{ class: "block w-1.4em h-1.4em i-carbon:report" },
													undefined,
													-1,
												),
												pt(" Report "),
											]),
										2,
									),
									Y(
										"button",
										{
											"tab-button": "",
											"data-testid": "btn-graph",
											class: st([
												"flex items-center gap-2",
												{
													"tab-button-active": I(jn) === "graph",
												},
											]),
											onClick: L[1] || (L[1] = (q) => v("graph")),
										},
										[
											I(s) ? (oe(), me("span", eve)) : (oe(), me("span", tve)),
											L[5] || (L[5] = pt(" Module Graph ")),
										],
										2,
									),
									Y(
										"button",
										{
											"tab-button": "",
											"data-testid": "btn-code",
											class: st([
												"flex items-center gap-2",
												{
													"tab-button-active": I(jn) === "editor",
												},
											]),
											onClick: L[2] || (L[2] = (q) => v("editor")),
										},
										[
											L[6] ||
												(L[6] = Y(
													"span",
													{ class: "block w-1.4em h-1.4em i-carbon:code" },
													undefined,
													-1,
												)),
											pt(" " + He(I(r) ? "* " : "") + "Code ", 1),
										],
										2,
									),
									Y(
										"button",
										{
											"tab-button": "",
											"data-testid": "btn-console",
											class: st([
												"flex items-center gap-2",
												{
													"tab-button-active": I(jn) === "console",
													op20: I(jn) !== "console" && I(m) === 0,
												},
											]),
											onClick: L[3] || (L[3] = (q) => v("console")),
										},
										[
											L[7] ||
												(L[7] = Y(
													"span",
													{
														class:
															"block w-1.4em h-1.4em i-carbon:terminal-3270",
													},
													undefined,
													-1,
												)),
											pt(" Console (" + He(I(m)) + ") ", 1),
										],
										2,
									),
								]),
							]),
							Y("div", nve, [
								I(o)
									? (oe(),
										me(
											"div",
											{ key: 0, "flex-1": I(jn) === "graph" && "" },
											[
												mt(
													Pe(
														A,
														{
															graph: I(t),
															"data-testid": "graph",
															"project-name": I(Zt).file.projectName || "",
														},
														undefined,
														8,
														["graph", "project-name"],
													),
													[[Gi, I(jn) === "graph" && !I(s)]],
												),
											],
											8,
											rve,
										))
									: Ye("", !0),
								I(jn) === "editor"
									? (oe(),
										rt(
											z,
											{
												key: I(Zt).filepath,
												file: I(Zt),
												"data-testid": "editor",
												onDraft: b,
											},
											undefined,
											8,
											["file"],
										))
									: I(jn) === "console"
										? (oe(),
											rt(
												W,
												{ key: 2, file: I(Zt), "data-testid": "console" },
												undefined,
												8,
												["file"],
											))
										: I(jn)
											? Ye("", !0)
											: (oe(),
												rt(
													U,
													{ key: 3, file: I(Zt), "data-testid": "report" },
													undefined,
													8,
													["file"],
												)),
							]),
						]))
					: Ye("", !0);
			};
		},
	}),
	ove = { h: "full", flex: "~ col" },
	sve = { "flex-auto": "", "py-1": "", "bg-white": "" },
	lve = ["src"],
	ave = ut({
		__name: "Coverage",
		props: { src: {} },
		setup(e) {
			return (t, r) => (
				oe(),
				me("div", ove, [
					r[0] ||
						(r[0] = Y(
							"div",
							{
								p: "3",
								"h-10": "",
								flex: "~ gap-2",
								"items-center": "",
								"bg-header": "",
								border: "b base",
							},
							[
								Y("div", { class: "i-carbon:folder-details-reference" }),
								Y(
									"span",
									{
										"pl-1": "",
										"font-bold": "",
										"text-sm": "",
										"flex-auto": "",
										"ws-nowrap": "",
										"overflow-hidden": "",
										truncate: "",
									},
									"Coverage",
								),
							],
							-1,
						)),
					Y("div", sve, [
						Y(
							"iframe",
							{ id: "vitest-ui-coverage", src: t.src },
							undefined,
							8,
							lve,
						),
					]),
				])
			);
		},
	}),
	cve = { bg: "red500/10", "p-1": "", "mb-1": "", "mt-2": "", rounded: "" },
	uve = { "font-bold": "" },
	fve = {
		key: 0,
		class: "scrolls",
		text: "xs",
		"font-mono": "",
		"mx-1": "",
		"my-2": "",
		"pb-2": "",
		"overflow-auto": "",
	},
	dve = ["font-bold"],
	hve = { text: "red500/70" },
	pve = { key: 1, text: "sm", "mb-2": "" },
	gve = { "font-bold": "" },
	vve = { key: 2, text: "sm", "mb-2": "" },
	mve = { "font-bold": "" },
	yve = { key: 3, text: "sm", "font-thin": "" },
	bve = ut({
		__name: "ErrorEntry",
		props: { error: {} },
		setup(e) {
			return (t, r) => {
				let o;
				return (
					oe(),
					me(
						ct,
						undefined,
						[
							Y("h4", cve, [
								Y("span", uve, [
									pt(He(t.error.name || t.error.nameStr || "Unknown Error"), 1),
									t.error.message
										? (oe(), me(ct, { key: 0 }, [pt(":")], 64))
										: Ye("", !0),
								]),
								pt(" " + He(t.error.message), 1),
							]),
							(o = t.error.stacks) != undefined && o.length > 0
								? (oe(),
									me("p", fve, [
										(oe(!0),
										me(
											ct,
											undefined,
											gi(
												t.error.stacks,
												(s, c) => (
													oe(),
													me(
														"span",
														{
															key: c,
															"whitespace-pre": "",
															"font-bold": c === 0 ? "" : undefined,
														},
														[
															pt(
																"❯ " + He(s.method) + " " + He(s.file) + ":",
																1,
															),
															Y(
																"span",
																hve,
																He(s.line) + ":" + He(s.column),
																1,
															),
															r[0] ||
																(r[0] = Y("br", undefined, undefined, -1)),
														],
														8,
														dve,
													)
												),
											),
											128,
										)),
									]))
								: Ye("", !0),
							t.error.VITEST_TEST_PATH
								? (oe(),
									me("p", pve, [
										r[1] || (r[1] = pt(" This error originated in ")),
										Y("span", gve, He(t.error.VITEST_TEST_PATH), 1),
										r[2] ||
											(r[2] = pt(
												" test file. It doesn't mean the error was thrown inside the file itself, but while it was running. ",
											)),
									]))
								: Ye("", !0),
							t.error.VITEST_TEST_NAME
								? (oe(),
									me("p", vve, [
										r[3] ||
											(r[3] = pt(
												" The latest test that might've caused the error is ",
											)),
										Y("span", mve, He(t.error.VITEST_TEST_NAME), 1),
										r[4] ||
											(r[4] = pt(". It might mean one of the following:")),
										r[5] || (r[5] = Y("br", undefined, undefined, -1)),
										r[6] ||
											(r[6] = Y(
												"ul",
												undefined,
												[
													Y(
														"li",
														undefined,
														" The error was thrown, while Vitest was running this test. ",
													),
													Y(
														"li",
														undefined,
														" If the error occurred after the test had been completed, this was the last documented test before it was thrown. ",
													),
												],
												-1,
											)),
									]))
								: Ye("", !0),
							t.error.VITEST_AFTER_ENV_TEARDOWN
								? (oe(),
									me(
										"p",
										yve,
										r[7] ||
											(r[7] = [
												pt(
													" This error was caught after test environment was torn down. Make sure to cancel any running tasks before test finishes:",
												),
												Y("br", undefined, undefined, -1),
												Y(
													"ul",
													undefined,
													[
														Y(
															"li",
															undefined,
															" Cancel timeouts using clearTimeout and clearInterval. ",
														),
														Y(
															"li",
															undefined,
															" Wait for promises to resolve using the await keyword. ",
														),
													],
													-1,
												),
											]),
									))
								: Ye("", !0),
						],
						64,
					)
				);
			};
		},
	}),
	wve = {
		"data-testid": "test-files-entry",
		grid: "~ cols-[min-content_1fr_min-content]",
		"items-center": "",
		gap: "x-2 y-3",
		p: "x4",
		relative: "",
		"font-light": "",
		"w-80": "",
		op80: "",
	},
	xve = { class: "number", "data-testid": "num-files" },
	Sve = { class: "number" },
	_ve = { class: "number", "text-red5": "" },
	kve = { class: "number", "text-red5": "" },
	Tve = { class: "number", "text-red5": "" },
	Cve = { class: "number", "data-testid": "run-time" },
	Eve = {
		key: 0,
		bg: "red500/10",
		text: "red500",
		p: "x3 y2",
		"max-w-xl": "",
		"m-2": "",
		rounded: "",
	},
	Lve = {
		text: "sm",
		"font-thin": "",
		"mb-2": "",
		"data-testid": "unhandled-errors",
	},
	Ave = {
		"data-testid": "unhandled-errors-details",
		class: "scrolls unhandled-errors",
		text: "sm",
		"font-thin": "",
		"pe-2.5": "",
		"open:max-h-52": "",
		"overflow-auto": "",
	},
	Mve = ut({
		__name: "TestFilesEntry",
		setup(e) {
			return (t, r) => {
				const o = bve;
				return (
					oe(),
					me(
						ct,
						undefined,
						[
							Y("div", wve, [
								r[8] ||
									(r[8] = Y("div", { "i-carbon-document": "" }, undefined, -1)),
								r[9] || (r[9] = Y("div", undefined, "Files", -1)),
								Y("div", xve, He(I(Ce).summary.files), 1),
								I(Ce).summary.filesSuccess
									? (oe(),
										me(
											ct,
											{ key: 0 },
											[
												r[0] ||
													(r[0] = Y(
														"div",
														{ "i-carbon-checkmark": "" },
														undefined,
														-1,
													)),
												r[1] || (r[1] = Y("div", undefined, "Pass", -1)),
												Y("div", Sve, He(I(Ce).summary.filesSuccess), 1),
											],
											64,
										))
									: Ye("", !0),
								I(Ce).summary.filesFailed
									? (oe(),
										me(
											ct,
											{ key: 1 },
											[
												r[2] ||
													(r[2] = Y(
														"div",
														{ "i-carbon-close": "" },
														undefined,
														-1,
													)),
												r[3] || (r[3] = Y("div", undefined, " Fail ", -1)),
												Y("div", _ve, He(I(Ce).summary.filesFailed), 1),
											],
											64,
										))
									: Ye("", !0),
								I(Ce).summary.filesSnapshotFailed
									? (oe(),
										me(
											ct,
											{ key: 2 },
											[
												r[4] ||
													(r[4] = Y(
														"div",
														{ "i-carbon-compare": "" },
														undefined,
														-1,
													)),
												r[5] ||
													(r[5] = Y("div", undefined, " Snapshot Fail ", -1)),
												Y("div", kve, He(I(Ce).summary.filesSnapshotFailed), 1),
											],
											64,
										))
									: Ye("", !0),
								I(Wi).length > 0
									? (oe(),
										me(
											ct,
											{ key: 3 },
											[
												r[6] ||
													(r[6] = Y(
														"div",
														{ "i-carbon-checkmark-outline-error": "" },
														undefined,
														-1,
													)),
												r[7] || (r[7] = Y("div", undefined, " Errors ", -1)),
												Y("div", Tve, He(I(Wi).length), 1),
											],
											64,
										))
									: Ye("", !0),
								r[10] ||
									(r[10] = Y("div", { "i-carbon-timer": "" }, undefined, -1)),
								r[11] || (r[11] = Y("div", undefined, "Time", -1)),
								Y("div", Cve, He(I(Ce).summary.time), 1),
							]),
							I(Wi).length > 0
								? (oe(),
									me("div", Eve, [
										r[15] ||
											(r[15] = Y(
												"h3",
												{ "text-center": "", "mb-2": "" },
												" Unhandled Errors ",
												-1,
											)),
										Y("p", Lve, [
											pt(
												" Vitest caught " +
													He(I(Wi).length) +
													" error" +
													He(I(Wi).length > 1 ? "s" : "") +
													" during the test run.",
												1,
											),
											r[12] || (r[12] = Y("br", undefined, undefined, -1)),
											r[13] ||
												(r[13] = pt(
													" This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected. ",
												)),
										]),
										Y("details", Ave, [
											r[14] ||
												(r[14] = Y(
													"summary",
													{ "font-bold": "", "cursor-pointer": "" },
													" Errors ",
													-1,
												)),
											(oe(!0),
											me(
												ct,
												undefined,
												gi(
													I(Wi),
													(s, c) => (
														oe(),
														rt(o, { key: c, error: s }, undefined, 8, ["error"])
													),
												),
												128,
											)),
										]),
									]))
								: Ye("", !0),
						],
						64,
					)
				);
			};
		},
	}),
	Nve = Kr(Mve, [["__scopeId", "data-v-0178ddee"]]),
	$ve = { "p-2": "", "text-center": "", flex: "" },
	Pve = { "text-4xl": "", "min-w-2em": "" },
	Ove = { "text-md": "" },
	Rve = ut({
		__name: "DashboardEntry",
		setup(e) {
			return (t, r) => (
				oe(),
				me("div", $ve, [
					Y("div", undefined, [
						Y("div", Pve, [vn(t.$slots, "body")]),
						Y("div", Ove, [vn(t.$slots, "header")]),
					]),
				])
			);
		},
	}),
	Dve = {
		flex: "~ wrap",
		"justify-evenly": "",
		"gap-2": "",
		p: "x-4",
		relative: "",
	},
	zve = ut({
		__name: "TestsEntry",
		setup(e) {
			return (t, r) => {
				const o = Rve;
				return (
					oe(),
					me("div", Dve, [
						Pe(
							o,
							{ "text-green5": "", "data-testid": "pass-entry" },
							{
								header: ot(() => r[0] || (r[0] = [pt(" Pass ")])),
								body: ot(() => [pt(He(I(Ce).summary.testsSuccess), 1)]),
								_: 1,
							},
						),
						Pe(
							o,
							{
								class: st({
									"text-red5": I(Ce).summary.testsFailed,
									op50: !I(Ce).summary.testsFailed,
								}),
								"data-testid": "fail-entry",
							},
							{
								header: ot(() => r[1] || (r[1] = [pt(" Fail ")])),
								body: ot(() => [pt(He(I(Ce).summary.testsFailed), 1)]),
								_: 1,
							},
							8,
							["class"],
						),
						I(Ce).summary.testsSkipped
							? (oe(),
								rt(
									o,
									{ key: 0, op50: "", "data-testid": "skipped-entry" },
									{
										header: ot(() => r[2] || (r[2] = [pt(" Skip ")])),
										body: ot(() => [pt(He(I(Ce).summary.testsSkipped), 1)]),
										_: 1,
									},
								))
							: Ye("", !0),
						I(Ce).summary.testsTodo
							? (oe(),
								rt(
									o,
									{ key: 1, op50: "", "data-testid": "todo-entry" },
									{
										header: ot(() => r[3] || (r[3] = [pt(" Todo ")])),
										body: ot(() => [pt(He(I(Ce).summary.testsTodo), 1)]),
										_: 1,
									},
								))
							: Ye("", !0),
						Pe(
							o,
							{ tail: !0, "data-testid": "total-entry" },
							{
								header: ot(() => r[4] || (r[4] = [pt(" Total ")])),
								body: ot(() => [pt(He(I(Ce).summary.totalTests), 1)]),
								_: 1,
							},
						),
					])
				);
			};
		},
	}),
	Ive = {},
	Fve = {
		"gap-0": "",
		flex: "~ col gap-4",
		"h-full": "",
		"justify-center": "",
		"items-center": "",
	},
	Hve = { "aria-labelledby": "tests", m: "y-4 x-2" };
function qve(e, t) {
	const r = zve,
		o = Nve;
	return oe(), me("div", Fve, [Y("section", Hve, [Pe(r)]), Pe(o)]);
}
const Bve = Kr(Ive, [["render", qve]]),
	Wve = {},
	Uve = { h: "full", flex: "~ col" },
	Vve = { class: "scrolls", "flex-auto": "", "py-1": "" };
function jve(e, t) {
	const r = Bve;
	return (
		oe(),
		me("div", Uve, [
			t[0] ||
				(t[0] = Y(
					"div",
					{
						p: "3",
						"h-10": "",
						flex: "~ gap-2",
						"items-center": "",
						"bg-header": "",
						border: "b base",
					},
					[
						Y("div", { class: "i-carbon-dashboard" }),
						Y(
							"span",
							{
								"pl-1": "",
								"font-bold": "",
								"text-sm": "",
								"flex-auto": "",
								"ws-nowrap": "",
								"overflow-hidden": "",
								truncate: "",
							},
							"Dashboard",
						),
					],
					-1,
				)),
			Y("div", Vve, [Pe(r)]),
		])
	);
}
const Gve = Kr(Wve, [["render", jve]]),
	Kve = ["open"],
	Xve = ut({
		__name: "DetailsPanel",
		props: { color: {} },
		setup(e) {
			const t = We(!0);
			return (r, o) => (
				oe(),
				me(
					"div",
					{
						open: I(t),
						class: "details-panel",
						"data-testid": "details-panel",
						onToggle: o[0] || (o[0] = (s) => (t.value = s.target.open)),
					},
					[
						Y(
							"div",
							{
								p: "y1",
								"text-sm": "",
								"bg-base": "",
								"items-center": "",
								"z-5": "",
								"gap-2": "",
								class: st(r.color),
								"w-full": "",
								flex: "",
								"select-none": "",
								sticky: "",
								top: "-1",
							},
							[
								o[1] ||
									(o[1] = Y(
										"div",
										{ "flex-1": "", "h-1px": "", border: "base b", op80: "" },
										undefined,
										-1,
									)),
								vn(r.$slots, "summary", { open: I(t) }),
								o[2] ||
									(o[2] = Y(
										"div",
										{ "flex-1": "", "h-1px": "", border: "base b", op80: "" },
										undefined,
										-1,
									)),
							],
							2,
						),
						vn(r.$slots, "default"),
					],
					40,
					Kve,
				)
			);
		},
	}),
	Yve = {
		type: "button",
		dark: "op75",
		bg: "gray-200 dark:#111",
		hover: "op100",
		"rounded-1": "",
		"p-0.5": "",
	},
	Zve = {
		__name: "IconAction",
		props: { icon: String },
		setup(e) {
			return (t, r) => (
				oe(),
				me("button", Yve, [
					Y(
						"span",
						{
							block: "",
							class: st([e.icon, "dark:op85 hover:op100"]),
							op65: "",
						},
						undefined,
						2,
					),
				])
			);
		},
	},
	Jve = ["aria-label", "data-current"],
	Qve = { key: 1, "w-4": "" },
	eme = { flex: "", "items-end": "", "gap-2": "", "overflow-hidden": "" },
	tme = { key: 0, class: "i-logos:typescript-icon", "flex-shrink-0": "" },
	nme = { "text-sm": "", truncate: "", "font-light": "" },
	rme = ["text", "innerHTML"],
	ime = { key: 1, text: "xs", op20: "", style: { "white-space": "nowrap" } },
	ome = {
		"gap-1": "",
		"justify-end": "",
		"flex-grow-1": "",
		"pl-1": "",
		class: "test-actions",
	},
	sme = {
		key: 0,
		class: "op100 gap-1 p-y-1",
		grid: "~ items-center cols-[1.5em_1fr]",
	},
	lme = { key: 1 },
	ame = ut({
		__name: "ExplorerItem",
		props: {
			taskId: {},
			name: {},
			indent: {},
			typecheck: { type: Boolean },
			duration: {},
			state: {},
			current: { type: Boolean },
			type: {},
			opened: { type: Boolean },
			expandable: { type: Boolean },
			search: {},
			projectName: {},
			projectNameColor: {},
			disableTaskLocation: { type: Boolean },
			onItemClick: { type: Function },
		},
		setup(e) {
			const t = Te(() => xt.state.idMap.get(e.taskId)),
				r = Te(() => {
					if (Br) {
						return !1;
					}
					const C = t.value;
					return C && qh(C);
				});
			function o() {
				e.expandable &&
					(e.opened ? Ce.collapseNode(e.taskId) : Ce.expandNode(e.taskId));
			}
			async function s(C) {
				let E;
				(E = e.onItemClick) == undefined || E.call(e, C),
					vs.value && ((ou.value = !0), await un()),
					await Zh([C.file]);
			}
			function c(C) {
				return xt.rpc.updateSnapshot(C.file);
			}
			const f = Te(() =>
					e.indent <= 0
						? []
						: Array.from({ length: e.indent }, (C, E) => `${e.taskId}-${E}`),
				),
				d = Te(() => {
					const C = f.value,
						E = [];
					return (
						(e.type === "file" || e.type === "suite") && E.push("min-content"),
						E.push("min-content"),
						e.type === "suite" && e.typecheck && E.push("min-content"),
						E.push("minmax(0, 1fr)"),
						E.push("min-content"),
						`grid-template-columns: ${C.map(() => "1rem").join(" ")} ${E.join(" ")};`
					);
				}),
				h = Te(() => Jb(e.name)),
				p = Te(() => {
					const C = kE.value,
						E = h.value;
					return C
						? E.replace(C, (L) => `<span class="highlight">${L}</span>`)
						: E;
				}),
				v = Te(() => e.type !== "file" && e.disableTaskLocation),
				m = Te(() =>
					e.type === "file"
						? "Open test details"
						: (e.type === "suite"
							? "View Suite Source Code"
							: "View Test Source Code"),
				),
				b = Te(() => (v.value ? "color-red5 dark:color-#f43f5e" : undefined));
			function w() {
				let E;
				const C = t.value;
				e.type === "file"
					? (E = e.onItemClick) == undefined || E.call(e, C)
					: xue(C);
			}
			const M = Te(() => {
				switch (e.projectNameColor) {
					case "blue":
					case "green":
					case "magenta": {
						return "white";
					}
					default: {
						return "black";
					}
				}
			});
			return (C, E) => {
				const L = M1,
					N = Zve,
					P = wi,
					A = Gr("tooltip");
				return I(t)
					? (oe(),
						me(
							"div",
							{
								key: 0,
								"items-center": "",
								p: "x-2 y-1",
								grid: "~ rows-1 items-center gap-x-2",
								"w-full": "",
								"h-28px": "",
								"border-rounded": "",
								hover: "bg-active",
								"cursor-pointer": "",
								class: "item-wrapper",
								style: Jt(I(d)),
								"aria-label": C.name,
								"data-current": C.current,
								onClick: E[2] || (E[2] = (z) => o()),
							},
							[
								C.indent > 0
									? (oe(!0),
										me(
											ct,
											{ key: 0 },
											gi(
												I(f),
												(z) => (
													oe(),
													me("div", {
														key: z,
														border: "solid gray-500 dark:gray-400",
														class: "vertical-line",
														"h-28px": "",
														"inline-flex": "",
														"mx-2": "",
														op20: "",
													})
												),
											),
											128,
										))
									: Ye("", !0),
								C.type === "file" || C.type === "suite"
									? (oe(),
										me("div", Qve, [
											Y(
												"div",
												{
													class: st(
														C.opened
															? "i-carbon:chevron-down"
															: "i-carbon:chevron-right op20",
													),
													op20: "",
												},
												undefined,
												2,
											),
										]))
									: Ye("", !0),
								Pe(
									L,
									{
										state: C.state,
										mode: I(t).mode,
										"failed-snapshot": I(r),
										"w-4": "",
									},
									undefined,
									8,
									["state", "mode", "failed-snapshot"],
								),
								Y("div", eme, [
									C.type === "file" && C.typecheck
										? mt((oe(), me("div", tme, undefined, 512)), [
												[
													A,
													"This is a typecheck test. It won't report results of the runtime tests",
													void 0,
													{ bottom: !0 },
												],
											])
										: Ye("", !0),
									Y("span", nme, [
										C.type === "file" && C.projectName
											? (oe(),
												me(
													"span",
													{
														key: 0,
														class: "rounded-full py-0.5 px-1 mr-1 text-xs",
														style: Jt({
															backgroundColor: C.projectNameColor,
															color: I(M),
														}),
													},
													He(C.projectName),
													5,
												))
											: Ye("", !0),
										Y(
											"span",
											{
												text: C.state === "fail" ? "red-500" : "",
												innerHTML: I(p),
											},
											undefined,
											8,
											rme,
										),
									]),
									typeof C.duration === "number"
										? (oe(),
											me(
												"span",
												ime,
												He(C.duration > 0 ? C.duration : "< 1") + "ms ",
												1,
											))
										: Ye("", !0),
								]),
								Y("div", ome, [
									!I(Br) && I(r)
										? mt(
												(oe(),
												rt(
													N,
													{
														key: 0,
														"data-testid": "btn-fix-snapshot",
														title: "Fix failed snapshot(s)",
														icon: "i-carbon:result-old",
														onClick:
															E[0] ||
															(E[0] = Ec((z) => c(I(t)), ["prevent", "stop"])),
													},
													undefined,
													512,
												)),
												[[A, "Fix failed snapshot(s)", void 0, { bottom: !0 }]],
											)
										: Ye("", !0),
									Pe(
										I(Mb),
										{
											placement: "bottom",
											class: st(["w-1.4em h-1.4em op100 rounded flex", I(b)]),
										},
										{
											popper: ot(() => [
												I(v)
													? (oe(),
														me("div", sme, [
															E[5] ||
																(E[5] = Y(
																	"div",
																	{
																		class:
																			"i-carbon:information-square w-1.5em h-1.5em",
																	},
																	undefined,
																	-1,
																)),
															Y("div", undefined, [
																pt(
																	He(I(m)) +
																		": this feature is not available, you have disabled ",
																	1,
																),
																E[3] ||
																	(E[3] = Y(
																		"span",
																		{ class: "text-[#add467]" },
																		"includeTaskLocation",
																		-1,
																	)),
																E[4] ||
																	(E[4] = pt(" in your configuration file.")),
															]),
															E[6] ||
																(E[6] = Y(
																	"div",
																	{ style: { "grid-column": "2" } },
																	" Clicking this button the code tab will position the cursor at first line in the source code since the UI doesn't have the information available. ",
																	-1,
																)),
														]))
													: (oe(), me("div", lme, He(I(m)), 1)),
											]),
											default: ot(() => [
												Pe(P, {
													"data-testid": "btn-open-details",
													icon: "i-carbon:intrusion-prevention",
													onClick: Ec(w, ["prevent", "stop"]),
												}),
											]),
											_: 1,
										},
										8,
										["class"],
									),
									I(Br)
										? Ye("", !0)
										: mt(
												(oe(),
												rt(
													P,
													{
														key: 1,
														"data-testid": "btn-run-test",
														title: "Run current test",
														icon: "i-carbon:play-filled-alt",
														"text-green5": "",
														disabled: C.type !== "file",
														onClick:
															E[1] ||
															(E[1] = Ec((z) => s(I(t)), ["prevent", "stop"])),
													},
													undefined,
													8,
													["disabled"],
												)),
												[[A, "Run current test", void 0, { bottom: !0 }]],
											),
								]),
							],
							12,
							Jve,
						))
					: Ye("", !0);
			};
		},
	}),
	cme = Kr(ame, [["__scopeId", "data-v-7ecba715"]]),
	ume = { "flex-1": "", "ms-2": "", "select-none": "" },
	fme = ut({
		__name: "FilterStatus",
		props: Wc(
			{ label: {} },
			{ modelValue: { type: [Boolean, undefined] }, modelModifiers: {} },
		),
		emits: ["update:modelValue"],
		setup(e) {
			const t = Nh(e, "modelValue");
			return (r, o) => (
				oe(),
				me(
					"label",
					hi(
						{
							class:
								"font-light text-sm checkbox flex items-center cursor-pointer py-1 text-sm w-full gap-y-1 mb-1px",
						},
						r.$attrs,
						{
							onClick:
								o[1] || (o[1] = Ec((s) => (t.value = !t.value), ["prevent"])),
						},
					),
					[
						Y(
							"span",
							{
								class: st([
									t.value
										? "i-carbon:checkbox-checked-filled"
										: "i-carbon:checkbox",
								]),
								"text-lg": "",
								"aria-hidden": "true",
							},
							undefined,
							2,
						),
						mt(
							Y(
								"input",
								{
									"onUpdate:modelValue": o[0] || (o[0] = (s) => (t.value = s)),
									type: "checkbox",
									"sr-only": "",
								},
								undefined,
								512,
							),
							[[_T, t.value]],
						),
						Y("span", ume, He(r.label), 1),
					],
					16,
				)
			);
		},
	});
function dme() {
	const e = window.navigator.userAgent,
		t = e.indexOf("MSIE ");
	if (t > 0) {
		return Number.parseInt(e.slice(t + 5, e.indexOf(".", t)), 10);
	}
	const r = e.indexOf("Trident/");
	if (r > 0) {
		const o = e.indexOf("rv:");
		return Number.parseInt(e.slice(o + 3, e.indexOf(".", o)), 10);
	}
	const s = e.indexOf("Edge/");
	return s > 0 ? Number.parseInt(e.slice(s + 5, e.indexOf(".", s)), 10) : -1;
}
let Dc;
function sh() {
	sh.init || ((sh.init = !0), (Dc = dme() !== -1));
}
const ju = {
	name: "ResizeObserver",
	props: {
		emitOnMount: { type: Boolean, default: !1 },
		ignoreWidth: { type: Boolean, default: !1 },
		ignoreHeight: { type: Boolean, default: !1 },
	},
	emits: ["notify"],
	mounted() {
		sh(),
			un(() => {
				(this._w = this.$el.offsetWidth),
					(this._h = this.$el.offsetHeight),
					this.emitOnMount && this.emitSize();
			});
		const e = document.createElement("object");
		(this._resizeObject = e),
			e.setAttribute("aria-hidden", "true"),
			e.setAttribute("tabindex", -1),
			(e.onload = this.addResizeHandlers),
			(e.type = "text/html"),
			Dc && this.$el.append(e),
			(e.data = "about:blank"),
			Dc || this.$el.append(e);
	},
	beforeUnmount() {
		this.removeResizeHandlers();
	},
	methods: {
		compareAndNotify() {
			((!this.ignoreWidth && this._w !== this.$el.offsetWidth) ||
				(!this.ignoreHeight && this._h !== this.$el.offsetHeight)) &&
				((this._w = this.$el.offsetWidth),
				(this._h = this.$el.offsetHeight),
				this.emitSize());
		},
		emitSize() {
			this.$emit("notify", { width: this._w, height: this._h });
		},
		addResizeHandlers() {
			this._resizeObject.contentDocument.defaultView.addEventListener(
				"resize",
				this.compareAndNotify,
			),
				this.compareAndNotify();
		},
		removeResizeHandlers() {
			this._resizeObject &&
				this._resizeObject.onload &&
				(!Dc &&
					this._resizeObject.contentDocument &&
					this._resizeObject.contentDocument.defaultView.removeEventListener(
						"resize",
						this.compareAndNotify,
					),
				this.$el.removeChild(this._resizeObject),
				(this._resizeObject.onload = undefined),
				(this._resizeObject = undefined));
		},
	},
};
const hme = py();
dy("data-v-b329ee4c");
const pme = { class: "resize-observer", tabindex: "-1" };
hy();
const gme = hme((e, t, r, o, s, c) => (oe(), rt("div", pme)));
ju.render = gme;
ju.__scopeId = "data-v-b329ee4c";
ju.__file = "src/components/ResizeObserver.vue";
function zc(e) {
	"@babel/helpers - typeof";
	return (
		typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
			? (zc = (t) => typeof t)
			: (zc = (t) =>
					t &&
					typeof Symbol === "function" &&
					t.constructor === Symbol &&
					t !== Symbol.prototype
						? "symbol"
						: typeof t),
		zc(e)
	);
}
function vme(e, t) {
	if (!(e instanceof t)) {
		throw new TypeError("Cannot call a class as a function");
	}
}
function mme(e, t) {
	for (let r = 0; r < t.length; r++) {
		const o = t[r];
		(o.enumerable = o.enumerable || !1),
			(o.configurable = !0),
			"value" in o && (o.writable = !0),
			Object.defineProperty(e, o.key, o);
	}
}
function yme(e, t, r) {
	return t && mme(e.prototype, t), e;
}
function p0(e) {
	return bme(e) || wme(e) || xme(e) || Sme();
}
function bme(e) {
	if (Array.isArray(e)) {
		return lh(e);
	}
}
function wme(e) {
	if (typeof Symbol < "u" && Symbol.iterator in Object(e)) {
		return [...e];
	}
}
function xme(e, t) {
	if (e) {
		if (typeof e === "string") {
			return lh(e, t);
		}
		let r = Object.prototype.toString.call(e).slice(8, -1);
		if (
			(r === "Object" && e.constructor && (r = e.constructor.name),
			r === "Map" || r === "Set")
		) {
			return [...e];
		}
		if (
			r === "Arguments" ||
			/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
		) {
			return lh(e, t);
		}
	}
}
function lh(e, t) {
	(t == undefined || t > e.length) && (t = e.length);
	for (var r = 0, o = new Array(t); r < t; r++) {
		o[r] = e[r];
	}
	return o;
}
function Sme() {
	throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _me(e) {
	let t;
	return typeof e === "function" ? (t = { callback: e }) : (t = e), t;
}
function kme(e, t) {
	let r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {},
		o,
		s,
		c,
		f = (h) => {
			for (
				var p = arguments.length, v = new Array(p > 1 ? p - 1 : 0), m = 1;
				m < p;
				m++
			) {
				v[m - 1] = arguments[m];
			}
			if (((c = v), !(o && h === s))) {
				let b = r.leading;
				typeof b === "function" && (b = b(h, s)),
					(!o || h !== s) && b && e.apply(void 0, [h].concat(p0(c))),
					(s = h),
					clearTimeout(o),
					(o = setTimeout(() => {
						e.apply(void 0, [h].concat(p0(c))), (o = 0);
					}, t));
			}
		};
	return (
		(f._clear = () => {
			clearTimeout(o), (o = undefined);
		}),
		f
	);
}
function N1(e, t) {
	if (e === t) {
		return !0;
	}
	if (zc(e) === "object") {
		for (const r in e) {
			if (!N1(e[r], t[r])) {return !1;}
		}
		return !0;
	}
	return !1;
}
const Tme = (() => {
	function e(t, r, o) {
		vme(this, e),
			(this.el = t),
			(this.observer = undefined),
			(this.frozen = !1),
			this.createObserver(r, o);
	}
	return (
		yme(e, [
			{
				key: "createObserver",
				value(r, o) {
					if ((this.observer && this.destroyObserver(), !this.frozen)) {
						if (
							((this.options = _me(r)),
							(this.callback = (d, h) => {
								this.options.callback(d, h),
									d &&
										this.options.once &&
										((this.frozen = !0), this.destroyObserver());
							}),
							this.callback && this.options.throttle)
						) {
							const c = this.options.throttleOptions || {},
								f = c.leading;
							this.callback = kme(this.callback, this.options.throttle, {
								leading(h) {
									return (
										f === "both" ||
										(f === "visible" && h) ||
										(f === "hidden" && !h)
									);
								},
							});
						}
						(this.oldResult = void 0),
							(this.observer = new IntersectionObserver((d) => {
								let h = d[0];
								if (d.length > 1) {
									const p = d.find((m) => m.isIntersecting);
									p && (h = p);
								}
								if (this.callback) {
									const v =
										h.isIntersecting && h.intersectionRatio >= this.threshold;
									if (v === this.oldResult) {
										return;
									}
									(this.oldResult = v), this.callback(v, h);
								}
							}, this.options.intersection)),
							un(() => {
								this.observer && this.observer.observe(this.el);
							});
					}
				},
			},
			{
				key: "destroyObserver",
				value() {
					this.observer &&
						(this.observer.disconnect(), (this.observer = undefined)),
						this.callback &&
							this.callback._clear &&
							(this.callback._clear(), (this.callback = undefined));
				},
			},
			{
				key: "threshold",
				get() {
					return this.options.intersection &&
						typeof this.options.intersection.threshold === "number"
						? this.options.intersection.threshold
						: 0;
				},
			},
		]),
		e
	);
})();
function $1(e, t, r) {
	const o = t.value;
	if (o) {
		if (typeof IntersectionObserver > "u") {
			console.warn(
				"[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill",
			);
		} else {
			const s = new Tme(e, o, r);
			e._vue_visibilityState = s;
		}
	}
}
function Cme(e, t, r) {
	const o = t.value,
		s = t.oldValue;
	if (!N1(o, s)) {
		const c = e._vue_visibilityState;
		if (!o) {
			P1(e);
			return;
		}
		c ? c.createObserver(o, r) : $1(e, { value: o }, r);
	}
}
function P1(e) {
	const t = e._vue_visibilityState;
	t && (t.destroyObserver(), delete e._vue_visibilityState);
}
const Eme = { beforeMount: $1, updated: Cme, unmounted: P1 },
	Lme = { itemsLimit: 1e3 },
	Ame = /(auto|scroll)/;
function O1(e, t) {
	return e.parentNode === null ? t : O1(e.parentNode, t.concat([e]));
}
const hd = (t, r) => getComputedStyle(t).getPropertyValue(r),
	Mme = (t) => hd(t, "overflow") + hd(t, "overflow-y") + hd(t, "overflow-x"),
	Nme = (t) => Ame.test(Mme(t));
function g0(e) {
	if (e instanceof HTMLElement || e instanceof SVGElement) {
		for (let t = O1(e.parentNode, []), r = 0; r < t.length; r += 1) {
			if (Nme(t[r])) {return t[r];}
		}
		return document.scrollingElement || document.documentElement;
	}
}
function ah(e) {
	"@babel/helpers - typeof";
	return (
		(ah =
			typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
				? (t) => typeof t
				: (t) =>
						t &&
						typeof Symbol === "function" &&
						t.constructor === Symbol &&
						t !== Symbol.prototype
							? "symbol"
							: typeof t),
		ah(e)
	);
}
const $me = {
	items: { type: Array, required: !0 },
	keyField: { type: String, default: "id" },
	direction: {
		type: String,
		default: "vertical",
		validator(t) {
			return ["vertical", "horizontal"].includes(t);
		},
	},
	listTag: { type: String, default: "div" },
	itemTag: { type: String, default: "div" },
};
function Pme() {
	return this.items.length && ah(this.items[0]) !== "object";
}
let ch = !1;
if (typeof window < "u") {
	ch = !1;
	try {
		const Ome = Object.defineProperty({}, "passive", {
			get() {
				ch = !0;
			},
		});
		window.addEventListener("test", undefined, Ome);
	} catch {}
}
let Rme = 0;
const cp = {
	name: "RecycleScroller",
	components: { ResizeObserver: ju },
	directives: { ObserveVisibility: Eme },
	props: {
		...$me,
		itemSize: { type: Number, default: undefined },
		gridItems: { type: Number, default: void 0 },
		itemSecondarySize: { type: Number, default: void 0 },
		minItemSize: { type: [Number, String], default: undefined },
		sizeField: { type: String, default: "size" },
		typeField: { type: String, default: "type" },
		buffer: { type: Number, default: 200 },
		pageMode: { type: Boolean, default: !1 },
		prerender: { type: Number, default: 0 },
		emitUpdate: { type: Boolean, default: !1 },
		updateInterval: { type: Number, default: 0 },
		skipHover: { type: Boolean, default: !1 },
		listTag: { type: String, default: "div" },
		itemTag: { type: String, default: "div" },
		listClass: { type: [String, Object, Array], default: "" },
		itemClass: { type: [String, Object, Array], default: "" },
	},
	emits: [
		"resize",
		"visible",
		"hidden",
		"update",
		"scroll-start",
		"scroll-end",
	],
	data() {
		return { pool: [], totalSize: 0, ready: !1, hoverKey: undefined };
	},
	computed: {
		sizes() {
			if (this.itemSize === null) {
				const e = { "-1": { accumulator: 0 } },
					t = this.items,
					r = this.sizeField,
					o = this.minItemSize;
				let s = 1e4,
					c = 0,
					f;
				for (let d = 0, h = t.length; d < h; d++) {
					(f = t[d][r] || o),
						f < s && (s = f),
						(c += f),
						(e[d] = { accumulator: c, size: f });
				}
				return (this.$_computedMinItemSize = s), e;
			}
			return [];
		},
		simpleArray: Pme,
		itemIndexByKey() {
			const { keyField: e, items: t } = this,
				r = {};
			for (let o = 0, s = t.length; o < s; o++) {
				r[t[o][e]] = o;
			}
			return r;
		},
	},
	watch: {
		items() {
			this.updateVisibleItems(!0);
		},
		pageMode() {
			this.applyPageMode(), this.updateVisibleItems(!1);
		},
		sizes: {
			handler() {
				this.updateVisibleItems(!1);
			},
			deep: !0,
		},
		gridItems() {
			this.updateVisibleItems(!0);
		},
		itemSecondarySize() {
			this.updateVisibleItems(!0);
		},
	},
	created() {
		(this.$_startIndex = 0),
			(this.$_endIndex = 0),
			(this.$_views = new Map()),
			(this.$_unusedViews = new Map()),
			(this.$_scrollDirty = !1),
			(this.$_lastUpdateScrollPosition = 0),
			this.prerender && ((this.$_prerender = !0), this.updateVisibleItems(!1)),
			this.gridItems &&
				!this.itemSize &&
				console.error(
					"[vue-recycle-scroller] You must provide an itemSize when using gridItems",
				);
	},
	mounted() {
		this.applyPageMode(),
			this.$nextTick(() => {
				(this.$_prerender = !1), this.updateVisibleItems(!0), (this.ready = !0);
			});
	},
	activated() {
		const e = this.$_lastUpdateScrollPosition;
		typeof e === "number" &&
			this.$nextTick(() => {
				this.scrollToPosition(e);
			});
	},
	beforeUnmount() {
		this.removeListeners();
	},
	methods: {
		addView(e, t, r, o, s) {
			const c = kh({ id: Rme++, index: t, used: !0, key: o, type: s }),
				f = xh({ item: r, position: 0, nr: c });
			return e.push(f), f;
		},
		unuseView(e, t = !1) {
			const r = this.$_unusedViews,
				o = e.nr.type;
			let s = r.get(o);
			s || ((s = []), r.set(o, s)),
				s.push(e),
				t || ((e.nr.used = !1), (e.position = -9999));
		},
		handleResize() {
			this.$emit("resize"), this.ready && this.updateVisibleItems(!1);
		},
		handleScroll(e) {
			if (!this.$_scrollDirty) {
				if (((this.$_scrollDirty = !0), this.$_updateTimeout)) {
					return;
				}
				const t = () =>
					requestAnimationFrame(() => {
						this.$_scrollDirty = !1;
						const { continuous: r } = this.updateVisibleItems(!1, !0);
						r ||
							(clearTimeout(this.$_refreshTimout),
							(this.$_refreshTimout = setTimeout(
								this.handleScroll,
								this.updateInterval + 100,
							)));
					});
				t(),
					this.updateInterval &&
						(this.$_updateTimeout = setTimeout(() => {
							(this.$_updateTimeout = 0), this.$_scrollDirty && t();
						}, this.updateInterval));
			}
		},
		handleVisibilityChange(e, t) {
			this.ready &&
				(e ||
				t.boundingClientRect.width !== 0 ||
				t.boundingClientRect.height !== 0
					? (this.$emit("visible"),
						requestAnimationFrame(() => {
							this.updateVisibleItems(!1);
						}))
					: this.$emit("hidden"));
		},
		updateVisibleItems(e, t = !1) {
			const r = this.itemSize,
				o = this.gridItems || 1,
				s = this.itemSecondarySize || r,
				c = this.$_computedMinItemSize,
				f = this.typeField,
				d = this.simpleArray ? undefined : this.keyField,
				h = this.items,
				p = h.length,
				v = this.sizes,
				m = this.$_views,
				b = this.$_unusedViews,
				w = this.pool,
				M = this.itemIndexByKey;
			let C, E, L, N, P;
			if (!p) {
				C = E = N = P = L = 0;
			} else if (this.$_prerender) {
				(C = N = 0),
					(E = P = Math.min(this.prerender, h.length)),
					(L = undefined);
			} else {
				const G = this.getScroll();
				if (t) {
					let q = G.start - this.$_lastUpdateScrollPosition;
					if ((q < 0 && (q = -q), (r === null && q < c) || q < r)) {
						return { continuous: !0 };
					}
				}
				this.$_lastUpdateScrollPosition = G.start;
				const te = this.buffer;
				(G.start -= te), (G.end += te);
				let Z = 0;
				if (
					(this.$refs.before &&
						((Z = this.$refs.before.scrollHeight), (G.start -= Z)),
					this.$refs.after)
				) {
					const q = this.$refs.after.scrollHeight;
					G.end += q;
				}
				if (r === null) {
					let q,
						F = 0,
						k = p - 1,
						B = ~~(p / 2),
						V;
					do {
						(V = B),
							(q = v[B].accumulator),
							q < G.start
								? (F = B)
								: B < p - 1 && v[B + 1].accumulator > G.start && (k = B),
							(B = ~~((F + k) / 2));
					} while (B !== V);
					for (
						B < 0 && (B = 0), C = B, L = v[p - 1].accumulator, E = B;
						E < p && v[E].accumulator < G.end;
						E++
					) {}
					for (
						E === -1 ? (E = h.length - 1) : (E++, E > p && (E = p)), N = C;
						N < p && Z + v[N].accumulator < G.start;
						N++
					) {}
					for (P = N; P < p && Z + v[P].accumulator < G.end; P++) {}
				} else {
					C = ~~((G.start / r) * o);
					const q = C % o;
					(C -= q),
						(E = Math.ceil((G.end / r) * o)),
						(N = Math.max(0, Math.floor(((G.start - Z) / r) * o))),
						(P = Math.floor(((G.end - Z) / r) * o)),
						C < 0 && (C = 0),
						E > p && (E = p),
						N < 0 && (N = 0),
						P > p && (P = p),
						(L = Math.ceil(p / o) * r);
				}
			}
			E - C > Lme.itemsLimit && this.itemsLimitError(), (this.totalSize = L);
			let A;
			const z = C <= this.$_endIndex && E >= this.$_startIndex;
			if (z) {
				for (let G = 0, te = w.length; G < te; G++) {
					(A = w[G]),
						A.nr.used &&
							(e && (A.nr.index = M[A.item[d]]),
							(A.nr.index == undefined || A.nr.index < C || A.nr.index >= E) &&
								this.unuseView(A));
				}
			}
			const W = z ? undefined : new Map();
			let U, re, Q;
			for (let G = C; G < E; G++) {
				U = h[G];
				const te = d ? U[d] : U;
				if (te == undefined) {
					throw new Error(`Key is ${te} on item (keyField is '${d}')`);
				}
				if (((A = m.get(te)), !(r || v[G].size > 0))) {
					A && this.unuseView(A);
					continue;
				}
				re = U[f];
				let Z = b.get(re),
					q = !1;
				if (!A) {
					z
						? (Z && Z.length
							? (A = Z.pop())
							: (A = this.addView(w, G, U, te, re)))
						: ((Q = W.get(re) || 0),
							(!Z || Q >= Z.length) &&
								((A = this.addView(w, G, U, te, re)),
								this.unuseView(A, !0),
								(Z = b.get(re))),
							(A = Z[Q]),
							W.set(re, Q + 1)),
						m.delete(A.nr.key),
						(A.nr.used = !0),
						(A.nr.index = G),
						(A.nr.key = te),
						(A.nr.type = re),
						m.set(te, A),
						(q = !0);
				} else if (!A.nr.used && ((A.nr.used = !0), (q = !0), Z)) {
					const F = Z.indexOf(A);
					F !== -1 && Z.splice(F, 1);
				}
				(A.item = U),
					q &&
						(G === h.length - 1 && this.$emit("scroll-end"),
						G === 0 && this.$emit("scroll-start")),
					r === null
						? ((A.position = v[G - 1].accumulator), (A.offset = 0))
						: ((A.position = Math.floor(G / o) * r), (A.offset = (G % o) * s));
			}
			return (
				(this.$_startIndex = C),
				(this.$_endIndex = E),
				this.emitUpdate && this.$emit("update", C, E, N, P),
				clearTimeout(this.$_sortTimer),
				(this.$_sortTimer = setTimeout(
					this.sortViews,
					this.updateInterval + 300,
				)),
				{ continuous: z }
			);
		},
		getListenerTarget() {
			let e = g0(this.$el);
			return (
				window.document &&
					(e === window.document.documentElement ||
						e === window.document.body) &&
					(e = window),
				e
			);
		},
		getScroll() {
			const { $el: e, direction: t } = this,
				r = t === "vertical";
			let o;
			if (this.pageMode) {
				const s = e.getBoundingClientRect(),
					c = r ? s.height : s.width;
				let f = -(r ? s.top : s.left),
					d = r ? window.innerHeight : window.innerWidth;
				f < 0 && ((d += f), (f = 0)),
					f + d > c && (d = c - f),
					(o = { start: f, end: f + d });
			} else {
				r
					? (o = { start: e.scrollTop, end: e.scrollTop + e.clientHeight })
					: (o = { start: e.scrollLeft, end: e.scrollLeft + e.clientWidth });
			}
			return o;
		},
		applyPageMode() {
			this.pageMode ? this.addListeners() : this.removeListeners();
		},
		addListeners() {
			(this.listenerTarget = this.getListenerTarget()),
				this.listenerTarget.addEventListener(
					"scroll",
					this.handleScroll,
					ch ? { passive: !0 } : !1,
				),
				this.listenerTarget.addEventListener("resize", this.handleResize);
		},
		removeListeners() {
			this.listenerTarget &&
				(this.listenerTarget.removeEventListener("scroll", this.handleScroll),
				this.listenerTarget.removeEventListener("resize", this.handleResize),
				(this.listenerTarget = undefined));
		},
		scrollToItem(e) {
			let t;
			const r = this.gridItems || 1;
			this.itemSize === null
				? (t = e > 0 ? this.sizes[e - 1].accumulator : 0)
				: (t = Math.floor(e / r) * this.itemSize),
				this.scrollToPosition(t);
		},
		scrollToPosition(e) {
			const t =
				this.direction === "vertical"
					? { scroll: "scrollTop", start: "top" }
					: { scroll: "scrollLeft", start: "left" };
			let r, o, s;
			if (this.pageMode) {
				const c = g0(this.$el),
					f = c.tagName === "HTML" ? 0 : c[t.scroll],
					d = c.getBoundingClientRect(),
					p = this.$el.getBoundingClientRect()[t.start] - d[t.start];
				(r = c), (o = t.scroll), (s = e + f + p);
			} else {
				(r = this.$el), (o = t.scroll), (s = e);
			}
			r[o] = s;
		},
		itemsLimitError() {
			throw (
				(setTimeout(() => {
					console.log(
						"It seems the scroller element isn't scrolling, so it tries to render all the items at once.",
						"Scroller:",
						this.$el,
					),
						console.log(
							"Make sure the scroller has a fixed height (or width) and 'overflow-y' (or 'overflow-x') set to 'auto' so it can scroll correctly and only render the items visible in the scroll viewport.",
						);
				}),
				new Error("Rendered items limit reached"))
			);
		},
		sortViews() {
			this.pool.sort((e, t) => e.nr.index - t.nr.index);
		},
	},
};
const Dme = { key: 0, ref: "before", class: "vue-recycle-scroller__slot" },
	zme = { key: 1, ref: "after", class: "vue-recycle-scroller__slot" };
function Ime(e, t, r, o, s, c) {
	const f = Po("ResizeObserver"),
		d = Gr("observe-visibility");
	return mt(
		(oe(),
		me(
			"div",
			{
				class: st([
					"vue-recycle-scroller",
					{
						ready: s.ready,
						"page-mode": r.pageMode,
						[`direction-${e.direction}`]: !0,
					},
				]),
				onScrollPassive:
					t[0] || (t[0] = (...h) => c.handleScroll && c.handleScroll(...h)),
			},
			[
				e.$slots.before
					? (oe(), me("div", Dme, [vn(e.$slots, "before")], 512))
					: Ye("v-if", !0),
				(oe(),
				rt(
					yv(r.listTag),
					{
						ref: "wrapper",
						style: Jt({
							[e.direction === "vertical" ? "minHeight" : "minWidth"]:
								s.totalSize + "px",
						}),
						class: st(["vue-recycle-scroller__item-wrapper", r.listClass]),
					},
					{
						default: ot(() => [
							(oe(!0),
							me(
								ct,
								undefined,
								gi(
									s.pool,
									(h) => (
										oe(),
										rt(
											yv(r.itemTag),
											hi(
												{
													key: h.nr.id,
													style: s.ready
														? {
																transform: `translate${
																	e.direction === "vertical" ? "Y" : "X"
																}(${h.position}px) translate${
																	e.direction === "vertical" ? "X" : "Y"
																}(${h.offset}px)`,
																width: r.gridItems
																	? `${
																			(e.direction === "vertical" &&
																				r.itemSecondarySize) ||
																			r.itemSize
																		}px`
																	: void 0,
																height: r.gridItems
																	? `${
																			(e.direction === "horizontal" &&
																				r.itemSecondarySize) ||
																			r.itemSize
																		}px`
																	: void 0,
															}
														: undefined,
													class: [
														"vue-recycle-scroller__item-view",
														[
															r.itemClass,
															{
																hover: !r.skipHover && s.hoverKey === h.nr.key,
															},
														],
													],
												},
												rk(
													r.skipHover
														? {}
														: {
																mouseenter: () => {
																	s.hoverKey = h.nr.key;
																},
																mouseleave: () => {
																	s.hoverKey = undefined;
																},
															},
												),
											),
											{
												default: ot(() => [
													vn(e.$slots, "default", {
														item: h.item,
														index: h.nr.index,
														active: h.nr.used,
													}),
												]),
												_: 2,
											},
											1040,
											["style", "class"],
										)
									),
								),
								128,
							)),
							vn(e.$slots, "empty"),
						]),
						_: 3,
					},
					8,
					["style", "class"],
				)),
				e.$slots.after
					? (oe(), me("div", zme, [vn(e.$slots, "after")], 512))
					: Ye("v-if", !0),
				Pe(f, { onNotify: c.handleResize }, undefined, 8, ["onNotify"]),
			],
			34,
		)),
		[[d, c.handleVisibilityChange]],
	);
}
cp.render = Ime;
cp.__file = "src/components/RecycleScroller.vue";
function Fme(e) {
	const t = Te(() => (qd.value ? !1 : !et.onlyTests)),
		r = Te(() => zn.value === ""),
		o = We(zn.value);
	Vb(
		zn,
		(h) => {
			o.value = (h == undefined ? void 0 : h.trim()) ?? "";
		},
		{ debounce: 256 },
	);
	function s(h) {
		let p;
		(zn.value = ""), h && ((p = e.value) == undefined || p.focus());
	}
	function c(h) {
		let p;
		(et.failed = !1),
			(et.success = !1),
			(et.skipped = !1),
			(et.onlyTests = !1),
			h && ((p = e.value) == undefined || p.focus());
	}
	function f() {
		c(!1), s(!0);
	}
	function d(h, p, v, m, b) {
		Ds.value &&
			((ln.value.search = (h == undefined ? void 0 : h.trim()) ?? ""),
			(ln.value.failed = p),
			(ln.value.success = v),
			(ln.value.skipped = m),
			(ln.value.onlyTests = b));
	}
	return (
		Bt(
			() => [o.value, et.failed, et.success, et.skipped, et.onlyTests],
			([h, p, v, m, b]) => {
				d(h, p, v, m, b), Ce.filterNodes();
			},
			{ flush: "post" },
		),
		Bt(
			() => Er.value.length,
			(h) => {
				h && (ln.value.expandAll = void 0);
			},
			{ flush: "post" },
		),
		{
			initialized: Ds,
			filter: et,
			search: zn,
			disableFilter: t,
			isFiltered: Qb,
			isFilteredByStatus: qd,
			disableClearSearch: r,
			clearAll: f,
			clearSearch: s,
			clearFilter: c,
			filteredFiles: Iu,
			testsTotal: TE,
			uiEntries: Bn,
		}
	);
}
const Hme = {
		p: "2",
		"h-10": "",
		flex: "~ gap-2",
		"items-center": "",
		"bg-header": "",
		border: "b base",
	},
	qme = {
		p: "l3 y2 r2",
		flex: "~ gap-2",
		"items-center": "",
		"bg-header": "",
		border: "b-2 base",
	},
	Bme = ["op"],
	Wme = {
		grid: "~ items-center gap-x-1 cols-[auto_min-content_auto] rows-[min-content_min-content]",
	},
	Ume = { "text-red5": "" },
	Vme = { "text-yellow5": "" },
	jme = { "text-green5": "" },
	Gme = { class: "text-purple5:50" },
	Kme = {
		key: 0,
		flex: "~ col",
		"items-center": "",
		p: "x4 y4",
		"font-light": "",
	},
	Xme = ["disabled"],
	Yme = ["disabled"],
	Zme = {
		key: 1,
		flex: "~ col",
		"items-center": "",
		p: "x4 y4",
		"font-light": "",
	},
	Jme = ut({
		inheritAttrs: !1,
		__name: "Explorer",
		props: { onItemClick: { type: Function } },
		emits: ["item-click", "run"],
		setup(e, { emit: t }) {
			const r = t,
				o = Te(() => Bu.value.includeTaskLocation),
				s = We(),
				{
					initialized: c,
					filter: f,
					search: d,
					disableFilter: h,
					isFiltered: p,
					isFilteredByStatus: v,
					disableClearSearch: m,
					clearAll: b,
					clearSearch: w,
					clearFilter: M,
					filteredFiles: C,
					testsTotal: E,
					uiEntries: L,
				} = Fme(s),
				N = We("grid-cols-2"),
				P = We("grid-col-span-2"),
				A = We(),
				{ width: z } = Wh();
			return (
				Bt(
					() => z.value * (gn.navigation / 100),
					(W) => {
						W < 420
							? ((N.value = "grid-cols-2"), (P.value = "grid-col-span-2"))
							: ((N.value = "grid-cols-4"), (P.value = "grid-col-span-4"));
					},
				),
				(W, U) => {
					const re = wi,
						Q = fme,
						G = cme,
						te = Xve,
						Z = Gr("tooltip");
					return (
						oe(),
						me(
							"div",
							{ ref_key: "testExplorerRef", ref: A, h: "full", flex: "~ col" },
							[
								Y("div", undefined, [
									Y("div", Hme, [
										vn(W.$slots, "header", {
											filteredFiles: I(p) || I(v) ? I(C) : void 0,
										}),
									]),
									Y("div", qme, [
										U[13] ||
											(U[13] = Y(
												"div",
												{ class: "i-carbon:search", "flex-shrink-0": "" },
												undefined,
												-1,
											)),
										mt(
											Y(
												"input",
												{
													ref_key: "searchBox",
													ref: s,
													"onUpdate:modelValue":
														U[0] ||
														(U[0] = (q) => (At(d) ? (d.value = q) : undefined)),
													placeholder: "Search...",
													outline: "none",
													bg: "transparent",
													font: "light",
													text: "sm",
													"flex-1": "",
													"pl-1": "",
													op: I(d).length > 0 ? "100" : "50",
													onKeydown: [
														U[1] || (U[1] = Pd((q) => I(w)(!1), ["esc"])),
														U[2] ||
															(U[2] = Pd(
																(q) => r("run", I(p) || I(v) ? I(C) : void 0),
																["enter"],
															)),
													],
												},
												undefined,
												40,
												Bme,
											),
											[[ST, I(d)]],
										),
										mt(
											Pe(
												re,
												{
													disabled: I(m),
													title: "Clear search",
													icon: "i-carbon:filter-remove",
													onClickPassive: U[3] || (U[3] = (q) => I(w)(!0)),
												},
												undefined,
												8,
												["disabled"],
											),
											[[Z, "Clear search", void 0, { bottom: !0 }]],
										),
									]),
									Y(
										"div",
										{
											p: "l3 y2 r2",
											"items-center": "",
											"bg-header": "",
											border: "b-2 base",
											grid: "~ items-center gap-x-2 rows-[auto_auto]",
											class: st(I(N)),
										},
										[
											Y(
												"div",
												{ class: st(I(P)), flex: "~ gap-2 items-center" },
												[
													U[14] ||
														(U[14] = Y(
															"div",
															{
																"aria-hidden": "true",
																class: "i-carbon:filter",
															},
															undefined,
															-1,
														)),
													U[15] ||
														(U[15] = Y(
															"div",
															{ "flex-grow-1": "", "text-sm": "" },
															" Filter ",
															-1,
														)),
													mt(
														Pe(
															re,
															{
																disabled: I(h),
																title: "Clear search",
																icon: "i-carbon:filter-remove",
																onClickPassive:
																	U[4] || (U[4] = (q) => I(M)(!1)),
															},
															undefined,
															8,
															["disabled"],
														),
														[[Z, "Clear Filter", void 0, { bottom: !0 }]],
													),
												],
												2,
											),
											Pe(
												Q,
												{
													modelValue: I(f).failed,
													"onUpdate:modelValue":
														U[5] || (U[5] = (q) => (I(f).failed = q)),
													label: "Fail",
												},
												undefined,
												8,
												["modelValue"],
											),
											Pe(
												Q,
												{
													modelValue: I(f).success,
													"onUpdate:modelValue":
														U[6] || (U[6] = (q) => (I(f).success = q)),
													label: "Pass",
												},
												undefined,
												8,
												["modelValue"],
											),
											Pe(
												Q,
												{
													modelValue: I(f).skipped,
													"onUpdate:modelValue":
														U[7] || (U[7] = (q) => (I(f).skipped = q)),
													label: "Skip",
												},
												undefined,
												8,
												["modelValue"],
											),
											Pe(
												Q,
												{
													modelValue: I(f).onlyTests,
													"onUpdate:modelValue":
														U[8] || (U[8] = (q) => (I(f).onlyTests = q)),
													label: "Only Tests",
												},
												undefined,
												8,
												["modelValue"],
											),
										],
										2,
									),
								]),
								Y(
									"div",
									{
										class: "scrolls",
										"flex-auto": "",
										"py-1": "",
										onScrollPassive:
											U[12] || (U[12] = (...q) => I(um) && I(um)(...q)),
									},
									[
										Pe(
											te,
											undefined,
											nk(
												{
													default: ot(() => [
														(I(p) || I(v)) && I(L).length === 0
															? (oe(),
																me(
																	ct,
																	{ key: 0 },
																	[
																		I(c)
																			? (oe(),
																				me("div", Kme, [
																					U[18] ||
																						(U[18] = Y(
																							"div",
																							{ op30: "" },
																							" No matched test ",
																							-1,
																						)),
																					Y(
																						"button",
																						{
																							type: "button",
																							"font-light": "",
																							"text-sm": "",
																							border: "~ gray-400/50 rounded",
																							p: "x2 y0.5",
																							m: "t2",
																							op: "50",
																							class: st(
																								I(m)
																									? undefined
																									: "hover:op100",
																							),
																							disabled: I(m),
																							onClickPassive:
																								U[9] ||
																								(U[9] = (q) => I(w)(!0)),
																						},
																						" Clear Search ",
																						42,
																						Xme,
																					),
																					Y(
																						"button",
																						{
																							type: "button",
																							"font-light": "",
																							"text-sm": "",
																							border: "~ gray-400/50 rounded",
																							p: "x2 y0.5",
																							m: "t2",
																							op: "50",
																							class: st(
																								I(h)
																									? undefined
																									: "hover:op100",
																							),
																							disabled: I(h),
																							onClickPassive:
																								U[10] ||
																								(U[10] = (q) => I(M)(!0)),
																						},
																						" Clear Filter ",
																						42,
																						Yme,
																					),
																					Y(
																						"button",
																						{
																							type: "button",
																							"font-light": "",
																							op: "50 hover:100",
																							"text-sm": "",
																							border: "~ gray-400/50 rounded",
																							p: "x2 y0.5",
																							m: "t2",
																							onClickPassive:
																								U[11] ||
																								(U[11] = (...q) =>
																									I(b) && I(b)(...q)),
																						},
																						" Clear All ",
																						32,
																					),
																				]))
																			: (oe(),
																				me(
																					"div",
																					Zme,
																					U[19] ||
																						(U[19] = [
																							Y(
																								"div",
																								{
																									class:
																										"i-carbon:circle-dash animate-spin",
																								},
																								undefined,
																								-1,
																							),
																							Y(
																								"div",
																								{ op30: "" },
																								" Loading... ",
																								-1,
																							),
																						]),
																				)),
																	],
																	64,
																))
															: (oe(),
																rt(
																	I(cp),
																	{
																		key: 1,
																		"page-mode": "",
																		"key-field": "id",
																		"item-size": 28,
																		items: I(L),
																		buffer: 100,
																	},
																	{
																		default: ot(({ item: q }) => [
																			Pe(
																				G,
																				{
																					class: st([
																						"h-28px m-0 p-0",
																						I(eo) === q.id ? "bg-active" : "",
																					]),
																					"task-id": q.id,
																					expandable: q.expandable,
																					type: q.type,
																					current: I(eo) === q.id,
																					indent: q.indent,
																					name: q.name,
																					typecheck: q.typecheck === !0,
																					"project-name": q.projectName ?? "",
																					"project-name-color":
																						q.projectNameColor ?? "",
																					state: q.state,
																					duration: q.duration,
																					opened: q.expanded,
																					"disable-task-location": !I(o),
																					"on-item-click": W.onItemClick,
																				},
																				undefined,
																				8,
																				[
																					"task-id",
																					"expandable",
																					"type",
																					"current",
																					"indent",
																					"name",
																					"typecheck",
																					"project-name",
																					"project-name-color",
																					"state",
																					"duration",
																					"opened",
																					"disable-task-location",
																					"class",
																					"on-item-click",
																				],
																			),
																		]),
																		_: 1,
																	},
																	8,
																	["items"],
																)),
													]),
													_: 2,
												},
												[
													I(c)
														? {
																name: "summary",
																fn: ot(() => [
																	Y("div", Wme, [
																		Y(
																			"span",
																			Ume,
																			" FAIL (" + He(I(E).failed) + ") ",
																			1,
																		),
																		U[16] ||
																			(U[16] = Y("span", undefined, "/", -1)),
																		Y(
																			"span",
																			Vme,
																			" RUNNING (" + He(I(E).running) + ") ",
																			1,
																		),
																		Y(
																			"span",
																			jme,
																			" PASS (" + He(I(E).success) + ") ",
																			1,
																		),
																		U[17] ||
																			(U[17] = Y("span", undefined, "/", -1)),
																		Y(
																			"span",
																			Gme,
																			" SKIP (" +
																				He(
																					I(f).onlyTests ? I(E).skipped : "--",
																				) +
																				") ",
																			1,
																		),
																	]),
																]),
																key: "0",
															}
														: void 0,
												],
											),
											1024,
										),
									],
									32,
								),
							],
							512,
						)
					);
				}
			);
		},
	}),
	Qme = "" + new URL("../favicon.svg", import.meta.url).href,
	e0e = { class: "flex text-lg" },
	t0e = ut({
		__name: "Navigation",
		setup(e) {
			function t() {
				return xt.rpc.updateSnapshot();
			}
			const r = Te(() => (Sa.value ? "light" : "dark"));
			async function o(f) {
				vs.value &&
					((ou.value = !0), await un(), to.value && (su(!0), await un())),
					f != undefined && f.length > 0 ? await Zh(f) : await Ece();
			}
			function s() {
				Ce.collapseAllNodes();
			}
			function c() {
				Ce.expandAllNodes();
			}
			return (f, d) => {
				const h = wi,
					p = Jme,
					v = Gr("tooltip");
				return (
					oe(),
					rt(
						p,
						{ border: "r base", "on-item-click": I(aw), nested: !0, onRun: o },
						{
							header: ot(({ filteredFiles: m }) => [
								d[8] ||
									(d[8] = Y(
										"img",
										{ "w-6": "", "h-6": "", src: Qme, alt: "Vitest logo" },
										undefined,
										-1,
									)),
								d[9] ||
									(d[9] = Y(
										"span",
										{ "font-light": "", "text-sm": "", "flex-1": "" },
										"Vitest",
										-1,
									)),
								Y("div", e0e, [
									mt(
										Pe(
											h,
											{
												title: "Collapse tests",
												disabled: !I(Ds),
												"data-testid": "collapse-all",
												icon: "i-carbon:collapse-all",
												onClick: d[0] || (d[0] = (b) => s()),
											},
											undefined,
											8,
											["disabled"],
										),
										[
											[Gi, !I(wm)],
											[v, "Collapse tests", void 0, { bottom: !0 }],
										],
									),
									mt(
										Pe(
											h,
											{
												disabled: !I(Ds),
												title: "Expand tests",
												"data-testid": "expand-all",
												icon: "i-carbon:expand-all",
												onClick: d[1] || (d[1] = (b) => c()),
											},
											undefined,
											8,
											["disabled"],
										),
										[
											[Gi, I(wm)],
											[v, "Expand tests", void 0, { bottom: !0 }],
										],
									),
									mt(
										Pe(
											h,
											{
												title: "Show dashboard",
												class: "!animate-100ms",
												"animate-count-1": "",
												icon: "i-carbon:dashboard",
												onClick: d[2] || (d[2] = (b) => I(su)(!0)),
											},
											undefined,
											512,
										),
										[
											[Gi, (I(Vd) && !I(vs)) || !I(Es)],
											[v, "Dashboard", void 0, { bottom: !0 }],
										],
									),
									I(Vd) && !I(vs)
										? (oe(),
											rt(
												I(Mb),
												{
													key: 0,
													title: "Coverage enabled but missing html reporter",
													class:
														"w-1.4em h-1.4em op100 rounded flex color-red5 dark:color-#f43f5e cursor-help",
												},
												{
													popper: ot(
														() =>
															d[6] ||
															(d[6] = [
																Y(
																	"div",
																	{
																		class: "op100 gap-1 p-y-1",
																		grid: "~ items-center cols-[1.5em_1fr]",
																	},
																	[
																		Y("div", {
																			class:
																				"i-carbon:information-square w-1.5em h-1.5em",
																		}),
																		Y(
																			"div",
																			undefined,
																			"Coverage enabled but missing html reporter.",
																		),
																		Y(
																			"div",
																			{ style: { "grid-column": "2" } },
																			" Add html reporter to your configuration to see coverage here. ",
																		),
																	],
																	-1,
																),
															]),
													),
													default: ot(() => [
														d[7] ||
															(d[7] = Y(
																"div",
																{ class: "i-carbon:folder-off ma" },
																undefined,
																-1,
															)),
													]),
													_: 1,
												},
											))
										: Ye("", !0),
									I(vs)
										? mt(
												(oe(),
												rt(
													h,
													{
														key: 1,
														disabled: I(ou),
														title: "Show coverage",
														class: "!animate-100ms",
														"animate-count-1": "",
														icon: "i-carbon:folder-details-reference",
														onClick: d[3] || (d[3] = (b) => I(tL)()),
													},
													undefined,
													8,
													["disabled"],
												)),
												[
													[Gi, !I(to)],
													[v, "Coverage", void 0, { bottom: !0 }],
												],
											)
										: Ye("", !0),
									I(Ce).summary.failedSnapshot && !I(Br)
										? mt(
												(oe(),
												rt(
													h,
													{
														key: 2,
														icon: "i-carbon:result-old",
														disabled: !I(Ce).summary.failedSnapshotEnabled,
														onClick:
															d[4] ||
															(d[4] = (b) =>
																I(Ce).summary.failedSnapshotEnabled && t()),
													},
													undefined,
													8,
													["disabled"],
												)),
												[
													[
														v,
														"Update all failed snapshot(s)",
														void 0,
														{ bottom: !0 },
													],
												],
											)
										: Ye("", !0),
									I(Br)
										? Ye("", !0)
										: mt(
												(oe(),
												rt(
													h,
													{
														key: 3,
														disabled:
															(m == undefined ? void 0 : m.length) === 0,
														icon: "i-carbon:play",
														onClick: (b) => o(m),
													},
													undefined,
													8,
													["disabled", "onClick"],
												)),
												[
													[
														v,
														m
															? (m.length === 0
																? "No test to run (clear filter)"
																: "Rerun filtered")
															: "Rerun all",
														void 0,
														{ bottom: !0 },
													],
												],
											),
									mt(
										Pe(
											h,
											{
												icon: "dark:i-carbon-moon i-carbon:sun",
												onClick: d[5] || (d[5] = (b) => I(Jce)()),
											},
											undefined,
											512,
										),
										[[v, `Toggle to ${I(r)} mode`, void 0, { bottom: !0 }]],
									),
								]),
							]),
							_: 1,
						},
						8,
						["on-item-click"],
					)
				);
			};
		},
	}),
	n0e = {
		"h-3px": "",
		relative: "",
		"overflow-hidden": "",
		class: "px-0",
		"w-screen": "",
	},
	r0e = ut({
		__name: "ProgressBar",
		setup(e) {
			const { width: t } = Wh(),
				r = Te(() =>
					Ce.summary.files === 0
						? "!bg-gray-4 !dark:bg-gray-7 in-progress"
						: (QE.value
							? null
							: "in-progress"),
				),
				o = Te(() => {
					const d = Ce.summary.files;
					return d > 0 ? (t.value * Ce.summary.filesSuccess) / d : 0;
				}),
				s = Te(() => {
					const d = Ce.summary.files;
					return d > 0 ? (t.value * Ce.summary.filesFailed) / d : 0;
				}),
				c = Te(
					() =>
						Ce.summary.files - Ce.summary.filesFailed - Ce.summary.filesSuccess,
				),
				f = Te(() => {
					const d = Ce.summary.files;
					return d > 0 ? (t.value * c.value) / d : 0;
				});
			return (d, h) => (
				oe(),
				me(
					"div",
					{
						absolute: "",
						"t-0": "",
						"l-0": "",
						"r-0": "",
						"z-index-1031": "",
						"pointer-events-none": "",
						"p-0": "",
						"h-3px": "",
						grid: "~ auto-cols-max",
						"justify-items-center": "",
						"w-screen": "",
						class: st(I(r)),
					},
					[
						Y("div", n0e, [
							Y(
								"div",
								{
									absolute: "",
									"l-0": "",
									"t-0": "",
									"bg-red5": "",
									"h-3px": "",
									class: st(I(r)),
									style: Jt(`width: ${I(s)}px;`),
								},
								"   ",
								6,
							),
							Y(
								"div",
								{
									absolute: "",
									"l-0": "",
									"t-0": "",
									"bg-green5": "",
									"h-3px": "",
									class: st(I(r)),
									style: Jt(`left: ${I(s)}px; width: ${I(o)}px;`),
								},
								"   ",
								6,
							),
							Y(
								"div",
								{
									absolute: "",
									"l-0": "",
									"t-0": "",
									"bg-yellow5": "",
									"h-3px": "",
									class: st(I(r)),
									style: Jt(`left: ${I(o) + I(s)}px; width: ${I(f)}px;`),
								},
								"   ",
								6,
							),
						]),
					],
					2,
				)
			);
		},
	}),
	i0e = Kr(r0e, [["__scopeId", "data-v-54017b6a"]]),
	v0 = {
		name: "splitpanes",
		emits: [
			"ready",
			"resize",
			"resized",
			"pane-click",
			"pane-maximize",
			"pane-add",
			"pane-remove",
			"splitter-click",
		],
		props: {
			horizontal: { type: Boolean },
			pushOtherPanes: { type: Boolean, default: !0 },
			dblClickSplitter: { type: Boolean, default: !0 },
			rtl: { type: Boolean, default: !1 },
			firstSplitter: { type: Boolean },
		},
		provide() {
			return {
				requestUpdate: this.requestUpdate,
				onPaneAdd: this.onPaneAdd,
				onPaneRemove: this.onPaneRemove,
				onPaneClick: this.onPaneClick,
			};
		},
		data: () => ({
			container: undefined,
			ready: !1,
			panes: [],
			touch: { mouseDown: !1, dragging: !1, activeSplitter: undefined },
			splitterTaps: { splitter: undefined, timeoutId: undefined },
		}),
		computed: {
			panesCount() {
				return this.panes.length;
			},
			indexedPanes() {
				return this.panes.reduce((e, t) => (e[t.id] = t) && e, {});
			},
		},
		methods: {
			updatePaneComponents() {
				this.panes.forEach((e) => {
					e.update &&
						e.update({
							[this.horizontal ? "height" : "width"]:
								`${this.indexedPanes[e.id].size}%`,
						});
				});
			},
			bindEvents() {
				document.addEventListener("mousemove", this.onMouseMove, {
					passive: !1,
				}),
					document.addEventListener("mouseup", this.onMouseUp),
					"ontouchstart" in window &&
						(document.addEventListener("touchmove", this.onMouseMove, {
							passive: !1,
						}),
						document.addEventListener("touchend", this.onMouseUp));
			},
			unbindEvents() {
				document.removeEventListener("mousemove", this.onMouseMove, {
					passive: !1,
				}),
					document.removeEventListener("mouseup", this.onMouseUp),
					"ontouchstart" in window &&
						(document.removeEventListener("touchmove", this.onMouseMove, {
							passive: !1,
						}),
						document.removeEventListener("touchend", this.onMouseUp));
			},
			onMouseDown(e, t) {
				this.bindEvents(),
					(this.touch.mouseDown = !0),
					(this.touch.activeSplitter = t);
			},
			onMouseMove(e) {
				this.touch.mouseDown &&
					(e.preventDefault(),
					(this.touch.dragging = !0),
					this.calculatePanesSize(this.getCurrentMouseDrag(e)),
					this.$emit(
						"resize",
						this.panes.map((t) => ({ min: t.min, max: t.max, size: t.size })),
					));
			},
			onMouseUp() {
				this.touch.dragging &&
					this.$emit(
						"resized",
						this.panes.map((e) => ({ min: e.min, max: e.max, size: e.size })),
					),
					(this.touch.mouseDown = !1),
					setTimeout(() => {
						(this.touch.dragging = !1), this.unbindEvents();
					}, 100);
			},
			onSplitterClick(e, t) {
				"ontouchstart" in window &&
					(e.preventDefault(),
					this.dblClickSplitter &&
						(this.splitterTaps.splitter === t
							? (clearTimeout(this.splitterTaps.timeoutId),
								(this.splitterTaps.timeoutId = undefined),
								this.onSplitterDblClick(e, t),
								(this.splitterTaps.splitter = undefined))
							: ((this.splitterTaps.splitter = t),
								(this.splitterTaps.timeoutId = setTimeout(() => {
									this.splitterTaps.splitter = undefined;
								}, 500))))),
					this.touch.dragging || this.$emit("splitter-click", this.panes[t]);
			},
			onSplitterDblClick(e, t) {
				let r = 0;
				(this.panes = this.panes.map(
					(o, s) => (
						(o.size = s === t ? o.max : o.min), s !== t && (r += o.min), o
					),
				)),
					(this.panes[t].size -= r),
					this.$emit("pane-maximize", this.panes[t]),
					this.$emit(
						"resized",
						this.panes.map((o) => ({ min: o.min, max: o.max, size: o.size })),
					);
			},
			onPaneClick(e, t) {
				this.$emit("pane-click", this.indexedPanes[t]);
			},
			getCurrentMouseDrag(e) {
				const t = this.container.getBoundingClientRect(),
					{ clientX: r, clientY: o } =
						"ontouchstart" in window && e.touches ? e.touches[0] : e;
				return { x: r - t.left, y: o - t.top };
			},
			getCurrentDragPercentage(e) {
				e = e[this.horizontal ? "y" : "x"];
				const t =
					this.container[this.horizontal ? "clientHeight" : "clientWidth"];
				return this.rtl && !this.horizontal && (e = t - e), (e * 100) / t;
			},
			calculatePanesSize(e) {
				const t = this.touch.activeSplitter;
				let r = {
					prevPanesSize: this.sumPrevPanesSize(t),
					nextPanesSize: this.sumNextPanesSize(t),
					prevReachedMinPanes: 0,
					nextReachedMinPanes: 0,
				};
				const o = 0 + (this.pushOtherPanes ? 0 : r.prevPanesSize),
					s = 100 - (this.pushOtherPanes ? 0 : r.nextPanesSize),
					c = Math.max(Math.min(this.getCurrentDragPercentage(e), s), o);
				let f = [t, t + 1],
					d = this.panes[f[0]] || undefined,
					h = this.panes[f[1]] || undefined;
				const p = d.max < 100 && c >= d.max + r.prevPanesSize,
					v = h.max < 100 && c <= 100 - (h.max + this.sumNextPanesSize(t + 1));
				if (p || v) {
					p
						? ((d.size = d.max),
							(h.size = Math.max(
								100 - d.max - r.prevPanesSize - r.nextPanesSize,
								0,
							)))
						: ((d.size = Math.max(
								100 - h.max - r.prevPanesSize - this.sumNextPanesSize(t + 1),
								0,
							)),
							(h.size = h.max));
					return;
				}
				if (this.pushOtherPanes) {
					const m = this.doPushOtherPanes(r, c);
					if (!m) {
						return;
					}
					({ sums: r, panesToResize: f } = m),
						(d = this.panes[f[0]] || undefined),
						(h = this.panes[f[1]] || undefined);
				}
				d !== null &&
					(d.size = Math.min(
						Math.max(c - r.prevPanesSize - r.prevReachedMinPanes, d.min),
						d.max,
					)),
					h !== null &&
						(h.size = Math.min(
							Math.max(
								100 - c - r.nextPanesSize - r.nextReachedMinPanes,
								h.min,
							),
							h.max,
						));
			},
			doPushOtherPanes(e, t) {
				const r = this.touch.activeSplitter,
					o = [r, r + 1];
				return t < e.prevPanesSize + this.panes[o[0]].min &&
					((o[0] = this.findPrevExpandedPane(r).index),
					(e.prevReachedMinPanes = 0),
					o[0] < r &&
						this.panes.forEach((s, c) => {
							c > o[0] &&
								c <= r &&
								((s.size = s.min), (e.prevReachedMinPanes += s.min));
						}),
					(e.prevPanesSize = this.sumPrevPanesSize(o[0])),
					o[0] === void 0)
					? ((e.prevReachedMinPanes = 0),
						(this.panes[0].size = this.panes[0].min),
						this.panes.forEach((s, c) => {
							c > 0 &&
								c <= r &&
								((s.size = s.min), (e.prevReachedMinPanes += s.min));
						}),
						(this.panes[o[1]].size =
							100 -
							e.prevReachedMinPanes -
							this.panes[0].min -
							e.prevPanesSize -
							e.nextPanesSize),
						undefined)
					: (t > 100 - e.nextPanesSize - this.panes[o[1]].min &&
							((o[1] = this.findNextExpandedPane(r).index),
							(e.nextReachedMinPanes = 0),
							o[1] > r + 1 &&
								this.panes.forEach((s, c) => {
									c > r &&
										c < o[1] &&
										((s.size = s.min), (e.nextReachedMinPanes += s.min));
								}),
							(e.nextPanesSize = this.sumNextPanesSize(o[1] - 1)),
							o[1] === void 0)
						? ((e.nextReachedMinPanes = 0),
							(this.panes[this.panesCount - 1].size =
								this.panes[this.panesCount - 1].min),
							this.panes.forEach((s, c) => {
								c < this.panesCount - 1 &&
									c >= r + 1 &&
									((s.size = s.min), (e.nextReachedMinPanes += s.min));
							}),
							(this.panes[o[0]].size =
								100 -
								e.prevPanesSize -
								e.nextReachedMinPanes -
								this.panes[this.panesCount - 1].min -
								e.nextPanesSize),
							null)
						: { sums: e, panesToResize: o });
			},
			sumPrevPanesSize(e) {
				return this.panes.reduce((t, r, o) => t + (o < e ? r.size : 0), 0);
			},
			sumNextPanesSize(e) {
				return this.panes.reduce((t, r, o) => t + (o > e + 1 ? r.size : 0), 0);
			},
			findPrevExpandedPane(e) {
				return (
					[...this.panes]
						.reverse()
						.find((t) => t.index < e && t.size > t.min) || {}
				);
			},
			findNextExpandedPane(e) {
				return this.panes.find((t) => t.index > e + 1 && t.size > t.min) || {};
			},
			checkSplitpanesNodes() {
				[...this.container.children].forEach((e) => {
					const t = e.classList.contains("splitpanes__pane"),
						r = e.classList.contains("splitpanes__splitter");
					!(t || r) &&
						(e.parentNode.removeChild(e),
						console.warn(
							"Splitpanes: Only <pane> elements are allowed at the root of <splitpanes>. One of your DOM nodes was removed.",
						));
				});
			},
			addSplitter(e, t, r = !1) {
				const o = e - 1,
					s = document.createElement("div");
				s.classList.add("splitpanes__splitter"),
					r ||
						((s.onmousedown = (c) => this.onMouseDown(c, o)),
						typeof window < "u" &&
							"ontouchstart" in window &&
							(s.ontouchstart = (c) => this.onMouseDown(c, o)),
						(s.onclick = (c) => this.onSplitterClick(c, o + 1))),
					this.dblClickSplitter &&
						(s.ondblclick = (c) => this.onSplitterDblClick(c, o + 1)),
					t.parentNode.insertBefore(s, t);
			},
			removeSplitter(e) {
				(e.onmousedown = void 0),
					(e.onclick = void 0),
					(e.ondblclick = void 0),
					e.parentNode.removeChild(e);
			},
			redoSplitters() {
				const e = [...this.container.children];
				e.forEach((r) => {
					r.className.includes("splitpanes__splitter") &&
						this.removeSplitter(r);
				});
				let t = 0;
				e.forEach((r) => {
					r.className.includes("splitpanes__pane") &&
						(!t && this.firstSplitter
							? this.addSplitter(t, r, !0)
							: t && this.addSplitter(t, r),
						t++);
				});
			},
			requestUpdate({ target: e, ...t }) {
				const r = this.indexedPanes[e._.uid];
				Object.entries(t).forEach(([o, s]) => (r[o] = s));
			},
			onPaneAdd(e) {
				let t = -1;
				[...e.$el.parentNode.children].some(
					(s) => (s.className.includes("splitpanes__pane") && t++, s === e.$el),
				);
				const r = Number.parseFloat(e.minSize),
					o = Number.parseFloat(e.maxSize);
				this.panes.splice(t, 0, {
					id: e._.uid,
					index: t,
					min: isNaN(r) ? 0 : r,
					max: isNaN(o) ? 100 : o,
					size: e.size === null ? undefined : Number.parseFloat(e.size),
					givenSize: e.size,
					update: e.update,
				}),
					this.panes.forEach((s, c) => (s.index = c)),
					this.ready &&
						this.$nextTick(() => {
							this.redoSplitters(),
								this.resetPaneSizes({ addedPane: this.panes[t] }),
								this.$emit("pane-add", {
									index: t,
									panes: this.panes.map((s) => ({
										min: s.min,
										max: s.max,
										size: s.size,
									})),
								});
						});
			},
			onPaneRemove(e) {
				const t = this.panes.findIndex((o) => o.id === e._.uid),
					r = this.panes.splice(t, 1)[0];
				this.panes.forEach((o, s) => (o.index = s)),
					this.$nextTick(() => {
						this.redoSplitters(),
							this.resetPaneSizes({ removedPane: { ...r, index: t } }),
							this.$emit("pane-remove", {
								removed: r,
								panes: this.panes.map((o) => ({
									min: o.min,
									max: o.max,
									size: o.size,
								})),
							});
					});
			},
			resetPaneSizes(e = {}) {
				e.addedPane || e.removedPane
					? (this.panes.some((t) => t.givenSize !== null || t.min || t.max < 100)
						? this.equalizeAfterAddOrRemove(e)
						: this.equalize())
					: this.initialPanesSizing(),
					this.ready &&
						this.$emit(
							"resized",
							this.panes.map((t) => ({ min: t.min, max: t.max, size: t.size })),
						);
			},
			equalize() {
				const e = 100 / this.panesCount;
				let t = 0;
				const r = [],
					o = [];
				this.panes.forEach((s) => {
					(s.size = Math.max(Math.min(e, s.max), s.min)),
						(t -= s.size),
						s.size >= s.max && r.push(s.id),
						s.size <= s.min && o.push(s.id);
				}),
					t > 0.1 && this.readjustSizes(t, r, o);
			},
			initialPanesSizing() {
				let e = 100;
				const t = [],
					r = [];
				let o = 0;
				this.panes.forEach((c) => {
					(e -= c.size),
						c.size !== null && o++,
						c.size >= c.max && t.push(c.id),
						c.size <= c.min && r.push(c.id);
				});
				let s = 100;
				e > 0.1 &&
					(this.panes.forEach((c) => {
						c.size === null &&
							(c.size = Math.max(
								Math.min(e / (this.panesCount - o), c.max),
								c.min,
							)),
							(s -= c.size);
					}),
					s > 0.1 && this.readjustSizes(e, t, r));
			},
			equalizeAfterAddOrRemove({ addedPane: e, removedPane: t } = {}) {
				let r = 100 / this.panesCount,
					o = 0;
				const s = [],
					c = [];
				e &&
					e.givenSize !== null &&
					(r = (100 - e.givenSize) / (this.panesCount - 1)),
					this.panes.forEach((f) => {
						(o -= f.size),
							f.size >= f.max && s.push(f.id),
							f.size <= f.min && c.push(f.id);
					}),
					!(Math.abs(o) < 0.1) &&
						(this.panes.forEach((f) => {
							(e && e.givenSize !== null && e.id === f.id) ||
								(f.size = Math.max(Math.min(r, f.max), f.min)),
								(o -= f.size),
								f.size >= f.max && s.push(f.id),
								f.size <= f.min && c.push(f.id);
						}),
						o > 0.1 && this.readjustSizes(o, s, c));
			},
			readjustSizes(e, t, r) {
				let o;
				e > 0
					? (o = e / (this.panesCount - t.length))
					: (o = e / (this.panesCount - r.length)),
					this.panes.forEach((s, c) => {
						if (e > 0 && !t.includes(s.id)) {
							const f = Math.max(Math.min(s.size + o, s.max), s.min),
								d = f - s.size;
							(e -= d), (s.size = f);
						} else if (!r.includes(s.id)) {
							const f = Math.max(Math.min(s.size + o, s.max), s.min),
								d = f - s.size;
							(e -= d), (s.size = f);
						}
						s.update({
							[this.horizontal ? "height" : "width"]:
								`${this.indexedPanes[s.id].size}%`,
						});
					}),
					Math.abs(e) > 0.1 &&
						this.$nextTick(() => {
							this.ready &&
								console.warn(
									"Splitpanes: Could not resize panes correctly due to their constraints.",
								);
						});
			},
		},
		watch: {
			panes: {
				deep: !0,
				immediate: !1,
				handler() {
					this.updatePaneComponents();
				},
			},
			horizontal() {
				this.updatePaneComponents();
			},
			firstSplitter() {
				this.redoSplitters();
			},
			dblClickSplitter(e) {
				[...this.container.querySelectorAll(".splitpanes__splitter")].forEach(
					(t, r) => {
						t.ondblclick = e ? (o) => this.onSplitterDblClick(o, r) : void 0;
					},
				);
			},
		},
		beforeUnmount() {
			this.ready = !1;
		},
		mounted() {
			(this.container = this.$refs.container),
				this.checkSplitpanesNodes(),
				this.redoSplitters(),
				this.resetPaneSizes(),
				this.$emit("ready"),
				(this.ready = !0);
		},
		render() {
			return ya(
				"div",
				{
					ref: "container",
					class: [
						"splitpanes",
						`splitpanes--${this.horizontal ? "horizontal" : "vertical"}`,
						{ "splitpanes--dragging": this.touch.dragging },
					],
				},
				this.$slots.default(),
			);
		},
	},
	o0e = (e, t) => {
		const r = e.__vccOpts || e;
		for (const [o, s] of t) {
			r[o] = s;
		}
		return r;
	},
	s0e = {
		name: "pane",
		inject: ["requestUpdate", "onPaneAdd", "onPaneRemove", "onPaneClick"],
		props: {
			size: { type: [Number, String], default: undefined },
			minSize: { type: [Number, String], default: 0 },
			maxSize: { type: [Number, String], default: 100 },
		},
		data: () => ({ style: {} }),
		mounted() {
			this.onPaneAdd(this);
		},
		beforeUnmount() {
			this.onPaneRemove(this);
		},
		methods: {
			update(e) {
				this.style = e;
			},
		},
		computed: {
			sizeNumber() {
				return this.size || this.size === 0
					? Number.parseFloat(this.size)
					: undefined;
			},
			minSizeNumber() {
				return Number.parseFloat(this.minSize);
			},
			maxSizeNumber() {
				return Number.parseFloat(this.maxSize);
			},
		},
		watch: {
			sizeNumber(e) {
				this.requestUpdate({ target: this, size: e });
			},
			minSizeNumber(e) {
				this.requestUpdate({ target: this, min: e });
			},
			maxSizeNumber(e) {
				this.requestUpdate({ target: this, max: e });
			},
		},
	};
function l0e(e, t, r, o, s, c) {
	return (
		oe(),
		me(
			"div",
			{
				class: "splitpanes__pane",
				onClick: t[0] || (t[0] = (f) => c.onPaneClick(f, e._.uid)),
				style: Jt(e.style),
			},
			[vn(e.$slots, "default")],
			4,
		)
	);
}
const xc = o0e(s0e, [["render", l0e]]),
	a0e = { "h-screen": "", "w-screen": "", overflow: "hidden" },
	c0e = ut({
		__name: "index",
		setup(e) {
			const t = eL(),
				r = uc((m) => {
					p(), h(m);
				}, 0),
				o = uc((m) => {
					m.forEach((b, w) => {
						br.value[w] = b.size;
					}),
						d(m);
				}, 0),
				s = uc((m) => {
					m.forEach((b, w) => {
						Mo.value[w] = b.size;
					}),
						h(m),
						v();
				}, 0),
				c = uc((m) => {
					d(m), p();
				}, 0);
			function f() {
				const m = window.innerWidth,
					b = Math.min(m / 3, 300);
				(br.value[0] = (100 * b) / m),
					(br.value[1] = 100 - br.value[0]),
					d([{ size: br.value[0] }, { size: br.value[1] }]);
			}
			function d(m) {
				(gn.navigation = m[0].size), (gn.details.size = m[1].size);
			}
			function h(m) {
				(gn.details.browser = m[0].size), (gn.details.main = m[1].size);
			}
			function p() {
				const m = document.querySelector("#tester-ui");
				m && (m.style.pointerEvents = "none");
			}
			function v() {
				const m = document.querySelector("#tester-ui");
				m && (m.style.pointerEvents = "");
			}
			return (m, b) => {
				const w = i0e,
					M = t0e,
					C = Gve,
					E = ave,
					L = ive,
					N = Bce,
					P = Nce;
				return (
					oe(),
					me(
						ct,
						undefined,
						[
							Pe(w),
							Y("div", a0e, [
								Pe(
									I(v0),
									{
										class: "pt-4px",
										onResized: I(o),
										onResize: I(c),
										onReady: f,
									},
									{
										default: ot(() => [
											Pe(
												I(xc),
												{ size: I(br)[0] },
												{ default: ot(() => [Pe(M)]), _: 1 },
												8,
												["size"],
											),
											Pe(
												I(xc),
												{ size: I(br)[1] },
												{
													default: ot(() => [
														I(Ro)
															? (oe(),
																rt(
																	I(v0),
																	{
																		id: "details-splitpanes",
																		key: "browser-detail",
																		onResize: I(r),
																		onResized: I(s),
																	},
																	{
																		default: ot(() => [
																			Pe(
																				I(xc),
																				{ size: I(Mo)[0], "min-size": "10" },
																				{
																					default: ot(() => [
																						b[0] ||
																							(Vc(-1),
																							((b[0] = Pe(N)).cacheIndex = 0),
																							Vc(1),
																							b[0]),
																					]),
																					_: 1,
																				},
																				8,
																				["size"],
																			),
																			Pe(
																				I(xc),
																				{ size: I(Mo)[1] },
																				{
																					default: ot(() => [
																						I(t)
																							? (oe(),
																								rt(C, { key: "summary" }))
																							: (I(to)
																								? (oe(),
																									rt(
																										E,
																										{
																											key: "coverage",
																											src: I(km),
																										},
																										null,
																										8,
																										["src"],
																									))
																								: (oe(),
																									rt(L, { key: "details" }))),
																					]),
																					_: 1,
																				},
																				8,
																				["size"],
																			),
																		]),
																		_: 1,
																	},
																	8,
																	["onResize", "onResized"],
																))
															: (oe(),
																rt(
																	tT,
																	{ key: "ui-detail" },
																	{
																		default: ot(() => [
																			I(t)
																				? (oe(), rt(C, { key: "summary" }))
																				: (I(to)
																					? (oe(),
																						rt(
																							E,
																							{ key: "coverage", src: I(km) },
																							null,
																							8,
																							["src"],
																						))
																					: (oe(), rt(L, { key: "details" }))),
																		]),
																		_: 1,
																	},
																)),
													]),
													_: 1,
												},
												8,
												["size"],
											),
										]),
										_: 1,
									},
									8,
									["onResized", "onResize"],
								),
							]),
							Pe(P),
						],
						64,
					)
				);
			};
		},
	}),
	u0e = [{ name: "index", path: "/", component: c0e, props: !0 }]; /*!
 * vue-router v4.4.5
 * (c) 2024 Eduardo San Martin Morote
 * @license MIT
 */

const ps = typeof document < "u";
function R1(e) {
	return (
		typeof e === "object" ||
		"displayName" in e ||
		"props" in e ||
		"__vccOpts" in e
	);
}
function f0e(e) {
	return (
		e.__esModule ||
		e[Symbol.toStringTag] === "Module" ||
		(e.default && R1(e.default))
	);
}
const wt = Object.assign;
function pd(e, t) {
	const r = {};
	for (const o in t) {
		const s = t[o];
		r[o] = Lr(s) ? s.map(e) : e(s);
	}
	return r;
}
const Bl = () => {},
	Lr = Array.isArray,
	D1 = /#/g,
	d0e = /&/g,
	h0e = /\//g,
	p0e = /[=]/g,
	g0e = /\?/g,
	z1 = /\+/g,
	v0e = /%5B/g,
	m0e = /%5D/g,
	I1 = /%5E/g,
	y0e = /%60/g,
	F1 = /%7B/g,
	b0e = /%7C/g,
	H1 = /%7D/g,
	w0e = /%20/g;
function up(e) {
	return encodeURI("" + e)
		.replace(b0e, "|")
		.replace(v0e, "[")
		.replace(m0e, "]");
}
function x0e(e) {
	return up(e).replace(F1, "{").replace(H1, "}").replace(I1, "^");
}
function uh(e) {
	return up(e)
		.replace(z1, "%2B")
		.replace(w0e, "+")
		.replace(D1, "%23")
		.replace(d0e, "%26")
		.replace(y0e, "`")
		.replace(F1, "{")
		.replace(H1, "}")
		.replace(I1, "^");
}
function S0e(e) {
	return uh(e).replace(p0e, "%3D");
}
function _0e(e) {
	return up(e).replace(D1, "%23").replace(g0e, "%3F");
}
function k0e(e) {
	return e == undefined ? "" : _0e(e).replace(h0e, "%2F");
}
function ua(e) {
	try {
		return decodeURIComponent("" + e);
	} catch {}
	return "" + e;
}
const T0e = /\/$/,
	C0e = (e) => e.replace(T0e, "");
function gd(e, t, r = "/") {
	let o,
		s = {},
		c = "",
		f = "";
	const d = t.indexOf("#");
	let h = t.indexOf("?");
	return (
		d < h && d !== -1 && (h = -1),
		h > -1 &&
			((o = t.slice(0, h)),
			(c = t.slice(h + 1, d !== -1 ? d : t.length)),
			(s = e(c))),
		d !== -1 && ((o = o || t.slice(0, d)), (f = t.slice(d))),
		(o = M0e(o ?? t, r)),
		{ fullPath: o + (c && "?") + c + f, path: o, query: s, hash: ua(f) }
	);
}
function E0e(e, t) {
	const r = t.query ? e(t.query) : "";
	return t.path + (r && "?") + r + (t.hash || "");
}
function m0(e, t) {
	return t && e.toLowerCase().startsWith(t.toLowerCase())
		? e.slice(t.length) || "/"
		: e;
}
function L0e(e, t, r) {
	const o = t.matched.length - 1,
		s = r.matched.length - 1;
	return (
		o > -1 &&
		o === s &&
		Hs(t.matched[o], r.matched[s]) &&
		q1(t.params, r.params) &&
		e(t.query) === e(r.query) &&
		t.hash === r.hash
	);
}
function Hs(e, t) {
	return (e.aliasOf || e) === (t.aliasOf || t);
}
function q1(e, t) {
	if (Object.keys(e).length !== Object.keys(t).length) {
		return !1;
	}
	for (const r in e) {
		if (!A0e(e[r], t[r])) {return !1;}
	}
	return !0;
}
function A0e(e, t) {
	return Lr(e) ? y0(e, t) : (Lr(t) ? y0(t, e) : e === t);
}
function y0(e, t) {
	return Lr(t)
		? e.length === t.length && e.every((r, o) => r === t[o])
		: e.length === 1 && e[0] === t;
}
function M0e(e, t) {
	if (e.startsWith("/")) {
		return e;
	}
	if (!e) {
		return t;
	}
	const r = t.split("/"),
		o = e.split("/"),
		s = o[o.length - 1];
	(s === ".." || s === ".") && o.push("");
	let c = r.length - 1,
		f,
		d;
	for (f = 0; f < o.length; f++) {
		if (((d = o[f]), d !== ".")) {
			if (d === "..") {
				c > 1 && c--;
			} else {
				break;
			}
		}
	}
	return r.slice(0, c).join("/") + "/" + o.slice(f).join("/");
}
const zi = {
	path: "/",
	name: void 0,
	params: {},
	query: {},
	hash: "",
	fullPath: "/",
	matched: [],
	meta: {},
	redirectedFrom: void 0,
};
let fa;
((e) => {
	(e.pop = "pop"), (e.push = "push");
})(fa || (fa = {}));
let Wl;
((e) => {
	(e.back = "back"), (e.forward = "forward"), (e.unknown = "");
})(Wl || (Wl = {}));
function N0e(e) {
	if (!e) {
		if (ps) {
			const t = document.querySelector("base");
			(e = (t && t.getAttribute("href")) || "/"),
				(e = e.replace(/^\w+:\/\/[^/]+/, ""));
		} else {
			e = "/";
		}
	}
	return e[0] !== "/" && e[0] !== "#" && (e = "/" + e), C0e(e);
}
const $0e = /^[^#]+#/;
function P0e(e, t) {
	return e.replace($0e, "#") + t;
}
function O0e(e, t) {
	const r = document.documentElement.getBoundingClientRect(),
		o = e.getBoundingClientRect();
	return {
		behavior: t.behavior,
		left: o.left - r.left - (t.left || 0),
		top: o.top - r.top - (t.top || 0),
	};
}
const Gu = () => ({ left: window.scrollX, top: window.scrollY });
function R0e(e) {
	let t;
	if ("el" in e) {
		const r = e.el,
			o = typeof r === "string" && r.startsWith("#"),
			s =
				typeof r === "string"
					? (o
						? document.getElementById(r.slice(1))
						: document.querySelector(r))
					: r;
		if (!s) {
			return;
		}
		t = O0e(s, e);
	} else {
		t = e;
	}
	"scrollBehavior" in document.documentElement.style
		? window.scrollTo(t)
		: window.scrollTo(
				t.left != undefined ? t.left : window.scrollX,
				t.top != undefined ? t.top : window.scrollY,
			);
}
function b0(e, t) {
	return (history.state ? history.state.position - t : -1) + e;
}
const fh = new Map();
function D0e(e, t) {
	fh.set(e, t);
}
function z0e(e) {
	const t = fh.get(e);
	return fh.delete(e), t;
}
const I0e = () => location.protocol + "//" + location.host;
function B1(e, t) {
	const { pathname: r, search: o, hash: s } = t,
		c = e.indexOf("#");
	if (c !== -1) {
		let d = s.includes(e.slice(c)) ? e.slice(c).length : 1,
			h = s.slice(d);
		return h[0] !== "/" && (h = "/" + h), m0(h, "");
	}
	return m0(r, e) + o + s;
}
function F0e(e, t, r, o) {
	let s = [],
		c = [],
		f;
	const d = ({ state: b }) => {
		const w = B1(e, location),
			M = r.value,
			C = t.value;
		let E = 0;
		if (b) {
			if (((r.value = w), (t.value = b), f && f === M)) {
				f = undefined;
				return;
			}
			E = C ? b.position - C.position : 0;
		} else {
			o(w);
		}
		s.forEach((L) => {
			L(r.value, M, {
				delta: E,
				type: fa.pop,
				direction: E ? (E > 0 ? Wl.forward : Wl.back) : Wl.unknown,
			});
		});
	};
	function h() {
		f = r.value;
	}
	function p(b) {
		s.push(b);
		const w = () => {
			const M = s.indexOf(b);
			M !== -1 && s.splice(M, 1);
		};
		return c.push(w), w;
	}
	function v() {
		const { history: b } = window;
		b.state && b.replaceState(wt({}, b.state, { scroll: Gu() }), "");
	}
	function m() {
		for (const b of c) {
			b();
		}
		(c = []),
			window.removeEventListener("popstate", d),
			window.removeEventListener("beforeunload", v);
	}
	return (
		window.addEventListener("popstate", d),
		window.addEventListener("beforeunload", v, { passive: !0 }),
		{ pauseListeners: h, listen: p, destroy: m }
	);
}
function w0(e, t, r, o = !1, s = !1) {
	return {
		back: e,
		current: t,
		forward: r,
		replaced: o,
		position: window.history.length,
		scroll: s ? Gu() : undefined,
	};
}
function H0e(e) {
	const { history: t, location: r } = window,
		o = { value: B1(e, r) },
		s = { value: t.state };
	s.value ||
		c(
			o.value,
			{
				back: undefined,
				current: o.value,
				forward: undefined,
				position: t.length - 1,
				replaced: !0,
				scroll: undefined,
			},
			!0,
		);
	function c(h, p, v) {
		const m = e.indexOf("#"),
			b =
				m !== -1
					? (r.host && document.querySelector("base") ? e : e.slice(m)) + h
					: I0e() + e + h;
		try {
			t[v ? "replaceState" : "pushState"](p, "", b), (s.value = p);
		} catch (error) {
			console.error(error), r[v ? "replace" : "assign"](b);
		}
	}
	function f(h, p) {
		const v = wt({}, t.state, w0(s.value.back, h, s.value.forward, !0), p, {
			position: s.value.position,
		});
		c(h, v, !0), (o.value = h);
	}
	function d(h, p) {
		const v = wt({}, s.value, t.state, { forward: h, scroll: Gu() });
		c(v.current, v, !0);
		const m = wt(
			{},
			w0(o.value, h),
			{ position: v.position + 1 },
			p,
		);
		c(h, m, !1), (o.value = h);
	}
	return { location: o, state: s, push: d, replace: f };
}
function q0e(e) {
	e = N0e(e);
	const t = H0e(e),
		r = F0e(e, t.state, t.location, t.replace);
	function o(c, f = !0) {
		f || r.pauseListeners(), history.go(c);
	}
	const s = wt(
		{ location: "", base: e, go: o, createHref: P0e.bind(undefined, e) },
		t,
		r,
	);
	return (
		Object.defineProperty(s, "location", {
			enumerable: !0,
			get: () => t.location.value,
		}),
		Object.defineProperty(s, "state", {
			enumerable: !0,
			get: () => t.state.value,
		}),
		s
	);
}
function B0e(e) {
	return (
		(e = location.host ? e || location.pathname + location.search : ""),
		e.includes("#") || (e += "#"),
		q0e(e)
	);
}
function W0e(e) {
	return typeof e === "string" || (e && typeof e === "object");
}
function W1(e) {
	return typeof e === "string" || typeof e === "symbol";
}
const U1 = Symbol("");
let x0;
((e) => {
	(e[(e.aborted = 4)] = "aborted"),
		(e[(e.cancelled = 8)] = "cancelled"),
		(e[(e.duplicated = 16)] = "duplicated");
})(x0 || (x0 = {}));
function qs(e, t) {
	return wt(new Error(), { type: e, [U1]: !0 }, t);
}
function si(e, t) {
	return e instanceof Error && U1 in e && (t == undefined || !!(e.type & t));
}
const S0 = "[^/]+?",
	U0e = { sensitive: !1, strict: !1, start: !0, end: !0 },
	V0e = /[.+*?^${}()[\]/\\]/g;
function j0e(e, t) {
	const r = wt({}, U0e, t),
		o = [];
	let s = r.start ? "^" : "";
	const c = [];
	for (const p of e) {
		const v = p.length > 0 ? [] : [90];
		r.strict && p.length === 0 && (s += "/");
		for (let m = 0; m < p.length; m++) {
			const b = p[m];
			let w = 40 + (r.sensitive ? 0.25 : 0);
			if (b.type === 0) {
				m || (s += "/"), (s += b.value.replace(V0e, String.raw`\$&`)), (w += 40);
			} else if (b.type === 1) {
				const { value: M, repeatable: C, optional: E, regexp: L } = b;
				c.push({ name: M, repeatable: C, optional: E });
				const N = L || S0;
				if (N !== S0) {
					w += 10;
					try {
						new RegExp(`(${N})`);
					} catch (error) {
						throw new Error(
							`Invalid custom RegExp for param "${M}" (${N}): ` + error.message,
						);
					}
				}
				let P = C ? `((?:${N})(?:/(?:${N}))*)` : `(${N})`;
				m || (P = E && p.length < 2 ? `(?:/${P})` : "/" + P),
					E && (P += "?"),
					(s += P),
					(w += 20),
					E && (w += -8),
					C && (w += -20),
					N === ".*" && (w += -50);
			}
			v.push(w);
		}
		o.push(v);
	}
	if (r.strict && r.end) {
		const p = o.length - 1;
		o[p][o[p].length - 1] += 0.700_000_000_000_000_1;
	}
	r.strict || (s += "/?"), r.end ? (s += "$") : r.strict && (s += "(?:/|$)");
	const f = new RegExp(s, r.sensitive ? "" : "i");
	function d(p) {
		const v = p.match(f),
			m = {};
		if (!v) {
			return ;
		}
		for (let b = 1; b < v.length; b++) {
			const w = v[b] || "",
				M = c[b - 1];
			m[M.name] = w && M.repeatable ? w.split("/") : w;
		}
		return m;
	}
	function h(p) {
		let v = "",
			m = !1;
		for (const b of e) {
			!(m && v.endsWith("/")) && (v += "/"), (m = !1);
			for (const w of b) {
				if (w.type === 0) {
					v += w.value;
				} else if (w.type === 1) {
					const { value: M, repeatable: C, optional: E } = w,
						L = M in p ? p[M] : "";
					if (Lr(L) && !C) {
						throw new Error(
							`Provided param "${M}" is an array but it is not repeatable (* or + modifiers)`,
						);
					}
					const N = Lr(L) ? L.join("/") : L;
					if (!N) {
						if (E) {
							b.length < 2 &&
								(v.endsWith("/") ? (v = v.slice(0, -1)) : (m = !0));
						} else {
							throw new Error(`Missing required param "${M}"`);
						}
					}
					v += N;
				}
			}
		}
		return v || "/";
	}
	return { re: f, score: o, keys: c, parse: d, stringify: h };
}
function G0e(e, t) {
	let r = 0;
	while (r < e.length && r < t.length) {
		const o = t[r] - e[r];
		if (o) {
			return o;
		}
		r++;
	}
	return e.length < t.length
		? (e.length === 1 && e[0] === 80
			? -1
			: 1)
		: e.length > t.length
			? t.length === 1 && t[0] === 80
				? 1
				: -1
			: 0;
}
function V1(e, t) {
	let r = 0;
	const o = e.score,
		s = t.score;
	while (r < o.length && r < s.length) {
		const c = G0e(o[r], s[r]);
		if (c) {
			return c;
		}
		r++;
	}
	if (Math.abs(s.length - o.length) === 1) {
		if (_0(o)) {
			return 1;
		}
		if (_0(s)) {
			return -1;
		}
	}
	return s.length - o.length;
}
function _0(e) {
	const t = e[e.length - 1];
	return e.length > 0 && t[t.length - 1] < 0;
}
const K0e = { type: 0, value: "" },
	X0e = /[a-zA-Z0-9_]/;
function Y0e(e) {
	if (!e) {
		return [[]];
	}
	if (e === "/") {
		return [[K0e]];
	}
	if (!e.startsWith("/")) {
		throw new Error(`Invalid path "${e}"`);
	}
	function t(w) {
		throw new Error(`ERR (${r})/"${p}": ${w}`);
	}
	let r = 0,
		o = r;
	const s = [];
	let c;
	function f() {
		c && s.push(c), (c = []);
	}
	let d = 0,
		h,
		p = "",
		v = "";
	function m() {
		p &&
			(r === 0
				? c.push({ type: 0, value: p })
				: (r === 1 || r === 2 || r === 3
					? (c.length > 1 &&
							(h === "*" || h === "+") &&
							t(
								`A repeatable param (${p}) must be alone in its segment. eg: '/:ids+.`,
							),
						c.push({
							type: 1,
							value: p,
							regexp: v,
							repeatable: h === "*" || h === "+",
							optional: h === "*" || h === "?",
						}))
					: t("Invalid state to consume buffer")),
			(p = ""));
	}
	function b() {
		p += h;
	}
	while (d < e.length) {
		if (((h = e[d++]), h === "\\" && r !== 2)) {
			(o = r), (r = 4);
			continue;
		}
		switch (r) {
			case 0: {
				h === "/" ? (p && m(), f()) : (h === ":" ? (m(), (r = 1)) : b());
				break;
			}
			case 4: {
				b(), (r = o);
				break;
			}
			case 1: {
				h === "("
					? (r = 2)
					: (X0e.test(h)
						? b()
						: (m(), (r = 0), h !== "*" && h !== "?" && h !== "+" && d--));
				break;
			}
			case 2: {
				h === ")"
					? (v[v.length - 1] == "\\"
						? (v = v.slice(0, -1) + h)
						: (r = 3))
					: (v += h);
				break;
			}
			case 3: {
				m(), (r = 0), h !== "*" && h !== "?" && h !== "+" && d--, (v = "");
				break;
			}
			default: {
				t("Unknown state");
				break;
			}
		}
	}
	return r === 2 && t(`Unfinished custom RegExp for param "${p}"`), m(), f(), s;
}
function Z0e(e, t, r) {
	const o = j0e(Y0e(e.path), r),
		s = wt(o, { record: e, parent: t, children: [], alias: [] });
	return t && !s.record.aliasOf == !t.record.aliasOf && t.children.push(s), s;
}
function J0e(e, t) {
	const r = [],
		o = new Map();
	t = E0({ strict: !1, end: !0, sensitive: !1 }, t);
	function s(m) {
		return o.get(m);
	}
	function c(m, b, w) {
		const M = !w,
			C = T0(m);
		C.aliasOf = w && w.record;
		const E = E0(t, m),
			L = [C];
		if ("alias" in m) {
			const A = typeof m.alias === "string" ? [m.alias] : m.alias;
			for (const z of A) {
				L.push(
					T0(
						wt({}, C, {
							components: w ? w.record.components : C.components,
							path: z,
							aliasOf: w ? w.record : C,
						}),
					),
				);
			}
		}
		let N, P;
		for (const A of L) {
			const { path: z } = A;
			if (b && z[0] !== "/") {
				const W = b.record.path,
					U = W[W.length - 1] === "/" ? "" : "/";
				A.path = b.record.path + (z && U + z);
			}
			if (
				((N = Z0e(A, b, E)),
				w
					? w.alias.push(N)
					: ((P = P || N),
						P !== N && P.alias.push(N),
						M && m.name && !C0(N) && f(m.name)),
				j1(N) && h(N),
				C.children)
			) {
				const W = C.children;
				for (let U = 0; U < W.length; U++) {
					c(W[U], N, w && w.children[U]);
				}
			}
			w = w || N;
		}
		return P
			? () => {
					f(P);
				}
			: Bl;
	}
	function f(m) {
		if (W1(m)) {
			const b = o.get(m);
			b &&
				(o.delete(m),
				r.splice(r.indexOf(b), 1),
				b.children.forEach(f),
				b.alias.forEach(f));
		} else {
			const b = r.indexOf(m);
			b !== -1 &&
				(r.splice(b, 1),
				m.record.name && o.delete(m.record.name),
				m.children.forEach(f),
				m.alias.forEach(f));
		}
	}
	function d() {
		return r;
	}
	function h(m) {
		const b = tye(m, r);
		r.splice(b, 0, m), m.record.name && !C0(m) && o.set(m.record.name, m);
	}
	function p(m, b) {
		let w,
			M = {},
			C,
			E;
		if ("name" in m && m.name) {
			if (((w = o.get(m.name)), !w)) {
				throw qs(1, { location: m });
			}
			(E = w.record.name),
				(M = wt(
					k0(
						b.params,
						w.keys
							.filter((P) => !P.optional)
							.concat(w.parent ? w.parent.keys.filter((P) => P.optional) : [])
							.map((P) => P.name),
					),
					m.params &&
						k0(
							m.params,
							w.keys.map((P) => P.name),
						),
				)),
				(C = w.stringify(M));
		} else if (m.path != undefined) {
			(C = m.path),
				(w = r.find((P) => P.re.test(C))),
				w && ((M = w.parse(C)), (E = w.record.name));
		} else {
			if (
				((w = b.name ? o.get(b.name) : r.find((P) => P.re.test(b.path))), !w)
			) {
				throw qs(1, { location: m, currentLocation: b });
			}
			(E = w.record.name),
				(M = wt({}, b.params, m.params)),
				(C = w.stringify(M));
		}
		const L = [];
		let N = w;
		while (N) {
			L.unshift(N.record), (N = N.parent);
		}
		return { name: E, path: C, params: M, matched: L, meta: eye(L) };
	}
	e.forEach((m) => c(m));
	function v() {
		(r.length = 0), o.clear();
	}
	return {
		addRoute: c,
		resolve: p,
		removeRoute: f,
		clearRoutes: v,
		getRoutes: d,
		getRecordMatcher: s,
	};
}
function k0(e, t) {
	const r = {};
	for (const o of t) {
		o in e && (r[o] = e[o]);
	}
	return r;
}
function T0(e) {
	const t = {
		path: e.path,
		redirect: e.redirect,
		name: e.name,
		meta: e.meta || {},
		aliasOf: e.aliasOf,
		beforeEnter: e.beforeEnter,
		props: Q0e(e),
		children: e.children || [],
		instances: {},
		leaveGuards: new Set(),
		updateGuards: new Set(),
		enterCallbacks: {},
		components:
			"components" in e
				? e.components || undefined
				: e.component && { default: e.component },
	};
	return Object.defineProperty(t, "mods", { value: {} }), t;
}
function Q0e(e) {
	const t = {},
		r = e.props || !1;
	if ("component" in e) {
		t.default = r;
	} else {
		for (const o in e.components) {t[o] = typeof r == "object" ? r[o] : r;}
	}
	return t;
}
function C0(e) {
	while (e) {
		if (e.record.aliasOf) {
			return !0;
		}
		e = e.parent;
	}
	return !1;
}
function eye(e) {
	return e.reduce((t, r) => wt(t, r.meta), {});
}
function E0(e, t) {
	const r = {};
	for (const o in e) {
		r[o] = o in t ? t[o] : e[o];
	}
	return r;
}
function tye(e, t) {
	let r = 0,
		o = t.length;
	while (r !== o) {
		const c = (r + o) >> 1;
		V1(e, t[c]) < 0 ? (o = c) : (r = c + 1);
	}
	const s = nye(e);
	return s && (o = t.lastIndexOf(s, o - 1)), o;
}
function nye(e) {
	let t = e;
	while ((t = t.parent)) {
		if (j1(t) && V1(e, t) === 0) {return t;}
	}
}
function j1({ record: e }) {
	return !!(
		e.name ||
		(e.components && Object.keys(e.components).length > 0) ||
		e.redirect
	);
}
function rye(e) {
	const t = {};
	if (e === "" || e === "?") {
		return t;
	}
	const o = (e[0] === "?" ? e.slice(1) : e).split("&");
	for (let s = 0; s < o.length; ++s) {
		const c = o[s].replace(z1, " "),
			f = c.indexOf("="),
			d = ua(f === -1 ? c : c.slice(0, f)),
			h = f === -1 ? undefined : ua(c.slice(f + 1));
		if (d in t) {
			let p = t[d];
			Lr(p) || (p = t[d] = [p]), p.push(h);
		} else {
			t[d] = h;
		}
	}
	return t;
}
function L0(e) {
	let t = "";
	for (let r in e) {
		const o = e[r];
		if (((r = S0e(r)), o == undefined)) {
			o !== void 0 && (t += (t.length > 0 ? "&" : "") + r);
			continue;
		}
		(Lr(o) ? o.map((c) => c && uh(c)) : [o && uh(o)]).forEach((c) => {
			c !== void 0 &&
				((t += (t.length > 0 ? "&" : "") + r),
				c != undefined && (t += "=" + c));
		});
	}
	return t;
}
function iye(e) {
	const t = {};
	for (const r in e) {
		const o = e[r];
		o !== void 0 &&
			(t[r] = Lr(o)
				? o.map((s) => (s == undefined ? undefined : "" + s))
				: (o == null
					? o
					: "" + o));
	}
	return t;
}
const oye = Symbol(""),
	A0 = Symbol(""),
	fp = Symbol(""),
	G1 = Symbol(""),
	dh = Symbol("");
function El() {
	let e = [];
	function t(o) {
		return (
			e.push(o),
			() => {
				const s = e.indexOf(o);
				s !== -1 && e.splice(s, 1);
			}
		);
	}
	function r() {
		e = [];
	}
	return { add: t, list: () => [...e], reset: r };
}
function Vi(e, t, r, o, s, c = (f) => f()) {
	const f = o && (o.enterCallbacks[s] = o.enterCallbacks[s] || []);
	return () =>
		new Promise((d, h) => {
			const p = (b) => {
					b === !1
						? h(qs(4, { from: r, to: t }))
						: b instanceof Error
							? h(b)
							: W0e(b)
								? h(qs(2, { from: t, to: b }))
								: (f &&
										o.enterCallbacks[s] === f &&
										typeof b === "function" &&
										f.push(b),
									d());
				},
				v = c(() => e.call(o && o.instances[s], t, r, p));
			let m = Promise.resolve(v);
			e.length < 3 && (m = m.then(p)), m.catch((error) => h(error));
		});
}
function vd(e, t, r, o, s = (c) => c()) {
	const c = [];
	for (const f of e) {
		for (const d in f.components) {
			const h = f.components[d];
			if (!(t !== "beforeRouteEnter" && !f.instances[d])) {
				if (R1(h)) {
					const v = (h.__vccOpts || h)[t];
					v && c.push(Vi(v, r, o, f, d, s));
				} else {
					const p = h();
					c.push(() =>
						p.then((v) => {
							if (!v) {
								throw new Error(
									`Couldn't resolve component "${d}" at "${f.path}"`,
								);
							}
							const m = f0e(v) ? v.default : v;
							(f.mods[d] = v), (f.components[d] = m);
							const w = (m.__vccOpts || m)[t];
							return w && Vi(w, r, o, f, d, s)();
						}),
					);
				}
			}
		}
	}
	return c;
}
function M0(e) {
	const t = di(fp),
		r = di(G1),
		o = Te(() => {
			const h = I(e.to);
			return t.resolve(h);
		}),
		s = Te(() => {
			const { matched: h } = o.value,
				{ length: p } = h,
				v = h[p - 1],
				m = r.matched;
			if (!(v && m.length > 0)) {
				return -1;
			}
			const b = m.findIndex(Hs.bind(undefined, v));
			if (b !== -1) {
				return b;
			}
			const w = N0(h[p - 2]);
			return p > 1 && N0(v) === w && m[m.length - 1].path !== w
				? m.findIndex(Hs.bind(undefined, h[p - 2]))
				: b;
		}),
		c = Te(() => s.value > -1 && cye(r.params, o.value.params)),
		f = Te(
			() =>
				s.value > -1 &&
				s.value === r.matched.length - 1 &&
				q1(r.params, o.value.params),
		);
	function d(h = {}) {
		return aye(h)
			? t[I(e.replace) ? "replace" : "push"](I(e.to)).catch(Bl)
			: Promise.resolve();
	}
	return {
		route: o,
		href: Te(() => o.value.href),
		isActive: c,
		isExactActive: f,
		navigate: d,
	};
}
const sye = ut({
		name: "RouterLink",
		compatConfig: { MODE: 3 },
		props: {
			to: { type: [String, Object], required: !0 },
			replace: Boolean,
			activeClass: String,
			exactActiveClass: String,
			custom: Boolean,
			ariaCurrentValue: { type: String, default: "page" },
		},
		useLink: M0,
		setup(e, { slots: t }) {
			const r = Zn(M0(e)),
				{ options: o } = di(fp),
				s = Te(() => ({
					[$0(e.activeClass, o.linkActiveClass, "router-link-active")]:
						r.isActive,
					[$0(
						e.exactActiveClass,
						o.linkExactActiveClass,
						"router-link-exact-active",
					)]: r.isExactActive,
				}));
			return () => {
				const c = t.default && t.default(r);
				return e.custom
					? c
					: ya(
							"a",
							{
								"aria-current": r.isExactActive
									? e.ariaCurrentValue
									: undefined,
								href: r.href,
								onClick: r.navigate,
								class: s.value,
							},
							c,
						);
			};
		},
	}),
	lye = sye;
function aye(e) {
	if (
		!(
			e.metaKey ||
			e.altKey ||
			e.ctrlKey ||
			e.shiftKey ||
			e.defaultPrevented ||
			(e.button !== void 0 && e.button !== 0)
		)
	) {
		if (e.currentTarget && e.currentTarget.getAttribute) {
			const t = e.currentTarget.getAttribute("target");
			if (/\b_blank\b/i.test(t)) {
				return;
			}
		}
		return e.preventDefault && e.preventDefault(), !0;
	}
}
function cye(e, t) {
	for (const r in t) {
		const o = t[r],
			s = e[r];
		if (typeof o === "string") {
			if (o !== s) {
				return !1;
			}
		} else if (
			!Lr(s) ||
			s.length !== o.length ||
			o.some((c, f) => c !== s[f])
		) {
			return !1;
		}
	}
	return !0;
}
function N0(e) {
	return e ? (e.aliasOf ? e.aliasOf.path : e.path) : "";
}
const $0 = (e, t, r) => e ?? t ?? r,
	uye = ut({
		name: "RouterView",
		inheritAttrs: !1,
		props: { name: { type: String, default: "default" }, route: Object },
		compatConfig: { MODE: 3 },
		setup(e, { attrs: t, slots: r }) {
			const o = di(dh),
				s = Te(() => e.route || o.value),
				c = di(A0, 0),
				f = Te(() => {
					let p = I(c);
					const { matched: v } = s.value;
					let m;
					while ((m = v[p]) && !m.components) {
						p++;
					}
					return p;
				}),
				d = Te(() => s.value.matched[f.value]);
			kc(
				A0,
				Te(() => f.value + 1),
			),
				kc(oye, d),
				kc(dh, s);
			const h = We();
			return (
				Bt(
					() => [h.value, d.value, e.name],
					([p, v, m], [b, w, M]) => {
						v &&
							((v.instances[m] = p),
							w &&
								w !== v &&
								p &&
								p === b &&
								(v.leaveGuards.size || (v.leaveGuards = w.leaveGuards),
								v.updateGuards.size || (v.updateGuards = w.updateGuards))),
							p &&
								v &&
								!(w && Hs(v, w) && b) &&
								(v.enterCallbacks[m] || []).forEach((C) => C(p));
					},
					{ flush: "post" },
				),
				() => {
					const p = s.value,
						v = e.name,
						m = d.value,
						b = m && m.components[v];
					if (!b) {
						return P0(r.default, { Component: b, route: p });
					}
					const w = m.props[v],
						M = w
							? w === !0
								? p.params
								: typeof w === "function"
									? w(p)
									: w
							: undefined,
						E = ya(
							b,
							wt({}, M, t, {
								onVnodeUnmounted: (L) => {
									L.component.isUnmounted && (m.instances[v] = undefined);
								},
								ref: h,
							}),
						);
					return P0(r.default, { Component: E, route: p }) || E;
				}
			);
		},
	});
function P0(e, t) {
	if (!e) {
		return ;
	}
	const r = e(t);
	return r.length === 1 ? r[0] : r;
}
const fye = uye;
function dye(e) {
	const t = J0e(e.routes, e),
		r = e.parseQuery || rye,
		o = e.stringifyQuery || L0,
		s = e.history,
		c = El(),
		f = El(),
		d = El(),
		h = jr(zi);
	let p = zi;
	ps &&
		e.scrollBehavior &&
		"scrollRestoration" in history &&
		(history.scrollRestoration = "manual");
	const v = pd.bind(undefined, (X) => "" + X),
		m = pd.bind(undefined, k0e),
		b = pd.bind(undefined, ua);
	function w(X, ae) {
		let de, $e;
		return (
			W1(X) ? ((de = t.getRecordMatcher(X)), ($e = ae)) : ($e = X),
			t.addRoute($e, de)
		);
	}
	function M(X) {
		const ae = t.getRecordMatcher(X);
		ae && t.removeRoute(ae);
	}
	function C() {
		return t.getRoutes().map((X) => X.record);
	}
	function E(X) {
		return !!t.getRecordMatcher(X);
	}
	function L(X, ae) {
		if (((ae = wt({}, ae || h.value)), typeof X === "string")) {
			const H = gd(r, X, ae.path),
				J = t.resolve({ path: H.path }, ae),
				fe = s.createHref(H.fullPath);
			return wt(H, J, {
				params: b(J.params),
				hash: ua(H.hash),
				redirectedFrom: void 0,
				href: fe,
			});
		}
		let de;
		if (X.path != undefined) {
			de = wt({}, X, { path: gd(r, X.path, ae.path).path });
		} else {
			const H = wt({}, X.params);
			for (const J in H) {
				H[J] == undefined && delete H[J];
			}
			(de = wt({}, X, { params: m(H) })), (ae.params = m(ae.params));
		}
		const $e = t.resolve(de, ae),
			Ee = X.hash || "";
		$e.params = v(b($e.params));
		const Ze = E0e(o, wt({}, X, { hash: x0e(Ee), path: $e.path })),
			O = s.createHref(Ze);
		return wt(
			{
				fullPath: Ze,
				hash: Ee,
				query: o === L0 ? iye(X.query) : X.query || {},
			},
			$e,
			{ redirectedFrom: void 0, href: O },
		);
	}
	function N(X) {
		return typeof X === "string" ? gd(r, X, h.value.path) : wt({}, X);
	}
	function P(X, ae) {
		if (p !== X) {
			return qs(8, { from: ae, to: X });
		}
	}
	function A(X) {
		return U(X);
	}
	function z(X) {
		return A(wt(N(X), { replace: !0 }));
	}
	function W(X) {
		const ae = X.matched[X.matched.length - 1];
		if (ae && ae.redirect) {
			const { redirect: de } = ae;
			let $e = typeof de === "function" ? de(X) : de;
			return (
				typeof $e === "string" &&
					(($e =
						$e.includes("?") || $e.includes("#") ? ($e = N($e)) : { path: $e }),
					($e.params = {})),
				wt(
					{
						query: X.query,
						hash: X.hash,
						params: $e.path != undefined ? {} : X.params,
					},
					$e,
				)
			);
		}
	}
	function U(X, ae) {
		const de = (p = L(X)),
			$e = h.value,
			Ee = X.state,
			Ze = X.force,
			O = X.replace === !0,
			H = W(de);
		if (H) {
			return U(
				wt(N(H), {
					state: typeof H === "object" ? wt({}, Ee, H.state) : Ee,
					force: Ze,
					replace: O,
				}),
				ae || de,
			);
		}
		const J = de;
		J.redirectedFrom = ae;
		let fe;
		return (
			!Ze &&
				L0e(o, $e, de) &&
				((fe = qs(16, { to: J, from: $e })), Ue($e, $e, !0, !1)),
			(fe ? Promise.resolve(fe) : G(J, $e))
				.catch((error) =>
					si(error) ? (si(error, 2) ? error : Ne(error)) : ie(error, J, $e),
				)
				.then((le) => {
					if (le) {
						if (si(le, 2)) {
							return U(
								wt({ replace: O }, N(le.to), {
									state:
										typeof le.to === "object" ? wt({}, Ee, le.to.state) : Ee,
									force: Ze,
								}),
								ae || J,
							);
						}
					} else {
						le = Z(J, $e, !0, O, Ee);
					}
					return te(J, $e, le), le;
				})
		);
	}
	function re(X, ae) {
		const de = P(X, ae);
		return de ? Promise.reject(de) : Promise.resolve();
	}
	function Q(X) {
		const ae = tt.values().next().value;
		return ae && typeof ae.runWithContext === "function"
			? ae.runWithContext(X)
			: X();
	}
	function G(X, ae) {
		let de;
		const [$e, Ee, Ze] = hye(X, ae);
		de = vd($e.reverse(), "beforeRouteLeave", X, ae);
		for (const H of $e) {
			H.leaveGuards.forEach((J) => {
				de.push(Vi(J, X, ae));
			});
		}
		const O = re.bind(undefined, X, ae);
		return (
			de.push(O),
			Ae(de)
				.then(() => {
					de = [];
					for (const H of c.list()) {
						de.push(Vi(H, X, ae));
					}
					return de.push(O), Ae(de);
				})
				.then(() => {
					de = vd(Ee, "beforeRouteUpdate", X, ae);
					for (const H of Ee) {
						H.updateGuards.forEach((J) => {
							de.push(Vi(J, X, ae));
						});
					}
					return de.push(O), Ae(de);
				})
				.then(() => {
					de = [];
					for (const H of Ze) {
						if (H.beforeEnter) {
							if (Lr(H.beforeEnter)) {
								for (const J of H.beforeEnter) {
									de.push(Vi(J, X, ae));
								}
							} else {
								de.push(Vi(H.beforeEnter, X, ae));
							}
						}
					}
					return de.push(O), Ae(de);
				})
				.then(
					() => (
						X.matched.forEach((H) => (H.enterCallbacks = {})),
						(de = vd(Ze, "beforeRouteEnter", X, ae, Q)),
						de.push(O),
						Ae(de)
					),
				)
				.then(() => {
					de = [];
					for (const H of f.list()) {
						de.push(Vi(H, X, ae));
					}
					return de.push(O), Ae(de);
				})
				.catch((error) => (si(error, 8) ? error : Promise.reject(error)))
		);
	}
	function te(X, ae, de) {
		d.list().forEach(($e) => Q(() => $e(X, ae, de)));
	}
	function Z(X, ae, de, $e, Ee) {
		const Ze = P(X, ae);
		if (Ze) {
			return Ze;
		}
		const O = ae === zi,
			H = ps ? history.state : {};
		de &&
			($e || O
				? s.replace(X.fullPath, wt({ scroll: O && H && H.scroll }, Ee))
				: s.push(X.fullPath, Ee)),
			(h.value = X),
			Ue(X, ae, de, O),
			Ne();
	}
	let q;
	function F() {
		q ||
			(q = s.listen((X, ae, de) => {
				if (!Je.listening) {
					return;
				}
				const $e = L(X),
					Ee = W($e);
				if (Ee) {
					U(wt(Ee, { replace: !0 }), $e).catch(Bl);
					return;
				}
				p = $e;
				const Ze = h.value;
				ps && D0e(b0(Ze.fullPath, de.delta), Gu()),
					G($e, Ze)
						.catch((error) =>
							si(error, 12)
								? error
								: (si(error, 2)
									? (U(error.to, $e)
											.then((H) => {
												si(H, 20) &&
													!de.delta &&
													de.type === fa.pop &&
													s.go(-1, !1);
											})
											.catch(Bl),
										Promise.reject())
									: (de.delta && s.go(-de.delta, !1), ie(error, $e, Ze))),
						)
						.then((O) => {
							(O = O || Z($e, Ze, !1)),
								O &&
									(de.delta && !si(O, 8)
										? s.go(-de.delta, !1)
										: de.type === fa.pop && si(O, 20) && s.go(-1, !1)),
								te($e, Ze, O);
						})
						.catch(Bl);
			}));
	}
	let k = El(),
		B = El(),
		V;
	function ie(X, ae, de) {
		Ne(X);
		const $e = B.list();
		return (
			$e.length > 0 ? $e.forEach((Ee) => Ee(X, ae, de)) : console.error(X),
			Promise.reject(X)
		);
	}
	function ye() {
		return V && h.value !== zi
			? Promise.resolve()
			: new Promise((X, ae) => {
					k.add([X, ae]);
				});
	}
	function Ne(X) {
		return (
			V ||
				((V = !X),
				F(),
				k.list().forEach(([ae, de]) => (X ? de(X) : ae())),
				k.reset()),
			X
		);
	}
	function Ue(X, ae, de, $e) {
		const { scrollBehavior: Ee } = e;
		if (!(ps && Ee)) {
			return Promise.resolve();
		}
		const Ze =
			(!de && z0e(b0(X.fullPath, 0))) ||
			(($e || !de) && history.state && history.state.scroll) ||
			undefined;
		return un()
			.then(() => Ee(X, ae, Ze))
			.then((O) => O && R0e(O))
			.catch((error) => ie(error, X, ae));
	}
	const je = (X) => s.go(X);
	let it;
	const tt = new Set(),
		Je = {
			currentRoute: h,
			listening: !0,
			addRoute: w,
			removeRoute: M,
			clearRoutes: t.clearRoutes,
			hasRoute: E,
			getRoutes: C,
			resolve: L,
			options: e,
			push: A,
			replace: z,
			go: je,
			back: () => je(-1),
			forward: () => je(1),
			beforeEach: c.add,
			beforeResolve: f.add,
			afterEach: d.add,
			onError: B.add,
			isReady: ye,
			install(X) {
				X.component("RouterLink", lye),
					X.component("RouterView", fye),
					(X.config.globalProperties.$router = this),
					Object.defineProperty(X.config.globalProperties, "$route", {
						enumerable: !0,
						get: () => I(h),
					}),
					ps &&
						!it &&
						h.value === zi &&
						((it = !0), A(s.location).catch((error) => {}));
				const de = {};
				for (const Ee in zi) {
					Object.defineProperty(de, Ee, {
						get: () => h.value[Ee],
						enumerable: !0,
					});
				}
				X.provide(fp, this), X.provide(G1, xh(de)), X.provide(dh, h);
				const $e = X.unmount;
				tt.add(X),
					(X.unmount = () => {
						tt.delete(X),
							tt.size === 0 &&
								((p = zi),
								q && q(),
								(q = undefined),
								(h.value = zi),
								(it = !1),
								(V = !1)),
							$e();
					});
			},
		};
	function Ae(X) {
		return X.reduce((ae, de) => ae.then(() => Q(de)), Promise.resolve());
	}
	return Je;
}
function hye(e, t) {
	const r = [],
		o = [],
		s = [],
		c = Math.max(t.matched.length, e.matched.length);
	for (let f = 0; f < c; f++) {
		const d = t.matched[f];
		d && (e.matched.some((p) => Hs(p, d)) ? o.push(d) : r.push(d));
		const h = e.matched[f];
		h && (t.matched.find((p) => Hs(p, h)) || s.push(h));
	}
	return [r, o, s];
}
const pye = { tooltip: NC };
Nb.options.instantMove = !0;
Nb.options.distance = 10;
function gye() {
	return dye({ history: B0e(), routes: u0e });
}
const vye = [gye],
	dp = nb(OT);
vye.forEach((e) => {
	dp.use(e());
});
Object.entries(pye).forEach(([e, t]) => {
	dp.directive(e, t);
});
dp.mount("#app");
