import React, { useState, useEffect } from 'react';
import './PaymentTenant.css';
import { useResizeDetector } from 'react-resize-detector';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Pusher
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'fea5d607d4b38ea09320', // Replace with your Pusher app key
    cluster: 'ap1', // Replace with your cluster, e.g., 'mt1'
    forceTLS: true, // Use secure connection
});

const PaymentTenant = () => {
    

    const [isCompact, setIsCompact] = useState(false);
    const [currentView, setCurrentView] = useState("dashboard");
    const [currentBillView, setCurrentBillView] = useState("bills");

    const { width, ref } = useResizeDetector({
        onResize: (width) => {
            if (width < 480) {  
                setIsCompact(true);  // Extra compact mode for smartphones
            } else if (width < 768) {  
                setIsCompact(true); // Tablet mode
            } else {
                setIsCompact(false); // Default layout
            }
        }
    });
    const [formData, setFormData] = useState({
        payment_for: '',
        payment_type: '',
        reference_number: '',
        receipt: null,
        amount: '',
    });

    const [unitPrice, setUnitPrice] = useState(0);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [duration, setDuration] = useState(0);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [tenantId, setTenantId] = useState(null);
    const [balanceDue, setBalanceDue] = useState({}); // Track remaining balances
    const [availableCredits, setAvailableCredits] = useState(0);
    const [paymentDue, setPaymentDue] = useState(0);
    const [showTransactions, setShowTransactions] = useState(false);
    const [billingDetails, setBillingDetails] = useState([]);
    const [receiptValidated, setReceiptValidated] = useState(false); // Track receipt validation

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await fetch('http://localhost:8000/api/auth/user', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const user = await userResponse.json();

                setTenantId(user.id);
                fetchPaymentData(user.id);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        window.Echo.channel(`tenant-reminder.${tenantId}`).listen('.payment.reminder', (data) => {
            alert(data.message);
        });
    }, [tenantId]);

    const handleAmountBlur = () => {
        const enteredAmount = parseFloat(formData.amount) || 0;
        const selectedMonth = formData.payment_for;
    
        if (!selectedMonth) return; // Prevent calculation if no month is selected
    
        // Get the original due amount (reset every time to avoid cumulative subtraction)
        const originalDue = unitPrice; // Use the full unit price instead of a modified value
    
        // Calculate the new remaining balance (always subtract from the original)
        const newRemainingBalance = Math.max(0, originalDue - enteredAmount);
    
        // Update the balance correctly without cumulative subtraction
        setBalanceDue((prevBalances) => ({
            ...prevBalances,
            [selectedMonth]: newRemainingBalance, // Store the updated balance for this month
        }));
    };
    
    
    const fetchPaymentData = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/tenant-payments/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            if (!res.ok) throw new Error('Failed to fetch payment data.');

            const data = await res.json();

            setUnitPrice(data.unit_price || 0);
            setFormData((prevData) => ({ ...prevData, amount: data.unit_price || 0 }));
            setPaymentHistory(data.payments || []);
            setDueDate(data.due_date);
            setCheckInDate(data.check_in_date);
            setDuration(data.duration);
            setBalanceDue(data.unpaid_balances || {}); // Fetch remaining balance

            generatePaymentMonths(data.check_in_date, data.duration, data.payments);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setPaymentHistory([]);
        }
    };

    const generatePaymentMonths = (startDate, duration, payments) => {
        const months = [];
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + 1);
    
        for (let i = 0; i < duration; i++) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + i);
            const formattedDate = paymentDate.toISOString().split('T')[0];
            months.push(formattedDate);
        }
    
        console.log('Generated Months:', months);
    
        // Separate fully paid, partially paid, and unpaid months
        const monthStatus = {};
        payments.forEach((p) => {
            monthStatus[p.payment_period] = {
                amountPaid: parseFloat(p.amount),
                remainingBalance: parseFloat(p.remaining_balance),
            };
        });
    
        let unpaidMonths = [];
        let partiallyPaidMonths = [];
        let foundPartial = false;
    
        for (const month of months) {
            if (monthStatus[month]) {
                if (monthStatus[month].remainingBalance > 0) {
                    partiallyPaidMonths.push(month);
                    foundPartial = true; // Block future payments
                }
            } else if (!foundPartial) {
                unpaidMonths.push(month);
            }
        }
    
        setAvailableMonths([...partiallyPaidMonths, ...unpaidMonths]); // Prioritize partial months first
    };

    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
    
        if (!file) {
            alert("❌ Please select a receipt file.");
            return;
        }
    
        console.log("📤 Uploading file:", file.name);
    
        setFormData((prevData) => ({ ...prevData, receipt: file }));
        setReceiptValidated(false); // Reset validation state
    
        const formDataUpload = new FormData();
        formDataUpload.append("receipt", file);
        formDataUpload.append("user_reference", formData.reference_number);
    
        try {
            const response = await fetch("http://localhost:8000/api/validate-receipt", {
                method: "POST",
                body: formDataUpload,
            });
    
            const textResponse = await response.text();
            console.log("📜 Raw API Response:", textResponse);
    
            try {
                const result = JSON.parse(textResponse);
                console.log("📊 Parsed JSON:", result);
    
                if (!response.ok) {
                    alert(result.message || "❌ Error processing receipt.");
                    setReceiptValidated(false);
                    return;
                }
    
                if (!result.extracted_reference) {
                    alert("❌ Unable to extract reference number from the receipt. Please try again.");
                    setReceiptValidated(false);
                    return;
                }
    
                if (result.extracted_reference !== formData.reference_number) {
                    alert("❌ Mismatch! The reference number in the receipt does not match the entered reference number.");
                    setReceiptValidated(false);
                } else {
                    alert("✅ Receipt validated successfully!");
                    setReceiptValidated(true);
                }
            } catch (error) {
                console.error("❌ Error parsing JSON:", error);
                alert("❌ Server returned an unexpected response.");
            }
        } catch (error) {
            console.error("❌ Error validating receipt:", error);
            alert("❌ An error occurred while processing the receipt.");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!receiptValidated) {
            alert("⚠️ Please validate your receipt before submitting the payment.");
            return;
        }
    
        if (!formData.payment_for) {
            alert('Please select a payment period.');
            return;
        }
    
        const refNumPattern = /^\d{13}$/;
        if (!refNumPattern.test(formData.reference_number)) {
            alert('Reference number must be exactly 13 digits.');
            return;
        }
    
        const checkRefRes = await fetch(`http://localhost:8000/api/check-reference/${formData.reference_number}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
    
        const checkRefData = await checkRefRes.json();
        if (checkRefRes.ok && checkRefData.exists) {
            alert('This reference number has already been used. Please use a different one.');
            return;
        }
    
        const amountToPay = parseFloat(formData.amount);
        const totalDue = balanceDue[formData.payment_for] || unitPrice;
    
        if (amountToPay > totalDue) {
            alert('Amount exceeds the remaining balance.');
            return;
        }
    
        const requestData = new FormData();
        requestData.append('amount', amountToPay);
        requestData.append('payment_type', formData.payment_type);
        requestData.append('reference_number', formData.reference_number);
        requestData.append('payment_for', formData.payment_for);
        requestData.append('receipt', formData.receipt);
    
        try {
            const response = await fetch('http://localhost:8000/api/payments', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: requestData,
            });
    
            if (response.ok) {
                alert('✅ Payment submitted successfully!');
                fetchPaymentData(tenantId);
            } else {
                alert('❌ Failed to submit payment.');
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
        }
    };
    
    
    return (
        <div ref={ref} className={`payment-container payment-background ${isCompact ? 'compact-mode' : ''}`}>

            {/* 🚀 Dashboard View */}
            {currentView === "dashboard" && (
                <div className="dashboard-container">
                    <h1>Tenant Dashboard</h1>

                    <div className="balance-section">
                        <div className="balance-box">
                            <p>Available Credits</p>
                            <h2>₱{availableCredits.toFixed(2)}</h2>
                        </div>
                        <div className="balance-box due">
                            <p>Payment Due</p>
                            <h2>₱{paymentDue.toFixed(2)}</h2>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="dashboard-buttons">
                        <button className="pay-now" onClick={() => setCurrentView("payment")}>Pay Now</button>
                        <button className="my-bill" onClick={() => setCurrentView("bills")}>My Bill</button>
                        <button className="transactions" onClick={() => setCurrentView("transactions")}>Transactions</button>
                    </div>
                </div>
            )}

            {currentView === "payment" && (
                <div className="payment-page">
                    <h1>Payment Dashboard</h1>
            <p>Current Width: {width}px</p>
            {isCompact && <p>Switched to Compact Mode</p>}
            <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>
            
            {warningMessage && <div className="warning-message">{warningMessage}</div>}
            {unitPrice > 0 && (
                <p>
                    Unit Price: <strong>₱{unitPrice}</strong>
                </p>
            )}

            {/* Payment Form */}
            <form className="payment-form" onSubmit={handleSubmit}>
            <label>Amount to Pay</label>
            <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })} // Just updates input
                onBlur={handleAmountBlur} // Subtracts only from the original balance
            />

            <label>Remaining Balance for Selected Month</label>
            <p>
                ₱{formData.payment_for && balanceDue[formData.payment_for] !== undefined
                    ? balanceDue[formData.payment_for] 
                    : unitPrice}
            </p>

            <label>Payment For</label>
            <select
                name="payment_for"
                value={formData.payment_for}
                onChange={(e) => setFormData({ ...formData, payment_for: e.target.value })}
                required
            >
                <option value="">Select Payment Date</option>
                
                {/* Partially Paid Months First */}
                {availableMonths.filter((month) => balanceDue[month] > 0).map((month, index) => (
                    <option key={index} value={month}>
                        {new Date(month).toLocaleDateString('default', { month: 'long', year: 'numeric' })} (Partially Paid)
                    </option>
                ))}

                {/* Unpaid Months (after partials are paid) */}
                {availableMonths.filter((month) => balanceDue[month] === undefined).map((month, index) => (
                    <option key={index} value={month}>
                        {new Date(month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </option>
                ))}
            </select>


                <label>Payment Type</label>
                <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    required
                >
                    <option value="">Select Payment Type</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="E-Wallet">E-Wallet</option>
                </select>

                <label>Reference Number</label>
                <input
                    type="text"
                    name="reference_number"
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    required
                />

                <label>Upload Receipt</label>
                <input
                    type="file"
                    name="receipt"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={(e) => handleReceiptUpload(e)}  // Ensure function is called
                    required
                />


            <button type="submit" disabled={!receiptValidated}>
                {receiptValidated ? "Submit Payment" : "Waiting for Receipt Validation..."}
            </button>

            </form>

            {dueDate && <p>Next Payment Due Date: <strong>{dueDate}</strong></p>}
                </div>
            )}

            {/* 🚀 My Bills Page (Main Bill Page) */}
            {currentView === "bills" && (
                <div className="bills-container">
                    <h1>My Bills</h1>
                    <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>

                    {/* ✅ Navigation to separate pages */}
                    <div className="bill-navigation">
                        <button onClick={() => setCurrentBillView("toPay")}>To Pay</button>
                        <button onClick={() => setCurrentBillView("paid")}>Paid</button>
                    </div>

                    {/* ✅ To Pay Section */}
                    {currentBillView === "toPay" && (
                        <div className="to-pay-section">
                            <h2>Months Remaining to Pay</h2>
                            {availableMonths.length > 0 ? (
                                <ul>
                                    {availableMonths.map((month, index) => (
                                        <li key={index}>
                                            {new Date(month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>All months are paid.</p>
                            )}
                        </div>
                    )}

                    {/* ✅ Paid Section */}
                    {currentBillView === "paid" && (
                        <div className="paid-section">
                            <h2>Months Already Paid</h2>
                            {paymentHistory.length > 0 ? (
                                <ul>
                                    {paymentHistory
                                        .filter(payment => payment.remaining_balance === 0) // Show only fully paid months
                                        .map((payment, index) => (
                                            <li key={index}>
                                                {new Date(payment.payment_period).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                            </li>
                                        ))}
                                </ul>
                            ) : (
                                <p>No months have been fully paid yet.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 🚀 Transactions Page */}
            {currentView === "transactions" && (
                <div className="transactions-container">
                    <h1>Transaction History</h1>
                    <button className="back-button" onClick={() => setCurrentView("dashboard")}>← Back to Dashboard</button>

                    {paymentHistory.length > 0 ? (
                        <div className="payment-history">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount Paid</th>
                                        <th>Remaining Balance</th>
                                        <th>Payment Type</th>
                                        <th>Reference Number</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment, index) => (
                                        <tr key={index}>
                                            <td>{payment.payment_period}</td>
                                            <td>₱{payment.amount}</td>
                                            <td>₱{payment.remaining_balance}</td>
                                            <td>{payment.payment_type}</td>
                                            <td>{payment.reference_number}</td>
                                            <td>{payment.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No transaction history found.</p>
                    )}
                </div>
            )}
        </div>
    );
};


export default PaymentTenant;
