import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        try {
            // Check if user is authenticated
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                setIsAdmin(false);
                setIsChecking(false);
                return;
            }

            // Check if user is in admin_profiles
            const { data: adminProfile, error: profileError } = await supabase
                .from('admin_profiles')
                .select('is_active')
                .eq('id', session.user.id)
                .single();

            if (profileError || !adminProfile || !adminProfile.is_active) {
                // User is authenticated but not an admin
                await supabase.auth.signOut();
                localStorage.removeItem("admin_session");
                setIsAdmin(false);
            } else {
                setIsAdmin(true);
            }
        } catch (error) {
            console.error("Admin check error:", error);
            setIsAdmin(false);
        } finally {
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Yetkilendirme kontrol ediliyor...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
