"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const GRADES = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']

const enrollmentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  passportNumber: z.string().min(6, "Invalid passport number"),
  dateOfBirth: z.string(),
  grade: z.enum(GRADES, {
    required_error: "Please select a grade level",
    invalid_type_error: "Please select a valid grade level",
  }),
  documents: z.object({
    passport: z.any(),
    transcript: z.any(),
    birthCertificate: z.any()
  })
})

export default function EnrollmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { edgestore } = useEdgeStore()
  
  const form = useForm({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      passportNumber: "",
      dateOfBirth: "",
      grade: "",
      documents: {}
    }
  })

  async function onSubmit(data) {
    setIsSubmitting(true)
    try {
      // Upload documents to EdgeStore
      const documents = []
      for (const [key, file] of Object.entries(data.documents)) {
        if (file) {
          try {
            const res = await edgestore.publicFiles.upload({
              file,
              options: {
                temporary: false
              },
              onProgressChange: (progress) => {
                console.log(`Upload progress: ${progress}%`)
              },
            })
            documents.push({
              type: key,
              fileName: file.name,
              url: res.url
            })
          } catch (uploadError) {
            throw new Error(`Failed to upload ${key}: ${uploadError.message}`)
          }
        }
      }

      // Create enrollment request with properly formatted grade
      const response = await fetch("/api/enrollment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          grade: data.grade.toUpperCase(), // Ensure grade is in uppercase
          documents
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit enrollment")
      }

      toast.success("Enrollment submitted successfully! Please wait for approval.")
      form.reset()
      router.push("/")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8 shadow-lg bg-white rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Enrollment Application</h1>
          <p className="mt-2 text-gray-600">Please fill out all required information and upload necessary documents</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  {...form.register("firstName")}
                  className="w-full rounded-lg border-gray-300"
                  placeholder="Enter first name"
                  disabled={isSubmitting}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  {...form.register("lastName")}
                  className="w-full rounded-lg border-gray-300"
                  placeholder="Enter last name"
                  disabled={isSubmitting}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input
                {...form.register("email")}
                type="email"
                className="w-full rounded-lg border-gray-300"
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Passport Number</label>
                <Input
                  {...form.register("passportNumber")}
                  className="w-full rounded-lg border-gray-300"
                  placeholder="Enter passport number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <Input
                  {...form.register("dateOfBirth")}
                  type="date"
                  className="w-full rounded-lg border-gray-300"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Grade Level</label>
              <Select
                onValueChange={(value) => form.setValue("grade", value)}
                defaultValue={form.getValues("grade")}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full rounded-lg border-gray-300">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem 
                      key={grade} 
                      value={grade}
                      className="cursor-pointer"
                    >
                      {grade.replace(/([A-Z])(\d)/, '$1 $2')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.grade && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.grade.message}
                </p>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-800">Required Documents</h2>
              <p className="mt-1 text-sm text-gray-600">Please upload clear, legible copies of all required documents</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <label className="text-sm font-medium text-gray-700">Passport Photo</label>
                <Input
                  type="file"
                  accept="image/*"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue("documents.passport", e.target.files[0])
                  }}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Accepted formats: JPG, PNG (Max: 5MB)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <label className="text-sm font-medium text-gray-700">Academic Transcript</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue("documents.transcript", e.target.files[0])
                  }}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (Max: 5MB)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <label className="text-sm font-medium text-gray-700">Birth Certificate</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full"
                  onChange={(e) => {
                    form.setValue("documents.birthCertificate", e.target.files[0])
                  }}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max: 5MB)</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Application...
              </div>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
} 