import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { useCreateStudent } from "@/hooks/useStudents"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CreateStudentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    grade: ""
  })

  const createStudent = useCreateStudent()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    // Date of birth validation
    const dob = new Date(formData.dateOfBirth)
    const today = new Date()
    const age = today.getFullYear() - dob.getFullYear()
    if (age < 10 || age > 20) {
      toast.error("Student age must be between 10 and 20 years")
      return
    }

    // Show loading toast
    const loadingToast = toast.loading("Creating student account...")

    try {
      await createStudent.mutateAsync(formData)
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Student created successfully", {
        description: `${formData.firstName} ${formData.lastName} has been enrolled.`
      })

      // Reset form and close modal
      onClose()
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        dateOfBirth: "",
        grade: ""
      })
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      
      // Handle specific errors
      if (error.message?.includes("Email already exists")) {
        toast.error("Email already in use", {
          description: "Please try a different email address."
        })
      } else {
        toast.error("Failed to create student", {
          description: "Please try again or contact support if the problem persists."
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
          <DialogDescription>
            Create a new student account. The student will be able to log in using their email and password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                First Name
              </label>
              <Input
                required
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Last Name
              </label>
              <Input
                required
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              type="email"
              required
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Date of Birth
            </label>
            <Input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Grade
            </label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData({ ...formData, grade: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade.replace(/([A-Z]+)(\d)/, '$1 $2')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createStudent.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createStudent.isPending}
            >
              {createStudent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 