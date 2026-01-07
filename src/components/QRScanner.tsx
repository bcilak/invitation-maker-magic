import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckInService, CheckInData } from "@/lib/checkInService";
import {
    Camera,
    CameraOff,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Clock,
    LogIn,
    LogOut,
    UserCheck,
} from "lucide-react";

interface QRScannerProps {
    eventId: string;
    mode: "check-in" | "check-out";
}

export const QRScanner = ({ eventId, mode }: QRScannerProps) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [staffName, setStaffName] = useState("");
    const [lastScannedData, setLastScannedData] = useState<CheckInData | null>(null);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Load staff name from localStorage
        const savedStaffName = localStorage.getItem("staff_name");
        if (savedStaffName) {
            setStaffName(savedStaffName);
        }

        return () => {
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        if (!staffName.trim()) {
            toast({
                title: "Uyarı",
                description: "Lütfen personel adınızı girin",
                variant: "destructive",
            });
            return;
        }

        localStorage.setItem("staff_name", staffName);

        try {
            console.log("Requesting camera access...");

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
            });

            console.log("Camera access granted");
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                console.log("Video playing");
                setIsScanning(true);
                requestAnimationFrame(scanFrame);

                toast({
                    title: "Kamera Başlatıldı",
                    description: "QR kod okumaya hazır",
                });
            }
        } catch (err: any) {
            console.error("Camera error:", err);
            toast({
                title: "Kamera Hatası",
                description: err.message || "Kamera erişimi reddedildi",
                variant: "destructive",
            });
        }
    };

    const stopScanning = () => {
        console.log("Stopping camera...");

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsScanning(false);
    };

    const scanFrame = () => {
        if (!isScanning || !videoRef.current || !canvasRef.current || isProcessing) {
            if (isScanning && !isProcessing) {
                animationRef.current = requestAnimationFrame(scanFrame);
            }
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
            console.log("QR Code detected:", code.data);
            setIsProcessing(true);
            handleQRCode(code.data);
        } else {
            animationRef.current = requestAnimationFrame(scanFrame);
        }
    };

    const handleQRCode = async (qrData: string) => {
        try {
            console.log("Raw QR Data:", qrData);
            const parsedData: CheckInData = JSON.parse(qrData);
            console.log("Parsed QR Data:", parsedData);
            console.log("Expected Event ID:", eventId);
            console.log("QR Event ID:", parsedData.eventId);

            setLastScannedData(parsedData);

            if (parsedData.eventId !== eventId) {
                setScanResult({
                    success: false,
                    message: "Bu QR kod farklı bir etkinliğe ait!",
                });
                toast({
                    title: "Hatalı QR Kod",
                    description: `Bu QR kod bu etkinlik için geçerli değil. Beklenen: ${eventId}, Gelen: ${parsedData.eventId}`,
                    variant: "destructive",
                });
                setTimeout(() => {
                    setScanResult(null);
                    setIsProcessing(false);
                    animationRef.current = requestAnimationFrame(scanFrame);
                }, 3000);
                return;
            }

            let result;
            if (mode === "check-in") {
                result = await CheckInService.processCheckIn(qrData, staffName);
            } else {
                result = await CheckInService.processCheckOut(qrData, staffName);
            }

            if (result.success) {
                setScanResult({
                    success: true,
                    message: `${mode === "check-in" ? "Giriş" : "Çıkış"} başarılı!`,
                });
                toast({
                    title: "Başarılı",
                    description: `${parsedData.fullName} - ${mode === "check-in" ? "Giriş" : "Çıkış"} kaydedildi`,
                });
            } else {
                setScanResult({
                    success: false,
                    message: result.error || "İşlem başarısız",
                });
                toast({
                    title: "Hata",
                    description: result.error,
                    variant: "destructive",
                });
            }

            setTimeout(() => {
                setScanResult(null);
                setIsProcessing(false);
                animationRef.current = requestAnimationFrame(scanFrame);
            }, 3000);
        } catch (err) {
            console.error("QR processing error:", err);
            setScanResult({
                success: false,
                message: "Geçersiz QR kod formatı",
            });
            toast({
                title: "Hata",
                description: "QR kod okunamadı",
                variant: "destructive",
            });
            setTimeout(() => {
                setScanResult(null);
                setIsProcessing(false);
                animationRef.current = requestAnimationFrame(scanFrame);
            }, 3000);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {mode === "check-in" ? (
                                <LogIn className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                            ) : (
                                <LogOut className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                            )}
                            <h2 className="text-lg md:text-2xl font-bold">
                                {mode === "check-in" ? "Giriş" : "Çıkış"} Okuyucu
                            </h2>
                        </div>
                        <Badge variant={isScanning ? "default" : "secondary"}>
                            {isScanning ? "Aktif" : "Pasif"}
                        </Badge>
                    </div>

                    <div>
                        <Label htmlFor={`staffName-${mode}`}>Personel Adı</Label>
                        <Input
                            id={`staffName-${mode}`}
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            placeholder="Adınızı girin"
                            disabled={isScanning}
                        />
                    </div>

                    <div className="flex gap-2">
                        {!isScanning ? (
                            <Button onClick={startScanning} className="flex-1" size="lg">
                                <Camera className="w-5 h-5 mr-2" />
                                Taramayı Başlat
                            </Button>
                        ) : (
                            <Button
                                onClick={stopScanning}
                                variant="destructive"
                                className="flex-1"
                                size="lg"
                            >
                                <CameraOff className="w-5 h-5 mr-2" />
                                Taramayı Durdur
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Scanner View */}
            <Card className="p-4 md:p-6">
                <div className="relative">
                    <video
                        ref={videoRef}
                        className={`w-full rounded-lg ${isScanning ? "block" : "hidden"}`}
                        playsInline
                        muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {!isScanning && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Camera className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-sm md:text-base">QR kod okuyucu hazır</p>
                            <p className="text-xs md:text-sm">Taramayı başlatmak için yukarıdaki butona tıklayın</p>
                        </div>
                    )}

                    {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 md:w-64 md:h-64 border-4 border-green-500 rounded-lg shadow-lg">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Scan Result */}
            {scanResult && (
                <Card
                    className={`p-4 md:p-6 border-2 ${
                        scanResult.success
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                    }`}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                        {scanResult.success ? (
                            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-green-600 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <h3
                                className={`text-lg md:text-xl font-bold ${
                                    scanResult.success ? "text-green-800" : "text-red-800"
                                }`}
                            >
                                {scanResult.message}
                            </h3>
                            {lastScannedData && (
                                <div className="mt-2 space-y-1 text-xs md:text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="truncate">{lastScannedData.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span className="truncate">{lastScannedData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                        <span>
                                            {new Date().toLocaleString("tr-TR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Instructions */}
            <Card className="p-4 md:p-6 bg-blue-50 border-blue-200">
                <h3 className="text-sm md:text-base font-bold mb-2 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    Kullanım Talimatları
                </h3>
                <ul className="text-xs md:text-sm space-y-1 text-blue-900">
                    <li>• Personel adınızı girin ve taramayı başlatın</li>
                    <li>• QR kodu yeşil kare içine getirin</li>
                    <li>• QR kod otomatik olarak okunacak ve işlem yapılacak</li>
                    <li>• Her taramadan sonra 3 saniye bekleyin</li>
                    <li>
                        • {mode === "check-in" ? "Giriş" : "Çıkış"} başarılı olunca yeşil ekran göreceksiniz
                    </li>
                </ul>
            </Card>
        </div>
    );
};
