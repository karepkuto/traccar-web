import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{ct as n}from"./index-CbZ0UAw3.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 22:20 WIB`,VITE_APP_COMMIT_MESSAGE:`Review module descriptions for accuracy and coverage

- Send-command pages (device and group) and Share had picked up the
  device/group form text because of route order; they now have their
  own descriptions
- Expiration wording follows the server's actual behaviour (verified in
  Traccar's ConnectionManager): new connections from an expired device
  are refused so new data is not stored, while an already connected
  device may keep sending until it reconnects
- Preferences, Account, Announcement, Notifications, Scheduled,
  Statistics, Audit and Logs descriptions corrected to match what the
  pages really contain and who can see them`,VITE_APP_COMMIT_TIME:`2026-11-02 22:19 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`bc1f5ba`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};