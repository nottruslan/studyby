import {
  LayoutDashboard,
  Search,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

export const navItems: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/feed", icon: LayoutDashboard, label: "Лента" },
  { href: "/search", icon: Search, label: "Поиск" },
  { href: "/orders", icon: ShoppingBag, label: "Заказы" },
  { href: "/profile", icon: User, label: "Профиль" },
];
