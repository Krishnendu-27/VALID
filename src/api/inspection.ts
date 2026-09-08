import { api } from "./api";

export interface InspectionScanPayload {
  front: File;
  back: File;
  side: File;
  productName?: string;
  product_category?: string;
  is_imported?: boolean;
  is_perishable?: boolean;
  pdp_area_cm2?: number;
}

export interface RawOCRBox {
  bbox: number[] | null; // [x_min, y_min, x_max, y_max] or similar
  text: string;
  confidence: number;
  font_height_px?: number;
}

export interface ExtractedFieldSource {
  image?: string;
  filename?: string;
  bbox?: number[] | null;
}

export interface ExtractedField {
  text: string;
  confidence: number;
  source?: ExtractedFieldSource | null;
}

export interface ImageDetail {
  url?: string;
  filename?: string;
  image_dimensions?: { width: number; height: number };
  extracted_fields?: Record<string, string | null>;
  raw_ocr_boxes?: RawOCRBox[];
}

export interface RuleResult {
  ruleCode: string;
  ruleName: string;
  passed: boolean;
  severity: "INFO" | "WARNING" | "ERROR";
  issue: string | null;
  field: string | null;
}

export interface CanvasOverlay {
  image_type?: "front" | "back" | "side" | string;
  bbox: number[]; // normalized [x1, y1, x2, y2]
  type: "VALID" | "VIOLATION" | "REVIEW";
  label: string;
}

export interface Violation {
  code: string;
  rule: string;
  field?: string | null;
  description: string;
  severity: "ERROR" | "WARNING";
}

export interface LegalCitation {
  violationCode: string;
  citation: {
    law: string;
    section: string;
    recommendedAction: string;
  };
}

export interface InspectionHistoryItem {
  inspection_id: string;
  product_name: string;
  date: string;
  status: "COMPLIANT" | "NON-COMPLIANT" | "PROCESSING" | "REVIEW" | string;
  compliance_score: number;
}

export interface EvidenceData {
  inspectionId: string;
  images?: {
    front?: ImageDetail | null;
    back?: ImageDetail | null;
    side?: ImageDetail | null;
  };
  merged_fields?: Record<string, ExtractedField | null>;
  canvasOverlays?: CanvasOverlay[];
  violations?: Violation[];
}

export interface ReportData {
  reportTitle: string;
  generatedAt: string;
  inspection: {
    id: string;
    status: string;
    complianceScore: number;
    createdAt: string;
    updatedAt?: string;
  };
  officer: {
    id: string;
    officerId: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  product: {
    name: string;
    images?: {
      front?: ImageDetail | null;
      back?: ImageDetail | null;
      side?: ImageDetail | null;
    };
    merged_fields?: Record<string, ExtractedField | null>;
  };
  compliance: {
    ruleResults: RuleResult[];
    violations: Violation[];
    legalActionCitations: LegalCitation[];
  };
}

export interface ScanResponseData {
  inspectionId: string;
  complianceScore: number;
  status: string;
  ruleResults: RuleResult[];
  inspection: Record<string, unknown>;
}

export const inspectionApi = {
  /** POST /inspections/scan — upload images, trigger OCR and rules validation */
  scan: (payload: InspectionScanPayload) => {
    const form = new FormData();
    form.append("front", payload.front);
    form.append("back", payload.back);
    form.append("side", payload.side);
    if (payload.productName) form.append("productName", payload.productName);
    if (payload.product_category) form.append("product_category", payload.product_category);
    if (payload.is_imported !== undefined) form.append("is_imported", String(payload.is_imported));
    if (payload.is_perishable !== undefined) form.append("is_perishable", String(payload.is_perishable));
    if (payload.pdp_area_cm2 !== undefined) form.append("pdp_area_cm2", String(payload.pdp_area_cm2));

    return api.post<{ success: boolean; message: string; data: ScanResponseData }>(
      "/inspections/scan",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  /** GET /inspections/:id/evidence — bounding box canvas data & raw OCR */
  getEvidence: (id: string) =>
    api.get<{ success: boolean; data: EvidenceData }>(`/inspections/${id}/evidence`),

  /** GET /inspections/:id/report — full legal inspection certificate */
  getReport: (id: string) =>
    api.get<{ success: boolean; data: ReportData }>(`/inspections/${id}/report`),

  /** GET /inspections/history — officer past inspections */
  getHistory: () =>
    api.get<{ success: boolean; data: InspectionHistoryItem[] }>("/inspections/history"),
};

