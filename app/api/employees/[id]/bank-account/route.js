import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/utils/auth";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { accountNumber, bankCode, bankName } = await request.json()
    const { id: employeeId } = await params // Fix: await the params

    // Check for existing bank account
    const existingAccount = await prisma.bankAccount.findUnique({
      where: {
        employeeId: employeeId
      }
    })

    if (existingAccount) {
      return Response.json(
        { error: "Employee already has a bank account" },
        { status: 400 }
      )
    }

    // Create new bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        accountNumber,
        bankCode,
        bankName,
        employeeId: employeeId
      }
    })

    return Response.json(bankAccount)
  } catch (error) {
    console.error("Failed to create bank account:", error)
    return Response.json(
      { error: "Failed to create bank account" },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: employeeId } = await params; // Fix: await the params

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