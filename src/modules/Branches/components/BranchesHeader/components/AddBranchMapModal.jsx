import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./AddBranchMapModal.css";

// Default marker icon fix for CRA/Vite/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const DEFAULT_CENTER = { lat: 41.311081, lng: 69.240562 };
const DEFAULT_ZOOM = 12;

// Get address from OSM Nominatim. Returns address string or fallback.
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
      {
        headers: {
          "User-Agent": "BranchesApp/1.0 (your-email@example.com)"
        }
      }
    );
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    // Try to extract road + suburb or display_name as "manzil"
    let manzil = "";
    if (data.address) {
      const a = data.address;
      if (a.road && a.suburb)
        manzil = `${a.road}, ${a.suburb}`;
      else if (a.road && a.city)
        manzil = `${a.road}, ${a.city}`;
      else if (a.road)
        manzil = a.road;
      else if (a.neighbourhood && a.city)
        manzil = `${a.neighbourhood}, ${a.city}`;
      else if (a.village && a.region)
        manzil = `${a.village}, ${a.region}`;
      else if (a.display_name)
        manzil = a.display_name.split(",").slice(0, 2).join(", ");
      else if (data.display_name)
        manzil = data.display_name.split(",").slice(0, 2).join(", ");
    }
    if (!manzil && data.display_name)
      manzil = data.display_name.split(",").slice(0, 2).join(", ");
    if (!manzil)
      manzil = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    return manzil;
  } catch (e) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    }
  });
  return null;
}

const TASHKENT_CENTER = { lat: 41.311081, lng: 69.240562 };

function parseInitialCoords(value) {
  const lat = Number(value?.latitude);
  const lng = Number(value?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat === 0 && lng === 0) {
    return null;
  }
  return { lat, lng };
}

function isDefaultTashkent(coords) {
  if (!coords) return false;
  return (
    Math.abs(coords.lat - TASHKENT_CENTER.lat) < 0.000001 &&
    Math.abs(coords.lng - TASHKENT_CENTER.lng) < 0.000001
  );
}

export default function AddBranchMapModal({ value, onSelect, onClose }) {
  const initialCoords = parseInitialCoords(value);
  const [marker, setMarker] = useState(initialCoords);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    initialCoords || DEFAULT_CENTER
  );
  const mapRef = useRef();

  useEffect(() => {
    const coords = parseInitialCoords(value);
    const nextMarker =
      coords && !isDefaultTashkent(coords) ? coords : null;

    setMapCenter(coords || DEFAULT_CENTER);
    setMarker(nextMarker);

    if (!nextMarker) {
      setAddress("");
      return;
    }

    setLoading(true);
    reverseGeocode(nextMarker.lat, nextMarker.lng)
      .then((manzil) => setAddress(manzil))
      .finally(() => setLoading(false));
  }, [value?.latitude, value?.longitude]);

  async function handleSelectLocation({ lat, lng }) {
    setMarker({ lat, lng });
    setAddress("");
    setLoading(true);
    const manzil = await reverseGeocode(lat, lng);
    setAddress(manzil);
    setLoading(false);
  }

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapCenter({ lat, lng });
        setMarker({ lat, lng });
        setAddress("");
        const manzil = await reverseGeocode(lat, lng);
        setAddress(manzil);
        setLoading(false);
        // Optionally: flyTo map center, if ref used
        if (mapRef.current) {
          try {
            mapRef.current.setView([lat, lng]);
          } catch {}
        }
      },
      () => {
        setLoading(false);
        alert("Geolokatsiya olishda xatolik.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (marker && address && !loading) {
      onSelect({
        latitude: marker.lat,
        longitude: marker.lng,
        formattedAddress: address,
        manzil: address
      });
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="addbranch-map-inline-block">
      <div className="addbranch-map-actions-top">
        <button
          type="button"
          className="addbranch-map-gps-btn"
          onClick={handleGPS}
        >
          Mening joylashuvim
        </button>
      </div>
      <MapContainer
        key={JSON.stringify(mapCenter)}
        ref={mapRef}
        className="addbranch-map-mapcontainer"
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        style={{ height: 320, width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onMapClick={handleSelectLocation} />
        {marker && <Marker position={marker} />}
      </MapContainer>
      <div className="addbranch-map-location-info">
        <strong>Tanlangan joy:</strong>{" "}
        {loading ? "Manzil aniqlanmoqda..." : address || (marker && `${marker.lat.toFixed(6)}, ${marker.lng.toFixed(6)}`) || "Xaritadan manzilni tanlang."}
      </div>
      <div className="addbranch-map-actions">
        <button
          type="button"
          className="addbranch-map-cancel-btn"
          onClick={handleCancel}
        >
          Bekor qilish
        </button>
        <button
          type="button"
          className="addbranch-map-confirm-btn"
          onClick={handleConfirm}
          disabled={!marker || !address || loading}
        >
          Tasdiqlash
        </button>
      </div>
    </div>
  );
}