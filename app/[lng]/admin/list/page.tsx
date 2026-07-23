"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Mail,
  Ban,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  X,
  Bell,
  CheckCircle2,
} from "lucide-react";
import NotificationModal, {
  NotificationPayload,
} from "@/components/modals/notification-modal";

const initialPlayers = [
  {
    id: 1,
    name: "Ali Developer",
    username: "@ali_dev",
    email: "ali.dev@gmail.com",
    role: "Developer",
    level: "Lv. 42 (Epic)",
    xp: 85,
    status: "Online",
    statusColor: "bg-emerald-500",
    avatarColor:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300",
  },
  {
    id: 2,
    name: "Samar Eshonqulov",
    username: "@samar_01",
    email: "samar.eshon@gmail.com",
    role: "Admin",
    level: "Lv. 15 (Pro)",
    xp: 45,
    status: "Offline",
    statusColor: "bg-slate-400 dark:bg-slate-500",
    avatarColor:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
  },
  {
    id: 3,
    name: "Madina Umarova",
    username: "@madina_u",
    email: "madina.umarova@gmail.com",
    role: "Owner",
    level: "Lv. 30 (Master)",
    xp: 92,
    status: "Banned",
    statusColor: "bg-rose-500",
    avatarColor:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
  },
  {
    id: 4,
    name: "Akbarcha 011",
    username: "@akbarcha011",
    email: "Akbar.cha@gmail.com",
    role: "user",
    level: "Lv. 30 (Master)",
    xp: 92,
    status: "Banned",
    statusColor: "bg-rose-500",
    avatarColor:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
  },
  {
    id: 5,
    name: "Bexruuz 011",
    username: "@Bexruuz011",
    email: "Akbar.cha@gmail.com",
    role: "user",
    level: "Lv. 30 (Master)",
    xp: 92,
    status: "Banned",
    statusColor: "bg-rose-500",
    avatarColor:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
  },
  {
    id: 6,
    name: "Shaxnoza 011",
    username: "@Shaxnoza011",
    email: "Akbar.cha@gmail.com",
    role: "user",
    level: "Lv. 30 (Master)",
    xp: 92,
    status: "Banned",
    statusColor: "bg-rose-500",
    avatarColor:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300",
  },
];

export default function UsersList() {
  const [players, setPlayers] = useState(initialPlayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // CUSTOM TOAST NOTIFICATION STATE
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // NOTIFICATION MODAL STATE
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifConfig, setNotifConfig] = useState<{
    isPublic: boolean;
    targetUser?: { id: number; name: string } | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues?: any;
  }>({
    isPublic: true,
    targetUser: null,
    initialValues: undefined,
  });

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Developer");

  const stats = useMemo(() => {
    return {
      total: players.length,
      active: players.filter((p) => p.status === "Online").length,
      banned: players.filter((p) => p.status === "Banned").length,
    };
  }, [players]);

  const handleOpenPublicNotif = () => {
    setNotifConfig({
      isPublic: true,
      targetUser: null,
      initialValues: {
        uz: {
          title: "Tizim Yangilanishi",
          message: "Hurmatli foydalanuvchilar...",
        },
      },
    });
    setIsNotifModalOpen(true);
  };

  const handleOpenPrivateNotif = (player: { id: number; name: string }) => {
    setNotifConfig({
      isPublic: false,
      targetUser: { id: player.id, name: player.name },
      initialValues: {
        uz: { title: "Ogohlantirish", message: `Salom ${player.name}...` },
      },
    });
    setIsNotifModalOpen(true);
  };

  const handleSendNotification = (payload: NotificationPayload) => {
    if (payload.isPublic) {
      showToast("Barcha foydalanuvchilarga notification yuborildi!");
    } else {
      showToast(`${payload.recipientName}ga notification yuborildi!`);
    }
  };

  const confirmDelete = () => {
    if (selectedPlayerId !== null) {
      setPlayers(players.filter((player) => player.id !== selectedPlayerId));
      setIsDeleteModalOpen(false);
      setSelectedPlayerId(null);
      showToast("Foydalanuvchi muvaffaqiyatli ochirildi!");
    }
  };

  const toggleBan = (id: number) => {
    setPlayers(
      players.map((player) => {
        if (player.id === id) {
          const isBanned = player.status === "Banned";
          showToast(
            isBanned
              ? `${player.name} blokdan chiqarildi.`
              : `${player.name} bloklandi.`,
          );
          return {
            ...player,
            status: isBanned ? "Offline" : "Banned",
            statusColor: isBanned
              ? "bg-slate-400 dark:bg-slate-500"
              : "bg-rose-500",
          };
        }
        return player;
      }),
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newPlayer = {
      id: Date.now(),
      name: newName,
      username: `@${newName.toLowerCase().replace(/\s+/g, "_")}`,
      email: newEmail,
      role: newRole,
      level: "Lv. 1 (Novice)",
      xp: 10,
      status: "Online",
      statusColor: "bg-emerald-500",
      avatarColor:
        "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-300",
    };

    setPlayers([newPlayer, ...players]);
    setIsUserModalOpen(false);
    setNewName("");
    setNewEmail("");
    showToast("Yangi foydalanuvchi qoshildi!");
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "All" || player.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="w-full my-15 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Tizim Boshqaruvchilari
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Owner, Developer va Adminlar royxati, vakolatlar va faollik
              statuslari.
            </p>
          </div>

          <button
            onClick={handleOpenPublicNotif}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Bell className="w-4 h-4" />
            <span>Hammaga Notification</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Jami azolar
            </span>
            <span className="text-xl font-black">{stats.total}</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Faol (Online)
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.active}
            </span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Bloklanganlar
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">
              {stats.banned}
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {["All", "Owner", "Admin", "Developer"].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-colors shrink-0 ${
                  selectedRoleFilter === role
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {role === "All" ? "Barchasi" : role}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl transition-colors"
            />
          </div>
        </div>

        {/* Jadval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-y-auto max-h-[320px] overflow-x-auto w-full [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            <table className="w-full min-w-[750px] border-collapse text-left table-auto">
              <thead className="sticky top-0 z-10 bg-white dark:bg-slate-900 shadow-[0_1px_0_0_rgba(226,232,240,1)] dark:shadow-[0_1px_0_0_rgba(30,41,59,1)]">
                <tr className="text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 dark:bg-slate-950/10">
                  <th className="py-4 px-4 w-[35%]">Foydalanuvchi & Aloqa</th>
                  <th className="py-4 px-4 w-[15%]">Roli</th>
                  <th className="py-4 px-4 w-[25%]">Oyin Darajasi</th>
                  <th className="py-4 px-4 w-[15%]">Hozirgi Status</th>
                  <th className="py-4 px-4 w-[10%] text-right">Amallar</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                <AnimatePresence>
                  {filteredPlayers.map((player) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-slate-200/50 dark:border-slate-800/50 ${player.avatarColor}`}
                        >
                          {player.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-950 dark:text-slate-50 truncate">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {player.username} • {player.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/30 dark:border-slate-700/30">
                          <Shield className="w-3.5 h-3.5 text-indigo-500" />
                          {player.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 max-w-[160px]">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-200 block">
                            {player.level}
                          </span>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500"
                              style={{ width: `${player.xp}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${player.statusColor}`}
                          />
                          <span className="text-slate-700 dark:text-slate-300">
                            {player.status}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() =>
                              handleOpenPrivateNotif({
                                id: player.id,
                                name: player.name,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                            title="Notification yuborish"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleBan(player.id)}
                            className={`p-1.5 rounded-lg transition-colors ${player.status === "Banned" ? "text-emerald-500 hover:bg-emerald-550/10" : "text-rose-500 hover:bg-rose-550/10"}`}
                            title={
                              player.status === "Banned"
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
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Ochirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CUSTOM TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            // Tepadan pastga qarab tushishi uchun initial da y: -50 qilindi
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            // Joylashuvi top-center (tepa o'rtaga) o'tkazildi
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-200 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* NOTIFICATION MODAL */}
      <NotificationModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
        onSubmit={handleSendNotification}
        isPublic={notifConfig.isPublic}
        targetUser={notifConfig.targetUser}
        initialValues={notifConfig.initialValues}
      />

      {/* MODAL 1: User qoshish */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              onClick={() => setIsUserModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Yangi Boshqaruvchi
                </h3>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold text-slate-400 uppercase text-xs mb-1">
                    Toliq Ismi
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase text-xs mb-1">
                    Email manzili
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase text-xs mb-1">
                    Tizimdagi Roli
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Ochirish */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex items-start gap-3 text-sm">
                <div className="p-2.5 bg-red-50 text-red-500 rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Foydalanuvchini ochirish?
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Ushbu foydalanuvchi tizimdan butunlay olib tashlanadi.
                    Amalni ortga qaytarib bolmaydi.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
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
