import { Image } from 'expo-image';

export function AffiliatePolicyArt() {
  return <Image source={require('../../../assets/affiliate-policy-banner.png')} style={{ width: '100%', height: '100%' }} contentFit="contain" contentPosition="bottom right" accessible={false} />;
}
