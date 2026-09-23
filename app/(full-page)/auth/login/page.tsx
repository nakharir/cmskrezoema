/* eslint-disable @next/next/no-img-element */
'use client';

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
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
        setShowAlert(false);
        try {
            const response = await axios.post(
                API_ENDPOINTS.LOGIN,
                { email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            document.cookie = `user-info=${JSON.stringify(response.data)}; path=/`;

            // Redirect admin or operator to dashboard
            if (response.data.status === 2 || response.data.status === 3) {
                router.push('/operator/');
            } else if (response.data.status === 1) {
                router.push('/admin/');
            } else {
                router.push('/auth/error');
            }
        } catch (error: any) {
            console.error('Terjadi kesalahan saat login!', error);
            setShowAlert(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-column md:flex-row align-items-center justify-content-center"
            style={{ backgroundColor: '#FAF8F5' }}
        >
            {/* Bagian Kiri - Form Login */}
            <div className="w-full md:w-6 h-full min-h-screen flex align-items-center justify-content-center p-4 sm:p-6 lg:p-8 bg-white">
                <div className="w-full" style={{ maxWidth: '440px' }}>
                    {/* Brand Header */}
                    <div className="mb-5">
                        <div className="flex align-items-center gap-2 mb-3">
                            <img
                                src="/logo-krezoema.png"
                                alt="KREZOEMA"
                                style={{ height: '36px' }}
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                            <span
                                className="font-bold text-2xl tracking-wider"
                                style={{ color: '#D96C91' }}
                            >
                                KREZOEMA
                            </span>
                        </div>
                        <span className="text-sm uppercase font-semibold text-500 tracking-wider block mb-1">
                            Selamat Datang di
                        </span>
                        <h1
                            className="text-3xl sm:text-4xl font-bold m-0 mb-1"
                            style={{ color: '#272329' }}
                        >
                            KREZOEMA
                        </h1>
                        <p className="text-base font-medium m-0 mb-2" style={{ color: '#B94F76' }}>
                            Creative Craft &amp; Handmade Accessories
                        </p>
                        <p className="text-sm text-600 m-0">
                            Kelola produk, pesanan, dan konten KREZOEMA.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                        <div className="field m-0">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Email Administrator
                            </label>
                            <InputText
                                id="email"
                                type="email"
                                placeholder="nama@krezoema.com"
                                className="w-full p-3 border-round border-1 surface-border"
                                value={email}
                                onChange={handleEmailChange}
                                required
                            />
                        </div>

                        <div className="field m-0">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Kata Sandi
                            </label>
                            <Password
                                inputId="password"
                                placeholder="Masukkan kata sandi"
                                toggleMask
                                feedback={false}
                                className="w-full"
                                inputClassName="w-full p-3 border-round border-1 surface-border"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        {/* Error Alert */}
                        {showAlert && (
                            <div
                                className="p-3 border-round border-1 text-sm flex align-items-center gap-2"
                                style={{
                                    backgroundColor: '#F8E4EB',
                                    borderColor: '#D96C91',
                                    color: '#B94F76'
                                }}
                            >
                                <i className="pi pi-exclamation-circle text-base"></i>
                                <span>Email atau password yang Anda masukkan tidak sesuai.</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            label={isLoading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
                            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
                            className="w-full p-3 text-base font-semibold border-none border-round mt-2 shadow-1 transition-all transition-duration-200"
                            style={{
                                backgroundColor: '#D96C91',
                                color: '#FFFFFF'
                            }}
                            disabled={isLoading}
                        />
                    </form>

                    <div className="text-center mt-6 pt-4 border-top-1 surface-border">
                        <span className="text-xs text-500">
                            &copy; {new Date().getFullYear()} KREZOEMA. Hak cipta dilindungi.
                        </span>
                    </div>
                </div>
            </div>

            {/* Bagian Kanan - Visual KREZOEMA */}
            <div
                className="hidden md:flex w-6 h-full min-h-screen flex-column justify-content-between p-8"
                style={{
                    backgroundColor: '#272329',
                    color: '#FFFFFF'
                }}
            >
                <div className="flex justify-content-end">
                    <span
                        className="text-xs font-semibold px-3 py-1 border-round uppercase tracking-wider"
                        style={{
                            backgroundColor: 'rgba(217, 108, 145, 0.2)',
                            color: '#D96C91',
                            border: '1px solid rgba(217, 108, 145, 0.4)'
                        }}
                    >
                        Admin Portal
                    </span>
                </div>

                <div className="max-w-md mx-auto my-auto text-left">
                    <div
                        className="inline-block px-3 py-1 border-round-2xl text-xs font-medium mb-4"
                        style={{ backgroundColor: '#F8E4EB', color: '#B94F76' }}
                    >
                        Creative Craft &amp; Handmade Accessories
                    </div>
                    <h2 className="text-4xl font-bold mb-3 line-height-2 text-white">
                        KREZOEMA
                    </h2>
                    <blockquote
                        className="m-0 mb-4 pl-3 border-left-3 text-lg font-light italic"
                        style={{ borderColor: '#D96C91', color: '#E5E7EB' }}
                    >
                        &ldquo;Dari kreativitas menjadi karya, dari karya menjadi identitas.&rdquo;
                    </blockquote>
                    <p className="text-sm text-400 m-0 line-height-3">
                        Sistem manajemen terpusat untuk katalog produk manik, akrilik, mutiara,
                        tali &amp; kawat, serta perlengkapan kerajinan tangan.
                    </p>
                </div>

                <div className="flex justify-content-between align-items-center text-xs text-500">
                    <span>Versi CMS 1.0</span>
                    <span>KREZOEMA Ecommerce</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
