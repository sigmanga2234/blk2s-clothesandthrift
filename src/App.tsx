import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Info, Filter, ArrowUpDown, Flame, BookmarkCheck, ShieldCheck, Instagram, Send, ArrowRight, MessageSquare, Check, HelpCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import AddProductModal from './components/AddProductModal';
import { INITIAL_PRODUCTS } from './data';
import { Product, Review } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // UI states
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'low-high', 'high-low', 'oldest'
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCuratorMode, setIsCuratorMode] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Scroll target reference
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Initialize data on load with smart sync to preserve user-added products
  useEffect(() => {
    const storedProducts = localStorage.getItem('thrift_store_products');
    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts) as Product[];
        
        // Smart merge: make sure all INITIAL_PRODUCTS are in the list by checking ID
        let isUpdated = false;
        const mergedList = [...parsed];
        
        INITIAL_PRODUCTS.forEach(initialProd => {
          if (!mergedList.some(item => item.id === initialProd.id)) {
            mergedList.push(initialProd);
            isUpdated = true;
          }
        });

        if (isUpdated) {
          setProducts(mergedList);
          localStorage.setItem('thrift_store_products', JSON.stringify(mergedList));
        } else {
          setProducts(parsed);
        }
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('thrift_store_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('thrift_store_products', JSON.stringify(INITIAL_PRODUCTS));
    }
  }, []);

  // Handler for adding a new product (Secret button / Curator panel)
  const handleAddNewProduct = (newProd: Omit<Product, 'id' | 'reviews'>) => {
    const freshProduct: Product = {
      ...newProd,
      id: `p-${Date.now()}`,
      reviews: []
    };
    
    const updated = [freshProduct, ...products];
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
  };

  // Handler for editing an existing product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsAddModalOpen(true);
  };

  // Handler for updating an existing product
  const handleUpdateProduct = (productId: string, updatedFields: Partial<Product>) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const merged = { ...p, ...updatedFields };
        // Sync open detail view modal if that's the one edited
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(merged);
        }
        return merged;
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
    setProductToEdit(null);
  };

  // Handler for removing a product
  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
    
    // Auto-close detail modal if the deleted item was open
    if (selectedProduct && selectedProduct.id === productId) {
      setIsDetailOpen(false);
      setSelectedProduct(null);
    }
  };

  // Scroll helper
  const handleScrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Add review to a specific product
  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        // Build new review item
        const newReview: Review = {
          id: `r-${Date.now()}`,
          author: reviewData.author,
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };
        const newReviews = [newReview, ...product.reviews];
        const updatedProduct = { ...product, reviews: newReviews };
        
        // If current product modal is open, sync the display details instantly!
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updatedProduct);
        }

        return updatedProduct;
      }
      return product;
    });

    setProducts(updatedProducts);
    localStorage.setItem('thrift_store_products', JSON.stringify(updatedProducts));
  };

  // Filter and Sort calculation
  const filteredProducts = products.filter(product => {
    const matchesSize = selectedSize === 'All' || product.size === selectedSize;
    const matchesCondition = selectedCondition === 'All' || product.condition === selectedCondition;
    
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
      product.title.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.material && product.material.toLowerCase().includes(term));

    return matchesSize && matchesCondition && matchesSearch;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-high') {
      return a.price - b.price;
    }
    if (sortBy === 'high-low') {
      return b.price - a.price;
    }
    if (sortBy === 'oldest') {
      const yearA = parseInt(a.year || '3000', 10);
      const yearB = parseInt(b.year || '3000', 10);
      return yearA - yearB;
    }
    // Default / Featured
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  // Unique lists for side-panel filters
  const sizes = ['All', 'S', 'M', 'L', 'XL', 'One Size'];
  const conditions = ['All', 'Mint', 'Excellent', 'Gently Used', 'Distressed'];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-stone-950">
      
      {isCuratorMode && (
        <div className="bg-amber-400 text-stone-950 px-4 py-2 text-center text-xs font-mono font-bold flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-1.5 mx-auto">
            <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping" />
            <span>CURATOR ACTIVE • EDIT OR REMOVE ITEMS DIRECTLY ON CARDS</span>
          </div>
          <button
            onClick={() => setIsCuratorMode(false)}
            className="px-2.5 py-1 bg-stone-950 hover:bg-stone-850 text-amber-400 text-[10px] uppercase tracking-wider font-extrabold rounded border border-transparent hover:border-amber-400/20 transition-all cursor-pointer shadow"
          >
            Exit Studio
          </button>
        </div>
      )}

      {/* Navbar Integration */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOrderClick={handleScrollToOrder}
        onSecretClick={() => {
          setIsCuratorMode(true);
          setIsAddModalOpen(true);
        }}
      />

      {/* Hero Visual Area */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 py-16 border-b border-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Flame size={10} className="text-amber-400 animate-pulse" />
            <span>Circular Fashion Campaign</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight max-w-4xl mx-auto tracking-tight">
            Revive the Archives.<br />
            <span className="text-amber-400">Upcycle the Future.</span>
          </h2>
          
          <p className="text-sm md:text-base text-stone-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Every garment carries a past story. Explore our hand-picked collector vintage garments, verified for stitch durability and authentic quality by physical inspectors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-stone-500">
            <div className="flex items-center gap-1.5">
              <BookmarkCheck size={14} className="text-amber-500" />
              <span>100% Inspected Classics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw size={14} className="text-amber-500" />
              <span>Sustainable Upcycling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-amber-500" />
              <span>Direct Instagram Orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section (Now beautifully full-width) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-6">
        
        {/* Catalog Info & Sorting Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-900 font-mono text-xs text-stone-400">
          <div>
            Displaying <span className="text-white font-bold">{sortedProducts.length}</span> archives
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sorting-select-inline" className="flex items-center gap-1.5 text-[10px] text-stone-500 uppercase tracking-wider">
              <ArrowUpDown size={12} className="text-amber-500" />
              Sort:
            </label>
            <select
              id="sorting-select-inline"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
            >
              <option value="featured">🔥 Curated Classics</option>
              <option value="low-high">💰 Price: Low to High</option>
              <option value="high-low">💎 Price: High to Low</option>
              <option value="oldest">⏳ Vintage Era: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Empty results state */}
        {sortedProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-stone-800 rounded-3xl space-y-4 max-w-lg mx-auto bg-stone-900/10">
            <p className="text-sm font-mono text-stone-500">We couldn't find any unique pieces matching those specifications.</p>
            <button
              onClick={() => {
                setSelectedSize('All');
                setSelectedCondition('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-750 text-amber-400 rounded-lg text-xs font-mono transition-all cursor-pointer"
            >
              Show All Garments
            </button>
          </div>
        ) : (
          /* Product Grid - Fluid 4 columns on large screens */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(prod) => {
                    setSelectedProduct(prod);
                    setIsDetailOpen(true);
                  }}
                  isCuratorMode={isCuratorMode}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Product Detail Floating Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedProduct(null);
          }}
          onAddReview={handleAddReview}
        />
      )}

      {/* ORDER / CONTACT SECTION (Requested replacement) */}
      <section
        ref={orderSectionRef}
        id="order-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-6 border-t border-stone-900"
      >
        <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-400/20">
              <Instagram size={32} className="animate-pulse" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-serif font-black text-white tracking-tight">
                How to Order Your Findings
              </h2>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                Because we exclusively deal in rare retro pieces and historical archives, all items are strictly **one-of-one**. We handle all orders manually and directly via our official Instagram handle.
              </p>
            </div>

            {/* Simple Step-by-Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left py-4">
              <div className="p-5 bg-stone-950/50 rounded-2xl border border-stone-850 space-y-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">STEP 01</span>
                <h4 className="text-sm font-bold text-white font-sans">Inspect & Select</h4>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  Browse our racks, filter sizes, read inspector reports, and find the perfect archival fit.
                </p>
              </div>

              <div className="p-5 bg-stone-950/50 rounded-2xl border border-stone-850 space-y-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">STEP 02</span>
                <h4 className="text-sm font-bold text-white font-sans">Copy Details DM</h4>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  Click 'Order' to open details, and copy our pre-written direct message draft with one click.
                </p>
              </div>

              <div className="p-5 bg-stone-950/50 rounded-2xl border border-stone-850 space-y-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">STEP 03</span>
                <h4 className="text-sm font-bold text-white font-sans">DM to Secure</h4>
                <p className="text-xs text-stone-400 font-sans leading-relaxed">
                  Send the draft to our Instagram inbox to finalize payment and register delivery info!
                </p>
              </div>
            </div>

            {/* Interactive Instagram Order Trigger */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://www.instagram.com/el_padrinknows/"
                target="_blank"
                rel="noopener noreferrer"
                id="instagram-order-cta"
                className="inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono font-bold rounded-xl transition-all shadow-xl hover:shadow-amber-400/10 active:scale-[0.98] w-full sm:w-auto justify-center text-sm cursor-pointer"
              >
                <Instagram size={18} />
                <span>@el_padrinknows on Instagram</span>
                <ArrowRight size={14} />
              </a>

              <a
                href="#desktop-search"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-stone-400 hover:text-stone-200 font-mono text-xs tracking-wider"
              >
                Or Continue Browsing Racks ↑
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Page Footer */}
      <footer className="bg-stone-900 border-t border-stone-850 mt-16 text-stone-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-white font-sans tracking-tight flex items-center justify-center gap-1.5">
            BLK2S <span className="text-amber-400">THRIFT</span>
          </h2>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            BLK2S THRIFT is a mock upcycling clothing catalog built with full-fidelity interactive elements, designed to support clothing reuse campaigns.
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-mono text-stone-500 pt-2">
            <span>© 2026 BLK2S THRIFT CO.</span>
            <span>•</span>
            <button 
              onClick={() => {
                setIsCuratorMode(true);
                setIsAddModalOpen(true);
              }}
              className="hover:text-amber-400 hover:underline transition-all cursor-pointer font-bold"
            >
              CURATOR ACCESS
            </button>
            <span>•</span>
            <span>SUSTAINABILITY PLEDGE</span>
          </div>
        </div>
      </footer>

      {/* Secret Curator Add/Edit Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProductToEdit(null);
        }}
        onAddProduct={handleAddNewProduct}
        onUpdateProduct={handleUpdateProduct}
        productToEdit={productToEdit}
      />
    </div>
  );
}
