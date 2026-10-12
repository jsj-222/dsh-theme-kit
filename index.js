// ============================================================
// Theme Kit for DeepSeek Harness — 宿主侧（阶段 2）
//
// 结构：数据（PALETTES 预设表）与渲染（renderCss）分离
//   · 换主题 = 只改 ACTIVE 一行
//   · 每个 token 给 { light, dark } 两个值 -> 亮/暗自动对应
//   · 亮色块用 html body（0-0-2，压官方 body 的 0-0-1）
//   · 暗色块用 html body[data-ds-dark-theme]（0-1-2，压官方同名选择器 0-1-1）
//
// 注意：本阶段仍走 Seam B（webServer.tapIndex 往 HTML 塞 <style>）。
// 阶段 3 会整体迁到 Seam A（客户端 overrideTokens），届时本文件的
// 注入逻辑会被移除、TOKENS 迁到 client.js。
// ============================================================

export const name = "theme-kit";

const VERSION = "1.1.0";

// ------------------------------------------------------------
// ① 预设颜色表：想加主题，在这里加一项即可（每个键必须 light/dark 成对）
// ------------------------------------------------------------
const PALETTES = {
  // 香芋紫（当前在用）
  lavender: {
    light: {
      background: "#FCFAFF", sidebar: "#F1EBFA", surface: "#F8F5FE", surface2: "#EAE0F7",
      accent: "#A68BC7", accentHover: "#9072B5", text: "#443B53",
      secondaryText: "#7D718E", mutedText: "#A095AE", bubble: "#EEE5FA", border: "#E4D9EF",
    },
    dark: {
      background: "#17131D", sidebar: "#1F1926", surface: "#241D2C", surface2: "#2C2336",
      accent: "#C0A6E0", accentHover: "#D2BCEC", text: "#E8E2F0",
      secondaryText: "#B0A5C0", mutedText: "#877C99", bubble: "#2E2539", border: "#3A3046",
    },
  },
  // 樱花粉（最初那版奶油粉的整理版）
  sakura: {
    light: {
      background: "#FFFBFA", sidebar: "#F9EDF0", surface: "#FFF7F8", surface2: "#F5E3E9",
      accent: "#C987A1", accentHover: "#B97692", text: "#503C45",
      secondaryText: "#856B75", mutedText: "#9B858D", bubble: "#F8E7EC", border: "#EADCE0",
    },
    dark: {
      background: "#1C1417", sidebar: "#251A1E", surface: "#2B1E23", surface2: "#342429",
      accent: "#E0A9BE", accentHover: "#ECC0D0", text: "#F2E8EC",
      secondaryText: "#C4A8B2", mutedText: "#9A8290", bubble: "#38262C", border: "#453038",
    },
  },
  // 抹茶绿（新增，用来证明"多预设"确实在跑）
  matcha: {
    light: {
      background: "#F7FAF4", sidebar: "#EAF2E2", surface: "#F2F7EC", surface2: "#E0EBD3",
      accent: "#6E9E52", accentHover: "#5A8542", text: "#2F3A28",
      secondaryText: "#5F6B57", mutedText: "#8A957F", bubble: "#E4F0D9", border: "#D7E3C9",
    },
    dark: {
      background: "#12160F", sidebar: "#1A2116", surface: "#1F2719", surface2: "#27321F",
      accent: "#9CC97E", accentHover: "#B2D998", text: "#E6EDDF",
      secondaryText: "#AFBA9F", mutedText: "#7E8A70", bubble: "#26311D", border: "#323D28",
    },
  },
};

// 当前启用的预设（换主题只改这一行）
const ACTIVE = "lavender";

// ------------------------------------------------------------
// ② 变量映射：语义名 -> --dsw-* token，值取 { light, dark }
//    这个形状和阶段 3 的 overrideTokens 完全一致，可直接搬过去
// ------------------------------------------------------------
function buildTokens(presetKey) {
  const p = PALETTES[presetKey] ?? PALETTES[ACTIVE];
  const { light: L, dark: D } = p;
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
    "--dsw-alias-border-l3":                   { light: L.border,        dark: D.border },
  };
}

// ------------------------------------------------------------
// ③ 渲染：把 { token: {light, dark} } 展开成两段 CSS
// ------------------------------------------------------------
function renderCss(tokens) {
  const light = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v.light};`).join("\n");
  const dark = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v.dark};`).join("\n");
  return `html body {\n${light}\n}\n\nhtml body[data-ds-dark-theme] {\n${dark}\n}`;
}

const TOKENS = buildTokens(ACTIVE);
const STYLE_ID = "dsh-theme-kit-style";

// ------------------------------------------------------------
// ④ Seam B 注入（阶段 3 会删掉这一段）
// ------------------------------------------------------------
export function injectTheme(html) {
  const style = `<style id="${STYLE_ID}" data-version="${VERSION}">\n${renderCss(TOKENS)}\n</style>`;
  if (html.includes(`id="${STYLE_ID}"`)) return html;
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${style}</head>`) : html + style;
}

export function apply(ctx) {
  const log = ctx.logger?.info ?? ((...a) => console.log("[theme-kit]", ...a));
  log(`loading v${VERSION}, preset=${ACTIVE}, tokens=${Object.keys(TOKENS).length}, presets=${Object.keys(PALETTES).join("/")}`);
  ctx.inject(["webServer"], (webCtx) => {
    webCtx.effect(() => webCtx.webServer.tapIndex(injectTheme), "theme-kit: inject theme css");
    log("theme registered (seam B)");
  });
}
