export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      custom_modalities: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      fixed_expenses: {
        Row: {
          active: boolean
          amount: number
          category: string
          created_at: string
          custom_days: number | null
          description: string | null
          due_day: number | null
          id: string
          name: string
          periodicity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount?: number
          category?: string
          created_at?: string
          custom_days?: number | null
          description?: string | null
          due_day?: number | null
          id?: string
          name: string
          periodicity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          category?: string
          created_at?: string
          custom_days?: number | null
          description?: string | null
          due_day?: number | null
          id?: string
          name?: string
          periodicity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          created_at: string
          fuel_date: string
          fuel_type: string
          id: string
          liters: number
          notes: string | null
          odometer: number | null
          payment_method: string | null
          price_per_liter: number
          station: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fuel_date?: string
          fuel_type?: string
          id?: string
          liters?: number
          notes?: string | null
          odometer?: number | null
          payment_method?: string | null
          price_per_liter?: number
          station?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fuel_date?: string
          fuel_type?: string
          id?: string
          liters?: number
          notes?: string | null
          odometer?: number | null
          payment_method?: string | null
          price_per_liter?: number
          station?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          active: boolean
          created_at: string
          goal_type: string
          id: string
          period: string
          scope: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          goal_type?: string
          id?: string
          period?: string
          scope?: string
          target?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          goal_type?: string
          id?: string
          period?: string
          scope?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenances: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          next_service_date: string | null
          next_service_km: number | null
          notes: string | null
          odometer: number | null
          provider: string | null
          service_date: string
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          next_service_date?: string | null
          next_service_km?: number | null
          notes?: string | null
          odometer?: number | null
          provider?: string | null
          service_date?: string
          service_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          next_service_date?: string | null
          next_service_km?: number | null
          notes?: string | null
          odometer?: number | null
          provider?: string | null
          service_date?: string
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apps: string[]
          city: string | null
          created_at: string
          driver_type: string | null
          email: string | null
          fixed_expenses_estimate: number
          full_name: string
          id: string
          modalities: string[]
          odometer: number
          onboarded: boolean
          phone: string | null
          revenue_goal: number
          state: string | null
          updated_at: string
          vehicle_brand: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_year: number | null
          work_days: number
        }
        Insert: {
          apps?: string[]
          city?: string | null
          created_at?: string
          driver_type?: string | null
          email?: string | null
          fixed_expenses_estimate?: number
          full_name?: string
          id: string
          modalities?: string[]
          odometer?: number
          onboarded?: boolean
          phone?: string | null
          revenue_goal?: number
          state?: string | null
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
          work_days?: number
        }
        Update: {
          apps?: string[]
          city?: string | null
          created_at?: string
          driver_type?: string | null
          email?: string | null
          fixed_expenses_estimate?: number
          full_name?: string
          id?: string
          modalities?: string[]
          odometer?: number
          onboarded?: boolean
          phone?: string | null
          revenue_goal?: number
          state?: string | null
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_year?: number | null
          work_days?: number
        }
        Relationships: []
      }
      rides: {
        Row: {
          created_at: string
          destination: string | null
          distance_km: number
          duration_min: number
          fee: number
          gross: number
          id: string
          modality: string
          net: number | null
          notes: string | null
          origin: string | null
          payment_method: string | null
          ride_date: string
          ride_time: string | null
          source_app: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          distance_km?: number
          duration_min?: number
          fee?: number
          gross?: number
          id?: string
          modality?: string
          net?: number | null
          notes?: string | null
          origin?: string | null
          payment_method?: string | null
          ride_date?: string
          ride_time?: string | null
          source_app?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          distance_km?: number
          duration_min?: number
          fee?: number
          gross?: number
          id?: string
          modality?: string
          net?: number | null
          notes?: string | null
          origin?: string | null
          payment_method?: string | null
          ride_date?: string
          ride_time?: string | null
          source_app?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      variable_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_personal: boolean
          modality: string | null
          notes: string | null
          odometer: number | null
          payment_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          is_personal?: boolean
          modality?: string | null
          notes?: string | null
          odometer?: number | null
          payment_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          is_personal?: boolean
          modality?: string | null
          notes?: string | null
          odometer?: number | null
          payment_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
