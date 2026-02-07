import React from "react";

export type NavigationProps = {
  onHomeClick?: () => void;
  onCameraClick?: () => void;
  onContactClick?: () => void;
};

export function Navigation({ onHomeClick, onCameraClick, onContactClick }: NavigationProps) {
  return (
    <header>
      <nav className="navigation">
        <ul>
          <li>
            <a href="index.html" onClick={(e) => { e.preventDefault(); onHomeClick?.(); }}>
              Home
            </a>
          </li>
          <li>
            <a href="camera.html" onClick={(e) => { e.preventDefault(); onCameraClick?.(); }}>
              Camera
            </a>
          </li>
          <li>
            <a href="camera.html" onClick={(e) => { e.preventDefault(); onContactClick?.(); }}>
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
