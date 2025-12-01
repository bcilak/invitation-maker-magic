import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendRegistrationConfirmation } from "@/lib/emailService";

// Turkish phone number regex - supports various formats
const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/;

// Rate limiting - store submission timestamps
const RATE_LIMIT_KEY = "registration_rate_limit";
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_SUBMISSIONS = 3; // Max 3 submissions per minute

const registrationSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Ad Soyad en az 2 karakter olmalıdır" })
    .max(100, { message: "Ad Soyad en fazla 100 karakter olmalıdır" })
    .regex(/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/, { message: "Ad Soyad sadece harf içermelidir" }),
  email: z.string()
    .trim()
    .email({ message: "Geçerli bir e-posta adresi giriniz" })
    .max(255, { message: "E-posta en fazla 255 karakter olmalıdır" })
    .refine((email) => !email.includes("+"), { message: "E-posta adresi '+' karakteri içeremez" }),
  phone: z.string()
    .trim()
    .transform((val) => val.replace(/[\s\-\(\)]/g, "")) // Remove spaces, dashes, parentheses
    .refine((val) => turkishPhoneRegex.test(val), { 
      message: "Geçerli bir Türkiye telefon numarası giriniz (5XX XXX XX XX)" 
    }),
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
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  // Check rate limit on mount
  useEffect(() => {
    checkRateLimit();
    const interval = setInterval(checkRateLimit, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = () => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      setIsRateLimited(false);
      return;
    }

    const timestamps: number[] = JSON.parse(stored);
    const now = Date.now();
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    
    if (validTimestamps.length >= MAX_SUBMISSIONS) {
      setIsRateLimited(true);
      const oldestValid = Math.min(...validTimestamps);
      const remaining = Math.ceil((RATE_LIMIT_WINDOW - (now - oldestValid)) / 1000);
      setRateLimitRemaining(remaining);
    } else {
      setIsRateLimited(false);
    }
  };

  const updateRateLimit = () => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const timestamps: number[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
    validTimestamps.push(now);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(validTimestamps));
    checkRateLimit();
  };

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // Check rate limit
    if (isRateLimited) {
      toast({
        title: "Çok fazla deneme",
        description: `Lütfen ${rateLimitRemaining} saniye bekleyin.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current event from localStorage
      const currentEventStr = localStorage.getItem("current_event");
      const currentEvent = currentEventStr ? JSON.parse(currentEventStr) : null;
      const eventId = currentEvent?.id || null;

      // Normalize phone number
      const normalizedPhone = data.phone.replace(/[\s\-\(\)]/g, "");

      // Try localStorage first as fallback
      const localStorageRegistrations = localStorage.getItem("event_registrations");
      const existingRegistrations = localStorageRegistrations
        ? JSON.parse(localStorageRegistrations)
        : [];

      // Check for duplicate email in localStorage (same event)
      const isDuplicateInLocal = existingRegistrations.some(
        (reg: any) => 
          reg.email.toLowerCase() === data.email.toLowerCase() &&
          reg.event_id === eventId
      );

      if (isDuplicateInLocal) {
        toast({
          title: "Hata",
          description: "Bu e-posta adresi ile bu etkinliğe daha önce kayıt yapılmış.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update rate limit
      updateRateLimit();

      // Add to localStorage
      const newRegistration = {
        id: crypto.randomUUID(),
        full_name: data.full_name,
        email: data.email,
        phone: normalizedPhone,
        institution: data.institution,
        position: data.position,
        event_id: eventId,
        created_at: new Date().toISOString(),
      };
      existingRegistrations.push(newRegistration);
      localStorage.setItem("event_registrations", JSON.stringify(existingRegistrations));

      // Try to save to database
      try {
        const { error: dbError } = await supabase
          .from("registrations")
          .insert([{
            full_name: data.full_name,
            email: data.email,
            phone: normalizedPhone,
            institution: data.institution,
            position: data.position,
            event_id: eventId,
          }]);

        if (dbError) {
          console.log("Database save failed:", dbError);
        }
      } catch (dbError) {
        console.log("Database save failed, using localStorage:", dbError);
      }

      // Send confirmation email
      if (currentEvent) {
        const eventSettings = JSON.parse(localStorage.getItem("event_settings") || "{}");
        try {
          await sendRegistrationConfirmation({
            full_name: data.full_name,
            email: data.email,
            phone: normalizedPhone,
            institution: data.institution,
            position: data.position,
            event_title: currentEvent.title,
            event_date: currentEvent.event_date,
            event_location: currentEvent.event_location,
            event_address: eventSettings.event_address || currentEvent.event_address || "",
            event_url: window.location.href,
          });
        } catch (emailError) {
          console.log("Email sending failed:", emailError);
          // Don't fail registration if email fails
        }
      }

      setIsSuccess(true);
      reset();

      toast({
        title: "Kayıt Başarılı! 🎉",
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
      <Card className="p-8 max-w-2xl mx-auto text-center shadow-[var(--shadow-elegant)]" role="alert" aria-live="polite">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" aria-hidden="true" />
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

      {isRateLimited && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">
            Çok fazla deneme yaptınız. Lütfen {rateLimitRemaining} saniye bekleyin.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="full_name">Ad Soyad *</Label>
          <Input
            id="full_name"
            {...register("full_name")}
            placeholder="Adınız ve Soyadınız"
            className={errors.full_name ? "border-destructive" : ""}
            aria-invalid={errors.full_name ? "true" : "false"}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
            autoComplete="name"
          />
          {errors.full_name && (
            <p id="full_name-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.full_name.message}
            </p>
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
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="5XX XXX XX XX"
            className={errors.phone ? "border-destructive" : ""}
            aria-invalid={errors.phone ? "true" : "false"}
            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            autoComplete="tel"
          />
          <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
            Türkiye cep telefonu numarası (5XX XXX XX XX)
          </p>
          {errors.phone && (
            <p id="phone-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="institution">Kurum *</Label>
          <Input
            id="institution"
            {...register("institution")}
            placeholder="Çalıştığınız Kurum"
            className={errors.institution ? "border-destructive" : ""}
            aria-invalid={errors.institution ? "true" : "false"}
            aria-describedby={errors.institution ? "institution-error" : undefined}
            autoComplete="organization"
          />
          {errors.institution && (
            <p id="institution-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.institution.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="position">Pozisyon *</Label>
          <Input
            id="position"
            {...register("position")}
            placeholder="Hemşire, Başhemşire, vb."
            className={errors.position ? "border-destructive" : ""}
            aria-invalid={errors.position ? "true" : "false"}
            aria-describedby={errors.position ? "position-error" : undefined}
            autoComplete="organization-title"
          />
          {errors.position && (
            <p id="position-error" className="text-sm text-destructive mt-1" role="alert">
              {errors.position.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={isSubmitting || isRateLimited}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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
