import { useMemo } from "react";

interface SectionSettings {
    // Colors
    color_primary?: string;
    color_secondary?: string;
    color_accent?: string;
    gradient_style?: string;

    // Spacing
    padding_y?: number;
    padding_x?: number;

    // Effects
    border_radius?: number;
    shadow_intensity?: number;

    // Animation
    enter_animation?: string;
    animation_duration?: number;
    animation_delay?: number;
    animate_on_scroll?: boolean;
    hover_effects?: boolean;

    // Advanced
    custom_classes?: string;
    custom_css?: string;
}

// CSS Custom Properties for theme colors
export const applyThemeColors = (settings: SectionSettings): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (settings.color_primary) {
        styles["--section-primary" as any] = settings.color_primary;
    }
    if (settings.color_secondary) {
        styles["--section-secondary" as any] = settings.color_secondary;
    }
    if (settings.color_accent) {
        styles["--section-accent" as any] = settings.color_accent;
    }

    return styles;
};

// Generate gradient background
export const getGradientStyle = (gradientType: string, primary?: string, secondary?: string): string => {
    const p = primary || "#8B5CF6";
    const s = secondary || "#D946EF";

    const gradients: Record<string, string> = {
        "none": "transparent",
        "gradient-primary": `linear-gradient(135deg, ${p}15 0%, ${s}15 100%)`,
        "gradient-secondary": `linear-gradient(180deg, var(--background) 0%, ${s}20 100%)`,
        "gradient-accent": `linear-gradient(45deg, ${p}20 0%, transparent 50%, ${s}20 100%)`,
        "gradient-sunset": "linear-gradient(135deg, #ff6b6b15 0%, #ffa07a15 50%, #ffd93d15 100%)",
        "gradient-ocean": "linear-gradient(135deg, #0ea5e915 0%, #06b6d415 50%, #14b8a615 100%)",
        "gradient-forest": "linear-gradient(135deg, #22c55e15 0%, #10b98115 50%, #84cc1615 100%)",
        "gradient-royal": "linear-gradient(135deg, #6366f115 0%, #8b5cf615 50%, #a855f715 100%)",
    };

    return gradients[gradientType] || gradients["none"];
};

// Animation class generator
export const getAnimationClass = (animation: string, duration?: number, delay?: number): string => {
    const animations: Record<string, string> = {
        "none": "",
        "fade-in": "animate-fade-in",
        "slide-up": "animate-slide-up",
        "slide-down": "animate-slide-down",
        "slide-left": "animate-slide-left",
        "slide-right": "animate-slide-right",
        "zoom-in": "animate-zoom-in",
        "bounce": "animate-bounce-in",
    };

    return animations[animation] || "";
};

// Main hook
export function useSectionStyles(settings: SectionSettings = {}) {
    const styles = useMemo(() => {
        const cssVars: React.CSSProperties = {
            ...applyThemeColors(settings),
        };

        // Padding
        if (settings.padding_y !== undefined) {
            cssVars.paddingTop = `${settings.padding_y}px`;
            cssVars.paddingBottom = `${settings.padding_y}px`;
        }
        if (settings.padding_x !== undefined) {
            cssVars.paddingLeft = `${settings.padding_x}px`;
            cssVars.paddingRight = `${settings.padding_x}px`;
        }

        // Background gradient
        if (settings.gradient_style && settings.gradient_style !== "none") {
            cssVars.background = getGradientStyle(
                settings.gradient_style,
                settings.color_primary,
                settings.color_secondary
            );
        }

        // Custom CSS
        if (settings.custom_css) {
            // Parse basic CSS properties
            const cssProps = settings.custom_css.split(";").filter(Boolean);
            cssProps.forEach(prop => {
                const [key, value] = prop.split(":").map(s => s.trim());
                if (key && value) {
                    // Convert kebab-case to camelCase
                    const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
                    (cssVars as any)[camelKey] = value;
                }
            });
        }

        return cssVars;
    }, [settings]);

    const className = useMemo(() => {
        const classes: string[] = [];

        // Animation
        if (settings.enter_animation && settings.enter_animation !== "none") {
            classes.push(getAnimationClass(settings.enter_animation));
        }

        // Hover effects
        if (settings.hover_effects !== false) {
            classes.push("hover-effects");
        }

        // Custom classes
        if (settings.custom_classes) {
            classes.push(settings.custom_classes);
        }

        return classes.filter(Boolean).join(" ");
    }, [settings]);

    const animationStyle = useMemo(() => {
        const style: React.CSSProperties = {};

        if (settings.animation_duration) {
            style.animationDuration = `${settings.animation_duration}ms`;
        }
        if (settings.animation_delay) {
            style.animationDelay = `${settings.animation_delay}ms`;
        }

        return style;
    }, [settings]);

    // Card/box specific styles
    const cardStyles = useMemo(() => {
        const style: React.CSSProperties = {};

        if (settings.border_radius !== undefined) {
            style.borderRadius = `${settings.border_radius}px`;
        }

        if (settings.shadow_intensity !== undefined && settings.shadow_intensity > 0) {
            const intensity = settings.shadow_intensity / 100;
            style.boxShadow = `0 ${4 * intensity}px ${20 * intensity}px rgba(0,0,0,${0.1 * intensity})`;
        }

        return style;
    }, [settings]);

    // Primary color style for text/icons
    const primaryColorStyle = useMemo(() => {
        if (settings.color_primary) {
            return { color: settings.color_primary };
        }
        return {};
    }, [settings]);

    // Combined style object for convenience
    const style = useMemo(() => ({
        ...styles,
        ...animationStyle,
    }), [styles, animationStyle]);

    return {
        style, // Combined styles for section element
        styles, // Raw CSS custom properties
        className,
        animationStyle,
        cardStyles,
        primaryColorStyle,
        settings,
    };
}

export default useSectionStyles;
