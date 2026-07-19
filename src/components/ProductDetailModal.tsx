import React, { useState } from 'react';
import { X, Star, Calendar, Bookmark, ShieldCheck, Tag, Send, Plus, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review } from '../types';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddReview,
}: ProductDetailModalProps) {
  // Review form states
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  if (!isOpen) return null;

  // Calculate rating stats
  const totalReviews = product.reviews.length;
  const averageRating = totalReviews
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Compute distribution
  const distribution = [0, 0, 0, 0, 0]; // index 0 for 1 star, index 4 for 5 star
  product.reviews.forEach((r) => {
    const idx = Math.min(Math.max(r.rating - 1, 0), 4);
    distribution[idx]++;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setError('Please provide your name or pseudonym.');
      return;
    }
    if (!comment.trim()) {
      setError('Please share your thoughts on this garment.');
      return;
    }
    setError('');

    // Trigger review addition callback
    onAddReview(product.id, {
      author: author.trim(),
      rating,
      comment: comment.trim(),
    });

    // Reset Form & Show Success Message
    setAuthor('');
    setRating(5);
    setComment('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const instagramUrl = 'https://www.instagram.com/el_padrinknows/';
  const dmTemplate = `Yo! I want to order the "${product.title}" (Size: ${product.size}, Condition: ${product.condition}, Price: $${product.price}) from BLK2S THRIFT. Is it still available?`;

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(dmTemplate);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              id="close-modal-button"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Visual Area */}
              <div className="relative bg-stone-950 aspect-[4/5] md:aspect-auto md:h-full min-h-[400px]">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/20 pointer-events-none" />

                {/* Banner tag info inside image */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded bg-amber-400 text-stone-950 text-[10px] font-mono font-extrabold tracking-wider uppercase">
                      Size {product.size}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-stone-900 text-amber-400 border border-amber-400/30 text-[10px] font-mono font-extrabold tracking-wider uppercase">
                      Condition: {product.condition}
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                    {product.title}
                  </h2>
                </div>
              </div>

              {/* Product details & Scrollable review area */}
              <div className="p-6 md:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
                {/* Header Information */}
                <div className="pb-6 border-b border-stone-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                      {product.category}
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                      <Calendar size={12} className="text-stone-500" />
                      Circa {product.year || 'Retro'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4 mt-2">
                    <span className="text-3xl font-mono font-extrabold text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-stone-400 line-through font-mono">
                      Original Est. ${(product.price * 2.8).toFixed(0)}
                    </span>
                  </div>

                  {/* Direct Instagram Purchase Action */}
                  <div className="mt-5 space-y-3">
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`order-on-instagram-${product.id}`}
                      className="w-full py-3.5 px-6 rounded-xl font-mono font-bold text-sm tracking-wide bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={18} />
                      <span>ORDER VIA INSTAGRAM DM</span>
                    </a>

                    {/* Copyable Message Template helper */}
                    <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-stone-400">COPY ORDER DM DRAFT:</span>
                        <button
                          onClick={handleCopyDraft}
                          className="text-[9px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedDraft ? (
                            <>
                              <Check size={10} className="text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={10} />
                              <span>Copy Template</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-300 italic font-sans leading-snug line-clamp-2 select-all">
                        "{dmTemplate}"
                      </p>
                    </div>

                    <p className="text-[10px] text-stone-500 font-mono text-center mt-2 flex items-center justify-center gap-1">
                      <Bookmark size={10} className="text-amber-500/80" />
                      Only one unit available. First to slide into DMs claims the piece!
                    </p>
                  </div>
                </div>

                {/* Description & specs */}
                <div className="py-6 border-b border-stone-800">
                  <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Vintage Description
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed font-sans">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-5 bg-stone-950/50 p-4 rounded-xl border border-stone-800/80">
                    <div>
                      <span className="block text-[10px] font-mono text-stone-500 uppercase">Material Composition</span>
                      <span className="text-stone-300 text-xs font-semibold">{product.material || 'Organic Blend'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono text-stone-500 uppercase">Archive Quality</span>
                      <span className="text-stone-300 text-xs font-semibold">{product.condition} Grade</span>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="py-6 border-b border-stone-800">
                  <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Collector Reviews & Quality Ratings
                  </h4>

                  {/* Rating Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-stone-950 p-5 rounded-xl border border-stone-800/60 mb-6">
                    <div className="flex flex-col items-center justify-center text-center border-stone-800 sm:border-r pr-2">
                      <span className="text-4xl font-mono font-extrabold text-white">{averageRating}</span>
                      <div className="flex gap-0.5 my-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={`${
                              star <= Math.round(Number(averageRating))
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">Based on {totalReviews} feedback</span>
                    </div>

                    <div className="sm:col-span-2 flex flex-col justify-center gap-1.5">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = distribution[stars - 1];
                        const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-xs font-mono text-stone-400">
                            <span className="w-3 text-right">{stars}</span>
                            <Star size={10} className="fill-amber-400/85 text-amber-400/85" />
                            <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-5 text-right text-stone-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* List of Reviews */}
                  <div className="space-y-4">
                    {product.reviews.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-stone-800 rounded-xl bg-stone-950/30">
                        <p className="text-xs font-mono text-stone-500">No previous inspections or reviews recorded yet.</p>
                        <p className="text-[10px] font-mono text-stone-600 mt-1">Be the first collector to inspect and review this item!</p>
                      </div>
                    ) : (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-stone-950/40 rounded-xl border border-stone-800/50 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="font-mono text-xs font-bold text-stone-200">{rev.author}</span>
                              <span className="text-[10px] text-stone-600 font-mono ml-2">Verified Inspector</span>
                            </div>
                            <span className="text-[9px] font-mono text-stone-500">{rev.date}</span>
                          </div>

                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={10}
                                className={`${
                                  star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-850'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs text-stone-400 leading-relaxed font-sans">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Write Review Form */}
                <div className="pt-6">
                  <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Submit Archive Inspection Report
                  </h4>

                  <form onSubmit={handleSubmitReview} className="space-y-4 bg-stone-950/50 p-5 rounded-xl border border-stone-800/80">
                    {error && (
                      <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-lg text-xs font-mono text-red-400">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-emerald-950/50 border border-emerald-900/50 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        Inspection report submitted successfully! Thank you.
                      </div>
                    )}

                    <div>
                      <label htmlFor="inspector-name" className="block text-[10px] font-mono text-stone-400 uppercase mb-1">
                        Your Name / Codename *
                      </label>
                      <input
                        type="text"
                        id="inspector-name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. VintageDigger92"
                        className="w-full bg-stone-900 border border-stone-850 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1.5">
                        Inspected Condition Rating *
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 rounded-md hover:bg-stone-900 text-stone-500 hover:text-amber-400 transition-all focus:outline-none cursor-pointer"
                          >
                            <Star
                              size={20}
                              className={`${
                                star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-mono text-stone-400 ml-2">
                          {rating === 5 ? 'Mint Archive (5/5)' : rating === 4 ? 'Excellent Vintage (4/5)' : rating === 3 ? 'Good Vintage Wear (3/5)' : rating === 2 ? 'Fair Vintage (2/5)' : 'Needs Restoration (1/5)'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="inspector-comment" className="block text-[10px] font-mono text-stone-400 uppercase mb-1">
                        Detailed Fitting & Condition Notes *
                      </label>
                      <textarea
                        id="inspector-comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe the fit, stitch condition, lining, smell, true sizing, or specific vintage details..."
                        className="w-full bg-stone-900 border border-stone-850 focus:border-amber-500 rounded-lg px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none transition-all font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      id="submit-review-button"
                      className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-white border border-stone-700 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      Publish Inspection Report
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
