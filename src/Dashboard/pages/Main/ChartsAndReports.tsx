import React, { useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';

import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, 
  Bar,      
} from 'recharts';

// تم استيراد المكون من ملفه الجديد
import StatisticCard from './StatisticCard'; 

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
}

interface OrderItem { 
  id: string | number; 
  name: string;
  quantity: number;
  price: number;
}

interface Order {
    id: string;
    userId: string;
    userName: string;
    items: OrderItem[]; 
    total: number;
    date: string;
    status: string;
}



const getDefaultDashboardData = () => ({
  productViews: [5000, 8000, 7500, 9000, 11000, 6500],
});

const fetchLocalStorageData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 10));

  const defaultData = getDefaultDashboardData();
  
  return defaultData;
};

const fetchUsersDataFromAPI = async () => {
  const API_URL = 'https://68e8fa40f2707e6128cd055c.mockapi.io/user';
  try {
    const response = await axios.get(API_URL);
    const users: User[] = Array.isArray(response.data) ? response.data : [];

    return {
      totalUsers: users.length,
    };
  } catch (error) {
    console.error('Failed to fetch users data:', error);
    return {
      totalUsers: 0, 
    };
  }
};

const fetchProductsDataFromAPI = async () => {
  const API_URL = 'https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products';
  try {
    const response = await axios.get(API_URL);
    const products: Product[] = Array.isArray(response.data) ? response.data : [];

    const categoryCounts: Record<string, number> = {};
    const productCategoryMap: Record<string, string> = {}; 

    products.forEach((product: any) => {
      const category = product.category;
      
      if (category && product.name) {
         categoryCounts[category] = (categoryCounts[category] || 0) + 1;
         productCategoryMap[product.name] = category; 
      }
    });

    return {
      totalProductsFromAPI: products.length,
      categoryCounts,
      productCategoryMap, 
    };
  } catch (error) {
    console.error('Failed to fetch products data:', error);
    return {
      totalProductsFromAPI: 0,
      categoryCounts: {}, 
      productCategoryMap: {},
    };
  }
};

const fetchOrdersDataFromAPI = async () => {
    const BASE_API_URL = 'https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders';
    const allOrders: Order[] = [];
    let page = 1;
    const limit = 10; 
    let totalRevenue = 0;
    const dailySalesMap: Record<string, number> = {}; 
    const productSales: Record<string, { sales: number; revenue: number }> = {}; 

    try {
        while (true) {
            const url = `${BASE_API_URL}?page=${page}&limit=${limit}`;
            const response = await axios.get(url);
            const currentPageOrders: Order[] = Array.isArray(response.data) ? response.data : [];

            if (currentPageOrders.length === 0) {
                break;
            }

            currentPageOrders.forEach(order => {
                if (typeof order.total === 'number') {
                    totalRevenue += order.total;
                    
                    try {
                        const date = new Date(order.date);
                        const dayKey = date.toISOString().split('T')[0]; 
                        dailySalesMap[dayKey] = (dailySalesMap[dayKey] || 0) + order.total;
                    } catch (e) {
                    }
                }

                if (Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const name = item.name || `Product ID: ${item.id}`;
                        const quantity = item.quantity || 0;
                        const price = item.price || 0;

                        if (!productSales[name]) {
                            productSales[name] = { sales: 0, revenue: 0 };
                        }

                        productSales[name].sales += quantity;
                        productSales[name].revenue += quantity * price;
                    });
                }
            });

            allOrders.push(...currentPageOrders);
            
            if (currentPageOrders.length < limit) {
                break;
            }
            
            page++;
        }

        const orders = allOrders;
        
        const dailySalesData = Object.entries(dailySalesMap)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) 
            .map(([dateKey, total]) => {
                const dateParts = dateKey.split('-'); 
                const formattedLabel = `${dateParts[1]}/${dateParts[2]}`; 

                return {
                    name: formattedLabel, 
                    'Daily Sales ($)': total 
                };
            });

        const topProductsArray = Object.entries(productSales)
            .map(([name, stats]) => ({
                name,
                sales: stats.sales,
                revenue: stats.revenue, 
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
            const status = (order.status || 'Unknown').toLowerCase();
            const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
            acc[formattedStatus] = (acc[formattedStatus] || 0) + 1;
            return acc;
        }, {});

        const recentOrders = orders
            .slice(-5) 
            .map((order: Order) => ({
                ID: order.id,
                CustomerName: order.userName || 'N/A', 
                Total: order.total,
                Status: (order.status || 'Unknown').charAt(0).toUpperCase() + (order.status || 'Unknown').slice(1).toLowerCase(),
            }));

        return {
            totalOrdersFromAPI: orders.length,
            statusCounts,
            recentOrders,
            totalRevenue, 
            monthlySalesData: dailySalesData, 
            productSalesMap: productSales, 
            topProducts: topProductsArray, 
        };
    } catch (error) {
        console.error('Failed to fetch all orders data:', error);
        return {
            totalOrdersFromAPI: 0,
            statusCounts: { Delivered: 0, Pending: 0, Cancelled: 0 },
            recentOrders: [],
            totalRevenue: 0, 
            monthlySalesData: [], 
            productSalesMap: {},
            topProducts: [], 
        };
    }
};

const DashboardContainer = styled.div`
  padding: 20px 30px 30px; 
  background-color: #f4f7f9;
  min-height: calc(100vh - 80px);
`;

const LoadingOverlay = styled.div`
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #007bff;
  flex-direction: column;
`;

const PlaceholderHeader = styled.div`
  display: none; 
`;


const ChartCard = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
`;

const TableContainer = styled(Card)`
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  min-height: 400px;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background-color: ${(props) => {
    const statusLower = props.status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'delivered':
      case 'تم التوصيل':
        return '#28a745';
      case 'shipped':
      case 'pending':
      case 'تم الشحن':
        return '#ffc107';
      case 'canceled':
      case 'processing':
      case 'قيد المعالجة':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }};
`;


// تم حذف: interface StatCardProps والمكون StatisticCard


interface OrderReportProps {
  statusCounts: { [key: string]: number };
  total: number;
}

const OrdersReportTable: React.FC<OrderReportProps> = ({ statusCounts, total }) => {
  const sortedStatuses = Object.keys(statusCounts).sort((a, b) => statusCounts[b] - statusCounts[a]);

  return (
    <ChartCard>
      <Card.Body>
        <h5 className="text-secondary mb-3">Order Status Details</h5>
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {sortedStatuses.map((status) => (
              <tr key={status}>
                <td>{status}</td>
                <td>{statusCounts[status].toLocaleString()}</td>
                <td>{((statusCounts[status] / total) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="table-secondary">
              <td>
                <strong>TOTAL</strong>
              </td>
              <td>
                <strong>{total.toLocaleString()}</strong>
              </td>
              <td>
                <strong>100%</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </Card.Body>
    </ChartCard>
  );
};

interface RecentOrder {
  ID: string;
  CustomerName: string;
  Total: number;
  Status: string;
}

// ===============================================
// مكون المخطط البياني للطلبات الحديثة (Bar Chart)
// ===============================================

const RecentOrdersBarChart: React.FC<{ orders: RecentOrder[] }> = ({ orders }) => {
  // تحويل بيانات الطلبات الحديثة
  const chartData = orders.map(order => ({
    // نستخدم اسم العميل وآخر 4 أرقام من الـ ID لتمييز كل شريط
    name: `${order.CustomerName} (ID: ${order.ID.substring(order.ID.length - 4)})`, 
    total: order.Total,
    status: order.Status,
  }));

  return (
    <ChartCard>
      <Card.Body>
        <h5 className="text-secondary mb-3">Recent Orders - Total Value ($)</h5>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                layout="vertical" // عرض الأشرطة بشكل عمودي (أفقيًا)
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tickFormatter={(value: number) => `$${value.toFixed(0)}`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Total Value']}
                />
                <Legend />
                <Bar
                  dataKey="total"
                  fill="#007bff"
                  name="Order Total ($)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            ) : (
              <p className="text-center text-muted mt-5">No recent orders data available for the chart.</p>
            )}
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </ChartCard>
  );
};


interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

const TopProductsTable: React.FC<{ products: TopProduct[] }> = ({ products }) => (
  <TableContainer>
    <Card.Body>
      <Card.Title className="text-secondary mb-3">Top 5 Selling Products</Card.Title>
      <table className="table table-sm table-borderless">
        <thead>
          <tr>
            <th style={{ color: '#7c6f63' }}>#</th>
            <th style={{ color: '#7c6f63' }}>Product Name</th>
            <th className="text-end" style={{ color: '#7c6f63' }}>
              Sales Count
            </th>
            <th className="text-end" style={{ color: '#7c6f63' }}>
              Price ($) 
            </th>
            <th className="text-end" style={{ color: '#7c6f63' }}>
              Total ($) 
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const unitPrice = product.sales > 0 ? product.revenue / product.sales : 0;
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td className="text-end">{product.sales.toLocaleString()}</td>
                <td className="text-end">{unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td> 
                <td className="text-end">{product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products.length === 0 && <p className="text-center text-muted mt-4">No top product data available.</p>}
    </Card.Body>
  </TableContainer>
);

interface CategoryRevenueData {
    name: string; 
    revenue: number; 
}

const TopCategoryRevenueBarChart: React.FC<{ data: CategoryRevenueData[] }> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

    return (
        <ChartCard>
            <Card.Body>
              <h5 className="text-secondary mb-3">Top Category Revenue (Aggregated from Orders)</h5>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {sortedData.length > 0 ? (
                    <BarChart
                      data={sortedData}
                      margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}K`} />
                      <Tooltip 
                          formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Revenue']} 
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue" 
                        fill="#8884d8" 
                        radius={[5, 5, 0, 0]} 
                      />
                    </BarChart>
                  ) : (
                    <p className="text-center text-muted mt-5">No category revenue data available.</p>
                  )}
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </ChartCard>
    );
};


const ChartsAndReports: React.FC = () => {
  const [showOrdersReport, setShowOrdersReport] = useState(false);

  const toggleOrdersReport = () => {
    setShowOrdersReport((prev) => !prev);
  };

  const { data: userData, isLoading: isLocalLoading, isError: isLocalError } = useQuery({
    queryKey: ['localDashboardStats'],
    queryFn: fetchLocalStorageData,
    staleTime: Infinity,
  });

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useQuery({
    queryKey: ['usersData'],
    queryFn: fetchUsersDataFromAPI,
    staleTime: 60000,
  });

  const { data: ordersData, isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['ordersData'],
    queryFn: fetchOrdersDataFromAPI,
    staleTime: 60000,
  });

  const { data: productsData, isLoading: isProductsLoading, isError: isProductsError } = useQuery({
    queryKey: ['productsData'],
    queryFn: fetchProductsDataFromAPI,
    staleTime: 60000,
  });

  const isLoading = isLocalLoading || isOrdersLoading || isProductsLoading || isUsersLoading;
  const isError = isLocalLoading || isOrdersError || isProductsError || isUsersError || !userData || !ordersData || !productsData || !usersData;

  if (isLoading) {
    return (
      <DashboardContainer>
          <LoadingOverlay>
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-secondary">Loading dashboard data...</p>
          </LoadingOverlay>
      </DashboardContainer>
    ); 
  }
  
  if (isError) {
    return (
        <DashboardContainer>
            <LoadingOverlay>
                <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3 text-danger">Error loading dashboard data. Please check data sources.</p>
            </LoadingOverlay>
        </DashboardContainer>
    );
  }
  
  const totalRevenue = ordersData!.totalRevenue; 
  
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000'];

  const productCategoryMap = productsData!.productCategoryMap || {};
  const productSalesMap = ordersData!.productSalesMap || {};
  
  const categoryRevenueAggregated: Record<string, number> = {};

  Object.keys(productSalesMap).forEach(productName => {
    const categoryName = productCategoryMap[productName]; 
    const revenue = productSalesMap[productName].revenue || 0;
    
    if (categoryName) {
      categoryRevenueAggregated[categoryName] = (categoryRevenueAggregated[categoryName] || 0) + revenue;
    }
  });

  const categoryRevenueData = Object.entries(categoryRevenueAggregated).map(([name, revenue]) => ({
    name,
    revenue,
  }));

  const rechartsPieData = Object.keys(productsData!.categoryCounts).map((category: string) => ({
    name: category,
    value: productsData!.categoryCounts[category], 
  }));


  return (
    <DashboardContainer>
      <Helmet>
        <title>Dashboard | Charts & Reports</title>
      </Helmet>

      <PlaceholderHeader /> 

      <Row className="mb-4">
        <Col md={6} lg={3}>
          <StatisticCard 
            title="Total Users" 
            value={usersData!.totalUsers.toLocaleString()} 
            icon="bi-person-fill" 
            color="#007bff" 
          />
        </Col>

        <Col md={6} lg={3}>
      <StatisticCard
  title="Total Orders (API)"
  value={ordersData!.totalOrdersFromAPI.toLocaleString()}
  icon="bi-box-seam"
  color="#4CAF50"
/>

        </Col>

        <Col md={6} lg={3}>
          <StatisticCard 
            title="Products" 
            value={productsData!.totalProductsFromAPI.toLocaleString()} 
            icon="bi-tags-fill" 
            color="#ffc107" 
          />
        </Col>

        <Col md={6} lg={3}>
          <StatisticCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            icon="bi-wallet-fill"
            color="#dc3545"
          />
        </Col>
      </Row>

      {showOrdersReport && (
        <Row className="mb-4">
          <Col xs={12}>
            <OrdersReportTable statusCounts={ordersData!.statusCounts} total={ordersData!.totalOrdersFromAPI} />
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col lg={6}>
          <TopCategoryRevenueBarChart data={categoryRevenueData} />
        </Col>

        <Col lg={6}>
          <ChartCard>
            <Card.Body>
              <h5 className="text-secondary mb-3">Product Category Distribution</h5>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rechartsPieData}
                      dataKey="value" 
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}        
                      outerRadius={140}
                      cornerRadius={10}        
                      paddingAngle={3}        
                      fill="#8884d8"
                      labelLine={false}
                    >
                      {
                        rechartsPieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </ChartCard>
        </Col>
      </Row>

      <Row className="mb-5">
        {/* ======================================= */}
        {/* استبدال الجدول بالمخطط البياني للأوامر الحديثة */}
        {/* ======================================= */}
        <Col lg={6}>
          <RecentOrdersBarChart orders={ordersData!.recentOrders} />
        </Col>
        <Col lg={6}>
          <ChartCard>
            <Card.Body>
              <h5 className="text-secondary mb-3">Orders Distribution by Status</h5>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(ordersData!.statusCounts).map(([status, count]) => ({
                        name: status,
                        value: count,
                      }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      label
                    >
                      {Object.keys(ordersData!.statusCounts).map((status, index) => (
                        <Cell key={`cell-${index}`} fill={['#4CAF50', '#FFC107', '#DC3545', '#007BFF'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} Orders`, 'Count']} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </ChartCard>
        </Col>


      </Row>
      
      {/* إضافة جدول المنتجات الأكثر مبيعًا في صف جديد لجعله أكثر بروزاً */}
      <Row className="mb-4">
        <Col xs={12}>
          <TopProductsTable products={ordersData!.topProducts} />
        </Col>
      </Row>

    </DashboardContainer>
  );
};

export default ChartsAndReports;