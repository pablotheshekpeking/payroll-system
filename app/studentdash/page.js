import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, CreditCard, GraduationCap, UserCheck } from "lucide-react"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      enrollment: true,
      fees: {
        include: {
          fee: true,
          payments: true
        }
      }
    }
  })

  const totalFees = student.fees.reduce((total, fee) => total + fee.fee.amount, 0)
  const totalPaid = student.fees.reduce((total, fee) => 
    total + fee.payments.reduce((sum, payment) => 
      sum + (payment.status === "PAID" ? payment.amount : 0), 0), 0
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8">
      {/* Welcome Card */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
          Overview
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, {student.firstName}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Manage your academic journey and track your progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
          Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Enrollment Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Enrollment Status
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    {student.grade}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Current Grade
                  </p>
                </div>
                <Badge variant={
                  student.enrollment?.status === "APPROVED" 
                    ? "success" 
                    : "warning"
                }>
                  {student.enrollment ? student.enrollment.status : "Not Enrolled"}
                </Badge>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {student.enrollment?.status === "APPROVED" 
                  ? "Your enrollment has been approved. You have full access to all student features."
                  : "Your enrollment is being processed. You'll be notified once approved."}
              </div>
            </CardContent>
          </Card>

          {/* Fee Overview Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fee Overview
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    ₦{totalFees.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Fees
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">
                    ₦{totalPaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Paid
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={(totalPaid / totalFees) * 100} 
                  className="h-2"
                />
                <p className="mt-2 text-xs text-muted-foreground text-right">
                  {Math.round((totalPaid / totalFees) * 100)}% paid
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fee Summary Section */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground px-1">
          Payment Details
        </h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Summary</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {student.fees.map(studentFee => {
                const paidAmount = studentFee.payments.reduce((total, payment) => 
                  total + (payment.status === "PAID" ? payment.amount : 0), 0
                )
                const paymentPercentage = (paidAmount / studentFee.fee.amount) * 100

                return (
                  <div key={studentFee.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{studentFee.fee.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(studentFee.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₦{studentFee.fee.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid: ₦{paidAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={paymentPercentage} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {Math.round(paymentPercentage)}% complete
                      </p>
                    </div>
                  </div>
                )
              })}
              {student.fees.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No fees have been assigned yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 