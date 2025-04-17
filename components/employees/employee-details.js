"use client";

import { useEmployee } from "@/hooks/use-employees";
import { BankAccountForm } from "@/components/employees/bank-account-form";
import { PaymentForm } from "@/components/payments/payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function EmployeeDetails({ employeeId }) {
    const { data: employee, isLoading, error } = useEmployee(employeeId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load employee details. {error.message}
                </AlertDescription>
            </Alert>
        );
    }

    if (!employee) {
        return (
            <Alert>
                <AlertDescription>
                    Employee not found.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        {employee.name}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            employee.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {employee.status}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="mt-1">{employee.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Position</label>
                                <p className="mt-1">{employee.position}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Department</label>
                                <p className="mt-1">{employee.department}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Salary</label>
                                <p className="mt-1">${employee.salary.toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <label className="text-sm font-medium text-muted-foreground">Joined</label>
                            <p className="mt-1">
                                {new Date(employee.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="bank">
                <TabsList>
                    <TabsTrigger value="bank">Bank Account</TabsTrigger>
                    <TabsTrigger value="payment">Payments</TabsTrigger>
                </TabsList>
                <TabsContent value="bank">
                    <BankAccountForm employeeId={employeeId} />
                </TabsContent>
                <TabsContent value="payment">
                    <PaymentForm employeeId={employeeId} />
                </TabsContent>
            </Tabs>
        </div>
    );
} 