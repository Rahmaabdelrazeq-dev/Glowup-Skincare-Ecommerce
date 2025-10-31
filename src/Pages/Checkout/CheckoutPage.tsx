import React, { useState, useMemo } from "react";
import styled, { createGlobalStyle } from "styled-components";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Redux/Store";
import { CartItem, clearCartState } from "../../Redux/CartSlice";

import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { addOrderAsync } from "../../Redux/OrderSlice";

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("First Name is required")
    .min(3, "Name too short"),
  lastName: yup
    .string()
    .required("Last Name is required")
    .min(3, "Name too short"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9\-\(\)\s\+]+$/, "Invalid phone number"),
  mailingAddress: yup
    .string()
    .required("Address is required")
    .min(5, "Address too short"),
  city: yup.string().required("City is required"),
  postCode: yup
    .string()
    .required("Post code is required")
    .matches(
      /^[0-9]{5}$|^[0-9]{5}-[0-9]{4}$/,
      "Invalid postal code (e.g. 12345 or 12345-6789)"
    ),
  country: yup.string().required("Country is required"),
});

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #f7f8fa;
  }
`;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 100px 20px 40px 20px;
  min-height: 100vh;
  background-color: #f7f8fa;
`;

const CheckoutWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background-color: transparent;
  gap: 20px;
  flex-direction: row;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const LeftColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
  min-width: 350px;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e4e8;
`;

const ShoppingCartCard = styled(Card)`
  padding: 25px 25px 30px 25px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CartHeader = styled.h3`
  font-size: 1.25rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
`;

const CartItemsScrollArea = styled.div`
  flex-grow: 1;
`;

const CartItemContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f2f5;
  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 15px;
  border: 1px solid #eef0f3;
`;

const ItemDetails = styled.div`
  flex-grow: 1;
`;

const ItemName = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const ItemDescription = styled.p`
  font-size: 0.85rem;
  color: #8892a7;
  margin: 2px 0 0 0;
`;

const ItemPrice = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  min-width: 60px;
  text-align: right;
`;

const TotalsContainer = styled.div`
  padding: 20px 0;
  border-top: 1px solid #eef0f3;
  margin-top: auto;
`;

const TotalRow = styled.div<{ $isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: ${(props) => (props.$isTotal ? "1.15rem" : "1rem")};
  font-weight: ${(props) => (props.$isTotal ? "700" : "500")};
  color: ${(props) => (props.$isTotal ? "#2c3e50" : "#5d6d7e")};

  span:last-child {
    font-weight: ${(props) => (props.$isTotal ? "700" : "600")};
  }
`;

const PlaceOrderButton = styled.button`
  width: 100%;
  padding: 15px;
  border: none;
  font-size: 1.12rem;
  background: linear-gradient(95deg, #e6e6e6 10%, #fcfcfc 90%);
  color: #000;
  border-radius: 12px;
  font-weight: 600;
`;

const PrivacyText = styled.p`
  font-size: 0.8rem;
  color: #8892a7;
  text-align: center;
  margin-top: 15px;

  a {
    color: #4a80e1;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FormSectionCard = styled(Card)`
  padding: 25px;
`;

const SectionTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TitleText = styled.h3`
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
`;

const SectionContent = styled.div<{ $isOpen: boolean }>`
  max-height: 1000px;
  overflow: visible;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;

  & > div {
    flex: 1;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #5d6d7e;
  margin-bottom: 5px;
  font-weight: 500;
`;

const InputField = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid ${(props) => (props.$hasError ? "#e74c3c" : "#e2e4e8")};
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  background-color: #fcfcfd;
  box-sizing: border-box;

  &:focus {
    border-color: ${(props) => (props.$hasError ? "#e74c3c" : "#4a80e1")};
    outline: none;
    background-color: white;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 5px;
  margin-bottom: 0;
  font-weight: 500;
`;

const saveOrderAndClearCart = (
  dispatch: any,
  userId: string,
  cartItems: CartItem[],
  total: number,
  userName: string
) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex >= 0) {
    const newOrder = {
      id: Date.now().toString(),
      userId,
      userName,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      date: new Date().toISOString(),
      status: "pending",
    };
    users[userIndex].orders = [...(users[userIndex].orders || []), newOrder];
    users[userIndex].cart = [];

    localStorage.setItem("users", JSON.stringify(users));

    return true;
  }
  return false;
};

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems: CartItem[] = useSelector(
    (state: RootState) => state.cart.items
  );
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userToken") || "guest";

  const BASE_SHIPPING = 10.85;

  const [isPersonalDetailsOpen] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    mailingAddress: "",
    city: "",
    postCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const totalItems = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const { subtotal, shippingCost, totalPayable } = useMemo(() => {
    const calculatedSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const calculatedShippingCost = BASE_SHIPPING;

    const calculatedTotalPayable = calculatedSubtotal + calculatedShippingCost;

    return {
      subtotal: calculatedSubtotal,
      shippingCost: calculatedShippingCost,
      totalPayable: calculatedTotalPayable,
    };
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Swal.fire("Cart Empty", "Please add items to your cart.", "warning");
      return;
    }

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const newOrder = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: formData.firstName + " " + formData.lastName,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: totalPayable,
        date: new Date().toISOString(),
        status: "pending",
      };

      const resultAction = await dispatch(addOrderAsync(newOrder));

      if (addOrderAsync.fulfilled.match(resultAction)) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u: any) => u.id === currentUserId);
        if (userIndex >= 0) {
          users[userIndex].orders = [
            ...(users[userIndex].orders || []),
            resultAction.payload,
          ];
          users[userIndex].cart = [];
          localStorage.setItem("users", JSON.stringify(users));
        }

        dispatch(clearCartState());

        Swal.fire(
          "Order Placed!",
          `Your order for $${totalPayable.toFixed(2)} has been submitted.`,
          "success"
        );
        navigate("/home");
      } else {
        Swal.fire("Error", " No Enough Stock ", "error");
      }
    } catch (err: any) {
      if (err.inner) {
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          if (e.path) validationErrors[e.path] = e.message;
        });
        setErrors(validationErrors);
        Swal.fire(
          "Missing Data",
          "Please fill in all required fields.",
          "error"
        );
      }
    }
  };

  const renderCartItems = () => (
    <CartItemsScrollArea>
      {cartItems.map((item) => (
        <CartItemContainer key={item.id}>
          <ItemImage src={item.image} alt={item.name} />
          <ItemDetails>
            <ItemName>{item.name}</ItemName>
            <ItemDescription>Quantity: {item.quantity}</ItemDescription>
          </ItemDetails>
          <div style={{ textAlign: "right" }}>
            <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
          </div>
        </CartItemContainer>
      ))}
    </CartItemsScrollArea>
  );

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> Checkout </title>
      </Helmet>
      <GlobalStyle />
      <PageContainer>
        <CheckoutWrapper>
          <LeftColumn>
            <FormSectionCard>
              <SectionTitle>
                <TitleText>Your Personal Details & Shipping</TitleText>
              </SectionTitle>
              <SectionContent $isOpen={isPersonalDetailsOpen}>
                <div>
                  <InputGroup>
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <InputField
                        id="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        $hasError={!!errors.firstName}
                      />
                      {errors.firstName && (
                        <ErrorMessage>{errors.firstName}</ErrorMessage>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <InputField
                        id="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        $hasError={!!errors.lastName}
                      />
                      {errors.lastName && (
                        <ErrorMessage>{errors.lastName}</ErrorMessage>
                      )}
                    </div>
                  </InputGroup>
                  <InputGroup>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <InputField
                        id="email"
                        placeholder="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        $hasError={!!errors.email}
                      />
                      {errors.email && (
                        <ErrorMessage>{errors.email}</ErrorMessage>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <InputField
                        id="phone"
                        placeholder="Enter your Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        $hasError={!!errors.phone}
                      />
                      {errors.phone && (
                        <ErrorMessage>{errors.phone}</ErrorMessage>
                      )}
                    </div>
                  </InputGroup>
                  <div style={{ marginBottom: "15px" }}>
                    <Label htmlFor="mailingAddress">Street Address</Label>
                    <InputField
                      id="mailingAddress"
                      placeholder="Mailing/Shipping Address"
                      value={formData.mailingAddress}
                      onChange={handleChange}
                      $hasError={!!errors.mailingAddress}
                    />
                    {errors.mailingAddress && (
                      <ErrorMessage>{errors.mailingAddress}</ErrorMessage>
                    )}
                  </div>
                  <InputGroup>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <InputField
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        $hasError={!!errors.city}
                      />
                      {errors.city && (
                        <ErrorMessage>{errors.city}</ErrorMessage>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postCode">Post Code</Label>
                      <InputField
                        id="postCode"
                        placeholder="Post Code"
                        value={formData.postCode}
                        onChange={handleChange}
                        $hasError={!!errors.postCode}
                      />
                      {errors.postCode && (
                        <ErrorMessage>{errors.postCode}</ErrorMessage>
                      )}
                    </div>
                  </InputGroup>
                  <InputGroup>
                    <div style={{ flex: "0 0 100%" }}>
                      <Label htmlFor="country">Country</Label>
                      <InputField
                        id="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                        $hasError={!!errors.country}
                      />
                      {errors.country && (
                        <ErrorMessage>{errors.country}</ErrorMessage>
                      )}
                    </div>
                  </InputGroup>
                </div>
              </SectionContent>
            </FormSectionCard>
          </LeftColumn>

          <RightColumn>
            <ShoppingCartCard>
              <CartHeader>Shopping Cart</CartHeader>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#5d6d7e",
                  marginTop: "-10px",
                }}
              >
                You have {totalItems} items in your cart
              </p>

              <div
                style={{
                  padding: "10px 0",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {cartItems.length > 0 ? (
                  renderCartItems()
                ) : (
                  <p
                    style={{
                      color: "#8892a7",
                      textAlign: "center",
                      flexGrow: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Your cart is empty.
                  </p>
                )}
              </div>

              <TotalsContainer>
                <TotalRow>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </TotalRow>
                <TotalRow>
                  <span>Shipping Cost (+)</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </TotalRow>
                <TotalRow $isTotal>
                  <span>Total Payable</span>
                  <span>${totalPayable.toFixed(2)}</span>
                </TotalRow>
              </TotalsContainer>

              <PlaceOrderButton onClick={handlePlaceOrder}>
                Place Order
              </PlaceOrderButton>

              <PrivacyText>
                By placing your order, you agree to our company <br />
                <a href="/privacy">Privacy Policy</a> and{" "}
                <a href="/terms">Conditions of Use</a>.
              </PrivacyText>
            </ShoppingCartCard>
          </RightColumn>
        </CheckoutWrapper>
      </PageContainer>
    </>
  );
};

export default CheckoutPage;
