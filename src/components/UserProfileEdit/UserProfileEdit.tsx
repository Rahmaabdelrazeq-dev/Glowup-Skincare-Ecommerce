import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import UserMessages from "../UserMessages/UserMessages";
import { setUser } from "../../Redux/userSlice";
import { useDispatch } from "react-redux";


const Container = styled.section`
  min-height: 100vh;
background: linear-gradient(
            120deg,
            #f6f4ed 75%,
            #e9e3da 100%
          );
            display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 950px;
  width: 100%;
  background: #fff;
  box-shadow: 0 8px 30px rgba(180, 190, 210, 0.25);
  border-radius: 18px;
  overflow: hidden;

  @media (max-width: 850px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;

  img {
    width: 130px;
    height: 130px;
    object-fit: cover;
    border-radius: 50%;
    border: 3px solid #e0e3ec;
    background: #f2f4f8;
    box-shadow: 0 6px 20px rgba(170, 180, 200, 0.25);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 28px rgba(150, 160, 180, 0.35);
    }
  }

  label {
    margin-top: 14px;
    font-size: 0.9rem;
    color: #4a5570;
    cursor: pointer;
    text-decoration: underline;
  }

  input {
    display: none;
  }
`;

const RightPanel = styled.div`
  flex: 1.3;
  padding: 50px 60px;
  display: flex;
  flex-direction: column;
  background: #fff;

  @media (max-width: 850px) {
    padding: 30px 25px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #2c3144;
  font-weight: 700;
  margin-bottom: 6px;
`;

const Subtitle = styled.p`
  color: #7a849b;
  font-size: 1rem;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a4f63;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #2d3446;
  font-size: 1rem;
  transition: 0.2s;

  &:focus {
    border-color: #6b7bff;
    outline: none;
    background: #f8f9ff;
  }

  &::placeholder {
    color: #b0b6c3;
  }
`;

const ErrorMsg = styled.div`
  background: #fff4f4;
  color: #e15555;
  border: 1px solid #f5c2c2;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 0.95rem;
`;

const Button = styled.button`
  margin-top: 10px;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 0;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  opacity: 1;
  transition: all 0.25s ease;

  &:hover {
    opacity: 0.85;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #aab2d8;
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #2c3144;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
  &:hover {
    color: #7c6f63;
    transform: translateX(-2px);
  }
`;

const MenuContainer = styled.div`
  background: #fff;
  width: 50%;
  padding: 40px 50px;
  border-radius: 16px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #ddd;
  }

  h3 {
    margin: 10px 0 0;
    color: #2c3144;
    font-weight: 600;
  }

  button {
    background: #7c6f63;
    color: #fff;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    width: 200px;
    transition: 0.3s;

    &:hover {
      background: #a19084;
      transform: translateY(-2px);
    }
  }
`;

const validationSchema = Yup.object({
  name: Yup.string().min(3).max(10).required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  oldPassword: Yup.string(),
  newPassword: Yup.string().test(
    "is-valid-new-password",
    "Password must start with uppercase and length 6-11",
    (value) => !value || /^[A-Z][a-z0-9]{5,10}$/.test(value)
  ),
});

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<"menu" | "edit" | "orders" | "messages">(
    "menu"
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [data, setData] = useState<any>({
    id: "",
    email: "",
    name: "",
    phone: "",
    password: "",
    oldPassword: "",
    newPassword: "",
    image: "",
  });
  const [originalData, setOriginalData] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const defaultUserImage =
    "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  useEffect(() => {
    const userId = localStorage.getItem("userToken");
    if (!userId) return;
    axios
      .get(`https://68e8fa40f2707e6128cd055c.mockapi.io/user/${userId}`)
      .then((res) => {
        setData({
          ...res.data,
          password: "",
          oldPassword: "",
          newPassword: "",
        });
        setOriginalData({
          name: res.data.name,
          email: res.data.email,
        });
      })
      .catch(() => toast.error("Failed to load user data"));
  }, []);

  useEffect(() => {
    const nameChanged = data.name !== originalData.name;
    const emailChanged = data.email !== originalData.email;
    setRequirePassword(nameChanged || emailChanged);
  }, [data.name, data.email, originalData]);

  useEffect(() => {
    if (mode === "orders" && data.id) {
      axios
        .get("https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders")
        .then((res) => {
          const filtered = res.data.filter((o: any) => o.userId === data.id);
          setOrders(filtered);
        })
        .catch(() => toast.error("Failed to load orders"));
    }
  }, [mode, data.id]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_upload");
      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dtss0bqxc/upload",
          formData
        );
        setData({ ...data, image: response.data.secure_url });
      } catch {
        toast.error("Failed to upload image");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem("userToken");
    if (!userId) return;

    if (requirePassword && !data.oldPassword) {
      toast.error("Please enter your password to confirm sensitive changes.");
      return;
    }

    try {
      await validationSchema.validate({
        name: data.name,
        email: data.email,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
    } catch (validationError: any) {
      setError(validationError.message);
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `https://68e8fa40f2707e6128cd055c.mockapi.io/user/${userId}`,
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          image: data.image,
          ...(isChangingPassword && { password: data.newPassword }),
        }
      );
      dispatch(setUser({ name: data.name, email: data.email, image: data.image }));
      toast.success("✅ Profile updated successfully!");
      setIsChangingPassword(false);
      setMode("menu");
    } catch {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "orders") {
    return (
      <Container>
        <Helmet>
          <title>My Orders</title>
        </Helmet>

        <div>
          <BackButton onClick={() => setMode("menu")}>← Back</BackButton>
          <Card>
            <RightPanel>
              <Title>My Orders</Title>
              <Subtitle>Here are your recent orders</Subtitle>

              {orders.length > 0 ? (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "15px",
                        background: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#726255",
                            color: "#fff",
                            textAlign: "left",
                          }}
                        >
                          <th style={{ padding: "12px 15px" }}>#</th>
                          <th style={{ padding: "12px 15px" }}>Order ID</th>
                          <th style={{ padding: "12px 15px" }}>Items</th>
                          <th style={{ padding: "12px 15px" }}>Total</th>
                          <th style={{ padding: "12px 15px" }}>Status</th>
                          <th style={{ padding: "12px 15px" }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((order, index) => (
                            <tr
                              key={order.id}
                              style={{
                                borderBottom: "1px solid #eee",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = "#f9f9f9")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <td style={{ padding: "12px 15px" }}>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td
                                style={{
                                  padding: "12px 15px",
                                  color: "#483B32",
                                  fontWeight: 600,
                                }}
                              >
                                {order.id}
                              </td>
                              <td style={{ padding: "12px 15px" }}>
                                {order.items
                                  .map((item: any) =>
                                    item.name.split(" ").slice(0, 2).join(" ")
                                  )
                                  .join(", ")}
                              </td>
                              <td
                                style={{
                                  padding: "12px 15px",
                                  color: "#7c6f63",
                                }}
                              >
                                ${order.total}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <span
                                  style={{
                                    fontWeight: 500,
                                    color: "#fff",
                                    borderRadius: "6px",
                                    padding: "4px 10px",
                                    backgroundColor:
                                      order.status === "completed"
                                        ? "green"
                                        : order.status === "pending"
                                        ? "#ffc107"
                                        : "red",
                                    display: "inline-block",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {order.status}
                                </span>
                              </td>

                              <td
                                style={{ padding: "12px 15px", color: "#555" }}
                              >
                                {new Date(order.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "20px",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      Prev
                    </button>

                    <span style={{ fontWeight: 600, color: "#555" }}>
                      Page {currentPage} of{" "}
                      {Math.ceil(orders.length / itemsPerPage)}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          prev < Math.ceil(orders.length / itemsPerPage)
                            ? prev + 1
                            : prev
                        )
                      }
                      disabled={
                        currentPage === Math.ceil(orders.length / itemsPerPage)
                      }
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor:
                          currentPage ===
                          Math.ceil(orders.length / itemsPerPage)
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <p>No orders found.</p>
              )}
            </RightPanel>
          </Card>
        </div>
      </Container>
    );
  }

  if (mode === "menu") {
    return (
      <Container>
        <Helmet>
          <title>User Menu</title>
        </Helmet>
        <MenuContainer>
          <img src={data.image || defaultUserImage} alt="User" />
          <h3>{data.name || "User"}</h3>
          <button onClick={() => setMode("edit")}>Edit Profile</button>
          <button onClick={() => setMode("orders")}>My Orders</button>
          <button onClick={() => setMode("messages")}>My Messages</button>
        </MenuContainer>
      </Container>
    );
  }
  if (mode === "messages") {
    return (
      <Container>
        <Helmet>
          <title>My Messages</title>
        </Helmet>
        <div>
          <BackButton onClick={() => setMode("menu")}>← Back</BackButton>
          <Card>
            <RightPanel>
              <Title>My Messages</Title>
              <Subtitle>Check replies from the admin</Subtitle>
              <UserMessages userEmail={data.email} />
            </RightPanel>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>Edit Profile</title>
      </Helmet>
      <div>
        <BackButton onClick={() => setMode("menu")}>← Back</BackButton>
        <Card>
          <LeftPanel>
            <img src={data.image || defaultUserImage} alt="User" />
            <label htmlFor="upload">Change Image</label>
            <input
              id="upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </LeftPanel>

          <RightPanel>
            <Title>Profile Settings</Title>
            <Subtitle>Manage your personal info and credentials</Subtitle>

            <Form onSubmit={handleSave}>
              {error && <ErrorMsg>{error}</ErrorMsg>}

              <Label>Email Address</Label>
              <Input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                required
              />

              <Label>Full Name</Label>
              <Input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                required
              />

              {requirePassword && (
                <>
                  <Label style={{ color: "#6b7bff", fontWeight: 600 }}>
                    Please confirm your password to apply sensitive changes
                  </Label>
                  <Input
                    type="password"
                    name="oldPassword"
                    value={data.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                </>
              )}

              {isChangingPassword && (
                <>
                  <Label>Old Password</Label>
                  <Input
                    type="password"
                    name="oldPassword"
                    value={data.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter old password"
                  />
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={data.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                  />
                </>
              )}

              <Button
                type="button"
                style={{
                  background: isChangingPassword ? "#d36b6b" : "#58df92ff",
                }}
                onClick={() => setIsChangingPassword(!isChangingPassword)}
              >
                {isChangingPassword
                  ? "Cancel Password Change"
                  : "Change Password"}
              </Button>

              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: "#7c6f63" }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          </RightPanel>
        </Card>
      </div>
    </Container>
  );
};

export default UserProfile;
  



