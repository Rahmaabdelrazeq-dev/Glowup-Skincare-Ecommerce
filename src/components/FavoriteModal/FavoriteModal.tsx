import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Button, Image } from "react-bootstrap";
import { RootState } from "../../Redux/Store";
import { removeAllFavorite, removeFromFavorite } from "../../Redux/FavSlice";
import { addToCart } from "../../Redux/CartSlice";
import { motion, AnimatePresence } from "framer-motion";
import "./favoritemodal.css"
import toast, { Toaster } from "react-hot-toast";

interface FavoritesModalProps {
  show: boolean;
  onHide: () => void;
}


const FavoritesModal: React.FC<FavoritesModalProps> = ({ show, onHide }) => {
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const cart = useSelector((state:RootState)=> state.cart.items);
  const dispatch = useDispatch();
  
  

  return (
    <>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="favorites-modal"
    >
      <Modal.Header >
        <Modal.Title className="d-flex justify-content-between align-items-center w-100">
          <h4 className="m-0"> Favorites</h4>
          {favorites.length > 0 && (
            <i
              className="bi bi-trash3 text-danger fs-5"
              style={{ cursor: "pointer" }}
              onClick={() => dispatch(removeAllFavorite())}
              title="Remove All"
            ></i>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {favorites.length === 0 ? (
          <div className="text-center py-5">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              width={100}
              className="mb-3 opacity-75"
            />
            <h5>No favorites yet.</h5>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-4 justify-content-center">
            <AnimatePresence>
              {favorites.map((item) => (
                <motion.div
                  key={item.id}
                  className="favorite-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    className="favorite-img"
                    rounded
                  />
                  <div className="favorite-info">
                    <h6>{item.name}</h6>
                    <p className="price">${item.price}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => 
                        { if(cart.some((ele)=> ele.id == item.id)){
                         toast.error(`${item.name} Already in  cart 🛒`);

                        }else{
                          dispatch(addToCart({ ...item, quantity: 1 }));
                          toast.success(`${item.name} added to cart 🛒`);
                        }


                      }
                      }
                    >
                      <i className="bi bi-cart-plus"></i> Add to Cart
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {dispatch(removeFromFavorite(item.id));
                            toast.error(`${item.name} removed from favorites 💔`);

                      }}
                    >
                      <i className="bi bi-trash"></i> Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
</>
  );
};

export default FavoritesModal;
