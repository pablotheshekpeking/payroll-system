import { create } from "zustand"
import { persist } from "zustand/middleware"

type Employee = {
  id: string
  name: string
  email: string
  position: string
  department: string
  salary: number
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"
}

type Payroll = {
  id: string
  name: string
  payDate: string
  period: string
  totalAmount: number
  employeeCount: number
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "COMPLETED" | "FAILED"
}

interface AppState {
  employees: Employee[]
  payrolls: Payroll[]
  setEmployees: (employees: Employee[]) => void
  setPayrolls: (payrolls: Payroll[]) => void
  addEmployee: (employee: Employee) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  removeEmployee: (id: string) => void
  addPayroll: (payroll: Payroll) => void
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void
  removePayroll: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      employees: [],
      payrolls: [],
      setEmployees: (employees) => set({ employees }),
      setPayrolls: (payrolls) => set({ payrolls }),
      addEmployee: (employee) =>
        set((state) => ({
          employees: [...state.employees, employee],
        })),
      updateEmployee: (id, employee) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...employee } : e)),
        })),
      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),
      addPayroll: (payroll) =>
        set((state) => ({
          payrolls: [...state.payrolls, payroll],
        })),
      updatePayroll: (id, payroll) =>
        set((state) => ({
          payrolls: state.payrolls.map((p) => (p.id === id ? { ...p, ...payroll } : p)),
        })),
      removePayroll: (id) =>
        set((state) => ({
          payrolls: state.payrolls.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "payroll-app-storage",
    },
  ),
)
