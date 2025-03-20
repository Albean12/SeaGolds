import React, { useState, useEffect } from 'react';
import './EventsBoard.css';

const EventsBoard = () => {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ date: '', title: '', description: '' });
    const [editMode, setEditMode] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('https://backend-production-8fda.up.railway.app/api/events', {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                if (response.status === 401) {
                    console.error('Unauthorized. Redirecting to login.');
                    window.location.href = '/login';
                    return;
                }
        
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchEvents();
    }, []);
    
    const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Redirecting to login.');
            window.location.href = '/login';
            return;
        }


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode
            ? `https://backend-production-8fda.up.railway.app/api/events/${editingEventId}`
            : 'https://backend-production-8fda.up.railway.app/api/events';

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(formData),
        });

        setFormData({ date: '', title: '', description: '' });
        setEditMode(false);
        setEditingEventId(null);

        // Refresh events
        const response = await fetch('http://localhost:8000/api/events');
        const data = await response.json();
        setEvents(data);
    };

    // Handle event deletion
    const handleDelete = async (id) => {
        await fetch(`http://localhost:8000/api/events/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    };

    // Handle editing
    const handleEdit = (event) => {
        setFormData({ date: event.date, title: event.title, description: event.description });
        setEditMode(true);
        setEditingEventId(event.id);
    };

    return (
        <div className="events-board">
            <h2>Events Board</h2>
            <form onSubmit={handleSubmit} className="events-form">
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Event Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Description (optional)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <button type="submit">{editMode ? 'Update Event' : 'Add Event'}</button>
            </form>

            <ul className="events-list">
                {Array.isArray(events) && events.length > 0 ? (
                    events.map((event) => (
                        <li key={event.id} className="event-item">
                            <div>
                                <strong>{event.title}</strong>
                                <p>{event.description}</p>
                                <small>{event.date}</small>
                            </div>
                            <div className="event-actions">
                                <button onClick={() => handleEdit(event)}>Edit</button>
                                <button onClick={() => handleDelete(event.id)}>Delete</button>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No events available</p>
                )}
            </ul>
        </div>
    );
};

export default EventsBoard;
