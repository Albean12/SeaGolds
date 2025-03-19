import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import LoginModal from "../LoginModal/LoginModal";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmoji) {
      alert("Please select an emoji.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: localStorage.getItem("user_email") || null,
          emoji_rating: selectedEmoji,
          comment: feedbackComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback.");

      alert("Thank you for your feedback!");
      setSelectedEmoji(null);
      setFeedbackComment("");
      setFeedbackSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="home-page">
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={checkAuth}
          mandatory={!isLoggedIn}
        />
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Welcome to Seagold Dormitory</h1>
          <p>Comfort away from Home.</p>
          <div className="button-group">
            <Link to="/gallery" className="btn btn-primary">
              Explore Rooms
            </Link>
            <Link to="/book-tour" className="btn btn-outline-light">
              Book a Tour
            </Link>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities-section">
        <div className="facilities-container">
          <h2 className="text-why">Why Choose Us?</h2>
          <div className="facility-grid">
            <div className="feature-card">
              <img src="/sample1.jpg" alt="Modern facilities" />
              <h3>Modern Facilities</h3>
              <p>State-of-the-art amenities and top-notch services.</p>
            </div>
            <div className="feature-card">
              <img src="/feature2.jpeg" alt="Smart technology" />
              <h3>Smart Technology</h3>
              <p>Smart room controls, high-speed internet, and more.</p>
            </div>
            <div className="feature-card">
              <img src="/feature3.jpeg" alt="Prime location" />
              <h3>Prime Location</h3>
              <p>Located near top universities and public transport.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Universities Section */}
      <section className="seagold-universities">
        <div className="seagold-container">
          <h2 className="seagold-title">Nearby Universities</h2>
          <p className="seagold-subtext">
            Our dormitory is located near top universities, making it the perfect choice for students.
          </p>

          <div className="seagold-university-list">
            {/* University 1 - Text on Left, Image on Right */}
            <div className="seagold-university-item">
              <div className="seagold-university-text">
                <h3>University of Example</h3>
                <p>Just a 10-minute walk from our dormitory.</p>
              </div>
              <div className="seagold-university-image">
                <img src="/images/university1.jpg" alt="University 1" />
              </div>
            </div>

            {/* University 2 - Image on Left, Text on Right */}
            <div className="seagold-university-item seagold-reverse">
            <div className="seagold-university-text">
                <h3>Example State College</h3>
                <p>Accessible by public transport within 15 minutes.</p>
              </div>
              <div className="seagold-university-image">
                <img src="/images/university2.jpg" alt="University 2" />
              </div>
            </div>

            {/* University 3 - Text on Left, Image on Right */}
            <div className="seagold-university-item">
              <div className="seagold-university-text">
                <h3>Tech Institute</h3>
                <p>Located just across the street for easy access.</p>
              </div>
              <div className="seagold-university-image">
                <img src="/images/university3.jpg" alt="University 3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="feedback-form">
        <div className="container">
          <h2 className="text-center">We Value Your Feedback</h2>
          <p className="text-center">How was your experience with Seagold Dormitory?</p>

          {/* Emoji Rating */}
          <div className="emoji-container">
            {["in-love", "happy", "neutral", "sad", "angry"].map((emoji) => (
              <img
                key={emoji}
                src={`http://localhost:8000/storage/icons/${emoji}.gif`}
                alt={emoji}
                className={`emoji ${selectedEmoji === emoji ? "selected" : ""}`}
                onClick={() => setSelectedEmoji(emoji)}
              />
            ))}
          </div>

          {/* Feedback Textbox */}
          <textarea
            className="form-control"
            rows="4"
            placeholder="Leave a comment..."
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
          ></textarea>

          {/* Submit Button */}
          <div className="text-center">
            <button className="btn btn-primary" onClick={handleFeedbackSubmit} disabled={feedbackSubmitted}>
              {feedbackSubmitted ? "Thank You!" : "Submit Feedback"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="text-center">&copy; 2024 Seagold Dormitory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
