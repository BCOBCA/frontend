import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import type { Quotation } from '../src/types/api';
import { dateTime, money, styles as s } from '../src/theme';
export default function Quotations() { return <DataList<Quotation> title="Báo giá của tôi" path="/services/quotations" name="quotations" render={item => <><Text style={s.title}>{item.quoteCode}</Text><Text style={s.body}>{item.description}</Text><Text style={s.price}>{money(item.amount)}</Text><Text style={s.small}>Hiệu lực đến {dateTime(item.validUntil)} · {item.status}</Text></>} />; }
