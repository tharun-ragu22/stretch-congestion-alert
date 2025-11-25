import "@tomtom-international/web-sdk-maps/dist/maps.css";
import tt, * as ttmaps from "@tomtom-international/web-sdk-maps";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GPSPoint, GPSPointRow } from "@/app/DataTypes";

// client-injected env var (must be prefixed with NEXT_PUBLIC_ to be available in client code)
const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY ?? null;

// --- Type Definitions ---
type LatLon = [number, number];

interface MapDisplayProps {
  intersections: any[];
  initialCenter: LatLon;
  initialZoom: number;
  apiKey: string;
  onMapClick: Function;
}

// --- MapDisplay Component ---
const MapDisplay: React.FC<MapDisplayProps> = ({
  initialCenter,
  initialZoom,
  intersections,
  apiKey,
  onMapClick,
}) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [map, setMap] = useState<ttmaps.Map | null>(null);
  const [markers, setMarkers] = useState<tt.Marker[]>([]);
  const [currId, setCurrId] = useState(4);
  const idRef = useRef(4);

  const getSnapFunction = async (roadSnap: any[]) => {
    console.log("curr road snap", roadSnap);
    if (!roadSnap){
        return;
    }
    const layerId = idRef.current++;
    if (!map) {
      return;
    }
    roadSnap.forEach((item) => {
      if (!item) {
        return;
      }
      map.addLayer({
        id: "jermainecole" + layerId.toString(),
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: item.geometry.coordinates,
                },
              },
            ],
          },
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#ff0000",
          "line-width": 2,
        },
      });
      setCurrId((id) => id + 1);
    });
  };

  useEffect(() => {
    if (!mapElement.current) {
      return;
    }
    let createdMap = ttmaps.map({
      key: apiKey,
      container: mapElement.current,
      center: initialCenter,
      zoom: mapZoom,
    });

    createdMap.on("click", function (e) {
      var marker = new tt.Marker().setLngLat(e.lngLat);

      // Use the functional update form and perform all logic here
      setMarkers((prevMarkers) => {
        // 1. Calculate the new state value
        const newMarkers = [...prevMarkers, marker];

        // 2. LOGGING FIX: Log the value you just calculated
        console.log("selected markers (inside callback): ", newMarkers);

        // 3. LOGIC FIX: Use the calculated length (newMarkers.length) for conditionals
        if (newMarkers.length <= 2) {
          console.log("2 or less markers selected");
          marker.addTo(createdMap);
        } else {
          console.log("more than 2 markers selected, removing oldest");
          // To remove the oldest, you remove the first element of the PREVIOUS array
          // This ensures we always only show the 2 most recent markers
          prevMarkers.at(-2)!.remove();
          marker.addTo(createdMap);
        }

        const newMarkersState = newMarkers.slice(-2);
        console.log("current markers", newMarkersState);

        // 4. Return the new state array
        return newMarkersState;
      });
      onMapClick(e.lngLat);
    });

    setMap(createdMap);
    return () => createdMap.remove();
  }, []);

  useEffect(() => {
    if (!map) {
      return;
    }

    (async () => {
      for (const gpsRow of intersections) {
        await getSnapFunction(gpsRow);
      }
    })();
  }, [map, intersections]);

  return (
    <div className="App">
      <div ref={mapElement} className="mapDiv h-120 w-full"></div>
    </div>
  );
};

export default MapDisplay;
