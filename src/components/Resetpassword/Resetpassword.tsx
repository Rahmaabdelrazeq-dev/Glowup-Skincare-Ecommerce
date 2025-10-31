import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

interface Props {
  userId: string;
  onSuccess?: () => void; 
}

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordForm({ userId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const formik = useFormik<PasswordFormValues>({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .matches(
          /^[A-Z]\S{5,}$/,
          "Password must start with uppercase and be at least 6 chars"
        )
        .required("New password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setMessage("");

        const { data: userData } = await axios.get(
          `https://68e8fa40f2707e6128cd055c.mockapi.io/user/${userId}`,
          { headers: { "Cache-Control": "no-cache" } }
        );

        await axios.put(
          `https://68e8fa40f2707e6128cd055c.mockapi.io/user/${userId}`,
          { ...userData, password: values.newPassword }
        );

        setMessage("✅ Password reset successful!");
        if (onSuccess) onSuccess();
      } catch (error) {
        setMessage("❌ Something went wrong, please try again!");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {message && (
        <div
          className={`alert ${
            message.startsWith("✅") ? "alert-success" : "alert-danger"
          } text-center`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="newPassword" className="form-label">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="form-control"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.newPassword && formik.errors.newPassword && (
          <div className="alert alert-danger mt-2">{formik.errors.newPassword}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className="form-control"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="alert alert-danger mt-2">{formik.errors.confirmPassword}</div>
        )}
      </div>

      <button type="submit" className="btn btn-dark w-100 mt-2" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}




// in profile
// import { useSelector } from "react-redux";
// import ResetPasswordForm from "../Autho/ResetPasswordForm";

// export default function UserProfile() {
//   const token = useSelector((state: any) => state.auth.token); // هنا الـ token

//   return (
//     <div>
//       <h2>Update Password</h2>
//       {token && <ResetPasswordForm token={token} onSuccess={() => alert("Password updated!")} />}
//     </div>
//   );
// }


// interface Props {
//   token: string;      
//   onSuccess?: () => void;
// }
// const { data: userData } = await axios.get(
//   `https://68e8fa40f2707e6128cd055c.mockapi.io/user/${token}`,
//   { headers: { "Cache-Control": "no-cache" } }
// );

