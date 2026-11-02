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
    billingStartDate: 'Start date',
    billingEndDate: 'End date',
    billingAuto: 'Calculated automatically',
    billingPriceHelp: 'Optional. Used to calculate the amount.',
    billingAmountHelp: 'Required. Amount actually received.',
    billingTotalByPrice: 'Total by price',
    billingReferenceHelp: 'e.g. transfer receipt number or invoice number',
    billingSelectReseller: 'Reseller account',
    billingNoResellers: 'No reseller accounts yet (users with a user limit).',
    billingLegacyReseller: 'Previously typed manually',
    billingActiveUntil: 'Active until',
    billingPeriod: 'Period',
    billingWarnShorter:
      'The new end date is earlier than the current expiration. The subscription will be shortened.',
    billingErrorPeriods: 'Periods must be a whole number from 1 to {max}.',
    billingErrorStart: 'Choose a valid start date.',
    billingErrorAmount: 'Fill in the amount paid.',
    billingErrorReseller: 'Choose the reseller account.',
    billingErrorEndInPast:
      'The end date has already passed; the device would be locked right away.',
    billingDevicesTab: 'Devices',
    billingHistoryTab: 'Payment history',
    billingHistory: 'History',
    billingPaidAt: 'Paid on',
    billingDuration: 'Duration',
    billingRecordedBy: 'Recorded by',
    billingDevice: 'Device',
    billingNoHistory: 'No payments recorded yet.',
    billingHistoryNote:
      'Each device keeps about its last 12 payments. Export regularly for a complete record.',
    billingShowAll: 'Show all devices',
    billingTotalPaid: 'Total',
  },
  id: {
    billingTitle: 'Langganan',
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
    billingStartDate: 'Tanggal mulai',
    billingEndDate: 'Tanggal selesai',
    billingAuto: 'Dihitung otomatis',
    billingPriceHelp: 'Opsional. Dipakai untuk menghitung jumlah.',
    billingAmountHelp: 'Wajib. Jumlah yang benar-benar diterima.',
    billingTotalByPrice: 'Total sesuai harga',
    billingReferenceHelp: 'mis. nomor bukti transfer atau nomor invoice',
    billingSelectReseller: 'Akun reseller',
    billingNoResellers: 'Belum ada akun reseller (user dengan batas user).',
    billingLegacyReseller: 'Sebelumnya diketik manual',
    billingActiveUntil: 'Aktif sampai',
    billingPeriod: 'Periode',
    billingWarnShorter:
      'Tanggal selesai baru lebih awal dari kedaluwarsa saat ini. Masa langganan akan berkurang.',
    billingErrorPeriods: 'Jumlah periode harus angka bulat 1 sampai {max}.',
    billingErrorStart: 'Pilih tanggal mulai yang valid.',
    billingErrorAmount: 'Isi jumlah yang dibayar.',
    billingErrorReseller: 'Pilih akun reseller.',
    billingErrorEndInPast: 'Tanggal selesai sudah lewat; perangkat akan langsung terkunci.',
    billingDevicesTab: 'Perangkat',
    billingHistoryTab: 'Riwayat Pembayaran',
    billingHistory: 'Riwayat',
    billingPaidAt: 'Tanggal bayar',
    billingDuration: 'Durasi',
    billingRecordedBy: 'Dicatat oleh',
    billingDevice: 'Perangkat',
    billingNoHistory: 'Belum ada pembayaran tercatat.',
    billingHistoryNote:
      'Setiap perangkat menyimpan sekitar 12 pembayaran terakhir. Export secara rutin untuk arsip lengkap.',
    billingShowAll: 'Tampilkan semua perangkat',
    billingTotalPaid: 'Total',
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
