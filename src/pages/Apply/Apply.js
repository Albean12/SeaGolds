import React, { useState, useEffect } from 'react';
import './Apply.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { auth, provider } from "../../firebase/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        middle_name: '',
        email: '',
        address: '',
        contact_number: '',
        occupation: '',
        check_in_date: null,
        duration: '',
        reservation_details: '',
        valid_id: null,
        accept_privacy: false,
    });

    const [units, setUnits] = useState([]);
    const [showTermsModal, setShowTermsModal] = useState(false); // State to toggle Terms Modal
    const [isVerified, setIsVerified] = useState(false);

    // Fetch units
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('https://backend-production-8fda.up.railway.app/api/units');
                if (!response.ok) {
                    throw new Error('Failed to fetch units');
                }
                const data = await response.json();
                setUnits(data);
            } catch (err) {
                console.error('Error fetching units:', err);
            }
        };
        fetchUnits();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, valid_id: file });
    
        const formDataUpload = new FormData();
        formDataUpload.append('valid_id', file);
        formDataUpload.append('id_type', formData.id_type);
    
        try {
            const response = await fetch('https://backend-production-8fda.up.railway.app/api/upload-id', {
                method: 'POST',
                body: formDataUpload,
                headers: { "Accept": "application/json" }
            });
    
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server Error: ${response.status} - ${text}`);
            }
    
            const data = await response.json();
    
            if (data.id_verified) {
                alert(`✅ ID Verified Successfully!\nExtracted Text: ${data.ocr_text}`);
            } else {
                alert(`❌ ID Mismatch!\nExtracted Text: ${data.ocr_text}`);
            }
        } catch (error) {
            console.error('Error uploading ID:', error);
            alert("Error processing the ID. Please check the console.");
        }
    };
    

    const formatDateTime = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            if (user) { // Remove the user.emailVerified check
                setFormData((prev) => ({
                    ...prev,
                    email: user.email,
                    first_name: user.displayName.split(" ")[0],
                    last_name: user.displayName.split(" ").slice(-1)[0],
                }));
                setIsVerified(true);
                alert(`✅ Email successfully verified: ${user.email}`);
            }
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert("❌ Failed to verify email. Please try again.");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isVerified) {
            alert('Please verify your email using Google Sign-In before submitting.');
            return;
        }

        if (!formData.accept_privacy) {
            alert('You must accept the privacy terms.');
            return;
        }

        try {
            const requestData = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key === 'check_in_date') {
                    requestData.append(key, formatDateTime(formData[key]));
                } else {
                    requestData.append(key, formData[key]);
                }
            });

            const response = await fetch('https://backend-production-8fda.up.railway.app/api/applications', {
                method: 'POST',
                body: requestData,
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
            }

            alert('Application submitted successfully!');
            setFormData({
                last_name: '',
                first_name: '',
                middle_name: '',
                email: '',
                address: '',
                contact_number: '',
                occupation: '',
                check_in_date: null,
                duration: '',
                reservation_details: '',
                valid_id: null,
                accept_privacy: false,
            });
            setIsVerified(false);
        } catch (error) {
            console.error('Error submitting application:', error.message);
            alert(`An error occurred: ${error.message}`);
        }
    };
    
    const duration = Number(formData.duration);

    return (
        <div className="contact-page-container">
            <div className="get-in-touch">
                <h2>Interested? Be With Us!</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                    {/* Name and Email */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder="Enter your last name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder="Enter your first name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Middle Name</label>
                            <input
                                type="text"
                                name="middle_name"
                                value={formData.middle_name}
                                onChange={handleInputChange}
                                placeholder="Enter your middle name"
                            />
                        </div>
                    </div>
                    <div className="form-group email-group">
                        <label>Email</label>
                        <div className="email-container">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                required
                            />
                            <button 
                                type="button" 
                                className="verify-email-button" 
                                onClick={handleGoogleSignIn}
                                disabled={isVerified}
                            >
                                {isVerified ? "Verified" : "Verify"}
                            </button>
                        </div>
                    </div>



                    {/* Address and Contact */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your address"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                type="text"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                placeholder="Enter your contact number"
                                required
                            />
                        </div>
                    </div>

                    {/* Occupation */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Occupation/Rank</label>
                            <input
                                type="text"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleInputChange}
                                placeholder="Enter your occupation"
                                required
                            />
                        </div>
                    </div>

                    {/* Check-in Date and Duration */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Check-in Date & Time</label>
                            <DatePicker
                                selected={formData.check_in_date}
                                onChange={(date) => setFormData({ ...formData, check_in_date: date })}
                                showTimeSelect
                                dateFormat="MMMM d, yyyy h:mm aa"
                                placeholderText="Select Date and Time"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration</label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Duration</option>
                                {[...Array(12).keys()].map((month) => (
                                    <option key={month + 1} value={month + 1}>
                                        {month + 1} {month + 1 === 1 ? 'Month' : 'Months'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reservation */}
                    <div className="form-group">
                        <label>Reservation</label>
                        <select
                            name="reservation_details"
                            value={formData.reservation_details}
                            onChange={handleInputChange}
                            required
                            disabled={!formData.duration} // Disable dropdown if duration is not selected
                        >
                            <option value="">Select a Unit</option>
                            {/* Short-Term Stay Units */}
                            <optgroup label="Short-Term Stay">
                                {units
                                    .filter(
                                        (unit) =>
                                            unit.status === 'available' &&
                                            unit.users_count < unit.capacity &&
                                            unit.capacity <= 6
                                    )
                                    .map((unit) => (
                                        <option
                                            key={unit.id}
                                            value={unit.unit_code}
                                            disabled={duration > 6}
                                        >
                                            {unit.name} - ₱{unit.price} ({unit.capacity - unit.users_count} slots)
                                        </option>
                                    ))}
                            </optgroup>
                            {/* Long-Term Stay Units */}
                            <optgroup label="Long-Term Stay">
                                {units
                                    .filter(
                                        (unit) =>
                                            unit.status === 'available' &&
                                            unit.users_count < unit.capacity &&
                                            unit.capacity > 6
                                    )
                                    .map((unit) => (
                                        <option
                                            key={unit.id}
                                            value={unit.unit_code}
                                            disabled={duration <= 6}
                                        >
                                            {unit.name} - ₱{unit.price} ({unit.capacity - unit.users_count} slots)
                                        </option>
                                    ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* ID Type Selection and File Upload */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Select ID Type</label>
                            <select
                                name="id_type"
                                value={formData.id_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select an ID Type</option>
                                <option value="Postal ID">Postal ID</option>
                                <option value="UMID">UMID</option>
                                <option value="National ID">National ID</option>
                                <option value="Passport">Passport</option>
                                <option value="Driver's License">Driver's License</option>
                                <option value="Philhealth ID">Philhealth ID</option>
                                <option value="School ID">School ID</option>
                                <option value="Voter's ID/ Voter's Certification">Voter's ID/ Voter's Certification</option>
                                <option value="PRC ID">PRC ID</option>
                            </select>
                        </div>
                    </div>
                    {formData.id_type && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Upload {formData.id_type}</label>
                                <input type="file" name="valid_id" onChange={handleFileChange} required />
                            </div>
                        </div>
                    )}
                    {/* Privacy Checkbox */}
                    <div className="form-row">
                        <div className="form-group">
                            <input
                                type="checkbox"
                                name="accept_privacy"
                                checked={formData.accept_privacy}
                                onChange={(e) =>
                                    setFormData({ ...formData, accept_privacy: e.target.checked })
                                }
                                required
                            />
                            <label>
                                I accept the{' '}
                                <span
                                    style={{ color: '#607d8b', cursor: 'pointer' }}
                                    onClick={() => {
                                        setShowTermsModal(true);
                                        console.log("Modal State: ", showTermsModal);
                                    }}
                                >
                                    Terms and Privacy
                                </span>

                            </label>
                        </div>
                    </div>

                    <button type="submit" className="send-message-button">
                        Submit
                    </button>
                </form>
            </div>

            {/* Contact Information */}
            <div className="contact-information">
                <h2>Contact Information</h2>
                <p><strong>Address:</strong> 3/F Fern Building, Sampaloc, Manila</p>
                <p><strong>Phone:</strong> +1235 2355 98</p>
                <p>
                    <strong>Facebook:</strong>{' '}
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        Visit Our Page
                    </a>
                </p>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Terms and Privacy</h2>
                        <p>By submitting this form, you agree to our terms and privacy policy. Please ensure all your information is accurate. For more details, contact us directly.</p>
                        <button onClick={() => setShowTermsModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactUs;
