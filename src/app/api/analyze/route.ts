import { NextRequest, NextResponse } from "next/server";
import { analyzeImage, generateProductDescription } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, productName, productDescription, theme } = body;

    console.log("Analyzing product:", productName || "Unnamed product");

    let analysis: string;

    // If image is provided, try vision analysis first
    if (image) {
      try {
        const prompt = `Kamu adalah ahli analisis produk UMKM Indonesia yang berpengalaman. Analisis foto produk ini secara detail untuk keperluan promosi.

${productName ? `Nama Produk: ${productName}` : ""}
${productDescription ? `Deskripsi dari penjual: ${productDescription}` : ""}
${theme ? `Tema konten yang diinginkan: ${theme}` : ""}

Berikan analisis komprehensif:

1. KATEGORI PRODUK - Kategori utama dan sub-kategori
2. KARAKTERISTIK VISUAL - Warna dominan, bentuk, bahan, packaging
3. KEUNGGULAN PRODUK - 3-5 keunggulan dan USP
4. TARGET MARKET - Demografis dan psikografis target
5. REKOMENDASI KONTEN - Angle promosi, mood visual, platform terbaik

Jawab dalam bahasa Indonesia yang natural dan professional.`;

        analysis = await analyzeImage({ image, prompt });
        console.log("Vision analysis completed");
      } catch (visionError: any) {
        // If vision fails, use text-based fallback
        console.log("Vision analysis failed, using text-based fallback:", visionError.message);
        
        analysis = await generateProductDescription({
          productName: productName || "Produk UMKM",
          productDescription: productDescription || "",
          theme: theme || "Menarik dan profesional"
        });
        
        // Add note about vision limitation
        analysis = `[Note: Analisis berbasis teks karena model vision tidak tersedia. Enable 'qwen-vl-max' di Alibaba Cloud untuk analisis gambar otomatis.]\n\n${analysis}`;
        console.log("Text-based analysis completed");
      }
    } else {
      // No image, use text-based generation
      analysis = await generateProductDescription({
        productName: productName || "Produk UMKM",
        productDescription: productDescription || "",
        theme: theme || "Menarik dan profesional"
      });
      console.log("Text-based analysis completed (no image provided)");
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}
