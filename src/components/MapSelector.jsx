import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationMarker = ({ onMapClick }) => {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={position}>
    </Marker>
  ) : null;
};

const MapSelector = ({ onMapClick }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="map-placeholder">Loading map...</div>;
  }

  return (
    <div className="map-selector">
      <h3 className="map-title">Click anywhere on the map to get weather</h3>
      <div className="map-container">
        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="map-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onMapClick={onMapClick} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSelector;