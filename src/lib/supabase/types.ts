// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campaign_responses: {
        Row: {
          campaign_id: string
          choice: string
          employee_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          choice: string
          employee_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          choice?: string
          employee_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "swag_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_responses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          email: string
          id: string
          name: string
          onboarding_kit_status: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          id?: string
          name: string
          onboarding_kit_status?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          onboarding_kit_status?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          destination: string | null
          employee_id: string | null
          group_id: string
          id: string
          item_id: string
          quantity: number
          size: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          destination?: string | null
          employee_id?: string | null
          group_id: string
          id?: string
          item_id: string
          quantity: number
          size?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          destination?: string | null
          employee_id?: string | null
          group_id?: string
          id?: string
          item_id?: string
          quantity?: number
          size?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string
          created_at: string | null
          critical_level: number
          current_stock: number
          description: string | null
          grid: Json | null
          has_grid: boolean | null
          id: string
          image_url: string | null
          is_active: boolean
          is_public: boolean
          is_single_quota: boolean
          name: string
          price: number | null
          supplier_url: string | null
          unit_cost: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          critical_level?: number
          current_stock?: number
          description?: string | null
          grid?: Json | null
          has_grid?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_public?: boolean
          is_single_quota?: boolean
          name: string
          price?: number | null
          supplier_url?: string | null
          unit_cost?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          critical_level?: number
          current_stock?: number
          description?: string | null
          grid?: Json | null
          has_grid?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_public?: boolean
          is_single_quota?: boolean
          name?: string
          price?: number | null
          supplier_url?: string | null
          unit_cost?: number
        }
        Relationships: []
      }
      kit_items: {
        Row: {
          id: string
          item_id: string
          kit_id: string
          quantity: number
        }
        Insert: {
          id?: string
          item_id: string
          kit_id: string
          quantity?: number
        }
        Update: {
          id?: string
          item_id?: string
          kit_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          item_id: string
          quantity: number
          rejection_reason: string | null
          size: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          item_id: string
          quantity?: number
          rejection_reason?: string | null
          size?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          item_id?: string
          quantity?: number
          rejection_reason?: string | null
          size?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          product_id: string | null
          rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_settings: {
        Row: {
          bot_token: string | null
          created_at: string | null
          id: string
          is_enabled: boolean
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          bot_token?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          webhook_url?: string
        }
        Update: {
          bot_token?: string | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      swag_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          options: Json
          status: string
          target_ids: string[] | null
          target_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          options?: Json
          status?: string
          target_ids?: string[] | null
          target_type?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          options?: Json
          status?: string
          target_ids?: string[] | null
          target_type?: string
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
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: campaign_responses
//   id: uuid (not null, default: gen_random_uuid())
//   campaign_id: uuid (not null)
//   employee_id: uuid (not null)
//   choice: text (not null)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: departments
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: employees
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   department_id: uuid (nullable)
//   role: text (nullable, default: 'Colaborador'::text)
//   avatar_url: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   onboarding_kit_status: text (nullable, default: 'Pendente'::text)
// Table: inventory_movements
//   id: uuid (not null, default: gen_random_uuid())
//   group_id: uuid (not null)
//   item_id: uuid (not null)
//   employee_id: uuid (nullable)
//   type: text (not null)
//   quantity: integer (not null)
//   size: text (nullable)
//   destination: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: items
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   image_url: text (nullable)
//   category: text (not null, default: 'Geral'::text)
//   price: numeric (nullable, default: 0)
//   has_grid: boolean (nullable, default: false)
//   grid: jsonb (nullable)
//   current_stock: integer (not null, default: 0)
//   critical_level: integer (not null, default: 5)
//   created_at: timestamp with time zone (nullable, default: now())
//   unit_cost: numeric (not null, default: 0)
//   supplier_url: text (nullable)
//   is_single_quota: boolean (not null, default: false)
//   is_active: boolean (not null, default: true)
//   is_public: boolean (not null, default: true)
// Table: kit_items
//   id: uuid (not null, default: gen_random_uuid())
//   kit_id: uuid (not null)
//   item_id: uuid (not null)
//   quantity: integer (not null, default: 1)
// Table: kits
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: orders
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   item_id: uuid (not null)
//   quantity: integer (not null, default: 1)
//   size: text (nullable)
//   status: text (not null, default: 'Pendente'::text)
//   rejection_reason: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: product_reviews
//   id: uuid (not null, default: gen_random_uuid())
//   product_id: uuid (nullable)
//   employee_id: uuid (nullable)
//   rating: integer (nullable)
//   comment: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: slack_settings
//   id: uuid (not null, default: gen_random_uuid())
//   webhook_url: text (not null, default: ''::text)
//   is_enabled: boolean (not null, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   bot_token: text (nullable, default: ''::text)
// Table: swag_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   status: text (not null, default: 'Aberta'::text)
//   options: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   image_url: text (nullable)
//   target_type: text (not null, default: 'all'::text)
//   target_ids: _uuid (nullable)

// --- CONSTRAINTS ---
// Table: campaign_responses
//   UNIQUE campaign_responses_campaign_id_employee_id_key: UNIQUE (campaign_id, employee_id)
//   FOREIGN KEY campaign_responses_campaign_id_fkey: FOREIGN KEY (campaign_id) REFERENCES swag_campaigns(id) ON DELETE CASCADE
//   FOREIGN KEY campaign_responses_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY campaign_responses_pkey: PRIMARY KEY (id)
// Table: departments
//   UNIQUE departments_name_key: UNIQUE (name)
//   PRIMARY KEY departments_pkey: PRIMARY KEY (id)
// Table: employees
//   FOREIGN KEY employees_department_id_fkey: FOREIGN KEY (department_id) REFERENCES departments(id)
//   UNIQUE employees_email_key: UNIQUE (email)
//   PRIMARY KEY employees_pkey: PRIMARY KEY (id)
// Table: inventory_movements
//   FOREIGN KEY inventory_movements_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id)
//   FOREIGN KEY inventory_movements_item_id_fkey: FOREIGN KEY (item_id) REFERENCES items(id)
//   PRIMARY KEY inventory_movements_pkey: PRIMARY KEY (id)
//   CHECK inventory_movements_type_check: CHECK ((type = ANY (ARRAY['IN'::text, 'OUT'::text])))
// Table: items
//   PRIMARY KEY items_pkey: PRIMARY KEY (id)
// Table: kit_items
//   FOREIGN KEY kit_items_item_id_fkey: FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
//   FOREIGN KEY kit_items_kit_id_fkey: FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE
//   PRIMARY KEY kit_items_pkey: PRIMARY KEY (id)
// Table: kits
//   UNIQUE kits_name_key: UNIQUE (name)
//   PRIMARY KEY kits_pkey: PRIMARY KEY (id)
// Table: orders
//   FOREIGN KEY orders_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id)
//   FOREIGN KEY orders_item_id_fkey: FOREIGN KEY (item_id) REFERENCES items(id)
//   PRIMARY KEY orders_pkey: PRIMARY KEY (id)
//   CHECK orders_status_check: CHECK ((status = ANY (ARRAY['Pendente'::text, 'Entregue'::text, 'Rejeitado'::text])))
// Table: product_reviews
//   FOREIGN KEY product_reviews_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
//   PRIMARY KEY product_reviews_pkey: PRIMARY KEY (id)
//   FOREIGN KEY product_reviews_product_id_fkey: FOREIGN KEY (product_id) REFERENCES items(id) ON DELETE CASCADE
//   CHECK product_reviews_rating_check: CHECK (((rating >= 1) AND (rating <= 5)))
// Table: slack_settings
//   PRIMARY KEY slack_settings_pkey: PRIMARY KEY (id)
// Table: swag_campaigns
//   PRIMARY KEY swag_campaigns_pkey: PRIMARY KEY (id)
//   CHECK swag_campaigns_status_check: CHECK ((status = ANY (ARRAY['Aberta'::text, 'Fechada'::text])))
//   CHECK swag_campaigns_target_type_check: CHECK ((target_type = ANY (ARRAY['all'::text, 'departments'::text, 'employees'::text])))

// --- DATABASE FUNCTIONS ---
// FUNCTION update_stock_after_movement()
//   CREATE OR REPLACE FUNCTION public.update_stock_after_movement()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF NEW.type = 'IN' THEN
//       UPDATE public.items
//       SET current_stock = current_stock + NEW.quantity
//       WHERE id = NEW.item_id;
//     ELSIF NEW.type = 'OUT' THEN
//       UPDATE public.items
//       SET current_stock = GREATEST(0, current_stock - NEW.quantity)
//       WHERE id = NEW.item_id;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: inventory_movements
//   update_stock_trigger: CREATE TRIGGER update_stock_trigger AFTER INSERT ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION update_stock_after_movement()

// --- INDEXES ---
// Table: campaign_responses
//   CREATE UNIQUE INDEX campaign_responses_campaign_id_employee_id_key ON public.campaign_responses USING btree (campaign_id, employee_id)
// Table: departments
//   CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name)
// Table: employees
//   CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email)
// Table: kits
//   CREATE UNIQUE INDEX kits_name_key ON public.kits USING btree (name)

