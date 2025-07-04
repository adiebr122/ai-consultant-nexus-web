
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Star, Briefcase, Users, Mail, MessageSquare } from 'lucide-react';
import HeroEditor from './HeroEditor';
import ServiceManager from './ServiceManager';
import PortfolioManager from './PortfolioManager';
import TestimonialManager from './TestimonialManager';
import ContactInfoManager from './ContactInfoManager';
import ClientLogosManager from './ClientLogosManager';

const HomePageManager = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold flex items-center mb-2">
            <Home className="h-8 w-8 mr-3 text-blue-200" />
            Kelola Halaman Depan
          </CardTitle>
          <CardDescription className="text-blue-100 text-lg">
            Kelola semua konten yang tampil di halaman depan website
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="hero" className="flex flex-col items-center gap-1 py-3">
            <Star className="h-4 w-4" />
            <span className="text-xs">Hero</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex flex-col items-center gap-1 py-3">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Layanan</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex flex-col items-center gap-1 py-3">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="flex flex-col items-center gap-1 py-3">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Testimoni</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex flex-col items-center gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">Klien</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex flex-col items-center gap-1 py-3">
            <Mail className="h-4 w-4" />
            <span className="text-xs">Kontak</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Editor Hero Section
              </CardTitle>
              <CardDescription>
                Kelola konten utama yang pertama dilihat pengunjung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Kelola Layanan
              </CardTitle>
              <CardDescription>
                Tambah, edit, dan atur layanan yang ditampilkan di homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                Kelola Portfolio
              </CardTitle>
              <CardDescription>
                Tampilkan proyek-proyek terbaik di halaman depan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Kelola Testimoni
              </CardTitle>
              <CardDescription>
                Tampilkan testimoni klien untuk membangun kepercayaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestimonialManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Kelola Logo Klien
              </CardTitle>
              <CardDescription>
                Tampilkan logo klien untuk menunjukkan kredibilitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientLogosManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-500" />
                Kelola Info Kontak
              </CardTitle>
              <CardDescription>
                Atur informasi kontak yang ditampilkan di website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactInfoManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomePageManager;
