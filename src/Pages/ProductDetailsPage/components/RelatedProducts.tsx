import React from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import ProductCard from '../../../components/productComponents/ProductCard';
import { useQuery } from '@tanstack/react-query';
import { type Product } from '../../../types/Product';

interface RelatedProductsProps {
  category?: string;
  currentProductId?: number | string;
}

const API_URL = 'https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products';
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch data from the server'); 
  }
  const data = await response.json();
  if (data && Array.isArray(data)) return data as Product[];
  return [];
};

const RelatedProducts: React.FC<RelatedProductsProps> = ({ category, currentProductId }) => {
  const { data: products, isLoading, isError } = useQuery<Product[], Error>({
    queryKey: ['skincareProducts'],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" variant="dark">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2 text-secondary">Loading products...</p>
      </Container>
    );
  }

  if (isError) return <p>An error occurred while loading products.</p>;

  const relatedProducts = products
  ?.filter(
    (product) =>
      product.category === category && product.id !== currentProductId
  )
  .sort(() => Math.random() - 0.5)
   .slice(0, 6);

  if (!relatedProducts?.length) {
    return <p className="text-center text-muted">No related products found.</p>;
  }
  return (
    <section className="mt-5 py-4">
      <Container fluid >
        <h6 style={{ fontWeight: "lighter",marginLeft:'50px'}}>Suggested</h6>
        <h4 style={{ fontWeight: "normal" ,marginLeft:'50px'}}>Combine With</h4>
        <p style={{ fontSize: "14px", color: "grey" ,marginLeft:'50px'}}>
          You may also like the following products
        </p>
        {/* <Row className="justify-content-center ms-4" style={{width:"100%"}}>
          {relatedProducts.map((product) => (
            <Col
              key={product.id}
              xs={6}
              sm={6}
              md={6}
              lg={4}
              xl={4}
              className="mb-4 "
            >
              <ProductCard product={product} />
            </Col>
          ))}
        </Row> */}
          <div className="product-scroll-wrapper">
                <Row className="flex-nowrap gx-3">
                  {relatedProducts.map((product) => (
                    <Col
                      key={product.id}
                      xs="auto"
                      style={{ flex: '0 0 auto' }}
                    >
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </div>
                 <style>{`
        .product-scroll-wrapper {
          overflow-x: auto;
          padding-bottom: 1rem;
        }

        .product-scroll-wrapper::-webkit-scrollbar {
          height: 4px;
        }

        .product-scroll-wrapper::-webkit-scrollbar-thumb {
          background-color: black;
        }

        @media (max-width: 576px) {
          .row > .col-auto {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }
      `}</style>
      </Container>
    </section>
  );
};

export default RelatedProducts;
