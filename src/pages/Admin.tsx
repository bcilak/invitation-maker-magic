import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndRedirect();
    }, [navigate]);

    const checkAuthAndRedirect = async () => {
        try {
            // Check Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                // Check if user is admin
                const { data: adminProfile } = await supabase
                    .from('admin_profiles')
                    .select('is_active')
                    .eq('id', session.user.id)
                    .single();

                if (adminProfile && adminProfile.is_active) {
                    navigate("/admin/dashboard");
                    return;
                }
            }

            // No valid session or not admin, redirect to login
            navigate("/admin/login");
        } catch (error) {
            console.error("Auth check error:", error);
            navigate("/admin/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
}
