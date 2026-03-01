import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai-service";

const THEME_PROMPTS: Record<string, string> = {
  ramadan: "Ramadan promotional banner: Warm golden and green tones, crescent moon, Islamic geometric borders, lantern decorations, 'Ramadan Kareem' or 'Special Ramadan Offer' text space, festive Islamic patterns, elegant Arabic-inspired frames, dates and traditional elements, spiritual and celebratory atmosphere.",
  meme: "Viral meme promotional template: Bold colorful background, eye-catching stickers, 'FLASH SALE' or 'BEST SELLER' banner space, Gen Z aesthetic, trending visual elements, speech bubble space for product name, playful emoji decorations, FYP-optimized layout, attention-grabbing arrows and highlights.",
  pets: "Pet product promotional banner: Cute paw print borders, pet bone/toy decorations, 'Pet Lovers Favorite' badge space, soft pastel colors, adorable pet illustrations around frame, heart shapes, 'Premium Pet Quality' ribbon space, cozy and loving atmosphere.",
  avatar: "Brand mascot promotional design: Friendly cartoon character holding or presenting the product, 'Official Brand' badge space, colorful character-themed border, mascot face decorations, trust badge area, playful yet professional layout, memorable character elements.",
  viral: "Viral TikTok/Instagram promotional: Bold 'FLASH SALE' or 'HOT ITEM' banner at top, fire emoji decorations, trending arrow graphics, 'Limited Stock' badge space, high contrast colors, FYP-optimized layout, 'Swipe Up' or 'Link in Bio' text area, urgency elements like countdown visual.",
  festive: "Festive celebration promotional: Colorful confetti and streamers, 'Special Offer' banner space, gift box decorations, party balloon frame, 'Grand Opening' or 'Big Sale' ribbon, firework elements, celebration badge areas, joyful and exciting atmosphere.",
  minimal: "Clean minimalist promotional: 'NEW ARRIVAL' or 'BEST SELLER' subtle badge, elegant thin borders, premium quality seal space, modern sans-serif text areas, lots of clean space for product focus, subtle gradient background, professional trust badges, sophisticated and premium feel.",
  professional: "Professional business promotional: 'Trusted Quality' certificate badge space, '100% Original' seal, testimonial stars rating area, corporate color scheme (navy, white, gold), professional guarantee badges, 'Official Store' ribbon, business certification elements, trustworthy and credible design."
};

const PLATFORM_STYLES: Record<string, string> = {
  "ig-post": "Instagram post format: Square composition, feed-optimized",
  "ig-story": "Instagram story: Vertical 9:16 ratio, full-screen mobile experience",
  "tiktok": "TikTok style: Vertical format, dynamic, attention-grabbing first frame",
  "wa-status": "WhatsApp status: Vertical format, personal and authentic feel",
  "twitter": "Twitter/X card: Horizontal landscape, eye-catching in feed",
  "marketplace": "E-commerce marketplace: Product-focused, clean background"
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productAnalysis, productName, productDescription, theme, platform, size } = body;

    if (!productAnalysis) {
      return NextResponse.json(
        { error: "Product analysis is required" },
        { status: 400 }
      );
    }

    const themePrompt = THEME_PROMPTS[theme || "minimal"] || THEME_PROMPTS.minimal;
    const platformStyle = PLATFORM_STYLES[platform || "ig-post"] || PLATFORM_STYLES["ig-post"];

    const prompt = `Create a professional promotional marketing banner/template for an Indonesian SME (UMKM) product.

Product to promote: ${productName || "UMKM Product"}
Product Analysis: ${productAnalysis}
${productDescription ? `Additional Details: ${productDescription}` : ""}

Design Requirements:
- ${themePrompt}
- ${platformStyle}
- Marketing-focused layout with designated spaces for: product photo placement, price tag area, discount badge space, product name/header text area, and call-to-action button space
- Indonesian market appeal with culturally relevant colors and elements
- Social media ready - Instagram/TikTok/Tokopedia aesthetic
- Commercial marketing banner style, not just a product photo
- Include decorative frames, borders, badges, and promotional graphic elements
- Layout should have clear focal point for product placement
- Eye-catching marketing graphics: arrows, stars, ribbons, seals, stamps
- Professional e-commerce promotional banner quality

Style: High-converting marketing creative, e-commerce promotional banner, social media ad creative, product showcase template with graphic overlays and marketing elements.

Quality: High resolution, sharp, vibrant colors, professional commercial marketing design.`;

    console.log("Generating image with prompt length:", prompt.length);
    
    // Convert size format: "1024x1024" -> "1024*1024" for API
    const apiSize = (size || "1024x1024").replace("x", "*");
    const imageUrl = await generateImage({ prompt, size: apiSize });

    console.log("Image generated successfully");

    return NextResponse.json({ 
      success: true,
      imageUrl 
    });

  } catch (error: any) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
