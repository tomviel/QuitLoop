export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          timezone?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          billing_cycle: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          billing_cycle: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          plan?: string;
          billing_cycle?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          trial_ends_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      modules: {
        Row: {
          id: string;
          user_id: string;
          addiction_type: string;
          start_date: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          addiction_type: string;
          start_date?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          active?: boolean;
          start_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'modules_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      triggers: {
        Row: {
          id: string;
          user_id: string;
          trigger_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trigger_type: string;
          created_at?: string;
        };
        Update: {
          trigger_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'triggers_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      craving_sessions: {
        Row: {
          id: string;
          user_id: string;
          addiction_type: string;
          location_answer: string;
          trigger_answer: string;
          nearby_answer: string;
          resisted: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          addiction_type: string;
          location_answer: string;
          trigger_answer: string;
          nearby_answer: string;
          resisted?: boolean | null;
          created_at?: string;
        };
        Update: {
          resisted?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'craving_sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          addiction_type: string;
          current_streak: number;
          longest_streak: number;
          last_session_date: string | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          addiction_type: string;
          current_streak?: number;
          longest_streak?: number;
          last_session_date?: string | null;
          last_updated?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_session_date?: string | null;
          last_updated?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'streaks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      sms_logs: {
        Row: {
          id: string;
          user_id: string;
          sms_type: string;
          sent_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sms_type: string;
          sent_date?: string;
          created_at?: string;
        };
        Update: {
          sms_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sms_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      sms_schedules: {
        Row: {
          id: string;
          user_id: string;
          craving_start: string;
          craving_end: string;
          timezone: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          craving_start: string;
          craving_end: string;
          timezone: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          craving_start?: string;
          craving_end?: string;
          timezone?: string;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'sms_schedules_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_streak_after_session: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_resisted: boolean;
          p_session_date?: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
