# USAXresearch Page Worklog

อัปเดตล่าสุด: 2026-07-01

เอกสารนี้เก็บรายละเอียดงานของแต่ละหน้าในโปรเจค `usaxresearch` เพื่อใช้ตรวจสถานะ, วาง roadmap, และส่งต่องานพัฒนาได้ง่ายขึ้น

## ภาพรวมระบบ

- Framework: Next.js App Router (`src/app`) + React Client Components ใน `src/components`
- Auth/Profile: Supabase client ใน `AppLayout`, `SettingsPage`, admin และ API บางส่วน
- Navigation หลัก: จัดการด้วย state `active` ใน `src/components/AppLayout.tsx`
- หน้าใน sidebar: Dashboard, AI Screener, Watchlist, Portfolio, Compare, Market, News, Earnings, Education, Settings
- หน้าที่มี component รองรับแต่ยังไม่อยู่ใน sidebar หลัก: Alerts, Economic Calendar, Research Reports, Investment Ideas
- Persistence ฝั่ง client: `localStorage` สำหรับ theme, language, watchlist, alerts, portfolio, notification settings
- Disclaimer: มี banner/footer ใน layout และหน้า `/disclaimer`

## Route จริงใน App Router

### `/`

- File: `src/app/page.tsx`
- Component: `LandingPage`
- สิ่งที่ทำได้แล้ว: landing page สองภาษา, แสดง pricing/free-pro-elite, feature sections, CTA ไป dashboard
- Data source: static content ในไฟล์
- Persistence/API: ไม่มี
- สถานะ: พร้อมใช้งานในเชิง marketing/demo
- งานต่อ: เชื่อม pricing กับ payment จริงให้ชัดเจน, เพิ่ม SEO metadata เฉพาะหน้า, ตรวจ copy ภาษาไทยให้ไม่เพี้ยนหลัง deploy

### `/dashboard`

- File: `src/app/dashboard/page.tsx`
- Component หลัก: `DashboardHome` ภายใต้ `AppLayout`
- สิ่งที่ทำได้แล้ว: hero summary, market mini strip, AI top picks, AI news summary, screener shortcut, screener cards, compliance notice
- Data source: mock/static arrays ใน `DashboardHome.tsx`
- Persistence/API: ไม่มีโดยตรง
- สถานะ: ใช้งานเป็น dashboard demo ได้
- งานต่อ: เชื่อม market/top picks/news กับ API จริง, ทำ loading/error states, ทำ responsive QA เพิ่มสำหรับตารางและกริดย่อย

### `/admin`

- File: `src/app/admin/page.tsx`
- Component: `AdminPage`
- สิ่งที่ทำได้แล้ว: verify admin, overview, users, payments, approve/reject payment, change plan
- Data source: Supabase tables เช่น `profiles`, `payments`
- Persistence/API: Supabase updates
- สถานะ: มีฟังก์ชัน admin แล้ว แต่ lint ยังมี warning/error เดิมในไฟล์นี้
- งานต่อ: ปิด type `any`, แก้ hook dependency/loadData ordering, เพิ่ม permission guard ฝั่ง server/API, เพิ่ม audit log สำหรับการเปลี่ยน plan

### `/auth/callback`

- File: `src/app/auth/callback/page.tsx`
- Component: `AuthCallback`
- สิ่งที่ทำได้แล้ว: รับ OAuth/magic link callback แล้ว redirect กลับ dashboard
- Data source: Supabase auth
- Persistence/API: Supabase session
- สถานะ: ใช้งานเป็น auth callback
- งานต่อ: เพิ่ม error UI ที่ละเอียดขึ้น, แก้ lint dependency warning, เพิ่มข้อความ fallback เมื่อ callback ล้มเหลว

### `/disclaimer`

- File: `src/app/disclaimer/page.tsx`
- Component: `DisclaimerPage`
- สิ่งที่ทำได้แล้ว: แสดงข้อจำกัดความรับผิดชอบและกรอบการใช้งานเชิงสถิติ/การศึกษา
- Data source: static content
- Persistence/API: ไม่มี
- สถานะ: พร้อมใช้งาน
- งานต่อ: ตรวจ legal copy ขั้นสุดท้าย, เพิ่ม version/date ของ disclaimer

## Pages ใน AppLayout

### Dashboard

- Active id: `dashboard`
- Component: `DashboardHome`
- สิ่งที่ทำได้แล้ว: หน้ารวมข้อมูลสำคัญ, shortcut ไป screener/watchlist/news/earnings ผ่าน custom event
- Data source: mock/static
- สถานะ: ใช้งานได้ดีเป็น first screen หลัง login
- งานต่อ: แยก data layer กลางเพื่อลดข้อมูลซ้ำกับหน้าอื่น

### AI Screener

- Active id: `screener`
- Component: `ScreenerPage` ใน `AppLayout`, `ScreenerResults`
- สิ่งที่ทำได้แล้ว: เลือก screener 10 สไตล์, mock AI loading, แสดงผลหุ้น, sort controls UI, export button UI, view detail, save to watchlist
- Data source: `SCREENERS` จาก `DashboardHome`, `MOCK_RESULTS` ใน `ScreenerResults`
- Persistence/API: Save to Watchlist ผ่าน `localStorage` key `usax-watchlist-v1`
- สถานะ: ใช้งาน flow หลักได้แล้ว
- งานต่อ: เชื่อม API `/api/screener`, ทำ sort/export ให้ทำงานจริง, รวม stock data schema กับ Watchlist/Stock Detail เพื่อลดข้อมูลซ้ำ

### Stock Detail

- Entry point: จาก AI Screener `View Detail`
- Component: `StockDetailPage`
- สิ่งที่ทำได้แล้ว: overview/financials tabs, metric cards, AI statistical analysis, add to watchlist, set alert/Yahoo Finance buttons เป็น UI
- Data source: static `DETAIL_DB`
- Persistence/API: Add to Watchlist ผ่าน `localStorage`
- สถานะ: รายละเอียดหุ้นใช้งานได้ใน flow screener
- งานต่อ: ให้ Set Alert และ Yahoo Finance ทำงานจริง, เพิ่ม feedback text หลัง save, เชื่อม quote/fundamental API จริง

### Watchlist

- Active id: `watchlist`
- Component: `WatchlistPage`
- สิ่งที่ทำได้แล้ว: โหลด/บันทึก watchlist, เพิ่ม ticker, ลบ ticker, toggle alert, AI top pick, sync หลัง save จาก Screener/Stock Detail
- Data source: static `STOCK_DB` พร้อม fallback สำหรับ ticker ที่ไม่มีข้อมูลเต็ม
- Persistence/API: `localStorage` keys `usax-watchlist-v1`, `usax-watchlist-alerts-v1`
- สถานะ: ใช้งานได้แล้วหลังแก้ persistence
- งานต่อ: เชื่อม watchlist ต่อ user account/Supabase, ทำ alert rule จริง, เพิ่ม real quote data และ empty/loading states ที่ชัดขึ้น

### Portfolio

- Active id: `portfolio`
- Component: `PortfolioPage`
- สิ่งที่ทำได้แล้ว: holdings table, add position, remove position, summary cards, allocation by sector
- Data source: initial demo positions + selectable ticker templates
- Persistence/API: `localStorage` key `usax-portfolio-v1`
- สถานะ: ใช้งานเป็น portfolio demo ได้
- งานต่อ: เชื่อม user portfolio กับ Supabase, เพิ่ม edit position, import CSV, real-time price update, validation ของจำนวนหุ้น/ต้นทุน

### Compare Stocks

- Active id: `compare`
- Component: `ComparePage`
- สิ่งที่ทำได้แล้ว: เลือกหุ้นสูงสุด 4 ตัว, card summary, comparison table, AI comparison summary
- Data source: static `STOCK_DB`
- Persistence/API: ไม่มี
- สถานะ: ใช้งานได้เป็น comparison demo
- งานต่อ: ขยาย ticker universe, แก้ limit ให้ตรง copy plan (บางจุดพูดถึง 5 ตัว), เพิ่ม deep link/share comparison, ลด `any` ใน metric access

### Market Overview

- Active id: `market`
- Component: `MarketOverviewPage`
- สิ่งที่ทำได้แล้ว: tabs US/Global/Sectors, market status, commodities strip, crypto live fetch จาก CoinGecko
- Data source: static indices/sectors/commodities + CoinGecko สำหรับ BTC/ETH
- Persistence/API: ไม่มี
- สถานะ: ใช้งานได้ แต่ข้อมูล market ส่วนใหญ่ยัง mock/static
- งานต่อ: ย้าย crypto fetch ไป API proxy เพื่อลด CORS/rate-limit risk, เชื่อม index/sector data จริง, ทำ timezone market open ให้แม่นยำขึ้น

### Market News

- Active id: `news`
- Component: `NewsPage`
- สิ่งที่ทำได้แล้ว: news list, tag filters, sentiment badge, expand article body
- Data source: static `NEWS`
- Persistence/API: ไม่มี
- สถานะ: ใช้งานได้เป็น curated news demo
- งานต่อ: เชื่อม news provider/API, เพิ่ม search/date/source filters, ทำ article detail/deep link, แยก AI summary จาก raw news

### Earnings Calendar

- Active id: `earnings`
- Component: `EarningsPage`
- สิ่งที่ทำได้แล้ว: week/list views, day filter, week navigation UI, earnings rows พร้อม EPS estimate/previous/time badge
- Data source: static `EARNINGS`
- Persistence/API: ไม่มี
- สถานะ: ใช้งานได้เป็น earnings calendar demo
- งานต่อ: เชื่อม calendar API จริง, ผูก week navigation กับวันที่จริง, เพิ่ม reminder/watchlist filter

### Education

- Active id: `education`
- Component: `EducationPage`
- สิ่งที่ทำได้แล้ว: investor education content, glossary/term cards และเนื้อหาความรู้พื้นฐาน
- Data source: static content
- Persistence/API: ไม่มี
- สถานะ: พร้อมใช้งานเป็น learning section
- งานต่อ: เพิ่ม category/progress, search glossary, แยก content เป็น markdown/data file เพื่อแก้ง่าย

### Settings

- Active id: `settings`
- Component: `SettingsPage`
- สิ่งที่ทำได้แล้ว: profile display name, theme, language, notification toggles, subscription card, upgrade/sign out
- Data source: Supabase profile + local state
- Persistence/API: Supabase `profiles.display_name`, `localStorage` key `usax-notifs-v1`
- สถานะ: ใช้งานได้
- งานต่อ: แก้ type `any`, ทำ change password flow จริง, save language/theme/profile ให้เป็น source เดียวกัน, เพิ่ม notification preferences ใน Supabase

## Pages ที่รองรับใน code แต่ยังไม่อยู่ใน sidebar หลัก

### Alerts

- Active id: `alerts`
- Component: `AlertsPage`
- สิ่งที่ทำได้แล้ว: alert settings UI และ save state ภายในหน้า
- Data source: local/static
- Persistence/API: ยังไม่ชัดเจนว่าเชื่อมกับ Watchlist alerts หรือ Supabase
- สถานะ: component มีแล้ว แต่ไม่อยู่ใน NAV หลัก
- งานต่อ: เพิ่มเมนูหรือ search entry ถ้าจะเปิดใช้จริง, รวม alert persistence กับ Watchlist, ทำ Telegram/email alert integration

### Economic Calendar

- Active id: `economic`
- Component: `EconomicCalendarPage`
- สิ่งที่ทำได้แล้ว: calendar-style macro events UI
- Data source: static content
- Persistence/API: ไม่มี
- สถานะ: component มีแล้ว แต่ไม่อยู่ใน NAV/search หลัก
- งานต่อ: เพิ่ม route/navigation, เชื่อม economic calendar API, เพิ่ม country/impact filters

### Research Reports

- Active id: `analysis`
- Component: `AnalysisPage`
- สิ่งที่ทำได้แล้ว: research/report style cards
- Data source: static content
- Persistence/API: ไม่มี
- สถานะ: component มีแล้ว แต่ยังไม่ expose ในเมนูหลัก
- งานต่อ: เพิ่ม content management, report detail page, PDF/export/share

### Investment Ideas

- Active id: `ideas`
- Component: `IdeasPage`
- สิ่งที่ทำได้แล้ว: thematic investment idea cards
- Data source: static ideas
- Persistence/API: ไม่มี
- สถานะ: component มีแล้ว แต่ยังไม่ expose ในเมนูหลัก
- งานต่อ: เพิ่มเข้า NAV/search ถ้าต้องการใช้, เชื่อม screener/detail/watchlist, เพิ่ม filters ตาม theme/risk/time horizon

## Payment และ Subscription

### Payment Modal

- Component: `PaymentModal`
- สิ่งที่ทำได้แล้ว: plan selection, payment method UI, submit payment flow, feature list
- Data source: props userId/email + local modal state
- Persistence/API: เรียก API payment/Stripe ตาม flow ใน component
- สถานะ: พร้อมใช้ร่วมกับ Settings/sidebar upgrade
- งานต่อ: ตรวจ plan copy ให้ตรงทุกหน้า, เพิ่มสถานะหลัง submit ที่ชัดเจน, บันทึก billing history

### Payment APIs

- Files: `src/app/api/payment/*`, `src/app/api/stripe/*`
- สิ่งที่ทำได้แล้ว: payment submit/verify-slip, Stripe checkout/webhook
- Data source: Supabase/Stripe/env vars
- สถานะ: มีโครง production flow แล้ว
- งานต่อ: ตรวจ webhook signature, idempotency, error logging, admin approval edge cases

## API/Integration Inventory

- `/api/screener`: โครง API สำหรับ screener data
- `/api/stock/[ticker]`: โครง API สำหรับ stock detail/quote
- `/api/trial/start`, `/api/trial/check`: trial flow
- `/api/referral`: referral flow
- `/api/telegram/connect`: Telegram connect/notification onboarding
- `/api/cron/market-brief`: scheduled market brief
- `/api/admin/verify`: admin verification

งานต่อระดับ API:

- รวม schema response ให้ front-end ใช้ร่วมกันทุกหน้า
- เพิ่ม server-side validation และ typed responses
- เพิ่ม observability/logging สำหรับ payment, webhook, cron, telegram
- ลดการพึ่ง mock data ใน client components

## Technical Debt ที่พบ

- Lint ทั้งโปรเจคยังไม่ผ่านจาก error เดิมหลายจุด เช่น `no-explicit-any`, hook dependency, setState in effect
- มีข้อมูลหุ้นซ้ำหลายชุดในหลายไฟล์: `DashboardHome`, `ScreenerResults`, `WatchlistPage`, `StockDetailPage`, `ComparePage`, `PortfolioPage`
- บางหน้าใช้ mock/static data แต่ UI copy เหมือน real-time data ควรติดป้ายให้ชัดหรือเชื่อม API จริง
- Navigation มีหน้า hidden หลายหน้า (`alerts`, `economic`, `analysis`, `ideas`) ที่ render ได้แต่ผู้ใช้เข้าถึงยาก
- Local persistence ยังผูกกับ browser/device ไม่ผูก user account
- Thai/English copy ควรตรวจแบบ visual QA อีกครั้งหลัง deploy เพราะบางข้อความใน terminal แสดง encoding เพี้ยน

## Priority Roadmap แนะนำ

1. ทำ data layer กลางสำหรับ stock master/quote/fundamental เพื่อลดข้อมูลซ้ำ
2. ย้าย Watchlist, Portfolio, Notification settings ไป Supabase per user
3. เชื่อม API จริงให้ Screener, Stock Detail, Market, News, Earnings
4. เปิดหรือซ่อนหน้า hidden อย่างตั้งใจใน navigation/search
5. แก้ lint baseline ให้ผ่านทีละกลุ่ม: admin/API, AppLayout, client pages
6. เพิ่ม QA checklist สำหรับ mobile, empty states, loading states, และ disclaimer visibility

## Implementation Update 2026-07-01

- Added Supabase schema definitions for `user_watchlists` and `user_portfolios` with per-user RLS policies.
- Added `src/lib/user-data.ts` as a shared client helper for user watchlist and portfolio persistence.
- Watchlist now loads cloud data when the user is logged in, keeps localStorage as fallback/cache, and syncs changes back to Supabase.
- Screener and Stock Detail save-to-watchlist actions now update both localStorage and Supabase.
- Portfolio now loads/saves positions from Supabase per user while preserving localStorage fallback.
- Stock Detail `Set Alert` now adds the ticker to Watchlist alerts, and `Yahoo Finance` opens the ticker page.
- Build check passed with `npm run build`.

Deployment note:

- The SQL in `supabase/schema.sql` must be applied to the live Supabase project before cross-device Watchlist/Portfolio sync works in production. Until then, the app still falls back to localStorage.

## Implementation Update 2026-07-01 - Portfolio Analysis

- Portfolio Analysis now supports add, edit, and delete position flows from the holdings table.
- Position form now validates ticker, shares, average cost, and current price before saving.
- Current price is editable so users can update portfolio valuation manually when no live quote provider is connected.
- Portfolio save flow now shows sync state: loading, saving, synced, local fallback, or sync issue.
- Supabase save helper now returns sync status so the UI can distinguish cloud sync from local-only fallback.
- Expanded the selectable ticker templates across technology, semiconductors, cybersecurity, financials, consumer, healthcare, and energy.
- Added empty states for holdings and allocation views.
- Build check passed with `npm run build`.

## Implementation Update 2026-07-01 - Portfolio Watchlist Source

- Portfolio Analysis stock selector now uses the user's Watchlist tickers first.
- Selector reads Watchlist from Supabase when logged in and from `localStorage` fallback when offline or unauthenticated.
- If Watchlist is empty, Portfolio falls back to the built-in ticker templates.
- Existing portfolio positions remain selectable for editing even when they are no longer in Watchlist.

## Implementation Update 2026-07-01 - Watchlist Save UX

- Save-to-Watchlist actions now keep users on the current page instead of navigating to AI Watchlist.
- Screener result rows show an inline "Added" confirmation after saving.
- Stock detail save button now shows the same added confirmation state.

## Implementation Update 2026-07-01 - Dashboard Live Quotes

- Added `/api/quotes` as a bulk quote proxy backed by Yahoo Finance with no paid API key required.
- Dashboard Top Picks, Watchlist, Market Overview, and the market mini strip now refresh displayed price and daily change from live quote data after the page loads.
- Existing static dashboard values remain as fallback if the quote provider is unavailable.

## Implementation Update 2026-07-01 - Dashboard Stock Detail Navigation

- Dashboard AI Top Picks cards now open the selected ticker in the existing Stock Detail page.
- The Stock Detail back action returns users to the Dashboard after opening from Top Picks.
- App navigation now carries a selected ticker through the internal `usax-navigate` event.

## Implementation Update 2026-07-01 - Responsive Layout Pass

- Added shared responsive CSS for mobile page headers, form grids, metric grids, and horizontally scrollable data tables.
- Dashboard Top Picks, Screener shortcuts, Market Overview, and embedded Watchlist now reflow for tablet and mobile widths.
- Watchlist and Portfolio tables now preserve readable columns on mobile with intentional horizontal scrolling.
- Portfolio form and metric cards now stack cleanly on narrow screens.
- Stock Detail metric and company-info grids now collapse from four columns to two columns, then one column on small phones.
- Screener result tables now keep readable column widths on mobile.
- Build check passed with `npm run build`.

## Implementation Update 2026-07-01 - Mobile Dashboard Polish

- Dashboard hero now uses smaller mobile typography and tighter spacing.
- One-click screener buttons now render as a compact two-column mobile grid with shorter labels.
- Mobile top bar is more compact, with search presented as an icon button that expands into a full-width search field on focus.
- Secondary top bar actions are hidden on mobile to reduce crowding.
- Build check passed with `npm run build`.

## Implementation Update 2026-07-01 - Portfolio Stock Logos

- Portfolio holdings now use real stock logo images from the same symbol-logo source used by Dashboard, Watchlist, and Screener rows.
- Holdings keep a ticker-letter fallback if an external logo is unavailable.

## Implementation Update 2026-07-01 - Mobile Screener Cards

- AI Screener cards now reflow from five desktop columns to three, two, then one column as the viewport narrows.
- Mobile screener cards use full-width readable cards so Thai labels and descriptions no longer collapse into vertical text.
- Card icon, spacing, and count badge sizing are tuned for small screens.
- Build check passed with `npm run build`.
