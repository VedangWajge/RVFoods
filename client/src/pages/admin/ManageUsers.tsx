import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAdmin } from "@/hooks/useAdmin";
import { useUIStore } from "@/store/uiStore";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/common/Loader";
import {
  Search,
  ShieldAlert,
  CheckCircle,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

export default function ManageUsers() {
  const { users, loading, fetchUsers, updateUser } = useAdmin();
  const showToast = useUIStore((s) => s.showToast);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");

  // Loading state per user ID for action operations
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (userId: string, currentRole: "user" | "admin", name: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      window.confirm(
        `Are you sure you want to change "${name}" role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`
      )
    ) {
      setActionUserId(userId);
      const res = await updateUser(userId, { role: newRole });
      setActionUserId(null);
      if (res) {
        showToast(`User role updated to ${newRole}`, "success");
      } else {
        showToast("Failed to update user role", "error");
      }
    }
  };

  const handleVerificationToggle = async (userId: string, currentVerified: boolean, name: string) => {
    const newVerified = !currentVerified;
    setActionUserId(userId);
    const res = await updateUser(userId, { isVerified: newVerified });
    setActionUserId(null);
    if (res) {
      showToast(`User ${name} verification status set to ${newVerified ? "Verified" : "Unverified"}`, "success");
    } else {
      showToast(`Failed to update verification for ${name}`, "error");
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "" || u.role === roleFilter;
    const matchesVerified =
      verifiedFilter === "" ||
      (verifiedFilter === "verified" ? u.isVerified === true : u.isVerified === false);

    return matchesSearch && matchesRole && matchesVerified;
  });

  return (
    <>
      <Helmet>
        <title>Manage Users | Admin | RV Foods</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Users Management
          </h2>
          <p className="text-sm text-text-secondary">
            Manage user roles, verify email statuses, and look up registered accounts.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-xl border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search users by name, email, or phone..."
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              <option value="">All Verification States</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        {loading && users.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader size="lg" label="Retrieving user registry..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-xl">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-heading text-lg font-bold text-text-primary">No users found</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm mx-auto">
              No users matched your search filters. Try adjusting your query or filters.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const isSelfUpdating = actionUserId === user._id;

                    return (
                      <tr key={user._id} className="hover:bg-background/25 transition-colors">
                        <td className="px-6 py-4 font-semibold text-text-primary">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-text-muted" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-text-muted" />
                              {user.phone}
                            </div>
                          ) : (
                            <span className="text-text-muted text-xs font-medium italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.role === "admin" ? (
                            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10 font-bold text-xs">
                              Admin
                            </Badge>
                          ) : (
                            <Badge className="bg-background border border-border text-text-secondary hover:bg-background text-xs">
                              User
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.isVerified ? (
                            <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                              <CheckCircle className="h-4 w-4" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                              <ShieldAlert className="h-4 w-4" />
                              <span>Unverified</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-text-muted" />
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSelfUpdating ? (
                              <div className="flex items-center gap-1 text-xs text-primary font-medium pr-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Saving...</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVerificationToggle(user._id, user.isVerified, user.name)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    user.isVerified
                                      ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                      : "bg-success/5 border-success/15 text-success hover:bg-success/15"
                                  }`}
                                  title={user.isVerified ? "Mark as Unverified" : "Mark as Verified"}
                                >
                                  {user.isVerified ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleRoleToggle(user._id, user.role, user.name)}
                                  className="px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary/20 transition-colors"
                                  title="Toggle User Role"
                                >
                                  {user.role === "admin" ? "Demote" : "Promote"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Inline input helper since Shadcn UI input is imported
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

// Inline mini spinner helper
function Loader2({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
