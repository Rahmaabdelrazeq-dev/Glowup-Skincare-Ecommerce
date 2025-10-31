import React, { StrictMode, useEffect, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider, useDispatch } from "react-redux";
import store from "./Redux/Store";
import "bootstrap-icons/font/bootstrap-icons.css";
import { login } from "./Redux/Authosclice";
import { setCart } from "./Redux/CartSlice";
import { setFavorites } from "./Redux/FavSlice";
import { HelmetProvider } from "react-helmet-async";
import Users from "./Dashboard/pages/Users/Users";
import ProtectedRoute from "./components/Protectedroute/Protectedroute";
import styled, { keyframes } from "styled-components";
import ChartsAndReports from "./Dashboard/pages/Main/ChartsAndReports";
import Orders from "./Dashboard/pages/Orders/Orders";
import Products from "./Dashboard/pages/Products/Products";
import DashboardLayout from "./Dashboard/DashBoardLayout/DashBoardLayout";
import AdminMessages from "./Dashboard/pages/Contact/AdminMessages";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import ReportsPage from "./Dashboard/pages/Reports/ReportsPage";
import NotFound from "./Pages/NotFound/NotFound";
import Protectadmin from "./components/Protectedroute/Protectedadmin";
import ContactUs from "./components/ContactUs/ContactUs";
const Layout = lazy(() => import("./layouts/Mainlayout"));
const HomePage = lazy(() => import("./Pages/HomePage/HomePage"));
const SignUp = lazy(() => import("./Pages/Autho/Signup"));
const Login = lazy(() => import("./Pages/Autho/Login"));
const ForgetPassword = lazy(() => import("./Pages/Autho/Forget"));
const ProductListPage = lazy(
  () => import("./Pages/ProductPage/ProductListPage")
);
const ProductDetailsPage = lazy(
  () => import("./Pages/ProductDetailsPage/ProductDetailsPage")
);
const CartPage = lazy(() => import("./Pages/CartPage/CartPage"));
const CheckoutPage = lazy(() => import("./Pages/Checkout/CheckoutPage"));
const UserProfileEdit = lazy(
  () => import("./components/UserProfileEdit/UserProfileEdit")
);
const About = lazy(() => import("./Pages/About/About"));
const BlogPage = lazy(() => import("./Pages/Blog/BlogPage"));
const SkinCareChatbot = lazy(() => import("./components/Chatbot/Chatbot"));

const spin = keyframes`
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
`;

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const Spinner = styled.div`
  border: 5px solid rgba(255, 255, 255, 0.15);
  border-top: 5px solid #7c6f63;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingFallback: React.FC<{ message?: string }> = ({ message }) => (
  <SpinnerWrapper>
    <Spinner />
    <span style={{ marginLeft: 12, color: "#7c6f63", fontSize: "1.05rem" }}>
      {message || "Loading..."}
    </span>
  </SpinnerWrapper>
);

const router = createBrowserRouter([

  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingScreen/>}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
            <HomePage />
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading about..." />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "home",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading home..." />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense
            fallback={<LoadingFallback message="Loading products..." />}
          >
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: "products/:id",
        element: (
          <Suspense
            fallback={<LoadingFallback message="Loading product details..." />}
          >
            <ProtectedRoute>
            <ProductDetailsPage />
            </ProtectedRoute>

          </Suspense>
        ),
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading signup..." />}>
            <SignUp />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading login..." />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "forget",
        element: (
          <Suspense
            fallback={<LoadingFallback message="Loading password reset..." />}
          >
            <ForgetPassword />
          </Suspense>
        ),
      },
      {
        path: "cart",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading cart..." />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "checkout",
        element: (
          <Suspense
            fallback={<LoadingFallback message="Loading checkout..." />}
          >
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
            <ProtectedRoute>
              <UserProfileEdit />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={<LoadingFallback message="Loading blog..." />}>
            <BlogPage />
          </Suspense>
        ),
      },
            { path: "*", element: <NotFound /> },

  
       {path:"contactus",
        element:(
                  <Suspense fallback={<LoadingFallback message="Loading blog..." />}>
             <ContactUs/>
          </Suspense>  
        )
       },
       
 

    ],
  },

  {
    path: "/dashboard",
    element: (
       <Protectadmin >
      <DashboardLayout />
    </Protectadmin>
    ),
    children: [
      { index: true, element: <ChartsAndReports /> },
      { path: "products", element: <Products /> },
      { path: "orders", element: <Orders /> },
      { path: "user", element: <Users /> },
      { path: "contact", element: <AdminMessages/> },
      { path: "reports", element: <ReportsPage/> },
    ],
  },
]);

const queryClient = new QueryClient();

const RootApp = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentUser = users.find((u: any) => u.id === token);
      if (currentUser) {
        dispatch(login(token));
        dispatch(setCart(currentUser.cart || []));
        dispatch(setFavorites(currentUser.favorites || []));
      }
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <RootApp />
          <Suspense fallback={<LoadingFallback message="Loading chatbot..." />}>
            <SkinCareChatbot />
          </Suspense>
        </HelmetProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);

export default RootApp;