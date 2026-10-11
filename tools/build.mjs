// 把所有 CSS / JS 打包成單一 HTML
//   dist/萌獸冒險.html   完整網頁，可以直接傳到平板或手機離線玩
//   dist/artifact.html   發布到 claude.ai 用（不含 <html>/<head>/<body> 外殼）
// 用法：node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const block = html.match(/<!-- build:scripts -->([\s\S]*?)<!-- \/build:scripts -->/)[1];
const files = [...block.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
const js = files.map((f) => `// ── ${f} ──\n` + readFileSync(join(root, f), 'utf8')).join('\n');
const css = readFileSync(join(root, 'css/style.css'), 'utf8');
if (js.includes('</script')) throw new Error('JS 內含 </script，無法內嵌');

const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Huninn&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap">`;
const body = `<div id="app"></div>\n<script>\n${js}\n</script>`;

mkdirSync(join(root, 'dist'), { recursive: true });
const standalone = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>萌獸冒險</title>
${fonts}
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>
`;
writeFileSync(join(root, 'dist', '萌獸冒險.html'), standalone);

const artifact = `<title>萌獸冒險</title>
${fonts}
<style>
${css}
</style>
${body}
`;
writeFileSync(join(root, 'dist', 'artifact.html'), artifact);
console.log(`打包完成：${files.length} 個 JS 檔，大小 ${(standalone.length / 1024).toFixed(0)} KB`);
