import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const invoiceSchema = z.object({
  invoice_number: z.string().min(3, {
    message: "Nomor invoice harus lebih dari 3 karakter.",
  }),
  client_name: z.string().min(3, {
    message: "Nama klien harus lebih dari 3 karakter.",
  }),
  client_email: z.string().email({
    message: "Format email tidak valid.",
  }),
  client_company: z.string().optional(),
  client_address: z.string().optional(),
  invoice_date: z.date(),
  due_date: z.date().optional(),
  subtotal: z.number(),
  tax_percentage: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  status: z.enum(['pending', 'paid', 'overdue']),
  notes: z.string().optional(),
  terms_conditions: z.string().optional(),
})

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  client_address?: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes?: string;
  terms_conditions?: string;
}

const InvoiceManager = () => {
  const [open, setOpen] = useState(false)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: "",
      client_name: "",
      client_email: "",
      client_company: "",
      client_address: "",
      invoice_date: new Date(),
      due_date: new Date(),
      subtotal: 0,
      tax_percentage: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'pending',
      notes: "",
      terms_conditions: "",
    },
  })

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    }
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (newInvoice: z.infer<typeof invoiceSchema>) => {
      const { error } = await supabase
        .from('invoices')
        .insert(newInvoice);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Invoice Berhasil Dibuat",
        description: "Invoice baru telah berhasil dibuat.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal membuat invoice: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async (updatedInvoice: Invoice) => {
      const { error } = await supabase
        .from('invoices')
        .update(updatedInvoice)
        .eq('id', updatedInvoice.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setOpen(false);
      setEditInvoice(null);
      form.reset();
      toast({
        title: "Invoice Berhasil Diperbarui",
        description: "Invoice telah berhasil diperbarui.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal memperbarui invoice: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Invoice Berhasil Dihapus",
        description: "Invoice telah berhasil dihapus.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Gagal menghapus invoice: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Send invoice email mutation
  const sendInvoiceEmailMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await fetch('/functions/v1/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ invoiceId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invoice email');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Terkirim",
        description: "Invoice berhasil dikirim ke email klien dan admin",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal mengirim email: " + error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: z.infer<typeof invoiceSchema>) => {
    if (editInvoice) {
      updateInvoiceMutation.mutate({ id: editInvoice.id, ...values } as Invoice);
    } else {
      createInvoiceMutation.mutate(values);
    }
  }

  const handleDelete = (id: string) => {
    deleteInvoiceMutation.mutate(id);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setOpen(true);
    form.setValue('invoice_number', invoice.invoice_number);
    form.setValue('client_name', invoice.client_name);
    form.setValue('client_email', invoice.client_email);
    form.setValue('client_company', invoice.client_company || "");
    form.setValue('client_address', invoice.client_address || "");
    form.setValue('invoice_date', new Date(invoice.invoice_date));
    form.setValue('due_date', invoice.due_date ? new Date(invoice.due_date) : null);
    form.setValue('subtotal', invoice.subtotal);
    form.setValue('tax_percentage', invoice.tax_percentage);
    form.setValue('tax_amount', invoice.tax_amount);
    form.setValue('total_amount', invoice.total_amount);
    form.setValue('status', invoice.status as "pending" | "paid" | "overdue");
    form.setValue('notes', invoice.notes || "");
    form.setValue('terms_conditions', invoice.terms_conditions || "");
  };

  const handleSendEmail = (invoice: any) => {
    if (!invoice.client_email) {
      toast({
        title: "Error",
        description: "Email klien tidak tersedia",
        variant: "destructive",
      });
      return;
    }
    sendInvoiceEmailMutation.mutate(invoice.id);
  };

  const handleView = (invoice: Invoice) => {
    // Implement view functionality here
    toast({
      title: "Lihat Invoice",
      description: "Fitur lihat invoice akan segera hadir.",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daftar Invoice</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editInvoice ? "Edit Invoice" : "Buat Invoice Baru"}</DialogTitle>
              <DialogDescription>
                Isi semua form di bawah ini untuk membuat invoice baru.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Invoice</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Klien</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Klien</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perusahaan Klien (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="PT. Maju Jaya" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Klien (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jl. Pahlawan No. 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Invoice</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-[240px] pl-3 text-left font-normal" +
                                  (field.value ? " text-foreground" : " text-muted-foreground")
                                }
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              locale={id}
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Tanggal Jatuh Tempo (Opsional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={
                                  "w-[240px] pl-3 text-left font-normal" +
                                  (field.value ? " text-foreground" : " text-muted-foreground")
                                }
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              locale={id}
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persentase Pajak</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Pajak</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="110000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1110000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <select className="rounded-md border border-gray-300 px-3 py-2 w-full" {...field}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Catatan tambahan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syarat & Ketentuan (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Syarat dan ketentuan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{editInvoice ? "Update Invoice" : "Buat Invoice"}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Daftar semua invoice yang tersedia.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor Invoice</TableHead>
            <TableHead>Nama Klien</TableHead>
            <TableHead>Email Klien</TableHead>
            <TableHead>Tanggal Invoice</TableHead>
            <TableHead>Jatuh Tempo</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : invoices?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">Tidak ada data invoice.</TableCell>
            </TableRow>
          ) : (
            invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.client_name}</TableCell>
                <TableCell>{invoice.client_email}</TableCell>
                <TableCell>{format(new Date(invoice.invoice_date), 'PPP', { locale: id })}</TableCell>
                <TableCell>{invoice.due_date ? format(new Date(invoice.due_date), 'PPP', { locale: id }) : '-'}</TableCell>
                <TableCell>Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</TableCell>
                <TableCell>{invoice.status}</TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(invoice)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(invoice)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendEmail(invoice)}
                      disabled={!invoice.client_email || sendInvoiceEmailMutation.isPending}
                      title={!invoice.client_email ? "Email klien tidak tersedia" : "Kirim email invoice"}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} className="text-center">
              Total {invoices?.length} invoice
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default InvoiceManager;
