import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Lock, User, AlertTriangle } from "lucide-react";
import { SEO, SEOPresets } from "@/components/SEO";

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_KEY = "admin_login_rate_limit";

interface RateLimitData {
    attempts: number;
    firstAttemptAt: number;
    lockedUntil?: number;
}

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitData | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Check rate limit on mount and setup countdown
    useEffect(() => {
        checkRateLimit();
        const interval = setInterval(() => {
            checkRateLimit();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const checkRateLimit = () => {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        if (!stored) {
            setRateLimitInfo(null);
            setRemainingTime(0);
            return;
        }

        const data: RateLimitData = JSON.parse(stored);
        const now = Date.now();

        // Check if lockout has expired
        if (data.lockedUntil && data.lockedUntil <= now) {
            localStorage.removeItem(RATE_LIMIT_KEY);
            setRateLimitInfo(null);
            setRemainingTime(0);
            return;
        }

        // Check if first attempt window has expired (reset after 15 min of inactivity)
        if (!data.lockedUntil && (now - data.firstAttemptAt) > LOCKOUT_DURATION_MS) {
            localStorage.removeItem(RATE_LIMIT_KEY);
            setRateLimitInfo(null);
            setRemainingTime(0);
            return;
        }

        setRateLimitInfo(data);
        if (data.lockedUntil) {
            setRemainingTime(Math.ceil((data.lockedUntil - now) / 1000));
        }
    };

    const recordFailedAttempt = () => {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        const now = Date.now();
        let data: RateLimitData;

        if (stored) {
            data = JSON.parse(stored);
            data.attempts += 1;
        } else {
            data = {
                attempts: 1,
                firstAttemptAt: now,
            };
        }

        // Lock if max attempts reached
        if (data.attempts >= MAX_LOGIN_ATTEMPTS) {
            data.lockedUntil = now + LOCKOUT_DURATION_MS;
        }

        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
        setRateLimitInfo(data);
    };

    const clearRateLimit = () => {
        localStorage.removeItem(RATE_LIMIT_KEY);
        setRateLimitInfo(null);
        setRemainingTime(0);
    };

    const isLocked = rateLimitInfo?.lockedUntil && rateLimitInfo.lockedUntil > Date.now();

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if locked
        if (isLocked) {
            toast({
                title: "Hesap Kilitli",
                description: `Çok fazla başarısız deneme. ${formatTime(remainingTime)} sonra tekrar deneyin.`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Validate email format (username should be email)
            const email = username.includes('@') ? username : `${username}@admin.local`;

            // Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (authError) {
                throw new Error(authError.message || "Geçersiz kullanıcı adı veya şifre");
            }

            // Check if user is admin by querying admin_profiles
            const { data: adminProfile, error: profileError } = await supabase
                .from('admin_profiles')
                .select('full_name, role, is_active')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !adminProfile || !adminProfile.is_active) {
                // User authenticated but not an admin
                await supabase.auth.signOut();
                throw new Error("Bu hesabın admin yetkisi bulunmamaktadır.");
            }

            // Update last_login timestamp
            await supabase
                .from('admin_profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', authData.user.id);

            // Store admin session in localStorage (backup for offline checks)
            localStorage.setItem("admin_session", JSON.stringify({
                user_id: authData.user.id,
                email: authData.user.email,
                full_name: adminProfile.full_name,
                role: adminProfile.role,
                loginTime: new Date().toISOString(),
                supabase_session: true
            }));

            // Clear rate limit on successful login
            clearRateLimit();

            toast({
                title: "Giriş Başarılı! 🎉",
                description: `Hoş geldiniz, ${adminProfile.full_name}`,
            });

            navigate("/admin/dashboard");

        } catch (error: any) {
            console.error("Login error:", error);

            // Record failed attempt for rate limiting
            recordFailedAttempt();

            const attemptsLeft = MAX_LOGIN_ATTEMPTS - ((rateLimitInfo?.attempts || 0) + 1);

            toast({
                title: "Giriş Başarısız",
                description: attemptsLeft > 0
                    ? `${error.message || "Kullanıcı adı veya şifre hatalı."} (${attemptsLeft} deneme hakkı kaldı)`
                    : "Çok fazla başarısız deneme. Hesabınız 15 dakika kilitlendi.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4">
            <SEO {...SEOPresets.adminLogin} />
            <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-muted-foreground">Etkinlik yönetim sistemine giriş</p>
                </div>

                {/* Lockout Warning */}
                {isLocked && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <div>
                            <p className="font-medium text-destructive">Hesap Geçici Olarak Kilitli</p>
                            <p className="text-sm text-muted-foreground">
                                Çok fazla başarısız deneme. {formatTime(remainingTime)} sonra tekrar deneyin.
                            </p>
                        </div>
                    </div>
                )}

                {/* Attempts Warning */}
                {rateLimitInfo && !isLocked && rateLimitInfo.attempts > 0 && (
                    <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {MAX_LOGIN_ATTEMPTS - rateLimitInfo.attempts} deneme hakkı kaldı
                        </p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="username">Email</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                id="username"
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin@example.com"
                                className="pl-10"
                                required
                                disabled={!!isLocked}
                                autoComplete="username"
                                aria-describedby={isLocked ? "lockout-message" : undefined}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="password">Şifre</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10"
                                required
                                disabled={!!isLocked}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading || !!isLocked}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Giriş Yapılıyor...
                            </>
                        ) : isLocked ? (
                            <>
                                <Lock className="mr-2 h-4 w-4" />
                                Kilitli ({formatTime(remainingTime)})
                            </>
                        ) : (
                            "Giriş Yap"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/")}
                    >
                        Ana Sayfaya Dön
                    </Button>
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground text-center mb-2">
                        <strong>Admin girişi için:</strong>
                    </p>
                    <p className="text-center text-xs">
                        Supabase Dashboard'dan oluşturulan<br />
                        admin kullanıcı email ve şifresi gereklidir.
                    </p>
                </div>
            </Card>
        </div>
    );
}
