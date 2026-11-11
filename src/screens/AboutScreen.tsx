import { router } from 'expo-router';
import { Page } from '../components/common/ui';
import { AboutView } from '../components/about/AboutView';

export default function AboutScreen() {
  return <Page title="Về chúng tôi" back footerTab="member"><AboutView heroSource={require('../../assets/dealer-banner-3d.png')} onNavigate={destination => router.push(destination)} /></Page>;
}
