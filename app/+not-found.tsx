import { router } from 'expo-router';
import { Button, Empty, Page } from '../src/components/common/ui';
export default function NotFound() { return <Page title="Không tìm thấy trang" back><Empty text="Đường dẫn không tồn tại" /><Button title="Về trang chủ" onPress={() => router.replace('/')} /></Page>; }
