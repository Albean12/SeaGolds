import React, { useState, useCallback, useEffect } from 'react';
import './Gallery.css';

const Gallery = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories and images from the backend
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backend-production-8fda.up.railway.appapi/gallery'); // No Authorization header
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.images) {
        console.error('Invalid response structure:', data);
        return;
      }
  
      // Group images by category
      const groupedCategories = data.images.reduce((acc, image) => {
        if (!acc[image.category]) {
          acc[image.category] = [];
        }
        acc[image.category].push({
          url: `https://backend-production-8fda.up.railway.appstorage/${image.image_path}`,
          title: image.title,
          description: image.description,
        });
        return acc;
      }, {});
  
      // Transform grouped categories into an array
      const formattedCategories = Object.keys(groupedCategories).map((category) => ({
        category,
        images: groupedCategories[category],
      }));
  
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  

  const openModal = useCallback((category) => {
    setSelectedCategory(category);
    setModalOpen(true);
    setSelectedImages([]);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedCategory(null);
    setSelectedImages([]);
  }, []);

  return (
    <section className="gallery-section">
      <div className="gallery-header-container">
        <h2 className="gallery-header">GALLERY</h2>
        <p className="gallery-description">"Welcome! Your comfort, our priority – take a look around."</p>
      </div>

      {/* Main Category Grid */}
      <div className="category-grid">
        {categories.map((category) => (
          <div
            key={category.category}
            className="category-card"
            onClick={() => openModal(category)}
          >
            <img
              src={category.images[0]?.url}
              alt={category.category}
              className="category-image"
            />
            <div className="category-label">{category.category}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedCategory && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <div className="modal-header">
              <h3>{selectedCategory.category}</h3>
            </div>

            {/* Image Grid */}
            <div className="modal-images-scroll">
              {selectedCategory.images.map((image, index) => (
                <div key={index} className="modal-image-card">
                  <img
                    src={image.url}
                    alt={image.title || `Slide ${index + 1}`}
                    className="modal-image"
                  />
                  {image.title && <p>{image.title}</p>}
                  {image.description && <p>{image.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;