'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/src/lib/api/api-client';
import { SettingsPageShell } from '@/src/components/settings/SettingsPageShell';
import { SettingsSection } from '@/src/components/enterprise/SettingsSection';
import { TwoFactorSetupDialog } from '@/src/components/settings/TwoFactorSetupDialog';

export default function SettingsSecurityPage() {
  const t = useTranslations('Settings');
  const tProfile = useTranslations('Profile');
  const router = useRouter();

  const [twoFactor, setTwoFactor] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpUrl, setOtpUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupRemaining, setBackupRemaining] = useState(0);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [generatingBackup, setGeneratingBackup] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [data, backup] = await Promise.all([
          apiFetch('/auth/totp/status'),
          apiFetch('/auth/totp/backup-codes/status').catch(() => null),
        ]);
        if (data) setTwoFactor(data.enabled);
        if (backup?.remaining != null) setBackupRemaining(Number(backup.remaining));
      } catch {
        /* ignore */
      }
    };
    fetchSettings();
  }, []);

  const handleTwoFactorToggle = async (checked: boolean) => {
    if (checked) {
      setIs2FALoading(true);
      try {
        const data = await apiFetch('/auth/totp/setup', { method: 'POST' });
        setOtpUrl(data.otp_url);
        setShow2FASetup(true);
      } catch {
        toast.error(t('totp.error'));
      } finally {
        setIs2FALoading(false);
      }
    } else {
      setIs2FALoading(true);
      try {
        await apiFetch('/auth/totp/disable', { method: 'POST' });
        setTwoFactor(false);
        toast.success(t('totp.disabled'));
      } catch {
        toast.error(t('totp.error'));
      } finally {
        setIs2FALoading(false);
      }
    }
  };

  const verifyTOTP = async () => {
    if (verificationCode.length !== 6) return;
    setIsVerifying(true);
    try {
      await apiFetch('/auth/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ code: verificationCode }),
      });
      setTwoFactor(true);
      setShow2FASetup(false);
      setVerificationCode('');
      toast.success(t('totp.enabled'));
    } catch {
      toast.error(t('totp.invalidCode'));
    } finally {
      setIsVerifying(false);
    }
  };

  const generateBackupCodes = async () => {
    setGeneratingBackup(true);
    try {
      const res = await apiFetch('/auth/totp/backup-codes', { method: 'POST' });
      setBackupCodes(Array.isArray(res?.codes) ? res.codes : []);
      setBackupRemaining(Array.isArray(res?.codes) ? res.codes.length : 0);
      toast.success(t('backupCodes.generated', { defaultValue: 'Backup codes generated. Save them now.' }));
    } catch {
      toast.error(t('totp.error'));
    } finally {
      setGeneratingBackup(false);
    }
  };

  return (
    <SettingsPageShell>
      <SettingsSection
        title={t('security.title')}
        description={t('security.subtitle')}
        icon={<Shield className="h-5 w-5" />}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{t('security.twoFactor.title')}</Label>
              <p className="text-sm text-muted-foreground">{t('security.twoFactor.subtitle')}</p>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={handleTwoFactorToggle}
              disabled={is2FALoading}
            />
          </div>
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-sm font-medium">{t('backupCodes.title', { defaultValue: 'Backup codes' })}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('backupCodes.subtitle', { defaultValue: '{count} unused codes', count: backupRemaining })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!twoFactor || generatingBackup}
                onClick={() => void generateBackupCodes()}
              >
                {generatingBackup
                  ? t('saving', { defaultValue: 'Saving…' })
                  : t('backupCodes.generate', { defaultValue: 'Generate new codes' })}
              </Button>
            </div>
            {backupCodes && (
              <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs grid grid-cols-2 gap-2">
                {backupCodes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/profile?tab=security')}>
              {tProfile('changePassword')}
            </Button>
          </div>
        </div>
      </SettingsSection>

      <TwoFactorSetupDialog
        open={show2FASetup}
        onOpenChange={setShow2FASetup}
        otpUrl={otpUrl}
        verificationCode={verificationCode}
        onVerificationCodeChange={setVerificationCode}
        onVerify={verifyTOTP}
        isVerifying={isVerifying}
      />
    </SettingsPageShell>
  );
}
