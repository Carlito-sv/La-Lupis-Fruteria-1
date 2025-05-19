import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMediaQuery } from "@/hooks/use-mobile";
import { UserAvatar } from "@/components/ui/user-avatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [location] = useLocation();

  useEffect(() => {
    // Close mobile menu when location changes
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Close mobile menu when resizing to desktop
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  const isActiveLink = (path: string) => {
    return location === path;
  };

  const navLinks = [
    { label: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { label: "Punto de Venta", path: "/pos", icon: "ri-store-2-line" },
    { label: "Inventario", path: "/inventory", icon: "ri-archive-line" },
    { label: "Facturación", path: "/invoicing", icon: "ri-file-list-3-line" },
    { label: "Ingresos y Gastos", path: "/finances", icon: "ri-money-dollar-circle-line" },
    { label: "Personal", path: "/staff", icon: "ri-user-line" },
    { label: "Configuración", path: "/settings", icon: "ri-settings-line" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation for desktop */}
      <aside className="bg-primary-500 text-white w-64 flex-shrink-0 md:flex flex-col hidden z-20">
        <div className="p-4 flex items-center border-b border-primary-400">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <i className="ri-leaf-line text-primary-500 text-xl"></i>
          </div>
          <h1 className="ml-3 font-bold text-xl">La Lupis ERP</h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          <div className="px-4 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
            Principal
          </div>
          {navLinks.slice(0, 4).map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
            >
              <i className={`${link.icon} mr-3 text-xl`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
          
          <div className="px-4 mt-6 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
            Finanzas
          </div>
          {navLinks.slice(4, 6).map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
            >
              <i className={`${link.icon} mr-3 text-xl`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
          
          <div className="px-4 mt-6 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
            Administración
          </div>
          {navLinks.slice(6).map((link) => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
            >
              <i className={`${link.icon} mr-3 text-xl`}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-primary-400">
          <div className="flex items-center">
            <UserAvatar name="María Rodríguez" />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">María Rodríguez</p>
              <p className="text-xs text-white text-opacity-70">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header & Navigation */}
      <div className="md:hidden bg-primary-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="mr-2 text-xl"
            onClick={toggleMobileMenu}
          >
            <i className="ri-menu-line"></i>
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <i className="ri-leaf-line text-primary-500 text-lg"></i>
            </div>
            <h1 className="ml-2 font-bold text-lg">La Lupis</h1>
          </div>
        </div>
        <div className="flex items-center">
          <button className="text-xl mr-2">
            <i className="ri-notification-3-line"></i>
          </button>
          <UserAvatar name="María Rodríguez" size="sm" />
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-30 md:hidden`}>
        <div 
          className="bg-black bg-opacity-50 absolute inset-0"
          onClick={closeMobileMenu}
        ></div>
        <div className="bg-primary-500 text-white w-64 absolute inset-y-0 left-0 flex flex-col">
          <div className="p-4 flex items-center border-b border-primary-400">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <i className="ri-leaf-line text-primary-500 text-xl"></i>
            </div>
            <h1 className="ml-3 font-bold text-xl">La Lupis ERP</h1>
          </div>
          
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
            <div className="px-4 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
              Principal
            </div>
            {navLinks.slice(0, 4).map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
              >
                <i className={`${link.icon} mr-3 text-xl`}></i>
                <span>{link.label}</span>
              </Link>
            ))}
            
            <div className="px-4 mt-6 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
              Finanzas
            </div>
            {navLinks.slice(4, 6).map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
              >
                <i className={`${link.icon} mr-3 text-xl`}></i>
                <span>{link.label}</span>
              </Link>
            ))}
            
            <div className="px-4 mt-6 mb-3 text-xs font-semibold text-white text-opacity-60 uppercase tracking-wider">
              Administración
            </div>
            {navLinks.slice(6).map((link) => (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`flex items-center px-4 py-3 ${isActiveLink(link.path) ? 'bg-primary-600' : 'hover:bg-primary-600'} text-white`}
              >
                <i className={`${link.icon} mr-3 text-xl`}></i>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-primary-400">
            <div className="flex items-center">
              <UserAvatar name="María Rodríguez" />
              <div className="ml-3">
                <p className="text-sm font-medium text-white">María Rodríguez</p>
                <p className="text-xs text-white text-opacity-70">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
