/**
 * Custom Tag entity for organizing expenses.
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  count?: number;
}
