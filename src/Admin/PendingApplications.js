import React, { useEffect, useState } from 'react';
import './PendingApplications.css';

const PendingApplications = () => {
  const [applications, setApplications] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetch('https://backend-production-8fda.up.railway.app/api/applications')
      .then(res => res.json())
      .then(data => {
        setApplications(data.applications || []);
        setUnits(data.units || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectApplication = (application) => {
    setSelectedApplication(application);
  };

  const handleCloseDetails = () => setSelectedApplication(null);

  const handleAccept = async (application) => {
    if (!window.confirm('Accept this application and create tenant account?')) return;

    const payload = {
      first_name: application.first_name,
      last_name: application.last_name,
      email: application.email,
      unit_code: application.reservation_details,
    };

    try {
      const response = await fetch(`https://backend-production-8fda.up.railway.app/api/applications/${application.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      alert('Tenant account created successfully!');

      setApplications(prev => prev.filter(app => app.id !== application.id));
      handleCloseDetails();

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDecline = async (applicationId) => {
    if (!window.confirm('Decline this application?')) return;

    try {
      const response = await fetch(`https://backend-production-8fda.up.railway.app/api/applications/${applicationId}/decline`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to decline application');

      alert('Application declined.');
      setApplications(prev => prev.filter(app => app.id !== applicationId));
      handleCloseDetails();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <p>Loading applications...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="pending-applications">
      <h2>Pending Applications</h2>

      <table className="applications-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact Number</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id} onClick={() => handleSelectApplication(app)}>
              <td>{app.first_name} {app.last_name}</td>
              <td>{app.email}</td>
              <td>{app.contact_number}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedApplication && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="application-details">
            <h3>Application Details</h3>
            <p><strong>Name:</strong> {selectedApplication.first_name} {selectedApplication.last_name}</p>
            <p><strong>Email:</strong> {selectedApplication.email}</p>
            <p><strong>Contact:</strong> {selectedApplication.contact_number}</p>
            <p><strong>Address:</strong> {selectedApplication.address}</p>
            <p><strong>Occupation:</strong> {selectedApplication.occupation}</p>
            <p><strong>Check-in:</strong> {selectedApplication.check_in_date}</p>
            <p><strong>Duration:</strong> {selectedApplication.duration}</p>
            <p><strong>Reservation (Unit Code):</strong> {selectedApplication.reservation_details}</p>

            <button onClick={() => handleAccept(selectedApplication)}>Accept</button>
            <button onClick={() => handleDecline(selectedApplication.id)}>Decline</button>
            <button onClick={handleCloseDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApplications;
