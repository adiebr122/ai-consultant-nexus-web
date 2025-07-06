
import React from 'react';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
}

const ServiceDetail = ({ service, onBack }: ServiceDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar
        </Button>
        <Badge variant={service.is_active ? "default" : "secondary"}>
          {service.is_active ? 'Aktif' : 'Non-aktif'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Dibuat: {new Date(service.created_at).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Diperbarui: {new Date(service.updated_at).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {service.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceDetail;
