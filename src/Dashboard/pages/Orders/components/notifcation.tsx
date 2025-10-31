import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../../Redux/Store";
import { fetchOrdersAsync, Order } from "../../../../Redux/OrderSlice";
import "../orders.css";

const NotificationBell = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders } = useSelector((state: RootState) => state.orders);

  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const lastSeenOrdersRef = useRef<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("lastSeenOrders");
    if (saved) {
      lastSeenOrdersRef.current = JSON.parse(saved);
    }
    dispatch(fetchOrdersAsync());
  }, [dispatch]);

  useEffect(() => {
    const newOrders = orders.filter(
      (o) => !lastSeenOrdersRef.current.includes(o.id)
    );
    if (newOrders.length > 0) {
      setHasNewOrder(true);
    }
  }, [orders]);

  const handleBellClick = () => {
    setShowDropdown((prev) => !prev);
    lastSeenOrdersRef.current = orders.map((o) => o.id);
    setHasNewOrder(false);
    localStorage.setItem(
      "lastSeenOrders",
      JSON.stringify(lastSeenOrdersRef.current)
    );
  };

  const lastFiveOrders = orders
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="notification-bell" style={{ position: "relative" }}>
      <button className="bell-button" onClick={handleBellClick}>
        <i className="bi bi-bell-fill" style={{color:"#483B32"}}></i>
        {hasNewOrder && <span className="badge-dot"></span>}
      </button>

      <div className={`orders-list ${showDropdown ? "show" : ""}`}>
        <ul>
          {lastFiveOrders.length === 0 && <li>No Orders</li>}
          {lastFiveOrders.map((order: Order) => {
            const isNew = !lastSeenOrdersRef.current.includes(order.id);
            return (
              <li
                key={order.id}
                style={{
                  fontWeight: isNew ? "700" : "400", 
                  backgroundColor: isNew ? "#f0f0f0" : "transparent",
                  padding: "6px 8px",
                  borderRadius: "4px",
                  marginBottom: "4px",
                }}
              >
                <strong>{order.userName}</strong> added new order with total $
                {order.total} <br />
                <small>{new Date(order.date).toLocaleString()}</small>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default NotificationBell;
