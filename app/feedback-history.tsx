import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, styles as s } from '../src/theme';
type Feedback = { id: string; subject: string; content: string; status: string; adminResponse: string; createdAt: string };
export default function FeedbackHistory() { return <DataList<Feedback> title="Phản hồi đã gửi" path="/feedbacks" name="feedback-history" render={item => <><Text style={s.title}>{item.subject}</Text><Text style={s.body}>{item.content}</Text><Text style={s.small}>{dateTime(item.createdAt)} · {item.status === 'RESOLVED' ? 'Đã trả lời' : 'Chờ xử lý'}</Text>{item.adminResponse && <Text style={s.body}>Trả lời: {item.adminResponse}</Text>}</>} />; }
