# Personal profile reference redesign

- `/profile` now uses ProfileIdentity, ProfileInformation and ProfileEditor. Desktop:264 px identity/menu + account table; width<900 stacks with horizontally scrolling menu, width<650 stacks each label/value. Existing header/back navigation remains.
- Profile loads `/auth/me`; edits/images are unavailable before current data loads. Explicit edit/cancel/save prevents automatic writes. Optional metadata fallback does not invent dates, portraits, referrer or active status. Referral copy uses clipboard + top toast; errors remain visible.
- Avatar/cover pick via expo-image-picker and multipart POST /auth/profile-images, then own profile PUT. Canceled/unsupported/oversize inputs never upload. Existing new-backend date/gender/cover fields preserve omissions; native module/plugin requires a rebuilt binary. Camera/microphone are disabled in plugin config.
- Phone verification shows real account flags and support/edit actions; no SMS verification exists. Email verification and password/session/notification/dealer-profile navigation are preserved.
- Backend/API/validation notes: `backend/docs/handoffs/profile-reference-redesign.md`. No DB migration required.
- Tested full frontend suite160, TypeScript/lint/web export; backend suite140 plus separate new upload authorization test. Real browser desktop/mobile fixtures verify cancel/save, DOB formatting, copy and verification status without real profile/upload/message mutations. Native gallery tested at helper/contract level, not on a physical device.
