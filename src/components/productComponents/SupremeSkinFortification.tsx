import * as React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'react-bootstrap-icons';
import ProductCard from './ProductCard';
import { type Product } from '../../types/Product';
import { Link } from 'react-router-dom';


const API_URL = 'https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products';

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    // Failure in fetching data from the server
    throw new Error('Failed to fetch data from the server'); 
  }
  const data = await response.json();
  if (Array.isArray(data)) return data as Product[];
  if (data && typeof data === 'object') {
    const values = Object.values(data);
    for (const value of values) {
      if (Array.isArray(value)) return value as Product[];
    }
  }
  return [];
};

const SupremeSkinFortification: React.FC = () => {
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

  const productList: Product[] = Array.isArray(products) ? products : [];

  return (
    <Container className="my-5 skin-fortification-container">
      <header
        className="header-section mb-4"
      >
        <p
          className="text-uppercase small text-secondary mb-2"
          style={{ letterSpacing: '0.2em' }}
        >
          Parsley Seed Skin Care
        </p>
        <h1 className="display-6 fw-normal mb-3">
          Supreme Skin Fortification
        </h1>
        <p className="lead text-secondary">
          Discover our potent antioxidant-rich Parsley Seed Skin Care, perfect for all skin types.
        </p>
      </header>

      <div className="product-scroll-wrapper">
        <Row className="flex-nowrap gx-3">
          {productList.map((product) => (
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

      <footer className="footer-link-section pt-4 mt-5">
        <Link to="/products" className="text-body text-decoration-none d-flex align-items-center">
          All Products <ArrowRight className="ms-2" size={20} />
        </Link>
      </footer>

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
  );
};

export default SupremeSkinFortification;