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
      automation_rules: {
        Row: {
          approved_at: string
          approved_by: string
          channel: Database["public"]["Enums"]["notification_channel"]
          conditions: Json
          created_at: string
          id: string
          is_active: boolean
          message_template: string
          name: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          pharmacy_id: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          approved_at?: string
          approved_by: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          message_template: string
          name: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          pharmacy_id: string
          trigger_type: string
          updated_at?: string
        }
        Update: {
          approved_at?: string
          approved_by?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          message_template?: string
          name?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          pharmacy_id?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_rules_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ai_generated: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          pharmacy_id: string
          scheduled_at: string | null
          status: string
          target_segment: Json
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pharmacy_id: string
          scheduled_at?: string | null
          status?: string
          target_segment?: Json
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          pharmacy_id?: string
          scheduled_at?: string | null
          status?: string
          target_segment?: Json
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          birth_date: string | null
          consent_recorded_at: string | null
          consent_source: string | null
          cpf: string | null
          created_at: string
          email: string | null
          external_id: string | null
          gender: string | null
          id: string
          last_purchase_at: string | null
          name: string
          opted_out_at: string | null
          orders_count: number
          pharmacy_id: string
          phone: string
          preferred_channel: string
          status: string
          total_spent: number
          updated_at: string
          vip_level: string
          whatsapp_consent: boolean
        }
        Insert: {
          birth_date?: string | null
          consent_recorded_at?: string | null
          consent_source?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          gender?: string | null
          id?: string
          last_purchase_at?: string | null
          name: string
          opted_out_at?: string | null
          orders_count?: number
          pharmacy_id: string
          phone: string
          preferred_channel?: string
          status?: string
          total_spent?: number
          updated_at?: string
          vip_level?: string
          whatsapp_consent?: boolean
        }
        Update: {
          birth_date?: string | null
          consent_recorded_at?: string | null
          consent_source?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          external_id?: string | null
          gender?: string | null
          id?: string
          last_purchase_at?: string | null
          name?: string
          opted_out_at?: string | null
          orders_count?: number
          pharmacy_id?: string
          phone?: string
          preferred_channel?: string
          status?: string
          total_spent?: number
          updated_at?: string
          vip_level?: string
          whatsapp_consent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "customers_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_configs: {
        Row: {
          config: Json
          created_at: string
          driver_type: Database["public"]["Enums"]["driver_type"]
          erp_vendor: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          pharmacy_id: string
          priority: number
          secret_ref: string | null
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          driver_type: Database["public"]["Enums"]["driver_type"]
          erp_vendor?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          pharmacy_id: string
          priority: number
          secret_ref?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          driver_type?: Database["public"]["Enums"]["driver_type"]
          erp_vendor?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          pharmacy_id?: string
          priority?: number
          secret_ref?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_configs_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          automation_rule_id: string | null
          campaign_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          customer_id: string | null
          error_message: string | null
          id: string
          payload: Json
          pharmacy_id: string
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          automation_rule_id?: string | null
          campaign_id?: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          payload?: Json
          pharmacy_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          automation_rule_id?: string | null
          campaign_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          customer_id?: string | null
          error_message?: string | null
          id?: string
          payload?: Json
          pharmacy_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          timezone: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          timezone?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          timezone?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active_ingredient: string | null
          created_at: string
          default_repurchase_days: number | null
          external_id: string | null
          id: string
          is_continuous_use: boolean
          name: string
          pharmacy_id: string
          updated_at: string
        }
        Insert: {
          active_ingredient?: string | null
          created_at?: string
          default_repurchase_days?: number | null
          external_id?: string | null
          id?: string
          is_continuous_use?: boolean
          name: string
          pharmacy_id: string
          updated_at?: string
        }
        Update: {
          active_ingredient?: string | null
          created_at?: string
          default_repurchase_days?: number | null
          external_id?: string | null
          id?: string
          is_continuous_use?: boolean
          name?: string
          pharmacy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          pharmacy_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          pharmacy_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          pharmacy_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          pharmacy_id: string
          product_id: string | null
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          pharmacy_id: string
          product_id?: string | null
          quantity?: number
          sale_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          pharmacy_id?: string
          product_id?: string | null
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          external_id: string | null
          id: string
          items_count: number
          payment_method: string | null
          pharmacy_id: string
          sale_date: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          items_count?: number
          payment_method?: string | null
          pharmacy_id: string
          sale_date?: string
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          external_id?: string | null
          id?: string
          items_count?: number
          payment_method?: string | null
          pharmacy_id?: string
          sale_date?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_runs: {
        Row: {
          created_at: string
          error_details: Json | null
          finished_at: string | null
          id: string
          integration_config_id: string
          pharmacy_id: string
          records_failed: number
          records_processed: number
          source_file_name: string | null
          started_at: string
          status: Database["public"]["Enums"]["sync_run_status"]
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          integration_config_id: string
          pharmacy_id: string
          records_failed?: number
          records_processed?: number
          source_file_name?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_run_status"]
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          finished_at?: string | null
          id?: string
          integration_config_id?: string
          pharmacy_id?: string
          records_failed?: number
          records_processed?: number
          source_file_name?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["sync_run_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sync_runs_integration_config_id_fkey"
            columns: ["integration_config_id"]
            isOneToOne: false
            referencedRelation: "integration_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_runs_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_my_pharmacy: {
        Args: { pharmacy_name: string }
        Returns: Database["public"]["Tables"]["pharmacies"]["Row"]
      }
      current_pharmacy_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      current_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      driver_type:
        | "official_api"
        | "automated_export"
        | "readonly_db"
        | "nfce_xml"
        | "rpa_ui"
      integration_status: "not_configured" | "active" | "paused" | "error"
      notification_channel: "whatsapp" | "push"
      notification_status: "pending" | "sent" | "delivered" | "read" | "failed"
      notification_type: "cashback" | "promo" | "reminder"
      sync_run_status: "running" | "success" | "partial" | "failed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      driver_type: [
        "official_api",
        "automated_export",
        "readonly_db",
        "nfce_xml",
        "rpa_ui",
      ],
      integration_status: ["not_configured", "active", "paused", "error"],
      notification_channel: ["whatsapp", "push"],
      notification_status: ["pending", "sent", "delivered", "read", "failed"],
      notification_type: ["cashback", "promo", "reminder"],
      sync_run_status: ["running", "success", "partial", "failed"],
    },
  },
} as const
