# 10. Peta Kode

| Area | File |
|---|---|
| Role & preset hak akses | `src/common/util/roles.js`, `src/common/util/permissions.js` |
| Kepemilikan (satu pelanggan) | `src/common/util/ownership.js` |
| Akses reseller ke perangkat | `src/common/util/resellerAccess.js` |
| Pindah pelanggan | `src/common/util/transfer.js`, `src/settings/components/TransferDialog.jsx` |
| Langganan: aturan | `src/billing/billingLogic.js` (status, uji pasang, SLA, issues), `billingFormat.js` |
| Langganan: API | `src/billing/billingService.js` |
| Langganan: tampilan | `src/billing/BillingPage.jsx`, `ExtendDialog.jsx`, `BillingIssues.jsx`, `ResellerRecap.jsx`, `BillingCountdown.jsx`, `BillingStatusChip.jsx` |
| Pola audit | `src/billing/auditPatterns.js` |
| Teks langganan (id/en) | `src/billing/useBillingTranslation.js` |
| Layar peta & filter | `src/main/MainPage.jsx`, `MainToolbar.jsx`, `FilterBar.jsx`, `filterLogic.js`, `useFilter.js`, `useOwnerOptions.js`, `AttentionBanner.jsx`, `DeviceRow.jsx` |
| Kartu perangkat | `src/common/components/StatusCard.jsx` |
| Replay | `src/other/ReplayPage.jsx`, `src/other/replay/*` |
| Audit | `src/reports/AuditPage.jsx`, `src/reports/audit/*` |
| Pengguna | `src/settings/UsersPage.jsx`, `UserPage.jsx`, `UserConnectionsPage.jsx` |
| Reseller | `src/settings/ResellersPage.jsx` |
| Perangkat | `src/settings/DevicePage.jsx`, `DevicesPage.jsx`, `DeviceConnectionsPage.jsx`, `components/DeviceOwnerField.jsx` |
| Form seragam | `src/settings/components/EditItemView.jsx`, `ValidatedFields.jsx`, `FormValidationContext.js` |
| Menu pengaturan | `src/settings/components/SettingsMenu.jsx` |
| Penjelasan (i) | `src/common/util/moduleInfo.js` + kunci `moduleInfo*` di l10n |
| Legal | `src/legal/*` |
| Tema | `src/common/theme/*`, `src/AppThemeProvider.jsx`, `ThemeToggle.jsx` |
| Bahasa | `src/common/components/LocalizationProvider.jsx`, `src/resources/l10n/{id,en}.json` |
| Zona waktu | `src/common/util/timezone.js` |
| PWA & versi | `vite.config.js`, `src/UpdateController.jsx`, `src/InstallPrompt.jsx`, `AppVersion.jsx`, `src/common/util/reloadApp.js` |
| Fitur yang disembunyikan | `src/common/util/useFeatures.js` |
| Tabel di HP | `src/common/components/MobileTableEnhancer.jsx`, `src/common/theme/components.js` |
| Deploy | `.github/workflows/deploy.yml`, `DEPLOY.md` |
| Privasi reseller | `src/common/util/privacy.js` |
| Izin impersonate | `src/common/util/impersonation.js`, `src/settings/components/ImpersonationGrantsDialog.jsx` |
| Tautan bagikan | `src/settings/SharePage.jsx`, `src/legal/ShareNotice.jsx` |
| Jam GPS | `src/settings/components/DeviceTimezoneField.jsx` |
| Modul lain | lihat [11-modul-lainnya.md](11-modul-lainnya.md) |
