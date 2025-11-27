import "@tomtom-international/web-sdk-maps/dist/maps.css";
import tt, * as ttmaps from "@tomtom-international/web-sdk-maps";
import { useState, useEffect, useRef } from "react";
import { create } from "domain";

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
  const [isHovering, setIsHovering] = useState(false);
  const idRef = useRef(4);

  const getSnapFunction = async (roadSnap: any[]) => {
    console.log("curr road snap", roadSnap);
    if (!roadSnap) {
      return;
    }
    let layerId = idRef.current++;
    if (!map) {
      return;
    }

    roadSnap.forEach((item) => {
      if (!item) {
        return;
      }

      const segmentSpeed = item.properties.speedProfile.value;
      const speedLimit = item.properties.speedLimits.value;

      const color = (segmentSpeed / speedLimit > 0.9) ? "#008000" : ( segmentSpeed / speedLimit > 0.5 ? "#ff9900" : "#ff0000")

      const idString = "id_" + layerId.toString();
      map.addLayer({
        id: idString,
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
          "line-color": color,
          "line-width": 4,
        },
      });

      // Reuse a single popup instance for hover
      const hoverPopup: tt.Popup = new tt.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 15,
      });
      let activePopup = null;

      // --- A. Hover Logic (Non-persistent tooltip) ---
      map.on("mousemove", idString, (e) => {
        // Check if we already have a persistent popup from a click
        if (activePopup && (activePopup as any).isOpen()) return;

        setIsHovering(true);
        map.getCanvas().style.cursor = "pointer";
        const coords = e.lngLat;

        const content = `
            <div class="font-bold">${item.properties.speedProfile.value} km/h</div>
            
        `;

        hoverPopup.setLngLat(coords).setHTML(content).addTo(map);
      });

      // Remove hover popup and reset cursor when mouse leaves the line layer
      map.on("mouseleave", idString, () => {
        setIsHovering(false);
        map.getCanvas().style.cursor = "";
        // Only close the hover popup if no persistent popup is active
        if (!activePopup || !(activePopup as any).isOpen()) {
          hoverPopup.remove();
        }
      });

      // Reset cursor and close hover popup when mouse leaves the entire map
      map.on("mouseout", () => {
        setIsHovering(false);
        map.getCanvas().style.cursor = "";
        if (!activePopup || !(activePopup as any).isOpen()) {
          hoverPopup.remove();
        }
      });
      layerId = idRef.current++;
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

    createdMap.once("load", () => {
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
    });

    return () => {
      console.log("Cleaning up map instance...");
      markers.forEach((m) => m.remove());
      if (createdMap) {
        createdMap.remove();
      }
    };
  }, [mapElement]);

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
