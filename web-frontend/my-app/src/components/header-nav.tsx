import React from "react";

export type HeaderNavProps = {
  onHomeClick?: () => void;
  onCameraClick?: () => void;
  onHelpClick?: () => void;
};

export function HeaderNav({ onHomeClick, onCameraClick, onHelpClick }: HeaderNavProps) {
  return (
    <div className="navbar">
      <img className="branding" src="/images/LogoNOWRITING.png"/>
      <button id="home" type="button" onClick={onHomeClick}>
        Home
      </button>
      <button id="camera" type="button" onClick={onCameraClick}>
        Camera
      </button>
      <button id="help" type="button" onClick={onHelpClick}>
        Help
      </button>
      <img className="branding" src="/images/LogoNOWRITING.png"/>
    </div>
  );
}
