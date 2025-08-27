/**
 * QRCode React Placeholder
 * Mocks the QRCodeSVG component for development/build purposes
 */

import React from "react";
import type { ComponentType } from "react";

interface QRCodeSVGProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export const QRCodeSVG: ComponentType<QRCodeSVGProps> = ({
  value,
  size = 256,
}) => {
  return React.createElement(
    "div",
    {
      style: {
        width: size,
        height: size,
        border: "1px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
      },
    },
    React.createElement(
      "span",
      {
        style: { fontSize: "12px", color: "#666" },
      },
      `QR Code: ${value.slice(0, 20)}...`,
    ),
  );
};

export default { QRCodeSVG };
