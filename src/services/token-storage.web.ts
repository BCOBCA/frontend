// Web refresh tokens are exclusively managed by the API's HttpOnly cookie.
export const readRefreshToken = async (): Promise<string | null> => null;
export const saveRefreshToken = async (_value: string): Promise<void> => {};
export const deleteRefreshToken = async (): Promise<void> => {};
