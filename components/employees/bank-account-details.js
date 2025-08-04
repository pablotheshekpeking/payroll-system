"use client";

import { useEmployeeBankAccount } from "@/hooks/use-bank-accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, Building2, Hash } from "lucide-react";

export function BankAccountDetails({ employeeId }) {
  const { data: bankAccount, isLoading, error } = useEmployeeBankAccount(employeeId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load bank account details. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!bankAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No bank account found for this employee. Please add a bank account to enable payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Account Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Bank Name
              </div>
              <p className="font-medium">{bankAccount.bankName}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Hash className="h-4 w-4" />
                Bank Code
              </div>
              <p className="font-medium">{bankAccount.bankCode}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Account Number
            </div>
            <p className="font-mono font-medium text-lg">
              {bankAccount.accountNumber}
            </p>
          </div>

          {bankAccount.accountName && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Account Name
              </div>
              <p className="font-medium">{bankAccount.accountName}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Currency
            </div>
            <p className="font-medium">{bankAccount.currency}</p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Added On
            </div>
            <p className="font-medium">
              {new Date(bankAccount.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 