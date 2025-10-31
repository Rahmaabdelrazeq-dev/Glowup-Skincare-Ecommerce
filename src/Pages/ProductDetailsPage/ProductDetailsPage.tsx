import React, { useState } from 'react';
import ProducrDetailsSection from './components/ProducrDetailsSection';
import SkinRoutine from './components/SkinRoutine';
import RelatedProducts from './components/RelatedProducts';
import { Product } from '../../types/Product';
import { Helmet } from 'react-helmet-async';

export default function ProductDetailsPage() {
  const [product, setProduct] = useState<Product | null>(null);

  return (
    <>
        <Helmet>
          <meta charSet="utf-8" />
          <title> Product Details </title>
    
        </Helmet>
      <ProducrDetailsSection setProduct={setProduct}/>
      <SkinRoutine />
      {product && (
        <RelatedProducts category={product.category} currentProductId={product.id} />
      )}
    </>
  );
}
