"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Mail,
  Ban,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Bell,
  CheckCircle2,
  UserCog,
  Crown,
  Code2,
  User,
  RefreshCw,
  Users,
  Wifi,
  WifiOff,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";

import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

/* =========================================================
   TYPES
========================================================= */

export interface Player {
  id: string;
  clerkId?: string;

  name: string;
  username?: string;
  email: string;
  picture?: string;

  role: "user" | "admin" | "owner" | "developer";

  balance?: number;
  gamesCount?: number;
  achievements?: number;
  playtime?: number;

  level: number;

  rank: "bronze" | "silver" | "gold" | "platinum" | "diamond";

  isPremium?: boolean;

  isBanned: boolean;

  lastSeen?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface UsersListProps {
  initialPlayers?: Player[];
  apiEndpoint?: string;
}

type Role = Player["role"];

type RoleConfig = {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
};

/* =========================================================
   ROLE CONFIG
========================================================= */

const ROLE_CONFIG: Record<Role, RoleConfig> = {
  owner: {
    label: "Owner",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
  },

  admin: {
    label: "Admin",
    icon: Shield,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-900/50",
  },

  developer: {
    label: "Developer",
    icon: Code2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900/50",
  },

  user: {
    label: "User",
    icon: User,
    color: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
  },
};

/* =========================================================
   RANK ICON
========================================================= */

const getRankIcon = (rank: string) => {
  switch (rank?.toLowerCase()) {
    case "bronza":
    case "bronze":
      return "/bronza.png";

    case "silver":
      return "/silver.png";

    case "gold":
      return "/gold.png";

    case "platinum":
      return "/platinum.png";

    case "diamond":
      return "/diamond.png";

    default:
      return "/bronza.png";
  }
};

/* =========================================================
   ONLINE
========================================================= */

const isOnline = (lastSeen?: string | Date) => {
  if (!lastSeen) return false;

  const lastSeenTime = new Date(lastSeen).getTime();

  if (Number.isNaN(lastSeenTime)) return false;

  return Date.now() - lastSeenTime <= 45 * 1000;
};

/* =========================================================
   STATUS
========================================================= */

const getStatus = (player: Player) => {
  if (player.isBanned) {
    return {
      text: "Banned",
      dot: "bg-rose-500",
      wrapper:
        "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
    };
  }

  if (isOnline(player.lastSeen)) {
    return {
      text: "Online",
      dot: "bg-emerald-500",
      wrapper:
        "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    };
  }

  return {
    text: "Offline",
    dot: "bg-slate-400",
    wrapper:
      "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };
};

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
  role,
  compact = false,
}: {
  role: Role;
  compact?: boolean;
}) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      } rounded-xl border ${config.bg} ${config.border} ${config.color} text-[11px] font-black`}
    >
      <Icon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />

      {config.label}
    </span>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UsersList({
  initialPlayers = [],
  apiEndpoint = "/api/users",
}: UsersListProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const [loading, setLoading] = useState(!initialPlayers.length);

  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"All" | Role>(
    "All",
  );

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    "All" | "Online" | "Offline" | "Banned"
  >("All");

  /* =======================================================
     ROLE MODAL
  ======================================================= */

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const [selectedRolePlayer, setSelectedRolePlayer] = useState<Player | null>(
    null,
  );

  const [selectedNewRole, setSelectedNewRole] = useState<Role>("user");

  const [roleUpdating, setRoleUpdating] = useState(false);

  /* =======================================================
     DELETE MODAL
  ======================================================= */

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedDeletePlayer, setSelectedDeletePlayer] =
    useState<Player | null>(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);

  /* =======================================================
     BAN MODAL
  ======================================================= */

  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const [selectedBanPlayer, setSelectedBanPlayer] = useState<Player | null>(
    null,
  );

  const [banConfirmation, setBanConfirmation] = useState("");

  const [banLoading, setBanLoading] = useState(false);

  /* =======================================================
     CREATE USER MODAL
  ======================================================= */

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [newName, setNewName] = useState("");

  const [newEmail, setNewEmail] = useState("");

  const [newRole, setNewRole] = useState<Role>("developer");

  const [newRank, setNewRank] = useState<Player["rank"]>("gold");

  const [creatingUser, setCreatingUser] = useState(false);

  /* =======================================================
     TOAST
  ======================================================= */

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [notifConfig, setNotifConfig] = useState<{
    isPublic: boolean;
    targetUser?: {
      id: string;
      name: string;
    } | null;
    initialValues?: NotificationPayload["translations"];
    type?: NotificationPayload["type"];
    link?: string;
  }>({
    isPublic: true,
    targetUser: null,
    initialValues: undefined,
    type: "system",
    link: "",
  });

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = (message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  /* =========================================================
     HEARTBEAT
  ========================================================= */

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/users/heartbeat", {
          method: "POST",
          cache: "no-store",
        });
      } catch (error) {
        console.error("Heartbeat xatosi:", error);
      }
    };

    sendHeartbeat();

    const interval = window.setInterval(sendHeartbeat, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =========================================================
     USERS LOAD
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        }

        const response = await fetch(apiEndpoint, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error("Users yuklanmadi");
        }

        const data = await response.json();

        if (cancelled) return;

        setPlayers(Array.isArray(data) ? data : data?.users || []);
      } catch (error) {
        if (!cancelled) {
          console.error("Users load xatosi:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchPlayers();

    const interval = window.setInterval(() => {
      fetchPlayers(true);
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiEndpoint]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const online = players.filter(
      (player) => !player.isBanned && isOnline(player.lastSeen),
    ).length;

    const offline = players.filter(
      (player) => !player.isBanned && !isOnline(player.lastSeen),
    ).length;

    const banned = players.filter((player) => player.isBanned).length;

    return {
      total: players.length,
      online,
      offline,
      banned,
    };
  }, [players]);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const handleOpenPublicNotif = () => {
    setNotifConfig({
      isPublic: true,

      targetUser: null,

      type: "system",

      link: "",

      initialValues: {
        uz: {
          title: "Tizim Yangilanishi",
          message: "Hurmatli foydalanuvchilar...",
        },

        ru: {
          title: "",
          message: "",
        },

        en: {
          title: "",
          message: "",
        },

        tr: {
          title: "",
          message: "",
        },
      },
    });

    setIsNotifModalOpen(true);
  };

  const handleOpenPrivateNotif = (player: Player) => {
    setNotifConfig({
      isPublic: false,

      targetUser: {
        id: player.id,
        name: player.name,
      },

      type: "admin",

      link: "",

      initialValues: {
        uz: {
          title: "Ogohlantirish",
          message: `Salom ${player.name}...`,
        },

        ru: {
          title: "",
          message: "",
        },

        en: {
          title: "",
          message: "",
        },

        tr: {
          title: "",
          message: "",
        },
      },
    });

    setIsNotifModalOpen(true);
  };

  const handleSendNotification = (payload: NotificationPayload) => {
    showToast(
      payload.recipientType === "public"
        ? "Barcha foydalanuvchilarga notification yuborildi!"
        : `${payload.recipientName || "Foydalanuvchi"}ga notification yuborildi!`,
    );
  };

  /* =========================================================
     ROLE MODAL
  ========================================================= */

  const openRoleModal = (player: Player) => {
    setSelectedRolePlayer(player);
    setSelectedNewRole(player.role);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    if (roleUpdating) return;

    setIsRoleModalOpen(false);
    setSelectedRolePlayer(null);
    setSelectedNewRole("user");
  };

  const handleRoleChange = async () => {
    if (!selectedRolePlayer) return;

    if (selectedNewRole === selectedRolePlayer.role) {
      closeRoleModal();
      return;
    }

    if (selectedRolePlayer.role === "owner" && selectedNewRole !== "owner") {
      const confirmed = window.confirm(
        `DIQQAT!\n\n${selectedRolePlayer.name} Owner hisoblanadi.\n\nUning rolini ${selectedNewRole} qilishni tasdiqlaysizmi?`,
      );

      if (!confirmed) return;
    }

    try {
      setRoleUpdating(true);

      const response = await fetch(`${apiEndpoint}/${selectedRolePlayer.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          role: selectedNewRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Rolni yangilashda xatolik");
      }

      setPlayers((prev) =>
        prev.map((player) =>
          player.id === selectedRolePlayer.id
            ? {
                ...player,
                role: selectedNewRole,
              }
            : player,
        ),
      );

      showToast(
        `${selectedRolePlayer.name} roli "${ROLE_CONFIG[selectedNewRole].label}"ga ozgartirildi.`,
      );

      closeRoleModal();
    } catch (error) {
      console.error(error);

      showToast("Rolni ozgartirishda xatolik!");
    } finally {
      setRoleUpdating(false);
    }
  };

  /* =========================================================
     BAN MODAL
  ========================================================= */

  const openBanModal = (player: Player) => {
    /*
     * Ownerni ban qilishdan himoya.
     */
    if (player.role === "owner" && !player.isBanned) {
      showToast("Owner hisobini bu yerdan bloklab bolmaydi.");

      return;
    }

    /*
     * Banned user ham confirmation modal orqali chiqariladi.
     */
    setSelectedBanPlayer(player);
    setBanConfirmation("");
    setIsBanModalOpen(true);
  };

  const closeBanModal = () => {
    if (banLoading) return;

    setIsBanModalOpen(false);
    setSelectedBanPlayer(null);
    setBanConfirmation("");
  };

  /*
   * EXACT NAME MATCH
   *
   * Katta-kichik harf farqi qilmaydi.
   */
  const banNameMatches =
    selectedBanPlayer &&
    banConfirmation.trim().toLowerCase() ===
      selectedBanPlayer.name.trim().toLowerCase();

  /* =========================================================
     CONFIRM BAN
  ========================================================= */

  const confirmBan = async () => {
    if (!selectedBanPlayer) return;

    if (!banNameMatches) {
      showToast("Foydalanuvchi ismini togri yozing.");

      return;
    }

    try {
      setBanLoading(true);

      const response = await fetch(`${apiEndpoint}/${selectedBanPlayer.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          isBanned: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Ban holatini yangilashda xatolik");
      }

      setPlayers((prev) =>
        prev.map((player) =>
          player.id === selectedBanPlayer.id
            ? {
                ...player,
                isBanned: true,
              }
            : player,
        ),
      );

      showToast(`${selectedBanPlayer.name} bloklandi.`);

      closeBanModal();
    } catch (error) {
      console.error(error);

      showToast("Foydalanuvchini bloklashda xatolik!");
    } finally {
      setBanLoading(false);
    }
  };

  /* =========================================================
     UNBAN
  ========================================================= */

  const unbanPlayer = async (player: Player) => {
    try {
      setRefreshing(true);

      const response = await fetch(`${apiEndpoint}/${player.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          isBanned: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Ban holatini yangilashda xatolik");
      }

      setPlayers((prev) =>
        prev.map((item) =>
          item.id === player.id
            ? {
                ...item,
                isBanned: false,
              }
            : item,
        ),
      );

      showToast(`${player.name} blokdan chiqarildi.`);
    } catch (error) {
      console.error(error);

      showToast("Blokdan chiqarishda xatolik!");
    } finally {
      setRefreshing(false);
    }
  };

  /* =========================================================
     CONFIRM UNBAN
  ========================================================= */

  const confirmUnban = async () => {
    if (!selectedBanPlayer) return;

    try {
      setBanLoading(true);

      await unbanPlayer(selectedBanPlayer);

      closeBanModal();
    } finally {
      setBanLoading(false);
    }
  };

  /* =========================================================
     DELETE MODAL
  ========================================================= */

  const openDeleteModal = (player: Player) => {
    if (player.role === "owner") {
      showToast("Owner hisobini ochirib bolmaydi.");

      return;
    }

    setSelectedDeletePlayer(player);
    setDeleteConfirmation("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setIsDeleteModalOpen(false);
    setSelectedDeletePlayer(null);
    setDeleteConfirmation("");
  };

  const deleteNameMatches =
    selectedDeletePlayer &&
    deleteConfirmation.trim().toLowerCase() ===
      selectedDeletePlayer.name.trim().toLowerCase();

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = async () => {
    if (!selectedDeletePlayer) return;

    if (!deleteNameMatches) {
      showToast("Foydalanuvchi ismini togri yozing.");

      return;
    }

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `${apiEndpoint}/${selectedDeletePlayer.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Ochirishda xatolik");
      }

      setPlayers((prev) =>
        prev.filter((player) => player.id !== selectedDeletePlayer.id),
      );

      showToast(`${selectedDeletePlayer.name} ochirildi.`);

      closeDeleteModal();
    } catch (error) {
      console.error(error);

      showToast("Foydalanuvchini ochirishda xatolik!");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================================================
     CREATE USER
  ========================================================= */

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newEmail.trim()) {
      showToast("Ism va emailni kiriting.");

      return;
    }

    try {
      setCreatingUser(true);

      const payload = {
        clerkId: `manual_${Date.now()}`,

        name: newName.trim(),

        email: newEmail.trim(),

        picture: "",

        role: newRole,

        rank: newRank,

        level: 1,

        isBanned: false,

        lastSeen: new Date(),
      };

      const response = await fetch(apiEndpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Qoshishda xatolik");
      }

      const createdPlayer = await response.json();

      const normalizedPlayer = createdPlayer?.user || createdPlayer;

      setPlayers((prev) => [normalizedPlayer, ...prev]);

      setIsUserModalOpen(false);

      setNewName("");
      setNewEmail("");
      setNewRole("developer");
      setNewRank("gold");

      showToast("Yangi foydalanuvchi qoshildi!");
    } catch (error) {
      console.error(error);

      showToast("Foydalanuvchi qoshilmadi!");
    } finally {
      setCreatingUser(false);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredPlayers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return players.filter((player) => {
      const matchesSearch =
        !query ||
        player.name?.toLowerCase().includes(query) ||
        player.username?.toLowerCase().includes(query) ||
        player.email?.toLowerCase().includes(query);

      const matchesRole =
        selectedRoleFilter === "All" || player.role === selectedRoleFilter;

      const status = getStatus(player);

      const matchesStatus =
        selectedStatusFilter === "All" || status.text === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [players, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  /* =========================================================
     ROLE OPTIONS
  ========================================================= */

  const roleOptions: Role[] = ["user", "developer", "admin", "owner"];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="w-full min-h-screen my-15 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-violet-500/[0.05]" />

          <div className="relative p-6 sm:p-7">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                      Foydalanuvchilar
                    </h1>

                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                      Admin
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    MIDEM platformasidagi barcha foydalanuvchilarni boshqaring.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setRefreshing(true);

                    fetch(apiEndpoint, {
                      cache: "no-store",
                    })
                      .then(async (res) => {
                        if (!res.ok) {
                          throw new Error("Users yuklanmadi");
                        }

                        const data = await res.json();

                        setPlayers(
                          Array.isArray(data) ? data : data?.users || [],
                        );
                      })
                      .catch((error) => {
                        console.error(error);

                        showToast("Foydalanuvchilarni yangilashda xatolik!");
                      })
                      .finally(() => {
                        setRefreshing(false);
                      });
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Yangilash
                </button>

                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition"
                >
                  <UserCog className="w-4 h-4" />
                  Yangi qoshish
                </button>

                <button
                  onClick={handleOpenPublicNotif}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm hover:shadow-md transition"
                >
                  <Bell className="w-4 h-4" />
                  Hammaga notification
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <motion.div
            whileHover={{
              y: -2,
            }}
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-500" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Jami
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-4">
              {stats.total}
            </p>

            <p className="text-xs font-semibold text-slate-400 mt-1">
              Barcha foydalanuvchilar
            </p>
          </motion.div>

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="group p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-950/10 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-emerald-500" />
              </div>

              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-4 text-emerald-700 dark:text-emerald-400">
              {stats.online}
            </p>

            <p className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-400/60 mt-1">
              Hozir online
            </p>
          </motion.div>

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-slate-400" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Offline
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-4">
              {stats.offline}
            </p>

            <p className="text-xs font-semibold text-slate-400 mt-1">
              Hozir faol emas
            </p>
          </motion.div>

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="group p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/10 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-500" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
                Banned
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-4 text-rose-600 dark:text-rose-400">
              {stats.banned}
            </p>

            <p className="text-xs font-semibold text-rose-500/70 dark:text-rose-400/60 mt-1">
              Bloklangan hisoblar
            </p>
          </motion.div>
        </div>

        {/* =================================================
            FILTER / SEARCH
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ism, username yoki email boyicha qidirish..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(["All", "owner", "admin", "developer", "user"] as const).map(
                  (role) => {
                    const active = selectedRoleFilter === role;

                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRoleFilter(role)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-black border transition ${
                          active
                            ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm"
                            : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        {role === "All" ? "Barchasi" : ROLE_CONFIG[role].label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 shrink-0 mr-1">
                Status:
              </span>

              {(["All", "Online", "Offline", "Banned"] as const).map(
                (status) => {
                  const active = selectedStatusFilter === status;

                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition whitespace-nowrap ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {status === "All" ? "Barchasi" : status}
                    </button>
                  );
                },
              )}

              <div className="ml-auto shrink-0 text-xs font-bold text-slate-400">
                {filteredPlayers.length} / {players.length}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                User Management
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Foydalanuvchilar va ularning account holati
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live data
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">
                  <th className="px-5 py-4">Foydalanuvchi</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Rank</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin mb-3" />

                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Foydalanuvchilar yuklanmoqda...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                          <Search className="w-6 h-6 text-slate-400" />
                        </div>

                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                          Foydalanuvchi topilmadi
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Qidiruv yoki filterlarni ozgartirib koring.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredPlayers.map((player) => {
                      const status = getStatus(player);

                      return (
                        <motion.tr
                          key={player.id}
                          layout
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                {player.picture ? (
                                  <Image
                                    src={player.picture}
                                    alt={player.name}
                                    width={46}
                                    height={46}
                                    className="w-[46px] h-[46px] rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                  />
                                ) : (
                                  <div className="w-[46px] h-[46px] rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/20 dark:from-indigo-500/20 dark:to-violet-500/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                                    {player.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <span
                                  className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${status.dot}`}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[230px]">
                                    {player.name}
                                  </p>

                                  {player.isPremium && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-500 text-[8px] font-black uppercase">
                                      PRO
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                  <Mail className="w-3 h-3 shrink-0" />

                                  <span className="truncate max-w-[280px]">
                                    {player.username
                                      ? `@${player.username} • `
                                      : ""}
                                    {player.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() => openRoleModal(player)}
                              className="group/role flex items-center gap-2 hover:opacity-80 transition"
                            >
                              <RoleBadge role={player.role} compact />

                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/role:text-indigo-500 transition" />
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                <Image
                                  src={getRankIcon(player.rank)}
                                  alt={player.rank}
                                  width={30}
                                  height={30}
                                  className="object-contain"
                                />
                              </div>

                              <div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                  Lv. {player.level || 1}
                                </p>

                                <p className="text-[10px] text-slate-400 capitalize font-bold mt-0.5">
                                  {player.rank || "bronze"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black ${status.wrapper}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${status.dot} ${
                                  status.text === "Online"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                              {status.text}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end items-center gap-1">
                              {/* NOTIFICATION */}

                              <button
                                onClick={() => handleOpenPrivateNotif(player)}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
                                title="Xabar yuborish"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {/* BAN */}

                              <button
                                onClick={() => openBanModal(player)}
                                className={`p-2.5 rounded-xl transition ${
                                  player.isBanned
                                    ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                    : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                }`}
                                title={
                                  player.isBanned
                                    ? "Blokdan chiqarish"
                                    : "Bloklash"
                                }
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              {/* DELETE */}

                              <button
                                onClick={() => openDeleteModal(player)}
                                disabled={player.role === "owner"}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-25 disabled:cursor-not-allowed"
                                title={
                                  player.role === "owner"
                                    ? "Ownerni ochirib bolmaydi"
                                    : "Ochirish"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================
          TOAST
      ===================================================== */}

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -25,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.96,
            }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-2xl border border-white/10 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />

            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          NOTIFICATION MODAL
      ===================================================== */}

      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleSendNotification}
        isPublic={notifConfig.isPublic}
        targetUser={notifConfig.targetUser}
        initialValues={notifConfig.initialValues}
        initialType={notifConfig.type}
        initialLink={notifConfig.link}
      />

      {/* =====================================================
          CREATE USER MODAL
      ===================================================== */}

      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => !creatingUser && setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                      <UserCog className="w-5 h-5 text-indigo-500" />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white">
                        Yangi foydalanuvchi
                      </h3>

                      <p className="text-xs text-slate-400 mt-0.5">
                        Yangi account yaratish
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => !creatingUser && setIsUserModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Toliq ism
                  </label>

                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Masalan: Ibrohimjon"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Email
                  </label>

                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                      Role
                    </label>

                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as Role)}
                      className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="developer">Developer</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                      Rank
                    </label>

                    <select
                      value={newRank}
                      onChange={(e) =>
                        setNewRank(e.target.value as Player["rank"])
                      }
                      className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-indigo-500"
                    >
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={creatingUser}
                    onClick={() => setIsUserModalOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={
                      creatingUser || !newName.trim() || !newEmail.trim()
                    }
                    className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition disabled:opacity-50"
                  >
                    {creatingUser ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Yaratilmoqda...
                      </span>
                    ) : (
                      "Foydalanuvchi yaratish"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          ROLE MODAL
      ===================================================== */}

      <AnimatePresence>
        {isRoleModalOpen && selectedRolePlayer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={closeRoleModal}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <LockKeyhole className="w-5 h-5 text-indigo-500" />

                      <h3 className="font-black text-lg text-slate-900 dark:text-white">
                        Role boshqaruvi
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      Foydalanuvchining tizimdagi huquqlarini ozgartiring.
                    </p>
                  </div>

                  <button
                    onClick={closeRoleModal}
                    disabled={roleUpdating}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {selectedRolePlayer.picture ? (
                    <Image
                      src={selectedRolePlayer.picture}
                      alt={selectedRolePlayer.name}
                      width={42}
                      height={42}
                      className="w-10.5 h-10.5 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10.5 h-10.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                      {selectedRolePlayer.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-black text-sm truncate">
                      {selectedRolePlayer.name}
                    </p>

                    <p className="text-xs text-slate-400 truncate">
                      {selectedRolePlayer.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3">
                  Yangi role
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleOptions.map((role) => {
                    const config = ROLE_CONFIG[role];

                    const Icon = config.icon;

                    const active = selectedNewRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSelectedNewRole(role)}
                        className={`relative flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                          active
                            ? `${config.bg} ${config.border} ${config.color} ring-2 ring-current/10`
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            active
                              ? "bg-white/70 dark:bg-slate-900/60"
                              : "bg-white dark:bg-slate-900"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="text-sm font-black">{config.label}</p>

                          <p className="text-[10px] opacity-70 mt-0.5">
                            {role === "owner"
                              ? "Toliq boshqaruv"
                              : role === "admin"
                                ? "Admin huquqlari"
                                : role === "developer"
                                  ? "Developer huquqlari"
                                  : "Oddiy user"}
                          </p>
                        </div>

                        {active && (
                          <CheckCircle2 className="absolute top-3 right-3 w-4 h-4" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedNewRole === "owner" &&
                  selectedRolePlayer.role !== "owner" && (
                    <div className="mt-4 flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

                      <div>
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                          Muhim ogohlantirish
                        </p>

                        <p className="text-[11px] leading-relaxed text-amber-600/80 dark:text-amber-400/70 mt-1">
                          Owner roli platformadagi eng yuqori darajadagi
                          huquqlarni beradi. Faqat ishonchli accountlarga
                          bering.
                        </p>
                      </div>
                    </div>
                  )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeRoleModal}
                    disabled={roleUpdating}
                    className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="button"
                    onClick={handleRoleChange}
                    disabled={
                      roleUpdating ||
                      selectedNewRole === selectedRolePlayer.role
                    }
                    className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition disabled:opacity-50"
                  >
                    {roleUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saqlanmoqda...
                      </span>
                    ) : (
                      "Rolni saqlash"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <AnimatePresence>
        {isDeleteModalOpen && selectedDeletePlayer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-500" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      Foydalanuvchini ochirish
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Bu amalni ortga qaytarib bolmaydi. Account bilan bogliq
                      malumotlar ochirilishi mumkin.
                    </p>
                  </div>

                  <button
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="p-2 -mt-1 -mr-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {selectedDeletePlayer.picture ? (
                      <Image
                        src={selectedDeletePlayer.picture}
                        alt={selectedDeletePlayer.name}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 font-black">
                        {selectedDeletePlayer.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {selectedDeletePlayer.name}
                      </p>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {selectedDeletePlayer.email}
                      </p>
                    </div>

                    <div className="ml-auto shrink-0">
                      <RoleBadge role={selectedDeletePlayer.role} compact />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-2">
                    Tasdiqlash uchun quyidagi ismni aynan yozing:
                  </label>

                  <div className="mb-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400 break-all">
                      {selectedDeletePlayer.name}
                    </p>
                  </div>

                  <input
                    autoFocus
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    disabled={deleteLoading}
                    placeholder="Foydalanuvchi ismini yozing..."
                    className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-bold outline-none transition ${
                      deleteConfirmation && !deleteNameMatches
                        ? "border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                        : deleteNameMatches
                          ? "border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          : "border-slate-200 dark:border-slate-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    }`}
                  />

                  {deleteConfirmation && !deleteNameMatches && (
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Ism mos kelmadi.
                    </p>
                  )}

                  {deleteNameMatches && (
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tasdiqlandi. Endi ochirish mumkin.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleteLoading || !deleteNameMatches}
                    className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Ochirilmoqda...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Ochirish
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-rose-50 dark:bg-rose-950/20 border-t border-rose-100 dark:border-rose-900/30">
                <p className="text-[10px] leading-relaxed text-rose-600/80 dark:text-rose-400/70 font-semibold text-center">
                  ⚠️ Ushbu amal qaytarib bolmaydi. Foydalanuvchi nomini
                  tasdiqlamasdan ochirish tugmasi ishlamaydi.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================
          BAN CONFIRMATION MODAL
      ===================================================== */}

      <AnimatePresence>
        {isBanModalOpen && selectedBanPlayer && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* BACKDROP */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={closeBanModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* MODAL */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.97,
              }}
              className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl ${
                selectedBanPlayer.isBanned
                  ? "border-emerald-200 dark:border-emerald-900/50"
                  : "border-amber-200 dark:border-amber-900/50"
              }`}
            >
              <div className="p-6">
                {/* HEADER */}

                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                      selectedBanPlayer.isBanned
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40"
                        : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40"
                    }`}
                  >
                    <Ban
                      className={`w-5 h-5 ${
                        selectedBanPlayer.isBanned
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">
                      {selectedBanPlayer.isBanned
                        ? "Foydalanuvchini blokdan chiqarish"
                        : "Foydalanuvchini bloklash"}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {selectedBanPlayer.isBanned
                        ? "Ushbu foydalanuvchini blokdan chiqarishni tasdiqlaysizmi?"
                        : "Bu foydalanuvchi platformaga kira olmaydi. Davom etishdan oldin tasdiqlang."}
                    </p>
                  </div>

                  <button
                    onClick={closeBanModal}
                    disabled={banLoading}
                    className="p-2 -mt-1 -mr-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* USER */}

                <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {selectedBanPlayer.picture ? (
                      <Image
                        src={selectedBanPlayer.picture}
                        alt={selectedBanPlayer.name}
                        width={46}
                        height={46}
                        className="w-11.5 h-11.5 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className={`w-11.5 h-11.5 rounded-xl flex items-center justify-center font-black text-lg ${
                          selectedBanPlayer.isBanned
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-500"
                        }`}
                      >
                        {selectedBanPlayer.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {selectedBanPlayer.name}
                      </p>

                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {selectedBanPlayer.email}
                      </p>
                    </div>

                    <div className="ml-auto shrink-0">
                      <RoleBadge role={selectedBanPlayer.role} compact />
                    </div>
                  </div>
                </div>

                {/* UNBAN MODAL */}

                {selectedBanPlayer.isBanned ? (
                  <>
                    <div className="mt-5 flex gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />

                      <div>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                          Bloklangan hisob
                        </p>

                        <p className="text-[11px] leading-relaxed text-emerald-600/80 dark:text-emerald-400/70 mt-1">
                          Blokdan chiqarilgandan so‘ng foydalanuvchi yana
                          platformaga kirishi mumkin bo‘ladi.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={closeBanModal}
                        disabled={banLoading}
                        className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
                      >
                        Bekor qilish
                      </button>

                      <button
                        type="button"
                        onClick={confirmUnban}
                        disabled={banLoading}
                        className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {banLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Chiqarilmoqda...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Blokdan chiqarish
                          </span>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* WARNING */}

                    <div className="mt-5 flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />

                      <div>
                        <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                          Diqqat!
                        </p>

                        <p className="text-[11px] leading-relaxed text-amber-600/80 dark:text-amber-400/70 mt-1">
                          Bloklangan foydalanuvchi platformaga kira olmaydi.
                          Xatolik bilan boshqa accountni bloklab qoymaslik uchun
                          uning ismini tasdiqlang.
                        </p>
                      </div>
                    </div>

                    {/* CONFIRMATION */}

                    <div className="mt-5">
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-2">
                        Tasdiqlash uchun quyidagi ismni aynan yozing:
                      </label>

                      <div className="mb-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                        <p className="text-sm font-black text-amber-600 dark:text-amber-400 break-all">
                          {selectedBanPlayer.name}
                        </p>
                      </div>

                      <input
                        autoFocus
                        value={banConfirmation}
                        onChange={(e) => setBanConfirmation(e.target.value)}
                        disabled={banLoading}
                        placeholder="Foydalanuvchi ismini yozing..."
                        className={`w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-bold outline-none transition ${
                          banConfirmation && !banNameMatches
                            ? "border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                            : banNameMatches
                              ? "border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                              : "border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                        }`}
                      />

                      {banConfirmation && !banNameMatches && (
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Ism mos kelmadi.
                        </p>
                      )}

                      {banNameMatches && (
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tasdiqlandi. Endi bloklash mumkin.
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={closeBanModal}
                        disabled={banLoading}
                        className="flex-1 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
                      >
                        Bekor qilish
                      </button>

                      <button
                        type="button"
                        onClick={confirmBan}
                        disabled={banLoading || !banNameMatches}
                        className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {banLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Bloklanmoqda...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Ban className="w-4 h-4" />
                            Bloklash
                          </span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* BOTTOM WARNING */}

              <div
                className={`px-6 py-3.5 border-t ${
                  selectedBanPlayer.isBanned
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                    : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30"
                }`}
              >
                <p
                  className={`text-[10px] leading-relaxed font-semibold text-center ${
                    selectedBanPlayer.isBanned
                      ? "text-emerald-600/80 dark:text-emerald-400/70"
                      : "text-amber-600/80 dark:text-amber-400/70"
                  }`}
                >
                  {selectedBanPlayer.isBanned
                    ? "⚠️ Foydalanuvchini blokdan chiqarish uchun tugmani bosing."
                    : "⚠️ Foydalanuvchi nomini tasdiqlamasdan bloklash tugmasi ishlamaydi."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
