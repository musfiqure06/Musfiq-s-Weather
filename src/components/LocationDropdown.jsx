import React, { useState, useEffect } from 'react';
import bangladeshLocations from '../data/bangladesh_locations.json';

const LocationDropdown = ({ onSelect }) => {
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [grams, setGrams] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedThana, setSelectedThana] = useState('');
  const [selectedGram, setSelectedGram] = useState('');

  useEffect(() => {
    // Extract unique districts
    const uniqueDistricts = [...new Set(bangladeshLocations.map(loc => loc.district))];
    setDistricts(uniqueDistricts.sort());
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      const filteredThanas = bangladeshLocations
        .filter(loc => loc.district === selectedDistrict)
        .map(loc => loc.thana);
      setThanas([...new Set(filteredThanas)].sort());
      setSelectedThana('');
      setGrams([]);
      setSelectedGram('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrict && selectedThana) {
      const filteredGrams = bangladeshLocations
        .filter(loc => loc.district === selectedDistrict && loc.thana === selectedThana)
        .map(loc => loc.gram);
      setGrams([...new Set(filteredGrams)].sort());
      setSelectedGram('');
    }
  }, [selectedDistrict, selectedThana]);

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const handleThanaChange = (e) => {
    setSelectedThana(e.target.value);
  };

  const handleGramChange = (e) => {
    const gram = e.target.value;
    setSelectedGram(gram);
    
    if (gram) {
      const location = bangladeshLocations.find(
        loc => loc.district === selectedDistrict && 
               loc.thana === selectedThana && 
               loc.gram === gram
      );
      
      if (location) {
        onSelect(location.lat, location.lon, `${location.gram}, ${location.thana}, ${location.district}`);
      }
    }
  };

  return (
    <div className="location-dropdown">
      <h3 className="dropdown-title">Bangladesh Locations</h3>
      <div className="dropdown-grid">
        <div className="dropdown-group">
          <label className="dropdown-label">District</label>
          <select 
            value={selectedDistrict} 
            onChange={handleDistrictChange}
            className="dropdown-select"
          >
            <option value="">Select District</option>
            {districts.map((district, index) => (
              <option key={index} value={district}>{district}</option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label className="dropdown-label">Thana</label>
          <select 
            value={selectedThana} 
            onChange={handleThanaChange}
            disabled={!selectedDistrict}
            className="dropdown-select"
          >
            <option value="">Select Thana</option>
            {thanas.map((thana, index) => (
              <option key={index} value={thana}>{thana}</option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label className="dropdown-label">Gram</label>
          <select 
            value={selectedGram} 
            onChange={handleGramChange}
            disabled={!selectedThana}
            className="dropdown-select"
          >
            <option value="">Select Gram</option>
            {grams.map((gram, index) => (
              <option key={index} value={gram}>{gram}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocationDropdown;