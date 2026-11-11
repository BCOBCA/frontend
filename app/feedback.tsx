import { useRef, type ComponentRef } from 'react';
import { useForm, useController } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { LoginNotice, Page, Status } from '../src/components/common/ui';
import { FeedbackView } from '../src/components/support/FeedbackView';
import { SupportForm } from '../src/components/support/SupportForm';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import { useToast } from '../src/stores/toast';
import { emptyFeedback, feedbackPayload, feedbackSchema, SUPPORT_EMAIL, SUGGESTION_SUBJECT, type FeedbackValues } from '../src/services/feedback';
import { router } from 'expo-router';
export default function Feedback() {
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const form = useForm<FeedbackValues>({ resolver: zodResolver(feedbackSchema), defaultValues: emptyFeedback });
  const subject = useController({ control: form.control, name: 'subject' });
  const content = useController({ control: form.control, name: 'content' });
  const reference = useController({ control: form.control, name: 'reference' });
  const contentRef = useRef<ComponentRef<typeof TextInput>>(null);
  const send = useMutation({ mutationFn: (values: FeedbackValues) => request('POST', '/feedbacks', feedbackPayload(values)), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['feedback-history'] }); form.reset(emptyFeedback); } });
  const history = () => router.push('/feedback-history');
  const copyEmail = async () => { try { if (!await Clipboard.setStringAsync(SUPPORT_EMAIL)) throw new Error(); showToast('Đã sao chép email hỗ trợ.'); } catch { showToast('Chưa sao chép được email. Vui lòng thử lại.', 'error'); } };
  const email = async () => { try { await Linking.openURL(`mailto:${SUPPORT_EMAIL}`); } catch { showToast('Chưa mở được ứng dụng email. Bạn có thể sao chép địa chỉ hỗ trợ.', 'error'); } };
  const change = (field: { onChange: (value: string) => void }, value: string) => { send.reset(); field.onChange(value); };
  return <Page title="Phản hồi và hỗ trợ" back footerTab="member"><FeedbackView onHistory={history} onEmail={() => void email()} onCopyEmail={() => void copyEmail()} onNavigate={destination => router.push(destination)} onSuggest={() => { if (!user) { router.push('/login'); return; } if (!send.isPending) { send.reset(); form.setValue('subject', SUGGESTION_SUBJECT, { shouldDirty: true, shouldValidate: true }); contentRef.current?.focus(); } }}
    form={!user ? <LoginNotice /> : <SupportForm values={{ subject: subject.field.value, content: content.field.value, reference: reference.field.value }} errors={{ subject: subject.fieldState.error?.message, content: content.fieldState.error?.message, reference: reference.fieldState.error?.message }} busy={send.isPending} success={send.isSuccess} error={<Status error={send.error} />} contentRef={contentRef} onSubject={value => change(subject.field, value)} onContent={value => change(content.field, value)} onReference={value => change(reference.field, value)} onSubmit={() => void form.handleSubmit(values => send.mutate(values))()} onHistory={history} />} /></Page>;
}
