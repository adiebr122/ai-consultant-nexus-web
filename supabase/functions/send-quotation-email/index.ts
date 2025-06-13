
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuotationEmailRequest {
  quotationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { quotationId }: QuotationEmailRequest = await req.json();

    // Get quotation details with items
    const { data: quotation, error: quotationError } = await supabaseClient
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      throw new Error('Quotation not found');
    }

    // Format items for email
    const itemsHtml = quotation.quotation_items?.map(item => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 12px; text-align: left;">${item.item_name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">Rp ${Number(item.unit_price).toLocaleString('id-ID')}</td>
        <td style="padding: 12px; text-align: right;">Rp ${Number(item.total).toLocaleString('id-ID')}</td>
      </tr>
    `).join('') || '';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">AI Consultant Pro</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Penawaran Resmi</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px;">
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Penawaran #${quotation.quotation_number}</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <p><strong>Kepada:</strong><br>
                ${quotation.client_name}<br>
                ${quotation.client_company ? quotation.client_company + '<br>' : ''}
                ${quotation.client_email}<br>
                ${quotation.client_address || ''}</p>
              </div>
              <div style="text-align: right;">
                <p><strong>Tanggal:</strong> ${new Date(quotation.quotation_date).toLocaleDateString('id-ID')}<br>
                <strong>Berlaku Hingga:</strong> ${quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('id-ID') : '-'}</p>
              </div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                <th style="padding: 15px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6;">Harga</th>
                <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 30px;">
            <div style="display: inline-block; text-align: right;">
              <p style="margin: 5px 0;"><strong>Subtotal: Rp ${Number(quotation.subtotal).toLocaleString('id-ID')}</strong></p>
              <p style="margin: 5px 0;">PPN (${quotation.tax_percentage}%): Rp ${Number(quotation.tax_amount).toLocaleString('id-ID')}</p>
              <div style="border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                  Total: Rp ${Number(quotation.total_amount).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          ${quotation.notes ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin-top: 0; color: #333;">Catatan:</h4>
              <p style="margin-bottom: 0; white-space: pre-line;">${quotation.notes}</p>
            </div>
          ` : ''}

          ${quotation.terms_conditions ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Syarat & Ketentuan:</h4>
              <p style="margin-bottom: 0; white-space: pre-line; color: #856404;">${quotation.terms_conditions}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; margin: 0;">Terima kasih atas kepercayaan Anda kepada AI Consultant Pro</p>
            <p style="color: #666; margin: 5px 0 0 0;">Hubungi kami untuk pertanyaan lebih lanjut</p>
          </div>
        </div>
      </div>
    `;

    // Send to client
    await resend.emails.send({
      from: "AI Consultant Pro <noreply@aicp.id>",
      to: [quotation.client_email],
      subject: `Penawaran #${quotation.quotation_number} - AI Consultant Pro`,
      html: emailBody,
    });

    // Send to admin
    await resend.emails.send({
      from: "AI Consultant Pro <noreply@aicp.id>",
      to: ["visualmediaxcs@gmail.com"],
      subject: `[ADMIN] Penawaran #${quotation.quotation_number} telah dikirim`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Penawaran Telah Dikirim</h2>
          <p>Penawaran #${quotation.quotation_number} telah dikirim kepada:</p>
          <ul>
            <li><strong>Klien:</strong> ${quotation.client_name}</li>
            <li><strong>Email:</strong> ${quotation.client_email}</li>
            <li><strong>Perusahaan:</strong> ${quotation.client_company || '-'}</li>
            <li><strong>Total:</strong> Rp ${Number(quotation.total_amount).toLocaleString('id-ID')}</li>
          </ul>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Quotation email sent successfully' }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending quotation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
