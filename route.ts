import { NextRequest, NextResponse } from "next/server";
import { processDemoPayment } from "@/services/paymentService";
import { generatePrintReadyPDF, savePrintFile } from "@/services/designEngine";
import { generateOrderNumber } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// In-memory store for demo (replace with Prisma in full version)
const orders: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selectedDesign, tapeWidth, finish, quantity = 1, price = 99 } = body;

    if (!selectedDesign) {
      return NextResponse.json({ error: "No design selected" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const orderId = uuidv4();

    // Process demo payment
    const payment = await processDemoPayment(price, orderId);

    // Parse width
    const widthMatch = (tapeWidth || "1.5 inch").match(/([\d.]+)/);
    const tapeWidthInches = widthMatch ? parseFloat(widthMatch[1]) : 1.5;

    // Generate print-ready PDF
    const { pdfBytes, fileName } = await generatePrintReadyPDF({
      design: selectedDesign,
      tapeWidthInches,
      orderNumber,
      designId: selectedDesign.id,
    });

    const printFileUrl = await savePrintFile(pdfBytes, fileName);

    const order = {
      id: orderId,
      orderNumber,
      selectedDesign,
      tapeWidth,
      finish: finish || selectedDesign.finish,
      quantity,
      price,
      paymentStatus: payment.status,
      paymentId: payment.paymentId,
      productionStatus: "READY_FOR_PRINT",
      shippingStatus: "NOT_SHIPPED",
      printFileUrl,
      createdAt: new Date().toISOString(),
    };

    orders.push(order);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order error:", error);
    return NextResponse.json({ error: error.message || "Order failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ orders });
}
