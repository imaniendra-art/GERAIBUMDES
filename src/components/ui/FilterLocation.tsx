"use client";

import { LocationSelector } from "./LocationSelector";
import { useState } from "react";

export function FilterLocation({ 
  initialProvince, 
  initialRegency 
}: { 
  initialProvince?: string, 
  initialRegency?: string 
}) {
  const [loc, setLoc] = useState({
    province: initialProvince || "",
    regency: initialRegency || ""
  });

  return (
    <div>
      <LocationSelector 
        onLocationChange={(l) => setLoc({ province: l.provinceName || "", regency: l.regencyName || "" })}
        layout="vertical"
        className="space-y-3"
      />
      {/* Hidden inputs to sync with the parent form */}
      <input type="hidden" name="province" value={loc.province} />
      <input type="hidden" name="regency" value={loc.regency} />
    </div>
  );
}
