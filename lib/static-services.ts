import { Service } from "./supabase";

export const staticServices: Service[] = [
  {
    id: "srv-001",
    serviceId: "srv-001",
    name: "Product Strategy",
    description:
      "<p>We help you clarify the roadmap, validate ideas quickly, and align stakeholders around outcomes.</p><ul><li>Market research and positioning</li><li>Opportunity sizing</li><li>Launch planning</li></ul>",
    images: [
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    created_at: "2026-02-01T09:00:00.000Z",
    updated_at: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "srv-002",
    serviceId: "srv-002",
    name: "Full-Stack Development",
    description:
      "<p>Ship reliable web applications with a focus on performance, security, and maintainability.</p><ul><li>React and Next.js builds</li><li>API design</li><li>Testing and QA</li></ul>",
    images: [
      "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    created_at: "2026-01-29T13:30:00.000Z",
    updated_at: "2026-01-29T13:30:00.000Z",
  },
  {
    id: "srv-003",
    serviceId: "srv-003",
    name: "Brand & Design Systems",
    description:
      "<p>Create a cohesive visual language that scales across teams and products.</p><ul><li>Design tokens and components</li><li>UX audits</li><li>Accessible UI patterns</li></ul>",
    images: [
      "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    created_at: "2026-01-22T16:10:00.000Z",
    updated_at: "2026-01-22T16:10:00.000Z",
  },
];
