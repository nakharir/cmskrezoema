import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import AppMenu from './AppMenu';
import { ChevronDown, LogOut, Menu, User } from 'lucide-react';
// import { Button } from 'react-bootstrap';

const AppSidebar = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Get user info from cookie
        const cookies = document.cookie.split(';');
        const userInfoCookie = cookies.find(cookie => cookie.trim().startsWith('user-info='));
        
        if (userInfoCookie) {
            const userInfo = userInfoCookie.split('=')[1];
            const parsedUserInfo = JSON.parse(userInfo);
            setUser({ name: parsedUserInfo.name });
        }
    }, []);

    const handleLogout = () => {
        // Delete user-info cookie on logout
        document.cookie = "user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/auth/login';
    };

    return (
        <div className='flex flex-column justify-content-between h-full pb-3'>
            <AppMenu />

            <div className="mt-auto">
                {user && (
                    <div
                        className="flex align-items-center justify-content-between p-2 border-round-lg" style={{ backgroundColor: '#FAF0F0' }}>
                        <div className='flex align-items-center pl-4'>
                            <User className="mr-2" size={20} />
                            <span>{user.name}</span>
                        </div>
                        <div>
                            <Button
                                icon={<LogOut className="mr-2" size={16} />}
                                className="p-button-rounded-sm p-button-danger p-button-text"
                                onClick={handleLogout}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppSidebar;
