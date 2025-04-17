'use client'
import { useForm } from "react-hook-form";
import { useBanks, useCreateBankAccount } from "@/hooks/use-bank-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function BankAccountForm({ employeeId }) {
  const { data: banks, isLoading: banksLoading } = useBanks();
  const createBankAccount = useCreateBankAccount();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      const selectedBank = banks.find(bank => bank.code === data.bankCode);
      await createBankAccount.mutateAsync({
        employeeId,
        accountData: {
          accountNumber: data.accountNumber,
          bankCode: data.bankCode,
          bankName: selectedBank.name,
          currency: "NGN" // or make this selectable if you support multiple currencies
        }
      });
      reset();
    } catch (error) {
      console.error("Bank account creation failed:", error);
    }
  };

  if (banksLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bank</label>
            <Select
              onValueChange={(value) => {
                const event = { target: { name: "bankCode", value } }
                register("bankCode").onChange(event)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks?.map(bank => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankCode && (
              <p className="text-sm text-destructive">{errors.bankCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Number</label>
            <Input
              {...register("accountNumber", {
                required: "Account number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Invalid account number"
                }
              })}
              type="text"
              placeholder="Enter 10-digit account number"
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={createBankAccount.isPending}
            className="w-full"
          >
            {createBankAccount.isPending ? (
              <>
                <Spinner className="mr-2" size="sm" />
                Adding...
              </>
            ) : (
              "Add Bank Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 