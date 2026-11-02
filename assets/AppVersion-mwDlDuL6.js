import{K as e}from"./createSimplePaletteValueFilter-CM2TmgJi.js";import{t}from"./Typography-gfXxHSwv.js";import{ct as n}from"./index-BLacG2_E.js";var r=e(),i={BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_APP_BUILD_TIME:`2026-11-02 21:28 WIB`,VITE_APP_COMMIT_MESSAGE:`Make CRUD screens feel like a familiar admin panel

Shared components only, so every list and form keeps its flow:
- 'Tambah Data' button at the top right next to the search box (falls
  back to a labelled floating button when a page has no search bar)
- Row actions as labelled 'Ubah' / 'Hapus' buttons on desktop and an
  'Aksi' dropdown on phones
- Delete asks for confirmation in a modal dialog instead of a snackbar
- Forms get an 'Add data' / 'Edit data' heading, wider layout and
  right-aligned Batal / Simpan buttons
- Flash message after saving or deleting ('Data berhasil disimpan')
- Bold, shaded table headers and row hover`,VITE_APP_COMMIT_TIME:`2026-11-02 21:27 WIB`,VITE_APP_GIT_BRANCH:`master`,VITE_APP_GIT_HASH:`d30ae59`,VITE_APP_VERSION:`6.14.5`},a=[i.VITE_APP_VERSION,i.VITE_APP_GIT_HASH,i.VITE_APP_COMMIT_TIME].filter(Boolean).join(` · `),o=(0,r.jsxs)(r.Fragment,{children:[i.VITE_APP_COMMIT_MESSAGE&&(0,r.jsx)(t,{variant:`body2`,component:`div`,sx:{whiteSpace:`pre-line`,mb:1},children:i.VITE_APP_COMMIT_MESSAGE}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Branch: `,i.VITE_APP_GIT_BRANCH]}),(0,r.jsxs)(t,{variant:`caption`,component:`div`,children:[`Build: `,i.VITE_APP_BUILD_TIME]})]}),s=({align:e=`center`})=>(0,r.jsx)(n,{title:o,placement:`top`,enterTouchDelay:0,arrow:!0,children:(0,r.jsx)(t,{variant:`caption`,color:`textSecondary`,component:`div`,align:e,noWrap:!0,sx:{px:2,py:1,opacity:.8,cursor:`help`},children:a})});export{a as n,s as t};