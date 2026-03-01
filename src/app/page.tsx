"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ImageIcon, 
  VideoIcon, 
  FileTextIcon, 
  UploadIcon, 
  SparklesIcon,
  DownloadIcon,
  CopyIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  Loader2Icon,
  Share2Icon,
  InstagramIcon,
  TwitterIcon,
  MessageCircleIcon,
  LayoutGridIcon,
  Wand2Icon,
  MoonIcon,
  LaughIcon,
  PawPrintIcon,
  UserCircleIcon,
  FlameIcon,
  SparkleIcon,
  PartyPopperIcon,
  CameraIcon,
  ShoppingCartIcon,
  ClockIcon,
  StarIcon,
  TrendingUpIcon,
  FilmIcon,
  LayersIcon,
  XIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Theme presets for different occasions
const THEME_PRESETS = [
  { id: "ramadan", name: "Ramadan", icon: MoonIcon, color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { id: "meme", name: "Meme Style", icon: LaughIcon, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
  { id: "pets", name: "Pet Products", icon: PawPrintIcon, color: "bg-pink-500/10 text-pink-600 border-pink-200" },
  { id: "avatar", name: "Brand Avatar", icon: UserCircleIcon, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { id: "viral", name: "Viral Trend", icon: FlameIcon, color: "bg-red-500/10 text-red-600 border-red-200" },
  { id: "festive", name: "Festive", icon: PartyPopperIcon, color: "bg-green-500/10 text-green-600 border-green-200" },
  { id: "minimal", name: "Minimalist", icon: SparkleIcon, color: "bg-gray-500/10 text-gray-600 border-gray-200" },
  { id: "professional", name: "Professional", icon: StarIcon, color: "bg-slate-500/10 text-slate-600 border-slate-200" },
];

// Platform presets with aspect ratios
const PLATFORM_PRESETS = [
  { id: "ig-post", name: "Instagram Post", size: "1024x1024", icon: InstagramIcon },
  { id: "ig-story", name: "Instagram Story", size: "1024x1792", icon: CameraIcon },
  { id: "tiktok", name: "TikTok", size: "1024x1792", icon: FilmIcon },
  { id: "wa-status", name: "WhatsApp Status", size: "1024x1792", icon: MessageCircleIcon },
  { id: "twitter", name: "Twitter/X", size: "1792x1024", icon: TwitterIcon },
  { id: "marketplace", name: "Marketplace", size: "1024x1024", icon: ShoppingCartIcon },
];

// Trending hashtags by category
const TRENDING_HASHTAGS: Record<string, string[]> = {
  ramadan: ["#RamadanMubarak", "#Ramadan2025", "#SahurVibes", "#BukaPuasa", "#RamadanKareem", "#BlessedRamadan"],
  meme: ["#RelatableContent", "#ViralIndo", "#FYP", "#ForYou", "#LelahJadiManusia", "#DailyMeme"],
  pets: ["#PetLovers", "#DogsOfInstagram", "#CatsOfInstagram", "#PetShop", "#HewanPeliharaan", "#FurBaby"],
  viral: ["#ViralIndonesia", "#FYP", "#TrendingNow", "#HotTopic", "#MustTry", "#Recommended"],
  festive: ["#HariRaya", "#Lebaran", "#IdulFitri", "#Celebration", "#SpecialDay", "#FestiveVibes"],
  default: ["#UMKMIndonesia", "#ProdukLokal", "#BelanjaLokal", "#SupportLokal", "#MadeInIndonesia", "#BanggaLokal"],
};

type ContentType = "image" | "caption" | "carousel";
type Status = "idle" | "uploading" | "analyzing" | "generating" | "completed" | "error";

interface GeneratedContent {
  type: ContentType;
  image?: string;
  caption?: string;
  carousel?: string[];
  productAnalysis?: string;
  hashtags?: string[];
}

interface HistoryItem {
  id: string;
  timestamp: Date;
  productName: string;
  theme: string;
  contentType: ContentType;
  thumbnail: string;
  content: GeneratedContent;
}

export default function WarungKuPage() {
  // Core state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [contentType, setContentType] = useState<ContentType>("image");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Enhanced features state
  const [selectedTheme, setSelectedTheme] = useState<string>("minimal");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ig-post");
  const [carouselCount, setCarouselCount] = useState(3);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("generate");
  
  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchPreviews, setBatchPreviews] = useState<string[]>([]);
  const [batchResults, setBatchResults] = useState<GeneratedContent[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("warungku-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: HistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save to history (without storing full image data to avoid quota exceeded)
  const saveToHistory = (content: GeneratedContent, thumbnail: string) => {
    const slimContent: GeneratedContent = {
      type: content.type,
      productAnalysis: content.productAnalysis,
      hashtags: content.hashtags,
      caption: content.caption,
      image: content.image ? "generated" : undefined,
      carousel: content.carousel ? ["generated"] : undefined
    };
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date(),
      productName: productName || "Produk UMKM",
      theme: selectedTheme,
      contentType,
      thumbnail,
      content: slimContent
    };
    
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    
    try {
      localStorage.setItem("warungku-history", JSON.stringify(newHistory));
    } catch (e) {
      console.warn("Failed to save history - storage full");
      localStorage.removeItem("warungku-history");
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "File tidak valid",
        description: "Mohon upload file gambar (JPG, PNG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: "Ukuran file maksimal 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setGeneratedContent(null);
    setStatus("idle");
    setGeneratedHashtags([]);
  }, []);

  const handleBatchFileSelect = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const previews: string[] = [];
    
    Array.from(files).slice(0, 5).forEach(file => {
      if (file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024) {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }
    });
    
    if (validFiles.length > 0) {
      setBatchFiles(validFiles);
      setBatchPreviews(previews);
      setBatchResults([]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (files.length > 1) {
      handleBatchFileSelect(files);
    } else if (files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, handleBatchFileSelect]);

  const generateContent = async () => {
    if (!selectedFile || !previewUrl) {
      toast({
        title: "Upload foto dulu",
        description: "Pilih foto produk yang ingin dipromosikan",
        variant: "destructive"
      });
      return;
    }

    setStatus("uploading");
    setProgress(10);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });
      const base64Image = await base64Promise;

      setStatus("analyzing");
      setProgress(20);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          productName,
          productDescription,
          theme: selectedTheme
        })
      });

      const analyzeData = await analyzeRes.json();
      
      if (!analyzeRes.ok || !analyzeData.success) {
        throw new Error(analyzeData.error || "Gagal menganalisis gambar");
      }
      
      setProgress(40);
      setStatus("generating");
      setProgress(50);

      const platform = PLATFORM_PRESETS.find(p => p.id === selectedPlatform);
      const imageSize = platform?.size || "1024x1024";

      let result: GeneratedContent = {
        type: contentType,
        productAnalysis: analyzeData.analysis
      };

      if (contentType === "image") {
        const imageRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productAnalysis: analyzeData.analysis,
            productName: productName || "Produk UMKM",
            productDescription,
            theme: selectedTheme,
            platform: selectedPlatform,
            size: imageSize
          })
        });

        const imageData = await imageRes.json();
        
        if (!imageRes.ok || !imageData.success) {
          throw new Error(imageData.error || "Gagal generate gambar");
        }
        
        result.image = imageData.imageUrl;
        setProgress(90);

      } else if (contentType === "caption") {
        const captionRes = await fetch("/api/generate-caption", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productAnalysis: analyzeData.analysis,
            productName: productName || "Produk UMKM",
            productDescription,
            theme: selectedTheme,
            platform: selectedPlatform
          })
        });

        const captionData = await captionRes.json();
        
        if (!captionRes.ok || !captionData.success) {
          throw new Error(captionData.error || "Gagal generate caption");
        }
        
        result.caption = captionData.caption;
        result.hashtags = captionData.hashtags;
        setGeneratedHashtags(captionData.hashtags || []);
        setProgress(90);

      } else if (contentType === "carousel") {
        const carouselRes = await fetch("/api/generate-carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            productAnalysis: analyzeData.analysis,
            productName: productName || "Produk UMKM",
            productDescription,
            theme: selectedTheme,
            count: carouselCount
          })
        });

        const carouselData = await carouselRes.json();
        
        if (!carouselRes.ok || !carouselData.success) {
          throw new Error(carouselData.error || "Gagal generate carousel");
        }
        
        result.carousel = carouselData.images;
        setProgress(90);
      }

      setProgress(100);
      setStatus("completed");
      setGeneratedContent(result);
      saveToHistory(result, previewUrl);

      toast({
        title: "Berhasil!",
        description: `Konten promosi ${THEME_PRESETS.find(t => t.id === selectedTheme)?.name} berhasil dibuat`
      });

    } catch (error) {
      console.error("Generate error:", error);
      setStatus("error");
      toast({
        title: "Terjadi kesalahan",
        description: error instanceof Error ? error.message : "Gagal generate konten",
        variant: "destructive"
      });
    }
  };

  const generateBatch = async () => {
    if (batchFiles.length === 0) return;

    setStatus("generating");
    setProgress(0);
    const results: GeneratedContent[] = [];

    for (let i = 0; i < batchFiles.length; i++) {
      try {
        setProgress((i / batchFiles.length) * 100);
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(batchFiles[i]);
        });
        const base64Image = await base64Promise;

        const imageRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productAnalysis: `Batch product ${i + 1}`,
            productName: productName || `Produk ${i + 1}`,
            theme: selectedTheme,
            platform: selectedPlatform
          })
        });

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          results.push({ type: "image", image: imageData.imageUrl });
        }
      } catch (e) {
        console.error(`Failed to generate image ${i + 1}`);
      }
    }

    setBatchResults(results);
    setStatus("completed");
    setProgress(100);
    
    toast({
      title: "Batch selesai!",
      description: `${results.length} konten berhasil dibuat`
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: "Konten berhasil disalin ke clipboard"
    });
  };

  const copyHashtags = () => {
    const hashtagText = generatedHashtags.join(" ");
    navigator.clipboard.writeText(hashtagText);
    toast({
      title: "Hashtag disalin!",
      description: `${generatedHashtags.length} hashtag berhasil disalin`
    });
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    if (generatedContent.image) {
      const link = document.createElement("a");
      link.href = generatedContent.image;
      link.download = `warungku-${selectedTheme}-${Date.now()}.png`;
      link.click();
    }
  };

  const downloadAllCarousel = () => {
    if (!generatedContent?.carousel) return;
    generatedContent.carousel.forEach((img, i) => {
      const link = document.createElement("a");
      link.href = img;
      link.download = `carousel-${i + 1}-${Date.now()}.png`;
      link.click();
    });
  };

  const shareToSocial = (platform: string) => {
    const text = generatedContent?.caption || `${productName} - Dibuat dengan WarungKu`;
    const url = window.location.href;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
    
    setShowShareDialog(false);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProductName("");
    setProductDescription("");
    setGeneratedContent(null);
    setStatus("idle");
    setProgress(0);
    setGeneratedHashtags([]);
  };

  const resetBatch = () => {
    setBatchFiles([]);
    setBatchPreviews([]);
    setBatchResults([]);
    setStatus("idle");
    setProgress(0);
  };

  const getThemeColor = () => {
    return THEME_PRESETS.find(t => t.id === selectedTheme)?.color || "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">WarungKu</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
              className="gap-1.5 sm:gap-2 h-8 sm:h-9"
            >
              <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Riwayat</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-xs sm:max-w-md mx-auto h-9 sm:h-10">
            <TabsTrigger value="generate" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Wand2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Generate</span>
              <span className="xs:hidden">Buat</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <LayersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Batch Mode</span>
              <span className="xs:hidden">Batch</span>
            </TabsTrigger>
          </TabsList>

          {/* Single Generate Tab */}
          <TabsContent value="generate" className="space-y-4 sm:space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Panel - Input */}
              <div className="space-y-4 sm:space-y-5 order-1">
                {/* Theme Selection */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Pilih Tema Konten</Label>
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 sm:pb-2 -mx-0.5 px-0.5 snap-x snap-mandatory">
                    {THEME_PRESETS.map((theme) => (
                      <Button
                        key={theme.id}
                        variant={selectedTheme === theme.id ? "default" : "outline"}
                        size="sm"
                        className={`gap-1 sm:gap-1.5 shrink-0 snap-start text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-2.5 ${selectedTheme === theme.id ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <theme.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="whitespace-nowrap">{theme.name.split(' ')[0]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Platform Target</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                      <SelectValue placeholder="Pilih platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_PRESETS.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id} className="text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <platform.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{platform.name}</span>
                            <Badge variant="secondary" className="ml-auto text-[10px] sm:text-xs">{platform.size}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Upload Section */}
                <Card className={`border-2 transition-colors overflow-hidden ${isDragOver ? "border-primary" : "border-dashed"}`}>
                  <CardContent className="p-0">
                    {previewUrl ? (
                      <div className="relative aspect-[4/3] sm:aspect-square">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-end">
                          <Badge className={`${getThemeColor()} border text-[10px] sm:text-xs`}>
                            {THEME_PRESETS.find(t => t.id === selectedTheme)?.name}
                          </Badge>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={resetAll}
                            className="h-7 sm:h-8 text-xs"
                          >
                            Ganti
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`aspect-[4/3] sm:aspect-square flex flex-col items-center justify-center gap-2 sm:gap-4 p-4 sm:p-8 cursor-pointer transition-colors ${
                          isDragOver ? "bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => document.getElementById("file-input")?.click()}
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                          <UploadIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <div className="text-center px-2">
                          <p className="font-medium text-foreground text-sm sm:text-base">
                            Drop foto produk
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                            atau klik untuk pilih
                          </p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          JPG, PNG, WEBP (max 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleInputChange}
                    />
                  </CardContent>
                </Card>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="product-name" className="text-xs sm:text-sm">Nama Produk</Label>
                    <Input
                      id="product-name"
                      placeholder="Contoh: Batik Tulis Madura"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="h-9 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="product-desc" className="text-xs sm:text-sm">Deskripsi Produk</Label>
                    <Textarea
                      id="product-desc"
                      placeholder="Jelaskan keunggulan produk..."
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={2}
                      className="min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Content Type Selection */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Jenis Konten</Label>
                  <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                    <TabsList className="grid grid-cols-3 w-full h-9 sm:h-10">
                      <TabsTrigger value="image" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Gambar</span>
                      </TabsTrigger>
                      <TabsTrigger value="caption" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
                        <FileTextIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Caption</span>
                      </TabsTrigger>
                      <TabsTrigger value="carousel" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
                        <LayoutGridIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Carousel</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Carousel Options */}
                {contentType === "carousel" && (
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                    <Label className="text-xs sm:text-sm">Jumlah Slide</Label>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={() => setCarouselCount(Math.max(2, carouselCount - 1))}
                      >
                        -
                      </Button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm">{carouselCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        onClick={() => setCarouselCount(Math.min(5, carouselCount + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium shadow-lg shadow-primary/20"
                  onClick={generateContent}
                  disabled={!selectedFile || (status !== "idle" && status !== "completed" && status !== "error")}
                >
                  {status === "idle" && (
                    <>
                      <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Generate Konten Promosi</span>
                      <span className="sm:hidden">Generate</span>
                    </>
                  )}
                  {status === "completed" && (
                    <>
                      <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Generate Ulang
                    </>
                  )}
                  {status === "error" && (
                    <>
                      <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Coba Lagi
                    </>
                  )}
                  {(status === "uploading" || status === "analyzing" || status === "generating") && (
                    <>
                      <Loader2Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">
                        {status === "uploading" && "Upload..."}
                        {status === "analyzing" && "Analisis..."}
                        {status === "generating" && "Buat..."}
                      </span>
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {(status === "uploading" || status === "analyzing" || status === "generating") && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                      {`${Math.round(progress)}% selesai`}
                    </p>
                    <div className="space-y-1.5 animate-pulse">
                      <div className="h-20 sm:h-28 bg-muted rounded-lg" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Output */}
              <div className="space-y-4 sm:space-y-5 order-2">
                <Card className="min-h-[350px] sm:min-h-[500px]">
                  <CardContent className="p-3 sm:p-5">
                    {!generatedContent ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16">
                        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center mb-3 sm:mb-4">
                          {contentType === "image" && <ImageIcon className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />}
                          {contentType === "caption" && <FileTextIcon className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />}
                          {contentType === "carousel" && <LayoutGridIcon className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />}
                        </div>
                        <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Hasil Konten</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-[200px] sm:max-w-xs">
                          Upload foto dan klik Generate
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {/* Product Analysis */}
                        {generatedContent.productAnalysis && (
                          <div className="p-2.5 sm:p-4 bg-muted/50 rounded-lg">
                            <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                              <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                              Analisis
                            </p>
                            <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                              {generatedContent.productAnalysis}
                            </p>
                          </div>
                        )}

                        {/* Image Result */}
                        {generatedContent.image && (
                          <div className="space-y-3">
                            <div className="relative group">
                              <img 
                                src={generatedContent.image} 
                                alt="Generated" 
                                className="w-full rounded-lg shadow-lg"
                              />
                              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold shadow-lg">
                                PROMO
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              <Button 
                                variant="outline" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={downloadContent}
                              >
                                <DownloadIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">Download</span>
                                <span className="sm:hidden">DL</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={() => setShowShareDialog(true)}
                              >
                                <Share2Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Share
                              </Button>
                              <Button 
                                variant="default" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={resetAll}
                              >
                                <RefreshCwIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Baru
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Caption Result */}
                        {generatedContent.caption && (
                          <div className="space-y-3">
                            <div className="p-2.5 sm:p-4 bg-muted/50 rounded-lg min-h-[120px] sm:min-h-[180px]">
                              <p className="text-[11px] sm:text-sm whitespace-pre-wrap leading-relaxed">
                                {generatedContent.caption}
                              </p>
                            </div>
                            
                            {generatedHashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                {generatedHashtags.slice(0, 4).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {generatedHashtags.length > 4 && (
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                                    +{generatedHashtags.length - 4}
                                  </Badge>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={copyHashtags}
                                  className="h-5 sm:h-6 text-[10px] sm:text-xs px-1.5"
                                >
                                  <CopyIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                                  Salin
                                </Button>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              <Button 
                                variant="outline" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={() => copyToClipboard(generatedContent.caption!)}
                              >
                                <CopyIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Caption
                              </Button>
                              <Button 
                                variant="outline" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={() => copyToClipboard(`${generatedContent.caption}\n\n${generatedHashtags.join(" ")}`)}
                              >
                                <CopyIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Semua
                              </Button>
                              <Button 
                                variant="default" 
                                className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-8 sm:h-9"
                                onClick={resetAll}
                              >
                                <RefreshCwIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Baru
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Carousel Result */}
                        {generatedContent.carousel && generatedContent.carousel.length > 0 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                              {generatedContent.carousel.map((img, i) => (
                                <img 
                                  key={i}
                                  src={img} 
                                  alt={`Slide ${i + 1}`}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                              <Button 
                                variant="outline" 
                                className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                                onClick={downloadAllCarousel}
                              >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
                                onClick={() => { setGeneratedContent(null); setStatus("idle"); }}
                              >
                                <RefreshCwIcon className="w-3.5 h-3.5" />
                                Ulang
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Success Badge */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                          <CheckCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                          <span className="text-[11px] sm:text-sm text-muted-foreground">
                            Berhasil dibuat
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trending Hashtags */}
                <Card>
                  <CardContent className="p-2.5 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <Label className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                        <TrendingUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Trending
                      </Label>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">Live</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {(TRENDING_HASHTAGS[selectedTheme] || TRENDING_HASHTAGS.default).slice(0, 5).map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] sm:text-xs"
                          onClick={() => copyToClipboard(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Batch Mode Tab */}
          <TabsContent value="batch" className="space-y-4 sm:space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Batch Input */}
              <div className="space-y-4 sm:space-y-5 order-1">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-0">
                    {batchPreviews.length > 0 ? (
                      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {batchPreviews.map((preview, i) => (
                            <div key={i} className="relative aspect-square">
                              <img 
                                src={preview} 
                                alt={`Batch ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 p-0"
                                onClick={() => {
                                  const newFiles = batchFiles.filter((_, idx) => idx !== i);
                                  const newPreviews = batchPreviews.filter((_, idx) => idx !== i);
                                  setBatchFiles(newFiles);
                                  setBatchPreviews(newPreviews);
                                }}
                              >
                                <XIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9" onClick={resetBatch}>
                          Reset
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="aspect-[4/3] sm:aspect-video flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById("batch-input")?.click()}
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center">
                          <LayersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm sm:text-base">Upload Multiple Foto</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Maksimal 5 foto
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      id="batch-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleBatchFileSelect(e.target.files)}
                    />
                  </CardContent>
                </Card>

                {/* Batch Options */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Tema</Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {THEME_PRESETS.map((theme) => (
                          <SelectItem key={theme.id} value={theme.id} className="text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <theme.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {theme.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_PRESETS.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id} className="text-xs sm:text-sm">
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  onClick={generateBatch}
                  disabled={batchFiles.length === 0 || (status !== "idle" && status !== "completed" && status !== "error")}
                >
                  {status === "idle" && (
                    <>
                      <LayersIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Generate {batchFiles.length} Konten
                    </>
                  )}
                  {status === "completed" && (
                    <>
                      <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Ulang
                    </>
                  )}
                  {status === "error" && (
                    <>
                      <RefreshCwIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      Coba Lagi
                    </>
                  )}
                  {(status === "uploading" || status === "analyzing" || status === "generating") && (
                    <>
                      <Loader2Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
                      Processing...
                    </>
                  )}
                </Button>

                {(status === "uploading" || status === "analyzing" || status === "generating") && (
                  <Progress value={progress} className="h-1.5" />
                )}
              </div>

              {/* Batch Output */}
              <div className="order-2">
                <Card className="min-h-[300px] sm:min-h-[400px]">
                  <CardContent className="p-3 sm:p-5">
                    {batchResults.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 sm:py-16">
                        <LayersIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Hasil batch di sini</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        {batchResults.map((result, i) => (
                          <div key={i} className="space-y-1.5 sm:space-y-2">
                            {result.image && (
                              <img 
                                src={result.image} 
                                alt={`Result ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                            )}
                            <Button variant="outline" size="sm" className="w-full gap-1 text-[10px] sm:text-xs h-7 sm:h-8">
                              <DownloadIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-[11px] sm:text-sm text-muted-foreground text-center sm:text-left">
              WarungKu - Generator Konten UMKM Indonesia
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {THEME_PRESETS.slice(0, 4).map((theme) => (
                <theme.icon key={theme.id} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md w-[calc(100%-32px)] max-w-[calc(100%-32px)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Bagikan ke Social Media</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4">
            <Button 
              variant="outline" 
              className="flex flex-col gap-1.5 sm:gap-2 h-auto py-3 sm:py-4"
              onClick={() => shareToSocial("twitter")}
            >
              <TwitterIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">Twitter</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col gap-1.5 sm:gap-2 h-auto py-3 sm:py-4"
              onClick={() => shareToSocial("whatsapp")}
            >
              <MessageCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">WhatsApp</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col gap-1.5 sm:gap-2 h-auto py-3 sm:py-4"
              onClick={() => copyToClipboard(window.location.href)}
            >
              <CopyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">Copy</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-2xl w-[calc(100%-32px)] max-w-[calc(100%-32px)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Riwayat Konten</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] sm:h-[400px]">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <ClockIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-muted-foreground">Belum ada riwayat</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 p-1 sm:p-2">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                    <img 
                      src={item.thumbnail} 
                      alt={item.productName}
                      className="w-full aspect-square object-cover"
                    />
                    <CardContent className="p-2 sm:p-3">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.productName}</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {THEME_PRESETS.find(t => t.id === item.theme)?.name}
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}