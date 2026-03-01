// AI Configuration for WarungKu
// Ganti dengan API provider pilihan lo

export const AI_CONFIG = {
  // Untuk Alibaba Cloud Qwen:
  // API_KEY: process.env.ALIBABA_CLOUD_API_KEY || "",
  // BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  
  // Model names (sesuaikan dengan provider):
  MODELS: {
    CHAT: "qwen-max",           // Untuk caption generation
    VISION: "qwen-vl-max",       // Untuk image analysis
    IMAGE_GEN: "wanx-v1",        // Untuk image generation
  }
};

// Helper untuk generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
