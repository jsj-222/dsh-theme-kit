# dsh-theme-kit

给 DeepSeek Harness **Web 客户端**用的可配置皮肤插件。多套配色预设 + 亮/暗双值，走官方
`ctx.theme.overrideTokens()`（客户端覆盖层），**零构建**。

> 前身是 `dsh-cream-pink`（写死一套香芋紫、且暗色失效）。已改名并重构。

## 它长什么样

| 文件 | 作用 |
|---|---|
| `client.js` | **核心**。浏览器端 bundle：预设表 + `overrideTokens` 调用。改配色改这里 |
| `index.js` | 宿主侧空壳（主题逻辑都在客户端，这里只占个位） |
| `package.json` | 声明 `dsh.bundle.patch` 与 `dsh.client`（让 loader 认得客户端 bundle） |
| `cordis.patch.yml` | 一行 insert，等于开关 |

## 换主题

改 `client.js` 顶部的常量：

```js
var ACTIVE = "lavender";   // 可选：lavender(香芋紫) / sakura(樱花粉) / matcha(抹茶绿)
```

保存即热重载（profile 是 `patchReload: live`）。

## 加一套自己的配色

在 `client.js` 的 `PALETTES` 里加一项，**`light` / `dark` 两个块都要给全**（少给一个，切到那个模式就瞎）：

```js
mycolor: {
  light: { background:"#…", sidebar:"#…", surface:"#…", surface2:"#…",
           accent:"#…", accentHover:"#…", text:"#…",
           secondaryText:"#…", mutedText:"#…", bubble:"#…", border:"#…" },
  dark:  { background:"#…", /* … 同上 11 个键 … */ }
}
```

然后把 `ACTIVE` 改成 `"mycolor"`。11 个语义名到 `--dsw-*` token 的映射在 `buildTokens()` 里，一般不用动。

## 为什么用 Seam A（overrideTokens）而不是注入 `<style>`

- 覆盖层最终写成 `<body>` 的**内联 CSS 变量** → 优先级最高，不用和官方样式表比特异性；
- 原生支持 `{ light, dark }` 双值 → **暗色自动正确**（旧版注入法在暗色下会被官方 `body[data-ds-dark-theme]` 反压，主题整体失效）；
- `ctx.effect` 绑定生命周期 → 插件卸载/热重载**自动还原**，不留残留。

## 安装

**方式一：从 GitHub 装（推荐，插件市场会显示 GitHub 地址）**

```jsonc
// profiles/web/package.json
{
  "dependencies": { "dsh-theme-kit": "github:jsj-222/dsh-theme-kit" },
  "dsh": { "profile": { "bundles": ["dsh-theme-kit"] } }
}
```

```bash
cd ~/.dsh/profiles/web && pnpm install   # 拉取仓库副本到 node_modules
```

> 国内网络需给 git 配代理：`git config --global http.proxy http://127.0.0.1:7897`
> （pnpm 拉 git 依赖走的是 git，不是 npm registry，所以配 git 的代理即可。）

**方式二：本地 link 开发（改源码即时生效，不落 GitHub）**

```jsonc
"dependencies": { "dsh-theme-kit": "link:D:/AI/dsh-theme-kit" }
```

```js
// Windows 建 junction，无需管理员
require('fs').symlinkSync('D:/AI/dsh-theme-kit',
  require('path').join(require('os').homedir(), '.dsh/profiles/web/node_modules/dsh-theme-kit'),
  'junction');
```

**两种方式的取舍**：`github:` 装的是仓库快照副本 —— 改代码要 `commit → push → pnpm update dsh-theme-kit` 才生效；`link:` 直连本地目录，保存即生效，但插件市场会标成「本地开发」。开发期用 link，发布/日常使用用 github。

**验证**：`dsh --profile web --dump-config | grep -A2 theme-kit` → 看到 `# == dsh-theme-kit` 即接入成功；之后**重启 `dsh web`**（新增客户端 bundle 不会热插）。

## 路线图

- [x] 阶段 2 预设表 + 亮暗双值
- [x] 阶段 3 迁 Seam A（overrideTokens）
- [ ] 阶段 4 配色外置到配置文件（改色不碰代码）
- [ ] 阶段 5 运行时切换（设置页 / 快捷键 + 持久化）
- [ ] 阶段 6 装饰层（壁纸 / 光晕 / 滚动条 / 字体）
