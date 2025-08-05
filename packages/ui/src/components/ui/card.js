"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardContent = exports.CardTitle = exports.CardHeader = exports.Card = void 0;
var React = require("react");
var cn_1 = require("../../utils/cn");
var Card = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, cn_1.cn)("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}/>);
});
exports.Card = Card;
Card.displayName = "Card";
var CardHeader = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, cn_1.cn)("flex flex-col space-y-1.5 p-6", className)} {...props}/>);
});
exports.CardHeader = CardHeader;
CardHeader.displayName = "CardHeader";
var CardTitle = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<h3 ref={ref} className={(0, cn_1.cn)("text-2xl font-semibold leading-none tracking-tight", className)} {...props}/>);
});
exports.CardTitle = CardTitle;
CardTitle.displayName = "CardTitle";
var CardContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={(0, cn_1.cn)("p-6 pt-0", className)} {...props}/>);
});
exports.CardContent = CardContent;
CardContent.displayName = "CardContent";
