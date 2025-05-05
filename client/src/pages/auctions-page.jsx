import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import AuctionCard from '@/components/auction/auction-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { SearchIcon, Filter, Loader2 } from 'lucide-react';

const AuctionsPage = () => {
  const [searchParams] = useLocation();
  const params = new URLSearchParams(searchParams);
  const categoryFromUrl = params.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || '');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState('ending-soon');
  const [filteredResults, setFilteredResults] = useState([]);
  
  const { data: auctions, isLoading } = useQuery({
    queryKey: ['/api/auctions'],
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Apply filters and sorting
  useEffect(() => {
    if (!auctions) return;
    
    let results = [...auctions];
    
    // Apply search filter
    if (searchQuery) {
      results = results.filter(auction => 
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(auction => auction.category === selectedCategory);
    }
    
    // Apply price filter
    results = results.filter(auction => 
      auction.currentBid >= priceRange[0] && auction.currentBid <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortOption) {
      case 'ending-soon':
        results.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        break;
      case 'price-low':
        results.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price-high':
        results.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'most-bids':
        results.sort((a, b) => b.bidCount - a.bidCount);
        break;
      default:
        break;
    }
    
    setFilteredResults(results);
  }, [auctions, searchQuery, selectedCategory, priceRange, sortOption]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The actual filtering happens in the useEffect
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setSortOption('ending-soon');
  };

  return (
    <>
      <Header />
      <div className="bg-neutral min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-secondary mb-8">Browse Auctions</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-secondary mb-6">Filters</h2>
                
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search auctions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <SearchIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </form>
                
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Category</Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map(category => (
                          <SelectItem key={category.slug} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Price Range</Label>
                    <div className="pt-4 pb-2">
                      <Slider
                        min={0}
                        max={10000}
                        step={50}
                        value={priceRange}
                        onValueChange={handlePriceChange}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-secondary-light">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Sort By</Label>
                    <Select value={sortOption} onValueChange={handleSortChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ending-soon">Ending Soon</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="most-bids">Most Bids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleReset}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Auction listings */}
            <div className="lg:col-span-3">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-secondary-light" />
                    <span className="text-secondary font-medium">
                      {isLoading 
                        ? 'Loading auctions...' 
                        : `Showing ${filteredResults.length} auctions`}
                    </span>
                  </div>
                  <div className="text-secondary-light">
                    <span className="hidden md:inline">Sort by: </span>
                    <Select value={sortOption} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="ending-soon">Ending Soon</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="most-bids">Most Bids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-secondary">Loading auctions...</span>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-semibold text-secondary mb-2">No auctions found</h3>
                  <p className="text-secondary-light mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button variant="outline" onClick={handleReset}>Reset Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AuctionsPage;
