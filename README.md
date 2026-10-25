# beyondmeteor.github.io

Bilingual technical notes on AI Infrastructure, GPU Computing, LLM inference, Linux systems, and AI agents.

中英双语技术博客：GPU 计算、LLM 推理优化、Linux 系统与 AI Agent。

## Published articles / 已发布文章

- [CUDA Execution Model: Kernel, Grid, Block, Warp & SM](posts/cuda-execution-model.html) — CUDA 执行模型
- [Why CUDA Graphs Accelerate LLM Inference](posts/why-cuda-graphs-are-fast.html) — CUDA Graph 为什么能够加速推理

## Local preview / 本地预览

This first version is static HTML/CSS/JS. Open `index.html` in a browser or serve the repository directory with `python3 -m http.server 8000` and visit `http://localhost:8000`.

第一版使用静态 HTML/CSS/JS，不依赖 Jekyll 构建；可直接使用浏览器打开 `index.html`，或者运行上述本地 HTTP 服务。

## Deployment / 部署

Configure GitHub Pages in **Settings → Pages → Build and deployment → Deploy from a branch**, select `main` and `/(root)` after reviewing and merging the PR. The public site is expected at https://beyondmeteor.github.io/ once Pages is enabled and deployment succeeds.

合并 PR 后，在仓库 Settings → Pages 中选择从 `main` 分支根目录部署。需成功启用 Pages 后网站才会发布。

## Roadmap / 后续方向

- Triton Program / Tile and CUDA mapping
- KV Cache, PagedAttention, batching and speculative decoding
- Nsight Systems performance profiling
- Linux Kernel scheduling and realtime voice agents

Existing LICENSE is preserved / 原有 LICENSE 保留不变。
