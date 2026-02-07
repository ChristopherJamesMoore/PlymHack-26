import React from "react";

export type HeaderNavProps = {
  onHomeClick?: () => void;
  onCameraClick?: () => void;
};

export function HeaderNav({ onHomeClick, onCameraClick }: HeaderNavProps) {
  return (
    <div className="header d-flex gap-2 align-items-center">
      <button id="home" type="button" className="btn btn-outline-secondary" onClick={onHomeClick}>
        Home
      </button>
      <button id="camera" type="button" className="btn btn-outline-secondary" onClick={onCameraClick}>
        Camera
      </button>
    </div>
  );
}
