export type Role = {
  label: string;
  value: 'CTO' | 'Product Manager' | 'Team Lead' | 'Developer';
  locked?: boolean;
}