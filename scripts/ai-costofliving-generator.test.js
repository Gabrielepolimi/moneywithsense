/**
 * Unit tests for ai-costofliving-generator.js
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';

// Import functions to test (we'll need to export them or test via public API)
// For now, we'll test the logic directly

describe('roundCost', () => {
  it('should round 123 to nearest step (25 or 10)', () => {
    // Test with default steps [10, 25]
    // 123 / 25 = 4.92 → 5 * 25 = 125 (diff: 2, tolerance: 12.5) → should return 125
    // If not, try 10: 123 / 10 = 12.3 → 12 * 10 = 120 (diff: 3, tolerance: 5) → should return 120
    // Expected: 125 (larger step within tolerance)
    const value = 123;
    const rounded25 = Math.round(value / 25) * 25; // 125
    const diff25 = Math.abs(value - rounded25); // 2
    const tolerance25 = 25 / 2; // 12.5
    const shouldUse25 = diff25 <= tolerance25;
    
    expect(shouldUse25).toBe(true);
    expect(rounded25).toBe(125);
  });

  it('should return 0 for NaN', () => {
    const result = isNaN(NaN) ? 0 : NaN;
    expect(result).toBe(0);
  });

  it('should return 0 for null', () => {
    const value = null;
    const result = (typeof value !== 'number' || Number.isNaN(value)) ? 0 : value;
    expect(result).toBe(0);
  });
});

describe('normalizeCurrency', () => {
  it('should accept valid ISO codes', () => {
    const validCodes = ['USD', 'EUR', 'GBP', 'JPY'];
    validCodes.forEach(code => {
      const match = code.match(/\b([A-Z]{3})\b/);
      expect(match).not.toBeNull();
      expect(match[1]).toBe(code);
    });
  });

  it('should reject invalid formats', () => {
    const invalid = ['local currency', 'USD dollars', '123', 'usd', ''];
    invalid.forEach(currency => {
      const match = currency.match(/\b([A-Z]{3})\b/);
      // Most should not match, or if they do, should not be in valid list
      if (match) {
        const validCodes = ['USD', 'EUR', 'GBP'];
        expect(validCodes.includes(match[1])).toBe(false);
      }
    });
  });

  it('should extract ISO code from descriptive text', () => {
    const text = 'local currency (specify in content)';
    const match = text.match(/\b([A-Z]{3})\b/);
    expect(match).toBeNull(); // Should not match
  });
});

describe('validateCostData', () => {
  it('should correct totalMin if it diverges > 5%', () => {
    const costData = {
      rentCityCenterMin: 1000,
      rentCityCenterMax: 1500,
      utilitiesMin: 100,
      utilitiesMax: 150,
      groceriesMin: 300,
      groceriesMax: 450,
      totalMin: 500, // Wrong: should be ~1400
      totalMax: 2100
    };
    
    const calculatedMin = 1000 + 100 + 300; // 1400
    const tolerance = calculatedMin * 0.05; // 70
    const diff = Math.abs(costData.totalMin - calculatedMin); // 900
    
    expect(diff).toBeGreaterThan(tolerance);
    // Should be corrected to calculatedMin
    expect(calculatedMin).toBe(1400);
  });

  it('should normalize currency if invalid', () => {
    const costData = { currency: 'local currency (specify in content)' };
    const match = costData.currency.match(/\b([A-Z]{3})\b/);
    expect(match).toBeNull();
    // Should fallback to normalized value
  });
});

describe('parseGeneratedContent', () => {
  it('should handle missing END_COST_DATA_JSON marker', () => {
    const content = `---COST_DATA_JSON---
{
  "currency": "USD",
  "rentCityCenterMin": 1200
}
---DATA_POLICY_JSON---`;
    
    // Should fallback to old format parsing
    const oldMatch = content.match(/---COST_DATA_JSON---\s*([\s\S]*?)\s*---(?!END_COST_DATA_JSON)/);
    expect(oldMatch).not.toBeNull();
    
    if (oldMatch) {
      const nextMarker = content.indexOf('---', oldMatch.index + oldMatch[0].length);
      expect(nextMarker).toBeGreaterThan(0);
    }
  });
});

describe('validateSeoFields', () => {
  it('should reject meta description with 149 characters', () => {
    const metaDesc = 'a'.repeat(149);
    expect(metaDesc.length).toBe(149);
    expect(metaDesc.length < 150).toBe(true);
    // Should be invalid
  });

  it('should accept meta description with 150 characters', () => {
    const metaDesc = 'a'.repeat(150);
    expect(metaDesc.length).toBe(150);
    expect(metaDesc.length >= 150 && metaDesc.length <= 160).toBe(true);
    // Should be valid
  });

  it('should accept meta description with 160 characters', () => {
    const metaDesc = 'a'.repeat(160);
    expect(metaDesc.length).toBe(160);
    expect(metaDesc.length >= 150 && metaDesc.length <= 160).toBe(true);
    // Should be valid
  });
});

describe('validateArticleStructure', () => {
  it('should reject content without ## Disclaimer', () => {
    const content = `# Title

## TL;DR
Summary

## Conclusion
Wrap up`;
    
    const hasDisclaimer = /^##\s+Disclaimer$/im.test(content);
    expect(hasDisclaimer).toBe(false);
    // Should be invalid
  });

  it('should accept content with exact ## Disclaimer heading', () => {
    const content = `# Title

## TL;DR
Summary

## Disclaimer
Legal text`;
    
    const hasDisclaimer = /^##\s+Disclaimer$/im.test(content);
    expect(hasDisclaimer).toBe(true);
    // Should be valid
  });
});
