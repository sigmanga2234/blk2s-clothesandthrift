import React, { useState } from 'react';
import { Star, ShieldAlert, Send, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  isCuratorMode?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  isCuratorMode = false,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate average rating
  const averageRating = product.reviews.length
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  // Set condition color badges
  const getConditionStyle = (condition: string) => {
    switch (condition) {
      case 'Mint':
        return 'bg-emerald-550/10 text-emerald-400 border-emerald-500/20';
      case 'Excellent':
        return 'bg-blue-550/10 text-blue-400 border-blue-500/20';
      case 'Gently Used':
        return 'bg-amber-550/10 text-amber-400 border-amber-500/20';
      case 'Distressed':
        return 'bg-red-550/10 text-red-400 border-red-500/20';
      default:
        return 'bg-stone-550/10 text-stone-400 border-stone-500/20';
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] bg-stone-950 overflow-hidden cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Vintage Frame Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none" />

        {/* Condition Badge (Top Left) */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${getConditionStyle(product.condition)}`}>
          {product.condition}
        </span>

        {/* Year Label (Top Right) */}
        {product.year && !isCuratorMode && (
          <span className="absolute top-3 right-3 bg-stone-900/90 backdrop-blur-sm text-stone-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-stone-700/60">
            {product.year}
          </span>
        )}

        {/* Curator Quick Actions (Top Right) */}
        {isCuratorMode && (
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="p-1.5 bg-amber-400 text-stone-950 hover:bg-amber-300 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all border border-transparent cursor-pointer"
              title="Edit Garment Details"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all border border-transparent cursor-pointer"
              title="Remove from Racks"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Tag Overlay (Bottom Left) - Size info */}
        <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-sm border border-stone-800 text-stone-200 px-3 py-1 rounded-md text-xs font-mono font-bold">
          SIZE: <span className="text-amber-400">{product.size}</span>
        </div>

        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
          <div 
            className="absolute inset-0 bg-stone-950/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 text-center select-none animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertTriangle className="text-red-500 animate-bounce mb-2" size={24} />
            <h4 className="text-xs font-mono font-bold text-red-500 tracking-wider uppercase mb-1">REMOVE ARCHIVE?</h4>
            <p className="text-[10px] text-stone-400 font-sans max-w-[150px] leading-relaxed mb-3">
              This will permanently delete "{product.title}" from local storage racks.
            </p>
            <div className="flex gap-2 w-full max-w-[160px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(product.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-bold rounded-md transition-colors cursor-pointer"
              >
                Yes, Del
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-[10px] rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Information Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500/80">
              {product.category}
            </span>

            {averageRating && (
              <div className="flex items-center gap-1 bg-stone-950 px-2 py-0.5 rounded text-[10px] font-mono text-stone-300">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>{averageRating}</span>
                <span className="text-stone-500">({product.reviews.length})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-sans font-medium text-stone-100 hover:text-amber-400 transition-colors text-base cursor-pointer line-clamp-1 tracking-tight"
          >
            {product.title}
          </h3>

          {/* Price & Single Item Warning */}
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-lg font-mono font-extrabold text-white">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <ShieldAlert size={10} className="text-amber-500" />
              <span>Unique Piece</span>
            </span>
          </div>
        </div>

        {/* Interactive Button Group */}
        <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 py-2 text-center text-xs font-mono font-medium text-stone-300 hover:text-white bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-stone-700 rounded-lg transition-all cursor-pointer"
          >
            Details & Reviews
          </button>

          <button
            onClick={() => onViewDetails(product)}
            className="px-4 py-2 text-xs font-mono font-bold bg-amber-400 text-stone-950 hover:bg-amber-300 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Send size={12} />
            <span>Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
