import axios from "axios";
import { Product } from "../types/Product";

export async function fetchProductDetails(id: string | undefined): Promise<Product> {
  const response = await axios.get("https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products");
  const products: Product[] = response.data;
  const product = products.find((item) => String(item.id) === id);
  if (!product) throw new Error("Product not found");
  return product;
}
