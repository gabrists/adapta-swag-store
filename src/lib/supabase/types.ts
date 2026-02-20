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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
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
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'employees_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
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
            foreignKeyName: 'inventory_movements_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_movements_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'items'
            referencedColumns: ['id']
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
          is_single_quota?: boolean
          name?: string
          price?: number | null
          supplier_url?: string | null
          unit_cost?: number
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
            foreignKeyName: 'orders_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
        ]
      }
      slack_settings: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          webhook_url?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          updated_at?: string | null
          webhook_url?: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains constraints, RLS policies, functions, triggers,
// indexes and materialized views not present in the type definitions above.

// --- CONSTRAINTS ---
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
// Table: orders
//   FOREIGN KEY orders_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES employees(id)
//   FOREIGN KEY orders_item_id_fkey: FOREIGN KEY (item_id) REFERENCES items(id)
//   PRIMARY KEY orders_pkey: PRIMARY KEY (id)
//   CHECK orders_status_check: CHECK ((status = ANY (ARRAY['Pendente'::text, 'Entregue'::text, 'Rejeitado'::text])))
// Table: slack_settings
//   PRIMARY KEY slack_settings_pkey: PRIMARY KEY (id)

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
// Table: departments
//   CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name)
// Table: employees
//   CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email)
