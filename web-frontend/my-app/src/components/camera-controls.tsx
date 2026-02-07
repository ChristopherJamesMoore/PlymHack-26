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
  onCapturePhoto,
  startDisabled,
  stopDisabled,
  captureDisabled,
}: CameraControlsProps) {
  return (
    <div className="controls d-flex gap-2 align-items-center">
      <button
        id="captureBtn"
        type="button"
        className="btn btn-primary"
        onClick={onStartCamera}
        disabled={startDisabled}
      >
        Start Camera
      </button>

      <button
        id="captureBtnStop"
        type="button"
        className="btn btn-outline-danger"
        onClick={onStopCamera}
        disabled={stopDisabled}
      >
        Stop Camera
      </button>

      <button
        id="takePicture"
        type="button"
        className="btn btn-outline-primary"
        onClick={onCapturePhoto}
        disabled={captureDisabled}
      >
        Capture Photo
      </button>
    </div>
  );
}
