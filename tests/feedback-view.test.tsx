import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { FeedbackView } from '../src/components/support/FeedbackView';
import { SupportForm } from '../src/components/support/SupportForm';
const state=vi.hoisted(()=>({width:1200,actions:{} as Record<string,()=>void>,disabled:{} as Record<string,boolean>}));
vi.mock('react-native',()=>({View:'div',Text:'span',useWindowDimensions:()=>({width:state.width}),StyleSheet:{create:(v:unknown)=>v},TextInput:({accessibilityLabel,value,editable}:{accessibilityLabel:string;value:string;editable:boolean})=><textarea aria-label={accessibilityLabel} defaultValue={value} readOnly={!editable}/>,Pressable:({children,accessibilityLabel,onPress,disabled}:{children:React.ReactNode;accessibilityLabel:string;onPress:()=>void;disabled?:boolean})=>{state.actions[accessibilityLabel]=onPress;state.disabled[accessibilityLabel]=!!disabled;return <button disabled={disabled}>{children}</button>;}}));
vi.mock('../src/components/support/SupportArt',()=>({SupportArt:()=>null}));
vi.mock('lucide-react-native',()=>Object.fromEntries(['ChevronDown','ChevronUp','ChevronRight','Copy','Headset','Mail','MessageCircle','CircleHelp','Lightbulb','PencilLine','Check','MessageSquareText','Paperclip','Send'].map(name=>[name,()=>null])));
const actions=()=>({onHistory:vi.fn(),onEmail:vi.fn(),onCopyEmail:vi.fn(),onSuggest:vi.fn(),onNavigate:vi.fn()});
it.each([375,1200])('renders the support reference and confirmed contact at %ipx',width=>{
  state.width=width;const html=renderToStaticMarkup(<FeedbackView form={<p>Support form</p>} {...actions()}/>);
  for(const text of ['Trung tâm hỗ trợ BCA','Liên hệ nhanh','mxh@baochi.online','Yêu cầu đã gửi','Câu hỏi thường gặp','Góp ý nâng cấp','Support form'])expect(html).toContain(text);
  expect(html).not.toContain('hotro@bca.vn');expect(html).not.toContain('vài phút');expect(html).not.toContain('Chat trực tuyến');
});
it('wires contact, history and suggestion controls',()=>{
  const callbacks=actions();renderToStaticMarkup(<FeedbackView form={null} {...callbacks}/>);
  state.actions['Theo dõi yêu cầu đã gửi']();expect(callbacks.onHistory).toHaveBeenCalledOnce();
  state.actions['Gửi email hỗ trợ']();expect(callbacks.onEmail).toHaveBeenCalledOnce();
  state.actions['Sao chép email hỗ trợ']();expect(callbacks.onCopyEmail).toHaveBeenCalledOnce();
  state.actions['Gửi góp ý nâng cấp']();expect(callbacks.onSuggest).toHaveBeenCalledOnce();
});
it('shows content limit, optional link and pending submission state',()=>{
  const props={values:{subject:'Vấn đề khác',content:'Cần hỗ trợ',reference:''},onSubject:vi.fn(),onContent:vi.fn(),onReference:vi.fn(),onSubmit:vi.fn(),onHistory:vi.fn()};
  const html=renderToStaticMarkup(<SupportForm {...props} busy/>);
  expect(html).toContain('1.000');expect(html).toContain('Liên kết ảnh hoặc tài liệu');expect(html).toContain('Đang gửi');expect(state.disabled['Gửi yêu cầu hỗ trợ']).toBe(true);
  const success=renderToStaticMarkup(<SupportForm {...props} success/>);expect(success).toContain('Đã gửi yêu cầu thành công.');
});
