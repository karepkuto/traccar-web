import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{ct as n}from"./index-aWKuBk4i.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 21:34 WIB`,VITE_APP_COMMIT_MESSAGE:`Make tables usable on phones and narrow screens

Theme-level, so every table benefits without page changes:
- Phones: each table scrolls sideways on its own, rows stay one line,
  the first column (name) stays visible on the left and long names are
  shortened with an ellipsis; the table footer (export, switches) does
  not scroll away
- All sizes: the row actions column (Ubah / Hapus / Aksi) sticks to the
  right edge so it is always reachable on wide tables
- Subscription and reseller pages mark their action cells the same way`,VITE_APP_COMMIT_TIME:`2026-11-02 21:33 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`ba8bfae`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};