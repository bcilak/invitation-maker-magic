import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Admin Access Key Component
 * Press Ctrl+Shift+A to access admin login
 * Hidden feature for admin access without visible buttons
 */
export const AdminAccessKey = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ctrl+Shift+A for admin access
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                navigate('/admin/login');
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};
