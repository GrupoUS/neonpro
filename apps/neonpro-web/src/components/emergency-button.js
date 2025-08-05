"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyButton = EmergencyButton;
var react_1 = require("react");
function EmergencyButton() {
  var handleEmergencyCall = function () {
    window.open("tel:192", "_self");
  };
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleEmergencyCall}
        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 animate-pulse"
        title="Emergência Médica - SAMU 192"
        aria-label="Ligar para SAMU 192"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
        >
          <path
            d="M19.95 21C17.8 21 15.74 20.42 13.77 19.27C11.8 18.12 10.08 16.5 8.73 14.23C7.38 11.96 6.8 9.9 6.8 7.95C6.8 7.45 6.95 7 7.25 6.65C7.55 6.3 7.95 6.05 8.45 5.9L10.4 5.2C10.75 5.1 11.1 5.15 11.4 5.35C11.7 5.55 11.9 5.85 12 6.25L12.8 9.3C12.9 9.65 12.85 10 12.65 10.3C12.45 10.6 12.15 10.8 11.8 10.9L10.2 11.45C10.9 12.9 11.9 14.1 13.2 15.05L13.75 13.45C13.85 13.1 14.05 12.8 14.35 12.6C14.65 12.4 15 12.35 15.35 12.45L18.4 13.25C18.8 13.35 19.1 13.55 19.3 13.85C19.5 14.15 19.55 14.5 19.45 14.85L18.75 16.8C18.6 17.3 18.35 17.7 18 18C17.65 18.3 17.2 18.45 16.7 18.45C16.7 18.45 16.7 18.45 16.7 18.45H19.95V21Z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">SAMU 192</span>
      </button>
    </div>
  );
}
