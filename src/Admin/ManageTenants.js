import React, { useEffect, useState } from 'react';
import './ManageTenants.css';

const ManageTenants = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTenant, setSelectedTenant] = useState(null);

    // Fetch tenants from the backend API
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/tenants');
                if (!response.ok) {
                    throw new Error('Failed to fetch tenant data');
                }
                const data = await response.json();
                setTenants(data);
            } catch (err) {
                setError('Unable to load tenant data');
            } finally {
                setLoading(false);
            }
        };

        fetchTenants();
    }, []);

    // Function to open modal with tenant details
    const handleRowClick = (tenant) => {
        setSelectedTenant(tenant);
    };

    // Function to close modal
    const handleCloseModal = () => {
        setSelectedTenant(null);
    };

    return (
        <section className="manage-tenants">
            <h2>Manage Tenants</h2>
            {loading ? (
                <p>Loading tenants...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <table className="tenants-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Contact Number</th>
                            <th>Check-in Date</th>
                            <th>Duration</th>
                            <th>Occupation</th>
                            <th>Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr
                                key={tenant.id}
                                className="clickable-row"
                                onClick={() => handleRowClick(tenant)}
                            >
                                <td>{tenant.id}</td>
                                <td>{tenant.name}</td>
                                <td>{tenant.email}</td>
                                <td>{tenant.address || 'N/A'}</td>
                                <td>{tenant.contact_number || 'N/A'}</td>
                                <td>
                                    {tenant.check_in_date
                                        ? new Date(tenant.check_in_date).toLocaleString()
                                        : 'N/A'}
                                </td>
                                <td>{tenant.duration || 'N/A'} months</td>
                                <td>{tenant.occupation || 'N/A'}</td>
                                <td>{tenant.unit_code || 'Not Assigned'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal for Tenant Details */}
            {selectedTenant && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div
                        className="modal-box"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <h3 className="modal-header">Tenant Details</h3>
                        <div className="modal-content">
                            <p><strong>ID:</strong> {selectedTenant.id}</p>
                            <p><strong>Name:</strong> {selectedTenant.name}</p>
                            <p><strong>Email:</strong> {selectedTenant.email}</p>
                            <p><strong>Address:</strong> {selectedTenant.address || 'N/A'}</p>
                            <p><strong>Contact Number:</strong> {selectedTenant.contact_number || 'N/A'}</p>
                            <p><strong>Check-in Date:</strong> {selectedTenant.check_in_date || 'N/A'}</p>
                            <p><strong>Duration:</strong> {selectedTenant.duration} months</p>
                            <p><strong>Occupation:</strong> {selectedTenant.occupation || 'N/A'}</p>
                            <p><strong>Unit:</strong> {selectedTenant.unit_code || 'Not Assigned'}</p>
                            {selectedTenant.valid_id_url && (
                                <div className="modal-valid-id">
                                    <p><strong>Valid ID:</strong></p>
                                    <img
                                        src={selectedTenant.valid_id_url}
                                        alt="Valid ID"
                                        className="valid-id-image"
                                    />
                                </div>
                            )}
                        </div>
                        <button onClick={handleCloseModal} className="close-modal-button">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ManageTenants;
