import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

const registrationSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Ad Soyad en az 2 karakter olmalıdır" })
    .max(100, { message: "Ad Soyad en fazla 100 karakter olmalıdır" }),
  email: z.string()
    .trim()
    .email({ message: "Geçerli bir e-posta adresi giriniz" })
    .max(255, { message: "E-posta en fazla 255 karakter olmalıdır" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Geçerli bir telefon numarası giriniz" })
    .max(20, { message: "Telefon numarası en fazla 20 karakter olmalıdır" }),
  institution: z.string()
    .trim()
    .min(2, { message: "Kurum adı en az 2 karakter olmalıdır" })
    .max(200, { message: "Kurum adı en fazla 200 karakter olmalıdır" }),
  position: z.string()
    .trim()
    .min(2, { message: "Pozisyon en az 2 karakter olmalıdır" })
    .max(100, { message: "Pozisyon en fazla 100 karakter olmalıdır" }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  settings?: {
    form_title?: string;
    form_description?: string;
  };
}

export const RegistrationForm = ({ settings }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // Get current event ID from localStorage
      const currentEventStr = localStorage.getItem("current_event");
      const currentEvent = currentEventStr ? JSON.parse(currentEventStr) : null;
      const eventId = currentEvent?.id || null;

      // Try localStorage first as fallback
      const localStorageRegistrations = localStorage.getItem("event_registrations");
      const existingRegistrations = localStorageRegistrations
        ? JSON.parse(localStorageRegistrations)
        : [];

      // Check for duplicate email in localStorage
      const isDuplicateInLocal = existingRegistrations.some(
        (reg: any) => reg.email.toLowerCase() === data.email.toLowerCase()
      );

      if (isDuplicateInLocal) {
        toast({
          title: "Hata",
          description: "Bu e-posta adresi ile daha önce kayıt yapılmış. Lütfen farklı bir e-posta kullanınız.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Add to localStorage
      const newRegistration = {
        id: crypto.randomUUID(),
        ...data,
        event_id: eventId,
        created_at: new Date().toISOString(),
      };
      existingRegistrations.push(newRegistration);
      localStorage.setItem("event_registrations", JSON.stringify(existingRegistrations));

      // Try to save to database (but don't fail if it doesn't work)
      try {
        await supabase
          .from("registrations")
          .insert([{
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            institution: data.institution,
            position: data.position,
            event_id: eventId,
          }]);
      } catch (dbError) {
        console.log("Database save failed, using localStorage:", dbError);
      }

      setIsSuccess(true);
      reset();

      toast({
        title: "Kayıt Başarılı!",
        description: "Etkinliğe kaydınız alındı. E-posta adresinize bilgilendirme gönderilecektir.",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Registration error:", error);

      toast({
        title: "Hata",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="p-8 max-w-2xl mx-auto text-center shadow-[var(--shadow-elegant)]">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2 text-foreground">Kaydınız Alındı!</h3>
        <p className="text-muted-foreground">
          Etkinlik detayları e-posta adresinize gönderilecektir.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto shadow-[var(--shadow-elegant)]">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 text-foreground">
          {settings?.form_title || "Etkinliğe Kayıt Olun"}
        </h3>
        <p className="text-muted-foreground">
          {settings?.form_description || "Formu doldurarak etkinliğe katılımınızı onaylayın"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Ad Soyad *</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Adınız ve Soyadınız"
            className={errors.full_name ? "border-destructive" : ""}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="ornek@email.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="0555 123 45 67"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="institution">Kurum *</Label>
          <Input
            id="institution"
            {...register("institution")}
            placeholder="Çalıştığınız Kurum"
            className={errors.institution ? "border-destructive" : ""}
          />
          {errors.institution && (
            <p className="text-sm text-destructive mt-1">{errors.institution.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="position">Pozisyon *</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="Hemşire, Başhemşire, vb."
            className={errors.position ? "border-destructive" : ""}
          />
          {errors.position && (
            <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Kayıt Ol"
          )}
        </Button>
      </form>
    </Card>
  );
};
