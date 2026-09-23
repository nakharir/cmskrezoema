/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useContext, useEffect, useState } from "react";
import AppMenuitem from "./AppMenuitem";
import { LayoutContext } from "./context/layoutcontext";
import { MenuProvider } from "./context/menucontext";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/api/losbackend/api";
import { Brain } from "lucide-react";

import { AppMenuItem } from "@/types";

interface Sidebar {
  sidebar_id: number;
  label: string;
  to_path: string;
  status: number;
}

const AppMenu = () => {
  const [sidebar, setSidebar] = useState<Sidebar[]>([]);
  const { layoutConfig } = useContext(LayoutContext);
  const [status, setStatus] = useState<number>();

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const cookies = document.cookie.split(";");
        const userInfoCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("user-info=")
        );
        if (userInfoCookie) {
          const userInfo = userInfoCookie.split("=")[1];
          const user = JSON.parse(userInfo);
          setStatus(user.status);
          const userId = user.id;
          const response = await axios.get(API_ENDPOINTS.SIDEBAR(userId));
          setSidebar(response.data.sidebars);
        } else {
          console.error("User info not found in cookies");
        }
      } catch (error) {
        console.error("There was an error fetching the sidebar!", error);
      }
    };
    fetchSidebar();
  }, []);

  // 🧭 Sidebar untuk user biasa
  const modelUser: AppMenuItem[] = [
    {
      label: "Dashboard",
      items: [{ label: "Dashboard", icon: "pi pi-fw pi-home", to: "/" }],
    },
    {
      label: "Data Debitur",
      icon: "pi pi-users",
      to: "/user/debitur",
    },
  ];

  // 🧭 Sidebar untuk operator (status = 2)
  const modelOperator: AppMenuItem[] = [
    {
      label: "Beranda Admin",
      items: [
        { label: "Beranda Admin", icon: "pi pi-fw pi-home", to: "/operator/" },
      ],
    },
    {
      label: "Manajemen Konten",
      icon: "pi pi-folder-open",
      items: [
        {
          label: "Beranda",
          icon: "pi pi-globe",
          to: "/operator/CMS_Landing",
        },
        {
          label: "Data Guru",
          icon: "pi pi-id-card",
          to: "/operator/CMS_Guru",
        },
        {
          label: "Sarana Prasarana",
          icon: "pi pi-building",
          items: [
            {
              label: "Fasilitas",
              icon: "pi pi-briefcase",
              to: "/operator/CMS_Fasilitas",
            },
            {
              label: "Ekstrakurikuler",
              icon: "pi pi-star",
              to: "/operator/CMS_Ekskul",
            },
          ],
        },
        {
          label: "Profile Sekolah",
          icon: "pi pi-book",
          items: [
            {
              label: "Profile",
              icon: "pi pi-user",
              to: "/operator/CMS_Profile",
            },
            {
              label: "Visi Misi",
              icon: "pi pi-star",
              to: "/operator/CMS_VisiMisi",
            },
            {
              label: "Berita",
              icon: "pi pi-megaphone",
              to: "/operator/CMS_berita",
            },
          ],
        },
        {
          label: "Hubungi Kami",
          icon: "pi pi-envelope",
          to: "/operator/CMS_Hubkami",
        },
      ],
    },
  ];

  // 🧭 Sidebar untuk admin (status = 1)
  const modelAdmin: AppMenuItem[] = [
    {
      label: "Dashboard",
      items: [{ label: "Beranda Admin", icon: "pi pi-fw pi-home", to: "/admin/" }],
    },
    {
      label: "Kelola Data Admin",
      icon: "pi pi-users",
      items: [
        {
          label: "Data Admin",
          icon: "pi pi-user",
          to: "/admin/Data_Operator",
        },
      ],
    },
      {
      label: "Manajemen Konten",
      icon: "pi pi-folder-open",
      items: [
        {
          label: "Beranda",
          icon: "pi pi-globe",
          to: "/operator/CMS_Landing",
        },
        {
          label: "Data Guru",
          icon: "pi pi-id-card",
          to: "/operator/CMS_Guru",
        },
        {
          label: "Sarana Prasarana",
          icon: "pi pi-building",
          items: [
            {
              label: "Fasilitas",
              icon: "pi pi-briefcase",
              to: "/operator/CMS_Fasilitas",
            },
            {
              label: "Ekstrakurikuler",
              icon: "pi pi-star",
              to: "/operator/CMS_Ekskul",
            },
          ],
        },
        {
          label: "Profile Sekolah",
          icon: "pi pi-book",
          items: [
            {
              label: "Profile",
              icon: "pi pi-user",
              to: "/operator/CMS_Profile",
            },
            {
              label: "Visi Misi",
              icon: "pi pi-star",
              to: "/operator/CMS_VisiMisi",
            },
            {
              label: "Berita",
              icon: "pi pi-megaphone",
              to: "/operator/CMS_berita",
            },
          ],
        },
        {
          label: "Hubungi Kami",
          icon: "pi pi-envelope",
          to: "/operator/CMS_Hubkami",
        },
      ],
    },
  ];

  // ✅ Tentukan model berdasarkan role user
  const menuModel =
    status === 1 ? modelAdmin : status === 2 ? modelOperator : modelUser;

  return (
    <MenuProvider>
      <ul className="layout-menu">
        {menuModel.map((item, i) =>
          !item?.seperator ? (
            <AppMenuitem item={item} root={true} index={i} key={item.label} />
          ) : (
            <li className="menu-separator" key={i}></li>
          )
        )}
      </ul>
    </MenuProvider>
  );
};

export default AppMenu;
