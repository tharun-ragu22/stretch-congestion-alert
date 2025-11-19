import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as ttmaps from "@tomtom-international/web-sdk-maps";
import { useState, useEffect, useRef } from "react";

// --- Type Definitions ---
type LatLon = [number, number];

interface MapDisplayProps {
  //   intersections: Intersection[];
  initialCenter: LatLon;
  initialZoom: number;
}

// --- MapDisplay Component ---
const MapDisplay: React.FC<MapDisplayProps> = ({
  initialCenter,
  initialZoom,
}) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [map, setMap] = useState({});

  useEffect(() => {
    if (!mapElement.current) {
      return;
    }
    let map = ttmaps.map({
      key: "8h504Wc4AXL6OPndqhrtKf70AovVBL3V",
      container: mapElement.current,
      center: initialCenter,
      zoom: mapZoom,
    });
    setMap(map);
    return () => map.remove();
  }, []);

  return (
    <div className="App">
      <div ref={mapElement} className="mapDiv h-120 w-full"></div>
    </div>
  );
};

export default MapDisplay;
