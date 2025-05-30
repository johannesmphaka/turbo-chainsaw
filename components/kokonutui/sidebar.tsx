"use client"

import type React from "react"

import {
  Users2,
  Shield,
  MessagesSquare,
  Settings,
  HelpCircle,
  Menu,
  LineChart,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Calculator,
  Play,
} from "lucide-react"

import { Home } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string
    icon: any
    children: React.ReactNode
  }) {
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-medium"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        }`}
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link
            href="/dashboard"
            className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
          >
            <div className="flex items-center gap-3">
              <Image
                src="https://kokonutui.com/logo.svg"
                alt="Acme"
                width={32}
                height={32}
                className="flex-shrink-0 hidden dark:block"
              />
              <Image
                src="https://kokonutui.com/logo-black.svg"
                alt="Acme"
                width={32}
                height={32}
                className="flex-shrink-0 block dark:hidden"
              />
              <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                Analytics Dashboard
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Overview
                </div>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/ild" icon={LineChart}>
                    ILD
                  </NavItem>
                  <NavItem href="/scenarios" icon={PieChart}>
                    Scenarios
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Capital Runs
                </div>
                <div className="space-y-1">
                  <NavItem href="/capital-runs/experiment" icon={Calculator}>
                    Experiment Runs
                  </NavItem>
                  <NavItem href="/capital-runs/actual" icon={FileSpreadsheet}>
                    Actual Runs
                  </NavItem>
                  <NavItem href="/capital-runs/scenarios" icon={Play}>
                    Scenario Runs
                  </NavItem>
                  <NavItem href="/capital-runs/history" icon={BarChart3}>
                    Run History
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Business Inputs
                </div>
                <div className="space-y-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Coming Soon",
                        description: "Business Units management will be available soon.",
                      })
                    }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
                  >
                    <Users2 className="h-4 w-4 mr-3 flex-shrink-0" />
                    Business Units
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Coming Soon",
                        description: "Access Control settings will be available soon.",
                      })
                    }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
                  >
                    <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                    Access Control
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Coming Soon",
                        description: "Scenario Capture functionality will be available soon.",
                      })
                    }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
                  >
                    <MessagesSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                    Scenario Capture
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toast({
                        title: "Coming Soon",
                        description: "Data Templates management will be available soon.",
                      })
                    }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3 flex-shrink-0" />
                    Data Templates
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toast({
                    title: "Coming Soon",
                    description: "Settings page will be available soon.",
                  })
                }}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
              >
                <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                Settings
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toast({
                    title: "Coming Soon",
                    description: "Help documentation will be available soon.",
                  })
                }}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full text-left
        text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]`}
              >
                <HelpCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                Help
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
