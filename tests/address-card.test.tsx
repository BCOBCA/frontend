import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddressCard } from '../src/components/addresses/AddressCard';
import type { Address } from '../src/types/api';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, catalog: true }));
vi.mock('react-native', () => ({
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ActivityIndicator: () => <span>Loading</span>,
  Pressable: ({ children, accessibilityLabel, disabled, onPress }: { children: React.ReactNode; accessibilityLabel: string; disabled?: boolean; onPress: () => void }) => {
    state.actions[accessibilityLabel] = onPress;
    return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>;
  },
}));
vi.mock('lucide-react-native', () => Object.fromEntries(['House', 'Building2', 'Phone', 'MapPin', 'PencilLine', 'Star', 'Trash2'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: { text: '#24242B', surface: '#fff' } }));
vi.mock('../src/services/address-locations', () => ({ listAddressProvinces: vi.fn(), listAddressWards: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ queryKey }: { queryKey: string[] }) => ({ data: state.catalog ? queryKey[0] === 'address-provinces' ? [{ code: '01', name: 'Thành phố Hà Nội' }] : [{ code: '00004', name: 'Phường Ba Đình' }] : undefined }) }));

const address: Address = { id: 'address-1', recipientName: 'Nguyễn An', phone: '0912345678', provinceCode: '01', wardCode: '00004', addressLine: '12 Đội Cấn', isDefault: false };
beforeEach(() => { state.actions = {}; state.catalog = true; });

describe('shipping address card', () => {
  it('shows resolved names and connects default, edit and delete actions', () => {
    const edit = vi.fn(), remove = vi.fn(), makeDefault = vi.fn();
    const html = renderToStaticMarkup(<AddressCard address={address} wide onEdit={edit} onDelete={remove} onDefault={makeDefault} />);
    expect(html).toContain('12 Đội Cấn, Phường Ba Đình, Thành phố Hà Nội');
    state.actions['Chỉnh sửa địa chỉ của Nguyễn An'](); state.actions['Xóa địa chỉ của Nguyễn An'](); state.actions['Đặt địa chỉ của Nguyễn An làm mặc định']();
    expect(edit).toHaveBeenCalledOnce(); expect(remove).toHaveBeenCalledOnce(); expect(makeDefault).toHaveBeenCalledOnce();
  });
  it('marks the default row without offering to set it again', () => {
    const html = renderToStaticMarkup(<AddressCard address={{ ...address, isDefault: true }} wide onEdit={() => {}} onDelete={() => {}} onDefault={() => {}} />);
    expect(html).toContain('Mặc định'); expect(html).not.toContain('Đặt mặc định');
  });
  it('keeps stored location codes when the public catalog is unavailable', () => {
    state.catalog = false;
    expect(renderToStaticMarkup(<AddressCard address={address} wide={false} onEdit={() => {}} onDelete={() => {}} onDefault={() => {}} />)).toContain('12 Đội Cấn, 00004, 01');
  });
  it('disables row mutations while another address action is pending', () => {
    const html = renderToStaticMarkup(<AddressCard address={address} wide disabled onEdit={() => {}} onDelete={() => {}} onDefault={() => {}} />);
    expect((html.match(/disabled=""/g) ?? [])).toHaveLength(3);
  });
});
