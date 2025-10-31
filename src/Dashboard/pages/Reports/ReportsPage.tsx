import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Button,
    Spinner,
    Table,
    Row,
    Col,
    Pagination,
    Form,
} from "react-bootstrap";
import toast from "react-hot-toast";
import styled from "styled-components";
import * as XLSX from 'xlsx';

// ----------------------
// Interfaces & Constants
// ----------------------

interface ProductDetails {
    id: string;
    name: string;
    price: number;
    category: string; 
    stock: number;
    imageUrl: string;
}

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    category?: string;
}

interface Order {
    id: string;
    userId: string;
    userName: string;
    date: string;
    total: number;
    status: "pending" | "completed" | "canceled" | string;
    items: OrderItem[];
}

interface IncomeSummary {
    'MONTH-YEAR': string;
    'TOTAL INCOME ($)': number;
}

interface ProductSalesSummary {
    'PRODUCT NAME': string;
    'TOTAL QUANTITY SOLD': number;
    'TOTAL REVENUE ($)': number;
}

interface CategorySalesSummary {
    'PRODUCT CATEGORY': string;
    'TOTAL QUANTITY SOLD': number;
    'TOTAL REVENUE ($)': number;
}

interface StockSummary {
    'PRODUCT NAME': string;
    'INITIAL STOCK': number;
    'TOTAL SOLD': number;
    'CURRENT STOCK': number;
}

interface StatusSummary {
    'ORDER STATUS': string;
    'TOTAL ORDERS': number;
    'TOTAL REVENUE ($)': number;
}

// 💡 NEW INTERFACE for User Status Report (using actual user count from API)
interface UserSummary {
    'USER TYPE': string;
    'COUNT': number;
}

// Interface for User data fetched from the separate API
interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}


const ORDERS_API = "https://68f278b4b36f9750deecbed2.mockapi.io/data/api/orders";
const PRODUCTS_API = 'https://68f278b4b36f9750deecbed2.mockapi.io/data/api/products';
// 💡 NEW API CONSTANT from Users.tsx
const USERS_API = "https://68e8fa40f2707e6128cd055c.mockapi.io/user";


// ----------------------
// Styled Components
// ----------------------

const Card = styled.div`
    background: #f9f8f6;
    border-radius: 14px;
    box-shadow: 0 8px 40px #e8e5df33;
    padding: 32px 22px 32px 22px;
    max-width: 1240px;
    margin: 0 auto;
`;

const PageTitle = styled.h2`
    font-family: "Montserrat", serif;
    font-weight: 700;
    color: #826d58;
    letter-spacing: 0.01em;
    font-size: 2.15rem;
`;

const ReportButton = styled(Button)<{ $variantColor: string }>`
    background: ${(props) => props.$variantColor};
    border: none;
    font-weight: 600;
    padding: 0.65em 1.5em;
    border-radius: 9px;
    font-size: 1em;
    transition: background 0.2s;
    &:hover {
        background: darken(${(props) => props.$variantColor}, 10%);
    }
`;

// ----------------------
// Helper Functions (Filtering & Calculation)
// ----------------------

/**
 * دالة التصفية الرئيسية: تستخدم في تقارير المبيعات/الفئات لتطبيق فلترة التاريخ الدقيقة.
 */
const filterOrders = (orders: Order[], startDateStr: string, endDateStr: string, status: string = "completed"): Order[] => {
    
    return orders.filter(order => {
        if (typeof order.total !== 'number' || order.total <= 0) return false;
        
        const orderDate = new Date(order.date);
        
        // 1. فلترة التاريخ
        const start = startDateStr ? new Date(startDateStr) : new Date(0);
        const end = endDateStr ? new Date(endDateStr) : new Date(8640000000000000);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const dateMatch = orderDate >= start && orderDate <= end;
        
        // 2. فلترة الحالة
        const statusLower = order.status ? order.status.toLowerCase() : '';
        const statusFilterLower = status ? status.toLowerCase() : 'completed';

        const statusMatch = statusFilterLower === 'completed' && statusLower === 'completed';

        return dateMatch && statusMatch;
    }).filter(order => {
        // تقارير المبيعات لا تهتم إلا بالطلبات المكتملة دائماً
        return order.status && order.status.toLowerCase() === 'completed';
    });
};


/**
 * تقرير الدخل الشهري: يجمع الإيرادات لكل شهر بغض النظر عن التاريخ، ثم يقص النتائج حسب الأشهر المحددة.
 */
const calculateMonthlyIncome = (orders: Order[], startDateStr: string, endDateStr: string, status: string): IncomeSummary[] => {
    // 1. تجميع الإيرادات من جميع الطلبات المكتملة
    const completedOrders = orders.filter(order => 
        order.status && order.status.toLowerCase() === 'completed' && typeof order.total === 'number' && order.total > 0
    );
    
    const monthlyIncomeMap: { [key: string]: number } = {};
    
    completedOrders.forEach(order => {
        const date = new Date(order.date);
        const monthYearKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        monthlyIncomeMap[monthYearKey] = (monthlyIncomeMap[monthYearKey] || 0) + order.total;
    });

    let finalData: IncomeSummary[] = [];
    
    // 2. تحديد نطاق الأشهر للعرض (حسب فلاتر التاريخ)
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    if (startDateStr) {
        minDate = new Date(startDateStr);
    } else if (completedOrders.length > 0) {
        minDate = new Date(Math.min(...completedOrders.map(o => new Date(o.date).getTime())));
    }

    if (endDateStr) {
        maxDate = new Date(endDateStr);
    } else if (completedOrders.length > 0) {
        maxDate = new Date(Math.max(...completedOrders.map(o => new Date(o.date).getTime())));
    }

    // 3. ملء جميع الأشهر بين minDate و maxDate
    if (minDate && maxDate) {
        let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1); 
        const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1); 

        while (currentDate.getTime() <= endMonth.getTime()) {
            const monthYearKey = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;
            
            finalData.push({
                'MONTH-YEAR': monthYearKey,
                'TOTAL INCOME ($)': parseFloat((monthlyIncomeMap[monthYearKey] || 0).toFixed(2)),
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    } else {
        finalData = Object.keys(monthlyIncomeMap)
            .map(key => ({
                'MONTH-YEAR': key,
                'TOTAL INCOME ($)': parseFloat(monthlyIncomeMap[key].toFixed(2)),
            }));
    }

    // 4. فرز البيانات حسب التسلسل الزمني
    return finalData
        .sort((a, b) => new Date(`1 ${a['MONTH-YEAR']}`).getTime() - new Date(`1 ${b['MONTH-YEAR']}`).getTime());
}


const calculateProductSales = (orders: Order[], startDateStr: string, endDateStr: string, status: string): ProductSalesSummary[] => {
    // نمرر الحالة 'completed' بشكل صريح لضمان التصفية الصحيحة للمبيعات
const filteredOrders = !startDateStr && !endDateStr
    ? orders.filter(o => o.status?.toLowerCase() === "completed")
    : filterOrders(orders, startDateStr, endDateStr, "completed");
    const productSalesMap: { [key: string]: { quantity: number; revenue: number } } = {};

    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            const productName = item.name;
            const quantity = item.quantity || 0;
            const price = item.price || 0;

            if (!productSalesMap[productName]) {
                productSalesMap[productName] = { quantity: 0, revenue: 0 };
            }

            productSalesMap[productName].quantity += quantity;
            productSalesMap[productName].revenue += quantity * price;
        });
    });

    return Object.keys(productSalesMap)
        .map(key => ({
            'PRODUCT NAME': key,
            'TOTAL QUANTITY SOLD': productSalesMap[key].quantity,
            'TOTAL REVENUE ($)': parseFloat(productSalesMap[key].revenue.toFixed(2)),
        }))
        .sort((a, b) => b['TOTAL REVENUE ($)'] - a['TOTAL REVENUE ($)']);
};


const calculateCategorySales = (orders: Order[], startDateStr: string, endDateStr: string, status: string): CategorySalesSummary[] => {
    const filteredOrders = !startDateStr && !endDateStr
        ? orders.filter(o => o.status?.toLowerCase() === "completed")
        : filterOrders(orders, startDateStr, endDateStr, "completed");

    const categorySalesMap: { [key: string]: { quantity: number; revenue: number } } = {};

    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            // 🧩 تجاهل أي منتج بدون category
            if (!item.category || item.category.trim() === "") return;

            const categoryName = item.category;
            const quantity = item.quantity || 0;
            const price = item.price || 0;

            if (!categorySalesMap[categoryName]) {
                categorySalesMap[categoryName] = { quantity: 0, revenue: 0 };
            }

            categorySalesMap[categoryName].quantity += quantity;
            categorySalesMap[categoryName].revenue += quantity * price;
        });
    });

    return Object.keys(categorySalesMap)
        .map(key => ({
            'PRODUCT CATEGORY': key,
            'TOTAL QUANTITY SOLD': categorySalesMap[key].quantity,
            'TOTAL REVENUE ($)': parseFloat(categorySalesMap[key].revenue.toFixed(2)),
        }))
        .sort((a, b) => b['TOTAL REVENUE ($)'] - a['TOTAL REVENUE ($)']);
};


/**
 * دالة حساب المخزون الحالي (تم تعديلها لتعرض فقط المنتجات الموجودة في API المنتجات)
 */
const calculateCurrentStock = (products: ProductDetails[], orders: Order[]): StockSummary[] => {
    const productStockMap: Record<string, { initialStock: number, totalSold: number }> = {};

    // 1. تجميع المخزون الأولي - فقط المنتجات الموجودة حاليًا في API المنتجات
    products.forEach(p => {
        if (p.name) {
            productStockMap[p.name] = { initialStock: p.stock || 0, totalSold: 0 };
        }
    });

    // 2. حساب إجمالي المباع من الطلبات المكتملة
    orders.filter(o => o.status?.toLowerCase() === 'completed')
        .forEach(order => {
            order.items.forEach(item => {
                const productName = item.name;
                const quantity = item.quantity || 0;

                // 💡 التعديل هنا: نجمع إجمالي المباع فقط للمنتجات
                // التي تم إضافتها بالفعل إلى الخريطة في الخطوة 1 (المنتجات النشطة).
                if (productStockMap[productName]) { 
                    productStockMap[productName].totalSold += quantity;
                }
            });
        });

    // 3. إنشاء تقرير المخزون الحالي
    return Object.keys(productStockMap)
        .map(name => {
            const stats = productStockMap[name];
            return {
                'PRODUCT NAME': name,
                'INITIAL STOCK': stats.initialStock,
                'TOTAL SOLD': stats.totalSold,
                'CURRENT STOCK': stats.initialStock - stats.totalSold,
            };
        })
       .sort((a, b) => {
    const indexA = products.findIndex(p => p.name === a['PRODUCT NAME']);
    const indexB = products.findIndex(p => p.name === b['PRODUCT NAME']);
    return indexA - indexB;
});

};

/**
 * دالة حساب إجمالي الإيرادات حسب حالة الطلب (Order Status)
 */
const calculateStatusRevenue = (orders: Order[], startDateStr: string, endDateStr: string): StatusSummary[] => {
    // 1. تصفية الطلبات حسب نطاق التاريخ
    
    // 💡 Logging للتأكيد على القيم (يمكنك إزالتها لاحقًا)
    console.log(`STATUS REPORT FILTER: Start=${startDateStr || 'ALL'}, End=${endDateStr || 'ALL'}`);

    const ordersInPeriod = orders.filter(order => {
        if (typeof order.total !== 'number' || order.total <= 0) return false;
        
        const orderDate = new Date(order.date);
        
        // إذا كان فارغاً، يعرض كل شيء
        const start = startDateStr ? new Date(startDateStr) : new Date(0);
        const end = endDateStr ? new Date(endDateStr) : new Date(8640000000000000);
        
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return orderDate >= start && orderDate <= end;
    });

    const statusMap: Record<string, { count: number; revenue: number }> = {};
    
    // 2. تجميع الإيرادات والأعداد لكل حالة
    ordersInPeriod.forEach(order => {
        const statusKey = (order.status || 'Unknown').toUpperCase();
        const total = order.total || 0;

        if (!statusMap[statusKey]) {
            statusMap[statusKey] = { count: 0, revenue: 0 };
        }

        statusMap[statusKey].count += 1;
        statusMap[statusKey].revenue += total;
    });

    // 3. تحويل للخارج والفرز حسب الإيرادات
    return Object.keys(statusMap)
        .map(key => ({
            'ORDER STATUS': key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(), // تنسيق الحالة
            'TOTAL ORDERS': statusMap[key].count,
            'TOTAL REVENUE ($)': parseFloat(statusMap[key].revenue.toFixed(2)),
        }))
        .sort((a, b) => b['TOTAL REVENUE ($)'] - a['TOTAL REVENUE ($)']);
}

// 🔁 Updated - Calculate actual Active vs Inactive users based on orders
const calculateUserStatus = (users: User[], orders: Order[]): UserSummary[] => {
    if (!users || users.length === 0) return [];

    // نجيب IDs للمستخدمين اللي عملوا أوردر واحد على الأقل
    const usersWithOrders = new Set(orders.map(order => order.userId));

    const activeCount = users.filter(u => usersWithOrders.has(u.id)).length;
    const inactiveCount = users.length - activeCount;

    return [
        { 'USER TYPE': 'Active Users', 'COUNT': activeCount },
        { 'USER TYPE': 'Inactive Users', 'COUNT': inactiveCount },
    ];
};



// ----------------------
// Main Component
// ----------------------

const ReportsPage: React.FC = () => {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [allProducts, setAllProducts] = useState<ProductDetails[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]); // 💡 NEW State for Users
    const [loading, setLoading] = useState(true);

    // متغيرات لتخزين قيم حقول الإدخال المؤقتة
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");

    // متغيرات لتخزين قيم الفلاتر المطبقة فعلياً
    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");


    const [currentPageIncome, setCurrentPageIncome] = useState(1);
    const [currentPageProducts, setCurrentPageProducts] = useState(1);
    const [currentPageCategories, setCurrentPageCategories] = useState(1);
    const [currentPageStock, setCurrentPageStock] = useState(1);
    const [currentPageStatus, setCurrentPageStatus] = useState(1); 
    const [currentPageUsers, setCurrentPageUsers] = useState(1); // 💡 NEW Page State
    const [currentPageUserOrders, setCurrentPageUserOrders] = useState(1);

    const itemsPerPage = 5;

    async function fetchProductMap(): Promise<{ map: Record<string, string>, products: ProductDetails[] }> {
        console.log("🟡 Attempting to fetch products from:", PRODUCTS_API);
        try {
            const { data } = await axios.get(PRODUCTS_API);
            if (Array.isArray(data)) {
                console.log(`🟢 Successfully fetched ${data.length} products.`);
                
                const products: ProductDetails[] = data as ProductDetails[];
                const map: Record<string, string> = {};
                
                products.forEach(p => {
                    if (p.name && p.category) {
                        map[p.name] = p.category;
                    }
                });
                
                return { map, products };
            }
            console.error("🔴 Product API response is not an array:", data);
            return { map: {}, products: [] };
        } catch (err) {
            console.error("❌ Failed to fetch product map! API URL or network error.", err);
            toast.error("Failed to fetch product list! Reports may be inaccurate.");
            return { map: {}, products: [] };
        }
    }

    // 💡 NEW - Function to fetch users data
    async function fetchUsersData() {
        console.log("🟡 Attempting to fetch users from:", USERS_API);
        try {
            const { data } = await axios.get(USERS_API);
            if (Array.isArray(data)) {
                setAllUsers(data as User[]);
                console.log(`🟢 Successfully fetched ${data.length} users.`);
            } else {
                 console.error("🔴 Users API response is not an array:", data);
            }
        } catch (err) {
            toast.error("Failed to fetch users data for reports!");
            setAllUsers([]);
        }
    }

    async function fetchOrders() {
        setLoading(true);
        // Fetch products and users in parallel for efficiency
        const [{ map: productCategoryMap, products: fetchedProducts }] = await Promise.all([
             fetchProductMap(),
             fetchUsersData() // 💡 Fetch users data here
        ]);
        setAllProducts(fetchedProducts); 
        
        try {
            console.log("🟡 Attempting to fetch orders from:", ORDERS_API);
            const { data } = await axios.get(ORDERS_API);

            if (Array.isArray(data)) {
                console.log(`🟢 Successfully fetched ${data.length} orders.`);
                
                const processedOrders: Order[] = (data as Order[]).map(order => ({
    ...order,
    items: order.items
        .map((item): OrderItem | null => {
            const categoryName = productCategoryMap[item.name];
            
            // 🧩 لو المنتج مالوش category نحذفه
            if (!categoryName || categoryName.trim() === "") return null;

            return {
                ...item,
                category: categoryName
            };
        })
        // 🧹 نحذف العناصر اللي رجعت null
        .filter((item): item is OrderItem => item !== null)
}));

                setAllOrders(processedOrders);
            } else {
                 console.error("🔴 Orders API response is not an array:", data);
                 throw new Error("API response is not an array.");
            }

        } catch (err) {
            toast.error("Failed to fetch all orders data for reports! (API Error)");
            setAllOrders([]);
        } finally {
            setLoading(false);
        }
    }
useEffect(() => {
    const refreshReports = async () => {
        await fetchOrders();
        setAppliedStartDate("");
        setAppliedEndDate("");
    };

    refreshReports();

    // إعادة التحديث كل دقيقة مثلاً لضمان مزامنة المخزن مع الـ API
    const interval = setInterval(refreshReports, 60000);
    return () => clearInterval(interval);
}, []);



    // حساب التقارير: تعتمد على المتغيرات المطبقة فقط
    const monthlyIncomeData = useMemo(() => {
        return calculateMonthlyIncome(allOrders, appliedStartDate, appliedEndDate, "All");
    }, [allOrders, appliedStartDate, appliedEndDate]);
const productSalesData = useMemo(() => {
    // لو المستخدم لسه ما اختارش فلاتر
    if (!appliedStartDate && !appliedEndDate) {
        // نجيب كل الطلبات المكتملة بدون فلترة تاريخ
        return calculateProductSales(allOrders, "", "", "completed");
    }
    // وإلا نفلتر بالتاريخ المحدد
    return calculateProductSales(allOrders, appliedStartDate, appliedEndDate, "completed");
}, [allOrders, appliedStartDate, appliedEndDate]);

// ✅ Category Sales Report: نفس المنطق
const categorySalesData = useMemo(() => {
    if (!appliedStartDate && !appliedEndDate) {
        return calculateCategorySales(allOrders, "", "", "completed");
    }
    return calculateCategorySales(allOrders, appliedStartDate, appliedEndDate, "completed");
}, [allOrders, appliedStartDate, appliedEndDate]);
    const currentStockData = useMemo(() => {
        return calculateCurrentStock(allProducts, allOrders);
    }, [allProducts, allOrders]);
    
   const statusRevenueData = useMemo(() => {
    if (!appliedStartDate && !appliedEndDate) {
        return calculateStatusRevenue(allOrders, "", "");
    }
    return calculateStatusRevenue(allOrders, appliedStartDate, appliedEndDate);
}, [allOrders, appliedStartDate, appliedEndDate]);

   // 💡 NEW - Calculate User Status Data
 const userStatusData = useMemo(() => {
    return calculateUserStatus(allUsers, allOrders);
}, [allUsers, allOrders]);



    // دوال التعامل مع الفلاتر

    const handleApplyFilters = () => {
        setAppliedStartDate(tempStartDate);
        setAppliedEndDate(tempEndDate);

        setCurrentPageIncome(1);
        setCurrentPageProducts(1);
        setCurrentPageCategories(1);
        setCurrentPageStatus(1);
        // لا نحتاج لتصفير صفحة المستخدمين لأنها لا تتبع فلتر التاريخ
        console.log(`\n🎉 APPLYING FILTERS: From=${tempStartDate}, To=${tempEndDate}\n`);
    };

    const handleResetFilters = () => {
        setTempStartDate("");
        setTempEndDate("");

        setAppliedStartDate("");
        setAppliedEndDate("");

        setCurrentPageIncome(1);
        setCurrentPageProducts(1);
        setCurrentPageCategories(1);
        setCurrentPageStock(1);
        setCurrentPageStatus(1);
        setCurrentPageUsers(1); // 💡 Reset users page
        console.log("\n🔄 RESETTING FILTERS. Displaying ALL data.\n");
    };

    // منطق التصفح (Pagination Logic)

    const totalPagesIncome = Math.ceil(monthlyIncomeData.length / itemsPerPage);
    const paginatedIncomeData = monthlyIncomeData.slice(
        (currentPageIncome - 1) * itemsPerPage,
        currentPageIncome * itemsPerPage
    );

    const totalPagesProducts = Math.ceil(productSalesData.length / itemsPerPage);
    const paginatedProductData = productSalesData.slice(
        (currentPageProducts - 1) * itemsPerPage,
        currentPageProducts * itemsPerPage
    );

    const totalPagesCategories = Math.ceil(categorySalesData.length / itemsPerPage);
    const paginatedCategoryData = categorySalesData.slice(
        (currentPageCategories - 1) * itemsPerPage,
        currentPageCategories * itemsPerPage
    );
    
    const totalPagesStock = Math.ceil(currentStockData.length / itemsPerPage);
    const paginatedStockData = currentStockData.slice(
        (currentPageStock - 1) * itemsPerPage,
        currentPageStock * itemsPerPage
    );
    
    const totalPagesStatus = Math.ceil(statusRevenueData.length / itemsPerPage);
    const paginatedStatusData = statusRevenueData.slice(
        (currentPageStatus - 1) * itemsPerPage,
        currentPageStatus * itemsPerPage
    );

    // 💡 NEW - Pagination Logic for User Status Report
    const totalPagesUsers = Math.ceil(userStatusData.length / itemsPerPage);
    const paginatedUserData = userStatusData.slice(
        (currentPageUsers - 1) * itemsPerPage,
        currentPageUsers * itemsPerPage
    );


    // دوال التصدير والطباعة
    const handleExportCSV = () => {

        if (monthlyIncomeData.length === 0 && productSalesData.length === 0 && categorySalesData.length === 0 && currentStockData.length === 0 && statusRevenueData.length === 0 && userStatusData.length === 0) {
            toast.error("No data to export!");
            return;
        }

        const wb = XLSX.utils.book_new();

        if (monthlyIncomeData.length > 0) {
            const wsIncome = XLSX.utils.json_to_sheet(monthlyIncomeData);
            XLSX.utils.book_append_sheet(wb, wsIncome, "Monthly Income");
        }

        if (productSalesData.length > 0) {
            const wsProducts = XLSX.utils.json_to_sheet(productSalesData);
            XLSX.utils.book_append_sheet(wb, wsProducts, "Product Sales");
        }

        if (categorySalesData.length > 0) {
            const wsCategory = XLSX.utils.json_to_sheet(categorySalesData);
            XLSX.utils.book_append_sheet(wb, wsCategory, "Category Sales");
        }
        
        if (currentStockData.length > 0) {
            const wsStock = XLSX.utils.json_to_sheet(currentStockData);
            XLSX.utils.book_append_sheet(wb, wsStock, "Current Stock");
        }
        
        if (statusRevenueData.length > 0) {
            const wsStatus = XLSX.utils.json_to_sheet(statusRevenueData);
            XLSX.utils.book_append_sheet(wb, wsStatus, "Order Status Revenue");
        }
        
        // 💡 NEW - Export User Status Report
        if (userStatusData.length > 0) {
            const wsUsers = XLSX.utils.json_to_sheet(userStatusData);
            XLSX.utils.book_append_sheet(wb, wsUsers, "User Status");
        }


        XLSX.writeFile(wb, "Combined_Business_Report.xlsx");
        toast.success("Excel File Downloaded!");
    };

    const buildReportHTML = (title: string, data: any[], type: 'income' | 'products' | 'category' | 'stock' | 'status' | 'users'): string => {
        if (data.length === 0) {
            return `<div style="margin-bottom: 30px;"><h3 style="color: #9d8764; font-weight: bold; margin-top: 20px; text-align: center;">${title}</h3><p style="text-align: center;">No data found based on the filters.</p></div>`;
        }

        let tableHeaders = '';
        let tableRows = '';
        const baseStyle = "font-weight: 600; color: #998068; border: 1px solid #ddd; padding: 8px; text-align: center;";

        if (type === 'income') {
            tableHeaders = `
                <th style="background: #a8c0d9; color: #fff; border: 1px solid #99aabf; padding: 10px;">MONTH-YEAR</th>
                <th style="background: #88b0a2; color: #fff; border: 1px solid #7a9c8f; padding: 10px;">TOTAL INCOME ($)</th>
            `;
            tableRows = data.map((d: IncomeSummary) => `
                <tr>
                    <td style="${baseStyle}">${d['MONTH-YEAR']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">$${d['TOTAL INCOME ($)'].toFixed(2)}</td>
                </tr>
            `).join('');
        } else if (type === 'products') {
            tableHeaders = `
                <th style="background: #6c89a9; color: #fff; border: 1px solid #5a7590; padding: 10px; text-align: left;">PRODUCT NAME</th>
                <th style="background: #5a8a65; color: #fff; border: 1px solid #4a7555; padding: 10px;">TOTAL QUANTITY SOLD</th>
                <th style="background: #88b0a2; color: #fff; border: 1px solid #7a9c8f; padding: 10px;">TOTAL REVENUE ($)</th>
            `;
            tableRows = data.map((d: ProductSalesSummary) => `
                <tr>
                    <td style="${baseStyle.replace('text-align: center', 'text-align: left')}">${d['PRODUCT NAME']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['TOTAL QUANTITY SOLD']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">$${d['TOTAL REVENUE ($)'].toFixed(2)}</td>
                </tr>
            `).join('');
        } else if (type === 'category') { 
            tableHeaders = `
                <th style="background: #a96c6c; color: #fff; border: 1px solid #905a5a; padding: 10px; text-align: left;">PRODUCT CATEGORY</th>
                <th style="background: #5a8a65; color: #fff; border: 1px solid #4a7555; padding: 10px;">TOTAL QUANTITY SOLD</th>
                <th style="background: #88b0a2; color: #fff; border: 1px solid #7a9c8f; padding: 10px;">TOTAL REVENUE ($)</th>
            `;
            tableRows = data.map((d: CategorySalesSummary) => `
                <tr>
                    <td style="${baseStyle.replace('text-align: center', 'text-align: left')}">${d['PRODUCT CATEGORY']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['TOTAL QUANTITY SOLD']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">$${d['TOTAL REVENUE ($)'].toFixed(2)}</td>
                </tr>
            `).join('');
        } else if (type === 'stock') {
             tableHeaders = `
                <th style="background: #3e5f8a; color: #fff; border: 1px solid #335073; padding: 10px; text-align: left;">PRODUCT NAME</th>
                <th style="background: #5e84af; color: #fff; border: 1px solid #476a91; padding: 10px;">INITIAL STOCK</th>
                <th style="background: #a96c6c; color: #fff; border: 1px solid #905a5a; padding: 10px;">TOTAL SOLD</th>
                <th style="background: #5a8a65; color: #fff; border: 1px solid #4a7555; padding: 10px;">CURRENT STOCK</th>
            `;
            tableRows = data.map((d: StockSummary) => `
                <tr>
                    <td style="${baseStyle.replace('text-align: center', 'text-align: left')}">${d['PRODUCT NAME']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['INITIAL STOCK']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['TOTAL SOLD']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['CURRENT STOCK']}</td>
                </tr>
            `).join('');
        } else if (type === 'status') {
             tableHeaders = `
                <th style="background: #7c6f63; color: #fff; border: 1px solid #6b5c4f; padding: 10px;">ORDER STATUS</th>
                <th style="background: #a39173; color: #fff; border: 1px solid #8d7e5b; padding: 10px;">TOTAL ORDERS</th>
                <th style="background: #88b0a2; color: #fff; border: 1px solid #7a9c8f; padding: 10px;">TOTAL REVENUE ($)</th>
            `;
            tableRows = data.map((d: StatusSummary) => `
                <tr>
                    <td style="${baseStyle.replace('text-align: center', 'text-align: left')}">${d['ORDER STATUS']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['TOTAL ORDERS']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">$${d['TOTAL REVENUE ($)'].toFixed(2)}</td>
                </tr>
            `).join('');
        } else if (type === 'users') { // 💡 NEW - User Status Report HTML
             tableHeaders = `
                <th style="background: #7c6f63; color: #fff; border: 1px solid #6b5c4f; padding: 10px;">USER TYPE</th>
                <th style="background: #a39173; color: #fff; border: 1px solid #8d7e5b; padding: 10px;">COUNT</th>
            `;
            tableRows = data.map((d: UserSummary) => `
                <tr>
                    <td style="${baseStyle.replace('text-align: center', 'text-align: left')}">${d['USER TYPE']}</td>
                    <td style="${baseStyle.replace('color: #998068', 'color: #987549')}">${d['COUNT']}</td>
                </tr>
            `).join('');
        }
        
        return `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
                <h3 style="color: #9d8764; font-weight: bold; margin-top: 20px; text-align: center;">${title}</h3>
                <table border="1" style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #ebdfd1;">
                        <tr>${tableHeaders}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    };

    const handlePrint = () => {

        if (monthlyIncomeData.length === 0 && productSalesData.length === 0 && categorySalesData.length === 0 && currentStockData.length === 0 && statusRevenueData.length === 0 && userStatusData.length === 0) {
            toast.error("No data to print for any report!");
            return;
        }

        const incomeHtml = buildReportHTML("💰 Monthly Income Report", monthlyIncomeData, 'income');
        const productsHtml = buildReportHTML("📦 Product Sales Report", productSalesData, 'products');
        const categoriesHtml = buildReportHTML("🏷️ Products by Category Report", categorySalesData, 'category');
        const stockHtml = buildReportHTML("📦 Current Product Stock Report", currentStockData, 'stock');
        const statusHtml = buildReportHTML("📊 Order Status Revenue Report", statusRevenueData, 'status'); 
        const usersHtml = buildReportHTML("👤 Active vs Inactive Users Report", userStatusData, 'users'); // 💡 NEW - User Status HTML

        const printWindow = window.open('', '', 'height=600,width=800');

        printWindow?.document.write('<html><head><title>Combined Business Report</title>');
        printWindow?.document.write('<style>');
        printWindow?.document.write('body{font-family: Arial, sans-serif; padding: 20px;}');
        printWindow?.document.write('h2 { color: #826d58; text-align: center;}');
        printWindow?.document.write('table{page-break-inside: auto; margin-top: 15px; font-size: 14px;}');
        printWindow?.document.write('tr { page-break-inside: avoid; page-break-after: auto; }');
        printWindow?.document.write('thead { display: table-header-group; }');
        printWindow?.document.write('th, td{border: 1px solid #ddd; padding: 10px;}');
        printWindow?.document.write('@page { size: auto; margin: 20mm; }');
        printWindow?.document.write('</style>');
        printWindow?.document.write('</head><body>');

        printWindow?.document.write(`<h2>Admin Business Reports (Combined)</h2>`);

        printWindow?.document.write(incomeHtml);
        printWindow?.document.write(productsHtml);
        printWindow?.document.write(categoriesHtml);
        printWindow?.document.write(stockHtml);
        printWindow?.document.write(statusHtml);
        printWindow?.document.write(usersHtml); // 💡 NEW - Include User Status Report in Print

        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
    };


    return (
        <div
            style={{ background: "#f6f3ee", minHeight: "100vh", padding: "40px 0" }}
        >
            <Card>
                <Row className="mb-4 align-items-center">
                    <Col md={12}>
                        <PageTitle className="text-center">
                            📑 Admin Business Reports
                        </PageTitle>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <div className="d-flex gap-2 justify-content-end mb-4">
                    <ReportButton $variantColor="#9d8764" onClick={handleExportCSV}>
                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export Excel
                    </ReportButton>
                    <ReportButton $variantColor="#7c6f63" onClick={handlePrint}>
                        <i className="bi bi-printer me-2"></i>Print Combined Reports
                    </ReportButton>
                </div>

                {/* Filters Area */}
                <Row className="mb-4 align-items-end">
                    <Col md={3} className="mb-3">
                        <Form.Label>From:</Form.Label>
                        <Form.Control
                            type="date"
                            value={tempStartDate}
                            onChange={(e) => setTempStartDate(e.target.value)}
                        />
                    </Col>
                    <Col md={3} className="mb-3">
                        <Form.Label>To:</Form.Label>
                        <Form.Control
                            type="date"
                            value={tempEndDate}
                            onChange={(e) => setTempEndDate(e.target.value)}
                        />
                    </Col>
                    <Col md={3} className="mb-3">
                        {/* هذا العمود فارغ الآن، ولكن يمكن استخدامه لمرشح إضافي في المستقبل */}
                    </Col>
                    <Col md={3} className="mb-3 d-flex gap-2">
                        <Button variant="info" onClick={handleApplyFilters} className="w-100">
                            Apply Filters
                        </Button>
                        <Button variant="outline-secondary" onClick={handleResetFilters} className="w-100">
                            Reset
                        </Button>
                    </Col>
                </Row>

                <hr />

                {/* Dynamic Report Content - عرض التقارير تحت بعضها البعض مع التصفح */}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: "#9d8764" }} />
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>

                        {/* 💡 5. Active vs Inactive Users Report Table */}
                        <>
                          {/* 👥 Users Orders Report */}
<>
{/* 👥 Users Orders Report */}
<>
  <h3 className="mt-4 mb-3" style={{ color: "#9d8764", fontWeight: "bold" }}>
    👥 Users Orders
  </h3>

  <Table
    bordered
    hover
    responsive
    style={{
      background: "#fff9f3",
      borderRadius: "16px",
      fontSize: "1.04em",
    }}
  >
    <thead style={{ background: "#ebdfd1" }}>
      <tr>
        <th style={{ background: "#7c6f63", color: "#fff" }}>Order ID</th>
        <th style={{ background: "#a39173", color: "#fff" }}>User</th>
        <th style={{ background: "#88b0a2", color: "#fff" }}>Date</th>
        <th style={{ background: "#6c89a9", color: "#fff" }}>Items</th>
        <th style={{ background: "#5a8a65", color: "#fff" }}>Total ($)</th>
        <th style={{ background: "#a96c6c", color: "#fff" }}>Status</th>
      </tr>
    </thead>

    <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
      {(() => {
        // ⚙️ فلترة حسب التاريخ
        let filtered = allOrders;
        if (appliedStartDate || appliedEndDate) {
          filtered = allOrders.filter((order) => {
            const date = new Date(order.date);
            const start = appliedStartDate
              ? new Date(appliedStartDate)
              : new Date(0);
            const end = appliedEndDate
              ? new Date(appliedEndDate)
              : new Date(8640000000000000);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return date >= start && date <= end;
          });
        }

        // 🧮 Pagination logic
        const itemsPerPage = 5;
        const totalPagesUserOrders = Math.ceil(filtered.length / itemsPerPage);
        const paginatedOrders = filtered.slice(
          (currentPageUserOrders - 1) * itemsPerPage,
          currentPageUserOrders * itemsPerPage
        );

        if (filtered.length === 0) {
          return (
            <tr>
              <td colSpan={6} className="text-center">
                No orders found for the selected date range.
              </td>
            </tr>
          );
        }

        return paginatedOrders.map((order) => (
          <tr key={order.id}>
            <td style={{ fontWeight: 600, color: "#998068" }}>{order.id}</td>
            <td style={{ fontWeight: 600, color: "#987549" }}>
              {order.userName}
            </td>
            <td style={{ fontWeight: 600, color: "#987549" }}>
              {new Date(order.date).toLocaleDateString()}{" "}
              {new Date(order.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
            <td style={{ textAlign: "left" }}>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  {item.name.split(" ").slice(0, 2).join(" ")} × {item.quantity}
                </div>
              ))}
            </td>
            <td style={{ fontWeight: 600, color: "#987549" }}>
              ${order.total.toFixed(2)}
            </td>
            <td>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  color: "#fff",
                  backgroundColor:
                    order.status === "completed"
                      ? "#4a7555"
                      : order.status === "pending"
                      ? "#ccae62"
                      : "#c65b5b",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {order.status}
              </span>
            </td>
          </tr>
        ));
      })()}
    </tbody>
  </Table>

  {/* 🔁 Pagination for Users Orders */}
  {(() => {
    let filtered = allOrders;
    if (appliedStartDate || appliedEndDate) {
      filtered = allOrders.filter((order) => {
        const date = new Date(order.date);
        const start = appliedStartDate
          ? new Date(appliedStartDate)
          : new Date(0);
        const end = appliedEndDate
          ? new Date(appliedEndDate)
          : new Date(8640000000000000);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      });
    }

    const itemsPerPage = 5;
    const totalPagesUserOrders = Math.ceil(filtered.length / itemsPerPage);

    if (totalPagesUserOrders <= 1) return null;

    return (
      <Pagination className="justify-content-center mt-4" size="sm">
        <Pagination.Prev
          onClick={() =>
            setCurrentPageUserOrders((prev) => Math.max(prev - 1, 1))
          }
          disabled={currentPageUserOrders === 1}
        />
        {Array.from({ length: totalPagesUserOrders }, (_, i) => (
          <Pagination.Item
            key={`orders-${i + 1}`}
            active={i + 1 === currentPageUserOrders}
            onClick={() => setCurrentPageUserOrders(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCurrentPageUserOrders((prev) =>
              Math.min(prev + 1, totalPagesUserOrders)
            )
          }
          disabled={
            currentPageUserOrders === totalPagesUserOrders ||
            totalPagesUserOrders === 0
          }
        />
      </Pagination>
    );
  })()}
</>

</>

                            {/* Pagination for User Status Report */}
                            {userStatusData.length > 0 && totalPagesUsers > 1 && (
                                <Pagination
                                    className="justify-content-center mt-4"
                                    style={{ userSelect: "none" }}
                                    size="sm"
                                >
                                    <Pagination.Prev
                                        onClick={() => setCurrentPageUsers((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPageUsers === 1}
                                    />
                                    {Array.from({ length: totalPagesUsers }, (_, i) => (
                                        <Pagination.Item
                                            key={`users-${i + 1}`}
                                            active={i + 1 === currentPageUsers}
                                            onClick={() => setCurrentPageUsers(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPageUsers((prev) => Math.min(prev + 1, totalPagesUsers))}
                                        disabled={currentPageUsers === totalPagesUsers || totalPagesUsers === 0}
                                    />
                                </Pagination>
                            )}
                        </>

                        <hr className="my-5" />
                        
                        {/* 1. Monthly Income Report Table */}
                        <>
                            <h3 className="mt-4 mb-3" style={{ color: "#9d8764", fontWeight: 'bold' }}>
                                💰 Monthly Income Report
                            </h3>
                            <Table
                                bordered
                                hover
                                responsive
                                style={{ background: "#fff9f3", borderRadius: "16px", fontSize: "1.04em" }}
                            >
                                <thead style={{ background: "#ebdfd1" }}>
                                    <tr>
                                        <th style={{ background: "#a8c0d9", color: "#fff", border: '1px solid #99aabf' }}>MONTH-YEAR</th>
                                        <th style={{ background: "#88b0a2", color: "#fff", border: '1px solid #7a9c8f' }}>TOTAL INCOME ($)</th>
                                    </tr>
                                </thead>
                                <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
                                    {paginatedIncomeData.length > 0 ? (
                                        paginatedIncomeData.map((data, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600, color: "#998068" }}>
                                                    {data['MONTH-YEAR']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    ${data['TOTAL INCOME ($)'].toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-center">
                                                No income data found based on the filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {/* Pagination for Income Report */}
                            {monthlyIncomeData.length > 0 && totalPagesIncome > 1 && (
                                <Pagination
                                    className="justify-content-center mt-4"
                                    style={{ userSelect: "none" }}
                                    size="sm"
                                >
                                    <Pagination.Prev
                                        onClick={() => setCurrentPageIncome((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPageIncome === 1}
                                    />
                                    {Array.from({ length: totalPagesIncome }, (_, i) => (
                                        <Pagination.Item
                                            key={`income-${i + 1}`}
                                            active={i + 1 === currentPageIncome}
                                            onClick={() => setCurrentPageIncome(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPageIncome((prev) => Math.min(prev + 1, totalPagesIncome))}
                                        disabled={currentPageIncome === totalPagesIncome || totalPagesIncome === 0}
                                    />
                                </Pagination>
                            )}
                        </>

                        <hr className="my-5" />
                        
                    


                        {/* 2. Product Sales Report Table */}
                        <>
                            <h3 className="mt-4 mb-3" style={{ color: "#9d8764", fontWeight: 'bold' }}>
                                📦 Product Sales Report
                            </h3>
                            <Table
                                bordered
                                hover
                                responsive
                                style={{ background: "#fff9f3", borderRadius: "16px", fontSize: "1.04em" }}
                            >
                                <thead style={{ background: "#ebdfd1" }}>
                                    <tr>
                                        <th style={{ background: "#6c89a9", color: "#fff", border: '1px solid #5a7590' }}>PRODUCT NAME</th>
                                        <th style={{ background: "#5a8a65", color: "#fff", border: '1px solid #4a7555' }}>TOTAL QUANTITY SOLD</th>
                                        <th style={{ background: "#88b0a2", color: "#fff", border: '1px solid #7a9c8f' }}>TOTAL REVENUE ($)</th>
                                    </tr>
                                </thead>
                                <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
                                    {paginatedProductData.length > 0 ? (
                                        paginatedProductData.map((data, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600, color: "#998068", textAlign: 'left' }}>
                                                    {data['PRODUCT NAME']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    {data['TOTAL QUANTITY SOLD']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    ${data['TOTAL REVENUE ($)'].toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                No product sales data found based on the filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {/* Pagination for Product Report */}
                            {productSalesData.length > 0 && totalPagesProducts > 1 && (
                                <Pagination
                                    className="justify-content-center mt-4"
                                    style={{ userSelect: "none" }}
                                    size="sm"
                                >
                                    <Pagination.Prev
                                        onClick={() => setCurrentPageProducts((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPageProducts === 1}
                                    />
                                    {Array.from({ length: totalPagesProducts }, (_, i) => (
                                        <Pagination.Item
                                            key={`products-${i + 1}`}
                                            active={i + 1 === currentPageProducts}
                                            onClick={() => setCurrentPageProducts(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPageProducts((prev) => Math.min(prev + 1, totalPagesProducts))}
                                        disabled={currentPageProducts === totalPagesProducts || totalPagesProducts === 0}
                                    />
                                </Pagination>
                            )}
                        </>

                        <hr className="my-5" />

                        {/* 3. Products by Category Report Table */}
                        <>
                            <h3 className="mt-4 mb-3" style={{ color: "#9d8764", fontWeight: 'bold' }}>
                                🏷️ Products by Category Report
                            </h3>
                            <Table
                                bordered
                                hover
                                responsive
                                style={{ background: "#fff9f3", borderRadius: "16px", fontSize: "1.04em" }}
                            >
                                <thead style={{ background: "#ebdfd1" }}>
                                    <tr>
                                        <th style={{ background: "#a96c6c", color: "#fff", border: '1px solid #905a5a' }}>PRODUCT CATEGORY</th>
                                        <th style={{ background: "#5a8a65", color: "#fff", border: '1px solid #4a7555' }}>TOTAL QUANTITY SOLD</th>
                                        <th style={{ background: "#88b0a2", color: "#fff", border: '1px solid #7a9c8f' }}>TOTAL REVENUE ($)</th>
                                    </tr>
                                </thead>
                                <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
                                    {paginatedCategoryData.length > 0 ? (
                                        paginatedCategoryData.map((data, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600, color: "#998068", textAlign: 'left' }}>
                                                    {data['PRODUCT CATEGORY']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    {data['TOTAL QUANTITY SOLD']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    ${data['TOTAL REVENUE ($)'].toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center">
                                                No category sales data found based on the filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {/* Pagination for Category Report */}
                            {categorySalesData.length > 0 && totalPagesCategories > 1 && (
                                <Pagination
                                    className="justify-content-center mt-4"
                                    style={{ userSelect: "none" }}
                                    size="sm"
                                >
                                    <Pagination.Prev
                                        onClick={() => setCurrentPageCategories((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPageCategories === 1}
                                    />
                                    {Array.from({ length: totalPagesCategories }, (_, i) => (
                                        <Pagination.Item
                                            key={`categories-${i + 1}`}
                                            active={i + 1 === currentPageCategories}
                                            onClick={() => setCurrentPageCategories(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPageCategories((prev) => Math.min(prev + 1, totalPagesCategories))}
                                        disabled={currentPageCategories === totalPagesCategories || totalPagesCategories === 0}
                                    />
                                </Pagination>
                            )}
                        </>
                                 {/* 👥 Active vs Inactive Users */}
<h3 className="mt-5 mb-3" style={{ color: "#9d8764", fontWeight: "bold" }}>
  👥 Active vs Inactive Users
</h3>

<Table
  bordered
  hover
  responsive
  style={{
    background: "#fff9f3",
    borderRadius: "16px",
    fontSize: "1.04em",
  }}
>
  <thead style={{ background: "#ebdfd1" }}>
    <tr>
      <th style={{ background: "#7c6f63", color: "#fff" }}>User Type</th>
      <th style={{ background: "#a39173", color: "#fff" }}>Count</th>
    </tr>
  </thead>
  <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
    {userStatusData.map((row, index) => (
      <tr key={index}>
        <td style={{ fontWeight: 600, color: "#998068" }}>
          {row["USER TYPE"]}
        </td>
        <td style={{ fontWeight: 600, color: "#987549" }}>{row["COUNT"]}</td>
      </tr>
    ))}
  </tbody>
</Table>

                        <hr className="my-5" />

                        {/* 4. Current Product Stock Report Table */}
                        <>
                            <h3 className="mt-4 mb-3" style={{ color: "#9d8764", fontWeight: 'bold' }}>
                                📦 Current Product Stock Report
                            </h3>
                            <Table
                                bordered
                                hover
                                responsive
                                style={{ background: "#fff9f3", borderRadius: "16px", fontSize: "1.04em" }}
                            >
                                <thead style={{ background: "#ebdfd1" }}>
                                    <tr>
                                        <th style={{ background: "#3e5f8a", color: "#fff", border: '1px solid #335073' }}>PRODUCT NAME</th>
                                        <th style={{ background: "#5e84af", color: "#fff", border: '1px solid #476a91' }}>INITIAL STOCK</th>
                                        <th style={{ background: "#a96c6c", color: "#fff", border: '1px solid #905a5a' }}>TOTAL SOLD</th>
                                        <th style={{ background: "#5a8a65", color: "#fff", border: '1px solid #4a7555' }}>CURRENT STOCK</th>
                                    </tr>
                                </thead>
                                <tbody style={{ verticalAlign: "middle", textAlign: "center" }}>
                                    {paginatedStockData.length > 0 ? (
                                        paginatedStockData.map((data, index) => (
                                            <tr key={index} style={{ backgroundColor: data['CURRENT STOCK'] <= 0 ? '#ffeded' : 'inherit' }}>
                                                <td style={{ fontWeight: 600, color: "#998068", textAlign: 'left' }}>
                                                    {data['PRODUCT NAME']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    {data['INITIAL STOCK']}
                                                </td>
                                                <td style={{ fontWeight: 600, color: "#987549" }}>
                                                    {data['TOTAL SOLD']}
                                                </td>
                                                <td style={{ fontWeight: 700, color: data['CURRENT STOCK'] <= 0 ? '#cc0000' : '#4a7555' }}>
                                                    {data['CURRENT STOCK']}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="text-center">
                                                No product stock data found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            {/* Pagination for Stock Report */}
                            {currentStockData.length > 0 && totalPagesStock > 1 && (
                                <Pagination
                                    className="justify-content-center mt-4"
                                    style={{ userSelect: "none" }}
                                    size="sm"
                                >
                                    <Pagination.Prev
                                        onClick={() => setCurrentPageStock((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPageStock === 1}
                                    />
                                    {Array.from({ length: totalPagesStock }, (_, i) => (
                                        <Pagination.Item
                                            key={`stock-${i + 1}`}
                                            active={i + 1 === currentPageStock}
                                            onClick={() => setCurrentPageStock(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}
                                    <Pagination.Next
                                        onClick={() => setCurrentPageStock((prev) => Math.min(prev + 1, totalPagesStock))}
                                        disabled={currentPageStock === totalPagesStock || totalPagesStock === 0}
                                    />
                                </Pagination>
                            )}
                        </>

                    </div>
                )}
            </Card>
        </div>
    );
};

export default ReportsPage;