import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatTimeLeft } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import BidModal from '@/components/auction/bid-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  DollarSign, 
  Tag, 
  Truck, 
  Shield, 
  User, 
  MessageCircle,
  ThumbsUp,
  Eye,
  Share2,
  Heart,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const AuctionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  const { data: auction, isLoading } = useQuery({
    queryKey: [`/api/auctions/${id}`],
  });

  const { data: bids, isLoading: isLoadingBids } = useQuery({
    queryKey: [`/api/auctions/${id}/bids`],
  });

  const watchlistMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        'POST', 
        `/api/user/watchlist/${id}`, 
        { action: isWatchlisted ? 'remove' : 'add' }
      );
      return response.json();
    },
    onSuccess: () => {
      setIsWatchlisted(!isWatchlisted);
      toast({
        title: isWatchlisted ? 'Removed from watchlist' : 'Added to watchlist',
        description: isWatchlisted 
          ? 'This auction has been removed from your watchlist.' 
          : 'This auction has been added to your watchlist.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Check if auction is in user's watchlist
  useEffect(() => {
    if (user && auction) {
      const checkWatchlist = async () => {
        try {
          const response = await fetch(`/api/user/watchlist/check/${auction.id}`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            setIsWatchlisted(data.isWatchlisted);
          }
        } catch (error) {
          console.error('Error checking watchlist status:', error);
        }
      };
      
      checkWatchlist();
    }
  }, [user, auction]);

  // Update time left
  useEffect(() => {
    if (!auction) return;
    
    const updateTimeLeft = () => {
      setTimeLeft(formatTimeLeft(auction.endTime));
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [auction]);

  const handleToggleWatchlist = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add items to your watchlist',
        variant: 'destructive',
      });
      return;
    }
    
    watchlistMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: auction?.title,
        text: `Check out this auction: ${auction?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link copied',
          description: 'Auction link copied to clipboard!',
        });
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary">Loading auction details...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!auction) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-neutral py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h2 className="text-2xl font-bold text-secondary mb-4">Auction Not Found</h2>
              <p className="text-secondary-light mb-6">
                The auction you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/auctions">
                <a className="inline-flex items-center text-primary hover:underline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Auctions
                </a>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-neutral min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/">
                  <a className="text-secondary-light hover:text-primary">Home</a>
                </Link>
              </li>
              <li className="text-secondary-light">/</li>
              <li>
                <Link href="/auctions">
                  <a className="text-secondary-light hover:text-primary">Auctions</a>
                </Link>
              </li>
              <li className="text-secondary-light">/</li>
              <li className="text-primary font-medium truncate max-w-xs">{auction.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-96 object-contain p-4"
                  />
                  <Badge 
                    className="absolute top-4 right-4 bg-primary text-white px-2 py-1 timer-badge"
                  >
                    {timeLeft}
                  </Badge>
                </div>
                
                {auction.images?.length > 0 && (
                  <div className="p-4 grid grid-cols-5 gap-2">
                    {auction.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${auction.title} thumbnail ${index + 1}`}
                        className="h-20 w-full object-cover rounded-md cursor-pointer hover:opacity-80 transition"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Auction details tabs */}
              <div className="bg-white rounded-lg shadow-md mt-6 p-6">
                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    <TabsTrigger value="seller">Seller Info</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <h3 className="text-xl font-semibold text-secondary mb-4">Item Description</h3>
                    <div className="prose max-w-none text-secondary-light">
                      <p>{auction.description}</p>
                      
                      {auction.details && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-secondary mb-2">Specifications</h4>
                          <ul className="space-y-2">
                            {Object.entries(auction.details).map(([key, value]) => (
                              <li key={key} className="flex">
                                <span className="w-1/3 font-medium text-secondary">{key}:</span>
                                <span className="w-2/3 text-secondary-light">{value}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="shipping">
                    <h3 className="text-xl font-semibold text-secondary mb-4">Shipping Information</h3>
                    <div className="text-secondary-light">
                      <div className="flex items-start mb-4">
                        <Truck className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-secondary">Shipping Method</p>
                          <p>{auction.shipping?.method || 'Standard shipping'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start mb-4">
                        <DollarSign className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-secondary">Shipping Cost</p>
                          <p>{formatCurrency(auction.shipping?.cost || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-primary mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-secondary">Estimated Delivery</p>
                          <p>{auction.shipping?.estimatedDelivery || '3-5 business days after payment'}</p>
                        </div>
                      </div>
                      
                      {auction.shipping?.restrictions && (
                        <div className="mt-6 p-4 bg-neutral rounded-md">
                          <p className="font-medium text-secondary mb-2">Shipping Restrictions:</p>
                          <p>{auction.shipping.restrictions}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seller">
                    <h3 className="text-xl font-semibold text-secondary mb-4">About the Seller</h3>
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-neutral rounded-full flex items-center justify-center text-primary mr-4">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-secondary">{auction.seller?.name || 'Seller Name'}</h4>
                        <div className="flex items-center text-yellow-500">
                          {Array(5).fill().map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < (auction.seller?.rating || 0) ? 'fill-current' : 'text-gray-300'}`} 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                          <span className="ml-2 text-secondary-light">
                            ({auction.seller?.reviewCount || 0} reviews)
                          </span>
                        </div>
                        <p className="text-secondary-light mt-1">
                          Member since {auction.seller?.memberSince || 'January 2020'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{auction.seller?.auctionsCount || 0}</p>
                          <p className="text-secondary-light">Auctions</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{auction.seller?.soldItems || 0}</p>
                          <p className="text-secondary-light">Items Sold</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{auction.seller?.responseRate || '98%'}</p>
                          <p className="text-secondary-light">Response Rate</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: 'Message sent',
                            description: `Your message to ${auction.seller?.name || 'the seller'} has been sent.`,
                          });
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right column - Bid info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-secondary mb-2">{auction.title}</h2>
                <div className="flex items-center mb-4">
                  <Badge className="bg-secondary-light text-white mr-2">
                    {auction.category}
                  </Badge>
                  <span className="text-secondary-light text-sm">
                    Item #{auction.id}
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-secondary-light">Current Bid:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(auction.currentBid)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-secondary-light">Bids:</span>
                    <span className="font-medium text-secondary">{auction.bidCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-light">Time Left:</span>
                    <span className="font-medium text-secondary">{timeLeft}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mb-4 bg-primary hover:bg-primary-dark text-white"
                  onClick={() => setIsBidModalOpen(true)}
                >
                  Place Bid
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleToggleWatchlist}
                    disabled={watchlistMutation.isPending}
                  >
                    <Heart 
                      className={`w-4 h-4 mr-2 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    {isWatchlisted ? 'Watching' : 'Watch'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              {/* Bid history */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-secondary mb-4">Bid History</h3>
                
                {isLoadingBids ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-primary" />
                  </div>
                ) : bids && bids.length > 0 ? (
                  <div className="space-y-4">
                    {bids.map((bid, index) => (
                      <div key={bid.id} className="flex justify-between items-center">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-neutral rounded-full flex items-center justify-center text-primary mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-secondary">
                              {bid.user.username.substring(0, 2)}****{bid.user.username.slice(-2)}
                            </p>
                            <p className="text-sm text-secondary-light">
                              {new Date(bid.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatCurrency(bid.amount)}</p>
                          {index === 0 && (
                            <Badge className="bg-primary text-white">Highest Bid</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-secondary-light">
                    <p>No bids yet. Be the first to bid!</p>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Buyer Protection</p>
                      <p className="text-sm text-secondary-light">
                        Full refund if item is not as described
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-primary mr-3" />
                    <div>
                      <p className="font-medium text-secondary">Auction Views</p>
                      <p className="text-sm text-secondary-light">
                        {auction.viewCount || 152} people viewed this item
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Similar items */}
          {auction.similarItems && auction.similarItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-secondary mb-6">Similar Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {auction.similarItems.map(item => (
                  <AuctionCard key={item.id} auction={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <BidModal 
        isOpen={isBidModalOpen} 
        onClose={() => setIsBidModalOpen(false)} 
        auction={auction} 
      />
      
      <Footer />
    </>
  );
};

export default AuctionDetailPage;
