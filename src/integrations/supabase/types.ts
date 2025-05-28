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
      chat_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_name: string
          customer_phone: string
          customer_social_media: string | null
          id: string
          last_message_content: string | null
          last_message_time: string | null
          platform: string
          status: string
          unread_count: number
          updated_at: string
          whatsapp_device_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_name: string
          customer_phone: string
          customer_social_media?: string | null
          id?: string
          last_message_content?: string | null
          last_message_time?: string | null
          platform: string
          status?: string
          unread_count?: number
          updated_at?: string
          whatsapp_device_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string
          customer_social_media?: string | null
          id?: string
          last_message_content?: string | null
          last_message_time?: string | null
          platform?: string
          status?: string
          unread_count?: number
          updated_at?: string
          whatsapp_device_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_whatsapp_device_id_fkey"
            columns: ["whatsapp_device_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          id: string
          media_url: string | null
          message_content: string
          message_time: string
          message_type: string | null
          platform_message_id: string | null
          sender_name: string | null
          sender_type: string
          whatsapp_message_id: string | null
        }
        Insert: {
          conversation_id: string
          id?: string
          media_url?: string | null
          message_content: string
          message_time?: string
          message_type?: string | null
          platform_message_id?: string | null
          sender_name?: string | null
          sender_type: string
          whatsapp_message_id?: string | null
        }
        Update: {
          conversation_id?: string
          id?: string
          media_url?: string | null
          message_content?: string
          message_time?: string
          message_type?: string | null
          platform_message_id?: string | null
          sender_name?: string | null
          sender_type?: string
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          form_type: string
          id: string
          message: string
          name: string
          phone: string | null
          service: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          form_type: string
          id?: string
          message: string
          name: string
          phone?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          form_type?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          agent_type: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          section: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          access_token: string | null
          api_key: string | null
          app_id: string | null
          app_secret: string | null
          base_url: string | null
          business_account_id: string | null
          config_type: string
          created_at: string
          id: string
          is_active: boolean
          is_configured: boolean
          phone_number_id: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          app_id?: string | null
          app_secret?: string | null
          base_url?: string | null
          business_account_id?: string | null
          config_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_configured?: boolean
          phone_number_id?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          app_id?: string | null
          app_secret?: string | null
          base_url?: string | null
          business_account_id?: string | null
          config_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_configured?: boolean
          phone_number_id?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      whatsapp_devices: {
        Row: {
          connection_status: string
          created_at: string
          device_name: string
          id: string
          last_connected_at: string | null
          phone_number: string
          qr_code_data: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          connection_status?: string
          created_at?: string
          device_name: string
          id?: string
          last_connected_at?: string | null
          phone_number: string
          qr_code_data?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          connection_status?: string
          created_at?: string
          device_name?: string
          id?: string
          last_connected_at?: string | null
          phone_number?: string
          qr_code_data?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
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
    Enums: {},
  },
} as const
