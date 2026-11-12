import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Feedback from '../app/feedback';
import type { FeedbackValues } from '../src/services/feedback';
vi.mock('../src/components/support/support-attachments',()=>({pickSupportAttachment:vi.fn(),uploadSupportAttachment:vi.fn()}));
const state=vi.hoisted(()=>({user:{id:'me'} as {id:string}|null,request:vi.fn(),invalidate:vi.fn(),resetForm:vi.fn(),resetMutation:vi.fn(),setValue:vi.fn(),mutate:vi.fn(),push:vi.fn(),copy:vi.fn().mockResolvedValue(true),openURL:vi.fn().mockResolvedValue(true),values:{subject:'Đơn hàng và thanh toán',content:'Tôi cần kiểm tra đơn hàng',reference:''},view:undefined as undefined|{onSuggest:()=>void;onCopyEmail:()=>void;onEmail:()=>void},form:undefined as undefined|{onSubmit:()=>void},mutation:undefined as undefined|{mutationFn:(v:FeedbackValues)=>unknown;onSuccess:()=>Promise<void>}}));
vi.mock('expo-router',()=>({router:{push:state.push}}));vi.mock('expo-clipboard',()=>({setStringAsync:state.copy}));vi.mock('expo-linking',()=>({openURL:state.openURL}));
vi.mock('react-native',()=>({TextInput:()=>null}));
vi.mock('../src/stores/auth',()=>({useAuth:(select:(v:{user:typeof state.user})=>unknown)=>select({user:state.user}),queryClient:{invalidateQueries:state.invalidate}}));
vi.mock('../src/stores/toast',()=>({useToast:()=>vi.fn()}));vi.mock('../src/services/api',()=>({request:state.request}));
vi.mock('../src/components/common/ui',()=>({Page:({children}:{children:React.ReactNode})=><main>{children}</main>,Status:()=>null,LoginNotice:()=><p>Login</p>}));
vi.mock('../src/components/support/FeedbackView',()=>({FeedbackView:(props:NonNullable<typeof state.view>&{form:React.ReactNode})=>{state.view=props;return <div>{props.form}</div>;}}));
vi.mock('../src/components/support/SupportForm',()=>({SupportForm:(props:NonNullable<typeof state.form>)=>{state.form=props;return <div>Request form</div>;}}));
vi.mock('react-hook-form',()=>({useForm:()=>({control:{},reset:state.resetForm,setValue:state.setValue,handleSubmit:(submit:(v:FeedbackValues)=>void)=>()=>submit(state.values)}),useController:({name}:{name:keyof FeedbackValues})=>({field:{value:state.values[name],onChange:vi.fn()},fieldState:{}})}));
vi.mock('@tanstack/react-query',()=>({useMutation:(options:typeof state.mutation)=>{state.mutation=options;return {mutate:state.mutate,reset:state.resetMutation};}}));
beforeEach(()=>{vi.clearAllMocks();state.user={id:'me'};});
it('submits a real support request and refreshes history after success',async()=>{
  renderToStaticMarkup(<Feedback/>);state.form!.onSubmit();expect(state.mutate).toHaveBeenCalledWith(state.values);
  await state.mutation!.mutationFn(state.values);expect(state.request).toHaveBeenCalledWith('POST','/feedbacks',{type:'SUPPORT',subject:state.values.subject,content:state.values.content});
  await state.mutation!.onSuccess();expect(state.invalidate).toHaveBeenCalledWith({queryKey:['feedback-history']});expect(state.resetForm).toHaveBeenCalledOnce();
});
it('selects the suggestion topic and uses the confirmed copy/email address',()=>{
  renderToStaticMarkup(<Feedback/>);state.view!.onSuggest();expect(state.setValue).toHaveBeenCalledWith('subject','Góp ý nâng cấp',{shouldDirty:true,shouldValidate:true});
  state.view!.onCopyEmail();expect(state.copy).toHaveBeenCalledWith('mxh@baochi.online');state.view!.onEmail();expect(state.openURL).toHaveBeenCalledWith('mailto:mxh@baochi.online');
});
it('keeps public help visible but requires login to submit or suggest',()=>{
  state.user=null;const html=renderToStaticMarkup(<Feedback/>);expect(html).toContain('Login');expect(html).not.toContain('Request form');state.view!.onSuggest();expect(state.push).toHaveBeenCalledWith('/login');
});
