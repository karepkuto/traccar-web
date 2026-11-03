import { useState } from 'react';
import { Snackbar } from '@mui/material';
import SelectField from '../../common/components/SelectField';
import { useTranslation } from '../../common/components/LocalizationProvider';
import { useAsyncTask, useCatch } from '../../reactHelper';
import { isCustomer } from '../../common/util/ownership';
import { fetchDeviceCustomers, setDeviceOwner } from '../../common/util/resellerAccess';
import { snackBarDurationShortMs } from '../../common/util/duration';

// One customer owns a device. Changing it also moves the reseller access.
const DeviceOwnerField = ({ deviceId }) => {
  const t = useTranslation();
  const [owner, setOwner] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useAsyncTask(async () => {
    const customers = await fetchDeviceCustomers(deviceId);
    setOwner(customers[0]?.id ?? null);
  }, [deviceId]);

  const handleChange = useCatch(async (customerId) => {
    setSaving(true);
    try {
      await setDeviceOwner(deviceId, customerId);
      setOwner(customerId);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  });

  if (owner === undefined) {
    return null;
  }

  return (
    <>
      <SelectField
        value={owner}
        emptyValue={null}
        emptyTitle={t('deviceNoCustomer')}
        onChange={(event) => !saving && handleChange(event.target.value || null)}
        endpoint="/api/users?excludeAttributes=true"
        filter={isCustomer}
        label={t('deviceCustomer')}
        helperText={t('deviceOwnerHelp')}
        fullWidth
      />
      <Snackbar
        open={saved}
        onClose={() => setSaved(false)}
        autoHideDuration={snackBarDurationShortMs}
        message={t('deviceOwnerSaved')}
      />
    </>
  );
};

export default DeviceOwnerField;
