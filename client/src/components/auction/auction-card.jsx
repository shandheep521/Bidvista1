import { useState } from 'react';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatTimeLeft, truncateText } from '@/lib/utils';
import BidModal from '@/components/auction/bid-modal';

const AuctionCard = ({ auction }) => {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const openBidModal = () => setIsBidModalOpen(true);
  const closeBidModal = () => setIsBidModalOpen(false);

  return (
    <>
      <Card className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
        <div className="relative">
          <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full timer-badge">
            {formatTimeLeft(auction.endTime)}
          </span>
          <img 
            src={auction.image} 
            alt={auction.title} 
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <Link href={`/auctions/${auction.id}`}>
              <a className="font-semibold text-lg text-secondary hover:text-primary">
                {truncateText(auction.title, 24)}
              </a>
            </Link>
            <span className="bg-secondary-light text-white text-xs px-2 py-1 rounded">
              {auction.category}
            </span>
          </div>
          <p className="text-secondary-light mt-1 text-sm">
            {truncateText(auction.description, 65)}
          </p>
          <div className="mt-3 flex justify-between items-center">
            <div>
              <p className="text-secondary-light text-xs">Current Bid</p>
              <p className="text-secondary font-semibold">{formatCurrency(auction.currentBid)}</p>
            </div>
            <div>
              <p className="text-secondary-light text-xs">Bids</p>
              <p className="text-secondary font-semibold">{auction.bidCount}</p>
            </div>
          </div>
          <Button 
            className="mt-3 w-full bg-primary text-white py-2 rounded font-medium hover:bg-primary-dark transition"
            onClick={openBidModal}
          >
            Place Bid
          </Button>
        </div>
      </Card>

      <BidModal 
        isOpen={isBidModalOpen} 
        onClose={closeBidModal} 
        auction={auction} 
      />
    </>
  );
};

export default AuctionCard;
