import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import AuctionCard from '@/components/auction/auction-card';
import CategoryCard from '@/components/auction/category-card';
import { Button } from '@/components/ui/button';
import { Package, Monitor, Palette, ShoppingBag, Users, BookOpen, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const { data: featuredAuctions, isLoading: isLoadingAuctions } = useQuery({
    queryKey: ['/api/auctions/featured'],
  });

  const categories = [
    { slug: 'collectibles', name: 'Collectibles', icon: Package },
    { slug: 'electronics', name: 'Electronics', icon: Monitor },
    { slug: 'art', name: 'Art', icon: Palette },
    { slug: 'fashion', name: 'Fashion', icon: ShoppingBag },
    { slug: 'antiques', name: 'Antiques', icon: Users },
    { slug: 'books', name: 'Books', icon: BookOpen }
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="bg-primary relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-sans leading-tight">
                Find Unique Items and Great Deals
              </h1>
              <p className="mt-4 text-lg text-white opacity-90">
                BidVista connects buyers and sellers through our trusted auction platform. Discover collectibles, art, electronics, and more.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/auctions">
                  <a className="bg-white text-primary px-5 py-3 rounded-md font-medium hover:bg-neutral transition">
                    Browse Auctions
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="bg-secondary text-white px-5 py-3 rounded-md font-medium hover:bg-secondary-light transition">
                    Start Selling
                  </a>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="People at auction"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section id="browse" className="py-12 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary font-sans">Featured Auctions</h2>
              <p className="mt-2 text-secondary-light">Ending soon - place your bids now!</p>
            </div>
            <Link href="/auctions">
              <a className="text-primary hover:text-primary-dark font-medium flex items-center">
                View all
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingAuctions ? (
              // Skeleton loaders
              Array(4).fill().map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md p-4">
                  <div className="w-full h-48 bg-gray-200 animate-pulse rounded"></div>
                  <div className="mt-4 h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 animate-pulse rounded w-full"></div>
                  <div className="mt-3 flex justify-between">
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4"></div>
                  </div>
                  <div className="mt-3 h-10 bg-gray-200 animate-pulse rounded w-full"></div>
                </div>
              ))
            ) : featuredAuctions?.length > 0 ? (
              featuredAuctions.map(auction => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            ) : (
              <p className="col-span-full text-center py-8 text-secondary-light">
                No featured auctions available at the moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-secondary font-sans">Explore Categories</h2>
            <p className="mt-2 text-secondary-light">Find the perfect items in our curated categories</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-neutral-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-secondary font-sans">How BidVista Works</h2>
            <p className="mt-2 text-secondary-light">Simple steps to start bidding or selling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Register an Account</h3>
              <p className="text-secondary-light">Sign up for free and complete your profile to get started with BidVista.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Browse or List Items</h3>
              <p className="text-secondary-light">Find items to bid on or list your own items for auction with detailed descriptions.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">Bid & Win or Sell & Earn</h3>
              <p className="text-secondary-light">Place bids on items you want or track your listings and connect with buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Info Section */}
      <section id="sell" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary font-sans">Start Selling Today</h2>
              <p className="mt-4 text-secondary-light">
                Join thousands of sellers who trust BidVista to reach millions of potential buyers. 
                Our platform makes it easy to list your items, manage bids, and complete transactions.
              </p>
              
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="ml-2 text-secondary-light">Simple listing process with multiple images</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="ml-2 text-secondary-light">Manage inventory and track auction performance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="ml-2 text-secondary-light">Choose from multiple auction types</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="ml-2 text-secondary-light">Secure payment processing and shipping tools</span>
                </li>
              </ul>
              
              <Link href="/auth">
                <a className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-dark transition">
                  Create Seller Account
                </a>
              </Link>
            </div>
            
            <div className="relative hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1593514314730-d68151ce9e6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                alt="Seller displaying item" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-secondary font-sans">What Our Users Say</h2>
            <p className="mt-2 text-secondary-light">Hear from our community of buyers and sellers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-primary flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-secondary-light mb-4">
                "I've been collecting vintage cameras for years, and BidVista has been the best platform to find rare pieces. 
                The bidding process is seamless, and the notifications keep me updated."
              </p>
              <div className="flex items-center">
                <span className="font-medium text-secondary">Michael L.</span>
                <span className="mx-2 text-secondary-light">•</span>
                <span className="text-secondary-light">Collector</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-primary flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-secondary-light mb-4">
                "As a seller, BidVista has transformed my business. The platform makes it simple to list items, 
                manage auctions, and connect with serious buyers. The seller dashboard is intuitive and powerful."
              </p>
              <div className="flex items-center">
                <span className="font-medium text-secondary">Sarah K.</span>
                <span className="mx-2 text-secondary-light">•</span>
                <span className="text-secondary-light">Antique Dealer</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-primary flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-secondary-light mb-4">
                "I was skeptical about online auctions until I tried BidVista. The detailed item descriptions 
                and secure bidding gave me confidence. I've found amazing deals on electronics that would have cost much more elsewhere."
              </p>
              <div className="flex items-center">
                <span className="font-medium text-secondary">James R.</span>
                <span className="mx-2 text-secondary-light">•</span>
                <span className="text-secondary-light">Tech Enthusiast</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
