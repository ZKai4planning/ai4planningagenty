export type StaticAccount = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "employee";
  region?: "India" | "UK";
};

export const STATIC_ACCOUNTS: StaticAccount[] = [
  {
    email: "admin@ai4planning.com",
    password: "Admin@123",
    name: "Admin",
    role: "admin",
  },
  {
    email: "agentY@ai4planning.com",
    password: "Employee@123",
    name: "AgentY",
    role: "employee",
    region: "India",
  },
  {
    email: "john@ai4planning.com",
    password: "Employee@123",
    name: "John",
    role: "employee",
    region: "UK",
  },
];

export const findAccountByEmail = (email: string) =>
  STATIC_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );
