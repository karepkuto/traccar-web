import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{K as t,lt as n}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{A as r}from"./mui-uEXxZ_jQ.js";import{n as i,t as a}from"./IconButton-C7s0Thq0.js";import{t as o}from"./Typography-gfXxHSwv.js";import{r as s}from"./LocalizationProvider-BcP84Wqx.js";import{O as c,W as l}from"./index-DBv6p80y.js";var u=e(n(),1),d=t(),f=r((0,d.jsx)(`path`,{d:`M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z`}),`Refresh`),p={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-03 14:31 WIB`,VITE_APP_COMMIT_MESSAGE:`Keep reseller access to their customers' devices in every linking path

Traccar gives a reseller only the devices linked directly to it, so a
device an admin linked to a customer stayed invisible to that customer's
reseller. New helpers in util/resellerAccess keep the reseller -> device
links in step:

- Linking devices to a customer (user Connections, new device form)
  also links them to the customer's reseller.
- Adding customers to a reseller (Resellers > manage customers, user
  Connections) links their devices to the reseller; removing a customer
  revokes them, except devices of the reseller's other customers.
- Device Connections gets a 'Pelanggan (pemilik)' field: changing the
  owner moves the reseller link (old reseller loses it, new one gets it).
- Moving customers to another reseller or to direct management already
  moved the device links and keeps doing so.
- Resellers page: 'Perbaiki Akses Perangkat' adds missing links for
  existing data.`,VITE_APP_COMMIT_TIME:`2026-11-03 14:30 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`7fa6b6b`,VITE_APP_VERSION:`6.14.5`},m=[p.VITE_APP_VERSION,p.VITE_APP_GIT_HASH,p.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),h=(0,d.jsxs)(d.Fragment,{children:[p.VITE_APP_COMMIT_MESSAGE&&(0,d.jsx)(o,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:p.VITE_APP_COMMIT_MESSAGE}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Branch: `,p.VITE_APP_GIT_BRANCH]}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Build: `,p.VITE_APP_BUILD_TIME]})]}),g=({align:e=`center`})=>{let t=s(),[n,r]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:e===`left`?`flex-start`:`center`,minWidth:0},children:[(0,d.jsx)(l,{title:h,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,d.jsx)(o,{variant:`caption`,color:`textSecondary`,component:`div`,noWrap:!0,sx:{pl:2,py:1,opacity:.8,cursor:`help`,minWidth:0},children:m})}),(0,d.jsx)(l,{title:t(`appReload`),children:(0,d.jsx)(a,{size:`small`,"aria-label":t(`appReload`),disabled:n,onClick:()=>{r(!0),c()},sx:{ml:.5,mr:1,color:`text.secondary`},children:n?(0,d.jsx)(i,{size:16}):(0,d.jsx)(f,{fontSize:`small`})})})]})};export{m as n,g as t};