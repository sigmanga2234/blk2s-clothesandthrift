import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Info, Filter, ArrowUpDown, Flame, BookmarkCheck, ShieldCheck, Instagram, Send, ArrowRight, MessageSquare, Check, HelpCircle, Cloud, CloudOff, Database, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import AddProductModal from './components/AddProductModal';
import { INITIAL_PRODUCTS } from './data';
import { Product, Review } from './types';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  findDriveFile, 
  downloadDriveFile, 
  createDriveFile, 
  updateDriveFileContent, 
  getAccessToken 
} from './lib/driveAuth';
import { User } from 'firebase/auth';
import { getDocs, collection, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

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

  // Google Drive & Auth states
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Scroll target reference
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Initialize data on load with smart sync to preserve user-added products
  useEffect(() => {
    // 1. Initial Local load from localStorage (fast UI start)
    const storedProducts = localStorage.getItem('thrift_store_products');
    if (storedProducts) {
      try {
        setProducts(JSON.parse(storedProducts));
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }

    // 2. Fetch and synchronize with public global Firestore database
    const loadProductsFromFirestore = async () => {
      setIsSyncing(true);
      setSyncMessage('Syncing with global inventory catalog...');
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const dbProducts: Product[] = [];
        querySnapshot.forEach((docSnapshot) => {
          dbProducts.push(docSnapshot.data() as Product);
        });

        if (dbProducts.length > 0) {
          // Merge local and remote changes safely
          const merged = [...dbProducts];
          let isUpdated = false;
          INITIAL_PRODUCTS.forEach(initialProd => {
            if (!merged.some(item => item.id === initialProd.id)) {
              merged.push(initialProd);
              isUpdated = true;
              setDoc(doc(db, 'products', initialProd.id), initialProd).catch(e => console.error("Failed to seed initial product:", e));
            }
          });

          setProducts(merged);
          localStorage.setItem('thrift_store_products', JSON.stringify(merged));
          setSyncMessage('Catalog synced globally.');
          setTimeout(() => setSyncMessage(''), 1500);
        } else {
          // Firestore database is blank, seed it with initial products
          setSyncMessage('Bootstrapping public catalog database...');
          const seedPromises = INITIAL_PRODUCTS.map(prod => {
            return setDoc(doc(db, 'products', prod.id), prod);
          });
          await Promise.all(seedPromises);
          setProducts(INITIAL_PRODUCTS);
          localStorage.setItem('thrift_store_products', JSON.stringify(INITIAL_PRODUCTS));
          setSyncMessage('Global database seeded!');
          setTimeout(() => setSyncMessage(''), 2000);
        }
      } catch (error) {
        console.error("Failed to load global catalog from Firestore:", error);
        setSyncMessage('Offline mode. Using local cache.');
        setTimeout(() => setSyncMessage(''), 3000);
      } finally {
        setIsSyncing(false);
      }
    };

    loadProductsFromFirestore();

    // 3. Auth listener to restore active Google Drive session
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setDriveConnected(true);
        setIsSyncing(true);
        setSyncMessage('Google session active. Fetching latest catalog backups...');
        try {
          const fileId = await findDriveFile(token);
          if (fileId) {
            setDriveFileId(fileId);
            setSyncMessage('Syncing with Google Drive...');
            const remoteProducts = await downloadDriveFile(token, fileId);
            if (remoteProducts && remoteProducts.length > 0) {
              // Smart merge local, remote and Drive
              const currentLocal = JSON.parse(localStorage.getItem('thrift_store_products') || '[]');
              const merged = [...currentLocal];
              
              remoteProducts.forEach(item => {
                const idx = merged.findIndex(p => p.id === item.id);
                if (idx >= 0) {
                  merged[idx] = item;
                } else {
                  merged.push(item);
                }
              });

              // Ensure INITIAL_PRODUCTS are present
              INITIAL_PRODUCTS.forEach(initialProd => {
                if (!merged.some(item => item.id === initialProd.id)) {
                  merged.push(initialProd);
                }
              });

              setProducts(merged);
              localStorage.setItem('thrift_store_products', JSON.stringify(merged));
              
              // Push merged state back to drive to ensure clean sync
              await updateDriveFileContent(token, fileId, merged);

              // Also write any new/missing items to Firestore!
              const firestorePromises = merged.map(item => setDoc(doc(db, 'products', item.id), item));
              await Promise.all(firestorePromises).catch(e => console.error("Failed to write to Firestore on Drive sync:", e));
            }
          }
          setSyncMessage('');
        } catch (err) {
          console.error('Initial Drive Sync error:', err);
          setSyncMessage('Background sync offline. Check your network.');
          setTimeout(() => setSyncMessage(''), 4000);
        } finally {
          setIsSyncing(false);
        }
      },
      () => {
        setGoogleUser(null);
        setDriveConnected(false);
        setDriveFileId(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync state to Google Drive on content changes
  const syncToDrive = async (updatedList: Product[]) => {
    const token = getAccessToken();
    if (driveConnected && driveFileId && token) {
      setIsSyncing(true);
      setSyncMessage('Backing up changes to Google Drive...');
      try {
        await updateDriveFileContent(token, driveFileId, updatedList);
        setSyncMessage('Cloud backup updated.');
        setTimeout(() => setSyncMessage(''), 1500);
      } catch (err) {
        console.error('Error backing up to Google Drive:', err);
        setSyncMessage('Cloud save failed. Session might be expired.');
        setTimeout(() => setSyncMessage(''), 3000);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Connect & Sync with Google Account Popup
  const handleConnectDrive = async () => {
    setIsSyncing(true);
    setSyncMessage('Connecting to Google Account...');
    try {
      const authResult = await googleSignIn();
      if (authResult) {
        setGoogleUser(authResult.user);
        const token = authResult.accessToken;
        
        setSyncMessage('Searching for archive file in your Drive...');
        const fileId = await findDriveFile(token);
        
        let activeFileId = fileId;
        let finalProducts = [...products];
        
        if (fileId) {
          setSyncMessage('Downloading cloud catalog from your Drive...');
          setDriveFileId(fileId);
          const remoteProducts = await downloadDriveFile(token, fileId);
          
          if (remoteProducts && remoteProducts.length > 0) {
            setSyncMessage('Merging catalog files...');
            const mergedList = [...products];
            remoteProducts.forEach(item => {
              const idx = mergedList.findIndex(p => p.id === item.id);
              if (idx >= 0) {
                mergedList[idx] = item;
              } else {
                mergedList.push(item);
              }
            });
            
            INITIAL_PRODUCTS.forEach(initialProd => {
              if (!mergedList.some(item => item.id === initialProd.id)) {
                mergedList.push(initialProd);
              }
            });
            
            finalProducts = mergedList;
            setProducts(mergedList);
            localStorage.setItem('thrift_store_products', JSON.stringify(mergedList));
            
            setSyncMessage('Uploading synced data to Google Drive...');
            await updateDriveFileContent(token, fileId, mergedList);
          } else {
            setSyncMessage('Uploading current catalog to Google Drive...');
            await updateDriveFileContent(token, fileId, products);
          }
        } else {
          setSyncMessage('Creating new archive file in Google Drive...');
          const newId = await createDriveFile(token, products);
          if (newId) {
            activeFileId = newId;
            setDriveFileId(newId);
          }
        }
        
        setDriveConnected(true);
        setSyncMessage('Google Drive sync active!');
        setTimeout(() => setSyncMessage(''), 3000);
      }
    } catch (err: any) {
      console.error('Google Drive Sync setup failed:', err);
      setSyncMessage('Authentication or file setup failed.');
      setTimeout(() => setSyncMessage(''), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setDriveConnected(false);
      setDriveFileId(null);
      setSyncMessage('Google Drive disconnected.');
      setTimeout(() => setSyncMessage(''), 2000);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  // Handler for adding a new product (Secret button / Curator panel)
  const handleAddNewProduct = async (newProd: Omit<Product, 'id' | 'reviews'>) => {
    const freshProduct: Product = {
      ...newProd,
      id: `p-${Date.now()}`,
      reviews: []
    };
    
    const updated = [freshProduct, ...products];
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
    syncToDrive(updated);

    try {
      await setDoc(doc(db, 'products', freshProduct.id), freshProduct);
      setSyncMessage('Product published globally!');
      setTimeout(() => setSyncMessage(''), 1500);
    } catch (error) {
      console.error("Failed to add product to global database:", error);
      setSyncMessage('Saved locally. Sign in to update global catalog.');
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  // Handler for editing an existing product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsAddModalOpen(true);
  };

  // Handler for updating an existing product
  const handleUpdateProduct = async (productId: string, updatedFields: Partial<Product>) => {
    let targetProduct: Product | null = null;
    const updated = products.map(p => {
      if (p.id === productId) {
        const merged = { ...p, ...updatedFields };
        // Sync open detail view modal if that's the one edited
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(merged);
        }
        targetProduct = merged;
        return merged;
      }
      return p;
    });
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
    setProductToEdit(null);
    syncToDrive(updated);

    if (targetProduct) {
      try {
        await setDoc(doc(db, 'products', productId), targetProduct);
        setSyncMessage('Product updated globally!');
        setTimeout(() => setSyncMessage(''), 1500);
      } catch (error) {
        console.error("Failed to update product in global database:", error);
        setSyncMessage('Saved locally. Sign in to update global catalog.');
        setTimeout(() => setSyncMessage(''), 4000);
      }
    }
  };

  // Handler for removing a product
  const handleDeleteProduct = async (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    localStorage.setItem('thrift_store_products', JSON.stringify(updated));
    
    // Auto-close detail modal if the deleted item was open
    if (selectedProduct && selectedProduct.id === productId) {
      setIsDetailOpen(false);
      setSelectedProduct(null);
    }
    syncToDrive(updated);

    try {
      await deleteDoc(doc(db, 'products', productId));
      setSyncMessage('Product removed globally!');
      setTimeout(() => setSyncMessage(''), 1500);
    } catch (error) {
      console.error("Failed to delete product from global database:", error);
      setSyncMessage('Removed locally. Sign in to update global catalog.');
      setTimeout(() => setSyncMessage(''), 4000);
    }
  };

  // Scroll helper
  const handleScrollToOrder = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Add review to a specific product
  const handleAddReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    let targetProduct: Product | undefined;
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

        targetProduct = updatedProduct;
        return updatedProduct;
      }
      return product;
    });

    setProducts(updatedProducts);
    localStorage.setItem('thrift_store_products', JSON.stringify(updatedProducts));
    syncToDrive(updatedProducts);

    if (targetProduct) {
      try {
        await updateDoc(doc(db, 'products', productId), {
          reviews: targetProduct.reviews
        });
        setSyncMessage('Review added globally!');
        setTimeout(() => setSyncMessage(''), 1500);
      } catch (error) {
        console.error("Failed to add review to global database:", error);
        setSyncMessage('Review saved locally.');
        setTimeout(() => setSyncMessage(''), 4000);
      }
    }
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
        <div className="bg-amber-400 text-stone-950 px-4 py-2 text-xs font-mono font-bold flex flex-col md:flex-row items-center justify-between gap-3 animate-in slide-in-from-top duration-200 sticky top-0 z-50 shadow-md border-b border-amber-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-950 animate-ping" />
              <span className="uppercase tracking-wider">STUDIO MODE ACTIVE</span>
            </div>
            <span className="text-stone-900/40 hidden md:inline">|</span>
            {driveConnected ? (
              <div className="flex items-center gap-1.5">
                <Cloud size={14} className="text-emerald-900" />
                <span className="text-[11px] text-stone-900 uppercase">
                  Drive Synced: <span className="underline decoration-stone-900/30">{googleUser?.email}</span>
                </span>
                {isSyncing ? (
                  <Loader2 size={12} className="animate-spin text-stone-950 ml-1" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-750 animate-pulse ml-1" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <CloudOff size={14} className="text-stone-700" />
                <span className="text-[11px] text-stone-900 uppercase">LocalStorage Mode (Connect Drive to back up catalog additions)</span>
              </div>
            )}
            
            {syncMessage && (
              <span className="bg-stone-950 text-amber-400 px-2 py-0.5 rounded text-[9px] animate-pulse uppercase tracking-wider">
                {syncMessage}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {driveConnected ? (
              <button
                onClick={handleDisconnectDrive}
                className="px-2 py-1 bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 text-[10px] uppercase tracking-wider font-extrabold rounded border border-stone-950/20 transition-all cursor-pointer"
                title="Disconnect from Google Drive"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectDrive}
                disabled={isSyncing}
                className="px-2.5 py-1 bg-stone-950 hover:bg-stone-900 text-amber-400 text-[10px] uppercase tracking-wider font-extrabold rounded border border-transparent transition-all cursor-pointer shadow flex items-center gap-1"
              >
                {isSyncing ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Cloud size={10} />
                )}
                <span>Connect Google Drive</span>
              </button>
            )}
            <span className="text-stone-900/20">|</span>
            <button
              onClick={() => setIsCuratorMode(false)}
              className="px-2.5 py-1 bg-stone-950 hover:bg-stone-900 text-amber-400 text-[10px] uppercase tracking-wider font-extrabold rounded border border-transparent transition-all cursor-pointer shadow"
            >
              Exit Studio
            </button>
          </div>
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
