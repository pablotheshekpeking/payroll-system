import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/utils/auth";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { accountNumber, bankCode, bankName } = await request.json();
    const { id: employeeId } = params;

    // Check for existing bank account
    const existingAccount = await prisma.bankAccount.findUnique({
      where: { employeeId }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Employee already has a bank account registered" },
        { status: 400 }
      );
    }

    // Verify account with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      return NextResponse.json(
        { error: verifyData.message || "Invalid account details" },
        { status: 400 }
      );
    }

    // Create transfer recipient on Paystack
    const recipientResponse = await fetch(
      'https://api.paystack.co/transferrecipient',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: "nuban",
          name: verifyData.data.account_name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: "NGN"
        })
      }
    );

    const recipientData = await recipientResponse.json();

    if (!recipientResponse.ok || !recipientData.status) {
      return NextResponse.json(
        { error: recipientData.message || "Failed to create transfer recipient" },
        { status: 400 }
      );
    }

    // Save bank account details
    const bankAccount = await prisma.bankAccount.create({
      data: {
        accountNumber,
        accountName: verifyData.data.account_name,
        bankCode,
        bankName,
        currency: "NGN",
        recipientCode: recipientData.data.recipient_code,
        employeeId
      }
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Bank account creation error:", error);
    return NextResponse.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: employeeId } = params;

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { employeeId }
    });

    if (!bankAccount) {
      return NextResponse.json(null);
    }

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("Error fetching bank account:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank account" },
      { status: 500 }
    );
  }
} 