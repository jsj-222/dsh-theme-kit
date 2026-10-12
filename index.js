// Theme Kit for DeepSeek Harness
// Version: 1.0.0

export const name = "theme-kit";

// 主题颜色集中管理，方便以后修改
// const colors = {
//   background: "#FFFBFA",
//   sidebar: "#F9EDF0",
//   surface: "#FFF7F8",
//   surface2: "#F5E3E9",
//   accent: "#C987A1",
//   accentHover: "#B97692",
//   text: "#503C45",
//   secondaryText: "#856B75",
//   mutedText: "#9B858D",
//   bubble: "#F8E7EC",
//   border: "#EADCE0"
// };
const colors = {
  background: "#FCFAFF",
  sidebar: "#F1EBFA",
  surface: "#F8F5FE",
  surface2: "#EAE0F7",
  accent: "#A68BC7",
  accentHover: "#9072B5",
  text: "#443B53",
  secondaryText: "#7D718E",
  mutedText: "#A095AE",
  bubble: "#EEE5FA",
  border: "#E4D9EF"
};

// 生成 CSS
export function generateThemeCss() {
  return `
    html body {
      --dsw-alias-bg-base: ${colors.background};
      --dsw-alias-bg-layer-1: ${colors.surface};
      --dsw-alias-bg-layer-2: ${colors.sidebar};
      --dsw-alias-bg-layer-3: ${colors.surface2};

      --dsw-alias-brand-primary: ${colors.accent};
      --dsw-alias-brand-text: ${colors.accentHover};
      --dsw-alias-brand-primary-invert: #FFFFFF;

      --dsw-alias-label-primary: ${colors.text};
      --dsw-alias-label-secondary: ${colors.secondaryText};
      --dsw-alias-label-tertiary: ${colors.mutedText};

      --dsw-alias-button-primary-fill: ${colors.accent};
      --dsw-alias-button-primary-hover: ${colors.accentHover};

      --dsw-alias-interactive-bg-hover: ${colors.sidebar};
      --dsw-alias-interactive-bg-hover-accent: ${colors.bubble};

      --dsw-specific-sidebar-fill: ${colors.sidebar};
      --dsw-specific-sidebar-nav-item-active: ${colors.bubble};
      --dsw-specific-sidebar-nav-item-hover: ${colors.surface2};

      --dsw-specific-bubble: ${colors.bubble};
      --dsw-specific-input-major: ${colors.surface};
      --dsw-specific-menu: ${colors.surface};

      --dsw-alias-markdown-code-block: ${colors.surface};
      --dsw-alias-markdown-inline-code: ${colors.bubble};

      --dsw-alias-border-l2: ${colors.border};
      --dsw-alias-border-l3: ${colors.border};
    }
  `;
}

// 将主题样式插入 DSH 返回的 HTML
export function injectTheme(html) {
  const style = `
    <style id="dsh-cream-pink-style">
      ${generateThemeCss()}
    </style>
  `;

  if (html.includes('id="dsh-cream-pink-style"')) {
    return html;
  }

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${style}</head>`);
  }

  return html + style;
}

// DSH Plugin 入口
export function apply(ctx) {
  console.log("[Cream Pink] Plugin loading...");

  ctx.inject(["webServer"], (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.tapIndex(injectTheme),
      "cream-pink: inject theme styles"
    );

    console.log("[Cream Pink] Theme registered");
  });
}