# Feedback and support reference

Design `/feedback` like supplied reference: pink headset banner, quick contact panel, topic/content request form, collapsible FAQ and product-improvement CTA. Shared page header/back/member footer, responsive desktop/mobile. User confirmed support email mxh@baochi.online; use copy/mailto controls and existing request history. No unconfigured live chat or response-time guarantees.

Preserve authenticated POST `/feedbacks` and history route. Topic selects SUPPORT or FEEDBACK; content required (5–1000 trimmed characters). Optional device attachment replaces the original HTTP(S) input; see [support-attachments.md](support-attachments.md). FAQ and email may be used without login; submission requires login.

Split presentation/form/art from route and validation/payload helpers. Reuse existing feedback contract, with a dedicated authenticated attachment endpoint and Expo DocumentPicker. Test validation, topics, payload/history invalidation, guest state and UI callbacks; check TypeScript/lint, frontend regression/build and desktop/mobile browser fixture. Do not submit real feedback or send email while verifying.
