import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, DollarSign, Image as ImageIcon, CheckCircle, ShieldAlert, Edit2 } from 'lucide-react';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'reviews'>) => void;
  onUpdateProduct?: (productId: string, product: Partial<Product>) => void;
  productToEdit?: Product | null;
}

export default function AddProductModal({ 
  isOpen, 
  onClose, 
  onAddProduct, 
  onUpdateProduct, 
  productToEdit = null 
}: AddProductModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Denim Jeans');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [size, setSize] = useState('L (Waist 34)');
  const [condition, setCondition] = useState<'Mint' | 'Excellent' | 'Gently Used' | 'Distressed'>('Excellent');
  const [material, setMaterial] = useState('100% Cotton Denim');
  const [year, setYear] = useState('2002');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Image handling
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with productToEdit on open/load
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setTitle(productToEdit.title);
        setPrice(productToEdit.price.toString());
        
        const standardCategories = ['Denim Jeans', 'Cargo & Utility', 'Vintage Jorts', 'Baggy Sweats', 'Curated Sets'];
        if (standardCategories.includes(productToEdit.category)) {
          setCategory(productToEdit.category);
          setShowCustomCategory(false);
          setCustomCategory('');
        } else {
          setCategory('custom');
          setShowCustomCategory(true);
          setCustomCategory(productToEdit.category);
        }
        
        setSize(productToEdit.size);
        setCondition(productToEdit.condition);
        setMaterial(productToEdit.material || '');
        setYear(productToEdit.year || '');
        setDescription(productToEdit.description);
        setIsFeatured(productToEdit.isFeatured || false);
        
        if (productToEdit.image.startsWith('data:image')) {
          setImageType('upload');
          setImageBase64(productToEdit.image);
          setImagePreview(productToEdit.image);
          setImageUrl('');
        } else {
          setImageType('url');
          setImageUrl(productToEdit.image);
          setImagePreview(productToEdit.image);
          setImageBase64('');
        }
        setErrors({});
      } else {
        resetForm();
      }
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle file selection and read as base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file.' }));
      return;
    }

    // Limit size to ~5MB to avoid localStorage limits
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image is too large. Please select an image under 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageBase64(base64String);
      setImagePreview(base64String);
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.image;
        return copy;
      });
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Title/Name is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid positive price';
    }
    
    if (showCustomCategory && !customCategory.trim()) {
      newErrors.category = 'Custom category name is required';
    }

    if (imageType === 'upload' && !imageBase64) {
      newErrors.image = 'An image file is required. Please upload or drag an image.';
    } else if (imageType === 'url' && !imageUrl.trim()) {
      newErrors.image = 'An image URL is required';
    } else if (imageType === 'url' && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      newErrors.image = 'Please enter a valid image URL (e.g. starting with http:// or https://)';
    }

    if (!description.trim()) {
      newErrors.description = 'Inspector details and description are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = showCustomCategory ? customCategory.trim() : category;
    const finalImage = imageType === 'upload' ? imageBase64 : imageUrl.trim();

    const formattedData = {
      title: title.trim(),
      price: Math.round(Number(price)),
      category: finalCategory,
      image: finalImage,
      description: description.trim(),
      size: size.trim(),
      condition,
      material: material.trim() || undefined,
      year: year.trim() || undefined,
      isFeatured
    };

    if (productToEdit && onUpdateProduct) {
      onUpdateProduct(productToEdit.id, formattedData);
    } else {
      onAddProduct(formattedData);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      resetForm();
      onClose();
    }, 1800);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setCategory('Denim Jeans');
    setCustomCategory('');
    setShowCustomCategory(false);
    setSize('L (Waist 34)');
    setCondition('Excellent');
    setMaterial('100% Cotton Denim');
    setYear('2002');
    setDescription('');
    setIsFeatured(false);
    setImageType('upload');
    setImageUrl('');
    setImageBase64('');
    setImagePreview('');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-950/80 backdrop-blur-md">
      <div 
        id="add-product-modal-container"
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Success Splash Screen */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 bg-stone-900/95 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full border border-amber-400/20 animate-bounce">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-serif font-black text-white">
              {productToEdit ? 'ARCHIVE UPDATED' : 'ARCHIVE REGISTERED'}
            </h3>
            <p className="text-stone-400 font-mono text-xs max-w-md">
              {productToEdit 
                ? 'The changes have been cataloged and written to local storage racks.'
                : 'The new piece has been cataloged and loaded onto our active shelves in Local Storage.'
              }
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-850 bg-stone-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-400/20">
              {productToEdit ? <Edit2 size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h3 className="text-lg font-serif font-black text-white">
                {productToEdit ? 'UPDATE ARCHIVED GARMENT' : 'REGISTER NEW ARCHIVE'}
              </h3>
              <p className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">
                {productToEdit ? 'Curator Edit Mode' : 'Curator Studio Mode'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex gap-2 items-start">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Cataloging Failed:</span> Please correct the highlighted fields before filing this archival piece.
              </div>
            </div>
          )}

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Garment Title / Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Y2K Southpole Baggy Raw-Hem Jeans"
                className={`w-full bg-stone-950 border ${errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-800 focus:ring-amber-500/20 focus:border-amber-500'} rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 text-sm transition-all`}
              />
              {errors.title && <p className="text-[10px] font-mono text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Price (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                  <DollarSign size={14} />
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="85"
                  min="1"
                  className={`w-full bg-stone-950 border ${errors.price ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-800 focus:ring-amber-500/20 focus:border-amber-500'} rounded-xl pl-8 pr-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 text-sm transition-all`}
                />
              </div>
              {errors.price && <p className="text-[10px] font-mono text-red-500">{errors.price}</p>}
            </div>
          </div>

          {/* Category & Custom Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Shelf / Category *
              </label>
              <select
                value={showCustomCategory ? 'custom' : category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustomCategory(true);
                  } else {
                    setShowCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all cursor-pointer"
              >
                <option value="Denim Jeans">👖 Denim Jeans</option>
                <option value="Cargo & Utility">🛠️ Cargo & Utility</option>
                <option value="Vintage Jorts">🩳 Vintage Jorts</option>
                <option value="Baggy Sweats">👟 Baggy Sweats</option>
                <option value="Curated Sets">📦 Curated Sets</option>
                <option value="custom">✨ + Add Custom Category...</option>
              </select>
            </div>

            {showCustomCategory && (
              <div className="space-y-1.5 animate-in slide-in-from-left-2 duration-150">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Vintage Hoodies"
                  className={`w-full bg-stone-950 border ${errors.category ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-800 focus:ring-amber-500/20 focus:border-amber-500'} rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 text-sm transition-all`}
                />
                {errors.category && <p className="text-[10px] font-mono text-red-500">{errors.category}</p>}
              </div>
            )}
          </div>

          {/* Size, Condition, Material, Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Size
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. L (Waist 34)"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all cursor-pointer"
              >
                <option value="Mint">💎 Mint</option>
                <option value="Excellent">🌟 Excellent</option>
                <option value="Gently Used">✨ Gently Used</option>
                <option value="Distressed">🪡 Distressed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. 100% Cotton Denim"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Release Era / Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2003"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all"
              />
            </div>
          </div>

          {/* Image Selection / Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-stone-850 pb-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Product Image Source *
              </label>
              <div className="flex bg-stone-950 p-0.5 rounded-lg border border-stone-850 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`px-2 py-1 rounded-md transition-all ${imageType === 'upload' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-100'}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageType('url')}
                  className={`px-2 py-1 rounded-md transition-all ${imageType === 'url' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-100'}`}
                >
                  Web URL
                </button>
              </div>
            </div>

            {imageType === 'upload' ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-amber-400 bg-amber-500/5' 
                    : imagePreview 
                      ? 'border-stone-700 bg-stone-950/20' 
                      : 'border-stone-800 hover:border-stone-700 bg-stone-950/40 hover:bg-stone-950/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="space-y-3">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-32 object-contain mx-auto rounded-lg border border-stone-800 bg-stone-950"
                    />
                    <div className="text-xs font-mono text-stone-400">
                      File Loaded. Click or drag to replace.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-stone-900 border border-stone-800 text-stone-400 mx-auto">
                      <Upload size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-stone-200">Drag & Drop Your Image</p>
                      <p className="text-xs text-stone-500">Or click to select a local JPEG/PNG file</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <ImageIcon size={14} />
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-... or custom URL"
                    className={`w-full bg-stone-950 border ${errors.image ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-800 focus:ring-amber-500/20 focus:border-amber-500'} rounded-xl pl-8 pr-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 text-sm transition-all`}
                  />
                </div>
                {imageUrl && (
                  <div className="p-2 border border-stone-800 bg-stone-950 rounded-xl inline-block">
                    <img
                      src={imageUrl}
                      alt="URL preview"
                      onError={() => setErrors(prev => ({ ...prev, image: 'Failed to load preview from this URL. Check if it is a direct image address.' }))}
                      onLoad={() => setErrors(prev => {
                        const copy = { ...prev };
                        delete copy.image;
                        return copy;
                      })}
                      className="h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}
            {errors.image && <p className="text-[10px] font-mono text-red-500">{errors.image}</p>}
          </div>

          {/* Description & Inspector Report */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                Archivist Notes / Description *
              </label>
              <span className="text-[10px] text-stone-500 font-mono">Include details like cut, stitch quality, fading patterns</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the garment's weave, fit profile, and inspector assessment reports..."
              rows={4}
              className={`w-full bg-stone-950 border ${errors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-stone-800 focus:ring-amber-500/20 focus:border-amber-500'} rounded-xl px-3.5 py-2.5 text-stone-100 placeholder-stone-600 focus:outline-none focus:ring-2 text-sm transition-all resize-none`}
            />
            {errors.description && <p className="text-[10px] font-mono text-red-500">{errors.description}</p>}
          </div>

          {/* Is Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-stone-950/40 border border-stone-850 rounded-xl">
            <div className="space-y-0.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-200">
                Mark as Featured Collection Piece
              </label>
              <p className="text-[10px] text-stone-500 font-mono">Featured items are displayed with a special flame badge on the racks.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 peer-checked:after:bg-stone-950 peer-checked:after:border-transparent"></div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="flex-1 px-4 py-3 bg-stone-800 hover:bg-stone-750 text-stone-300 font-mono font-bold rounded-xl text-sm transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono font-bold rounded-xl text-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              {productToEdit ? <Edit2 size={16} /> : <Plus size={16} />}
              <span>{productToEdit ? 'Save Changes' : 'Register to Racks'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
