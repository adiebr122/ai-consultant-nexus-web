
import { useState } from 'react';
import PortfolioManager from '@/components/PortfolioManager';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortfolioAdmin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali ke Admin
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Kelola Portfolio
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortfolioManager />
      </div>
    </div>
  );
};

export default PortfolioAdmin;
