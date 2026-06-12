import React, { useState, useRef } from "react";
import { useZones, useCreateZone, useDeleteZone } from "../hooks/useApiHooks";
import { MapContainer, TileLayer, Polygon, Popup, useMap, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../components/ui/button/Button";
import L from "leaflet";

// Fix for default Leaflet marker icons not showing up in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to dynamically change map center
const MapViewUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default function OrderZone() {
  const { data: zones = [], isLoading } = useZones();
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.7196, 75.8577]); // Default: Indore
  const [mapZoom, setMapZoom] = useState<number>(12);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&polygon_geojson=1`);
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const selectArea = (area: any) => {
    setSelectedArea(area);
    setSearchResults([]);
    setSearchQuery(area.display_name);
    if (area.lat && area.lon) {
      setMapCenter([parseFloat(area.lat), parseFloat(area.lon)]);
      setMapZoom(13);
    }
  };

  const handleSaveZone = () => {
    if (!selectedArea || !selectedArea.geojson) return;

    // We can extract a simpler name and city
    const parts = selectedArea.display_name.split(",");
    const name = parts[0].trim();
    const city = parts.length > 1 ? parts[1].trim() : "Unknown";

    createZone.mutate({
      name: name,
      city: city,
      boundary: selectedArea.geojson,
      isActive: true,
    }, {
      onSuccess: () => {
        setSelectedArea(null);
        setSearchQuery("");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Zones Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search for an area (e.g. "Laxmi Nagar, Indore") and select it on the map to define an active delivery zone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar for search and list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold mb-4">Add New Zone</h2>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Search area (e.g. Indore)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2">
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    className="cursor-pointer p-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    onClick={() => selectArea(result)}
                  >
                    {result.display_name}
                  </div>
                ))}
              </div>
            )}

            {selectedArea && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm mb-2">Selected Area:</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4">{selectedArea.display_name}</p>
                <Button 
                  onClick={handleSaveZone} 
                  disabled={createZone.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl"
                >
                  {createZone.isPending ? "Saving..." : "Save as Active Zone"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold mb-4">Active Zones</h2>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading zones...</p>
            ) : zones.length === 0 ? (
              <p className="text-sm text-slate-500">No active zones saved yet.</p>
            ) : (
              <div className="space-y-3">
                {zones.map((zone: any) => (
                  <div key={zone._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{zone.name}</p>
                      <p className="text-xs text-slate-500">{zone.city}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this zone?")) {
                          deleteZone.mutate(zone._id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side for map */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 overflow-hidden" style={{ minHeight: '600px' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%", borderRadius: "12px", zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapViewUpdater center={mapCenter} zoom={mapZoom} />
            
            {/* Draw existing zones */}
            {zones.map((zone: any) => (
               zone.boundary && (
                <GeoJSON 
                  key={zone._id} 
                  data={zone.boundary} 
                  style={{ color: '#10b981', weight: 2, fillOpacity: 0.2 }}
                >
                  <Popup>
                    <strong>{zone.name}</strong><br/>
                    {zone.city}
                  </Popup>
                </GeoJSON>
               )
            ))}

            {/* Draw currently selected preview area */}
            {selectedArea && selectedArea.geojson && (
              <GeoJSON 
                key={`preview-${selectedArea.place_id}`} 
                data={selectedArea.geojson} 
                style={{ color: '#3b82f6', weight: 3, fillOpacity: 0.4, dashArray: '5, 5' }}
              >
                <Popup>Preview: {selectedArea.display_name}</Popup>
              </GeoJSON>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
