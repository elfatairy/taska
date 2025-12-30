export type Role = {
  label: string;
  value: 'CTO' | 'Product Manager' | 'Team Lead' | 'Frontend Developer';
  locked?: boolean;
}