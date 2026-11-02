import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

const get = (server, user, key) => {
  if (server && user) {
    if (user.administrator) {
      return false;
    }
    if (server.forceSettings) {
      return server.attributes[key] || user.attributes[key] || false;
    }
    return user.attributes[key] || server.attributes[key] || false;
  }
  return false;
};

const featureSelector = createSelector(
  (state) => state.session.server,
  (state) => state.session.user,
  (server, user) => {
    const disableSavedCommands = get(server, user, 'ui.disableSavedCommands');
    const disableAttributes = get(server, user, 'ui.disableAttributes');
    const disableVehicleFeatures = get(server, user, 'ui.disableVehicleFeatures');
    // Pantauku: driver identification needs an RFID/iButton reader on the
    // tracker, which current devices lack, so the Drivers feature is hidden
    // for everyone (admins included) unless the server attribute
    // 'ui.enableDrivers' is set to true.
    const driversEnabled = [true, 'true'].includes(server?.attributes?.['ui.enableDrivers']);
    const disableDrivers =
      !driversEnabled || disableVehicleFeatures || get(server, user, 'ui.disableDrivers');
    const disableMaintenance = disableVehicleFeatures || get(server, user, 'ui.disableMaintenance');
    const disableGroups = get(server, user, 'ui.disableGroups');
    const disableEvents = get(server, user, 'ui.disableEvents');
    const disableComputedAttributes = get(server, user, 'ui.disableComputedAttributes');
    const disableCalendars = get(server, user, 'ui.disableCalendars');

    return {
      disableSavedCommands,
      disableAttributes,
      disableDrivers,
      disableMaintenance,
      disableGroups,
      disableEvents,
      disableComputedAttributes,
      disableCalendars,
    };
  },
);

export default () => useSelector(featureSelector);
