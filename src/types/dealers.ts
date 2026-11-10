export type Dealer = {
  id: string; name: string; slug: string; logoUrl: string; coverUrl: string; description: string;
  isVerified: boolean; followerCount: number; locationLabel: string; provinces?: string | null; branchCount: number; isFollowing: boolean;
};
export type DealerProfile = { id: string; name: string; provinces: string | null; categoryIds?: string[] };
export type DealerCategory = { id: string; name: string };
export type DealerDetail = {
  dealer: Dealer; phone: string | null; email: string | null; website: string | null;
  branches: { id: string; name: string; address: string; provinceCode: string; wardCode: string; phone: string | null; latitude: number | null; longitude: number | null; isMain: boolean }[];
};
export type DealerFilters = { page: number; search: string; provinceCode: string; categoryId: string; sortBy: 'popular' | 'newest' | 'name' };
export type DealerFollow = { isFollowing: boolean; followerCount: number };
