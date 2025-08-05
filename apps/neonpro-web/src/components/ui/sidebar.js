"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.SidebarTrigger = exports.SidebarSeparator = exports.SidebarRail = exports.SidebarProvider = exports.SidebarMenuSubItem = exports.SidebarMenuSubButton = exports.SidebarMenuSub = exports.SidebarMenuSkeleton = exports.SidebarMenuItem = exports.SidebarMenuButton = exports.SidebarMenuBadge = exports.SidebarMenuAction = exports.SidebarMenu = exports.SidebarInset = exports.SidebarInput = exports.SidebarHeader = exports.SidebarGroupLabel = exports.SidebarGroupContent = exports.SidebarGroupAction = exports.SidebarGroup = exports.SidebarFooter = exports.SidebarContent = exports.Sidebar = void 0;
exports.useSidebar = useSidebar;
var React = require("react");
var react_slot_1 = require("@radix-ui/react-slot");
var class_variance_authority_1 = require("class-variance-authority");
var lucide_react_1 = require("lucide-react");
var use_mobile_1 = require("@/hooks/use-mobile");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var separator_1 = require("@/components/ui/separator");
var sheet_1 = require("@/components/ui/sheet");
var skeleton_1 = require("@/components/ui/skeleton");
var tooltip_1 = require("@/components/ui/tooltip");
var SIDEBAR_COOKIE_NAME = "sidebar:state";
var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React.createContext(null);
function useSidebar() {
    var context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}
var SidebarProvider = React.forwardRef(function (_a, ref) {
    var _b = _a.defaultOpen, defaultOpen = _b === void 0 ? true : _b, openProp = _a.open, setOpenProp = _a.onOpenChange, className = _a.className, style = _a.style, children = _a.children, props = __rest(_a, ["defaultOpen", "open", "onOpenChange", "className", "style", "children"]);
    var isMobile = (0, use_mobile_1.useIsMobile)();
    var _c = React.useState(false), openMobile = _c[0], setOpenMobile = _c[1];
    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    var _d = React.useState(defaultOpen), _open = _d[0], _setOpen = _d[1];
    var open = openProp !== null && openProp !== void 0 ? openProp : _open;
    var setOpen = React.useCallback(function (value) {
        var openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
            setOpenProp(openState);
        }
        else {
            _setOpen(openState);
        }
        // This sets the cookie to keep the sidebar state.
        document.cookie = "".concat(SIDEBAR_COOKIE_NAME, "=").concat(openState, "; path=/; max-age=").concat(SIDEBAR_COOKIE_MAX_AGE);
    }, [setOpenProp, open]);
    // Helper to toggle the sidebar.
    var toggleSidebar = React.useCallback(function () {
        return isMobile
            ? setOpenMobile(function (open) { return !open; })
            : setOpen(function (open) { return !open; });
    }, [isMobile, setOpen, setOpenMobile]);
    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(function () {
        var handleKeyDown = function (event) {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    }, [toggleSidebar]);
    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    var state = open ? "expanded" : "collapsed";
    var contextValue = React.useMemo(function () { return ({
        state: state,
        open: open,
        setOpen: setOpen,
        isMobile: isMobile,
        openMobile: openMobile,
        setOpenMobile: setOpenMobile,
        toggleSidebar: toggleSidebar,
    }); }, [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
    return (<SidebarContext.Provider value={contextValue}>
        <tooltip_1.TooltipProvider delayDuration={0}>
          <div style={__assign({ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }, style)} className={(0, utils_1.cn)("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)} ref={ref} {...props}>
            {children}
          </div>
        </tooltip_1.TooltipProvider>
      </SidebarContext.Provider>);
});
exports.SidebarProvider = SidebarProvider;
SidebarProvider.displayName = "SidebarProvider";
var Sidebar = React.forwardRef(function (_a, ref) {
    var _b = _a.side, side = _b === void 0 ? "left" : _b, _c = _a.variant, variant = _c === void 0 ? "sidebar" : _c, _d = _a.collapsible, collapsible = _d === void 0 ? "offcanvas" : _d, className = _a.className, children = _a.children, props = __rest(_a, ["side", "variant", "collapsible", "className", "children"]);
    var _e = useSidebar(), isMobile = _e.isMobile, state = _e.state, openMobile = _e.openMobile, setOpenMobile = _e.setOpenMobile;
    if (collapsible === "none") {
        return (<div className={(0, utils_1.cn)("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)} ref={ref} {...props}>
          {children}
        </div>);
    }
    if (isMobile) {
        return (<sheet_1.Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <sheet_1.SheetContent data-sidebar="sidebar" data-mobile="true" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" style={{
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }} side={side}>
            <div className="flex h-full w-full flex-col">{children}</div>
          </sheet_1.SheetContent>
        </sheet_1.Sheet>);
    }
    return (<div ref={ref} className="group peer hidden md:block text-sidebar-foreground" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
        {/* This is what handles the sidebar gap on desktop */}
        <div className={(0, utils_1.cn)("duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]")}/>
        <div className={(0, utils_1.cn)("duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex", side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", 
        // Adjust the padding for floating and inset variants.
        variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            {children}
          </div>
        </div>
      </div>);
});
exports.Sidebar = Sidebar;
Sidebar.displayName = "Sidebar";
var SidebarTrigger = React.forwardRef(function (_a, ref) {
    var className = _a.className, onClick = _a.onClick, props = __rest(_a, ["className", "onClick"]);
    var toggleSidebar = useSidebar().toggleSidebar;
    return (<button_1.Button ref={ref} data-sidebar="trigger" variant="ghost" size="icon" className={(0, utils_1.cn)("h-7 w-7", className)} onClick={function (event) {
            onClick === null || onClick === void 0 ? void 0 : onClick(event);
            toggleSidebar();
        }} {...props}>
      <lucide_react_1.PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </button_1.Button>);
});
exports.SidebarTrigger = SidebarTrigger;
SidebarTrigger.displayName = "SidebarTrigger";
var SidebarRail = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    var toggleSidebar = useSidebar().toggleSidebar;
    return (<button ref={ref} data-sidebar="rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={(0, utils_1.cn)("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props}/>);
});
exports.SidebarRail = SidebarRail;
SidebarRail.displayName = "SidebarRail";
var SidebarInset = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<main ref={ref} className={(0, utils_1.cn)("relative flex min-h-svh flex-1 flex-col bg-background", "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className)} {...props}/>);
});
exports.SidebarInset = SidebarInset;
SidebarInset.displayName = "SidebarInset";
var SidebarInput = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<input_1.Input ref={ref} data-sidebar="input" className={(0, utils_1.cn)("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props}/>);
});
exports.SidebarInput = SidebarInput;
SidebarInput.displayName = "SidebarInput";
var SidebarHeader = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="header" className={(0, utils_1.cn)("flex flex-col gap-2 p-2", className)} {...props}/>);
});
exports.SidebarHeader = SidebarHeader;
SidebarHeader.displayName = "SidebarHeader";
var SidebarFooter = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="footer" className={(0, utils_1.cn)("flex flex-col gap-2 p-2", className)} {...props}/>);
});
exports.SidebarFooter = SidebarFooter;
SidebarFooter.displayName = "SidebarFooter";
var SidebarSeparator = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<separator_1.Separator ref={ref} data-sidebar="separator" className={(0, utils_1.cn)("mx-2 w-auto bg-sidebar-border", className)} {...props}/>);
});
exports.SidebarSeparator = SidebarSeparator;
SidebarSeparator.displayName = "SidebarSeparator";
var SidebarContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="content" className={(0, utils_1.cn)("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props}/>);
});
exports.SidebarContent = SidebarContent;
SidebarContent.displayName = "SidebarContent";
var SidebarGroup = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="group" className={(0, utils_1.cn)("relative flex w-full min-w-0 flex-col p-2", className)} {...props}/>);
});
exports.SidebarGroup = SidebarGroup;
SidebarGroup.displayName = "SidebarGroup";
var SidebarGroupLabel = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["className", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "div";
    return (<Comp ref={ref} data-sidebar="group-label" className={(0, utils_1.cn)("duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props}/>);
});
exports.SidebarGroupLabel = SidebarGroupLabel;
SidebarGroupLabel.displayName = "SidebarGroupLabel";
var SidebarGroupAction = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, props = __rest(_a, ["className", "asChild"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (<Comp ref={ref} data-sidebar="group-action" className={(0, utils_1.cn)("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
exports.SidebarGroupAction = SidebarGroupAction;
SidebarGroupAction.displayName = "SidebarGroupAction";
var SidebarGroupContent = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="group-content" className={(0, utils_1.cn)("w-full text-sm", className)} {...props}/>);
});
exports.SidebarGroupContent = SidebarGroupContent;
SidebarGroupContent.displayName = "SidebarGroupContent";
var SidebarMenu = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<ul ref={ref} data-sidebar="menu" className={(0, utils_1.cn)("flex w-full min-w-0 flex-col gap-1", className)} {...props}/>);
});
exports.SidebarMenu = SidebarMenu;
SidebarMenu.displayName = "SidebarMenu";
var SidebarMenuItem = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<li ref={ref} data-sidebar="menu-item" className={(0, utils_1.cn)("group/menu-item relative", className)} {...props}/>);
});
exports.SidebarMenuItem = SidebarMenuItem;
SidebarMenuItem.displayName = "SidebarMenuItem";
var sidebarMenuButtonVariants = (0, class_variance_authority_1.cva)("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
var SidebarMenuButton = React.forwardRef(function (_a, ref) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.isActive, isActive = _c === void 0 ? false : _c, _d = _a.variant, variant = _d === void 0 ? "default" : _d, _e = _a.size, size = _e === void 0 ? "default" : _e, tooltip = _a.tooltip, className = _a.className, props = __rest(_a, ["asChild", "isActive", "variant", "size", "tooltip", "className"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    var _f = useSidebar(), isMobile = _f.isMobile, state = _f.state;
    var button = (<Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={(0, utils_1.cn)(sidebarMenuButtonVariants({ variant: variant, size: size }), className)} {...props}/>);
    if (!tooltip) {
        return button;
    }
    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }
    return (<tooltip_1.Tooltip>
        <tooltip_1.TooltipTrigger asChild>{button}</tooltip_1.TooltipTrigger>
        <tooltip_1.TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip}/>
      </tooltip_1.Tooltip>);
});
exports.SidebarMenuButton = SidebarMenuButton;
SidebarMenuButton.displayName = "SidebarMenuButton";
var SidebarMenuAction = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.showOnHover, showOnHover = _c === void 0 ? false : _c, props = __rest(_a, ["className", "asChild", "showOnHover"]);
    var Comp = asChild ? react_slot_1.Slot : "button";
    return (<Comp ref={ref} data-sidebar="menu-action" className={(0, utils_1.cn)("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} {...props}/>);
});
exports.SidebarMenuAction = SidebarMenuAction;
SidebarMenuAction.displayName = "SidebarMenuAction";
var SidebarMenuBadge = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="menu-badge" className={(0, utils_1.cn)("absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
exports.SidebarMenuBadge = SidebarMenuBadge;
SidebarMenuBadge.displayName = "SidebarMenuBadge";
var SidebarMenuSkeleton = React.forwardRef(function (_a, ref) {
    var className = _a.className, _b = _a.showIcon, showIcon = _b === void 0 ? false : _b, props = __rest(_a, ["className", "showIcon"]);
    // Random width between 50 to 90%.
    var width = React.useMemo(function () {
        return "".concat(Math.floor(Math.random() * 40) + 50, "%");
    }, []);
    return (<div ref={ref} data-sidebar="menu-skeleton" className={(0, utils_1.cn)("rounded-md h-8 flex gap-2 px-2 items-center", className)} {...props}>
      {showIcon && (<skeleton_1.Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon"/>)}
      <skeleton_1.Skeleton className="h-4 flex-1 max-w-[--skeleton-width]" data-sidebar="menu-skeleton-text" style={{
            "--skeleton-width": width,
        }}/>
    </div>);
});
exports.SidebarMenuSkeleton = SidebarMenuSkeleton;
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
var SidebarMenuSub = React.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<ul ref={ref} data-sidebar="menu-sub" className={(0, utils_1.cn)("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
exports.SidebarMenuSub = SidebarMenuSub;
SidebarMenuSub.displayName = "SidebarMenuSub";
var SidebarMenuSubItem = React.forwardRef(function (_a, ref) {
    var props = __rest(_a, []);
    return <li ref={ref} {...props}/>;
});
exports.SidebarMenuSubItem = SidebarMenuSubItem;
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
var SidebarMenuSubButton = React.forwardRef(function (_a, ref) {
    var _b = _a.asChild, asChild = _b === void 0 ? false : _b, _c = _a.size, size = _c === void 0 ? "md" : _c, isActive = _a.isActive, className = _a.className, props = __rest(_a, ["asChild", "size", "isActive", "className"]);
    var Comp = asChild ? react_slot_1.Slot : "a";
    return (<Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={(0, utils_1.cn)("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
exports.SidebarMenuSubButton = SidebarMenuSubButton;
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
