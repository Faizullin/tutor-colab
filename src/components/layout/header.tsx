"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserRole } from "@/generated/prisma";
import useAuthStore from "@/store/userAuthStore";
import { Code, LogOut, Menu, User, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

function Header() {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-[#1e1e1e] border-b border-gray-800 text-white shadow-md">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:text-white"
            >
              <Code className="h-6 w-6 text-emerald-400" />
              <span className="text-2xl font-bold">
                <span className="text-white">Code</span>
                <span className="text-emerald-400">X</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              <Link
                href="/"
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/editor"
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Editor
              </Link>
              <Link
                href="/profile"
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/feedback-form"
                className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Feedback
              </Link>
              {/* Only render admin link on client side after mounting */}
              {user?.role === UserRole.admin && (
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Admin Details
                </Link>
              )}
            </div>
          </div>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative rounded-md bg-[#252525] border border-gray-700 text-white hover:bg-[#2a2a2a] hover:text-white hover:border-emerald-500/50 transition-all"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm">
                        {user?.username}
                      </span>
                      <div className="h-6 w-6 rounded-full bg-emerald-400/10 p-1 text-emerald-400">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-[#252525] text-white border-gray-800"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="hover:bg-[#2a2a2a] hover:text-white focus:bg-[#2a2a2a] focus:text-white cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut();
                      logout();
                    }}
                    className="text-red-400 hover:bg-[#2a2a2a] hover:text-white focus:bg-[#2a2a2a] focus:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="default"
                className="hidden md:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                onClick={() => router.push("/auth/login")}
              >
                Try CodeX
              </Button>
            )}

            {/* Mobile Menu Button */}
            <div className="ml-4 md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500"
                    onClick={() => setIsMenuOpen(true)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[250px] bg-[#1e1e1e] text-white p-0 border-l border-gray-800"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="px-4 py-6 space-y-4">
                    <div className="flex items-center mb-6">
                      <Code className="h-6 w-6 text-emerald-400 mr-2" />
                      <span className="text-xl font-bold">
                        <span className="text-white">Code</span>
                        <span className="text-emerald-400">X</span>
                      </span>
                    </div>

                    <Link
                      href="/"
                      className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-[#252525] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      href="/editor"
                      className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-[#252525] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Editor
                    </Link>
                    <Link
                      href="/feedback-form"
                      className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-[#252525] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Feedback
                    </Link>
                    {/* Only render admin link on client side after mounting */}
                    {user?.role === UserRole.admin && (
                      <Link
                        href="/dashboard"
                        className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-[#252525] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Details
                      </Link>
                    )}

                    {!user ? (
                      <Button
                        variant="default"
                        size="default"
                        className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          router.push("/auth/login");
                          setIsMenuOpen(false);
                        }}
                      >
                        Try CodeX
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="default"
                        className="w-full mt-6 border-gray-700 text-red-400 hover:bg-[#252525] hover:text-white"
                        onClick={() => {
                          signOut();
                          logout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
