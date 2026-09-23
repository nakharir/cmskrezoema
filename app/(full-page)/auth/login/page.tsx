/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import axios from 'axios';
import { API_ENDPOINTS } from '@/app/api/losbackend/api';

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post(
                API_ENDPOINTS.LOGIN,
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'ngrok-skip-browser-warning': 'true',
                    },
                }
            );

            document.cookie = `user-info=${JSON.stringify(response.data)}; path=/`;

            if (response.data.status === 2 || response.data.status === 3) {
                router.push('/operator/');
            } else if (response.data.status === 1) {
                router.push('/admin/');
            } else {
                router.push('/auth/error');
            }
        } catch (error: any) {
            console.error('Terjadi kesalahan!', error);
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-row h-screen">
            {/* Bagian kiri - Putih */}
            <div
                className="h-full flex flex-column justify-content-center align-items-center p-8 w-1/2"
                style={{ backgroundColor: '#ffffff' }}
            >
                <div className="w-10/12">
                    <h1 className="text-3xl mb-2 text-gray-800">Selamat Datang di</h1>
                    <h2 className="text-5xl font-bold mb-6 text-gray-900">MANAJEMEN KONTEN WEB SDN 01 MANGUHARJO</h2>

                   <form onSubmit={handleSubmit} className="mt-8">
    <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
        </label>
        <InputText
            id="email"
            type="email"
            placeholder="Masukkan Email"
            className="w-full p-3 border border-gray-300 rounded-md"
            value={email}
            onChange={handleEmailChange}
        />
    </div>

    <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
        </label>
        <Password
            inputId="password"
            placeholder="Masukkan Password"
            toggleMask
            className="w-full"
            inputClassName="w-full p-3 border border-gray-300 rounded-md"
            weakLabel="Lemah"
            mediumLabel="Sedang"
            strongLabel="Kuat"
            promptLabel="Masukkan kata sandi"
            value={password}
            onChange={handlePasswordChange}
        />
    </div>

    {/* 🔥 ALERT ERROR LOGIN */}
    {showAlert && (
        <p className="text-red-600 text-sm mb-4">
            Email atau password salah!
        </p>
    )}

    <Button
        label={isLoading ? 'Memproses...' : 'Masuk'}
        className="border-none w-full p-3 text-xl text-white font-semibold transition-all duration-300 ease-in-out"
        style={{ backgroundColor: '#ff0000' }}
    />
</form>

                </div>
            </div>

            {/* Bagian kanan - Merah */}
            <div
                className="flex items-center justify-center w-1/2"
                style={{ backgroundColor: '#830404ff' }}
            >
                <img
                    src="/demo/images/login/bg-login.png"
                    alt="Login Illustration"
                    className="max-w-md w-full drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                />
            </div>
        </div>
    );
};

export default LoginPage;
