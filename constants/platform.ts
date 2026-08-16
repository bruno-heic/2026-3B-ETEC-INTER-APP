export interface Platform {
  id: string;
  name: string;
  app: "uber" | "99" | "indrive";
  productId?: string;
  capacity: number;
  base: number;
  per_km: number;
  per_min: number;
  desc: string;
  isSmall?: boolean;
}

export const platforms: Platform[] = [
  {
    id: "uber-moto",
    name: "Uber Moto",
    app: "uber",
    productId: "uber_moto",
    capacity: 1,
    base: 2.9,
    per_km: 0.9,
    per_min: 0.15,
    desc: "Viagens de motocicleta acessíveis.",
    isSmall: true,
  },
  {
    id: "uber-x",
    name: "Uber X",
    app: "uber",
    productId: "uberx",
    capacity: 4,
    base: 4.5,
    per_km: 1.9,
    per_min: 0.25,
    desc: "Viagens baratas para o dia a dia.",
  },
  {
    id: "uber-confort",
    name: "Uber Comfort",
    app: "uber",
    productId: "comfort",
    capacity: 4,
    base: 5.5,
    per_km: 2.2,
    per_min: 0.45,
    desc: "Carros mais novos e espaçosos.",
  },
  {
    id: "uber-black",
    name: "Uber Black",
    app: "uber",
    productId: "uberblack",
    capacity: 4,
    base: 6.5,
    per_km: 2.8,
    per_min: 0.7,
    desc: "Melhores carros e experiência premium.",
  },
  {
    id: "99-moto",
    name: "99 Moto",
    app: "99",
    capacity: 1,
    base: 3.2,
    per_km: 1.0,
    per_min: 0.12,
    desc: "Economia e agilidade no trânsito.",
    isSmall: true,
  },
  {
    id: "99-pop",
    name: "99 Pop",
    app: "99",
    capacity: 4,
    base: 4.0,
    per_km: 1.8,
    per_min: 0.22,
    desc: "O preço mais baixo da categoria.",
  },
  {
    id: "99-plus",
    name: "99 Plus",
    app: "99",
    capacity: 4,
    base: 6.5,
    per_km: 2.4,
    per_min: 0.38,
    desc: "Mais conforto com motoristas nota 5.",
  },
];
