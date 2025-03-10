import React, { useState, useEffect } from 'react';
import './PaymentTenant.css';
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
            setDueDate(data.due_date); // Update the next due date dynamically
            setCheckInDate(data.check_in_date);
            setDuration(data.duration);
    
            generatePaymentMonths(data.check_in_date, data.duration, data.payments);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            setPaymentHistory([]);
        }
    };
    

    const generatePaymentMonths = (startDate, duration, payments) => {
        const months = [];
        const start = new Date(startDate);
        start.setMonth(start.getMonth() + 1); // Start from one month after check-in
    
        for (let i = 0; i < duration; i++) {
            const paymentDate = new Date(start);
            paymentDate.setMonth(start.getMonth() + i);
    
            const formattedDate = paymentDate.toISOString().split('T')[0]; // Ensure YYYY-MM-DD
            months.push(formattedDate);
        }
    
        // Log generated months for debugging
        console.log('Generated Months:', months);
    
        const paidMonths = payments.map((p) => p.payment_period);
        const unpaidMonths = months.filter((m) => !paidMonths.includes(m));
    
        setAvailableMonths(unpaidMonths);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.payment_for) {
            alert('Please select a payment period.');
            return;
        }
    
        const requestData = new FormData();
        requestData.append('amount', formData.amount);
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
                alert('Payment submitted successfully!');
                fetchPaymentData(tenantId);
            } else {
                alert('Failed to submit payment.');
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
        }
    };
    
    return (
        <div className="payment-container">
            <h1>Payment Dashboard</h1>
            {warningMessage && <div className="warning-message">{warningMessage}</div>}
            {unitPrice > 0 && (
                <p>
                    Unit Price: <strong>₱{unitPrice}</strong>
                </p>
            )}
            <form className="payment-form" onSubmit={handleSubmit}>
                <label>Amount</label>
                <input type="number" name="amount" value={formData.amount} disabled />

                <label>Payment For</label>
                <select
                    name="payment_for"
                    value={formData.payment_for}
                    onChange={(e) => setFormData({ ...formData, payment_for: e.target.value })}
                    required
                >
                    <option value="">Select Payment Date</option>
                    {availableMonths.map((month, index) => (
                        <option key={index} value={month}>
                            {new Date(month).toLocaleDateString('default', {
                                month: 'long',
                                year: 'numeric',
                            })}
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
                    onChange={(e) => setFormData({ ...formData, receipt: e.target.files[0] })}
                    required
                />
                <button type="submit">Submit Payment</button>
            </form>

            {dueDate && <p>Next Payment Due Date: <strong>{dueDate}</strong></p>}

            <h3>Payment History</h3>
            {paymentHistory.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Type</th>
                            <th>Reference Number</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentHistory.map((payment, index) => (
                            <tr key={index}>
                                <td>
                                    {payment.payment_period
                                        ? new Date(payment.payment_period).toLocaleDateString('default', {
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                        : 'Invalid Date'}
                                </td>
                                <td>{payment.amount}</td>
                                <td>{payment.payment_type}</td>
                                <td>{payment.reference_number}</td>
                                <td>{payment.status}</td>
                            </tr>
                        ))}
                    </tbody>


                </table>
            ) : (
                <p>No payment history found.</p>
            )}
        </div>
    );
};

export default PaymentTenant;
