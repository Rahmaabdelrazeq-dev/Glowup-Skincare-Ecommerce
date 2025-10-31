import React from "react";
import CartSection from "../../components/CartSection/CartSection";
import { Helmet } from "react-helmet-async";

const CartPage: React.FC = () => {
  return (
    <div className="container py-3">
      {/* <h2 className="text-center mb-4"></h2> */}
      <Helmet>
          <meta charSet="utf-8" />
          <title> Cart </title>
      </Helmet>
      <CartSection />
    </div>
  );
};

export default CartPage;
