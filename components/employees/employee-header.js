"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { AddEmployeeModal } from "./add-employee-modal"

export function EmployeeHeader() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div className="flex justify-between gap-4 p-4 md:p-0 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">Employees</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        Manage your company's employees and their payroll information.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </div>
            <AddEmployeeModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    )
}