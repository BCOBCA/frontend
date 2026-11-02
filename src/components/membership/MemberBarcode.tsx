import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { toSVG } from '@bwip-js/generic';

export function MemberBarcode({ code }: { code: string }) {
  const xml = useMemo(() => toSVG({ bcid: 'code128', text: code, height: 28, scale: 2, includetext: false, paddingwidth: 10, paddingheight: 2 }), [code]);
  return <View accessible accessibilityRole="image" accessibilityLabel={`Mã thành viên ${code}`}><SvgXml xml={xml} width={128} height={52} /></View>;
}
