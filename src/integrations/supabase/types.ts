export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      courses: {
        Row: {
          certification: string | null;
          created_at: string;
          curriculum: Json | null;
          display_order: number | null;
          duration: string | null;
          hero_image: string | null;
          id: string;
          levels: string[] | null;
          name: string;
          outcomes: string[] | null;
          slug: string;
          summary: string | null;
          tagline: string | null;
          video_url: string | null;
        };
        Insert: {
          certification?: string | null;
          created_at?: string;
          curriculum?: Json | null;
          display_order?: number | null;
          duration?: string | null;
          hero_image?: string | null;
          id?: string;
          levels?: string[] | null;
          name: string;
          outcomes?: string[] | null;
          slug: string;
          summary?: string | null;
          tagline?: string | null;
          video_url?: string | null;
        };
        Update: {
          certification?: string | null;
          created_at?: string;
          curriculum?: Json | null;
          display_order?: number | null;
          duration?: string | null;
          hero_image?: string | null;
          id?: string;
          levels?: string[] | null;
          name?: string;
          outcomes?: string[] | null;
          slug?: string;
          summary?: string | null;
          tagline?: string | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          author: string;
          body: string[];
          created_at: string;
          date: string;
          excerpt: string | null;
          id: string;
          slug: string;
          title: string;
        };
        Insert: {
          author?: string;
          body: string[];
          created_at?: string;
          date?: string;
          excerpt?: string | null;
          id?: string;
          slug: string;
          title: string;
        };
        Update: {
          author?: string;
          body?: string[];
          created_at?: string;
          date?: string;
          excerpt?: string | null;
          id?: string;
          slug?: string;
          title?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          amount_paid: number | null;
          course_id: string;
          enrolled_at: string;
          id: string;
          instrument: string | null;
          level: string | null;
          package_title: string | null;
          payment_id: string | null;
          progress: number;
          status: string;
          user_id: string;
        };
        Insert: {
          amount_paid?: number | null;
          course_id: string;
          enrolled_at?: string;
          id?: string;
          instrument?: string | null;
          level?: string | null;
          package_title?: string | null;
          payment_id?: string | null;
          progress?: number;
          status?: string;
          user_id: string;
        };
        Update: {
          amount_paid?: number | null;
          course_id?: string;
          enrolled_at?: string;
          id?: string;
          instrument?: string | null;
          level?: string | null;
          package_title?: string | null;
          payment_id?: string | null;
          progress?: number;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      fees: {
        Row: {
          badge: string | null;
          created_at: string;
          display_order: number | null;
          duration: string;
          features: string[];
          fees: string;
          id: string;
          mode: string;
          popular: boolean | null;
          raw_fees: number;
          tagline: string | null;
          title: string;
        };
        Insert: {
          badge?: string | null;
          created_at?: string;
          display_order?: number | null;
          duration: string;
          features?: string[];
          fees: string;
          id?: string;
          mode: string;
          popular?: boolean | null;
          raw_fees: number;
          tagline?: string | null;
          title: string;
        };
        Update: {
          badge?: string | null;
          created_at?: string;
          display_order?: number | null;
          duration?: string;
          features?: string[];
          fees?: string;
          id?: string;
          mode?: string;
          popular?: boolean | null;
          raw_fees?: number;
          tagline?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number | null;
          id: string;
          link_url: string | null;
          title: string;
          video_url: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          link_url?: string | null;
          title: string;
          video_url?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          link_url?: string | null;
          title?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          course_interest: string | null;
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
          phone: string | null;
          source: string | null;
        };
        Insert: {
          course_interest?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          phone?: string | null;
          source?: string | null;
        };
        Update: {
          course_interest?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "student";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const;
