"use client"

import { Link } from "react-router-dom"
import { FileText, Users, Calendar, Settings, ChevronDown, ChevronRight, Menu, Map, User, Tag } from "lucide-react"

export default function DashboardSidebar({ isSidebarOpen, setIsSidebarOpen, activeSection, setActiveSection }) {
  const sidebarSections = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <Map className="w-5 h-5" />,
    },
    {
      id: "treks",
      name: "Trek Management",
      icon: <Map className="w-5 h-5" />,
      subsections: [
        "All Treks",
        "Add Trek",
        "Categories",
        "Service Management",
        "Highlights Management",
        "Reviews",
        "Pricing",
      ],
    },
    {
      id: "guides",
      name: "Guide Management",
      icon: <User className="w-5 h-5" />,
      subsections: ["All Guides", "Applications", "Performance", "Schedule"],
    },
    {
      id: "reservations",
      name: "Reservations",
      icon: <Calendar className="w-5 h-5" />,
      subsections: ["All Bookings", "Pending", "Confirmed", "Cancelled"],
    },
    {
      id: "users",
      name: "User Management",
      icon: <Users className="w-5 h-5" />,
      subsections: ["All Users", "Roles", "Permissions", "Activity"],
    },
    {
      id: "posts",
      name: "Post Management",
      icon: <FileText className="w-5 h-5" />,
      subsections: ["All Posts", "Categories", "Comments", "Reports"],
    },
    {
      id: "categories",
      name: "Categories",
      icon: <Tag className="w-5 h-5" />,
      subsections: ["All Categories", "Add Category"],
    },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  return (
    <aside
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-[#111926] text-white transition-all duration-300 ease-in-out fixed h-full z-10`}
    >
      <div className="p-4 flex items-center justify-between">
        <h2 className={`font-bold text-xl ${!isSidebarOpen && "hidden"}`}>Admin Panel</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-4">
        {sidebarSections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                activeSection === section.id ? "bg-gray-700 text-white" : ""
              }`}
            >
              <span className="mr-3">{section.icon}</span>
              {isSidebarOpen && (
                <>
                  <span className="flex-1 text-left">{section.name}</span>
                  {section.subsections && (
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === section.id ? "transform rotate-180" : ""
                      }`}
                    />
                  )}
                </>
              )}
            </button>

            {isSidebarOpen && section.subsections && activeSection === section.id && (
              <div className="bg-gray-800 py-2">
                {section.subsections.map((subsection) => (
                  <Link
                    key={subsection}
                    to={
                      section.id === "categories"
                        ? subsection === "All Categories"
                          ? "/admin/categories/all-categories"
                          : "/admin/categories/add-category"
                        : section.id === "treks" && subsection === "Add Trek"
                          ? "/admin/treks/add-trek"
                          : section.id === "treks" && subsection === "Service Management"
                            ? "/admin/treks/service-management"
                            : section.id === "treks" && subsection === "Highlights Management"
                              ? "/admin/treks/highlights-management"
                              : `/admin/${section.id}/${subsection.toLowerCase().replace(" ", "-")}`
                    }
                    className="flex items-center px-11 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    {subsection}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

