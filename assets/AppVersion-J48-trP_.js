import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{ct as n}from"./index-BYhW7kcv.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 19:16 WIB`,VITE_APP_COMMIT_MESSAGE:`Billing: reseller accounts, rupiah inputs, auto period dates, payment history

- 'Billed to' reseller is chosen from real reseller accounts (users with
  a user limit) and stored as reseller:<userId>; older free-text
  values still display and can be re-linked
- Price and amount paid are rupiah inputs (digits only, shown as
  Rp 150.000); amount defaults to price x periods and is required
- Start date defaults to the current expiration (or today) in WIB; the
  end date is calculated automatically; the device stays active until
  23:59 WIB on the end date. Saving is blocked when the end date has
  passed, with a warning when the subscription would get shorter
- Every payment is appended to a per-device history (about the last
  12 entries, limited by Traccar's attribute size), shown in a new
  Payment history tab with filters, total and Excel export`,VITE_APP_COMMIT_TIME:`2026-11-02 19:15 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`d172d4a`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};