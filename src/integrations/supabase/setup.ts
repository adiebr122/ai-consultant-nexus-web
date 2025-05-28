
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    // Create portfolio-images bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const portfolioBucket = buckets?.find(bucket => bucket.name === 'portfolio-images');
    
    if (!portfolioBucket) {
      console.log('Creating portfolio-images bucket...');
      const { error: createError } = await supabase.storage.createBucket('portfolio-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating portfolio-images bucket:', createError);
      } else {
        console.log('Portfolio-images bucket created successfully');
      }
    } else {
      console.log('Portfolio-images bucket already exists');
    }
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
};

// Call setup when the module is imported
setupStorage();
