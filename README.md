# WarungKu 🛍️

> **AI-powered promotional content generator for Indonesian SMEs (UMKM)**
> 
> Upload a product photo → get professional banners, viral captions, and carousel content in seconds.

---

## 🚀 The Problem

64+ million UMKM in Indonesia struggle to create consistent, professional marketing content. Hiring a designer is expensive. DIY tools are complex. Most end up with low-quality visuals that hurt their brand.

## ✨ The Solution

WarungKu uses AI to instantly transform a simple product photo into platform-ready promotional content — no design skills needed.

| What You Get | How Fast |
|---|---|
| 🖼️ Promotional banner (themed) | ~10 seconds |
| 📝 Viral caption + hashtags | ~5 seconds |
| 🎠 Multi-slide carousel content | ~15 seconds |

---

## Features

- **📸 Smart Product Analysis** — Qwen VL understands your product from photos, extracting key selling points automatically
- **🎨 Themed Banner Generation** — 7 themes tailored for Indonesian market (Ramadan, Meme Style, Minimalist, etc.)
- **✍️ Caption Generation** — Platform-optimized captions with trending hashtags in Bahasa Indonesia
- **📱 Carousel Generation** — Multi-slide content designed for higher engagement on Instagram & TikTok
- **🌐 Multi-Platform Support** — Output sized for Instagram, TikTok, WhatsApp, Twitter/X, and Marketplace

---

## Supported Themes

| Theme | Best For |
|-------|----------|
| 🌙 Ramadan | Religious holidays, Eid promotions |
| 😂 Meme Style | Gen Z audience, viral content |
| 🐾 Pet Products | Pet shops, animal lovers |
| 🔥 Viral Trend | Flash sales, limited offers |
| 🎉 Festive | Celebrations, grand openings |
| ✨ Minimalist | Premium products, modern brands |
| 💼 Professional | B2B, corporate clients |

## Supported Platforms

| Platform | Ratio |
|----------|-------|
| Instagram Post | 1:1 |
| Instagram Story | 9:16 |
| TikTok | 9:16 |
| WhatsApp Status | 9:16 |
| Twitter / X | 16:9 |
| Marketplace (Tokopedia, Shopee) | 1:1 |

---

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your API key

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
AI_API_KEY=your-dashscope-api-key
AI_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

Get your API key from [Alibaba Cloud Model Studio](https://www.alibabacloud.com/product/model-studio).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Vision AI | Alibaba Cloud Qwen VL (product analysis) |
| Text AI | Alibaba Cloud Qwen Chat (caption generation) |
| Image AI | Alibaba Cloud Wanx (banner generation) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/           # Product analysis (Qwen VL)
│   │   ├── generate-image/    # Banner generation (Wanx)
│   │   ├── generate-caption/  # Caption generation (Qwen Chat)
│   │   └── generate-carousel/ # Carousel slide generation
│   ├── page.tsx               # Main application
│   └── layout.tsx
├── components/ui/             # shadcn/ui components
├── lib/
│   ├── ai-service.ts          # AI service functions
│   ├── ai-config.ts           # AI model configuration
│   └── utils.ts
└── hooks/
```

---

## API Reference

### `POST /api/analyze`
Analyze a product from an image using Qwen VL.

```json
{
  "image": "base64_encoded_image",
  "productName": "Keripik Singkong Bu Sari",
  "productDescription": "Optional description",
  "theme": "minimal"
}
```

### `POST /api/generate-image`
Generate a promotional banner using Wanx.

```json
{
  "productAnalysis": "result from /api/analyze",
  "productName": "Keripik Singkong Bu Sari",
  "theme": "festive",
  "platform": "ig-post"
}
```

### `POST /api/generate-caption`
Generate a viral marketing caption.

```json
{
  "productAnalysis": "result from /api/analyze",
  "productName": "Keripik Singkong Bu Sari",
  "theme": "minimal"
}
```

### `POST /api/generate-carousel`
Generate multi-slide carousel content.

```json
{
  "productAnalysis": "result from /api/analyze",
  "productName": "Keripik Singkong Bu Sari",
  "theme": "minimal",
  "count": 3
}
```

---

## Scripts

```bash
bun dev      # Start development server
bun build    # Build for production
bun start    # Start production server
bun lint     # Run ESLint
```

## Requirements

- Node.js 18+ or Bun
- Alibaba Cloud account with DashScope API access

---

## License

MIT