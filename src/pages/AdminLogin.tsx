import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Lock, User } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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

            toast({
                title: "Giriş Başarılı! 🎉",
                description: `Hoş geldiniz, ${adminProfile.full_name}`,
            });

            navigate("/admin/dashboard");

        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                title: "Giriş Başarısız",
                description: error.message || "Kullanıcı adı veya şifre hatalı.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4">
            <Card className="w-full max-w-md p-8 shadow-[var(--shadow-elegant)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-muted-foreground">Etkinlik yönetim sistemine giriş</p>
                </div>

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
                                autoComplete="username"
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
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Giriş Yapılıyor...
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
