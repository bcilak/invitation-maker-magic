import { Card } from "@/components/ui/card";
import { Lightbulb, FileCheck, Award, Rocket, Megaphone, Trophy, Clock } from "lucide-react";

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
    program_items?: Array<{
      time: string;
      title: string;
      description: string;
    }>;
  };
}

export const ProgramSchedule = ({ settings }: ProgramScheduleProps) => {
  const programItems = settings?.program_items || defaultProgramItems;
  return (
    <section 
      className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background"
      aria-labelledby="program-title"
      id="program-section"
    >
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 id="program-title" className="text-4xl md:text-5xl font-bold mb-4">
            {settings?.program_title || "Program"} <span className="text-primary">İçeriği</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Hemşirelikte yenilikçi yaklaşımlar için kapsamlı bir program
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6" role="list" aria-label="Program içerikleri">
          {programItems.map((item: any, index: number) => {
            const Icon = item.icon || Clock;
            const hasTime = 'time' in item;

            return (
              <Card
                key={index}
                className="p-6 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30"
                role="listitem"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {hasTime && (
                      <div className="text-sm font-semibold text-primary mb-1">
                        <span className="sr-only">Saat: </span>{item.time}
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {item.title}
                    </h3>
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
