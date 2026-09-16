import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type TableName =
  | "rides"
  | "fixed_expenses"
  | "variable_expenses"
  | "fuel_logs"
  | "maintenances"
  | "goals"
  | "custom_modalities";

const ORDER: Record<TableName, { column: string; ascending: boolean }> = {
  rides: { column: "ride_date", ascending: false },
  fixed_expenses: { column: "created_at", ascending: false },
  variable_expenses: { column: "expense_date", ascending: false },
  fuel_logs: { column: "fuel_date", ascending: false },
  maintenances: { column: "service_date", ascending: false },
  goals: { column: "created_at", ascending: false },
  custom_modalities: { column: "created_at", ascending: true },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export function useRows<T extends Row = Row>(table: TableName) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: [table, userId],
    enabled: !!userId,
    queryFn: async () => {
      const order = ORDER[table];
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(order.column, { ascending: order.ascending });
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useSaveRow(table: TableName) {
  const qc = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async (values: Row) => {
      if (!userId) throw new Error("Sessão expirada. Entre novamente.");
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from(table).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert({ ...rest, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Registro salvo");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Registro excluído");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useProfile() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  return useMutation({
    mutationFn: async (values: Row) => {
      if (!userId) throw new Error("Sessão expirada. Entre novamente.");
      const { error } = await supabase
        .from("profiles")
        .upsert({ ...values, id: userId }, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Dados atualizados");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
