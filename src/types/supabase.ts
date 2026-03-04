import type { EvaluationRow, ResumeRow, UserRow } from "./evaluation";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "created_at"> & { created_at?: string };
        Update: Partial<Omit<UserRow, "id">>;
        Relationships: [];
      };
      resumes: {
        Row: ResumeRow;
        Insert: Omit<ResumeRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<ResumeRow, "id">>;
        Relationships: [];
      };
      evaluations: {
        Row: EvaluationRow;
        Insert: Omit<EvaluationRow, "id" | "composite_score" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<EvaluationRow, "id" | "composite_score">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}