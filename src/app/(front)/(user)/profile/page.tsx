"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAccount } from "@/generated/prisma";
import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";
import { Calendar, Clock, Edit3, Mail, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { EditProfileDialog } from "./_components/EditProfile";

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return "U";
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
}

function ProfilePage() {
  const loadUserDataQuery = trpc.auth.getCurrentUserAccount.useQuery();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (loadUserDataQuery.data && loadUserDataQuery.isSuccess) {
      setUser(loadUserDataQuery.data);
      setLoading(false);
    } else if (loadUserDataQuery.isLoading) {
      setLoading(true);
    }
  }, [
    loadUserDataQuery.data,
    loadUserDataQuery.isLoading,
    loadUserDataQuery.isSuccess,
  ]);

  const handleUserUpdate = (updatedUser: UserAccount) => {
    setUser(updatedUser);
    setIsEditOpen(false);
  };

  const formatDate = (dateString: Date | string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen w-full bg-[#1e1e1e] text-white p-4 flex items-center justify-center">
        {/* Background gradient effects similar to homepage */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-emerald-500/10 blur-[100px] rounded-full z-0"></div>

        <div className="w-full max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-[#252525] border border-gray-800 shadow-xl w-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1e1e1e] rounded-t-lg p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl sm:text-2xl font-bold">
                    User Profile
                  </CardTitle>
                </div>
                <Button
                  onClick={() => setIsEditOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto mt-4 sm:mt-0 flex items-center gap-2"
                  disabled={!user || loading}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </CardHeader>

              <CardContent className="p-6">
                {loading ? (
                  <ProfileSkeleton />
                ) : user ? (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-emerald-500 shadow-lg">
                          {user.profileUrl && (
                            <AvatarImage
                              src={user.profileUrl}
                              alt={user.username}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-2xl">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      <div className="flex-1 space-y-3 text-center sm:text-left">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                        >
                          <h3 className="text-white text-2xl sm:text-3xl font-bold">
                            {user.username}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-sm px-3 py-1">
                              @{user.role}
                            </Badge>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          className="mt-4"
                        ></motion.div>
                      </div>
                    </div>

                    <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800">
                      <h4 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800">
                        User Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-white">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] border border-gray-800"
                        >
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Mail className="text-emerald-400 h-5 w-5 flex-shrink-0" />
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm block">
                              Email
                            </span>
                            <span className="break-all">{user.email}</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 0.3 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] border border-gray-800"
                        >
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Clock className="text-emerald-400 h-5 w-5 flex-shrink-0" />
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm block">
                              Last Login
                            </span>
                            <span>
                              {user.lastLogin
                                ? formatDate(user.lastLogin)
                                : "Never"}
                            </span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7, duration: 0.3 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] border border-gray-800"
                        >
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Calendar className="text-emerald-400 h-5 w-5 flex-shrink-0" />
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm block">
                              Member Since
                            </span>
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8, duration: 0.3 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-[#252525] border border-gray-800"
                        >
                          <div className="bg-emerald-500/20 p-2 rounded-lg">
                            <Calendar className="text-emerald-400 h-5 w-5 flex-shrink-0" />
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm block">
                              Last Updated
                            </span>
                            <span>{formatDate(user.updatedAt)}</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center py-16 text-white"
                  >
                    <div className="bg-emerald-500/10 p-6 rounded-full mb-4">
                      <UserIcon className="h-16 w-16 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-medium">No User Found</h3>
                    <p className="text-gray-400 mt-2 text-center max-w-sm">
                      Please sign in to view your profile information and
                      settings
                    </p>
                    <Button
                      className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => (window.location.href = "/auth/login")}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {user && (
            <EditProfileDialog
              user={user}
              isOpen={isEditOpen}
              onCloseAction={() => setIsEditOpen(false)}
              onUserUpdateAction={handleUserUpdate}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-800" />
      <div className="flex-1 space-y-3 w-full">
        <Skeleton className="h-8 w-48 max-w-full bg-gray-800" />
        <Skeleton className="h-6 w-32 max-w-full bg-gray-800" />
        <Skeleton className="h-4 w-64 max-w-full bg-gray-800" />
      </div>
    </div>

    <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800">
      <Skeleton className="h-6 w-48 mb-4 bg-gray-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default ProfilePage;
