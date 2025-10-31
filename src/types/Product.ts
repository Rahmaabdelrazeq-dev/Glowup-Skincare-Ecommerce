export interface Product {
  id: number;
  name: string;
  brand:string;
  category:string,
  description: string;
  size: string;
  price: number;
  isBestseller?: boolean;
  isNewFormula?: boolean;
  isNightMasque?: boolean;
  imageUrl: string;
  rating?: number; 
  stock:number

}
