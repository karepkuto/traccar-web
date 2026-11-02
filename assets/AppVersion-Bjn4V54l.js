import{Dt as e}from"./mui-D39OUvBL.js";import{t}from"./Typography-BLm-uIYH.js";import{Q as n}from"./index-DhTfi1ut.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 17:43 WIB`,VITE_APP_COMMIT_MESSAGE:`Replay speed up to 10x, time range trimming, WIB timezone

Replay (per-device history):
- Playback speed selector 1x/2x/4x/6x/8x/10x
- Time range slider to trim the loaded track; only the selected range
  is drawn, played and framed by the camera

Period filter (replay and reports):
- New presets: last hour, last 6 hours, last 24 hours
- Custom range is rejected when start is not before end

Timezone:
- All displayed times use Asia/Jakarta (WIB) by default, or the user /
  server 'timezone' attribute when set, regardless of device clock
- Period boundaries (today, this week, ...) and custom inputs are
  computed in that timezone`,VITE_APP_COMMIT_TIME:`2026-11-02 17:43 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`2cbb2eb`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};