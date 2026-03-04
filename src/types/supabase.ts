import type { EvaluationRow, ResumeRow, UserRow } from "./evaluation";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "created_at">;
        Update: Partial<Omit<UserRow, "id">>;
      };
      resumes: {
        Row: ResumeRow;
        Insert: Omit<ResumeRow, "id" | "created_at">;
        Update: Partial<Omit<ResumeRow, "id">>;
      };
      evaluations: {
        Row: EvaluationRow;
        Insert: Omit<EvaluationRow, "id" | "composite_score" | "created_at">;
        Update: Partial<Omit<EvaluationRow, "id" | "composite_score">>;
      };
    };
  };
}
