import{i as e}from"./rolldown-runtime-Dd_uD5pT.js";import{K as t,lt as n}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{A as r}from"./mui-uEXxZ_jQ.js";import{n as i,t as a}from"./IconButton-C7s0Thq0.js";import{t as o}from"./Typography-gfXxHSwv.js";import{r as s}from"./LocalizationProvider-CaJVxVv8.js";import{S as c,X as l}from"./index-DCParI90.js";var u=e(n(),1),d=t(),f=r((0,d.jsx)(`path`,{d:`M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z`}),`Refresh`),p={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-03 09:45 WIB`,VITE_APP_COMMIT_MESSAGE:`Simpler user / reseller form with Laravel-style validation

User form:
- Only the essentials up front: name, login email, password, phone,
  and an 'Account type & limits' card (Customer / Reseller /
  Administrator, customer limit for resellers, device limit, optional
  account expiration, disable account)
- Map preferences, location, restrictions, token and attributes moved
  behind 'Show advanced settings'
- 'New reseller' opens the form with Reseller preselected (limit 10)
- Account expiration can be left empty (no limit) instead of 2099

All forms:
- Save stays clickable; pressing it on an invalid form shows a red
  summary at the top and keeps the user on the page
- User form shows field errors under the inputs (required, password at
  least 6 characters, reseller customer limit)`,VITE_APP_COMMIT_TIME:`2026-11-03 09:44 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`0c17a45`,VITE_APP_VERSION:`6.14.5`},m=[p.VITE_APP_VERSION,p.VITE_APP_GIT_HASH,p.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),h=(0,d.jsxs)(d.Fragment,{children:[p.VITE_APP_COMMIT_MESSAGE&&(0,d.jsx)(o,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:p.VITE_APP_COMMIT_MESSAGE}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Branch: `,p.VITE_APP_GIT_BRANCH]}),(0,d.jsxs)(o,{variant:`caption`,component:`div`,children:[`Build: `,p.VITE_APP_BUILD_TIME]})]}),g=({align:e=`center`})=>{let t=s(),[n,r]=(0,u.useState)(!1);return(0,d.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:e===`left`?`flex-start`:`center`,minWidth:0},children:[(0,d.jsx)(l,{title:h,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,d.jsx)(o,{variant:`caption`,color:`textSecondary`,component:`div`,noWrap:!0,sx:{pl:2,py:1,opacity:.8,cursor:`help`,minWidth:0},children:m})}),(0,d.jsx)(l,{title:t(`appReload`),children:(0,d.jsx)(a,{size:`small`,"aria-label":t(`appReload`),disabled:n,onClick:()=>{r(!0),c()},sx:{ml:.5,mr:1,color:`text.secondary`},children:n?(0,d.jsx)(i,{size:16}):(0,d.jsx)(f,{fontSize:`small`})})})]})};export{m as n,g as t};