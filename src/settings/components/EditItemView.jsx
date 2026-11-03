import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Container,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Skeleton,
  Typography,
  TextField,
} from '@mui/material';
import { useCatch, useAsyncTask } from '../../reactHelper';
import { useTranslation } from '../../common/components/LocalizationProvider';
import PageLayout from '../../common/components/PageLayout';
import useSettingsStyles from '../common/useSettingsStyles';
import fetchOrThrow from '../../common/util/fetchOrThrow';
import { setFlash } from '../../common/util/flash';
import { FormValidationContext } from './FormValidationContext';

const EditItemView = ({
  children,
  endpoint,
  item,
  setItem,
  defaultItem,
  validate,
  onItemSaved,
  menu,
  breadcrumbs,
  hasAdvanced,
}) => {
  const navigate = useNavigate();
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(!hasAdvanced);

  useAsyncTask(
    async ({ signal }) => {
      if (!item) {
        if (id) {
          const response = await fetchOrThrow(`/api/${endpoint}/${id}`, { signal });
          setItem(await response.json());
        } else {
          setItem(defaultItem || {});
        }
      }
    },
    [id, item, defaultItem, endpoint, setItem],
  );

  const handleSave = useCatch(async () => {
    let url = `/api/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }

    const response = await fetchOrThrow(url, {
      method: !id ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    if (onItemSaved) {
      await onItemSaved(await response.json());
    }
    setFlash(t('crudSaved'));
    navigate(-1);
  });

  return (
    <PageLayout menu={menu} breadcrumbs={breadcrumbs}>
      <Container maxWidth="sm" className={classes.container}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {id ? t('crudEditTitle') : t('crudCreateTitle')}
        </Typography>
        {submitted && item && !validate() && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t('formInvalid')}
          </Alert>
        )}
        {item ? (
          <FormValidationContext value={{ submitted, showAdvanced }}>
            {children}
            {hasAdvanced && (
              <Button
                variant="text"
                onClick={() => setShowAdvanced((value) => !value)}
                sx={{ mb: 1 }}
              >
                {t(showAdvanced ? 'userHideAdvanced' : 'userShowAdvanced')}
              </Button>
            )}
          </FormValidationContext>
        ) : (
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography variant="subtitle1">
                <Skeleton width="10em" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={-i} width="100%">
                  <TextField />
                </Skeleton>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          <Button color="inherit" variant="outlined" onClick={() => navigate(-1)} disabled={!item}>
            {t('sharedCancel')}
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              if (validate()) {
                handleSave();
              } else {
                // Keep the button usable and explain what is missing.
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.querySelector('main, [class*="content"]')?.scrollTo?.({ top: 0 });
              }
            }}
            disabled={!item}
          >
            {t('sharedSave')}
          </Button>
        </div>
      </Container>
    </PageLayout>
  );
};

export default EditItemView;
