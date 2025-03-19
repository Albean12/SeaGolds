import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import {
    FaBars,
    FaBell,
    FaTimes,
    FaUsers,
    FaClipboardList,
    FaBuilding,
    FaCalendarCheck,
    FaMoneyBillWave,
    FaTools,
    FaCamera,
    FaCommentDots,
    FaEllipsisV,
} from "react-icons/fa";

const AdminDashboard = () => {
    const [admin, setAdmin] = useState({ name: "", email: "", profilePicture: "" });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    // Fetch Admin Profile
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/user`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const user = await response.json();
                setAdmin({
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profile_picture
                        ? `profile/${user.profile_picture}`
                        : "profile/default-profile.png",
                });
            } catch (error) {
                console.error("Error fetching admin data:", error);
            }
        };
        fetchAdminData();
    }, []);

    // Fetch Notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await response.json();
                setNotifications(data || []);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotifications();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            setNotifications((prev) => prev.map((n) => ({ ...n, showMenu: false })));
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

    // Logout Function
    const handleLogout = (e) => {
        e.stopPropagation();
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className={styles.adminDashboard}>
     {/* Sidebar */}
<aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ""}`}>
    
{/* Sidebar Header */}
<div className={styles.sidebarHeader}>
    <img src="/SEAGOLD_LOGO.svg" alt="Logo" className={styles.sidebarLogo} />
    {!isSidebarCollapsed && <span className={styles.sidebarTitle}>Seagold Dormitory</span>}
</div>
{/* Line Separator */}
<div className={styles.sidebarDivider}></div>
{/* Sidebar Menu */}
<nav>
    <ul>
        <li><Link to="pending-applications"><FaClipboardList /> <span>Pending Applications</span></Link></li>
        <li><Link to="unit-management"><FaBuilding /> <span>Unit Management</span></Link></li>
        <li><Link to="manage-tenants"><FaUsers /> <span>Manage Tenants</span></Link></li>
        <li><Link to="events-board"><FaCalendarCheck /> <span>Events Board</span></Link></li>
        <li><Link to="payment-dashboard"><FaMoneyBillWave /> <span>Payment Dashboard</span></Link></li>
        <li><Link to="maintenance-requests"><FaTools /> <span>Maintenance Requests</span></Link></li>
        <li><Link to="gallery-admin"><FaCamera /> <span>Gallery Management</span></Link></li>
        <li><Link to="feedback-admin"><FaCommentDots /> <span>Feedback</span></Link></li>
    </ul>
</nav>
</aside>
{/* Top Navigation */}
<div className={`${styles.topBar} ${isSidebarCollapsed ? styles.shifted : ""}`}>

    {/* 🔹 Left Section: Sidebar Toggle */}
    <div className={styles.topLeft}>
        <button 
            className={`${styles.sidebarToggle} ${isSidebarCollapsed ? styles.moveRight : ""}`} 
            onClick={toggleSidebar}
        >
            {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
        </button>
    </div>
{/* 🔹 Right Section: Notifications & Profile */}
<div className={styles.topRight}>
    {/* Notifications */}
    <div className={styles.notificationContainer} ref={dropdownRef}>
        <FaBell className={styles.notificationIcon} onClick={() => setShowNotifications((prev) => !prev)} />
        {notifications.filter((n) => !n.read).length > 0 && (
            <span className={styles.notificationBadge}>
                {notifications.filter((n) => !n.read).length}
            </span>
        )}

        {showNotifications && (
            <div className={styles.notificationDropdown}>
                <h4 className={styles.notificationHeader}>Notifications</h4>
                <ul>
                    {notifications.map((note) => (
                        <li key={note.id} className={styles.notificationContent}>
                            <span>{note.message}</span>
                        </li>
                    ))}
                </ul>
                <div className={styles.notificationActions}>
                    <button onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>Mark All as Read</button>
                </div>
            </div>
        )}
    </div>


                    {/* Profile */}
                    <div className={styles.profileContainer} ref={profileRef} onClick={() => setShowProfileDropdown((prev) => !prev)}>
                    <img src={`${process.env.REACT_APP_API_URL}/storage/profile/admin.png`} alt="Admin Profile" className={styles.profilePicture} />
                        <span>{admin.name || "Admin"}</span>

                        {showProfileDropdown && (   
                            <div className={styles.profileDropdown}>
                                <ul>
                                    <li>
                                        <img src={`${process.env.REACT_APP_API_URL}/storage/profile/admin.png`}  alt="Admin Profile" className={styles.dropdownProfilePicture} />
                                    </li>
                                    <span>{admin.name || "Admin"}</span>
                                    <span className={styles.profileEmail}>{admin.email}</span>
                                    <li>
                                        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className={`${styles.mainContent} ${isSidebarCollapsed ? styles.shifted : ""}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard;
