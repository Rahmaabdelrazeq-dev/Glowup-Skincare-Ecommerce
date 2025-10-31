import React, { useEffect } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import MoreDetails from "./MoreDetails";
import { useParams } from "react-router-dom";
import { Product } from "../../../types/Product";
import { useQuery } from "@tanstack/react-query";
import { fetchProductDetails } from "../../../services/GetProductDetails";
import { useDispatch, useSelector } from "react-redux";
import { addToFavorite, removeFromFavorite } from "../../../Redux/FavSlice";
import { RootState } from "../../../Redux/Store";
import toast, { Toaster } from "react-hot-toast";
import { addToCart } from "../../../Redux/CartSlice";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface Props {
  setProduct: (product: Product | null) => void;
}

export default function ProductDetailsSection({ setProduct }: Props) {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery<Product>({
    queryKey: ["productDetails", id],
    queryFn: () => fetchProductDetails(id),
  });

  useEffect(() => {
    if (data) setProduct(data);
  }, [data, setProduct]);

  const favorites = useSelector((state: RootState) => state.favorites.items);
  const isFavorite = favorites.some((item) => item.id === data?.id);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.auth.token);

  if (isLoading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status" />
      </div>
    );

  if (isError)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "red" }}>An error occurred while fetching data</h2>
      </div>
    );

  const handleFavoriteClick = () => {
    if (!data) return;
    if (user ==="admin") {
    Swal.fire({
      title: "Access Denied",
      text: "Admin accounts are not allowed to create orders from the shop interface.",
      icon: "info",
      confirmButtonText: "OK",
      });
      return;
    }
    if (isFavorite) {
      dispatch(removeFromFavorite(data.id));
      toast.error("Removed from favorites 💔");
    } else {
      dispatch(
        addToFavorite({
          id: data.id,
          name: data.name,
          price: data.price,
          image: data.imageUrl,
        })
      );
      toast.success("Added to favorites ❤️");
    }
  };

  const addProductToCart = () => {
    if (!data || data.stock === 0) {
    toast.error("Out of Stock!", {
      duration: 2000,
      position: "top-center",
    });
    return;
  }
    if (!data) return;
     if (user ==="admin") {
    Swal.fire({
      title: "Access Denied",
      text: "Admin accounts are not allowed to create orders from the shop interface.",
      icon: "info",
      confirmButtonText: "OK",
      });
      return;
    }
    const isInCart = cartItems.some((item) => item.id === data.id);
    if (isInCart) {
      toast.error(`${data.name} is already in your cart`, {
        duration: 2000,
        position: "top-center",
      });
      return;
    }

    dispatch(
      addToCart({
        id: data.id,
        name: data.name,
        price: data.price,
        quantity: 1,
        image: data.imageUrl,
      })
    );
    toast.success(`${data.name} added to cart 🛒`, {
      duration: 2000,
      position: "top-center",
    });
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Container className="pb-5">
          <Row className="g-5 align-items-center">
            <Col md={6}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-sm border-0">
                  <Card.Img variant="top" src={data?.imageUrl} />
                </Card>
              </motion.div>
            </Col>

            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="fw-bold mb-3">{data?.name}</h3>
                <h5 className="text-dark mb-3">{data?.category}</h5>
                <p className="text-muted mb-2">{data?.description}</p>
                <div className="mb-3 text-warning fs-5">
                  {"⭐".repeat(Math.round(data?.rating ?? 0))}
                </div>
                <h6 className="ps-1">
                  <span
                    style={{
                      fontSize: "18px",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    Price :{" "}
                  </span>
                  ${data?.price}
                </h6>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="p-2 bg-dark w-100"
                    onClick={addProductToCart}
                  >
                    Add to Cart
                  </Button>
                </motion.div>

                <motion.h6
                  className="my-4 fw-lighter d-flex align-items-center"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={handleFavoriteClick}
                  whileHover={{ scale: 1.05 }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {isFavorite ? (
                      <motion.i
                        className="bi bi-heart-fill text-danger fs-5"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.4 }}
                      ></motion.i>
                    ) : (
                      <i className="bi bi-heart fs-5"></i>
                    )}
                    <span style={{ transition: "opacity 0.3s ease" }}>
                      {isFavorite
                        ? "Saved To Favorites"
                        : "Save To Favorites"}
                    </span>
                  </span>
                </motion.h6>

                <hr
                  style={{
                    borderTop: "3px solid black",
                    width: "100%",
                    marginBottom: "0px",
                  }}
                />
                <MoreDetails />
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.div>
    </>
  );
}
