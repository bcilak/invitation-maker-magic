import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
    Calendar,
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
    const [staffName, setStaffName] = useState("");
    const [lastScannedData, setLastScannedData] = useState<CheckInData | null>(null);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
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

        // Save staff name
        localStorage.setItem("staff_name", staffName);

        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanFailure
            );

            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner:", err);
            toast({
                title: "Kamera Hatası",
                description: "Kamera başlatılamadı. Lütfen kamera izinlerini kontrol edin.",
                variant: "destructive",
            });
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setIsScanning(false);
    };

    const onScanSuccess = async (decodedText: string) => {
        try {
            // Parse QR code data
            const qrData: CheckInData = JSON.parse(decodedText);
            setLastScannedData(qrData);

            // Verify event ID matches
            if (qrData.eventId !== eventId) {
                setScanResult({
                    success: false,
                    message: "Bu QR kod farklı bir etkinliğe ait!",
                });
                toast({
                    title: "Hatalı QR Kod",
                    description: "Bu QR kod bu etkinlik için geçerli değil",
                    variant: "destructive",
                });
                return;
            }

            // Process check-in or check-out
            let result;
            if (mode === "check-in") {
                result = await CheckInService.processCheckIn(decodedText, staffName);
            } else {
                result = await CheckInService.processCheckOut(decodedText, staffName);
            }

            if (result.success) {
                setScanResult({
                    success: true,
                    message: `${mode === "check-in" ? "Giriş" : "Çıkış"} başarılı!`,
                });
                toast({
                    title: "Başarılı",
                    description: `${qrData.fullName} - ${mode === "check-in" ? "Giriş" : "Çıkış"} kaydedildi`,
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

            // Stop scanning briefly to show result
            await stopScanning();
            setTimeout(() => {
                setScanResult(null);
                if (staffName) startScanning();
            }, 3000);
        } catch (err) {
            console.error("Error processing QR code:", err);
            setScanResult({
                success: false,
                message: "Geçersiz QR kod formatı",
            });
            toast({
                title: "Hata",
                description: "QR kod okunamadı",
                variant: "destructive",
            });
        }
    };

    const onScanFailure = (error: string) => {
        // Silent fail - QR code not found in frame
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {mode === "check-in" ? (
                                <LogIn className="w-6 h-6 text-green-600" />
                            ) : (
                                <LogOut className="w-6 h-6 text-blue-600" />
                            )}
                            <h2 className="text-2xl font-bold">
                                {mode === "check-in" ? "Giriş" : "Çıkış"} Okuyucu
                            </h2>
                        </div>
                        <Badge variant={isScanning ? "default" : "secondary"}>
                            {isScanning ? "Aktif" : "Pasif"}
                        </Badge>
                    </div>

                    <div>
                        <Label htmlFor="staffName">Personel Adı</Label>
                        <Input
                            id="staffName"
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
            <Card className="p-6">
                <div
                    id="qr-reader"
                    className={`w-full ${isScanning ? "block" : "hidden"}`}
                    style={{ minHeight: "300px" }}
                />
                {!isScanning && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>QR kod okuyucu hazır</p>
                        <p className="text-sm">Taramayı başlatmak için yukarıdaki butona tıklayın</p>
                    </div>
                )}
            </Card>

            {/* Scan Result */}
            {scanResult && (
                <Card
                    className={`p-6 border-2 ${
                        scanResult.success
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                    }`}
                >
                    <div className="flex items-center gap-4">
                        {scanResult.success ? (
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                        <div className="flex-1">
                            <h3
                                className={`text-xl font-bold ${
                                    scanResult.success ? "text-green-800" : "text-red-800"
                                }`}
                            >
                                {scanResult.message}
                            </h3>
                            {lastScannedData && (
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{lastScannedData.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{lastScannedData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
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
            <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Kullanım Talimatları
                </h3>
                <ul className="text-sm space-y-1 text-blue-900">
                    <li>• Personel adınızı girin ve taramayı başlatın</li>
                    <li>• QR kodu kamera önüne getirin</li>
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
