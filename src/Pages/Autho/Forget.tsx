import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SignUp.css";
import signupimage from "../../assets/images/signuppage.png";
import { useFormik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../../components/Resetpassword/Resetpassword"; 
import {motion}  from "framer-motion"
import { Helmet } from "react-helmet-async";
interface EmailFormValues {
  email: string;
}

export default function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const emailFormik = useFormik<EmailFormValues>({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage("");

        const { data } = await axios.get(
          `https://68e8fa40f2707e6128cd055c.mockapi.io/user?email=${values.email}`,
          { headers: { "Cache-Control": "no-cache" } }
        );

        if (data.length > 0) {
          setUserId(data[0].id);  
          setStep("reset");       
        } else {
          setMessage("❌ Email not found!");
        }
      } catch (error) {
        setMessage("❌ Something went wrong, please try again!");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
    <Helmet>
        <meta charSet="utf-8" />
          <title> Forget Password </title>
    </Helmet>
        <div className="signup-container">
 <motion.div
        className="signup-image d-none d-md-block"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >        <img src={"https://i.pinimg.com/1200x/f4/ca/bd/f4cabd9599c9f1b8701053e073616329.jpg"} alt="Reset Password Visual" />
      </motion.div>

 <motion.div
        className="signup-form"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >        <div className="form-content">
          <h3 className="mb-3 fw-light">Forget Password</h3>

          {message && (
            <div
              className={`alert ${
                message.startsWith("✅")
                  ? "alert-success"
                  : message.startsWith("❌")
                  ? "alert-danger"
                  : "alert-warning"
              } text-center`}
              role="alert"
            >
              {message}
            </div>
          )}


          {step === "email" && (
            <form onSubmit={emailFormik.handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  placeholder="example@email.com"
                  value={emailFormik.values.email}
                  onChange={emailFormik.handleChange}
                  onBlur={emailFormik.handleBlur}
                />
                {emailFormik.touched.email && emailFormik.errors.email && (
                  <div className="alert alert-danger mt-2">{emailFormik.errors.email}</div>
                )}
              </div>

              <button type="submit" className="btn btn-dark w-100 mt-2" disabled={loading}>
                {loading ? "Checking..." : "Next"}
              </button>
            </form>
          )}

     
          {step === "reset" && userId && (
            <ResetPasswordForm
              userId={userId}
              onSuccess={() => {
            navigate("/login");
              }}
            />
          )}

          <p className="text-center mt-3" style={{ fontSize: "14px" }}>
            Remembered your password?{" "}
            <Link to={"/login"} className="text-decoration-none">Log in here</Link>
          </p>
        </div>
      </motion.div>
    </div>
    </>
  );
}




