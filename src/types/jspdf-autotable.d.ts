declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: Record<string, any>;
    bodyStyles?: Record<string, any>;
    columnStyles?: Record<string, any>;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    styles?: Record<string, any>;
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  export default autoTable;
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
