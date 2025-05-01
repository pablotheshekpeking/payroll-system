"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEdgeStore } from "@/lib/edgestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Upload, ArrowLeft, ArrowRight, User, FileText, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

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
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { edgestore } = useEdgeStore()
  const { theme } = useTheme()
  
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

  const validateStep1 = () => {
    const fields = ['firstName', 'lastName', 'email', 'passportNumber', 'dateOfBirth', 'grade']
    return fields.every(field => {
      const value = form.getValues(field)
      return value && value.length > 0
    })
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    } else {
      form.trigger(['firstName', 'lastName', 'email', 'passportNumber', 'dateOfBirth', 'grade'])
      toast.error("Please fill in all required fields")
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  async function onSubmit(data) {
    setIsSubmitting(true)
    const loadingToast = toast.loading("Submitting your application...")

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

      const response = await fetch("/api/enrollment/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          grade: data.grade.toUpperCase(),
          documents
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit enrollment")
      }

      toast.dismiss(loadingToast)
      toast.success("Application submitted successfully!", {
        description: "We will review your application and get back to you soon."
      })
      form.reset()
      router.push("/")
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Failed to submit application", {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950"
        style={{
          backgroundImage: theme === "dark" 
            ? "radial-gradient(circle at center, rgba(24, 24, 27, 0) 0%, rgba(24, 24, 27, 0.8) 100%), linear-gradient(to bottom right, rgba(49, 46, 129, 0.2) 0%, rgba(76, 29, 149, 0.2) 50%, rgba(15, 23, 42, 0.2) 100%)"
            : "radial-gradient(circle at center, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(to bottom right, rgba(219, 234, 254, 0.4) 0%, rgba(147, 197, 253, 0.4) 50%, rgba(196, 181, 253, 0.4) 100%)"
        }}
      />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto space-y-6 min-h-screen flex flex-col justify-center p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`rounded-full p-2 ${
              step === 1 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted/50 backdrop-blur-sm'
            }`}>
              <User className="h-4 w-4" />
            </div>
            <span className="font-medium">Personal Information</span>
          </div>
          <div className="h-px w-8 bg-muted/50 backdrop-blur-sm" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`rounded-full p-2 ${
              step === 2 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted/50 backdrop-blur-sm'
            }`}>
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-medium">Required Documents</span>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {step === 1 ? "Personal Information" : "Required Documents"}
            </CardTitle>
            <CardDescription>
              {step === 1 
                ? "Please provide your personal details accurately"
                : "Upload the required documents in the specified formats"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passport Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter passport number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade.replace(/([A-Z])(\d)/, '$1 $2')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    <FormItem>
                      <FormLabel>Passport Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => form.setValue("documents.passport", e.target.files[0])}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Accepted formats: JPG, PNG (Max: 5MB)</p>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Academic Transcript</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => form.setValue("documents.transcript", e.target.files[0])}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Accepted formats: PDF, DOC, DOCX (Max: 5MB)</p>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Birth Certificate</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => form.setValue("documents.birthCertificate", e.target.files[0])}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Accepted formats: PDF, JPG, PNG (Max: 5MB)</p>
                    </FormItem>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                type="button"
                className="ml-auto"
                onClick={handleNext}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 