// Run from this repository: node tools/build-oscbunny.mjs
// First run npm install inside oscbunny-source/.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "oscbunny-source");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(npm, ["run", "build"], {
  cwd: source,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (result.status !== 0) process.exit(result.status || 1);
const out = path.join(root, "teachablemachine");
// Clear old hashed bundles so stale files don't pile up between builds.
fs.rmSync(path.join(out, "assets"), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(path.join(source, "dist"), out, { recursive: true });
const header = `<a href="#root" class="skip-link">Skip to main content</a>
<header class="site-header"><a class="site-brand" href="../index.html" aria-label="LIS 500 Code and Power home"><img class="course-logo" src="../site-assets/course-mark.svg" alt="" width="44" height="44" aria-hidden="true"><span>LIS 500<span class="brand-sub">Code and Power</span></span></a><nav class="site-nav" aria-label="Group website navigation"><a href="../index.html">Home</a><a href="../about.html">About Us</a><a href="../resources.html">Resources</a><a href="../techheroes.html">Tech Heroes</a><a class="bunny-link" href="index.html" aria-current="page">Teachable Machine</a></nav></header>`;
// Same footer as the other four pages, so credits stay consistent site-wide.
const footer = `<footer class="site-footer"><div class="footer-credit"><p>LIS 500 - Code and Power</p><p>Created by Nireekshana Shivarathri, Yuthika Goel, and Madeline Root</p></div></footer>`;
const page = path.join(out, "index.html");
let html = fs.readFileSync(page, "utf8");
html = html.replace(
  "</head>",
  '<link rel="stylesheet" href="../stylepage.css"></head>',
);
html = html.replace("<body>", '<body class="classifier-site">' + header);
html = html.replace("</body>", footer + "</body>");
fs.writeFileSync(page, html);
console.log(
  "Oscbunny built with relative assets and the shared group navigation.",
);
