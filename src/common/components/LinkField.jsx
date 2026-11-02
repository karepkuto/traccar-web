import { Alert, Autocomplete, Snackbar, TextField } from '@mui/material';
import { useState } from 'react';
import { useCatchCallback, useAsyncTask } from '../../reactHelper';
import { snackBarDurationShortMs } from '../util/duration';
import { useTranslation } from './LocalizationProvider';
import fetchOrThrow from '../util/fetchOrThrow';

const defaultTitleGetter = (item) => item.name;

const LinkField = ({
  label,
  endpointAll,
  endpointLinked,
  baseId,
  keyBase,
  keyLink,
  titleGetter = defaultTitleGetter,
  beforeAdd,
  filter,
  helperText,
}) => {
  const t = useTranslation();
  const [active, setActive] = useState(false);
  const [items, setItems] = useState();
  const [linked, setLinked] = useState();
  const [updated, setUpdated] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const [checking, setChecking] = useState(false);

  useAsyncTask(
    async ({ signal }) => {
      if (active) {
        const response = await fetchOrThrow(endpointAll, { signal });
        setItems(await response.json());
      }
    },
    [active, endpointAll],
  );

  useAsyncTask(
    async ({ signal }) => {
      if (active) {
        const response = await fetchOrThrow(endpointLinked, { signal });
        setLinked(await response.json());
      }
    },
    [active, endpointLinked],
  );

  const onChange = useCatchCallback(
    async (value) => {
      const createBody = (linkId) => ({ [keyBase]: baseId, [keyLink]: linkId });
      const oldValue = linked.map((it) => it.id);
      const newValue = value.map((it) => it.id);
      if (!newValue.find((it) => it < 0)) {
        if (beforeAdd) {
          const addedItems = value.filter((it) => !oldValue.includes(it.id));
          if (addedItems.length) {
            setChecking(true);
            try {
              const problem = await beforeAdd(addedItems);
              if (problem) {
                setBlocked(problem);
                return;
              }
            } finally {
              setChecking(false);
            }
          }
        }
        const results = [];
        newValue
          .filter((it) => !oldValue.includes(it))
          .forEach((added) => {
            results.push(
              fetchOrThrow('/api/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createBody(added)),
              }),
            );
          });
        oldValue
          .filter((it) => !newValue.includes(it))
          .forEach((removed) => {
            results.push(
              fetchOrThrow('/api/permissions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createBody(removed)),
              }),
            );
          });
        await Promise.all(results);
        setUpdated(results.length > 0);
        setLinked(value);
      }
    },
    [linked, baseId, keyBase, keyLink, beforeAdd],
  );

  return (
    <>
      <Autocomplete
        size="small"
        loading={(active && !items) || checking}
        disabled={checking}
        isOptionEqualToValue={(i1, i2) => i1.id === i2.id}
        options={(filter ? items?.filter(filter) : items) || []}
        getOptionLabel={(item) => titleGetter(item)}
        slotProps={{ chip: { size: 'small' } }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            helperText={helperText}
            placeholder={!active ? t('reportShow') : null}
            onFocus={() => setActive(true)}
            slotProps={{
              ...params.slotProps,
              inputLabel: {
                ...params.slotProps?.inputLabel,
                shrink: !active || params.slotProps?.inputLabel?.shrink,
              },
            }}
          />
        )}
        value={(items && linked) || []}
        onChange={(_, value) => onChange(value)}
        multiple
      />
      <Snackbar
        open={Boolean(updated)}
        onClose={() => setUpdated(false)}
        autoHideDuration={snackBarDurationShortMs}
        message={t('sharedSaved')}
      />
      <Snackbar open={Boolean(blocked)} onClose={() => setBlocked(null)} autoHideDuration={8000}>
        <Alert severity="error" onClose={() => setBlocked(null)} variant="filled">
          {blocked}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LinkField;
