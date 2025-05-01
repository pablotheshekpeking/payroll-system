"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useStudent } from "@/hooks/useStudent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GRADES } from "@/lib/constants"
import { format, parseISO } from "date-fns"
import { AssignFeesModal } from "@/components/AssignFeesModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Edit, Plus } from "lucide-react"
import { toast } from "sonner"

export default function StudentDetailsPage() {
  const { id } = useParams()
  const {
    student,
    isLoading,
    error,
    updateStudent,
    assignFee,
    downloadDocument,
    isUpdating,
    isAssigningFee
  } = useStudent(id)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isAssignFeesModalOpen, setIsAssignFeesModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  const handleEdit = () => {
    setEditData({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      dateOfBirth: format(parseISO(student.dateOfBirth), "yyyy-MM-dd"),
      enrollmentStatus: student.enrollment?.status || "PENDING"
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const formattedData = {
        ...editData,
        dateOfBirth: new Date(editData.dateOfBirth).toISOString()
      }
      await updateStudent(formattedData)
      setIsEditing(false)
      toast.success("Student information updated successfully")
    } catch (error) {
      console.error("Failed to update student:", error)
      toast.error("Failed to update student information")
    }
  }

  return (
    <div className="space-y-8 p-8">
      {/* Student Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Student Information</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>Save</Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade</label>
                  <Select
                    value={editData.grade}
                    onValueChange={(value) => setEditData({ ...editData, grade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={editData.dateOfBirth}
                    onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enrollment Status</label>
                  <Select
                    value={editData.enrollmentStatus}
                    onValueChange={(value) => setEditData({ ...editData, enrollmentStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <Badge variant="secondary">{student.grade}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(new Date(student.dateOfBirth), "PP")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{student.user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Enrollment Status</p>
                  <Badge variant={
                    student.enrollment?.status === "APPROVED" 
                      ? "success"
                      : student.enrollment?.status === "REJECTED"
                      ? "destructive"
                      : "warning"
                  }>
                    {student.enrollment?.status || "PENDING"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {student.enrollment?.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border p-4">
                <span className="font-medium">{doc.fileName}</span>
                <Button variant="ghost" size="sm" onClick={() => downloadDocument(doc.url)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
            {(!student.enrollment?.documents || student.enrollment.documents.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No documents uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Fees</CardTitle>
          <Button size="sm" onClick={() => setIsAssignFeesModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign New Fee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {student.fees.map((studentFee) => (
              <div key={studentFee.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{studentFee.fee.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(studentFee.dueDate), "PP")}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">₦{studentFee.fee.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Paid: ₦{studentFee.payments.reduce((total, payment) => 
                        total + (payment.status === "PAID" ? payment.amount : 0), 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!student.fees || student.fees.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No fees assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      <AssignFeesModal
        isOpen={isAssignFeesModalOpen}
        onClose={() => setIsAssignFeesModalOpen(false)}
        studentId={id}
        studentGrade={student.grade}
      />
    </div>
  )
} 