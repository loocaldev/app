import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configurar el ícono del marcador
const markerIcon = new L.Icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapView = ({ latitude, longitude }) => {
  if (!latitude || !longitude) {
    return <p>No se encontraron coordenadas para esta dirección.</p>;
  }

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[latitude, longitude]} icon={markerIcon}>
        <Popup>
          Ubicación aproximada: {latitude}, {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
