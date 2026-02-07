import React, { ReactNode } from "react";
import { Navigation } from "./navigation";

export type LayoutProps = {
  children: ReactNode;
  onHomeClick?: () => void;
  onCameraClick?: () => void;
  onContactClick?: () => void;
};

export function Layout({ children, onHomeClick, onCameraClick, onContactClick }: LayoutProps) {
  return (
    <>
      <Navigation 
        onHomeClick={onHomeClick}
        onCameraClick={onCameraClick}
        onContactClick={onContactClick}
      />
      <main>
        {children}
      </main>
    </>
  );
}
