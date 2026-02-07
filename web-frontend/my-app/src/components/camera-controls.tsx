import React from "react";

export type CameraControlsProps = {
  onStartCamera?: () => void;
  onStopCamera?: () => void;
  onCapturePhoto?: () => void;

  // Optional: allow disabling buttons based on camera state
  startDisabled?: boolean;
  stopDisabled?: boolean;
  captureDisabled?: boolean;
};

export function CameraControls({
  onStartCamera,
  onStopCamera,
  startDisabled,
  stopDisabled,
}: CameraControlsProps) {
  return (
    <div className="controls">
      <button
        id="captureBtn"
        type="button"
        onClick={onStartCamera}
        disabled={startDisabled}
      >
        Start Camera
      </button>

      <button
        id="captureBtnStop"
        type="button"
        onClick={onStopCamera}
        disabled={stopDisabled}
      >
        Stop Camera
      </button>
    </div>
  );
}
