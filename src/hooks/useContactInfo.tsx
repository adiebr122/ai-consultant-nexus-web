
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  company_phone: string;
  company_email: string;
  company_address: string;
}

interface OperatingHour {
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    company_phone: '+62 21 5555 1234',
    company_email: 'hello@visualmediax.com',
    company_address: 'Menara BCA Lt. 25\nJl. MH Thamrin No. 1\nJakarta Pusat 10310'
  });
  
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([
    { day: 'Senin - Jumat', open_time: '09:00', close_time: '18:00', is_closed: false },
    { day: 'Sabtu', open_time: '09:00', close_time: '15:00', is_closed: false },
    { day: 'Minggu', open_time: '', close_time: '', is_closed: true }
  ]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      
      // Fetch contact info
      const { data: contactData } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_category', 'contact_info')
        .eq('is_public', true);

      if (contactData && contactData.length > 0) {
        const newContactInfo = { ...contactInfo };
        contactData.forEach(item => {
          if (item.setting_key in newContactInfo) {
            newContactInfo[item.setting_key as keyof ContactInfo] = item.setting_value || '';
          }
        });
        setContactInfo(newContactInfo);
      }

      // Fetch operating hours
      const { data: hoursData } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_category', 'operating_hours')
        .eq('setting_key', 'business_hours')
        .eq('is_public', true)
        .single();

      if (hoursData && hoursData.setting_value) {
        try {
          const parsedHours = JSON.parse(hoursData.setting_value);
          setOperatingHours(parsedHours);
        } catch (e) {
          console.error('Error parsing operating hours:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    contactInfo,
    operatingHours,
    loading,
    refetch: fetchContactInfo
  };
};
