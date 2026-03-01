import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-service";

const THEME_TONES: Record<string, string> = {
  ramadan: "Tone: Warm, spiritual, reflective, and blessed. Use phrases related to berkah, sahur, buka puasa.",
  meme: "Tone: Humorous, relatable, casual, and trendy. Use internet slang and Gen Z expressions.",
  pets: "Tone: Adoring, cute, heartwarming. Use pet-related expressions.",
  avatar: "Tone: Friendly, approachable, brand-focused.",
  viral: "Tone: Urgent, exciting, trending. Use FOMO-inducing language.",
  festive: "Tone: Celebratory, joyful, happy. Use celebration-related expressions.",
  minimal: "Tone: Clean, sophisticated, elegant. Minimal words but impactful.",
  professional: "Tone: Trustworthy, credible, business-focused."
};

const THEME_HASHTAGS: Record<string, string[]> = {
  ramadan: ["#RamadanMubarak", "#Ramadan2025", "#SahurVibes", "#BukaPuasa", "#RamadanKareem"],
  meme: ["#RelatableContent", "#ViralIndo", "#FYP", "#ForYou", "#DailyMeme"],
  pets: ["#PetLovers", "#DogsOfInstagram", "#CatsOfInstagram", "#PetShop", "#FurBaby"],
  viral: ["#ViralIndonesia", "#FYP", "#TrendingNow", "#MustTry", "#Recommended"],
  festive: ["#HariRaya", "#Lebaran", "#IdulFitri", "#Celebration", "#FestiveVibes"],
  default: ["#UMKMIndonesia", "#ProdukLokal", "#BelanjaLokal", "#SupportLokal", "#MadeInIndonesia"]
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productAnalysis, productName, productDescription, theme } = body;

    if (!productAnalysis) {
      return NextResponse.json(
        { error: "Product analysis is required" },
        { status: 400 }
      );
    }

    console.log("Generating caption for:", productName || "Unnamed product");

    const themeTone = THEME_TONES[theme || "minimal"] || THEME_TONES.minimal;
    const themeHashtags = THEME_HASHTAGS[theme || "default"] || THEME_HASHTAGS.default;

    const systemPrompt = "Kamu adalah content creator profesional untuk UMKM Indonesia.";
    
    const userPrompt = `Buatkan caption promosi yang menarik untuk social media.

Produk: ${productName || "Produk UMKM"}
Analisis: ${productAnalysis}
${productDescription ? `Info tambahan: ${productDescription}` : ""}

${themeTone}

Struktur Caption:
1. HOOK pembuka yang menarik perhatian
2. Highlight keunggulan produk dengan natural
3. Call to action yang jelas tapi tidak pushy
4. Engaging question untuk mendorong interaksi

Aturan:
- Bahasa Indonesia yang natural, tidak kaku
- Gen Z friendly tapi profesional
- Emoji secukupnya (maksimal 3-4)
- Total 150-250 kata

Output HANYA caption tanpa hashtags.`;

    const caption = await generateText({ systemPrompt, userPrompt });
    
    // Generate hashtags
    const allHashtags = [...new Set([
      ...themeHashtags, 
      "#UMKMIndonesia", 
      "#ProdukLokal",
      productName ? `#${productName.replace(/\s+/g, '')}` : "#ProdukBerkualitas"
    ])].slice(0, 8);

    console.log("Caption generated successfully");

    return NextResponse.json({ 
      success: true,
      caption,
      hashtags: allHashtags
    });

  } catch (error: any) {
    console.error("Generate caption error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate caption" },
      { status: 500 }
    );
  }
}
