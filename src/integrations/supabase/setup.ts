
import { supabase } from './client';

export const setupStorage = async () => {
  try {
    console.log('Initializing Supabase storage...');
    
    // Check if buckets exist first to avoid errors
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return;
    }
    
    const bucketsToCreate = [
      {
        id: 'brand-assets',
        options: {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        }
      },
      {
        id: 'portfolio-images',
        options: {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        }
      },
      {
        id: 'client-logos',
        options: {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
        }
      }
    ];
    
    for (const bucket of bucketsToCreate) {
      const bucketExists = buckets?.some(b => b.name === bucket.id);
      
      if (!bucketExists) {
        try {
          // Try creating bucket with service role if available
          const { error } = await supabase.storage.createBucket(bucket.id, bucket.options);
          
          if (error) {
            console.error(`Error creating storage bucket ${bucket.id}:`, error);
            // Continue without throwing - app should still work with external URLs
          } else {
            console.log(`Storage bucket ${bucket.id} created successfully`);
          }
        } catch (err) {
          console.error(`Error creating storage bucket ${bucket.id}:`, err);
          // Continue without throwing - app should still work with external URLs
        }
      } else {
        console.log(`Storage bucket ${bucket.id} already exists`);
      }
    }
    
    console.log('Supabase storage initialization complete');
  } catch (error) {
    console.error('Error setting up storage:', error);
    // Don't throw - app should still work without storage
  }
};

// Function to check if storage is available
export const checkStorageAvailability = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('Storage not available:', error);
      return false;
    }
    
    const hasBrandAssets = buckets?.some(b => b.name === 'brand-assets');
    const hasPortfolioImages = buckets?.some(b => b.name === 'portfolio-images');
    const hasClientLogos = buckets?.some(b => b.name === 'client-logos');
    
    return hasBrandAssets && hasPortfolioImages && hasClientLogos;
  } catch (error) {
    console.warn('Storage check failed:', error);
    return false;
  }
};
