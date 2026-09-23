/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { InputText } from 'primereact/inputtext';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/app/api/losbackend/api';
import axios from 'axios';

interface User {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    status: number;
}

const SignupPage = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState<User>({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        status: 1
    });

    const handleInputChange = (e: any) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value
        }));
    };

    const handlePasswordChange = (e: any) => {
        setFormData((prevData) => ({
            ...prevData,
            password: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        try {
            const response = await axios.post(API_ENDPOINTS.REGISTER, formData);
            console.log('Response from API:', response.data);
            router.push('/auth/login');
        } catch (error: any) {
            console.error('Error submitting form:', error);
            setErrorMessage(error?.response?.data?.message || 'Gagal mendaftar. Silakan coba kembali.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-column md:flex-row align-items-center justify-content-center"
            style={{ backgroundColor: '#FAF8F5' }}
        >
            {/* Bagian Kiri - Form Pendaftaran */}
            <div className="w-full md:w-6 h-full min-h-screen flex align-items-center justify-content-center p-4 sm:p-6 lg:p-8 bg-white overflow-y-auto">
                <div className="w-full" style={{ maxWidth: '440px' }}>
                    {/* Brand Header */}
                    <div className="mb-4">
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
                            Pendaftaran Akun
                        </span>
                        <h1
                            className="text-2xl sm:text-3xl font-bold m-0 mb-1"
                            style={{ color: '#272329' }}
                        >
                            Daftar Administrator
                        </h1>
                        <p className="text-sm font-medium m-0" style={{ color: '#B94F76' }}>
                            KREZOEMA — Creative Craft &amp; Handmade Accessories
                        </p>
                    </div>

                    {/* Form Pendaftaran */}
                    <form onSubmit={handleSubmit} className="flex flex-column gap-3">
                        <div className="field m-0">
                            <label
                                htmlFor="name"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Nama Lengkap
                            </label>
                            <InputText
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nama lengkap Anda"
                                className="w-full p-3 border-round border-1 surface-border"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="field m-0">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Alamat Email
                            </label>
                            <InputText
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nama@krezoema.com"
                                className="w-full p-3 border-round border-1 surface-border"
                                value={formData.email}
                                onChange={handleInputChange}
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
                                name="password"
                                placeholder="Masukkan kata sandi aman"
                                toggleMask
                                className="w-full"
                                inputClassName="w-full p-3 border-round border-1 surface-border"
                                value={formData.password}
                                weakLabel="Lemah"
                                mediumLabel="Sedang"
                                strongLabel="Kuat"
                                promptLabel="Masukkan kata sandi"
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="field m-0">
                            <label
                                htmlFor="phone"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Nomor Telepon / WhatsApp
                            </label>
                            <InputText
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="08xxxxxxxxxx"
                                className="w-full p-3 border-round border-1 surface-border"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="field m-0">
                            <label
                                htmlFor="address"
                                className="block text-sm font-semibold mb-1"
                                style={{ color: '#272329' }}
                            >
                                Alamat
                            </label>
                            <InputText
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Alamat operasional"
                                className="w-full p-3 border-round border-1 surface-border"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {errorMessage && (
                            <div
                                className="p-3 border-round border-1 text-sm flex align-items-center gap-2"
                                style={{
                                    backgroundColor: '#F8E4EB',
                                    borderColor: '#D96C91',
                                    color: '#B94F76'
                                }}
                            >
                                <i className="pi pi-exclamation-circle text-base"></i>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            label={isLoading ? 'Memproses Pendaftaran...' : 'Daftar Akun'}
                            icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'}
                            className="w-full p-3 text-base font-semibold border-none border-round mt-2 shadow-1 transition-all transition-duration-200"
                            style={{
                                backgroundColor: '#D96C91',
                                color: '#FFFFFF'
                            }}
                            disabled={isLoading}
                        />
                    </form>

                    <div className="text-center mt-4">
                        <span className="text-sm text-600">Sudah memiliki akun? </span>
                        <Link
                            href="/auth/login"
                            className="text-sm font-semibold hover:underline"
                            style={{ color: '#D96C91' }}
                        >
                            Masuk ke Dashboard
                        </Link>
                    </div>

                    <div className="text-center mt-4 pt-3 border-top-1 surface-border">
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
                        Bergabunglah ke dalam portal administrasi untuk mengelola persediaan aksesoris,
                        katalog produk handmade, serta operasional KREZOEMA.
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

export default SignupPage;
