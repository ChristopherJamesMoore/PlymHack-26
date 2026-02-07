import React from "react";

export type ResultsPanelProps = {
  resultsText?: string;
  recyclingCentersText?: string;
};

export function ResultsPanel({
  resultsText = "No results yet.",
  recyclingCentersText = "No centers found yet.",
}: ResultsPanelProps) {
  return (
    <div className="results mt-3">
      <h2>Recognition Results:</h2>
      <p id="resultsText">{resultsText}</p>

      <h2>The nearest recycling centers:</h2>
      <p id="recyclingCenters">{recyclingCentersText}</p>
    </div>
  );
}
