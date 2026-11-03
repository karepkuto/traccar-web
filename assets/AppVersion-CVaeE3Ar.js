import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{K as t,lt as n}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{A as r}from"./mui-uEXxZ_jQ.js";import{n as i,t as a}from"./IconButton-C7s0Thq0.js";import{t as o}from"./Typography-gfXxHSwv.js";import{r as s}from"./LocalizationProvider-CYY9uXl3.js";import{O as c,U as l}from"./index-BnEyUEHD.js";var u=e(n(),1),d=t(),f=r((0,d.jsx)(`path`,{d:`M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z`}),`Refresh`),p={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-03 11:11 WIB`,VITE_APP_COMMIT_MESSAGE:`Move customers between resellers, audit patterns, activation reminders, EULA update

- Admin-only 'Pindahkan Pelanggan': move one customer (Users page) or all
  or selected customers of a reseller (Resellers page) to another
  reseller or to direct management. Moves the reseller->customer links,
  the reseller->device links of those customers' devices (and optionally
  the reseller's unassigned stock), and the billed-to marker. Payment
  history is kept.
- 'Perlu Diperiksa' reads the server audit log (30 days): devices or users
  deleted by non-admins, devices created again after a deletion (new
  installation test), 5+ failed logins from one IP in a day, and who last
  edited each flagged device. New issue: installation test running for
  more than 24 hours without activation (1x24h activation promise).
- Reminder banner above the device list: admins see devices waiting for
  activation and those past 24 hours; resellers see devices needing
  activation or extension. 'Lihat' applies the matching filter.
- EULA 2026-11-03: engine cut-off only on request and at the user's risk,
  support access by admin/reseller is logged, 3-day installation test and
  1x24h activation, activity logging, reseller payment per device, ban on
  manipulation, and the right to move customers when a partnership ends.`,VITE_APP_COMMIT_TIME:`2026-11-03 11:10 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`fb05a94`,VITE_APP_VERSION:`6.14.5`},m=[p.VITE_APP_VERSION,p.VITE_APP_GIT_HASH,p.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),h=(0,d.jsxs)(d.Fragment,{children:[p.VITE_APP_COMMIT_MESSAGE&&(0,d.jsx)(o,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:p.VITE_APP_COMMIT_MESSAGE}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Branch: `,p.VITE_APP_GIT_BRANCH]}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Build: `,p.VITE_APP_BUILD_TIME]})]}),g=({align:e=`center`})=>{let t=s(),[n,r]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:e===`left`?`flex-start`:`center`,minWidth:0},children:[(0,d.jsx)(l,{title:h,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,d.jsx)(o,{variant:`caption`,color:`textSecondary`,component:`div`,noWrap:!0,sx:{pl:2,py:1,opacity:.8,cursor:`help`,minWidth:0},children:m})}),(0,d.jsx)(l,{title:t(`appReload`),children:(0,d.jsx)(a,{size:`small`,"aria-label":t(`appReload`),disabled:n,onClick:()=>{r(!0),c()},sx:{ml:.5,mr:1,color:`text.secondary`},children:n?(0,d.jsx)(i,{size:16}):(0,d.jsx)(f,{fontSize:`small`})})})]})};export{m as n,g as t};