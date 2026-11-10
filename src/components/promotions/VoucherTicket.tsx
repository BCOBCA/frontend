import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

export function VoucherTicket({ value, percent = false, shipping = false }: { value: number; percent?: boolean; shipping?: boolean }) {
  if (shipping) return <Svg width={84} height={44} viewBox="0 0 96 50" aria-hidden={true}>
    <Path d="M7 16h13M3 22h15M9 28h8" stroke="#FFB52B" strokeWidth="2" strokeLinecap="round" />
    <Path d="M18 12h43v26H18ZM61 23h14l12 12v8H61Z" fill="#F44235" />
    <Path d="M66 26h7l8 8H66Z" fill="#FFF3E6" />
    <Rect x="19" y="3" width="43" height="24" rx="3" fill="#FF9924" />
    <SvgText x="40" y="19" fill="#FFFFFF" textAnchor="middle" fontSize="12" fontWeight="800">SHIP</SvgText>
    <Circle cx="30" cy="41" r="6" fill="#D52F29" stroke="#FFFFFF" strokeWidth="2" /><Circle cx="73" cy="41" r="6" fill="#D52F29" stroke="#FFFFFF" strokeWidth="2" />
  </Svg>;
  return <Svg width={84} height={44} viewBox="0 0 96 50" aria-hidden={true}>
    <G transform="rotate(-10 48 25)">
      <Path d="M9 11h79v10a5 5 0 0 0 0 10v10H9V31a5 5 0 0 0 0-10Z" fill="#FFBF2E" />
      <Path d="M5 7h79v10a5 5 0 0 0 0 10v10H5V27a5 5 0 0 0 0-10Z" fill="#FF522B" />
      <Path d="M16 9v26M73 9v26" stroke="#FFD378" strokeWidth="1" strokeDasharray="2 2" />
      <SvgText x="45" y="27" fill="#FFFFFF" textAnchor="middle" fontSize="13" fontWeight="800">{value.toLocaleString('vi-VN')}{percent ? '%' : 'đ'}</SvgText>
    </G>
  </Svg>;
}
