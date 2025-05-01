import { Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAllFees, useAssignFees } from '@/hooks/useFees'
import { GRADES } from '@/lib/constants'
import Select from 'react-select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function AssignFeesModal({ isOpen, onClose, studentId, studentGrade }) {
  const [selectedFees, setSelectedFees] = useState([])
  const [dueDate, setDueDate] = useState('')
  
  const { data: fees, isLoading } = useAllFees()
  const assignFees = useAssignFees(studentId)

  // If a fee has grades specified, filter by them, otherwise show all fees
  const filteredFees = fees?.filter(fee => 
    !fee.grades || fee.grades.includes(studentGrade)
  ) || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (selectedFees.length === 0) {
      toast.error("Please select at least one fee")
      return
    }

    if (!dueDate) {
      toast.error("Please select a due date")
      return
    }

    // Show loading toast
    const loadingToast = toast.loading("Assigning fees...")

    try {
      const promises = selectedFees.map(fee => 
        assignFees.mutateAsync({
          feeId: fee.value,
          dueDate: new Date(dueDate)
        })
      )
      
      await Promise.all(promises)
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Fees assigned successfully", {
        description: `${selectedFees.length} fee${selectedFees.length > 1 ? 's' : ''} assigned`
      })

      // Reset form and close modal
      onClose()
      setSelectedFees([])
      setDueDate('')
      window.location.reload()
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast)
      toast.error("Failed to assign fees", {
        description: error.message || "Please try again or contact support"
      })
    }
  }

  return (
    <Dialog
      as="div"
      className="relative z-10"
      open={isOpen}
      onClose={onClose}
    >
      <div className="fixed inset-0 bg-black/25" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Assign Fees
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Fees
                </label>
                <Select
                  isMulti
                  isLoading={isLoading}
                  options={filteredFees.map(fee => ({
                    value: fee.id,
                    label: `${fee.name} - ₦${fee.amount.toLocaleString()}`
                  }))}
                  onChange={setSelectedFees}
                  className="mt-1"
                  placeholder="Search fees..."
                  isDisabled={assignFees.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  disabled={assignFees.isPending}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                />
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={assignFees.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={selectedFees.length === 0 || !dueDate || assignFees.isPending}
                >
                  {assignFees.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Fees'
                  )}
                </Button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
} 