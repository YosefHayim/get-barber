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
      barber_profiles: {
        Row: {
          bio: string | null
          completed_bookings: number | null
          created_at: string
          currency: string | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          last_location_update: string | null
          location: unknown | null
          price_max: number | null
          price_min: number | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          bio?: string | null
          completed_bookings?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          location?: unknown | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          bio?: string | null
          completed_bookings?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          location?: unknown | null
          price_max?: number | null
          price_min?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "barber_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      barber_responses: {
        Row: {
          barber_id: string
          eta_minutes: number
          id: string
          message: string | null
          proposed_price: number
          request_id: string
          responded_at: string
          status: Database["public"]["Enums"]["response_status"]
        }
        Insert: {
          barber_id: string
          eta_minutes: number
          id?: string
          message?: string | null
          proposed_price: number
          request_id: string
          responded_at?: string
          status?: Database["public"]["Enums"]["response_status"]
        }
        Update: {
          barber_id?: string
          eta_minutes?: number
          id?: string
          message?: string | null
          proposed_price?: number
          request_id?: string
          responded_at?: string
          status?: Database["public"]["Enums"]["response_status"]
        }
        Relationships: [
          {
            foreignKeyName: "barber_responses_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barber_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      barber_services: {
        Row: {
          barber_id: string
          created_at: string
          custom_duration: number | null
          custom_price: number | null
          id: string
          is_active: boolean | null
          service_id: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          custom_duration?: number | null
          custom_price?: number | null
          id?: string
          is_active?: boolean | null
          service_id: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          custom_duration?: number | null
          custom_price?: number | null
          id?: string
          is_active?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "barber_services_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "barber_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          address: string
          barber_arrived_at: string | null
          barber_id: string
          cancelled_at: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string
          currency: string | null
          customer_id: string
          final_price: number
          id: string
          location: unknown
          request_id: string
          scheduled_time: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          address: string
          barber_arrived_at?: string | null
          barber_id: string
          cancelled_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id: string
          final_price: number
          id?: string
          location: unknown
          request_id: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          barber_arrived_at?: string | null
          barber_id?: string
          cancelled_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string
          final_price?: number
          id?: string
          location?: unknown
          request_id?: string
          scheduled_time?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          offer_amount: number | null
          offer_expires_at: string | null
          offer_status: Database["public"]["Enums"]["offer_status"] | null
          read_at: string | null
          request_id: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["user_type"]
          thumbnail_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          offer_amount?: number | null
          offer_expires_at?: string | null
          offer_status?: Database["public"]["Enums"]["offer_status"] | null
          read_at?: string | null
          request_id: string
          sender_id: string
          sender_type: Database["public"]["Enums"]["user_type"]
          thumbnail_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          offer_amount?: number | null
          offer_expires_at?: string | null
          offer_status?: Database["public"]["Enums"]["offer_status"] | null
          read_at?: string | null
          request_id?: string
          sender_id?: string
          sender_type?: Database["public"]["Enums"]["user_type"]
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      favorite_barbers: {
        Row: {
          barber_id: string
          created_at: string
          customer_id: string
          id: string
        }
        Insert: {
          barber_id: string
          created_at?: string
          customer_id: string
          id?: string
        }
        Update: {
          barber_id?: string
          created_at?: string
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_barbers_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_barbers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      portfolio_items: {
        Row: {
          barber_id: string
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          barber_id: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          barber_id?: string
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          phone: string | null
          preferred_language: string | null
          push_token: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          preferred_language?: string | null
          push_token?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          preferred_language?: string | null
          push_token?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      request_services: {
        Row: {
          id: string
          request_id: string
          service_id: string
        }
        Insert: {
          id?: string
          request_id: string
          service_id: string
        }
        Update: {
          id?: string
          request_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_services_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          barber_id: string
          barber_response: string | null
          booking_id: string
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          is_public: boolean | null
          rating: number
          updated_at: string
        }
        Insert: {
          barber_id: string
          barber_response?: string | null
          booking_id: string
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_public?: boolean | null
          rating: number
          updated_at?: string
        }
        Update: {
          barber_id?: string
          barber_response?: string | null
          booking_id?: string
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_default: boolean | null
          label: string
          location: unknown
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label: string
          location: unknown
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string
          location?: unknown
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      service_requests: {
        Row: {
          address: string
          created_at: string
          customer_id: string
          expires_at: string | null
          final_price: number | null
          id: string
          location: unknown
          notes: string | null
          scheduled_time: string | null
          selected_barber_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          customer_id: string
          expires_at?: string | null
          final_price?: number | null
          id?: string
          location: unknown
          notes?: string | null
          scheduled_time?: string | null
          selected_barber_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          final_price?: number | null
          id?: string
          location?: unknown
          notes?: string | null
          scheduled_time?: string | null
          selected_barber_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_selected_barber_id_fkey"
            columns: ["selected_barber_id"]
            isOneToOne: false
            referencedRelation: "barber_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          base_price: number
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          description_he: string | null
          display_order: number | null
          estimated_duration: number
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_he: string | null
        }
        Insert: {
          base_price: number
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          description_he?: string | null
          display_order?: number | null
          estimated_duration: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_he?: string | null
        }
        Update: {
          base_price?: number
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          description_he?: string | null
          display_order?: number | null
          estimated_duration?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_he?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_barber_response: {
        Args: {
          p_request_id: string
          p_response_id: string
          p_customer_id: string
        }
        Returns: string
      }
      create_service_request: {
        Args: {
          p_customer_id: string
          p_service_ids: string[]
          p_latitude: number
          p_longitude: number
          p_address: string
          p_notes?: string
          p_scheduled_time?: string
        }
        Returns: string
      }
      get_nearby_barbers: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_radius_meters?: number
        }
        Returns: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string
          bio: string
          rating: number
          total_reviews: number
          is_verified: boolean
          distance_meters: number
          price_min: number
          price_max: number
        }[]
      }
    }
    Enums: {
      booking_status:
        | "scheduled"
        | "barber_en_route"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      message_type: "text" | "offer" | "counter_offer" | "system" | "image"
      offer_status: "pending" | "accepted" | "rejected" | "countered" | "expired"
      request_status:
        | "pending"
        | "matching"
        | "negotiating"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      response_status: "pending" | "accepted" | "rejected" | "expired"
      service_category:
        | "haircut"
        | "beard"
        | "shave"
        | "combo"
        | "styling"
        | "coloring"
      user_type: "customer" | "barber" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
