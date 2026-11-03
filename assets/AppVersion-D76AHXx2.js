import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{lt as n}from"./index-T2cjlUGB.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-03 08:58 WIB`,VITE_APP_COMMIT_MESSAGE:`Light / dark theme toggle, light by default

- Sun / moon button in the settings and reports header (desktop drawer
  and phone top bar) and on the login screen, plus 'Mode Gelap /
  Mode Terang' in the Account menu of the bottom bar (also on the map)
- The choice is remembered on the device; without a choice the app is
  light (the phone's system theme is ignored), unless an admin set the
  server darkMode attribute
- Same orange accents in both modes`,VITE_APP_COMMIT_TIME:`2026-11-03 08:57 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`c172680`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};