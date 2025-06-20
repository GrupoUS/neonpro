import { Mail, MoreVertical, Shield, UserPlus } from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Product Manager",
    email: "ana.silva@grupous.com",
    avatar: "AS",
    status: "online",
    access: "Admin",
  },
  {
    id: 2,
    name: "Carlos Santos",
    role: "Senior Developer",
    email: "carlos.santos@grupous.com",
    avatar: "CS",
    status: "online",
    access: "Editor",
  },
  {
    id: 3,
    name: "Beatriz Lima",
    role: "UI/UX Designer",
    email: "beatriz.lima@grupous.com",
    avatar: "BL",
    status: "offline",
    access: "Editor",
  },
  {
    id: 4,
    name: "Daniel Costa",
    role: "Marketing Lead",
    email: "daniel.costa@grupous.com",
    avatar: "DC",
    status: "away",
    access: "Viewer",
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Team Members
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your team and their access levels
          </p>
        </div>
        <button className="glass-button-primary flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="glass-card p-6 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-grupous-secondary to-grupous-primary flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {member.email}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {member.access}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      member.status === "online"
                        ? "bg-green-500"
                        : member.status === "away"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {member.status}
                  </span>
                </div>
                <button className="text-sm text-grupous-secondary hover:text-grupous-primary transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Statistics */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Team Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {teamMembers.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Members
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {teamMembers.filter((m) => m.status === "online").length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Currently Online
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              3
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Active Projects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
