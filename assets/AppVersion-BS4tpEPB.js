import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{st as n}from"./index-cmgbNph-.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 21:01 WIB`,VITE_APP_COMMIT_MESSAGE:`Hide driver references across the app when Drivers is disabled

- Drivers tab in user connections
- 'Driver changed' in notification types and the event report filter
- Driver column in the trip report (also dropped from saved columns)
- Driver option for the device list title/detail preference and in the
  device list itself
- Driver in position attribute lists; drivers are no longer fetched
- Position 'id' attribute gets its own 'Position ID' label instead of
  reusing the device identifier label
- SelectField gains an optional filter for endpoint-loaded options`,VITE_APP_COMMIT_TIME:`2026-11-02 21:00 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`4178108`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};