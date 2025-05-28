export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          settings: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          ai_agent: string | null
          assigned_agent: string | null
          created_at: string
          id: string
          is_lead: boolean | null
          last_message: string | null
          last_message_time: string | null
          lead_id: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["chat_status"] | null
          unread_count: number | null
          updated_at: string
        }
        Insert: {
          ai_agent?: string | null
          assigned_agent?: string | null
          created_at?: string
          id?: string
          is_lead?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          lead_id?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["chat_status"] | null
          unread_count?: number | null
          updated_at?: string
        }
        Update: {
          ai_agent?: string | null
          assigned_agent?: string | null
          created_at?: string
          id?: string
          is_lead?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          lead_id?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["chat_status"] | null
          unread_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_interaction: string | null
          name: string
          notes: string | null
          phone: string
          satisfaction_score: number | null
          segment: string | null
          tags: string[] | null
          total_tickets: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction?: string | null
          name: string
          notes?: string | null
          phone: string
          satisfaction_score?: number | null
          segment?: string | null
          tags?: string[] | null
          total_tickets?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_interaction?: string | null
          name?: string
          notes?: string | null
          phone?: string
          satisfaction_score?: number | null
          segment?: string | null
          tags?: string[] | null
          total_tickets?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          phone: string
          potential: Database["public"]["Enums"]["lead_potential"]
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          phone: string
          potential?: Database["public"]["Enums"]["lead_potential"]
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          phone?: string
          potential?: Database["public"]["Enums"]["lead_potential"]
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          is_customer: boolean
          message: string
          sender_name: string
          status: Database["public"]["Enums"]["message_status"] | null
          updated_at: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          is_customer?: boolean
          message: string
          sender_name: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          is_customer?: boolean
          message?: string
          sender_name?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          permissions: string[] | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_login?: string | null
          name: string
          permissions?: string[] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          permissions?: string[] | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quick_replies: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_shared: boolean | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_shared?: boolean | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_shared?: boolean | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean | null
          message: string
          sender_name: string
          sender_phone: string | null
          sender_type: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message: string
          sender_name: string
          sender_phone?: string | null
          sender_type: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_name?: string
          sender_phone?: string | null
          sender_type?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          created_by: string | null
          customer_name: string
          customer_phone: string
          description: string | null
          first_response_at: string | null
          id: string
          last_response_at: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          customer_name: string
          customer_phone: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          last_response_at?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string
          customer_phone?: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          last_response_at?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_accounts: {
        Row: {
          account_name: string
          api_key: string | null
          assigned_agent: string | null
          created_at: string
          id: string
          is_active: boolean | null
          phone_number: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          account_name: string
          api_key?: string | null
          assigned_agent?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          account_name?: string
          api_key?: string | null
          assigned_agent?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_accounts_assigned_agent_fkey"
            columns: ["assigned_agent"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          ai_auto_analysis: boolean | null
          ai_enabled: boolean | null
          ai_response_template: string | null
          auto_reply: boolean | null
          created_at: string
          id: string
          is_connected: boolean | null
          phone_number: string | null
          updated_at: string
          user_id: string | null
          webhook_url: string | null
          welcome_message: string | null
          working_hours_enabled: boolean | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          ai_auto_analysis?: boolean | null
          ai_enabled?: boolean | null
          ai_response_template?: string | null
          auto_reply?: boolean | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
          welcome_message?: string | null
          working_hours_enabled?: boolean | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          ai_auto_analysis?: boolean | null
          ai_enabled?: boolean | null
          ai_response_template?: string | null
          auto_reply?: boolean | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          phone_number?: string | null
          updated_at?: string
          user_id?: string | null
          webhook_url?: string | null
          welcome_message?: string | null
          working_hours_enabled?: boolean | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_webhook_message: {
        Args: {
          p_phone: string
          p_message: string
          p_name?: string
          p_timestamp?: string
        }
        Returns: Json
      }
      process_whatsapp_message: {
        Args: {
          p_phone: string
          p_message: string
          p_name?: string
          p_timestamp?: string
          p_whatsapp_number?: string
        }
        Returns: Json
      }
    }
    Enums: {
      chat_status: "online" | "offline" | "away"
      lead_potential: "Hot" | "Warm" | "Cold" | "Medium" | "High"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      message_status: "sent" | "delivered" | "read"
      user_role: "admin" | "manager" | "agent" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chat_status: ["online", "offline", "away"],
      lead_potential: ["Hot", "Warm", "Cold", "Medium", "High"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      message_status: ["sent", "delivered", "read"],
      user_role: ["admin", "manager", "agent", "viewer"],
    },
  },
} as const
