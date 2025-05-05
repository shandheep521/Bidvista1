import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Package,
  Monitor,
  Palette,
  ShoppingBag,
  Users,
  BookOpen
} from 'lucide-react';

const CategoryIcons = {
  'collectibles': Package,
  'electronics': Monitor,
  'art': Palette,
  'fashion': ShoppingBag,
  'antiques': Users,
  'books': BookOpen
};

const CategoryCard = ({ category }) => {
  const IconComponent = CategoryIcons[category.slug] || Package;

  return (
    <Link href={`/auctions?category=${category.slug}`}>
      <a className="group">
        <div className="bg-neutral rounded-lg p-6 text-center transition hover:bg-primary hover:text-white">
          <IconComponent className="w-10 h-10 mx-auto text-primary group-hover:text-white" />
          <h3 className="mt-4 font-medium text-secondary group-hover:text-white">
            {category.name}
          </h3>
        </div>
      </a>
    </Link>
  );
};

export default CategoryCard;
