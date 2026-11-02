import * as SecureStore from 'expo-secure-store';
export const readRefreshToken = () => SecureStore.getItemAsync('bcobca.refresh');
export const saveRefreshToken = (value: string) => SecureStore.setItemAsync('bcobca.refresh', value);
export const deleteRefreshToken = () => SecureStore.deleteItemAsync('bcobca.refresh');
