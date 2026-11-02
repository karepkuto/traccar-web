// Route -> translation key of the short module description shown behind
// the (i) button in the page header. First match wins.
const MODULES = [
  [/^\/settings\/(device|group|user)\/\d+\/connections/, null], // own info in the page
  [/^\/settings\/devices/, 'moduleInfoDevices'],
  [/^\/settings\/device(\/|$)/, 'moduleInfoDevice'],
  [/^\/settings\/groups/, 'moduleInfoGroups'],
  [/^\/settings\/group(\/|$)/, 'moduleInfoGroups'],
  [/^\/settings\/geofence|^\/geofences/, 'moduleInfoGeofences'],
  [/^\/settings\/notification/, 'moduleInfoNotifications'],
  [/^\/settings\/command/, 'moduleInfoCommands'],
  [/^\/settings\/maintenance/, 'moduleInfoMaintenance'],
  [/^\/settings\/calendar/, 'moduleInfoCalendars'],
  [/^\/settings\/attribute/, 'moduleInfoAttributes'],
  [/^\/settings\/billing/, 'moduleInfoBilling'],
  [/^\/settings\/resellers/, 'resellerHelp'],
  [/^\/settings\/consents/, 'moduleInfoConsents'],
  [/^\/settings\/users/, 'moduleInfoUsers'],
  [/^\/settings\/user(\/|$)/, 'moduleInfoUser'],
  [/^\/settings\/announcement/, 'moduleInfoAnnouncement'],
  [/^\/settings\/server/, 'moduleInfoServer'],
  [/^\/settings\/preferences/, 'moduleInfoPreferences'],
  [/^\/settings\/accumulators/, 'moduleInfoAccumulators'],
  [/^\/settings\/.*\/share/, 'moduleInfoShare'],
  [/^\/reports\/combined/, 'moduleInfoReportCombined'],
  [/^\/reports\/route/, 'moduleInfoReportRoute'],
  [/^\/reports\/events/, 'moduleInfoReportEvents'],
  [/^\/reports\/trips/, 'moduleInfoReportTrips'],
  [/^\/reports\/stops/, 'moduleInfoReportStops'],
  [/^\/reports\/summary/, 'moduleInfoReportSummary'],
  [/^\/reports\/chart/, 'moduleInfoReportChart'],
  [/^\/reports\/geofences/, 'moduleInfoReportGeofences'],
  [/^\/reports\/scheduled/, 'moduleInfoReportScheduled'],
  [/^\/reports\/statistics/, 'moduleInfoReportStatistics'],
  [/^\/reports\/audit/, 'moduleInfoReportAudit'],
  [/^\/reports\/logs/, 'moduleInfoReportLogs'],
];

export const moduleInfoKey = (pathname) => {
  const match = MODULES.find(([pattern]) => pattern.test(pathname));
  return match ? match[1] : null;
};
