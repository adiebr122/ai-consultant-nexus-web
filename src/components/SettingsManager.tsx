
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Search, Palette, BarChart3, Globe, Phone } from 'lucide-react';
import SEOSettings from '@/components/SEOSettings';
import BrandSettings from '@/components/BrandSettings';
import AnalyticsSettings from '@/components/AnalyticsSettings';
import ContactInfoManager from '@/components/ContactInfoManager';
import { setupStorage } from '@/integrations/supabase/setup';

const SettingsManager = () => {
  useEffect(() => {
    // Initialize storage buckets on component mount
    setupStorage();
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-6 w-6 mr-3 text-blue-600" />
          Pengaturan Website
        </h2>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>Kontak</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="brand" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Brand</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="contact" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <ContactInfoManager />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <SEOSettings />
            </div>
          </TabsContent>

          <TabsContent value="brand" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <BrandSettings />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <AnalyticsSettings />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsManager;
