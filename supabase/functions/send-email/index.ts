// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";

interface EmailRequest {
  type: "registration_confirmation" | "event_reminder" | "event_update";
  to: string;
  toName?: string;
  subject: string;
  html: string;
  eventId?: string;
  registrationId?: string;
}

interface ResendResponse {
  id?: string;
  error?: {
    message: string;
    statusCode: number;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { type, to, toName, subject, html, eventId, registrationId }: EmailRequest = await req.json();

    if (!to || !subject || !html) {
      throw new Error("Missing required fields: to, subject, or html");
    }

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const result: ResendResponse = await resendResponse.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Log success (optional: update email_notifications table)
    console.log(`Email sent successfully: ${result.id} to ${to}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
        type,
        to,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Email sending error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
