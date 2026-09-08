export interface PrintJobRequest {
  orderId: string;
  filePath: string;
  copies?: number;
  mediaType?: string;
}

export interface PrintJobStatus {
  jobId: string;
  status: "QUEUED" | "PRINTING" | "COMPLETED" | "FAILED" | "CANCELLED";
  message?: string;
  progress?: number;
}

export interface PrinterAdapter {
  name: string;
  submitPrintJob(request: PrintJobRequest): Promise<PrintJobStatus>;
  getPrintStatus(jobId: string): Promise<PrintJobStatus>;
  cancelPrintJob(jobId: string): Promise<boolean>;
  getPrinterStatus(): Promise<{ online: boolean; message: string }>;
  getSupportedMedia(): string[];
  getSupportedWidths(): number[];
}

// Demo A4 Printer Adapter
export class DemoA4Printer implements PrinterAdapter {
  name = "DemoA4Printer";

  private jobs = new Map<string, PrintJobStatus>();

  async submitPrintJob(request: PrintJobRequest): Promise<PrintJobStatus> {
    const jobId = `A4JOB_${Date.now()}`;
    const status: PrintJobStatus = {
      jobId,
      status: "QUEUED",
      message: "Job received by Demo A4 Printer. File ready for local print.",
      progress: 0,
    };
    this.jobs.set(jobId, status);

    // Simulate processing
    setTimeout(() => {
      const s = this.jobs.get(jobId);
      if (s) {
        s.status = "PRINTING";
        s.progress = 40;
        s.message = "Sending to system print queue (simulated)...";
      }
    }, 1000);

    setTimeout(() => {
      const s = this.jobs.get(jobId);
      if (s) {
        s.status = "COMPLETED";
        s.progress = 100;
        s.message = "Demo print job completed. Download the PDF and print manually on your A4 printer.";
      }
    }, 2500);

    return status;
  }

  async getPrintStatus(jobId: string): Promise<PrintJobStatus> {
    return this.jobs.get(jobId) || {
      jobId,
      status: "FAILED",
      message: "Job not found",
    };
  }

  async cancelPrintJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (job && job.status === "QUEUED") {
      job.status = "CANCELLED";
      return true;
    }
    return false;
  }

  async getPrinterStatus() {
    return {
      online: true,
      message: "Demo A4 Printer is ready. Actual printing requires downloading the PDF and using your OS print dialog.",
    };
  }

  getSupportedMedia() {
    return ["A4", "A4-Glossy", "A4-Matte"];
  }

  getSupportedWidths() {
    return [1, 1.5, 2, 3]; // inches
  }
}

// Future Industrial Printer stub
export class FutureIndustrialPrinter implements PrinterAdapter {
  name = "FutureIndustrialPrinter";

  async submitPrintJob(): Promise<PrintJobStatus> {
    throw new Error("Industrial printer adapter not implemented. Connect RIP / printer controller here.");
  }
  async getPrintStatus(): Promise<PrintJobStatus> {
    throw new Error("Not implemented");
  }
  async cancelPrintJob(): Promise<boolean> {
    return false;
  }
  async getPrinterStatus() {
    return { online: false, message: "Not connected" };
  }
  getSupportedMedia() {
    return [];
  }
  getSupportedWidths() {
    return [];
  }
}

// Service singleton
let currentPrinter: PrinterAdapter = new DemoA4Printer();

export function setPrinterAdapter(adapter: PrinterAdapter) {
  currentPrinter = adapter;
}

export function getPrinterAdapter(): PrinterAdapter {
  return currentPrinter;
}
