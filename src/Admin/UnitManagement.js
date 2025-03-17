import React, { useEffect, useState } from 'react';
import './UnitManagement.css';

const UnitManagement = ({ onAddUnit }) => {
    const [units, setUnits] = useState([]); // State to store units
    const [tenants, setTenants] = useState([]); // State to store tenants
    const [selectedTenant, setSelectedTenant] = useState(''); // Selected tenant ID
    const [selectedUnit, setSelectedUnit] = useState(''); // Selected unit ID
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch tenants from the backend
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch tenants');
                }

                const users = await response.json();
                console.log('Fetched Users:', users);

                // Filter users with role "tenant"
                const tenantList = users.filter((user) => user.role === 'tenant');
                setTenants(tenantList);
            } catch (error) {
                console.error('Error fetching tenants:', error.message);
            }
        };

        fetchTenants();
    }, []);

    // Fetch units from the backend
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/units');
                if (!response.ok) {
                    throw new Error('Failed to fetch units');
                }

                const units = await response.json();
                console.log('Fetched Units:', units);
                setUnits(units); // Set the units state
            } catch (error) {
                console.error('Error fetching units:', error.message);
            }
        };

        fetchUnits();
    }, []);

    const handleToggleStatus = async (unitId, currentStatus) => {
        const newStatus = currentStatus === 'unavailable' ? 'available' : 'unavailable';
    
        try {
            const response = await fetch(`http://localhost:8000/api/units/${unitId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update unit status');
            }
    
            const updatedUnit = await response.json();
            setUnits((prevUnits) =>
                prevUnits.map((unit) =>
                    unit.id === unitId ? { ...unit, status: newStatus } : unit
                )
            );
    
            alert(`Unit has been marked as ${newStatus}.`);
        } catch (error) {
            console.error('Error updating unit status:', error.message);
            alert('Failed to update unit status. Please try again.');
        }
    };
    
    const handleAssignUnit = async (e) => {
        e.preventDefault();
        if (!selectedTenant || !selectedUnit) {
            alert('Please select both a tenant and a unit.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/assign-unit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: selectedTenant,
                    unit_id: selectedUnit,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign unit.');
            }

            const result = await response.json();
            setSuccessMessage(result.message || 'Unit assigned successfully!');
            alert('Unit assigned successfully!');
            setSelectedTenant('');
            setSelectedUnit('');
        } catch (error) {
            console.error('Error assigning unit:', error.message);
            alert('Failed to assign unit. Please try again.');
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const unit = {
            unit_code: formData.get("unit_code"),
            name: formData.get("name"),
            capacity: formData.get("capacity"),
            price: formData.get("price"),
            stay_type: formData.get("stay_type"), // Capture stay_type from the form
        };
    
        if (typeof onAddUnit === "function") {
            onAddUnit(unit);
        } else {
            console.error("onAddUnit is not a function");
        }
    
        e.target.reset();
    };
    
    return (
        <section id="unit-management" className="dashboard-section">
            <h2>Unit Management</h2>
            <p>Units managed: {units.length}</p>
    
            {/* Add Unit Form */}
            <form onSubmit={handleSubmit}>
                <h3>Add New Unit</h3>
                <div>
                    <label>
                        Unit Code:
                        <input type="text" name="unit_code" required placeholder="Unit Code (e.g., CF-1)" />
                    </label>
                </div>
                <div>
                    <label>
                        Name:
                        <input type="text" name="name" required placeholder="Unit Name" />
                    </label>
                </div>
                <div>
                    <label>
                        Capacity:
                        <input type="number" name="capacity" required placeholder="Capacity" />
                    </label>
                </div>
                <div>
                    <label>
                        Price:
                        <input type="number" name="price" required placeholder="Price" />
                    </label>
                </div>
                <div>
                    <label>
                        Stay Type:
                        <select name="stay_type" required>
                            <option value="short-term">Short-Term</option>
                            <option value="long-term">Long-Term</option>
                        </select>
                    </label>
                </div>
                <button type="submit">Add Unit</button>
            </form>
    
            <h3>Short-Term Stay Units</h3>
            <table>
                <thead>
                    <tr>
                        <th>Unit Code</th>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Price</th>
                        <th>Occupied</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {units
                        .filter((unit) => unit.stay_type === "short-term") // Filter by stay_type
                        .map((unit) => (
                            <tr key={unit.id}>
                                <td>{unit.unit_code || "N/A"}</td>
                                <td>{unit.name}</td>
                                <td>{unit.capacity}</td>
                                <td>{unit.price}</td>
                                <td>{unit.users_count || 0}</td>
                                <td>{unit.status}</td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStatus(unit.id, unit.status)}
                                        className={
                                            unit.status === "unavailable"
                                                ? "available-button"
                                                : "unavailable-button"
                                        }
                                    >
                                        {unit.status === "unavailable" ? "Make Available" : "Make Unavailable"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            <h3>Long-Term Stay Units</h3>
            <table>
                <thead>
                    <tr>
                        <th>Unit Code</th>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Price</th>
                        <th>Occupied</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {units
                        .filter((unit) => unit.stay_type === "long-term") // Filter by stay_type
                        .map((unit) => (
                            <tr key={unit.id}>
                                <td>{unit.unit_code || "N/A"}</td>
                                <td>{unit.name}</td>
                                <td>{unit.capacity}</td>
                                <td>{unit.price}</td>
                                <td>{unit.users_count || 0}</td>
                                <td>{unit.status}</td>
                                <td>
                                    <button
                                        onClick={() => handleToggleStatus(unit.id, unit.status)}
                                        className={
                                            unit.status === "unavailable"
                                                ? "available-button"
                                                : "unavailable-button"
                                        }
                                    >
                                        {unit.status === "unavailable" ? "Make Available" : "Make Unavailable"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

    </section>
    
    );
};

export default UnitManagement;
