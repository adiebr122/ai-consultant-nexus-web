
import { Code } from 'lucide-react';

interface EmptyPortfolioProps {
  selectedCategory: string;
}

export const EmptyPortfolio = ({ selectedCategory }: EmptyPortfolioProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Code className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Portfolio</h3>
      <p className="text-gray-600">
        Portfolio untuk kategori "{selectedCategory}" belum tersedia.
      </p>
    </div>
  );
};
