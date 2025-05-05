import { Link } from 'wouter';
import { Clock, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About BidVista</h3>
            <p className="text-neutral opacity-80">
              BidVista is a premier online auction platform connecting buyers and sellers worldwide since 2010.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-neutral hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-neutral hover:text-white transition">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/auctions">
                  <a className="text-neutral hover:text-white transition">Auctions</a>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works">
                  <a className="text-neutral hover:text-white transition">How It Works</a>
                </Link>
              </li>
              <li>
                <Link href="/faqs">
                  <a className="text-neutral hover:text-white transition">FAQs</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-neutral hover:text-white transition">Contact Us</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auctions?category=collectibles">
                  <a className="text-neutral hover:text-white transition">Collectibles</a>
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=electronics">
                  <a className="text-neutral hover:text-white transition">Electronics</a>
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=art">
                  <a className="text-neutral hover:text-white transition">Art</a>
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=fashion">
                  <a className="text-neutral hover:text-white transition">Fashion</a>
                </Link>
              </li>
              <li>
                <Link href="/auctions?category=antiques">
                  <a className="text-neutral hover:text-white transition">Antiques</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-neutral opacity-80 mb-4">
              Subscribe to get updates on new auctions and features.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-secondary rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-r-md transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral opacity-80 text-sm">
            © {new Date().getFullYear()} BidVista. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy">
              <a className="text-neutral hover:text-white text-sm mx-3">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral hover:text-white text-sm mx-3">Terms of Service</a>
            </Link>
            <Link href="/cookies">
              <a className="text-neutral hover:text-white text-sm mx-3">Cookie Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
