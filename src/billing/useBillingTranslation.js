import { useMemo } from 'react';
import { useLocalization } from '../common/components/LocalizationProvider';

// Billing strings live in this module (not in resources/l10n) to keep the
// fork's diff small and avoid merge conflicts with upstream translations.
// Missing languages fall back to English.
const strings = {
  en: {
    billingTitle: 'Billing',
    billingStatus: 'Billing status',
    billingRemaining: 'Remaining',
    billingDays: 'days',
    billingDaysLeft: '{n} days left',
    billingExpiredAgo: 'Expired',
    billingStatusUnset: 'Not set',
    billingStatusActive: 'Active',
    billingStatusWarning: 'Expiring soon',
    billingStatusCritical: 'Critical',
    billingStatusExpired: 'Locked',
    billingAll: 'All',
    billingExtend: 'Record payment & extend',
    billingPeriods: 'Periods',
    billingUnit: 'Unit',
    billingUnitMonth: 'Month(s)',
    billingUnitYear: 'Year(s)',
    billingAmount: 'Amount paid',
    billingPrice: 'Price per period',
    billingReference: 'Payment reference',
    billingBilledTo: 'Billed to',
    billingBilledToDirect: 'Direct customer',
    billingBilledToReseller: 'Reseller',
    billingLastPaid: 'Last payment',
    billingCurrentExpiration: 'Current expiration',
    billingNewExpiration: 'New expiration',
    billingSave: 'Save',
    billingCancel: 'Cancel',
    billingSaved: 'Payment recorded',
    billingReadonlyNote: 'Only administrators can record payments.',
    billingLockNote:
      'When the expiration passes, the server locks the device. Data sent while locked may not be stored.',
  },
  id: {
    billingTitle: 'Billing',
    billingStatus: 'Status tagihan',
    billingRemaining: 'Sisa',
    billingDays: 'hari',
    billingDaysLeft: 'Sisa {n} hari',
    billingExpiredAgo: 'Kedaluwarsa',
    billingStatusUnset: 'Belum diatur',
    billingStatusActive: 'Aktif',
    billingStatusWarning: 'Segera habis',
    billingStatusCritical: 'Kritis',
    billingStatusExpired: 'Terkunci',
    billingAll: 'Semua',
    billingExtend: 'Catat pembayaran & perpanjang',
    billingPeriods: 'Jumlah periode',
    billingUnit: 'Satuan',
    billingUnitMonth: 'Bulan',
    billingUnitYear: 'Tahun',
    billingAmount: 'Jumlah dibayar',
    billingPrice: 'Harga per periode',
    billingReference: 'Referensi pembayaran',
    billingBilledTo: 'Ditagihkan ke',
    billingBilledToDirect: 'Pelanggan langsung',
    billingBilledToReseller: 'Reseller',
    billingLastPaid: 'Pembayaran terakhir',
    billingCurrentExpiration: 'Kedaluwarsa saat ini',
    billingNewExpiration: 'Kedaluwarsa baru',
    billingSave: 'Simpan',
    billingCancel: 'Batal',
    billingSaved: 'Pembayaran tercatat',
    billingReadonlyNote: 'Hanya administrator yang dapat mencatat pembayaran.',
    billingLockNote:
      'Setelah lewat tanggal kedaluwarsa, server mengunci perangkat. Data yang dikirim saat terkunci mungkin tidak tersimpan.',
  },
};

const useBillingTranslation = () => {
  const { language } = useLocalization();
  return useMemo(() => {
    const data = strings[language] || strings.en;
    return (key, params) => {
      let value = data[key] ?? strings.en[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([name, replacement]) => {
          value = value.replace(`{${name}}`, replacement);
        });
      }
      return value;
    };
  }, [language]);
};

export default useBillingTranslation;
