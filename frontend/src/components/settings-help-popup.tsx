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
import {
  clearUserChatHistory,
  exportUserChatHistory,
  listBookmarkedPrivateChats,
} from "@/lib/firebase-chat-store";
import {
  defaultDataControlPreferences,
  getEffectiveDataControlPreferences,
  getGuestDataControlPreferences,
  getLocalUserDataControlPreferences,
  loadFirebaseDataControlPreferences,
  saveFirebaseDataControlPreferences,
  saveLocalDataControlPreferences,
  type DataControlPreferences,
} from "@/lib/data-control-preferences";
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
  defaultNotificationPreferences,
  getEffectiveNotificationPreferences,
  getGuestNotificationPreferences,
  getLocalUserNotificationPreferences,
  loadFirebaseNotificationPreferences,
  saveFirebaseNotificationPreferences,
  saveLocalNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notification-preferences";
import {
  clearRoadmapMemory,
  listRoadmaps,
  type Roadmap,
} from "@/lib/roadmap-store";
import {
  updateLocalUserProfile,
} from "@/lib/user-profile-store";
import { useUserProfile } from "@/lib/use-user-profile";

const OPEN_SETTINGS_EVENT = "dsiq:open-settings-help";
const APPEARANCE_STORAGE_KEY = "dsiq-appearance";
const DELETE_CONFIRMATION_TEXT = "DELETE";
const CHAT_HISTORY_CLEARED_EVENT = "dsiq:chat-history-cleared";

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
  { id: "notifications", labelKey: "settings.notifications", icon: Megaphone },
  { id: "data", labelKey: "settings.dataControls", icon: Database },
] as const;

type AppearanceValue = (typeof appearanceOptions)[number]["value"];
type PanelId = (typeof privatePanels)[number]["id"];

function canChangeAccountPassword(user: { providerIds?: string[] } | null) {
  if (!user?.providerIds?.length) {
    return true;
  }

  return user.providerIds.includes("password");
}

function getProviderLabel(providerIds?: string[]) {
  if (!providerIds?.length) {
    return "Email / connected provider";
  }

  if (providerIds.includes("password")) {
    return "Email / password";
  }

  if (providerIds.includes("google.com")) {
    return "Google";
  }

  if (providerIds.includes("apple.com")) {
    return "Apple";
  }

  return "Connected provider";
}

export function openSettingsHelpPopup() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function clearDsiqBrowserCache(uid?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const removablePrefixes = [
    "dsiq.private-chats.",
    "dsiq.roadmaps.",
    "dsiq.profile.",
    "dsiq.personalization.",
    "dsiq.notification-preferences.",
    "dsiq.data-control-preferences.",
  ];
  const removableKeys = [
    "dsiq.guest.chat",
    "dsiq.current.public-chat-id",
    "dsiq.notification-preferences.guest",
    "dsiq.data-control-preferences.guest",
    "dsiq-language",
    APPEARANCE_STORAGE_KEY,
  ];

  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (!key) {
      continue;
    }

    if (
      removableKeys.includes(key) ||
      removablePrefixes.some((prefix) => key.startsWith(prefix)) ||
      (uid && key.includes(uid))
    ) {
      window.localStorage.removeItem(key);
    }
  }

  window.sessionStorage.removeItem("dsiq.guest.chat");
  window.sessionStorage.removeItem("dsiq.current.public-chat-id");
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
  const [isClearChatsConfirmOpen, setIsClearChatsConfirmOpen] = useState(false);
  const [isClearingChats, setIsClearingChats] = useState(false);
  const [isMemoryControlsOpen, setIsMemoryControlsOpen] = useState(false);
  const [isPrivacyActionBusy, setIsPrivacyActionBusy] = useState(false);
  const [privacyActionError, setPrivacyActionError] = useState("");
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
      clearDsiqBrowserCache(user?.uid);
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
      setChangePasswordError("Weak password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordOpen(false);
      setToastMessage("Password updated successfully.");
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

  function showPrivacySuccess(message: string) {
    setPrivacyActionError("");
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1400);
  }

  async function handleClearChatHistory() {
    if (!user) {
      setPrivacyActionError("Sign in again before clearing chat history.");
      return;
    }

    try {
      setIsClearingChats(true);
      setPrivacyActionError("");
      await clearUserChatHistory(user.uid);
      window.dispatchEvent(new Event(CHAT_HISTORY_CLEARED_EVENT));
      setIsClearChatsConfirmOpen(false);
      showPrivacySuccess("Chat history cleared");
    } catch (error) {
      setPrivacyActionError(
        error instanceof Error ? error.message : "Action failed, try again",
      );
    } finally {
      setIsClearingChats(false);
    }
  }

  async function resetAiPersonalization() {
    const updates = toProfilePersonalizationUpdates(defaultPersonalizationSettings);

    setIsPrivacyActionBusy(true);
    setPrivacyActionError("");
    try {
      setPersonalization(defaultPersonalizationSettings);
      saveGuestPersonalizationSettings(defaultPersonalizationSettings);
      await setCurrentLanguage("auto");

      if (user) {
        updateLocalUserProfile(user.uid, updates);
      }

      if (user && authMode === "firebase") {
        await updateFirebaseUserPersonalization({
          uid: user.uid,
          updates,
        });
      }

      showPrivacySuccess("AI memory reset");
    } catch (error) {
      setPrivacyActionError(
        error instanceof Error ? error.message : "Action failed, try again",
      );
    } finally {
      setIsPrivacyActionBusy(false);
    }
  }

  async function resetRoadmapMemory() {
    setIsPrivacyActionBusy(true);
    setPrivacyActionError("");
    try {
      if (user) {
        await clearRoadmapMemory(user.uid);
      } else if (typeof window !== "undefined") {
        window.localStorage.removeItem("dsiq.roadmaps.guest");
        window.localStorage.removeItem("dsiq.roadmaps.local-guest");
      }
      showPrivacySuccess("Learning progress reset");
    } catch (error) {
      setPrivacyActionError(
        error instanceof Error ? error.message : "Action failed, try again",
      );
    } finally {
      setIsPrivacyActionBusy(false);
    }
  }

  async function resetAiTeacherMemory() {
    setIsPrivacyActionBusy(true);
    setPrivacyActionError("");
    try {
      if (user) {
        await clearUserChatHistory(user.uid, "teacher");
      } else if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("dsiq.guest.chat");
      }
      window.dispatchEvent(new Event(CHAT_HISTORY_CLEARED_EVENT));
      showPrivacySuccess("AI memory reset");
    } catch (error) {
      setPrivacyActionError(
        error instanceof Error ? error.message : "Action failed, try again",
      );
    } finally {
      setIsPrivacyActionBusy(false);
    }
  }

  async function exportData() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const guestMessages =
        !user && typeof window !== "undefined"
          ? JSON.parse(window.sessionStorage.getItem("dsiq.guest.chat") || "[]")
          : [];
      const chats = user ? await exportUserChatHistory(user.uid) : [];
      const roadmaps = user ? await listRoadmaps(user.uid) : [];
      const savedChats = user ? await listBookmarkedPrivateChats(user.uid) : [];
      const aiTeacherChats = chats.filter((chat) => chat.chatType === "teacher");
      const normalChats = chats.filter((chat) => chat.chatType !== "teacher");
      const effectivePersonalization = getEffectivePersonalizationSettings(profile);
      const notificationPreferences = getEffectiveNotificationPreferences(
        profile,
        user?.uid,
      );
      const dataControlPreferences = getEffectiveDataControlPreferences(
        profile,
        user?.uid,
      );
      const data = {
        exportedAt: new Date().toISOString(),
        profile,
        onboarding: answers,
        settings: {
          appearance,
          language: currentLanguage,
          dataControlPreferences,
          notificationPreferences,
        },
        personalization: effectivePersonalization,
        chatHistory: user ? normalChats : guestMessages,
        savedChats,
        aiTeacherChats,
        learningRoadmaps: roadmaps,
        progressData: {
          roadmaps: roadmaps.map((roadmap) => ({
            completedLessonIds: roadmap.completedLessonIds || [],
            currentActiveMissionId: roadmap.currentActiveMissionId || "",
            id: roadmap.id,
            progressPercentage: roadmap.progressPercentage || 0,
            title: roadmap.title,
          })),
        },
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "dsiq-user-data.json";
      anchor.click();
      URL.revokeObjectURL(url);
      showPrivacySuccess("Data exported");
    } catch (error) {
      setPrivacyActionError(
        error instanceof Error ? error.message : "Action failed, try again",
      );
    }
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
                  canChangePassword={canChangeAccountPassword(user)}
                  email={user?.email || t("settings.account.noEmail")}
                  providerLabel={getProviderLabel(user?.providerIds)}
                  onChangePassword={() => {
                    if (!canChangeAccountPassword(user)) {
                      return;
                    }
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
                  error={privacyActionError}
                  onClearChatHistory={() => {
                    setPrivacyActionError("");
                    setIsClearChatsConfirmOpen(true);
                  }}
                  onDeleteAccount={() => {
                    setDeleteConfirmText("");
                    setDeleteError("");
                    setIsDeleteModalOpen(true);
                  }}
                  onExportData={exportData}
                  onOpenMemoryControls={() => {
                    setPrivacyActionError("");
                    setIsMemoryControlsOpen(true);
                  }}
                />
              ) : null}

              {activePanel === "notifications" ? (
                <NotificationsPanel
                  authMode={authMode}
                  onSaved={() => {
                    setToastMessage("Saved ✓");
                    window.setTimeout(() => setToastMessage(""), 1200);
                  }}
                  userId={user?.uid}
                />
              ) : null}

              {activePanel === "data" ? (
                <DataControlsPanel
                  authMode={authMode}
                  isPrivateUser={isPrivateUser}
                  languageLabel={
                    selectedLanguage.code === "auto"
                      ? selectedLanguage.label
                      : selectedLanguage.label
                  }
                  onExportData={exportData}
                  onOpenMemoryControls={() => {
                    setPrivacyActionError("");
                    setIsMemoryControlsOpen(true);
                  }}
                  onResetLearningData={() => void resetRoadmapMemory()}
                  onSaved={() => {
                    setToastMessage("Saved ✓");
                    window.setTimeout(() => setToastMessage(""), 1200);
                  }}
                  profile={profile}
                  userId={user?.uid}
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

      {isClearChatsConfirmOpen ? (
        <ConfirmActionModal
          confirmLabel="Clear chat history"
          description="This clears your DSIQ chat history and saved chat bookmarks. Your Learning Roadmap will not be deleted."
          error={privacyActionError}
          isWorking={isClearingChats}
          title="Clear chat history?"
          onCancel={() => setIsClearChatsConfirmOpen(false)}
          onConfirm={() => void handleClearChatHistory()}
        />
      ) : null}

      {isMemoryControlsOpen ? (
        <AiMemoryControlsModal
          error={privacyActionError}
          isWorking={isPrivacyActionBusy}
          personalization={personalization}
          onCancel={() => setIsMemoryControlsOpen(false)}
          onResetAiPersonalization={() => void resetAiPersonalization()}
          onResetAiTeacherMemory={() => void resetAiTeacherMemory()}
          onResetRoadmapMemory={() => void resetRoadmapMemory()}
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
  canChangePassword,
  email,
  onChangePassword,
  providerLabel,
}: {
  canChangePassword: boolean;
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
          disabled={!canChangePassword}
          description={
            canChangePassword
              ? undefined
              : "Your password is managed by your login provider."
          }
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
  error,
  onClearChatHistory,
  onDeleteAccount,
  onExportData,
  onOpenMemoryControls,
}: {
  error: string;
  onClearChatHistory: () => void;
  onDeleteAccount: () => void;
  onExportData: () => void;
  onOpenMemoryControls: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      <PanelTitle title={t("settings.privacy")} />
      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <ActionRow
          icon={<Trash2 />}
          label={t("settings.privacy.clearChatHistory")}
          onClick={onClearChatHistory}
        />
        <ActionRow
          icon={<FileText />}
          label={t("settings.privacy.exportData")}
          onClick={onExportData}
        />
        <ActionRow
          icon={<Shield />}
          label={t("settings.privacy.aiMemoryControls")}
          onClick={onOpenMemoryControls}
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

const reminderDays = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

function getCurrentMissionTitle(roadmap?: Roadmap) {
  return (
    roadmap?.steps.find((step) => step.id === roadmap.currentActiveMissionId)?.title ||
    roadmap?.steps.find((step) => !step.completed)?.title ||
    roadmap?.steps[0]?.title ||
    "your current mission"
  );
}

function getNotificationPermissionState() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  return window.Notification.permission;
}

async function requestNotificationPermissionIfNeeded() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  if (window.Notification.permission !== "default") {
    return window.Notification.permission;
  }

  return window.Notification.requestPermission();
}

function NotificationsPanel({
  authMode,
  onSaved,
  userId,
}: {
  authMode: string;
  onSaved: () => void;
  userId?: string;
}) {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    defaultNotificationPreferences,
  );
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [permissionState, setPermissionState] = useState<
    NotificationPermission | "unsupported"
  >(getNotificationPermissionState);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      const localPreferences = userId
        ? getLocalUserNotificationPreferences(userId)
        : getGuestNotificationPreferences();

      if (isMounted) {
        setPreferences(localPreferences);
        setPermissionState(
          localPreferences.browserNotificationPermission ||
            getNotificationPermissionState(),
        );
      }

      if (userId) {
        try {
          const roadmaps = await listRoadmaps(userId);
          if (isMounted) {
            setActiveRoadmap(roadmaps[0]);
          }
        } catch {
          if (isMounted) {
            setActiveRoadmap(undefined);
          }
        }
      }

      if (authMode === "firebase" && userId && !userId.startsWith("local-")) {
        try {
          const firebasePreferences = await loadFirebaseNotificationPreferences(userId);
          if (firebasePreferences && isMounted) {
            setPreferences(firebasePreferences);
            saveLocalNotificationPreferences(firebasePreferences, userId);
            setPermissionState(
              firebasePreferences.browserNotificationPermission ||
                getNotificationPermissionState(),
            );
          }
        } catch (error) {
          console.warn("Notification preferences could not load from Firestore.", error);
        }
      }
    }

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [authMode, userId]);

  async function savePreferences(nextPreferences: NotificationPreferences) {
    setPreferences(nextPreferences);
    saveLocalNotificationPreferences(nextPreferences, userId);
    onSaved();

    if (authMode !== "firebase" || !userId || userId.startsWith("local-")) {
      return;
    }

    try {
      setIsSyncing(true);
      await saveFirebaseNotificationPreferences(userId, nextPreferences);
    } catch (error) {
      console.warn("Notification preferences could not sync to Firestore.", error);
    } finally {
      setIsSyncing(false);
    }
  }

  async function updatePreferences(
    updater: (current: NotificationPreferences) => NotificationPreferences,
    needsBrowserPermission = false,
  ) {
    let nextPreferences = updater(preferences);

    if (needsBrowserPermission) {
      const nextPermission = await requestNotificationPermissionIfNeeded();
      setPermissionState(nextPermission);
      nextPreferences = {
        ...nextPreferences,
        browserNotificationPermission: nextPermission,
      };
    }

    await savePreferences(nextPreferences);
  }

  const currentMission = getCurrentMissionTitle(activeRoadmap);
  const roadmapTitle = activeRoadmap?.title || "your roadmap";
  const progress = activeRoadmap?.progressPercentage || 0;

  return (
    <div>
      <PanelTitle title={t("settings.notifications")} />
      <div className="mt-7 divide-y divide-[color:var(--color-line)]">
        <NotificationSection
          description="Receive account, DSIQ, and roadmap progress updates."
          icon={<FileText />}
          isOn={preferences.emailNotifications}
          label={t("settings.notifications.email")}
          onToggle={() =>
            void updatePreferences((current) => ({
              ...current,
              emailNotifications: !current.emailNotifications,
            }))
          }
        >
          {preferences.emailNotifications ? (
            <div className="mt-4 grid gap-2">
              <CheckboxLine
                checked={preferences.emailTopics.accountUpdates}
                label="Account updates"
                onChange={() =>
                  void updatePreferences((current) => ({
                    ...current,
                    emailTopics: {
                      ...current.emailTopics,
                      accountUpdates: !current.emailTopics.accountUpdates,
                    },
                  }))
                }
              />
              <CheckboxLine
                checked={preferences.emailTopics.importantUpdates}
                label="Important DSIQ updates"
                onChange={() =>
                  void updatePreferences((current) => ({
                    ...current,
                    emailTopics: {
                      ...current.emailTopics,
                      importantUpdates: !current.emailTopics.importantUpdates,
                    },
                  }))
                }
              />
              <CheckboxLine
                checked={preferences.emailTopics.roadmapProgressSummaries}
                label="Roadmap progress summaries"
                onChange={() =>
                  void updatePreferences((current) => ({
                    ...current,
                    emailTopics: {
                      ...current.emailTopics,
                      roadmapProgressSummaries:
                        !current.emailTopics.roadmapProgressSummaries,
                    },
                  }))
                }
              />
            </div>
          ) : null}
        </NotificationSection>

        <NotificationSection
          description={`Connects to ${roadmapTitle}, ${currentMission}, and ${progress}% progress.`}
          icon={<Megaphone />}
          isOn={preferences.studyReminders.enabled}
          label={t("settings.notifications.studyReminders")}
          onToggle={() =>
            void updatePreferences(
              (current) => ({
                ...current,
                studyReminders: {
                  ...current.studyReminders,
                  enabled: !current.studyReminders.enabled,
                },
              }),
              !preferences.studyReminders.enabled,
            )
          }
        >
          {preferences.studyReminders.enabled ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["daily", "weekly", "custom"] as const).map((cadence) => (
                  <button
                    type="button"
                    key={cadence}
                    onClick={() =>
                      void updatePreferences((current) => ({
                        ...current,
                        studyReminders: {
                          ...current.studyReminders,
                          cadence,
                        },
                      }))
                    }
                    className={`h-10 rounded-full border px-3 text-xs font-semibold capitalize transition ${
                      preferences.studyReminders.cadence === cadence
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[color:var(--color-line)] bg-white text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-strong)]"
                    }`}
                  >
                    {cadence}
                  </button>
                ))}
              </div>

              {preferences.studyReminders.cadence === "custom" ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {reminderDays.map((day) => {
                    const isSelected = preferences.studyReminders.customDays.includes(
                      day.value,
                    );
                    return (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() =>
                          void updatePreferences((current) => ({
                            ...current,
                            studyReminders: {
                              ...current.studyReminders,
                              customDays: isSelected
                                ? current.studyReminders.customDays.filter(
                                    (item) => item !== day.value,
                                  )
                                : [...current.studyReminders.customDays, day.value],
                            },
                          }))
                        }
                        className={`h-9 rounded-full border text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#111111] bg-[#111111] text-white"
                            : "border-[color:var(--color-line)] bg-white hover:bg-[color:var(--color-surface-strong)]"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  Reminder time
                </span>
                <input
                  type="time"
                  value={preferences.studyReminders.reminderTime}
                  onChange={(event) =>
                    void updatePreferences((current) => ({
                      ...current,
                      studyReminders: {
                        ...current.studyReminders,
                        reminderTime: event.target.value || "19:00",
                      },
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                />
              </label>

              <div className="rounded-2xl bg-[color:var(--color-surface-strong)] p-3 text-xs leading-5 text-[color:var(--color-muted)]">
                <p>Study {activeRoadmap?.subject || "your skill"} today</p>
                <p>Continue {currentMission}</p>
              </div>
            </div>
          ) : null}
        </NotificationSection>

        <NotificationSection
          description="Stay consistent with practice, streak, and mission nudges."
          icon={<HelpCircle />}
          isOn={preferences.focusReminders.enabled}
          label={t("settings.notifications.focusReminders")}
          onToggle={() =>
            void updatePreferences(
              (current) => ({
                ...current,
                focusReminders: {
                  ...current.focusReminders,
                  enabled: !current.focusReminders.enabled,
                },
              }),
              !preferences.focusReminders.enabled,
            )
          }
        >
          {preferences.focusReminders.enabled ? (
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  Reminder frequency
                </span>
                <select
                  value={preferences.focusReminders.frequency}
                  onChange={(event) =>
                    void updatePreferences((current) => ({
                      ...current,
                      focusReminders: {
                        ...current.focusReminders,
                        frequency: event.target
                          .value as NotificationPreferences["focusReminders"]["frequency"],
                      },
                    }))
                  }
                  className="mt-2 h-11 w-full rounded-2xl border border-[color:var(--color-line)] bg-white px-4 text-sm outline-none transition focus:border-[#111111]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="twice-weekly">Twice weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <div className="rounded-2xl bg-[color:var(--color-surface-strong)] p-3 text-xs leading-5 text-[color:var(--color-muted)]">
                <p>You have not practiced today</p>
                <p>Continue your learning streak</p>
                <p>Finish {currentMission}</p>
              </div>
            </div>
          ) : null}
        </NotificationSection>
      </div>
      <p className="mt-4 text-xs leading-5 text-[color:var(--color-muted)]">
        Browser notification permission: {permissionState}
        {isSyncing ? " - Syncing..." : ""}
      </p>
    </div>
  );
}

function NotificationSection({
  children,
  description,
  icon,
  isOn,
  label,
  onToggle,
}: {
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  isOn: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)] [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs leading-5 text-[color:var(--color-muted)]">
              {description}
            </p>
          </div>
        </div>
        <ToggleSwitch checked={isOn} onChange={onToggle} />
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-[#111111]" : "bg-[color:var(--color-line)]"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function CheckboxLine({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[#111111]"
      />
      <span>{label}</span>
    </label>
  );
}

const savedDataItems = [
  "Profile information",
  "Personalization settings",
  "AI Teacher preferences",
  "Chat history",
  "Saved chats",
  "Learning roadmaps",
  "Learning progress",
  "Language preference",
];

function formatSyncDate(value?: string) {
  if (!value) {
    return "Not synced yet";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function DataControlsPanel({
  authMode,
  isPrivateUser,
  languageLabel,
  onExportData,
  onOpenMemoryControls,
  onResetLearningData,
  onSaved,
  profile,
  userId,
}: {
  authMode: string;
  isPrivateUser: boolean;
  languageLabel: string;
  onExportData: () => void;
  onOpenMemoryControls: () => void;
  onResetLearningData: () => void;
  onSaved: () => void;
  profile: Parameters<typeof getEffectiveDataControlPreferences>[0];
  userId?: string;
}) {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<DataControlPreferences>(
    defaultDataControlPreferences,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const canCloudSync = Boolean(isPrivateUser && authMode === "firebase" && userId);

  useEffect(() => {
    let isMounted = true;

    async function loadPreferences() {
      const localPreferences = userId
        ? getLocalUserDataControlPreferences(userId)
        : getGuestDataControlPreferences();

      if (isMounted) {
        setPreferences(getEffectiveDataControlPreferences(profile, userId));
      }

      if (canCloudSync && userId && !userId.startsWith("local-")) {
        try {
          const firebasePreferences = await loadFirebaseDataControlPreferences(userId);
          if (firebasePreferences && isMounted) {
            setPreferences(firebasePreferences);
            saveLocalDataControlPreferences(firebasePreferences, userId);
          }
        } catch (error) {
          console.warn("Data control preferences could not load from Firestore.", error);
          if (isMounted) {
            setPreferences(localPreferences);
          }
        }
      }
    }

    void loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [canCloudSync, profile, userId]);

  async function savePreferences(nextPreferences: DataControlPreferences) {
    const preferencesWithSyncTime = {
      ...nextPreferences,
      lastSyncedAt: new Date().toISOString(),
    };

    setPreferences(preferencesWithSyncTime);
    saveLocalDataControlPreferences(preferencesWithSyncTime, userId);
    onSaved();

    if (!canCloudSync || !userId || userId.startsWith("local-")) {
      return;
    }

    try {
      setIsSyncing(true);
      await saveFirebaseDataControlPreferences(userId, preferencesWithSyncTime);
    } catch (error) {
      console.warn("Data control preferences could not sync to Firestore.", error);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div>
      <PanelTitle title={t("settings.dataControls")} />
      <div className="mt-7 space-y-4">
        <DataControlSection title="Data sync">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusTile label="Cloud sync" value={canCloudSync ? "On" : "Off" } />
            <StatusTile
              label="Last synced"
              value={formatSyncDate(preferences.lastSyncedAt)}
            />
          </div>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-muted)]">
            {canCloudSync
              ? "Your chats, roadmap, progress and preferences are synced securely."
              : "Saved on this device only."}
            {isSyncing ? " Syncing..." : ""}
          </p>
        </DataControlSection>

        <DataControlSection title="Saved data">
          <div className="grid gap-2 sm:grid-cols-2">
            {savedDataItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm"
              >
                <Check className="h-4 w-4 text-[color:var(--color-muted)]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-[color:var(--color-muted)]">
            Current language: <span className="font-semibold text-[color:var(--color-text)]">{languageLabel}</span>
          </p>
        </DataControlSection>

        <DataControlSection title="AI memory">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                AI Memory: {preferences.aiMemoryEnabled ? "ON" : "OFF"}
              </p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--color-muted)]">
                {preferences.aiMemoryEnabled
                  ? "DSIQ remembers goals, skill level, learning style and progress."
                  : "DSIQ responds without personalization context."}
              </p>
            </div>
            <ToggleSwitch
              checked={preferences.aiMemoryEnabled}
              onChange={() =>
                void savePreferences({
                  ...preferences,
                  aiMemoryEnabled: !preferences.aiMemoryEnabled,
                })
              }
            />
          </div>
          <button
            type="button"
            onClick={onOpenMemoryControls}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold transition hover:bg-[color:var(--color-surface-strong)]"
          >
            Manage AI memory
          </button>
        </DataControlSection>

        <DataControlSection title="Export data">
          <p className="text-sm leading-7 text-[color:var(--color-muted)]">
            Download profile, chats, roadmap, progress and settings in JSON format.
          </p>
          <button
            type="button"
            onClick={onExportData}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-black"
          >
            Download my data
          </button>
        </DataControlSection>

        <DataControlSection title="Reset learning data">
          <p className="text-sm leading-7 text-[color:var(--color-muted)]">
            Reset only roadmap, missions and learning progress. Your account, chats and preferences stay saved.
          </p>
          <button
            type="button"
            onClick={onResetLearningData}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Reset learning progress
          </button>
        </DataControlSection>
      </div>
    </div>
  );
}

function DataControlSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface-strong)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ConfirmActionModal({
  confirmLabel,
  description,
  error,
  isWorking,
  onCancel,
  onConfirm,
  title,
}: {
  confirmLabel: string;
  description: string;
  error: string;
  isWorking: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
              {description}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onCancel}
            disabled={isWorking}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
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
            disabled={isWorking}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold text-[color:var(--color-text)] transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isWorking}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? <LoadingSpinner /> : null}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function AiMemoryControlsModal({
  error,
  isWorking,
  onCancel,
  onResetAiPersonalization,
  onResetAiTeacherMemory,
  onResetRoadmapMemory,
  personalization,
}: {
  error: string;
  isWorking: boolean;
  onCancel: () => void;
  onResetAiPersonalization: () => void;
  onResetAiTeacherMemory: () => void;
  onResetRoadmapMemory: () => void;
  personalization: PersonalizationSettings;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-[1.5rem] border border-[color:var(--color-line)] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-text)]">
              AI memory controls
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
              View or reset what DSIQ uses to personalize teaching. This does not delete your account.
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onCancel}
            disabled={isWorking}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-[color:var(--color-surface-strong)] p-4 text-sm">
          <p className="font-semibold">Saved personalization</p>
          <div className="mt-3 grid gap-2 text-xs leading-5 text-[color:var(--color-muted)]">
            <p>Goal: {getPersonalizationLabel("learningGoals", personalization.learningGoals)}</p>
            <p>Level: {getPersonalizationLabel("experienceLevel", personalization.experienceLevel)}</p>
            <p>Teacher style: {getPersonalizationLabel("aiTeacherStyle", personalization.aiTeacherStyle)}</p>
            <p>Focus: {getPersonalizationLabel("focusPreference", personalization.focusPreference)}</p>
            <p>Learning style: {getPersonalizationLabel("preferredLearningStyle", personalization.preferredLearningStyle)}</p>
            <p>Language: {getPersonalizationLabel("preferredLanguage", personalization.preferredLanguage)}</p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={onResetAiPersonalization}
            disabled={isWorking}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? <LoadingSpinner /> : null}
            Reset AI personalization
          </button>
          <button
            type="button"
            onClick={onResetRoadmapMemory}
            disabled={isWorking}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset roadmap memory
          </button>
          <button
            type="button"
            onClick={onResetAiTeacherMemory}
            disabled={isWorking}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--color-line)] px-4 text-sm font-semibold transition hover:bg-[color:var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset AI Teacher memory
          </button>
        </div>
      </section>
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
  description,
  disabled,
  icon,
  label,
  onClick,
}: {
  danger?: boolean;
  description?: string;
  disabled?: boolean;
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-3 py-4 text-left transition hover:text-black disabled:cursor-not-allowed disabled:hover:text-[color:var(--color-muted)] ${
        disabled
          ? "text-[color:var(--color-muted)]"
          : danger
            ? "text-red-600"
            : "text-[color:var(--color-text)]"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          disabled
            ? "bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)]"
            : danger
            ? "bg-red-50 text-red-600"
            : "bg-[color:var(--color-surface-strong)] text-[color:var(--color-muted)]"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-5 text-[color:var(--color-muted)]">
            {description}
          </span>
        ) : null}
      </span>
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
