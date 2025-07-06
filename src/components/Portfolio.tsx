
import { useState } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { PortfolioGrid } from './portfolio/PortfolioGrid';
import { CategoryFilter } from './portfolio/CategoryFilter';
import { EmptyPortfolio } from './portfolio/EmptyPortfolio';
import { LoadingSpinner } from './portfolio/LoadingSpinner';

const Portfolio = () => {
  const { portfolios, loading } = usePortfolioData();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(portfolios.map(p => p.project_category)))];
  
  const filteredPortfolios = selectedCategory === 'all' 
    ? portfolios 
    : portfolios.filter(p => p.project_category === selectedCategory);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section id="portfolio" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Portfolio Kami
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat hasil karya terbaik kami dalam berbagai proyek yang telah kami kerjakan
          </p>
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {filteredPortfolios.length > 0 ? (
          <PortfolioGrid portfolios={filteredPortfolios} />
        ) : (
          <EmptyPortfolio selectedCategory={selectedCategory} />
        )}
      </div>
    </section>
  );
};

export default Portfolio;
