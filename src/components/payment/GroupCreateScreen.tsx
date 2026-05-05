import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, Camera, Check, Loader2 } from "lucide-react";
import { playClick, playSuccess, vibrate } from "@/lib/payment-store";

type View = "main" | "processing" | "success";

interface Member {
  id: number;
  name: string;
  avatar: string;
  color: string;
  selected: boolean;
}

const AVAILABLE_MEMBERS: Member[] = [
  { id: 1, name: "Rahim", avatar: "R", color: "from-emerald-500 to-teal-600", selected: true },
  { id: 2, name: "Anas", avatar: "A", color: "from-blue-500 to-indigo-600", selected: true },
  { id: 3, name: "Fasil", avatar: "F", color: "from-purple-500 to-fuchsia-600", selected: true },
  { id: 4, name: "Salim", avatar: "S", color: "from-slate-500 to-slate-600", selected: false },
  { id: 5, name: "Arif", avatar: "A", color: "from-green-500 to-emerald-600", selected: false },
];

export function GroupCreateScreen({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>("main");
  const [groupName, setGroupName] = useState("Friends");
  const [members, setMembers] = useState<Member[]>(AVAILABLE_MEMBERS);

  const selectedCount = members.filter((m) => m.selected).length;

  const toggleMember = (id: number) => {
    playClick();
    vibrate(10);
    setMembers(members.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)));
  };

  const handleCreateGroup = async () => {
    if (selectedCount === 0) return;
    
    playClick();
    vibrate(15);
    setView("processing");

    await new Promise((r) => setTimeout(r, 2000));

    playSuccess();
    vibrate([20, 30, 20]);
    setView("success");
  };

  const handleDone = () => {
    playClick();
    vibrate(15);
    onBack();
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 text-slate-100 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur px-4 pt-3 pb-3">
        <div className="flex items-center">
          <button
            onClick={() => {
              playClick();
              vibrate(15);
              onBack();
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center active:scale-90 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold pr-9">Create Group</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* MAIN VIEW */}
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pt-6"
          >
            {/* Group Icon with Camera */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="h-28 w-28 rounded-full bg-slate-800 flex items-center justify-center">
                  <Users className="h-12 w-12 text-slate-500" strokeWidth={2} />
                </div>
                <button
                  onClick={() => {
                    playClick();
                    vibrate(10);
                  }}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-slate-700 border-4 border-slate-950 flex items-center justify-center active:scale-90 transition"
                >
                  <Camera className="h-5 w-5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Group Name */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Group Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-4 pr-12 rounded-2xl bg-slate-900 border border-slate-800 outline-none focus:border-purple-500 transition font-semibold"
                  placeholder="Enter group name"
                />
                {groupName && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Add Members */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Add Members</label>
              <div className="space-y-3">
                {members.map((member, index) => (
                  <motion.button
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleMember(member.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 active:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center font-bold text-white text-lg`}>
                        {member.avatar}
                      </div>
                      <span className="font-semibold">{member.name}</span>
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                        member.selected
                          ? "bg-purple-500 border-purple-500"
                          : "border-slate-600"
                      }`}
                    >
                      {member.selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Create Group Button */}
            <button
              onClick={handleCreateGroup}
              disabled={selectedCount === 0 || !groupName.trim()}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 font-bold text-lg shadow-lg active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Group
            </button>
          </motion.div>
        )}

        {/* PROCESSING */}
        {view === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 pt-20 text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-6" />
            <p className="font-semibold text-lg">Creating Group...</p>
            <p className="text-sm text-slate-400 mt-2">Adding {selectedCount} members</p>
          </motion.div>
        )}

        {/* SUCCESS */}
        {view === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 pt-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/40"
            >
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Group Created!</h2>
            <p className="text-sm text-slate-400 mb-8">
              "{groupName}" with {selectedCount} members
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <h3 className="text-sm text-slate-400 mb-4">Group Members</h3>
              <div className="space-y-3">
                {members
                  .filter((m) => m.selected)
                  .map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center font-bold text-white`}>
                        {member.avatar}
                      </div>
                      <span className="text-sm font-semibold">{member.name}</span>
                      <Check className="h-4 w-4 text-emerald-400 ml-auto" strokeWidth={3} />
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full h-12 rounded-xl bg-emerald-500 font-bold active:scale-[0.98] transition"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
