import { useEffect, useState } from "react";
import { EventHero } from "@/components/EventHero";
import { Countdown } from "@/components/Countdown";
import { ProgramSchedule } from "@/components/ProgramSchedule";
import { RegistrationForm } from "@/components/RegistrationForm";
import { LocationMap } from "@/components/LocationMap";
import { EventFooter } from "@/components/EventFooter";
import { supabase } from "@/integrations/supabase/client";

interface PageSection {
  id: string;
  section_key: string;
  section_title: string;
  is_visible: boolean;
  display_order: number;
  settings: any;
}

const Index = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPageSections();
  }, []);

  const fetchPageSections = async () => {
    try {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching page sections:", error);
        // Use default sections if database query fails
        setIsLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setSections(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const renderSection = (section: PageSection) => {
    switch (section.section_key) {
      case "hero":
        return <EventHero key={section.id} settings={section.settings} />;
      case "countdown":
        return <Countdown key={section.id} settings={section.settings} />;
      case "program":
        return <ProgramSchedule key={section.id} settings={section.settings} />;
      case "registration":
        return (
          <section key={section.id} id="registration-section" className="py-20 px-4">
            <RegistrationForm settings={section.settings} />
          </section>
        );
      case "location":
        return <LocationMap key={section.id} settings={section.settings} />;
      case "footer":
        return <EventFooter key={section.id} settings={section.settings} />;
      default:
        return null;
    }
  };

  // If database query fails or returns no data, render default sections
  if (!isLoading && sections.length === 0) {
    return (
      <div className="min-h-screen">
        <EventHero />
        <Countdown />
        <ProgramSchedule />
        <section id="registration-section" className="py-20 px-4">
          <RegistrationForm />
        </section>
        <LocationMap />
        <EventFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections.map((section) => renderSection(section))}
    </div>
  );
};

export default Index;
