import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import '../assets/css/AdminDashboard.css';
import logo from '../assets/images/logo.png';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState({
        summary: {
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 0,
            totalProducts: 0
        },
        salesByCategory: [],
        salesByDate: [],
        topProducts: [],
        salesByPaymentMethod: []
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'year'
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAnalyticsData();
    }, [dateRange]);

    const getDateRangeParams = () => {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
        }
        
        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0]
        };
    };

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = getDateRangeParams();
            
            // Fetch orders with date filtering
            const ordersResponse = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/orders?startDate=${startDate}&endDate=${endDate}`,
                //`http://localhost:8080/api/orders?startDate=${startDate}&endDate=${endDate}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Fetch products data
            const productsResponse = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/products`,
                //`http://localhost:8080/api/products`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Fetch users data
            const usersResponse = await axios.get(
                 `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/users`,
                //`http://localhost:8080/api/users`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Fetch categories data
            const categoriesResponse = await axios.get(
                `https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/categories`,
                //`http://localhost:8080/api/categories`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Orders data:", ordersResponse.data);
            console.log("Products data:", productsResponse.data);
            console.log("Users data:", usersResponse.data);
            console.log("Categories data:", categoriesResponse.data);
            
            // Process data for dashboard
            const orders = ordersResponse.data;
            const products = productsResponse.data;
            const users = usersResponse.data;
            const categories = categoriesResponse.data;
            
            // Generate analytics data
            const processedData = processData(orders, products, users, categories);
            setAnalyticsData(processedData);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setError('Failed to fetch analytics data. Please try again later.');
            
            // Only generate mock data if explicitly enabled for development
            const useMockData = true; // Set to false in production
            if (useMockData) {
                console.log('Falling back to mock data');
                generateMockData();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockData = () => {
        // Mock summary data
        const summary = {
            totalOrders: 120,
            totalRevenue: 85000,
            totalUsers: 45,
            totalProducts: 32
        };

        // Mock sales by category
        const salesByCategory = [
            { name: 'Basketball', sales: 42000 },
            { name: 'Running', sales: 28500 },
            { name: 'Casual', sales: 14500 }
        ];

        // Mock sales by date (last 30 days)
        const salesByDate = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
                date: date.toISOString().split('T')[0],
                sales: Math.floor(Math.random() * 5000) + 1000
            };
        });

        // Mock top products
        const topProducts = [
            { name: 'Air Jordan 1', sales: 28, revenue: 12600 },
            { name: 'Nike Revolution', sales: 24, revenue: 8400 },
            { name: 'Adidas Ultraboost', sales: 21, revenue: 9450 },
            { name: 'Puma Suede', sales: 19, revenue: 5700 },
            { name: 'New Balance 574', sales: 15, revenue: 6750 }
        ];

        // Mock sales by payment method
        const salesByPaymentMethod = [
            { method: 'Credit Card', amount: 50000 },
            { method: 'Cash on Delivery', amount: 25000 },
            { method: 'GCash', amount: 10000 }
        ];

        setAnalyticsData({
            summary,
            salesByCategory,
            salesByDate,
            topProducts,
            salesByPaymentMethod
        });
    };

    // Process raw data into analytics format
    const processData = (orders, products, users, categories) => {
        // Filter orders based on date range
        const filteredOrders = filterOrdersByDateRange(orders);

        // Calculate summary data
        const totalOrders = filteredOrders.length;
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalUsers = users.length;
        const totalProducts = products.length;

        // Calculate sales by category
        const salesByCategory = calculateSalesByCategory(filteredOrders, products, categories);
        
        // Calculate sales by date
        const salesByDate = calculateSalesByDate(filteredOrders);
        
        // Calculate top products
        const topProducts = calculateTopProducts(filteredOrders);
        
        // Calculate sales by payment method
        const salesByPaymentMethod = calculateSalesByPaymentMethod(filteredOrders);
        
        return {
            summary: {
                totalOrders,
                totalRevenue,
                totalUsers,
                totalProducts
            },
            salesByCategory,
            salesByDate,
            topProducts,
            salesByPaymentMethod
        };
    };

    // Filter orders based on date range selection
    const filterOrdersByDateRange = (orders) => {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (dateRange) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                cutoffDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        return orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= cutoffDate;
        });
    };

    // Calculate sales by category
    const calculateSalesByCategory = (orders, products, categories) => {
        const categorySales = {};
        
        // Initialize categories with 0 sales
        categories.forEach(category => {
            categorySales[category.id] = {
                name: category.name,
                sales: 0
            };
        });
        
        // Sum up sales by category
        orders.forEach(order => {
            if (!order.items) return;
            
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return;
                
                const categoryId = product.categoryId;
                if (categorySales[categoryId]) {
                    // Convert price from cents to currency units
                    const priceInDollars = (item.price || 0) / 100;
                    categorySales[categoryId].sales += (priceInDollars * (item.quantity || 1));
                }
            });
        });
        
        // Convert to array and sort by sales amount
        return Object.values(categorySales)
            .sort((a, b) => b.sales - a.sales);
    };

    // Calculate sales by date
    const calculateSalesByDate = (orders) => {
        const salesByDate = {};
        
        // Group sales by date
        orders.forEach(order => {
            const date = new Date(order.orderDate).toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += order.totalAmount || 0;
        });
        
        // Convert to array and sort by date
        return Object.entries(salesByDate)
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Calculate top products
    const calculateTopProducts = (orders) => {
        const productSales = {};
        
        // Count product sales and revenue
        orders.forEach(order => {
            if (!order.items) return;
            
            order.items.forEach(item => {
                const productId = item.productId;
                const productName = item.productName;
                const quantity = item.quantity || 1;
                const revenue = (item.price * quantity) || 0;
                
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: productName,
                        sales: 0,
                        revenue: 0
                    };
                }
                
                productSales[productId].sales += quantity;
                productSales[productId].revenue += revenue;
            });
        });
        
        // Convert to array, sort by sales count, and take top 5
        return Object.values(productSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);
    };

    // Calculate sales by payment method
    const calculateSalesByPaymentMethod = (orders) => {
        const paymentMethodSales = {};
        
        // Sum up sales by payment method
        orders.forEach(order => {
            const method = order.paymentMethod || 'Unknown';
            if (!paymentMethodSales[method]) {
                paymentMethodSales[method] = 0;
            }
            // Convert totalAmount from cents to currency units if needed
            const totalInDollars = order.totalAmount ? order.totalAmount / 100 : 0;
            paymentMethodSales[method] += totalInDollars;
        });
        
        // Convert to array
        return Object.entries(paymentMethodSales)
            .map(([method, amount]) => ({ method, amount }))
            .sort((a, b) => b.amount - a.amount);
    };

    // Chart data for sales by category
    const salesByCategoryData = {
        labels: analyticsData.salesByCategory.map(item => item.name),
        datasets: [
            {
                label: 'Sales Amount (₱)',
                data: analyticsData.salesByCategory.map(item => item.sales),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    // Chart data for sales by date
    const salesByDateData = {
        labels: analyticsData.salesByDate.map(item => item.date),
        datasets: [
            {
                label: 'Daily Sales (₱)',
                data: analyticsData.salesByDate.map(item => item.sales),
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }
        ]
    };

    // Chart data for top products
    const topProductsData = {
        labels: analyticsData.topProducts.map(item => item.name),
        datasets: [
            {
                label: 'Units Sold',
                data: analyticsData.topProducts.map(item => item.sales),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    // Chart data for payment methods
    const paymentMethodData = {
        labels: analyticsData.salesByPaymentMethod.map(item => item.method),
        datasets: [
            {
                data: analyticsData.salesByPaymentMethod.map(item => item.amount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '₱' + context.parsed.y.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ₱${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('https://gleaming-ofelia-sapatosan-b16af7a5.koyeb.app/api/auth/logout', {}, {
               // await axios.post('http://localhost:8080/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token');
            window.location.href = '/';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const formatCurrency = (value) => {
        return '₱' + value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="header">
                <div className="logo-container">
                    <Link to="/">
                        <img src={logo} alt="Sapatosan Logo" className="logo" />
                    </Link>
                </div>
                <h1 className="admin-title">ADMIN DASHBOARD</h1>
                <div className="auth-buttons">
                    <button onClick={handleLogout} className="auth-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-container">
                {/* Sidebar Navigation */}
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <Link to="/admin/users" className="sidebar-link">
                            <i className="fas fa-users"></i>
                            <span>Users</span>
                        </Link>
                        <Link to="/admin/categories" className="sidebar-link">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </Link>
                        <Link to="/admin/products" className="sidebar-link">
                            <i className="fas fa-shoe-prints"></i>
                            <span>Products</span>
                        </Link>
                        <Link to="/admin/orders" className="sidebar-link">
                            <i className="fas fa-shopping-cart"></i>
                            <span>Orders</span>
                        </Link>
                        <Link to="/admin/analytics" className="sidebar-link active">
                            <i className="fas fa-chart-bar"></i>
                            <span>Analytics</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content analytics-content">
                    <div className="page-header">
                        <h2>Analytics Dashboard</h2>
                        <div className="date-range-selector">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="search-input"
                            >
                                <option value="week">Last 7 days</option>
                                <option value="month">Last 30 days</option>
                                <option value="year">Last 365 days</option>
                            </select>
                            <button className="refresh-button" onClick={fetchAnalyticsData}>
                                <i className="fas fa-sync-alt"></i> Refresh
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="loading-spinner">Loading analytics data...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="summary-icon orders">
                                        <i className="fas fa-shopping-bag"></i>
                                    </div>
                                    <div className="summary-details">
                                        <h3>Total Orders</h3>
                                        <p>{analyticsData.summary.totalOrders}</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon revenue">
                                        <i className="fas fa-money-bill-wave"></i>
                                    </div>
                                    <div className="summary-details">
                                        <h3>Total Revenue</h3>
                                        <p>{formatCurrency(analyticsData.summary.totalRevenue)}</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon users">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="summary-details">
                                        <h3>Total Users</h3>
                                        <p>{analyticsData.summary.totalUsers}</p>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon products">
                                        <i className="fas fa-shoe-prints"></i>
                                    </div>
                                    <div className="summary-details">
                                        <h3>Total Products</h3>
                                        <p>{analyticsData.summary.totalProducts}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="charts-container">
                                {/* Sales Over Time Chart */}
                                <div className="chart-card large">
                                    <h3>Sales Trend</h3>
                                    <div className="chart-area">
                                        <Line data={salesByDateData} options={chartOptions} />
                                    </div>
                                </div>

                                {/* Category Sales Chart */}
                                <div className="chart-card medium">
                                    <h3>Sales by Category</h3>
                                    <div className="chart-area">
                                        <Bar data={salesByCategoryData} options={chartOptions} />
                                    </div>
                                </div>

                                {/* Payment Methods Chart */}
                                <div className="chart-card medium">
                                    <h3>Payment Methods</h3>
                                    <div className="chart-area">
                                        <Pie data={paymentMethodData} options={pieChartOptions} />
                                    </div>
                                </div>

                                {/* Top Products Chart */}
                                <div className="chart-card medium">
                                    <h3>Top Selling Products</h3>
                                    <div className="chart-area">
                                        <Bar data={topProductsData} options={chartOptions} />
                                    </div>
                                </div>

                                {/* Top Products Table */}
                                <div className="chart-card medium">
                                    <h3>Top Products Performance</h3>
                                    <div className="table-container analytics-table">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Units Sold</th>
                                                    <th>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyticsData.topProducts.map((product, index) => (
                                                    <tr key={index}>
                                                        <td>{product.name}</td>
                                                        <td>{product.sales}</td>
                                                        <td>{formatCurrency(product.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-bottom">
                    <p>&copy; 2025 Sapatosan. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default AdminAnalytics;