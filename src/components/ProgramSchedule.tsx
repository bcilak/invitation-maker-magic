import { Card } from "@/components/ui/card";
import { Lightbulb, FileCheck, Award, Rocket, Megaphone, Trophy, Clock, Heart, Star, Zap, Target, Coffee, BookOpen, MessageCircle, Music, Video, Gift, Flag, Bell, Mic, Camera, Headphones, Globe, Users, Calendar } from "lucide-react";
import { useSectionStyles } from "@/hooks/useSectionStyles";

// Icon mapping for dynamic icons from settings
const ICON_MAP: Record<string, any> = {
  Lightbulb, FileCheck, Award, Rocket, Megaphone, Trophy, Clock, Heart, Star, Zap,
  Target, Coffee, BookOpen, MessageCircle, Music, Video, Gift, Flag, Bell, Mic,
  Camera, Headphones, Globe, Users, Calendar
};

const defaultProgramItems = [
  {
    icon: Lightbulb,
    title: "Sağlıkta İnovasyonun Yeri ve Önemi",
    description: "Sağlık sektöründe inovasyonun kritik rolü ve gelecek vizyonu"
  },
  {
    icon: Rocket,
    title: "İnovatif Fikir Oluşturma",
    description: "Yaratıcı düşünme teknikleri ve fikir geliştirme süreçleri"
  },
  {
    icon: FileCheck,
    title: "İnovatif Ürünlerde Belgelendirme",
    description: "Patent, sertifikasyon ve yasal süreçler"
  },
  {
    icon: Award,
    title: "İnovatif Ürünü Hayata Geçirme ve İş Birliği Süreçleri",
    description: "Prototipten üretime, iş ortaklıkları ve finansman"
  },
  {
    icon: Megaphone,
    title: "İnovatif Ürünlerde Reklam ve Tanıtım Süreci",
    description: "Pazarlama stratejileri ve hedef kitleye ulaşma"
  },
  {
    icon: Trophy,
    title: "İnovatif Ürün Geliştirme Atölyesi Yarışması",
    description: "Uygulamalı atölye çalışması ve yarışma"
  }
];

interface ProgramScheduleProps {
  settings?: {
    program_title?: string;
    program_subtitle?: string;
    program_items?: Array<{
      time: string;
      title: string;
      description: string;
      icon?: string;
      speaker?: string;
      duration?: string;
    }>;
    // Theme settings (matching PageSectionEditor)
    color_primary?: string;
    color_secondary?: string;
    color_accent?: string;
    gradient_style?: string;
    padding_y?: number;
    padding_x?: number;
    enter_animation?: string;
    animation_duration?: number;
    animation_delay?: number;
    hover_effects?: boolean;
    border_radius?: number;
    shadow_intensity?: number;
    custom_classes?: string;
    custom_css?: string;
  };
}

export const ProgramSchedule = ({ settings }: ProgramScheduleProps) => {
  const programItems = settings?.program_items || defaultProgramItems;
  const { style: sectionStyles, className: animationClass, cardStyles, primaryColorStyle } = useSectionStyles(settings || {});

  return (
    <section
      className={`py-20 px-4 bg-gradient-to-b from-secondary/30 to-background ${animationClass}`}
      style={sectionStyles}
      aria-labelledby="program-title"
      id="program-section"
    >
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 id="program-title" className="text-4xl md:text-5xl font-bold mb-4">
            {settings?.program_title || "Program"}{" "}
            <span style={primaryColorStyle.color ? primaryColorStyle : { color: 'hsl(var(--primary))' }}>İçeriği</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {settings?.program_subtitle || "Hemşirelikte yenilikçi yaklaşımlar için kapsamlı bir program"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6" role="list" aria-label="Program içerikleri">
          {programItems.map((item: any, index: number) => {
            // Get icon from map if it's a string, otherwise use the icon directly or fallback to Clock
            const Icon = typeof item.icon === 'string' ? ICON_MAP[item.icon] || Clock : item.icon || Clock;
            const hasTime = 'time' in item;

            return (
              <Card
                key={index}
                className="p-6 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30"
                style={cardStyles}
                role="listitem"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: settings?.color_primary ? `${settings.color_primary}15` : 'hsl(var(--primary) / 0.1)',
                      color: settings?.color_primary || 'hsl(var(--primary))'
                    }}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {hasTime && (
                      <div
                        className="text-sm font-semibold mb-1"
                        style={primaryColorStyle.color ? primaryColorStyle : { color: 'hsl(var(--primary))' }}
                      >
                        <span className="sr-only">Saat: </span>{item.time}
                        {item.duration && <span className="text-muted-foreground font-normal ml-2">({item.duration})</span>}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {item.title}
                    </h3>
                    {item.speaker && (
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        <Users className="w-3 h-3 inline-block mr-1" />
                        {item.speaker}
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
