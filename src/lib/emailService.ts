import { supabase } from "@/integrations/supabase/client";

interface RegistrationEmailData {
    full_name: string;
    email: string;
    phone: string;
    institution: string;
    position: string;
    event_title: string;
    event_date: string;
    event_location: string;
    event_address: string;
    event_url: string;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Generate registration confirmation email HTML
 */
function generateRegistrationEmailHtml(data: RegistrationEmailData): string {
    const eventDate = new Date(data.event_date);
    const formattedDate = eventDate.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
    });
    const formattedTime = eventDate.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kayıt Onayı</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
          ✨ Kaydınız Alındı!
        </h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; color: #18181b; margin: 0 0 20px;">
          Sayın <strong>${data.full_name}</strong>,
        </p>
        <p style="font-size: 16px; color: #3f3f46; line-height: 1.6; margin: 0 0 30px;">
          <strong>"${data.event_title}"</strong> etkinliğine kaydınız başarıyla alınmıştır.
        </p>
        
        <div style="background-color: #f4f4f5; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h2 style="color: #6366f1; font-size: 18px; margin: 0 0 20px; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px;">
            📅 Etkinlik Detayları
          </h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Tarih:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Saat:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Konum:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${data.event_location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Adres:</td>
              <td style="padding: 8px 0; color: #18181b; font-size: 14px; font-weight: 600;">${data.event_address}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>📌 Hatırlatma:</strong> Etkinlik gününde bu e-postayı yanınızda bulundurunuz. Kayıt bilgileriniz giriş için gerekebilir.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${data.event_url}" 
             style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Etkinlik Sayfasına Git →
          </a>
        </div>

        <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
          <h3 style="color: #3f3f46; font-size: 14px; margin: 0 0 15px;">Kayıt Bilgileriniz:</h3>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #71717a;">
            <tr>
              <td style="padding: 4px 0;">Ad Soyad: ${data.full_name}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">E-posta: ${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Telefon: ${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Kurum: ${data.institution}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;">Pozisyon: ${data.position}</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 20px;">
        <p style="font-size: 12px; color: #a1a1aa; margin: 0;">
          Bu e-posta otomatik olarak gönderilmiştir. Sorularınız için organizatörle iletişime geçebilirsiniz.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send registration confirmation email via Supabase Edge Function
 */
export async function sendRegistrationConfirmation(data: RegistrationEmailData): Promise<EmailResult> {
    try {
        const html = generateRegistrationEmailHtml(data);

        const { data: result, error } = await supabase.functions.invoke("send-email", {
            body: {
                type: "registration_confirmation",
                to: data.email,
                toName: data.full_name,
                subject: `✅ Kayıt Onayı: ${data.event_title}`,
                html: html,
            },
        });

        if (error) {
            console.error("Edge function error:", error);
            return { success: false, error: error.message };
        }

        if (!result.success) {
            return { success: false, error: result.error };
        }

        console.log("Registration email sent:", result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error: any) {
        console.error("Error sending registration email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Send event reminder email
 */
export async function sendEventReminder(
    email: string,
    fullName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    eventUrl: string
): Promise<EmailResult> {
    try {
        const date = new Date(eventDate);
        const formattedDate = date.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
          ⏰ Etkinlik Hatırlatması
        </h1>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px;">
        <p style="font-size: 18px; color: #18181b; margin: 0 0 20px;">
          Sayın <strong>${fullName}</strong>,
        </p>
        <p style="font-size: 16px; color: #3f3f46; line-height: 1.6; margin: 0 0 30px;">
          <strong>"${eventTitle}"</strong> etkinliği yaklaşıyor! Sizi aramızda görmekten mutluluk duyacağız.
        </p>
        <div style="background-color: #fef3c7; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
          <p style="font-size: 24px; color: #92400e; font-weight: 700; margin: 0;">
            📅 ${formattedDate}
          </p>
          <p style="font-size: 16px; color: #a16207; margin: 10px 0 0;">
            📍 ${eventLocation}
          </p>
        </div>
        <div style="text-align: center;">
          <a href="${eventUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Etkinlik Detayları →
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

        const { data: result, error } = await supabase.functions.invoke("send-email", {
            body: {
                type: "event_reminder",
                to: email,
                toName: fullName,
                subject: `⏰ Hatırlatma: ${eventTitle} - ${formattedDate}`,
                html: html,
            },
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: result.success, messageId: result.messageId, error: result.error };
    } catch (error: any) {
        console.error("Error sending reminder email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Queue email for batch processing (stores in database)
 */
export async function queueEmail(
    type: string,
    recipientEmail: string,
    recipientName: string,
    subject: string,
    htmlContent: string,
    eventId?: string,
    registrationId?: string
): Promise<boolean> {
    try {
        const { error } = await supabase.from("email_notifications" as any).insert({
            event_id: eventId,
            registration_id: registrationId,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            email_type: type,
            subject: subject,
            html_content: htmlContent,
            status: "pending",
        });

        if (error) {
            console.error("Error queueing email:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error queueing email:", error);
        return false;
    }
}

/**
 * Get email notification logs
 */
export async function getEmailNotifications(eventId?: string, limit = 50) {
    try {
        let query = supabase
            .from("email_notifications" as any)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (eventId) {
            query = query.eq("event_id", eventId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching email notifications:", error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error("Error fetching email notifications:", error);
        return [];
    }
}

/**
 * Retry failed emails
 */
export async function retryFailedEmails(): Promise<number> {
    try {
        const { data: pendingEmails, error: fetchError } = await supabase
            .from("email_notifications" as any)
            .select("*")
            .in("status", ["pending", "failed"])
            .lt("retry_count", 3);

        if (fetchError || !pendingEmails) {
            console.error("Error fetching pending emails:", fetchError);
            return 0;
        }

        let successCount = 0;

        for (const email of pendingEmails) {
            const { data: result, error } = await supabase.functions.invoke("send-email", {
                body: {
                    type: email.email_type,
                    to: email.recipient_email,
                    toName: email.recipient_name,
                    subject: email.subject,
                    html: email.html_content,
                },
            });

            if (!error && result?.success) {
                await supabase
                    .from("email_notifications" as any)
                    .update({
                        status: "sent",
                        sent_at: new Date().toISOString(),
                    })
                    .eq("id", email.id);
                successCount++;
            } else {
                await supabase
                    .from("email_notifications" as any)
                    .update({
                        status: "failed",
                        error_message: error?.message || result?.error,
                        retry_count: (email.retry_count || 0) + 1,
                    })
                    .eq("id", email.id);
            }
        }

        return successCount;
    } catch (error) {
        console.error("Error retrying failed emails:", error);
        return 0;
    }
}

/**
 * Format email template with variables
 */
export function formatEmailTemplate(template: string, variables: Record<string, string>): string {
    let formatted = template;

    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        formatted = formatted.replace(regex, value);
    });

    return formatted;
}
