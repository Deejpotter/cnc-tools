"use client";

import React, { useState } from 'react';
import calculateStockUsage, { CutRequirement } from './cutOptimizer';

export default function Page() {
  const [kerf, setKerf] = useState<number>(3);
  const [requirementsText, setRequirementsText] = useState<string>('1000:2,500:1');
  const [result, setResult] = useState<any | null>(null);

  const standardLengths = [500, 1000, 1500, 3050];

  function parseRequirements(text: string): CutRequirement[] {
    // simple format: `length:qty,length:qty`
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    const reqs: CutRequirement[] = [];
    for (const part of parts) {
      const [l, q] = part.split(':').map((s) => s.trim());
      const length = Number(l);
      const quantity = Number(q || 1);
      if (Number.isFinite(length) && Number.isInteger(quantity) && quantity > 0) reqs.push({ length, quantity });
    }
    return reqs;
  }

  function onCalculate() {
    try {
      const reqs = parseRequirements(requirementsText);
      const res = calculateStockUsage(reqs, standardLengths, kerf, { setupFeePerLength: 3, perCutFee: 2 });
      setResult(res);
    } catch (err: any) {
      setResult({ error: String(err) });
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Extrusions Calculator (Merged)</h1>

      <label>Kerf (mm): <input type="number" value={kerf} onChange={(e) => setKerf(Number(e.target.value))} /></label>

      <div style={{ marginTop: 12 }}>
        <label>Requirements (format: length:qty, ...)</label>
        <br />
        <input style={{ width: '60%' }} value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} />
        <button style={{ marginLeft: 8 }} onClick={onCalculate}>Calculate</button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          {result.error ? (
            <div style={{ color: 'red' }}>Error: {result.error}</div>
          ) : (
            <>
              <h2>Summary</h2>
              <div>Total Cuts: {result.totalCuts}</div>
              <div>Total Stock Pieces: {result.totalStockPieces}</div>

              <h3>Stock Usage</h3>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr><th style={{ padding: 6 }}>Stock Length</th><th style={{ padding: 6 }}>Quantity</th></tr>
                </thead>
                <tbody>
                  {result.stockUsage.map((s: any) => (
                    <tr key={s.stockLength}><td style={{ padding: 6 }}>{s.stockLength}mm</td><td style={{ padding: 6 }}>{s.quantity}</td></tr>
                  ))}
                </tbody>
              </table>

              {result.costByLength && (
                <>
                  <h3>Cost Breakdown</h3>
                  <table>
                    <thead><tr><th style={{ padding: 6 }}>Stock</th><th style={{ padding: 6 }}>Qty</th><th style={{ padding: 6 }}>Setup</th><th style={{ padding: 6 }}>Cuts</th><th style={{ padding: 6 }}>Cut Cost</th><th style={{ padding: 6 }}>Total</th></tr></thead>
                    <tbody>
                      {result.costByLength.map((c: any) => (
                        <tr key={c.stockLength}><td style={{ padding: 6 }}>{c.stockLength}mm</td><td style={{ padding: 6 }}>{c.quantity}</td><td style={{ padding: 6 }}>${c.setupFee}</td><td style={{ padding: 6 }}>{c.totalCuts}</td><td style={{ padding: 6 }}>${c.cuttingCost}</td><td style={{ padding: 6 }}>${c.totalCost}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 8 }}><strong>Totals:</strong> Setup ${result.totalSetupFees} · Cut ${result.totalCuttingCosts} · Grand ${result.totalCost}</div>
                </>
              )}

              <h3>Warehouse Instructions</h3>
              <ol>
                {result.patterns.map((p: any, i: number) => (
                  <li key={i}>{p.stockLength}mm x1: {p.cuts.join('mm, ')}mm</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
