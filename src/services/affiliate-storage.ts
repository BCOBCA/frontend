import * as SecureStore from 'expo-secure-store';

export const readAffiliateToken = () => SecureStore.getItemAsync('bcobca.affiliate.source');
export const saveAffiliateToken = (token: string) => SecureStore.setItemAsync('bcobca.affiliate.source', token);
