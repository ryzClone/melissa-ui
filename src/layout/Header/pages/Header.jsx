import { useContext, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/core/auth/AuthContext";

import LanguageDropdown from "@/components/LanguageDropdown/LanguageDropdown";

import { useProfile } from "@/context/ProfileContext";

import {

  Bell,

  CircleHelp,

  Search,

  User,

  LogOut,

  ChevronDown,

  X,

  ShoppingBag,

  CreditCard,

  Users,

  Settings,

} from "lucide-react";

import "../../Header/header.css";



export default function Header() {

  const [menuOpen, setMenuOpen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);

  const [avatarError, setAvatarError] = useState(false);



  const menuRef = useRef(null);

  const notifRef = useRef(null);

  const navigate = useNavigate();

  const { logout } = useContext(AuthContext);

  const {

    displayName,

    userRole,

    avatarUrl,

    avatarInitials,

    openProfileModal,

  } = useProfile();



  useEffect(() => {

    setAvatarError(false);

  }, [avatarUrl]);



  const notifications = [

    {

      id: 1,

      title: "Yangi buyurtma",

      text: "Yangi buyurtma qabul qilindi.",

      time: "2 min oldin",

      icon: <ShoppingBag size={16} />,

      unread: true,

    },

    {

      id: 2,

      title: "To‘lov tasdiqlandi",

      text: "Mijoz to‘lovi muvaffaqiyatli amalga oshirildi.",

      time: "10 min oldin",

      icon: <CreditCard size={16} />,

      unread: true,

    },

    {

      id: 3,

      title: "Yangi foydalanuvchi",

      text: "Tizimga yangi foydalanuvchi qo‘shildi.",

      time: "1 soat oldin",

      icon: <Users size={16} />,

      unread: false,

    },

  ];



  const unreadCount = notifications.filter((item) => item.unread).length;

  const avatarLetter = (
    displayName?.trim()?.[0] ||
    avatarInitials?.[0] ||
    "U"
  ).toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };



  const handleOpenProfile = () => {

    setMenuOpen(false);

    openProfileModal();

  };

  const handleOpenSettings = () => {
    setMenuOpen(false);
    navigate("/settings");
  };

  const renderAvatar = (sizeClass, showInitials = false) => {
    if (avatarUrl && !avatarError) {
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          onError={() => setAvatarError(true)}
        />
      );
    }

    return (
      <span className="profile-avatar-letter">
        {showInitials ? avatarInitials : avatarLetter}
      </span>
    );
  };

  useEffect(() => {

    function handleClickOutside(event) {

      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setMenuOpen(false);

      }



      if (

        notifRef.current &&

        !notifRef.current.contains(event.target) &&

        !event.target.closest(".header-notification-trigger")

      ) {

        setNotifOpen(false);

      }

    }



    function handleEsc(event) {

      if (event.key === "Escape") {

        setMenuOpen(false);

        setNotifOpen(false);

      }

    }



    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEsc);



    return () => {

      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEsc);

    };

  }, []);



  return (

    <>

      <header className="header-container">

        <div className="header-left">

          <div className="header-search">

            <Search size={18} className="header-search-icon" />

            <input

              type="text"

              placeholder="Qidirish..."

              className="header-search-input"

            />

          </div>

        </div>



        <div className="header-right">

          <LanguageDropdown variant="inline" />

          <button

            type="button"

            className="header-icon-btn header-notification-trigger"

            onClick={() => setNotifOpen(true)}

          >

            <Bell size={18} />

            {unreadCount > 0 && (

              <span className="header-badge">

                {unreadCount > 9 ? "9+" : unreadCount}

              </span>

            )}

          </button>



          <button

            type="button"

            className="header-icon-btn"

            onClick={() => navigate("/help")}

          >

            <CircleHelp size={18} />

          </button>



          <div className="header-user-menu profile-menu" ref={menuRef}>

            <button

              type="button"

              className={`profile-trigger ${menuOpen ? "is-open" : ""}`}

              onClick={() => setMenuOpen((prev) => !prev)}

              aria-expanded={menuOpen}

              aria-haspopup="menu"

            >

              <div className="profile-avatar profile-avatar--sm">

                {renderAvatar("profile-avatar--sm")}

              </div>

              <span className="profile-name" title={displayName}>

                {displayName}

              </span>

              <ChevronDown

                size={16}

                className={`header-chevron ${menuOpen ? "open" : ""}`}

              />

            </button>



            {menuOpen && (

              <div className="profile-dropdown" role="menu">

                <div className="profile-dropdown-head">

                  <div className="profile-avatar profile-avatar--lg">

                    {renderAvatar("profile-avatar--lg", true)}

                  </div>

                  <div className="profile-dropdown-meta">

                    <strong className="profile-dropdown-name" title={displayName}>

                      {displayName}

                    </strong>

                    <span className="profile-dropdown-role">{userRole}</span>

                  </div>

                </div>

                <div className="profile-dropdown-divider" />

                <button

                  type="button"

                  className="profile-dropdown-item"

                  role="menuitem"

                  onClick={handleOpenProfile}

                >

                  <User size={16} />

                  <span>Profile</span>

                </button>

                <button

                  type="button"

                  className="profile-dropdown-item"

                  role="menuitem"

                  onClick={handleOpenSettings}

                >

                  <Settings size={16} />

                  <span>Settings</span>

                </button>

                <button

                  type="button"

                  className="profile-dropdown-item logout"

                  role="menuitem"

                  onClick={handleLogout}

                >

                  <LogOut size={16} />

                  <span>Logout</span>

                </button>

              </div>

            )}

          </div>

        </div>

      </header>



      {notifOpen && (

        <div className="notif-overlay" onClick={() => setNotifOpen(false)} />

      )}



      <aside

        ref={notifRef}

        className={`notif-drawer ${notifOpen ? "open" : ""}`}

      >

        <div className="notif-header">

          <div>

            <h3>Bildirishnomalar</h3>

            <p>{unreadCount} ta yangi xabar</p>

          </div>



          <button

            type="button"

            className="notif-close-btn"

            onClick={() => setNotifOpen(false)}

          >

            <X size={18} />

          </button>

        </div>



        <div className="notif-list">

          {notifications.map((item) => (

            <button

              key={item.id}

              type="button"

              className={`notif-item ${item.unread ? "unread" : ""}`}

            >

              <span className="notif-item-icon">{item.icon}</span>



              <div className="notif-item-content">

                <div className="notif-item-top">

                  <h4>{item.title}</h4>

                  <span>{item.time}</span>

                </div>



                <p>{item.text}</p>

              </div>



              {item.unread && <span className="notif-unread-dot" />}

            </button>

          ))}

        </div>

      </aside>

    </>

  );

}

