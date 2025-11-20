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
  intersections: GPSPointRow[];
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
  onMapClick
}) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [map, setMap] = useState<ttmaps.Map | null>(null);
  const [currId, setCurrId] = useState(4);
  const idRef = useRef(4);

  const getSnapFunction = async (gpsPointRow: GPSPointRow) => {
    const apiUrl = `https://api.tomtom.com/snap-to-roads/1/snap-to-roads?points=${gpsPointRow.beginpoint.y},${gpsPointRow.beginpoint.x};${gpsPointRow.endpoint.y},${gpsPointRow.endpoint.x}&fields={projectedPoints{type,geometry{type,coordinates},properties{routeIndex}},route{type,geometry{type,coordinates},properties{id,speedRestrictions{maximumSpeed{value,unit}}}}}&key=${apiKey}`;
    const layerId = idRef.current++;
    console.log("getting:", apiUrl);
    await axios
      .get(apiUrl)
      .then((res) => {
        console.log("res data:", res.data);
        res.data.route.forEach((item: any) => {
          console.log("item:", item);
          if (!map) {
            return;
          }
          map.addLayer({
            id: layerId.toString(),
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
      })
      .catch((err) => console.log(err));
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
      var marker = new tt.Marker().setLngLat(e.lngLat).addTo(createdMap);
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
