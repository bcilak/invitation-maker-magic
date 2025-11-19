import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Eye, Image as ImageIcon, Loader2 } from "lucide-react";

interface EventPoster {
    id: string;
    poster_url: string;
    poster_name: string;
    is_active: boolean;
    uploaded_at: string;
}

interface PosterManagerProps {
    eventId: string;
    currentPosterUrl?: string | null;
}

export const PosterManager = ({ eventId, currentPosterUrl }: PosterManagerProps) => {
    const [posters, setPosters] = useState<EventPoster[]>([]);
    const [posterUrl, setPosterUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (currentPosterUrl) {
            setPosterUrl(currentPosterUrl);
            setPreviewUrl(currentPosterUrl);
            setPosters([{
                id: eventId,
                poster_url: currentPosterUrl,
                poster_name: "event-poster",
                is_active: true,
                uploaded_at: new Date().toISOString(),
            }]);
        } else {
            setPosterUrl("");
            setPreviewUrl("");
            setPosters([]);
        }
    }, [eventId, currentPosterUrl]);

    useEffect(() => {
        // Cleanup preview URL when component unmounts
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Hata",
                description: "Lütfen bir görsel dosyası seçin (JPG, PNG, vb.)",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Hata",
                description: "Dosya boyutu 5MB'dan küçük olmalıdır.",
                variant: "destructive",
            });
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
    };

    const handleUploadPoster = async () => {
        if (!selectedFile) {
            toast({
                title: "Hata",
                description: "Lütfen bir dosya seçin.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            // Generate unique file name
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${eventId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('event-posters')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Storage upload error:", uploadError);
                throw new Error(uploadError.message);
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('event-posters')
                .getPublicUrl(filePath);

            // Update event in database with new poster URL
            const { error: updateError } = await supabase
                .from("events")
                .update({ poster_url: publicUrl })
                .eq("id", eventId);

            if (updateError) {
                // Rollback: delete uploaded file
                await supabase.storage.from('event-posters').remove([filePath]);
                throw updateError;
            }

            const posterData = {
                id: eventId,
                poster_url: publicUrl,
                poster_name: selectedFile.name,
                is_active: true,
                uploaded_at: new Date().toISOString(),
            };

            // Update localStorage for immediate display
            localStorage.setItem("event_poster", JSON.stringify(posterData));

            // Dispatch event to update other components
            window.dispatchEvent(
                new CustomEvent("poster_updated", { detail: posterData })
            );

            setPosters([posterData as EventPoster]);
            setPosterUrl(publicUrl);

            toast({
                title: "Başarılı! 🎉",
                description: "Etkinlik afişi CDN'e yüklendi.",
            });

        } catch (error: any) {
            console.error("Error uploading poster:", error);
            toast({
                title: "Hata",
                description: error.message || "Afiş yüklenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePoster = async () => {
        try {
            if (!activePoster?.poster_url) return;

            // Extract file path from URL
            const urlParts = activePoster.poster_url.split('/event-posters/');
            if (urlParts.length > 1) {
                const filePath = urlParts[1];

                // Delete from Supabase Storage
                const { error: storageError } = await supabase.storage
                    .from('event-posters')
                    .remove([filePath]);

                if (storageError) {
                    console.warn("Storage deletion warning:", storageError);
                    // Continue even if storage deletion fails
                }
            }

            // Remove from database
            const { error } = await supabase
                .from("events")
                .update({ poster_url: null })
                .eq("id", eventId);

            if (error) throw error;

            localStorage.removeItem("event_poster");
            window.dispatchEvent(new CustomEvent("poster_updated", { detail: null }));

            setPosters([]);
            setPosterUrl("");
            setPreviewUrl("");
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            toast({
                title: "Başarılı!",
                description: "Etkinlik afişi kaldırıldı.",
            });
        } catch (error) {
            console.error("Error removing poster:", error);
            toast({
                title: "Hata",
                description: "Afiş kaldırılırken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const activePoster = posters.find((p) => p.is_active);

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6" />
                        Etkinlik Afişi Yönetimi
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Ana sayfanın en üstünde görünecek etkinlik afişini bilgisayarınızdan yükleyin.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="posterFile">Afiş Dosyası</Label>
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                id="posterFile"
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer border border-input rounded-md"
                            />
                            <Button
                                onClick={handleUploadPoster}
                                disabled={isSaving || !selectedFile}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Yükleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Yükle
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            💡 JPG, PNG veya WebP formatında, maksimum 5MB boyutunda dosya yükleyebilirsiniz.
                            Önerilen boyut: 800x1200px veya 2:3 oran. Görsel CDN'de güvenli bir şekilde saklanır.
                        </p>
                    </div>

                    {(previewUrl || activePoster) && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <Label>
                                    {selectedFile && !activePoster ? "Önizleme" : "Mevcut Afiş"}
                                </Label>
                                {activePoster && (
                                    <Button
                                        onClick={handleRemovePoster}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Afişi Kaldır
                                    </Button>
                                )}
                            </div>

                            <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
                                <div className="flex justify-center">
                                    <img
                                        src={previewUrl || activePoster?.poster_url}
                                        alt="Event Poster Preview"
                                        className="max-w-md w-full rounded-lg shadow-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://placehold.co/800x1200/667eea/white?text=Afiş+Yüklenemedi";
                                        }}
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {activePoster
                                            ? `📅 Yükleme: ${new Date(activePoster.uploaded_at).toLocaleString("tr-TR")}`
                                            : selectedFile ? `Seçili dosya: ${selectedFile.name}` : ""
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!activePoster && !previewUrl && !isLoading && (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                Henüz afiş eklenmemiş. Yukarıdan bir dosya seçerek başlayın.
                            </p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Afişler yükleniyor...</p>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                    💡 Afiş Yükleme İpuçları
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 ml-4 list-decimal">
                    <li>
                        <strong>Canva</strong> veya <strong>Figma</strong> gibi araçlarla
                        afişinizi tasarlayın
                    </li>
                    <li>800x1200px veya 2:3 oran kullanın (dikey format)</li>
                    <li>Görseli direkt bu sayfadan yükleyin - Supabase CDN otomatik kullanılır</li>
                    <li>Yüklenen görseller Supabase Storage'da güvenle saklanır</li>
                    <li>CDN sayesinde görsel hızlı yüklenir ve bant genişliği tasarrufu sağlar</li>
                </ol>
            </Card>
        </div>
    );
};
