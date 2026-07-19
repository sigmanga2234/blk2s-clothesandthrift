export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
  size: string;
  condition: 'Mint' | 'Excellent' | 'Gently Used' | 'Distressed';
  material?: string;
  year?: string;
  reviews: Review[];
  isFeatured?: boolean;
  passcode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
