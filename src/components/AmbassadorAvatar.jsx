import React from "react";
import { Link } from "react-router-dom";

// The ambassador object has { id, profileImageUrl, name }
export default function AmbassadorAvatar({ ambassador }) {
  return (
    <Link 
      to={`/ambassador/${ambassador.id}`} 
      className="flex flex-col items-center min-w-[94px]"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <img 
          src={ambassador.profileImageUrl || "/avatar-placeholder.png"} // Use profileImageUrl
          alt={ambassador.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="mt-2 text-sm text-gray-700 text-center">{ambassador.name}</div>
    </Link>
  );
}