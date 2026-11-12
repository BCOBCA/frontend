export type SentFeedback = { id: string; subject: string; content: string; status: string; adminResponse: string; createdAt: string };
export type FeedbackAttachment = { name: string; url: string; kind: 'image' | 'document'; extension: string };

export function parseFeedbackContent(content: string): { message: string; attachments: FeedbackAttachment[] } {
  let message = content;
  const attachments: FeedbackAttachment[] = [];
  const suffix = /\r?\n\r?\n(?:Tệp đính kèm: ([^\r\n]+)\r?\n|Liên kết minh họa: )(https?:\/\/[^\s]+)\s*$/;
  for (let match = suffix.exec(message); match; match = suffix.exec(message)) {
    try {
      const url = new URL(match[2]);
      if (url.username || url.password) break;
      let filename = url.pathname.split('/').pop() || 'Tệp đính kèm';
      try { filename = decodeURIComponent(filename); } catch { /* Keep original filename if URL encoding is malformed. */ }
      const name = match[1]?.trim() || filename;
      const extension = (/\.([a-z0-9]{1,8})$/i.exec(url.pathname)?.[1] || /\.([a-z0-9]{1,8})$/i.exec(name)?.[1] || 'TỆP').toUpperCase();
      attachments.unshift({ name, url: url.href, kind: ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'AVIF'].includes(extension) ? 'image' : 'document', extension });
      message = message.slice(0, match.index);
    } catch { break; }
  }
  return { message: message.trim(), attachments };
}

export function feedbackCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { time: '--:--', date: '--/--/----' };
  const options = { timeZone: 'Asia/Ho_Chi_Minh' };
  return {
    time: new Intl.DateTimeFormat('vi-VN', { ...options, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date),
    date: new Intl.DateTimeFormat('vi-VN', { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }).format(date),
  };
}

export function feedbackHistoryPath(page: number, search: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '20' });
  if (search.trim()) params.set('search', search.trim().slice(0, 200));
  return `/feedbacks?${params}`;
}
