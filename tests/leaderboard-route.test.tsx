import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Leaderboard from '../app/leaderboard';
const state=vi.hoisted(()=>({user:{id:'me'} as {id:string}|null,request:vi.fn(),queries:[] as {queryKey:unknown[];queryFn:()=>Promise<unknown>;enabled:boolean}[]}));
vi.mock('expo-router',()=>({router:{push:vi.fn()}}));
vi.mock('../src/components/common/ui',()=>({Page:({children}:{children:React.ReactNode})=><main>{children}</main>,LoginNotice:()=><p>Login</p>,Status:()=>null}));
vi.mock('../src/stores/auth',()=>({useAuth:(select:(v:{user:typeof state.user})=>unknown)=>select({user:state.user})}));
vi.mock('../src/services/api',()=>({request:state.request}));
vi.mock('../src/components/affiliate/LeaderboardView',()=>({LeaderboardView:()=><div>Leaderboard</div>}));
vi.mock('../src/components/affiliate/ShareLinkActions',()=>({ShareLinkActions:()=>null}));
vi.mock('@tanstack/react-query',()=>({useQuery:(options:typeof state.queries[number])=>{state.queries.push(options);return {};}}));
beforeEach(()=>{vi.clearAllMocks();state.queries=[];state.user={id:'me'};});
it('requests the selected period and scopes private data to the signed in user',async()=>{
  renderToStaticMarkup(<Leaderboard/>); state.request.mockResolvedValue({period:'week',items:[]}); await state.queries[0].queryFn();
  expect(state.request).toHaveBeenCalledWith('GET','/affiliate/leaderboard?page=1&pageSize=10&period=week');
  expect(state.queries[0].queryKey).toContain('me');
  await state.queries[2].queryFn(); expect(state.request).toHaveBeenCalledWith('GET','/affiliate/invitation');
});
it('rejects an older backend response that cannot filter the chosen period',async()=>{
  renderToStaticMarkup(<Leaderboard/>); state.request.mockResolvedValue({items:[]});
  await expect(state.queries[0].queryFn()).rejects.toThrow('Chưa thể tải bảng xếp hạng');
});
it('requires login and disables data requests for guests',()=>{
  state.user=null; expect(renderToStaticMarkup(<Leaderboard/>)).toContain('Login');
  expect(state.queries.every(q=>!q.enabled)).toBe(true);
});
