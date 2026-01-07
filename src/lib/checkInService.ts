import { supabase } from "@/integrations/supabase/client";

export interface CheckInData {
    registrationId: string;
    eventId: string;
    email: string;
    fullName: string;
    timestamp: string;
}

export interface CheckInRecord {
    id: string;
    registration_id: string;
    event_id: string;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_by: string | null;
    check_out_by: string | null;
    qr_code_data: string;
    is_valid: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export class CheckInService {
    /**
     * Create a check-in record when generating invitation
     */
    static async createCheckInRecord(qrData: CheckInData): Promise<{ success: boolean; error?: string }> {
        try {
            const qrCodeData = JSON.stringify(qrData);

            const { error } = await supabase.from("check_ins").insert({
                registration_id: qrData.registrationId,
                event_id: qrData.eventId,
                qr_code_data: qrCodeData,
                is_valid: true,
            });

            if (error) {
                console.error("Error creating check-in record:", error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            console.error("Error creating check-in record:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify and process check-in
     */
    static async processCheckIn(
        qrCodeData: string,
        staffName: string
    ): Promise<{ success: boolean; data?: CheckInRecord; error?: string }> {
        try {
            // Parse QR code data
            const qrData: CheckInData = JSON.parse(qrCodeData);

            // Find the check-in record
            const { data: checkInRecord, error: fetchError } = await supabase
                .from("check_ins")
                .select("*")
                .eq("qr_code_data", qrCodeData)
                .eq("is_valid", true)
                .single();

            if (fetchError || !checkInRecord) {
                return { success: false, error: "Geçersiz QR kod veya kayıt bulunamadı" };
            }

            // Check if already checked in
            if (checkInRecord.check_in_time) {
                return { success: false, error: "Bu kişi zaten giriş yapmış" };
            }

            // Update check-in time
            const { data: updatedRecord, error: updateError } = await supabase
                .from("check_ins")
                .update({
                    check_in_time: new Date().toISOString(),
                    check_in_by: staffName,
                })
                .eq("id", checkInRecord.id)
                .select()
                .single();

            if (updateError) {
                return { success: false, error: updateError.message };
            }

            return { success: true, data: updatedRecord };
        } catch (error: any) {
            console.error("Error processing check-in:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process check-out
     */
    static async processCheckOut(
        qrCodeData: string,
        staffName: string
    ): Promise<{ success: boolean; data?: CheckInRecord; error?: string }> {
        try {
            // Parse QR code data
            const qrData: CheckInData = JSON.parse(qrCodeData);

            // Find the check-in record
            const { data: checkInRecord, error: fetchError } = await supabase
                .from("check_ins")
                .select("*")
                .eq("qr_code_data", qrCodeData)
                .eq("is_valid", true)
                .single();

            if (fetchError || !checkInRecord) {
                return { success: false, error: "Geçersiz QR kod veya kayıt bulunamadı" };
            }

            // Check if not checked in yet
            if (!checkInRecord.check_in_time) {
                return { success: false, error: "Bu kişi henüz giriş yapmamış" };
            }

            // Check if already checked out
            if (checkInRecord.check_out_time) {
                return { success: false, error: "Bu kişi zaten çıkış yapmış" };
            }

            // Update check-out time
            const { data: updatedRecord, error: updateError } = await supabase
                .from("check_ins")
                .update({
                    check_out_time: new Date().toISOString(),
                    check_out_by: staffName,
                })
                .eq("id", checkInRecord.id)
                .select()
                .single();

            if (updateError) {
                return { success: false, error: updateError.message };
            }

            return { success: true, data: updatedRecord };
        } catch (error: any) {
            console.error("Error processing check-out:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get check-in status for a registration
     */
    static async getCheckInStatus(
        registrationId: string
    ): Promise<{ success: boolean; data?: CheckInRecord; error?: string }> {
        try {
            const { data, error } = await supabase
                .from("check_ins")
                .select("*")
                .eq("registration_id", registrationId)
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all check-ins for an event
     */
    static async getEventCheckIns(
        eventId: string
    ): Promise<{ success: boolean; data?: CheckInRecord[]; error?: string }> {
        try {
            const { data, error } = await supabase
                .from("check_ins")
                .select("*")
                .eq("event_id", eventId)
                .order("check_in_time", { ascending: false });

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data: data || [] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get attendance statistics
     */
    static async getAttendanceStats(eventId: string): Promise<{
        total: number;
        checkedIn: number;
        checkedOut: number;
        present: number;
    }> {
        try {
            const { data, error } = await supabase
                .from("check_ins")
                .select("*")
                .eq("event_id", eventId);

            if (error || !data) {
                return { total: 0, checkedIn: 0, checkedOut: 0, present: 0 };
            }

            const checkedIn = data.filter((record) => record.check_in_time).length;
            const checkedOut = data.filter((record) => record.check_out_time).length;
            const present = checkedIn - checkedOut;

            return {
                total: data.length,
                checkedIn,
                checkedOut,
                present,
            };
        } catch (error) {
            console.error("Error getting attendance stats:", error);
            return { total: 0, checkedIn: 0, checkedOut: 0, present: 0 };
        }
    }

    /**
     * Invalidate a QR code
     */
    static async invalidateQRCode(
        qrCodeData: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from("check_ins")
                .update({ is_valid: false })
                .eq("qr_code_data", qrCodeData);

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
