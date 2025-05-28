
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingWrapperProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  loading, 
  error, 
  children, 
  skeleton 
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return skeleton || (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>Memuat...</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
