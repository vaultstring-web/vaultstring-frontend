'use client';

import React, { useState } from 'react';
import { Shield, Lock, Smartphone, Mail, X, Loader2 } from 'lucide-react';
import { apiFetch } from '@/src/lib/api/api-client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

const SecuritySettings: React.FC = () => {
  const t = useTranslations('Profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [hasRecoveryEmail, setHasRecoveryEmail] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('toasts.passwordMismatch'));
      return;
    }
    
    setIsLoading(true);
    try {
      await apiFetch('/auth/me/password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        }),
      });
      toast.success(t('toasts.passwordUpdated'));
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error(t('toasts.passwordFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryEmailAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(t('recoveryComingSoon'));
    setShowRecoveryModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <Shield size={20} className="text-slate-400" />
          {t('securitySettingsTitle')}
        </h3>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Lock size={24} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{t('changePassword')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('passwordLastChanged')}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {t('changePassword')}
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{t('recoveryEmail')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {hasRecoveryEmail ? t('recoveryEmailSet') : t('recoveryEmailHint')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowRecoveryModal(true)}
            disabled={hasRecoveryEmail}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              hasRecoveryEmail 
                ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 cursor-default'
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {hasRecoveryEmail ? t('connected') : t('addEmail')}
          </button>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Smartphone size={24} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{t('mfa')}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('mfaSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-200">{t('enabled')}</span>
            </label>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6 border dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('changePassword')}</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('currentPassword')}</label>
                <input 
                  type="password" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('newPassword')}</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('confirmPassword')}</label>
                <input 
                  type="password" 
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {t('updatePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6 border dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recoveryModalTitle')}</h3>
              <button onClick={() => setShowRecoveryModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecoveryEmailAdd} className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t('recoveryModalBody')}
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('recoveryEmailLabel')}</label>
                <input 
                  type="email" 
                  required
                  value={recoveryEmail}
                  onChange={e => setRecoveryEmail(e.target.value)}
                  placeholder={t('recoveryPlaceholder')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {t('addEmail')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
