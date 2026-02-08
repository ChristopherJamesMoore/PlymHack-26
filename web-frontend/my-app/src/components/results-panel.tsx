import React from "react";

export type ResultsPanelProps = {
  resultsText?: string;
  binText?: string;
  recyclingCentersText?: string;
};

export function ResultsPanel({
  resultsText = "No results yet.",
  binText = "",
  recyclingCentersText = "No centers found yet.",
}: ResultsPanelProps) {
  return (
    <div className="results mt-3">
      <h2>Recognition Results:</h2>
      <p id="resultsText">{resultsText}</p>
      {binText ? <p id="binText">{binText}</p> : null}

      <h2>The nearest recycling centers:</h2>
      <p id="recyclingCenters">{recyclingCentersText}</p>
    </div>
  );
}
