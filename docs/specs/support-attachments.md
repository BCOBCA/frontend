# Support attachments

Replace the optional URL input with one device-picked file. Preserve the current form layout and POST /feedbacks contract. Images show a preview; documents show an icon, extension and original filename. Users can replace/remove files. Cancel leaves the previous selection intact; upload failure preserves the draft; success clears it.

Accept JPEG, PNG, WebP, PDF, DOCX, XLSX, TXT up to 5 MiB. Use Expo SDK 58 DocumentPicker on web/iOS/Android. Upload only on submit to authenticated POST /feedbacks/attachments (multipart `file`), then append the returned HTTPS URL and original filename to feedback content. Reuse Cloudinary configuration and upload rate limit. Validate sizes/signatures server-side. No schema changes or secrets in client code.

Plan and verification:
1. Test picker cancel/type/size and multipart upload; implement picker/upload helpers.
2. Test server file validation and provider requests; extend upload service and authenticated route.
3. Add preview/remove/replace UI; wire submission, reset and retry; update FAQ wording.
4. Run `npm test`, `npm run typecheck`, `npm run lint` in frontend, targeted `dotnet test` in backend, and browser verification.

Follow existing functional components and inline RN style conventions. Keep tests in frontend/tests and backend/BCOBCA.Tests. Do not change unrelated flows or database schema. Cloudinary must be configured; provider policy can restrict PDF/document delivery.
