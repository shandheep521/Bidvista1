import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

const BidModal = ({ isOpen, onClose, auction }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      bidAmount: auction?.currentBid ? auction.currentBid + 25 : 0,
      maxBid: false,
      autoBid: false
    }
  });

  const minBidAmount = auction?.currentBid ? auction.currentBid + 25 : 0;

  const placeBidMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', `/api/auctions/${auction.id}/bids`, {
        amount: parseFloat(data.bidAmount),
        maxBid: data.maxBid,
        autoBid: data.autoBid
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['api/auctions']);
      queryClient.invalidateQueries([`api/auctions/${auction.id}`]);
      toast({
        title: 'Bid placed successfully!',
        description: 'You are now the highest bidder.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to place bid',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to place a bid',
        variant: 'destructive',
      });
      onClose();
      return;
    }
    
    placeBidMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Enter your bid amount for {auction?.title}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <h4 className="font-medium text-secondary mb-1">{auction?.title}</h4>
            <p className="text-secondary-light text-sm">Current Bid: {formatCurrency(auction?.currentBid)}</p>
            <p className="text-secondary-light text-sm">Minimum Bid: {formatCurrency(minBidAmount)}</p>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="bidAmount" className="block text-secondary-light text-sm font-medium mb-1">
              Your Bid ($USD)
            </Label>
            <Input
              type="number"
              id="bidAmount"
              min={minBidAmount}
              step="5"
              {...register('bidAmount', { 
                required: 'Bid amount is required',
                min: {
                  value: minBidAmount,
                  message: `Minimum bid is ${formatCurrency(minBidAmount)}`
                }
              })}
              className={errors.bidAmount ? 'border-red-500' : ''}
            />
            {errors.bidAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.bidAmount.message}</p>
            )}
            <p className="mt-1 text-xs text-secondary-light">
              Enter {formatCurrency(minBidAmount)} or more
            </p>
          </div>
          
          <div className="mb-4">
            <Label className="block text-secondary-light text-sm font-medium mb-1">
              Bid Options
            </Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox 
                  id="maxBid" 
                  {...register('maxBid')} 
                  className="mr-2" 
                />
                <Label htmlFor="maxBid" className="text-secondary-light text-sm">
                  Set maximum bid
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="autoBid" 
                  {...register('autoBid')} 
                  className="mr-2" 
                />
                <Label htmlFor="autoBid" className="text-secondary-light text-sm">
                  Enable automatic bidding
                </Label>
              </div>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-neutral rounded-md">
            <p className="text-sm text-secondary">
              By placing a bid, you agree to the <a href="#" className="text-primary">Terms of Service</a> and commit to purchase the item if you win.
            </p>
          </div>
          
          <DialogFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark" disabled={placeBidMutation.isPending}>
              {placeBidMutation.isPending ? 'Processing...' : 'Place Bid'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
