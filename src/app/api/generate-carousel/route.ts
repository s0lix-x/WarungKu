import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/ai-service";

const CAROUSEL_SLIDE_PROMPTS = [
  { type: "cover", prompt: "Cover slide: Bold 'NEW ARRIVAL' or 'BEST SELLER' banner at top, product showcase area in center, eye-catching decorative frame, scroll-stopping colors, brand logo space" },
  { type: "feature", prompt: "Feature slide: 'PREMIUM QUALITY' or 'BEST FEATURES' badge area, product highlight space, benefit icons area, clean layout with accent decorations" },
  { type: "benefit", prompt: "Benefits slide: 'WHY CHOOSE US' header space, 3 benefit boxes area, problem-solution visual layout, trust badge space" },
  { type: "testimonial", prompt: "Social proof slide: 5-star rating area, customer photo placeholder, quote text space, 'TESTED & TRUSTED' badge, review card design" },
  { type: "cta", prompt: "Call-to-action slide: 'ORDER NOW' or 'GRAB YOURS' banner, limited time offer badge, contact info space, QR code area, urgency elements like countdown box" }
];

const THEME_STYLES: Record<string, string> = {
  ramadan: "Ramadan promotional: Golden-green Islamic frames, crescent moon decorations, lantern graphics, 'Ramadan Special' banner space, Arabic pattern borders",
  meme: "Viral meme style: Bold colorful stickers, 'FLASH SALE' graphics, trending arrow elements, Gen Z aesthetic decorations, playful emoji accents",
  pets: "Pet product promo: Paw print borders, bone/toy graphics, 'Pet Favorite' badge space, soft pastel frame, heart decorations",
  avatar: "Brand mascot promo: Character frame decorations, mascot accent graphics, 'Official' badge space, colorful brand elements",
  viral: "TikTok viral style: 'HOT ITEM' banner space, fire emoji graphics, trending decorations, high contrast frame, FYP-optimized layout",
  festive: "Festive promo: Confetti and streamer graphics, 'Special Offer' ribbon space, celebration badge area, party frame decorations",
  minimal: "Minimalist promo: Clean thin borders, 'NEW ARRIVAL' subtle badge space, premium seal area, elegant whitespace, modern frame",
  professional: "Business promo: Certificate badge space, '100% Original' seal area, trust badge graphics, corporate frame, guarantee ribbon space"
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productAnalysis, productName, productDescription, theme, count } = body;

    if (!productAnalysis) {
      return NextResponse.json(
        { error: "Product analysis is required" },
        { status: 400 }
      );
    }

    const slideCount = Math.min(count || 3, 5);
    const themeStyle = THEME_STYLES[theme || "minimal"] || THEME_STYLES.minimal;
    const images: string[] = [];

    console.log("Generating carousel with", slideCount, "slides");

    // Generate slides sequentially to avoid rate limiting
    const errors: string[] = [];
    
    for (let i = 0; i < slideCount; i++) {
      const slideInfo = CAROUSEL_SLIDE_PROMPTS[i];
      
      const prompt = `Create professional marketing carousel slide ${i + 1} of ${slideCount} for Indonesian UMKM product promotion.

Product: ${productName || "UMKM Product"}
Analysis: ${productAnalysis}
${productDescription ? `Details: ${productDescription}` : ""}

Slide Type: ${slideInfo.type}
Layout: ${slideInfo.prompt}

Theme Style: ${themeStyle}

Design Requirements:
- Square format (1024x1024) optimized for Instagram carousel
- Marketing banner style with promotional graphic elements
- Designated spaces for: product photo, text headers, badges, price info
- Decorative frames, borders, and marketing accents
- E-commerce promotional aesthetic (Tokopedia/Shopee style)
- Consistent color scheme across all slides
- Professional commercial marketing quality
- Eye-catching scroll-stopping design

Style: High-converting social media carousel, marketing creative, promotional slide template.

Quality: Sharp, vibrant, professional marketing design.`;

      try {
        console.log(`Generating slide ${i + 1}/${slideCount}...`);
        const imageUrl = await generateImage({ prompt, size: "1024*1024", retryCount: 1 });
        images.push(imageUrl);
        console.log(`Slide ${i + 1} generated successfully`);
        
        // Small delay between requests to avoid rate limiting
        if (i < slideCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (e: any) {
        console.error(`Failed to generate slide ${i + 1}:`, e.message);
        errors.push(`Slide ${i + 1}: ${e.message}`);
      }
    }

    if (images.length === 0) {
      throw new Error(`Failed to generate any carousel images. Errors: ${errors.join(', ')}`);
    }

    console.log(`Carousel generation complete: ${images.length}/${slideCount} images generated`);

    return NextResponse.json({ 
      success: true,
      images,
      count: images.length,
      requested: slideCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error("Generate carousel error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate carousel" },
      { status: 500 }
    );
  }
}
