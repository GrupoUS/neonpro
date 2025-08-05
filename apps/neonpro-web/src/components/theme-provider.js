"use client";
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProvider = ThemeProvider;
var React = require("react");
var next_themes_1 = require("next-themes");
function ThemeProvider(_a) {
  var children = _a.children,
    props = __rest(_a, ["children"]);
  return (
    <next_themes_1.ThemeProvider {...props} suppressHydrationWarning>
      {children}
    </next_themes_1.ThemeProvider>
  );
}
