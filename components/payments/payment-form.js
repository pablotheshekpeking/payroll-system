"use client";

import { useForm } from "react-hook-form";
import { useInitiatePayment } from "@/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PaymentForm({ employeeId }) {
  const initiatePayment = useInitiatePayment();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await initiatePayment.mutateAsync({
        employeeId,
        amount: parseFloat(data.amount),
        description: data.description
      });
      reset();
    } catch (error) {
      console.error("Payment initiation failed:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initiate Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0, message: "Amount must be positive" }
              })}
              type="number"
              step="0.01"
              placeholder="Amount"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Textarea
              {...register("description")}
              placeholder="Payment description"
            />
          </div>

          <Button
            type="submit"
            disabled={initiatePayment.isPending}
          >
            {initiatePayment.isPending ? "Processing..." : "Send Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 