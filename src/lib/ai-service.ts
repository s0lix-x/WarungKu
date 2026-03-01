// AI Service - Alibaba Cloud DashScope (Qwen)
// Region: Singapore (International)

import OpenAI from "openai";

// Initialize client for Alibaba Cloud DashScope (OpenAI compatible)
const getClient = () => {
  return new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  });
};

// Vision Chat - untuk analisis gambar (menggunakan OpenAI compatible API)
export async function analyzeImage(params: {
  image: string;
  prompt: string;
}): Promise<string> {
  const client = getClient();

  // Try different vision models in order
  const visionModels = [
    "qwen-vl-max",
    "qwen-vl-plus", 
    "qwen3-vl-plus",
    "qwen3-vl-flash"
  ];

  for (const model of visionModels) {
    try {
      console.log(`Trying vision model: ${model}...`);

      const response = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: params.prompt },
              { type: "image_url", image_url: { url: params.image } }
            ]
          }
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log(`Image analysis completed with model: ${model}`);
        return content;
      }
    } catch (error: any) {
      console.log(`Model ${model} failed: ${error.message}`);
      continue;
    }
  }

  throw new Error("Model vision tidak tersedia. Silakan enable 'qwen-vl-max' di Alibaba Cloud Model Studio.");
}

// Chat Completion - untuk generate caption
export async function generateText(params: {
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const client = getClient();

  const chatModels = [
    "qwen3.5-plus",
    "qwen3.5-flash",
    "qwen-plus",
    "qwen-turbo"
  ];

  for (const model of chatModels) {
    try {
      console.log(`Trying chat model: ${model}...`);

      const response = await client.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt }
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        console.log(`Text generation completed with model: ${model}`);
        return content;
      }
    } catch (error: any) {
      console.log(`Model ${model} failed: ${error.message}`);
      continue;
    }
  }

  throw new Error("Tidak ada model chat yang tersedia.");
}

// Generate product description without vision (fallback)
export async function generateProductDescription(params: {
  productName: string;
  productDescription: string;
  theme: string;
}): Promise<string> {
  const systemPrompt = `Kamu adalah ahli analisis produk UMKM Indonesia yang berpengalaman.`;
  
  const userPrompt = `Buatkan analisis produk untuk keperluan promosi:

Nama Produk: ${params.productName || "Produk UMKM"}
Deskripsi dari penjual: ${params.productDescription || "Tidak ada deskripsi"}
Tema konten yang diinginkan: ${params.theme || "Menarik dan profesional"}

Berikan analisis komprehensif:

1. KATEGORI PRODUK - Kategori utama dan sub-kategori
2. KARAKTERISTIK VISUAL - Berdasarkan deskripsi produk
3. KEUNGGULAN PRODUK - 3-5 keunggulan dan USP
4. TARGET MARKET - Demografis dan psikografis target
5. REKOMENDASI KONTEN - Angle promosi, mood visual, platform terbaik

Jawab dalam bahasa Indonesia yang natural dan professional.`;

  return generateText({ systemPrompt, userPrompt });
}

// Image Generation - menggunakan Qwen-Image dengan Synchronous API
export async function generateImage(params: {
  prompt: string;
  size?: string;
  retryCount?: number;
}): Promise<string> {
  const maxRetries = params.retryCount ?? 2;
  let lastError: Error | null = null;
  
  // Try different models in order
  const models = ["qwen-image-max", "wanx-v1", "qwen-image-plus"];
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const model = models[Math.min(attempt, models.length - 1)];
    
    try {
      console.log(`Generating image with ${model} (attempt ${attempt + 1})...`);

      // Qwen-Image Synchronous API for Singapore
      const response = await fetch(
        "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            input: {
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      text: params.prompt
                    }
                  ]
                }
              ]
            },
            parameters: {
              negative_prompt: "low resolution, low quality, deformed, blurry, distorted, ugly, bad anatomy, watermark, signature, text overlay, oversaturated",
              prompt_extend: true,
              watermark: false,
              size: params.size || "1024*1024"
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Image API error (attempt ${attempt + 1}):`, errorText);
        
        // If rate limited or server error, retry
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`Image API error: ${response.status}`);
          if (attempt < maxRetries) {
            console.log(`Retrying in ${(attempt + 1) * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
            continue;
          }
        }
        throw new Error(`Image API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Image API response structure:", JSON.stringify(result, null, 2).substring(0, 500));
      
      // Extract image URL from response
      // Response format: output.choices[0].message.content[0].image
      const imageUrl = result.output?.choices?.[0]?.message?.content?.[0]?.image;
      
      if (!imageUrl) {
        console.error("No image URL in response:", JSON.stringify(result, null, 2));
        throw new Error("No image URL returned from API");
      }

      console.log("Image generated, downloading from URL...");
      
      // Download the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      
      const buffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      
      console.log("Image downloaded successfully, size:", buffer.byteLength, "bytes");
      return `data:image/png;base64,${base64}`;
      
    } catch (error: any) {
      console.error(`Image generation error (attempt ${attempt + 1}):`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${(attempt + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }
  }
  
  throw new Error(`Gagal generate gambar: ${lastError?.message}`);
}
