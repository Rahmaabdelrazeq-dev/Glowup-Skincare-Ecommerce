import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";
import { useFormik } from "formik";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../Redux/Authosclice";
import toast from "react-hot-toast";
import { RootState } from "../../Redux/Store";
import { setFavorites } from "../../Redux/FavSlice";
import { addToCart } from "../../Redux/CartSlice";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { setUser } from "../../Redux/userSlice";

interface FormValues {
  email: string;
  password: string;
}

export default function Login() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const token = useSelector((state: RootState) => state.auth.token);
  React.useEffect(() => {
    if (token === "admin") {
      navigate("/dashboard");
    } else if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Email is invalid").required("Email is required"),
    password: Yup.string()
      .matches(
        /^[A-Z][A-Za-z0-9]{5,10}$/,
        "Password must start with uppercase and minlength is 6"
      )
      .required("Password is required"),
  });

  async function handleLogin(formValues: FormValues) {
    console.log("Sent values:", formValues);

    try {
      setLoading(true);
      setErrorMessage("");
      if (
        formValues.email.toLowerCase() === "admin@admin.com" &&
        formValues.password === "A123123"
      ) {
        // toast.success("✅ Admin login successful!");
        localStorage.setItem("userToken", "admin");
        dispatch(login("admin"));
        navigate("/dashboard");
        return;
      }
      const { data: users } = await axios.get(
        "https://68e8fa40f2707e6128cd055c.mockapi.io/user",
        { headers: { "Cache-Control": "no-cache" } }
      );

      const foundUser = users.find(
        (user: any) =>
          user.email.toLowerCase() === formValues.email.toLowerCase() &&
          user.password === formValues.password
      );

      if (foundUser) {
        localStorage.setItem("userToken", foundUser.id);
        dispatch(login(foundUser.id));

        dispatch(
          setUser({
            name: foundUser.name,
            email: foundUser.email,
            image: foundUser.image,
          })
        );

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const currentUser = users.find((u: any) => u.id === foundUser.id);
        if (currentUser) {
          dispatch(setFavorites(currentUser.favorites || []));
          currentUser.cart?.forEach((item: any) => dispatch(addToCart(item)));
        }

        toast.success("✅ Login successful!");
        navigate("/home");
      } else {
        setErrorMessage("Invalid email or password!");
        toast.error("❌ Invalid email or password!");
      }
    } catch (error: any) {
      console.log("Server error:", error.response?.data);
      if (error.response?.status === 401) {
        toast.error("Invalid email or password!");
      } else if (error.response?.status === 422) {
        toast.error("Please fill all fields correctly!");
      } else {
        toast.error("An unexpected error occurred, please try again!");
      }
    } finally {
      setLoading(false);
    }
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleLogin,
  });

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> Login </title>
      </Helmet>
      <div className="signup-container">
        <motion.div
          className="signup-image d-none d-md-block"
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {" "}
          <img
            src={
              "https://i.pinimg.com/1200x/f4/ca/bd/f4cabd9599c9f1b8701053e073616329.jpg"
            }
            alt="Login visual"
          />
        </motion.div>

        <motion.div
          className="signup-form"
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          {" "}
          <div className="form-content">
            <h3 className="mb-3 fw-light">Log in to your account</h3>

            {errorMessage && (
              <div className="alert alert-danger text-center" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="email"
                  className="form-control"
                  id="email"
                  placeholder="example@email.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="alert alert-danger" role="alert">
                  {formik.errors.email}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="password"
                  className="form-control"
                  id="password"
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="alert alert-danger" role="alert">
                  {formik.errors.password}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-dark w-100 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">"Loading..."</span>
                  </div>
                ) : (
                  "Log In"
                )}
              </button>

              <p className="text-center mt-3" style={{ fontSize: "14px" }}>
                Forgot your password?{" "}
                <Link to={"/forget"} className="text-decoration-none">
                  Reset it here
                </Link>
              </p>
              <p className="text-center mt-3" style={{ fontSize: "14px" }}>
                didn't have an account?{" "}
                <Link to={"/signup"} className="text-decoration-none">
                  Register now
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}
