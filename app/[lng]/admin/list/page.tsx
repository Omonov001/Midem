"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

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

const isOnline = (lastSeen?: string | Date) => {
  if (!lastSeen) return false;

  const lastSeenTime = new Date(lastSeen).getTime();

  if (Number.isNaN(lastSeenTime)) return false;

  return Date.now() - lastSeenTime <= 45 * 1000;
};

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

export default function UsersList({
  initialPlayers = [],
  apiEndpoint = "/api/users",
}: UsersListProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [loading, setLoading] = useState(!initialPlayers.length);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  const [notifConfig, setNotifConfig] = useState<{
    isPublic: boolean;
    targetUser?: { id: string; name: string } | null;
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

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Player["role"]>("developer");
  const [newRank, setNewRank] = useState<Player["rank"]>("gold");

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // =========================
  // HEARTBEAT
  // =========================

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

    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // USERS LOAD
  // =========================

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(apiEndpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Users yuklanmadi");
        }

        const data = await response.json();

        setPlayers(data);
      } catch (error) {
        console.error("Users load xatosi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    const interval = setInterval(fetchPlayers, 10000);

    return () => clearInterval(interval);
  }, [apiEndpoint]);

  // =========================
  // STATS
  // =========================

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

  // =========================
  // NOTIFICATIONS
  // =========================

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

  // =========================
  // ROLE
  // =========================

  const handleRoleChange = async (id: string, newRole: Player["role"]) => {
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Rolni yangilashda xatolik");
      }

      setPlayers((prev) =>
        prev.map((player) =>
          player.id === id
            ? {
                ...player,
                role: newRole,
              }
            : player,
        ),
      );

      showToast(`Rol "${newRole}"ga ozgartirildi!`);
    } catch (error) {
      console.error(error);
      showToast("Rolni ozgartirishda xatolik!");
    }
  };

  // =========================
  // BAN
  // =========================

  const toggleBan = async (id: string) => {
    const player = players.find((item) => item.id === id);

    if (!player) return;

    const nextBanned = !player.isBanned;

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isBanned: nextBanned,
        }),
      });

      if (!response.ok) {
        throw new Error("Ban holatini yangilashda xatolik");
      }

      setPlayers((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isBanned: nextBanned,
              }
            : item,
        ),
      );

      showToast(
        nextBanned
          ? `${player.name} bloklandi.`
          : `${player.name} blokdan chiqarildi.`,
      );
    } catch (error) {
      console.error(error);
      showToast("Ban holatini ozgartirishda xatolik!");
    }
  };

  // =========================
  // DELETE
  // =========================

  const confirmDelete = async () => {
    if (!selectedPlayerId) return;

    try {
      const response = await fetch(`${apiEndpoint}/${selectedPlayerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ochirishda xatolik");
      }

      setPlayers((prev) =>
        prev.filter((player) => player.id !== selectedPlayerId),
      );

      setIsDeleteModalOpen(false);
      setSelectedPlayerId(null);

      showToast("Foydalanuvchi ochirildi!");
    } catch (error) {
      console.error(error);
      showToast("Ochirishda xatolik!");
    }
  };

  // =========================
  // CREATE
  // =========================

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName || !newEmail) return;

    try {
      const payload = {
        clerkId: `manual_${Date.now()}`,
        name: newName,
        email: newEmail,
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

      setPlayers((prev) => [createdPlayer, ...prev]);

      setIsUserModalOpen(false);

      setNewName("");
      setNewEmail("");
      setNewRole("developer");
      setNewRank("gold");

      showToast("Yangi foydalanuvchi qoshildi!");
    } catch (error) {
      console.error(error);
      showToast("Foydalanuvchi qoshilmadi!");
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
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

  return (
    <div className="w-full min-h-screen my-10 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Foydalanuvchilar
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Barcha foydalanuvchilarni boshqarish va nazorat qilish.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-sm rounded-xl hover:opacity-90 transition"
            >
              + Yangi qoshish
            </button>

            <button
              onClick={handleOpenPublicNotif}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition"
            >
              <Bell className="w-4 h-4" />
              Hammaga Notification
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs font-bold uppercase text-slate-400">Jami</p>
            <p className="text-2xl font-black mt-2">{stats.total}</p>
          </div>

          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-bold uppercase text-emerald-600">
                Online
              </p>
            </div>

            <p className="text-2xl font-black text-emerald-600 mt-2">
              {stats.online}
            </p>
          </div>

          <div className="p-5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-400 rounded-full" />
              <p className="text-xs font-bold uppercase text-slate-500">
                Offline
              </p>
            </div>

            <p className="text-2xl font-black text-slate-600 dark:text-slate-300 mt-2">
              {stats.offline}
            </p>
          </div>

          <div className="p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-500" />

              <p className="text-xs font-bold uppercase text-rose-600">
                Banned
              </p>
            </div>

            <p className="text-2xl font-black text-rose-600 mt-2">
              {stats.banned}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {["All", "owner", "admin", "developer", "user"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  selectedRoleFilter === role
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {role === "All" ? "Barchasi" : role}
              </button>
            ))}

            <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            {["All", "Online", "Offline", "Banned"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  selectedStatusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                }`}
              >
                {status === "All" ? "Status: Barchasi" : status}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism, username yoki email boyicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-auto max-h-[550px]">
            <table className="w-full min-w-[900px] text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="p-4">Foydalanuvchi</th>

                  <th className="p-4">Roli</th>

                  <th className="p-4">Rank</th>

                  <th className="p-4">Status</th>

                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-slate-400">
                      Foydalanuvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredPlayers.map((player) => {
                      const status = getStatus(player);

                      return (
                        <motion.tr
                          key={player.id}
                          initial={{
                            opacity: 0,
                            y: 5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                        >
                          {/* USER */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                {player.picture ? (
                                  <Image
                                    src={player.picture}
                                    alt={player.name}
                                    width={44}
                                    height={44}
                                    className="w-11 h-11 rounded-xl object-cover"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                                    {player.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <span
                                  className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${status.dot}`}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                  {player.name}
                                </p>

                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                  <Mail className="w-3 h-3" />

                                  <span className="truncate">
                                    {player.username
                                      ? `@${player.username} • `
                                      : ""}
                                    {player.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* ROLE */}
                          <td className="p-4">
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                              <Shield className="w-4 h-4 text-indigo-500" />

                              <select
                                value={player.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    player.id,
                                    e.target.value as Player["role"],
                                  )
                                }
                                className="bg-transparent outline-none text-xs font-bold cursor-pointer"
                              >
                                <option value="owner">Owner</option>

                                <option value="admin">Admin</option>

                                <option value="developer">Developer</option>

                                <option value="user">User</option>
                              </select>
                            </div>
                          </td>

                          {/* RANK */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Image
                                src={getRankIcon(player.rank)}
                                alt={player.rank}
                                width={32}
                                height={32}
                                className="object-contain"
                              />

                              <div>
                                <p className="text-sm font-black">
                                  Lv. {player.level || 1}
                                </p>

                                <p className="text-xs text-slate-400 capitalize">
                                  {player.rank || "bronze"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="p-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${status.wrapper}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${status.dot} ${
                                  status.text === "Online"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />

                              {status.text}
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleOpenPrivateNotif(player)}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition"
                                title="Xabar yuborish"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => toggleBan(player.id)}
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

                              <button
                                onClick={() => {
                                  setSelectedPlayerId(player.id);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                                title="Ochirish"
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

      {/* TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{
              opacity: 0,
              y: -30,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATION */}
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

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-indigo-500" />
                  Yangi foydalanuvchi
                </h3>

                <button onClick={() => setIsUserModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Toliq ism"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
                />

                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newRole}
                    onChange={(e) =>
                      setNewRole(e.target.value as Player["role"])
                    }
                    className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="user">User</option>

                    <option value="developer">Developer</option>

                    <option value="admin">Admin</option>

                    <option value="owner">Owner</option>
                  </select>

                  <select
                    value={newRank}
                    onChange={(e) =>
                      setNewRank(e.target.value as Player["rank"])
                    }
                    className="px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <option value="bronze">Bronze</option>

                    <option value="silver">Silver</option>

                    <option value="gold">Gold</option>

                    <option value="platinum">Platinum</option>

                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
                  >
                    Qoshish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-black">Foydalanuvchini ochirish?</h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Bu amalni ortga qaytarib bolmaydi.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
                >
                  Bekor qilish
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Ha, ochirilsin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
