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

/**
 * Send registration confirmation email
 * This is a placeholder that queues the email in the database
 * Actual sending should be done via Supabase Edge Function with Resend/SendGrid
 */
export async function sendRegistrationConfirmation(data: RegistrationEmailData): Promise<boolean> {
    try {
        // Email is automatically queued by database trigger
        // This function can be used for immediate processing or validation

        console.log("Registration email queued for:", data.email);

        // Optional: Call Edge Function to send immediately
        // const { data: result, error } = await supabase.functions.invoke('send-email', {
        //   body: { type: 'registration_confirmation', data }
        // });

        return true;
    } catch (error) {
        console.error("Error queueing registration email:", error);
        return false;
    }
}

/**
 * Get email notification logs for admin dashboard
 * Note: Requires email_notifications table to be added to types.ts
 */
export async function getEmailNotifications(eventId?: string, limit = 50) {
    try {
        // TODO: Add email_notifications to types.ts first
        // For now, this function is disabled pending type definition
        console.warn("Email notifications table not yet in types. Run migrations first.");
        return [];

        /* Uncomment after running migrations and updating types.ts:
        let query = supabase
          .from('email_notifications')
          .select(`
            id,
            recipient_email,
            recipient_name,
            email_type,
            status,
            sent_at,
            error_message,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
    
        if (eventId) {
          query = query.eq('event_id', eventId);
        }
    
        const { data, error } = await query;
    
        if (error) throw error;
    
        return data;
        */
    } catch (error) {
        console.error("Error fetching email notifications:", error);
        return [];
    }
}

/**
 * Resend failed emails
 * Note: Requires send_pending_emails RPC function
 */
export async function retryFailedEmails() {
    try {
        // TODO: Add send_pending_emails to types.ts Functions
        console.warn("RPC function not yet in types. Run migrations first.");
        return 0;

        /* Uncomment after running migrations:
        const { data, error } = await supabase.rpc('send_pending_emails');
    
        if (error) throw error;
    
        return data as number;
        */
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
        const regex = new RegExp(`{{${key}}}`, 'g');
        formatted = formatted.replace(regex, value);
    });

    return formatted;
}

/**
 * Email service integration guide:
 * 
 * 1. RESEND (Recommended - Simple & Modern)
 *    - Sign up at https://resend.com
 *    - Get API key
 *    - Create Supabase Edge Function:
 *      ```typescript
 *      import { Resend } from 'resend';
 *      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
 *      
 *      Deno.serve(async (req) => {
 *        const { type, data } = await req.json();
 *        
 *        await resend.emails.send({
 *          from: 'noreply@yourdomain.com',
 *          to: data.email,
 *          subject: data.subject,
 *          html: data.html
 *        });
 *        
 *        return new Response(JSON.stringify({ success: true }));
 *      });
 *      ```
 * 
 * 2. SENDGRID (Enterprise)
 *    - Sign up at https://sendgrid.com
 *    - Get API key
 *    - Use @sendgrid/mail package in Edge Function
 * 
 * 3. SUPABASE AUTH EMAILS
 *    - Limited to auth-related emails only
 *    - Not suitable for custom notifications
 * 
 * 4. WEBHOOK TO EXTERNAL SERVICE
 *    - Set up webhook endpoint
 *    - Call from Edge Function or client
 *    - Handle rate limiting
 */
