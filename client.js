// ============================================================
// Theme Kit for DeepSeek Harness — 客户端 bundle（阶段 3：Seam A）
//
// 这是浏览器端跑的模块：手写 bundle、零构建。__ModuleLoader__.load 把
// factory 注册进 dsh web 的模块表，页面加载时执行 apply(ctx)。
//
// 走 Seam A：ctx.theme.overrideTokens(source, tokens)
//   · tokens 形状 = { "--dsw-xxx": { light, dark } }
//   · presenter 按当前亮/暗模式自动选值 -> 暗色天然正确
//   · 覆盖层由 presenter 写成 <body> 内联样式 -> 优先级最高，
//     不用跟官方样式表比特异性（这正是阶段 2 那套 Seam B 的痛点）
//   · ctx.effect 把覆盖层生命周期绑到插件 -> 卸载/热重载自动还原
// ============================================================
window.__ModuleLoader__.load({
  id: "dsh-theme-kit",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    var VERSION = "2.0.0";
    var SOURCE = "dsh-theme-kit";

    // ------------------------------------------------------------
    // 预设颜色表（与宿主侧同一份数据；阶段 4 会把它外置成配置文件）
    // ------------------------------------------------------------
    var PALETTES = {
      // 香芋紫
      lavender: {
        light: {
          background: "#FCFAFF", sidebar: "#F1EBFA", surface: "#F8F5FE", surface2: "#EAE0F7",
          accent: "#A68BC7", accentHover: "#9072B5", text: "#443B53",
          secondaryText: "#7D718E", mutedText: "#A095AE", bubble: "#EEE5FA", border: "#E4D9EF"
        },
        dark: {
          background: "#17131D", sidebar: "#1F1926", surface: "#241D2C", surface2: "#2C2336",
          accent: "#C0A6E0", accentHover: "#D2BCEC", text: "#E8E2F0",
          secondaryText: "#B0A5C0", mutedText: "#877C99", bubble: "#2E2539", border: "#3A3046"
        }
      },
      // 樱花粉
      sakura: {
        light: {
          background: "#FFFBFA", sidebar: "#F9EDF0", surface: "#FFF7F8", surface2: "#F5E3E9",
          accent: "#C987A1", accentHover: "#B97692", text: "#503C45",
          secondaryText: "#856B75", mutedText: "#9B858D", bubble: "#F8E7EC", border: "#EADCE0"
        },
        dark: {
          background: "#1C1417", sidebar: "#251A1E", surface: "#2B1E23", surface2: "#342429",
          accent: "#E0A9BE", accentHover: "#ECC0D0", text: "#F2E8EC",
          secondaryText: "#C4A8B2", mutedText: "#9A8290", bubble: "#38262C", border: "#453038"
        }
      },
      // 抹茶绿
      matcha: {
        light: {
          background: "#F7FAF4", sidebar: "#EAF2E2", surface: "#F2F7EC", surface2: "#E0EBD3",
          accent: "#6E9E52", accentHover: "#5A8542", text: "#2F3A28",
          secondaryText: "#5F6B57", mutedText: "#8A957F", bubble: "#E4F0D9", border: "#D7E3C9"
        },
        dark: {
          background: "#12160F", sidebar: "#1A2116", surface: "#1F2719", surface2: "#27321F",
          accent: "#9CC97E", accentHover: "#B2D998", text: "#E6EDDF",
          secondaryText: "#AFBA9F", mutedText: "#7E8A70", bubble: "#26311D", border: "#323D28"
        }
      }
    };

    // 当前启用的预设（换主题只改这一行）
    var ACTIVE = "lavender";

    // ------------------------------------------------------------
    // 语义名 -> --dsw-* token（值取 { light, dark }）
    // ------------------------------------------------------------
    function buildTokens(key) {
      var p = PALETTES[key] || PALETTES[ACTIVE];
      var L = p.light;
      var D = p.dark;
      return {
        "--dsw-alias-bg-base":                     { light: L.background,    dark: D.background },
        "--dsw-alias-bg-layer-1":                  { light: L.surface,       dark: D.surface },
        "--dsw-alias-bg-layer-2":                  { light: L.sidebar,       dark: D.sidebar },
        "--dsw-alias-bg-layer-3":                  { light: L.surface2,      dark: D.surface2 },

        "--dsw-alias-brand-primary":               { light: L.accent,        dark: D.accent },
        "--dsw-alias-brand-text":                  { light: L.accentHover,   dark: D.accentHover },
        "--dsw-alias-brand-primary-invert":        { light: "#FFFFFF",       dark: "#1A1420" },

        "--dsw-alias-label-primary":               { light: L.text,          dark: D.text },
        "--dsw-alias-label-secondary":             { light: L.secondaryText, dark: D.secondaryText },
        "--dsw-alias-label-tertiary":              { light: L.mutedText,     dark: D.mutedText },

        "--dsw-alias-button-primary-fill":         { light: L.accent,        dark: D.accent },
        "--dsw-alias-button-primary-hover":        { light: L.accentHover,   dark: D.accentHover },
        "--dsw-alias-interactive-bg-hover":        { light: L.sidebar,       dark: D.sidebar },
        "--dsw-alias-interactive-bg-hover-accent": { light: L.bubble,        dark: D.bubble },

        "--dsw-specific-sidebar-fill":             { light: L.sidebar,       dark: D.sidebar },
        "--dsw-specific-sidebar-nav-item-active":  { light: L.bubble,        dark: D.bubble },
        "--dsw-specific-sidebar-nav-item-hover":   { light: L.surface2,      dark: D.surface2 },

        "--dsw-specific-bubble":                   { light: L.bubble,        dark: D.bubble },
        "--dsw-specific-input-major":              { light: L.surface,       dark: D.surface },
        "--dsw-specific-menu":                     { light: L.surface,       dark: D.surface },

        "--dsw-alias-markdown-code-block":         { light: L.surface,       dark: D.surface },
        "--dsw-alias-markdown-inline-code":        { light: L.bubble,        dark: D.bubble },

        "--dsw-alias-border-l2":                   { light: L.border,        dark: D.border },
        "--dsw-alias-border-l3":                   { light: L.border,        dark: D.border }
      };
    }

    var TOKENS = buildTokens(ACTIVE);

    // ------------------------------------------------------------
    // 浏览器侧入口：等 theme 服务就绪，然后叠上覆盖层
    // ------------------------------------------------------------
    function apply(ctx) {
      ctx.inject(["theme"], (themeCtx) => {
        themeCtx.effect(
          () => themeCtx.theme.overrideTokens(SOURCE, TOKENS),
          "theme-kit: token override"
        );
      });
    }

    exports.apply = apply;
    return module.exports;
  }
});
