"use client";

import { ReactElement } from "react";
import { CutPattern } from "@/types/20-series-cut-calculator/cutCalculator";
import styles from "./CutCalculator.module.scss";

type CutPatternVisualizationProps = {
  pattern: CutPattern;
};

const COLORS = [
  "#0d6efd", // primary
  "#6610f2", // indigo
  "#6f42c1", // purple
  "#d63384", // pink
  "#dc3545", // danger
  "#fd7e14", // orange
  "#ffc107", // warning
  "#198754", // success
  "#20c997", // teal
  "#0dcaf0", // cyan
];

export default function CutPatternVisualization({
  pattern,
}: CutPatternVisualizationProps): ReactElement {
  const getColorForIndex = (index: number): string => {
    return COLORS[index % COLORS.length];
  };

  return (
    <div className={styles.visualization}>
      <div className={styles.stockBar}>
        {pattern.cuts.map((cut, index) => {
          const widthPercent = (cut / pattern.stockLength) * 100;
          return (
            <div
              key={index}
              className={styles.cutSegment}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: getColorForIndex(index),
              }}
              title={`Cut ${index + 1}: ${cut}mm (${widthPercent.toFixed(1)}%)`}
            >
              <span className={styles.cutLabel}>{cut}mm</span>
            </div>
          );
        })}
        {pattern.waste > 0 && (
          <div
            className={`${styles.cutSegment} ${styles.wasteSegment}`}
            style={{
              width: `${(pattern.waste / pattern.stockLength) * 100}%`,
              backgroundColor: "#6c757d",
            }}
            title={`Waste: ${pattern.waste}mm (${(
              (pattern.waste / pattern.stockLength) *
              100
            ).toFixed(1)}%)`}
          >
            <span className={styles.cutLabel}>Waste</span>
          </div>
        )}
      </div>
    </div>
  );
}
