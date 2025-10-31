import * as React from 'react';
import ProductList from '../../components/productComponents/ProductList'; 
import { Helmet } from 'react-helmet-async';

const ProductListPage: React.FC = () => {
  return (
    <>
        <Helmet>
          <meta charSet="utf-8" />
          <title> Products </title>
    
        </Helmet>
      <ProductList />
          
      

    </>
 
       
      
   
  );
};

export default ProductListPage;