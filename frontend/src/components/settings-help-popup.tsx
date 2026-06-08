"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  CircleUserRound,
  Database,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Megaphone,
  Monitor,
  Moon,
  Settings,
  Shield,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/components/auth-provider";
import { useDsiqLanguage } from "@/components/i18n-provider";
import { updateFirebaseUserPersonalization } from "@/lib/firebase-user-records";
import {
  isLanguageCode,
  languages,
  type LanguageCode,
} from "@/lib/i18n/languages";
import {
  defaultPersonalizationSettings,
  getEffectivePersonalizationSettings,
  getPersonalizationLabel,
  personalizationOptions,
  saveGuestPersonalizationSettings,
  toProfilePersonalizationUpdates,
  type PersonalizationSettings,
} from "@/lib/personalization";
import {
  updateLocalUserProfile,
  type StoredUserProfile,
} from "@/lib/user-profile-store";
import { useUserProfile } from "@/lib/use-user-profile";

const OPEN_SETTINGS_EVENT = "dsiq:open-settings-help";
const APPEARANCE_STORAGE_KEY = "dsiq-appearance";
const DELETE_CONFIRMATION_TEXT = "DELETE";

const appearanceOptions = [
  { value: "system", labelKey: "settings.appearance.system", icon: Monitor },
  { value: "dark", labelKey: "settings.appearance.dark", icon: Moon },
  { value: "light", labelKey: "settings.appearance.light", icon: Sun },
] as const;

const privatePanels = [
  { id: "general", labelKey: "settings.general", icon: Settings },
  { id: "account", labelKey: "settings.account", icon: CircleUserRound },
  { id: "personalization", labelKey: "settings.personalization", icon: GraduationCap },
  { id: "privacy", labelKey: "settings.privacy", icon: Shield },
  { id: "notifications", labelKey: "settings.notifications", icon: Megaphone },
  { id: "data", labelKey: "settings.dataControls", icon: Database },
] as const;

const publicPanels = [
  { id: "general", labelKey: "settings.general", icon: Settings },
  { id: "personalization", labelKey: "settings.personalization", icon: GraduationCap },
  { id: "data", labelKey: "settings.dataControls", icon: Database },
] as const;

type AppearanceValue = (typeof appearanceOptions)[number]["value"];
type PanelId = (typeof privatePanels)[number]["id"];

export function openSettingsHelpPopup() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getInitialAppearance(): AppearanceValue {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedAppearance = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return appearanceOptions.some((item) => item.value === savedAppearance)
    ? (savedAppearance as AppearanceValue)
    : "system";
}

function applyAppearance(appearance: AppearanceValue) {
  const root = document.documentElement;
  root.dataset.dsiqTheme = appearance;
  root.style.colorScheme =
    appearance === "dark"
      ? "dark"
      : appearance === "light"
        ? "light"
        : "light dark";
}

function getGoalSummary(profile: StoredUserProfile | null, goals?: string[]) {
  const selectedGoals =
    profile?.selectedGoals?.length
      ? profile.selectedGoals
      : goals?.length
        ? goals
        : [];

  return selectedGoals.length ? selectedGoals.join(", ") : "";
}

export function SettingsHelpPopup() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentLanguage, setCurrentLanguage } = useDsiqLanguage();
  const { authMode, changePassword, deleteAccount, user } = useAuth();
  const { answers, profile } = useUserProfile();
  const isPrivateUser = Boolean(user);
  const visiblePanels = isPrivateUser ? privatePanels : publicPanels;

  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId>("general");
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [appearance, setAppearance] =
    useState<AppearanceValue>(getInitialAppearance);
  const [personalization, setPersonalization] =
    useState<PersonalizationSettings>(defaultPersonalizationSettings);
  const [openPersonalizationField, setOpenPersonalizationField] =
    useState<keyof PersonalizationSettings | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const selectedLanguage = useMemo(
    () => languages.find((item) => item.code === currentLanguage) || languages[0],
    [currentLanguage],
  );
  const selectedAppearance = useMemo(
    () =>
      appearanceOptions.find((item) => item.value === appearance) ||
      appearanceOptions[0],
    [appearance],
  );

  useEffect(() => {
    function openPopup() {
      setIsOpen(true);
      setActivePanel("general");
      setDeleteError("");
      setDeleteConfirmText("");
    }

    window.addEventListener(OPEN_SETTINGS_EVENT, openPopup);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openPopup);
  }, []);

  useEffect(() => {
    if (
      activePanel !== "general" &&
      !visiblePanels.some((panel) => panel.id === activePanel)
    ) {
      window.setTimeout(() => setActivePanel("general"), 0);
    }
  }, [activePanel, visiblePanels]);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    setPersonalization(getEffectivePersonalizationSettings(profile));
  }, [profile]);

  useEffect(() => {
    const profileLanguage =
      profile?.preferredLanguage || profile?.languagePreference || null;
    if (!isLanguageCode(profileLanguage)) {
      return;
    }

    if (profileLanguage !== currentLanguage) {
      window.setTimeout(() => {
        void setCurrentLanguage(profileLanguage);
      }, 0);
    }
  }, [
    currentLanguage,
    profile?.languagePreference,
    profile?.preferredLanguage,
    setCurrentLanguage,
  ]);

  function selectAppearance(nextAppearance: AppearanceValue) {
    setAppearance(nextAppearance);
    applyAppearance(nextAppearance);
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, nextAppearance);
    setIsAppearanceOpen(false);
  }

  async function selectLanguage(nextLanguage: LanguageCode) {
    const fixedLanguage = nextLanguage === "auto" ? null : nextLanguage;

    setPersonalization((current) => ({
      ...current,
      preferredLanguage: nextLanguage,
    }));
    await setCurrentLanguage(nextLanguage);
    setIsLanguageOpen(false);
    setToastMessage("Saved ✓");
    window.setTimeout(() => setToastMessage(""), 1200);

    if (!user) {
      return;
    }

    updateLocalUserProfile(user.uid, {
      preferredLanguage: fixedLanguage,
      languagePreference: fixedLanguage,
    });
  }

  async function savePersonalization(
    field: keyof PersonalizationSettings,
    value: PersonalizationSettings[keyof PersonalizationSettings],
  ) {
    const nextSettings = {
      ...personalization,
      [field]: value,
    };
    const updates = toProfilePersonalizationUpdates({ [field]: value });

    setPersonalization(nextSettings);
    setOpenPersonalizationField(null);
    saveGuestPersonalizationSettings({ [field]: value });
    setToastMessage("Saved ✓");
    window.setTimeout(() => setToastMessage(""), 1200);

    if (field === "preferredLanguage") {
      const nextLanguage = value as LanguageCode;
      await setCurrentLanguage(nextLanguage);
    }

    if (!user) {
      return;
    }

    updateLocalUserProfile(user.uid, updates);

    if (authMode === "firebase") {
      try {
        await updateFirebaseUserPersonalization({
          uid: user.uid,
          updates,
        });
      } catch (error) {
        console.warn("Personalization sync failed.", error);
      }
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== DELETE_CONFIRMATION_TEXT) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteError("");
      await deleteAccount();
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      setToastMessage(t("settings.delete.success"));
      await wait(900);
      router.replace("/");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : t("settings.delete.failed"),
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  async function handleChangePassword() {
    setChangePasswordError("");

    if (!currentPassword) {
      setChangePasswordError(t("settings.account.currentPasswordRequired"));
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError(t("settings.account.weakPassword"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError(t("settings.account.passwordMismatch"));
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordOpen(false);
      setToastMessage(t("settings.account.passwordChanged"));
    } catch (error) {
      setChangePasswordError(
        error instanceof Error
          ? error.message
          : t("settings.account.passwordChangeFailed"),
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  function exportData() {
    if (typeof window === "undefined") {
      return;
    }

    const data = {
      exportedAt: new Date().toISOString(),
      profile,
      onboarding: answers,
      settings: {
        appearance,
        language: currentLanguage,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dsiq-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {toastMessage ? <Toast message={toastMessage} /> : null}

      {isOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 px-4 py-8 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="grid max-h-[85vh] w-full max-w-[820px] grid-cols-1 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] shadow-[0_26px_80px_rgba(0,0,0,0.22)] md:grid-cols-[230px_minmax(0,1fr)]"
          >
            <aside className="settings-sidebar shrink-0 border-b border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-3 md:border-b-0 md:border-r">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{t("settings.title")}</p>
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-line)] md:hidden"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex gap-2 overflow-x-auto pb-1 md:block md:space-y-1 md:overflow-visible md:pb-0">
                {visiblePanels.map((panel) => {
                  const Icon = panel.icon;
                  const isActive = activePanel === panel.id;

                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setActivePanel(panel.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition md:w-full md:gap-3 md:py-3 ${
                        isActive
                          ? "bg-[color:var(--color-surface)] shadow-[0_8px_22px_rgba(0,0,0,0.06)]"
                          : "hover:bg-[color:var(--color-surface)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {t(panel.labelKey)}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="settings-content min-h-[430px] max-h-[85vh] overflow-y-auto p-5 pb-8 sm:p-6 sm:pb-8">
              <div className="mb-5 hidden items-center justify-end md:flex">
                <button
                  type="button"
                  aria-label={t("common.close")}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {activePanel === "general" ? (
                <GeneralPanel
                  appearance={appearance}
                  isAppearanceOpen={isAppearanceOpen}
                  isLanguageOpen={isLanguageOpen}
                  language={currentLanguage}
                  selectedAppearance={selectedAppearance}
                  selectedLanguage={selectedLanguage}
                  onAppearanceOpenChange={setIsAppearanceOpen}
                  onLanguageOpenChange={setIsLanguageOpen}
                  onSelectAppearance={selectAppearance}
                  onSelectLanguage={(nextLanguage) => void selectLanguage(nextLanguage)}
                />
              ) : null}

              {activePanel === "account" && isPrivateUser ? (
                <AccountPanel
                  email={user?.email || t("settings.account.noEmail")}
                  providerLabel={
                    user?.email
                      ? t("settings.account.providerEmail")
                      : t("settings.account.providerConnected")
                  }
                  onChangePassword={() => {
                    setChangePasswordError("");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setIsChangePasswordOpen(true);
                  }}
                />
              ) : null}

              {activePanel === "personalization" ? (
                <PersonalizationPanel
                  openField={openPersonalizationField}
                  personalization={personalization}
                  onOpenField={(field) =>
                    setOpenPersonalizationField((current) =>
                      current === field ? null : field,
                    )
                  }
                  onSave={(field, value) => void savePersonalization(field, value)}
                />
              ) : null}

              {activePanel === "privacy" && isPrivateUser ? (
                <PrivacyPanel
                  onDeleteAccount={() => {
                    setDeleteConfirmText("");
                    setDeleteError("");
                    setIsDeleteModalOpen(true);
                  }}
                  onExportData={exportData}
                />
              ) : null}

              {activePanel === "notifications" && isPrivateUser ? (
                <NotificationsPanel />
              ) : null}

              {activePanel === "data" ? (
                <DataControlsPanel
                  isPrivateUser={isPrivateUser}
                  languageLabel={
                    selectedLanguage.code === "auto"
                      ? selectedLanguage.label
                      : selectedLanguage.label
                  }
                />
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteAccountModal
          confirmText={deleteConfirmText}
          error={deleteError}
          isDeleting={isDeletingAccount}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={() => void handleDeleteAccount()}
          onConfirmTextChange={setDeleteConfirmText}
        />
      ) : null}

      {isChangePasswordOpen ? (
        <ChangePasswordModal
          confirmPassword={confirmPassword}
          currentPassword={currentPassword}
          error={changePasswordError}
          isSaving={isChangingPassword}
          newPassword={newPassword}
          onCancel={() => setIsChangePasswordOpen(false)}
          onConfirm={() => void handleChangePassword()}
          onConfirmPasswordChange={setConfirmPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
        />
      ) : null}
    </>
  );
}

function GeneralPanel({
  appearance,
  isAppearanceOpen,
  isLanguageOpen,
  language,
  onAppearanceOpenChange,
  onLanguageOpenChange,
  onSelectAppearance,
  onSelectLanguage,
  selectedAppearance,
  selectedLanguage,
}: {
  appearance: AppearanceValue;
  isAppearanceOpen: boolean;
  isLanguageOpen: boolean;
  language: LanguageCode;
  onAppearanceOpenChange: (value: boolean | ((current: boolean) => boolean)) => void;
  onLanguageOpenChange: (value: boolean | ((current: boolean) => boolean)) => void;
  onSelectAppearance: (value: AppearanceValue) => void;
  onSelectLanguage: (value: LanguageCode) => void;
  selectedAppearance: (typeof appearanceOptions)[number];
  selectedLanguage: (typeof languages)[number];
}) {
  const { t } = useTranslation();
  const selectedAppearanceLabel = t(selectedAppearance.labelKey);
  const selectedLanguageLabel =
    selectedLanguage.code === "auto"
      ? selectedLanguage.label
      : selectedLanguage.label;

  return (
    <div>
      <PanelTitle title={t("settings.general")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <SettingRow
          description={t("settings.appearance.description")}
          title={t("settings.appearance")}
        >
          <DropdownButton
            expanded={isAppearanceOpen}
            label={selectedAppearanceLabel}
            onClick={() => {
              onAppearanceOpenChange((value) => !value);
              onLanguageOpenChange(false);
            }}
          />
          {isAppearanceOpen ? (
            <DropdownMenu>
              {appearanceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownOption
                    key={option.value}
                    checked={appearance === option.value}
                    icon={<Icon className="h-4 w-4" aria-hidden="true" />}
                    label={t(option.labelKey)}
                    onClick={() => onSelectAppearance(option.value)}
                  />
                );
              })}
            </DropdownMenu>
          ) : null}
        </SettingRow>

        <SettingRow
          description={t("settings.language.description")}
          title={t("settings.language")}
        >
          <DropdownButton
            expanded={isLanguageOpen}
            label={selectedLanguageLabel}
            onClick={() => {
              onLanguageOpenChange((value) => !value);
              onAppearanceOpenChange(false);
            }}
          />
          {isLanguageOpen ? (
            <DropdownMenu scroll>
              {languages.map((option) => (
                <DropdownOption
                  key={option.code}
                  checked={language === option.code}
                  label={
                    option.code === "auto"
                      ? option.label
                      : option.label
                  }
                  onClick={() => onSelectLanguage(option.code)}
                />
              ))}
            </DropdownMenu>
          ) : null}
        </SettingRow>

        <SettingRow
          description={t("settings.accessibility.description")}
          title={t("settings.accessibility")}
        >
          <span className="text-sm font-medium text-[color:var(--color-muted)]">
            {t("settings.accessibility.optimized")}
          </span>
        </SettingRow>
      </div>
    </div>
  );
}

function AccountPanel({
  email,
  onChangePassword,
  providerLabel,
}: {
  email: string;
  onChangePassword: () => void;
  providerLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <PanelTitle title={t("settings.account")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <InfoRow icon={<FileText />} label={t("settings.account.email")} value={email} />
        <InfoRow
          icon={<Shield />}
          label={t("settings.account.connectedProviders")}
          value={providerLabel}
        />
        <ActionRow
          icon={<Shield />}
          label={t("settings.account.changePassword")}
          onClick={onChangePassword}
        />
      </div>
    </div>
  );
}

function PersonalizationPanel({
  onOpenField,
  onSave,
  openField,
  personalization,
}: {
  onOpenField: (field: keyof PersonalizationSettings) => void;
  onSave: (
    field: keyof PersonalizationSettings,
    value: PersonalizationSettings[keyof PersonalizationSettings],
  ) => void;
  openField: keyof PersonalizationSettings | null;
  personalization: PersonalizationSettings;
}) {
  const { t } = useTranslation();
  const languageOptions = languages.map((languageOption) => ({
    value: languageOption.code,
    label:
      languageOption.code === "auto"
        ? languageOption.label
        : languageOption.label,
  }));

  return (
    <div>
      <PanelTitle title={t("settings.personalization")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <PersonalizationDropdownRow
          description="Main result DSIQ should guide you toward."
          field="learningGoals"
          icon={<BookOpen />}
          label={t("settings.personalization.learningGoals")}
          openField={openField}
          options={personalizationOptions.learningGoals}
          value={personalization.learningGoals[0] || ""}
          valueLabel={getPersonalizationLabel("learningGoals", personalization.learningGoals)}
          onOpenField={onOpenField}
          onSave={(value) => onSave("learningGoals", value ? [value] : [])}
        />
        <PersonalizationDropdownRow
          description="How your AI Teacher should explain and guide."
          field="aiTeacherStyle"
          icon={<GraduationCap />}
          label={t("settings.personalization.aiTeacherStyle")}
          openField={openField}
          options={personalizationOptions.aiTeacherStyle}
          value={personalization.aiTeacherStyle}
          valueLabel={getPersonalizationLabel("aiTeacherStyle", personalization.aiTeacherStyle)}
          onOpenField={onOpenField}
          onSave={(value) => onSave("aiTeacherStyle", value)}
        />
        <PersonalizationDropdownRow
          description="How DSIQ should protect your focus."
          field="focusPreference"
          icon={<Eye />}
          label={t("settings.personalization.focusPreferences")}
          openField={openField}
          options={personalizationOptions.focusPreference}
          value={personalization.focusPreference}
          valueLabel={getPersonalizationLabel("focusPreference", personalization.focusPreference)}
          onOpenField={onOpenField}
          onSave={(value) => onSave("focusPreference", value)}
        />
        <PersonalizationDropdownRow
          description="Your current skill level."
          field="experienceLevel"
          icon={<GraduationCap />}
          label={t("settings.personalization.experienceLevel")}
          openField={openField}
          options={personalizationOptions.experienceLevel}
          value={personalization.experienceLevel}
          valueLabel={getPersonalizationLabel("experienceLevel", personalization.experienceLevel)}
          onOpenField={onOpenField}
          onSave={(value) => onSave("experienceLevel", value)}
        />
        <PersonalizationDropdownRow
          description="The lesson format that helps you learn fastest."
          field="preferredLearningStyle"
          icon={<BookOpen />}
          label={t("settings.personalization.learningStyle")}
          openField={openField}
          options={personalizationOptions.preferredLearningStyle}
          value={personalization.preferredLearningStyle}
          valueLabel={getPersonalizationLabel(
            "preferredLearningStyle",
            personalization.preferredLearningStyle,
          )}
          onOpenField={onOpenField}
          onSave={(value) => onSave("preferredLearningStyle", value)}
        />
        <PersonalizationDropdownRow
          description="Default is Auto Detect. Pick a language only if DSIQ should always use it."
          field="preferredLanguage"
          icon={<BookOpen />}
          label={t("settings.language")}
          openField={openField}
          options={languageOptions}
          placement="up"
          scroll
          value={personalization.preferredLanguage}
          valueLabel={getPersonalizationLabel(
            "preferredLanguage",
            personalization.preferredLanguage,
          )}
          onOpenField={onOpenField}
          onSave={(value) => onSave("preferredLanguage", value)}
        />
      </div>
    </div>
  );
}

function PersonalizationDropdownRow({
  description,
  field,
  label,
  onOpenField,
  onSave,
  openField,
  options,
  placement = "down",
  scroll,
  value,
  valueLabel,
}: {
  description: string;
  field: keyof PersonalizationSettings;
  icon: React.ReactElement;
  label: string;
  onOpenField: (field: keyof PersonalizationSettings) => void;
  onSave: (value: string) => void;
  openField: keyof PersonalizationSettings | null;
  options: ReadonlyArray<{ value: string; label: string }>;
  placement?: "down" | "up";
  scroll?: boolean;
  value: string;
  valueLabel: string;
}) {
  const isOpen = openField === field;

  return (
    <SettingRow description={description} title={label}>
      <DropdownButton
        expanded={isOpen}
        label={valueLabel}
        onClick={() => onOpenField(field)}
      />
      {isOpen ? (
        <DropdownMenu placement={placement} scroll={scroll}>
          {options.map((option) => (
            <DropdownOption
              key={option.value}
              checked={value === option.value}
              label={option.label}
              onClick={() => onSave(option.value)}
            />
          ))}
        </DropdownMenu>
      ) : null}
    </SettingRow>
  );
}

function PrivacyPanel({
  onDeleteAccount,
  onExportData,
}: {
  onDeleteAccount: () => void;
  onExportData: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <PanelTitle title={t("settings.privacy")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <InfoRow
          icon={<Trash2 />}
          label={t("settings.privacy.clearChatHistory")}
          value={t("settings.privacy.clearChatHistoryValue")}
        />
        <ActionRow
          icon={<FileText />}
          label={t("settings.privacy.exportData")}
          onClick={onExportData}
        />
        <InfoRow
          icon={<Shield />}
          label={t("settings.privacy.aiMemoryControls")}
          value={t("settings.privacy.aiMemoryControlsValue")}
        />
        <ActionRow
          danger
          icon={<Trash2 />}
          label={t("settings.privacy.deleteAccount")}
          onClick={onDeleteAccount}
        />
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const { t } = useTranslation();

  return (
    <div>
      <PanelTitle title={t("settings.notifications")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <InfoRow
          icon={<FileText />}
          label={t("settings.notifications.email")}
          value={t("settings.notifications.off")}
        />
        <InfoRow
          icon={<Megaphone />}
          label={t("settings.notifications.studyReminders")}
          value={t("settings.notifications.off")}
        />
        <InfoRow
          icon={<HelpCircle />}
          label={t("settings.notifications.focusReminders")}
          value={t("settings.notifications.off")}
        />
      </div>
    </div>
  );
}

function DataControlsPanel({
  isPrivateUser,
  languageLabel,
}: {
  isPrivateUser: boolean;
  languageLabel: string;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <PanelTitle title={t("settings.dataControls")} />
      <div className="mt-7 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-4">
        <p className="text-sm font-semibold">{t("settings.data.savedPreferences")}</p>
        <p className="mt-2 text-sm leading-7 text-[color:var(--color-muted)]">
          {t("settings.data.savedPreferencesDescription")}
          {" "}
          <span className="font-semibold text-[color:var(--color-text)]">
            {languageLabel}
          </span>
          .
        </p>
        {isPrivateUser ? (
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
            {t("settings.data.cloudSyncDescription")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function DeleteAccountModal({
  confirmText,
  error,
  isDeleting,
  onCancel,
  onConfirm,
  onConfirmTextChange,
}: {
  confirmText: string;
  error: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onConfirmTextChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
              {t("settings.delete.title")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
              {t("settings.delete.description")}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onCancel}
            disabled={isDeleting}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
            {t("settings.delete.typeDelete")}
          </span>
          <input
            type="text"
            value={confirmText}
            onChange={(event) => onConfirmTextChange(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmText !== DELETE_CONFIRMATION_TEXT || isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? <LoadingSpinner /> : null}
            {t("settings.delete.confirm")}
          </button>
        </div>
      </section>
    </div>
  );
}

function ChangePasswordModal({
  confirmPassword,
  currentPassword,
  error,
  isSaving,
  newPassword,
  onCancel,
  onConfirm,
  onConfirmPasswordChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
}: {
  confirmPassword: string;
  currentPassword: string;
  error: string;
  isSaving: boolean;
  newPassword: string;
  onCancel: () => void;
  onConfirm: () => void;
  onConfirmPasswordChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
              {t("settings.account.changePassword")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
              {t("settings.account.changePasswordDescription")}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onCancel}
            disabled={isSaving}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <PasswordField
            label={t("settings.account.currentPassword")}
            value={currentPassword}
            onChange={onCurrentPasswordChange}
          />
          <PasswordField
            label={t("settings.account.newPassword")}
            value={newPassword}
            onChange={onNewPasswordChange}
          />
          <PasswordField
            label={t("settings.account.confirmNewPassword")}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                {t("common.saving")}
              </>
            ) : (
              t("settings.account.savePassword")
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
      />
    </label>
  );
}

function PanelTitle({ title }: { title: string }) {
  return (
    <h2 id="settings-title" className="text-center text-lg font-semibold">
      {title}
    </h2>
  );
}

function SettingRow({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_280px] sm:items-start">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted)]">
          {description}
        </p>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 truncate text-xs text-[color:var(--color-muted)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function ActionRow({
  danger,
  icon,
  label,
  onClick,
}: {
  danger?: boolean;
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 py-4 text-left transition hover:text-black ${
        danger ? "text-red-600" : "text-[color:var(--color-text)]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          danger
            ? "bg-red-50 text-red-600"
            : "bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)]"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function DropdownButton({
  expanded,
  label,
  onClick,
}: {
  expanded: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 text-xs font-medium transition hover:bg-[color:var(--color-surface-strong)] sm:text-sm"
      aria-expanded={expanded}
    >
      <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
      <ChevronDown className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function DropdownMenu({
  children,
  placement = "down",
  scroll,
}: {
  children: React.ReactNode;
  placement?: "down" | "up";
  scroll?: boolean;
}) {
  return (
    <div
      className={`absolute right-0 z-30 w-full rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.14)] ${
        placement === "up" ? "bottom-12" : "top-12"
      } ${
        scroll ? "max-h-72 overflow-y-auto" : ""
      }`}
    >
      {children}
    </div>
  );
}

function DropdownOption({
  checked,
  icon,
  label,
  onClick,
}: {
  checked: boolean;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-[color:var(--color-surface-strong)] sm:text-sm"
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate whitespace-nowrap">{label}</span>
      </span>
      {checked ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed left-1/2 top-4 z-[110] -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-[0_14px_34px_rgba(15,23,42,0.12)] transition">
      {message}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span
      className="block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-label="Loading"
    />
  );
}
