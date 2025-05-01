"use client"

import { useState } from "react"
import { useStudents } from "@/hooks/useStudents"
import { useDebounce } from "@/hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { GRADES } from "@/lib/constants"
import Link from "next/link"
import { Plus, Eye } from "lucide-react"
import { CreateStudentModal } from "@/components/student/CreateStudentModal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function StudentsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [grade, setGrade] = useState("ALL")
    const [hasDebt, setHasDebt] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Debounce search to prevent too many API calls
    const debouncedSearch = useDebounce(search, 500)

    const { data, isLoading, error } = useStudents({
        page,
        limit: 10,
        search: debouncedSearch,
        grade: grade === "ALL" ? "" : grade,
        hasDebt
    })

    // Format grade for display
    const formatGrade = (grade) => {
        return grade.replace(/([A-Z]+)(\d)/, '$1 $2')
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Students</h1>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-[400px]"
                    />
                    <Select
                        value={grade}
                        onValueChange={setGrade}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Grades</SelectItem>
                            {GRADES.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                    {formatGrade(grade)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="debt-filter"
                            checked={hasDebt}
                            onCheckedChange={setHasDebt}
                        />
                        <Label htmlFor="debt-filter">Show students with debt</Label>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Enrollment Status</TableHead>
                            <TableHead>Outstanding Debt</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="py-6 text-muted-foreground">Loading students...</div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="py-6 text-destructive">Failed to load students</div>
                                </TableCell>
                            </TableRow>
                        ) : data?.students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="py-6 text-muted-foreground">No students found</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.students.map((student) => {
                                return (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            {student.firstName} {student.lastName}
                                        </TableCell>
                                        <TableCell>{formatGrade(student.grade)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.enrollment?.status === "APPROVED"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {student.enrollment?.status || "Not Enrolled"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-medium ${student.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                ₦{student.debt.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={`/students/${student.id}`}>
                                                  <Eye className="h-4 w-4" /> View Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing page {page} of {data.pagination.pages}
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === data.pagination.pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <CreateStudentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    )
} 