import { House, LayoutGrid, TicketPercent, ShoppingCart, UserRound } from 'lucide-react-native';

export const DESKTOP_HEADER_WIDTH = 1024;
export const primaryTabs = [
  { name: 'index', href: '/', title: 'Trang chủ', Icon: House },
  { name: 'categories', href: '/categories', title: 'Danh mục', Icon: LayoutGrid },
  { name: 'promotions', href: '/promotions', title: 'Ưu đãi', Icon: TicketPercent },
  { name: 'cart', href: '/cart', title: 'Giỏ hàng', Icon: ShoppingCart },
  { name: 'member', href: '/member', title: 'Thành viên', Icon: UserRound },
] as const;
