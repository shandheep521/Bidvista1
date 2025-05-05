import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatTimeLeft } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Package, 
  PlusCircle, 
  Trash, 
  Edit, 
  Eye, 
  DollarSign, 
  Clock, 
  BarChart3, 
  Users, 
  Tag, 
  ChevronRight, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

const newAuctionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Please select a category'),
  startingBid: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val > 0, 'Starting bid must be greater than 0'),
  duration: z.string(),
  image: z.string().url('Please enter a valid image URL'),
  shippingCost: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, 'Shipping cost must be a valid number'),
  condition: z.string()
});

const SellerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isNewAuctionOpen, setIsNewAuctionOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const form = useForm({
    resolver: zodResolver(newAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      startingBid: '',
      duration: '7',
      image: '',
      shippingCost: '',
      condition: 'new'
    }
  });

  // Fetch seller's auctions
  const { data: auctions, isLoading: isLoadingAuctions } = useQuery({
    queryKey: ['/api/seller/auctions'],
  });

  // Fetch seller's dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/seller/stats'],
  });

  // Create new auction mutation
  const createAuctionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/auctions', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Auction created successfully',
        description: 'Your new auction has been listed',
      });
      queryClient.invalidateQueries(['/api/seller/auctions']);
      queryClient.invalidateQueries(['/api/seller/stats']);
      setIsNewAuctionOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create auction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update auction mutation
  const updateAuctionMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('PUT', `/api/auctions/${editingAuction.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Auction updated successfully',
        description: 'Your auction has been updated',
      });
      queryClient.invalidateQueries(['/api/seller/auctions']);
      setEditingAuction(null);
      setIsNewAuctionOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update auction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete auction mutation
  const deleteAuctionMutation = useMutation({
    mutationFn: async (id) => {
      await apiRequest('DELETE', `/api/auctions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Auction deleted',
        description: 'Your auction has been removed',
      });
      queryClient.invalidateQueries(['/api/seller/auctions']);
      queryClient.invalidateQueries(['/api/seller/stats']);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete auction',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle auction creation/update
  const onSubmit = (data) => {
    if (editingAuction) {
      updateAuctionMutation.mutate(data);
    } else {
      createAuctionMutation.mutate(data);
    }
  };

  // Open edit auction dialog
  const handleEditAuction = (auction) => {
    setEditingAuction(auction);
    form.reset({
      title: auction.title,
      description: auction.description,
      category: auction.category,
      startingBid: auction.startingBid.toString(),
      duration: auction.duration || '7',
      image: auction.image,
      shippingCost: auction.shipping?.cost?.toString() || '0',
      condition: auction.condition || 'used'
    });
    setIsNewAuctionOpen(true);
  };

  // Handle auction deletion
  const handleDeleteAuction = (id) => {
    if (window.confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
      deleteAuctionMutation.mutate(id);
    }
  };

  // Filter auctions by status
  const filterAuctions = () => {
    if (!auctions) return [];
    
    switch (activeTab) {
      case 'active':
        return auctions.filter(auction => new Date(auction.endTime) > new Date());
      case 'sold':
        return auctions.filter(auction => auction.status === 'sold');
      case 'expired':
        return auctions.filter(auction => new Date(auction.endTime) <= new Date() && auction.status !== 'sold');
      case 'draft':
        return auctions.filter(auction => auction.status === 'draft');
      default:
        return auctions;
    }
  };

  const filteredAuctions = filterAuctions();

  // Display dashboard stats
  const renderStats = () => {
    if (isLoadingStats) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const statItems = [
      {
        icon: <Tag className="h-8 w-8 text-primary" />,
        label: 'Active Listings',
        value: stats?.activeListings || 0,
      },
      {
        icon: <DollarSign className="h-8 w-8 text-primary" />,
        label: 'Total Sales',
        value: formatCurrency(stats?.totalSales || 0),
      },
      {
        icon: <Users className="h-8 w-8 text-primary" />,
        label: 'Total Bids',
        value: stats?.totalBids || 0,
      },
      {
        icon: <BarChart3 className="h-8 w-8 text-primary" />,
        label: 'Conversion Rate',
        value: `${stats?.conversionRate || 0}%`,
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {statItems.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                {stat.icon}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-secondary">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="bg-neutral min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-secondary mb-2">Seller Dashboard</h1>
              <p className="text-secondary-light">Manage your auctions and track performance</p>
            </div>
            <Button 
              onClick={() => {
                setEditingAuction(null);
                form.reset();
                setIsNewAuctionOpen(true);
              }}
              className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Auction
            </Button>
          </div>

          {/* Stats Overview */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-secondary mb-4">Overview</h2>
            {renderStats()}
          </section>

          {/* Auctions Management */}
          <section>
            <h2 className="text-xl font-semibold text-secondary mb-4">Your Auctions</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="sold">Sold</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoadingAuctions ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredAuctions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAuctions.map((auction) => (
                      <Card key={auction.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-48 h-48 bg-neutral flex-shrink-0">
                            <img 
                              src={auction.image} 
                              alt={auction.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-grow p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-secondary mb-2">{auction.title}</h3>
                                <div className="flex items-center mb-2">
                                  <Badge className="mr-2 bg-secondary-light">{auction.category}</Badge>
                                  <span className="text-sm text-secondary-light">ID: {auction.id}</span>
                                </div>
                                <p className="text-secondary-light mb-4 line-clamp-2">{auction.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-primary mr-1" />
                                    <span>
                                      <span className="font-medium text-secondary">Current Bid: </span>
                                      {formatCurrency(auction.currentBid || auction.startingBid)}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 text-primary mr-1" />
                                    <span>
                                      <span className="font-medium text-secondary">Bids: </span>
                                      {auction.bidCount || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 text-primary mr-1" />
                                    <span>
                                      <span className="font-medium text-secondary">Status: </span>
                                      {new Date(auction.endTime) > new Date() ? 
                                        formatTimeLeft(auction.endTime) : 
                                        auction.status === 'sold' ? 'Sold' : 'Ended'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-6 flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => window.location.href = `/auctions/${auction.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditAuction(auction)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                              onClick={() => handleDeleteAuction(auction.id)}
                              disabled={deleteAuctionMutation.isPending}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-secondary mb-2">No auctions found</h3>
                      <p className="text-secondary-light mb-6">
                        {activeTab === 'active' ? "You don't have any active auctions." :
                         activeTab === 'sold' ? "You haven't sold any items yet." :
                         activeTab === 'expired' ? "You don't have any expired auctions." :
                         "You don't have any draft auctions."}
                      </p>
                      <Button 
                        onClick={() => {
                          setEditingAuction(null);
                          form.reset();
                          setIsNewAuctionOpen(true);
                        }}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Auction
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </section>

          {/* Create/Edit Auction Dialog */}
          <Dialog open={isNewAuctionOpen} onOpenChange={setIsNewAuctionOpen}>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingAuction ? 'Edit Auction' : 'Create New Auction'}</DialogTitle>
                <DialogDescription>
                  {editingAuction ? 
                    'Update your auction details below' : 
                    'Fill in the details below to list your item for auction'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Vintage Leica Camera" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="collectibles">Collectibles</SelectItem>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="art">Art</SelectItem>
                              <SelectItem value="fashion">Fashion</SelectItem>
                              <SelectItem value="antiques">Antiques</SelectItem>
                              <SelectItem value="books">Books</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="like-new">Like New</SelectItem>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="startingBid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Bid ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (days)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="3">3 days</SelectItem>
                              <SelectItem value="5">5 days</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="10">10 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Cost ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a direct URL to the main image of your item
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide a detailed description of your item..." 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewAuctionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary-dark" 
                      disabled={createAuctionMutation.isPending || updateAuctionMutation.isPending}
                    >
                      {(createAuctionMutation.isPending || updateAuctionMutation.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingAuction ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {editingAuction ? 'Update Auction' : 'Create Auction'}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerDashboard;
