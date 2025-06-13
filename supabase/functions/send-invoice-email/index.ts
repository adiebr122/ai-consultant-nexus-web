
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoiceId: string;
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
    const { invoiceId }: InvoiceEmailRequest = await req.json();

    // Get invoice details with items
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Format items for email
    const itemsHtml = invoice.invoice_items?.map(item => `
      <tr style="border-bottom: 1px solid #e5e5e5;">
        <td style="padding: 12px; text-align: left;">${item.item_name}</td>
        <td style="padding: 12px; text-align: left; color: #666; font-size: 14px;">${item.description || ''}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">Rp ${Number(item.unit_price).toLocaleString('id-ID')}</td>
        <td style="padding: 12px; text-align: right;">Rp ${Number(item.total).toLocaleString('id-ID')}</td>
      </tr>
    `).join('') || '';

    const statusColor = invoice.status === 'paid' ? '#28a745' : invoice.status === 'overdue' ? '#dc3545' : '#ffc107';
    const statusText = invoice.status === 'paid' ? 'LUNAS' : invoice.status === 'overdue' ? 'TERLAMBAT' : 'BELUM LUNAS';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">AI Consultant Pro</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Invoice Resmi</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-radius: 0 0 10px 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0;">Invoice #${invoice.invoice_number}</h2>
            <span style="background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 12px;">
              ${statusText}
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div>
              <p><strong>Kepada:</strong><br>
              ${invoice.client_name}<br>
              ${invoice.client_company ? invoice.client_company + '<br>' : ''}
              ${invoice.client_email}<br>
              ${invoice.client_address || ''}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Tanggal Invoice:</strong> ${new Date(invoice.invoice_date).toLocaleDateString('id-ID')}<br>
              <strong>Jatuh Tempo:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Deskripsi</th>
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
              <p style="margin: 5px 0;"><strong>Subtotal: Rp ${Number(invoice.subtotal).toLocaleString('id-ID')}</strong></p>
              <p style="margin: 5px 0;">PPN (${invoice.tax_percentage}%): Rp ${Number(invoice.tax_amount).toLocaleString('id-ID')}</p>
              <div style="border-top: 2px solid #333; padding-top: 10px; margin-top: 10px;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">
                  Total: Rp ${Number(invoice.total_amount).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          ${invoice.notes ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="margin-top: 0; color: #333;">Catatan:</h4>
              <p style="margin-bottom: 0; white-space: pre-line;">${invoice.notes}</p>
            </div>
          ` : ''}

          ${invoice.terms_conditions ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h4 style="margin-top: 0; color: #856404;">Syarat & Ketentuan:</h4>
              <p style="margin-bottom: 0; white-space: pre-line; color: #856404;">${invoice.terms_conditions}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; margin: 0;">Terima kasih atas kepercayaan Anda kepada AI Consultant Pro</p>
            <p style="color: #666; margin: 5px 0 0 0;">Silakan lakukan pembayaran sesuai dengan ketentuan</p>
          </div>
        </div>
      </div>
    `;

    // Send to client
    await resend.emails.send({
      from: "AI Consultant Pro <noreply@aicp.id>",
      to: [invoice.client_email],
      subject: `Invoice #${invoice.invoice_number} - AI Consultant Pro`,
      html: emailBody,
    });

    // Send to admin
    await resend.emails.send({
      from: "AI Consultant Pro <noreply@aicp.id>",
      to: ["visualmediaxcs@gmail.com"],
      subject: `[ADMIN] Invoice #${invoice.invoice_number} telah dikirim`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Invoice Telah Dikirim</h2>
          <p>Invoice #${invoice.invoice_number} telah dikirim kepada:</p>
          <ul>
            <li><strong>Klien:</strong> ${invoice.client_name}</li>
            <li><strong>Email:</strong> ${invoice.client_email}</li>
            <li><strong>Perusahaan:</strong> ${invoice.client_company || '-'}</li>
            <li><strong>Total:</strong> Rp ${Number(invoice.total_amount).toLocaleString('id-ID')}</li>
            <li><strong>Status:</strong> ${statusText}</li>
            <li><strong>Jatuh Tempo:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</li>
          </ul>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Invoice email sent successfully' }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
