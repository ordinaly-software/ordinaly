"use client";
import { Globe3D, GlobeMarker } from "@/components/ui/3d-globe";

const sevillaMarker: GlobeMarker[] = [
  {
    lat: 37.3891,
    lng: -5.9845,
    src: "/static/icons/sevilla.webp",
    label: "Sevilla",
  }
];

export function GlobeSevilla() {
  return (
    <Globe3D
      markers={sevillaMarker}
      config={{
        atmosphereColor: "#4da6ff",
        atmosphereIntensity: 20,
        bumpScale: 5,
        autoRotateSpeed: 0.3,
      }}
    />
  );
}
