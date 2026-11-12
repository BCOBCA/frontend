# Sent feedback redesign

Match supplied reference within existing Expo/RN app: warm red shared header with feedback search, pale page background, centered stacked white cards, topic icons in pink tiles, subject/content, two attachment thumbnails plus overflow count, Vietnam time/date, pending/resolved badges and chevrons. On phones, stack status below content and preserve member navigation.

Interactions: search subject/content/admin response on the server before pagination; debounce input and reset page. Cards expand inline for full content, all attachment links and staff response. Preserve existing authenticated GET /feedbacks and feedback-history cache invalidation. Guests see LoginNotice; loading skeleton, retry, empty/no-results and pagination states are explicit. Use existing lucide icons/colors; no new dependencies or generated imagery.

Attachment parsing must support current appended `Tệp đính kèm: filename\nhttps://...` blocks and legacy `Liên kết minh họa: https://...`, preserve plain text, reject unsafe/credential URLs, use URL path extension to distinguish images/documents. Failed images show fallback. File links open only on a user's action.

Plan: (1) failing parser/view/route regression tests, (2) parser + card/list presentation, (3) route/header search integration + minimal server search filter, (4) frontend tests/typecheck/lint/build, focused backend search integration and real desktop/mobile browser fixture.

Source: app/feedback-history.tsx, src/components/support, tests, existing backend MemberService. Keep existing unrelated edits. No real feedback submissions, email, schema migrations or deployment. Test commands: npm test; npm run typecheck; npm run lint; npm run build. Backend: dotnet test BCOBCA.Tests --filter FullyQualifiedName~FeedbackSearchTests.
