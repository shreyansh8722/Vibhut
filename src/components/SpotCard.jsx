import React from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Note the new props: image, name, location, and spotId
const SpotCard = ({ image, name, location, spotId }) => {
  return (
    <Link to={`/spot/${spotId}`} className="block">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
        <div className="h-48 w-full overflow-hidden">
          <img
            src={image || "/placeholder-image.jpg"} // Added a fallback
            alt={name}
            className="w-full h-full object-cover rounded-t-2xl"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-1 text-gray-500">
            <MapPin size={16} className="text-yellow-500" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpotCard;