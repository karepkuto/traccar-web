import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{st as n}from"./index-BKauHw9t.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 21:19 WIB`,VITE_APP_COMMIT_MESSAGE:`Enforce one customer per device, group and geofence

- Linking a device, group or geofence to a customer is blocked when
  another customer already owns it (directly or through the device's
  group); linking a group is also blocked when any device inside it
  belongs to another customer. A clear message names the owner.
- Admins and resellers are never counted as owners, so they keep
  overseeing their customers' data; admins still see everything.
- Subscription page gets a Customer column that flags devices with no
  owner or with more than one customer, covering links made outside
  this screen.
- LinkField gains an optional async beforeAdd check.`,VITE_APP_COMMIT_TIME:`2026-11-02 21:18 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`8d2f132`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};