import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import './RoomInfo.css'; // Import styles
import { FaBed, FaUsers, FaMoneyBillWave, FaCalendarAlt, FaConciergeBell } from 'react-icons/fa';

const RoomInfo = () => {
    const { sidebarOpen } = useOutletContext(); // Access sidebar state
    const [unitData, setUnitData] = useState(null); // State for fetched data

    // Fetch the assigned unit for the logged-in tenant
    useEffect(() => {
        const fetchAssignedUnit = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://backend-production-8fda.up.railway.app/api/tenant/unit', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch assigned unit data');
                }

                const data = await response.json();
                setUnitData(data); // Update state with fetched data
            } catch (error) {
                console.error('Error fetching assigned unit data:', error.message);
            }
        };

        fetchAssignedUnit();
    }, []);

    return (
        <div className={`roomCard-container ${sidebarOpen ? 'shifted' : ''}`}>
            <h1 className="title">Room Information</h1>
            {!unitData ? (
                <p>Loading...</p>
            ) : (
                <div className="roomCard" key={unitData.id}>
                    <div className="infoSection">
                        <p>
                            <FaBed className="icon" /> <strong>Unit Type:</strong> {unitData.name}
                        </p>
                        <p>
                            <FaUsers className="icon" /> <strong>Capacity:</strong> {unitData.capacity} occupants
                        </p>
                        <p>
                            <FaMoneyBillWave className="icon" /> <strong>Monthly Rent:</strong> ${unitData.price}
                        </p>
                        <p>
                            <FaCalendarAlt className="icon" /> <strong>Rent Due Date:</strong> 15th of every month
                        </p>
                    </div>
                    <div className="amenitiesSection">
                        <h3>
                            <FaConciergeBell className="icon" /> Amenities
                        </h3>
                        <ul>
                            <li>Air Conditioning</li>
                            <li>Private Bathroom</li>
                            <li>Wi-Fi</li>
                            <li>Study Table</li>
                            <li>Wardrobe</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomInfo;
