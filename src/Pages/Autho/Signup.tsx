import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";
import { Formik, useFormik } from "formik";
import axios, { Axios } from "axios";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

interface FormValues {
  name: string;
  email: string;
  password: string;
  re_password: string;
  age: number | "";
}
export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "name minlength is 3")
      .max(10, "name maxlength is 10")
      .required("name is required"),
    email: Yup.string().email("email is invalid").required("email is required"),
    password: Yup.string()
      .matches(
        /^[A-Z][A-Za-z0-9]{5,10}$/,
        "password must start with uppercase and minlength is 6"
      )
      .required("password is required"),
    re_password: Yup.string()
      .oneOf([Yup.ref("password")], "password and rePassword must be the same")
      .required("repassword is required"),
    age: Yup.number()
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .typeError("age must be a number")
      .required("age is required")
      .min(16, "minimum age is 16")
      .max(60, "maximum age is 60"),
  });

  async function handleSignup(formValues: FormValues) {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data: users } = await axios.get(
        "https://68e8fa40f2707e6128cd055c.mockapi.io/user"
      );

      const existingUser = users.find(
        (user: any) =>
          user.email.toLowerCase() === formValues.email.toLowerCase()
      );

      if (existingUser) {
        setErrorMessage("This email is already registered!");
        setLoading(false);
        return;
      }
      const { data } = await axios.post(
        "https://68e8fa40f2707e6128cd055c.mockapi.io/user",
        formValues
      );
      const responseWithMessage = { ...data, message: "Done" };
      // console.log("responseWithMessage:", data);
      if (responseWithMessage.message === "Done") {
              const users = JSON.parse(localStorage.getItem("users") || "[]");
    
users.push({ 
  id: data.id, 
  email: data.email, 
  cart: [], 
  favorites: [], 
  orders:[],
  
  ...data 
});
localStorage.setItem("users", JSON.stringify(users));

        localStorage.setItem("users", JSON.stringify(users));
        toast.success("✅ Sign up Done successful!")
        navigate("/login");
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMessage("This email is already registered!");
      } else if (error.response?.status === 422) {
        setErrorMessage("Please fill all fields correctly!");
      } else {
        setErrorMessage("An unexpected error occurred, please try again!");
      }
    } finally {
      setLoading(false);
    }
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      re_password: "",
      age: "",
    },
    validationSchema,
    onSubmit: handleSignup,
  });

  return (
    <>
    <Helmet>
        <meta charSet="utf-8" />
          <title>   Sign Up </title>
    </Helmet>
    <div className="signup-container">
    <motion.div
        className="signup-image d-none d-md-block"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src="https://i.pinimg.com/1200x/f4/ca/bd/f4cabd9599c9f1b8701053e073616329.jpg"
          alt="Product"
        />
      </motion.div>
    <motion.div
        className="signup-form"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
                <div className="form-content">
          <h3 className="mb-3 fw-light">Create your account</h3>
          {errorMessage && (
            <div className="alert alert-danger text-center" role="alert">
              {errorMessage}
            </div>
          )}
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="name"
                className="form-control"
                id="name"
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
              <div className="alert alert-danger" role="alert">
                {formik.errors.name}
              </div>
            ) : null}

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
            {formik.touched.email && formik.errors.email ? (
              <div className="alert alert-danger" role="alert">
                {formik.errors.email}
              </div>
            ) : null}
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
            {formik.touched.password && formik.errors.password ? (
              <div className="alert alert-danger" role="alert">
                {formik.errors.password}
              </div>
            ) : null}
            <div className="mb-3">
              <label htmlFor="repassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                value={formik.values.re_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="re_password"
                className="form-control"
                id="repassword"
              />
            </div>
            {formik.touched.re_password && formik.errors.re_password ? (
              <div className="alert alert-danger" role="alert">
                {formik.errors.re_password}
              </div>
            ) : null}
            <div className="mb-3">
              <label htmlFor="age" className="form-label">
                Age
              </label>
              <input
                type="number"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="age"
                className="form-control"
                id="age"
              />
            </div>
            {formik.touched.age && formik.errors.age ? (
              <div className="alert alert-danger" role="alert">
                {formik.errors.age}
              </div>
            ) : null}
            <button
              type="submit"
              className="btn btn-dark w-100 mt-2"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">"Creating..."</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-center mt-3" style={{ fontSize: "14px"}}>
              Already have an account?{" "}
              <Link to={"/login"} className="text-decoration-none">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
    </>
  );
}
