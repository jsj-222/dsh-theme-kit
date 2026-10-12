// ============================================================
// Theme Kit for DeepSeek Harness — 宿主侧（阶段 3 后已瘦身）
//
// 主题逻辑已全部迁到客户端 bundle（./client.js，走 Seam A 的
// ctx.theme.overrideTokens）。宿主侧不再注入任何 <style>，
// 只保留一个空插件壳 —— 它的作用仅是让这个 bundle 在 loader 里
// 有对应条目；真正的换肤由 client.js 在浏览器里完成。
//
// 想改配色：改 client.js 顶部的 PALETTES / ACTIVE。
// 想看宿主侧的老实现（Seam B + tapIndex）：git show 阶段2 那次提交。
// ============================================================

export const name = "theme-kit";
export const inject = [];

export function apply() {
  // 无宿主行为：换肤走客户端 overrideTokens
}
