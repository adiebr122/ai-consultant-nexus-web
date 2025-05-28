
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // Check if bucket exists first to avoid errors
    const { data: buckets } = await supabase.storage.listBuckets();
    const portfolioBucketExists = buckets?.some(bucket => bucket.name === 'portfolio-images');

    if (!portfolioBucketExists) {
      // Create portfolio images bucket
      const { error } = await supabase.storage.createBucket('portfolio-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};
