/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/app/api/losbackend/api';
import axios from 'axios';

interface User {
    name: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    status: number
}
const SignupPage = () => {
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
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    const handlePasswordChange = (e: any) => {
        setFormData(prevData => ({
            ...prevData,
            password: e.target.value
        }));
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // setIsLoading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.REGISTER, formData);
            console.log('Response from API:', response.data);
            router.push('/auth/login')
            // setIsLoading(false);
            // Reset form atau tampilkan pesan sukses di sini
        } catch (error) {
            console.error('Error submitting form:', error);
            // setIsLoading(false);
            // Tampilkan pesan error ke pengguna di sini
        }
    };
    const { layoutConfig } = useContext(LayoutContext);

    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        // <div className={containerClassName}>
        //     <div className="flex flex-column align-items-center justify-content-center">
        //         <img src={`/demo/images/logo/logo-godong.png`} alt="Sakai logo" className="mb-5 w-10rem flex-shrink-0" />
        //         <div
        //             style={{
        //                 borderRadius: '56px',
        //                 padding: '0.3rem',
        //                 background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
        //             }}
        //         >
        //             <div className="w-full surface-card py-4 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
        //                 <div className="text-center mb-5">
        //                     {/* <img src="/demo/images/login/avatar.png" alt="Image" height="50" className="mb-3" /> */}
        //                     <div className="text-900 text-3xl font-medium mb-3">Selamat Datang</div>
        //                     <span className="text-600 font-medium">Silahkan Daftar</span>
        //                 </div>

        //                 <div>
        //                     <form onSubmit={handleSubmit}>
        //                         <label htmlFor="name" className="block text-900 text-xl font-medium mb-2">
        //                             Nama
        //                         </label>
        //                         <InputText
        //                             id="name"
        //                             name='name'
        //                             type="text"
        //                             placeholder="Nama lengkap"
        //                             className="w-full md:w-30rem mb-3"
        //                             style={{ padding: '1rem' }}
        //                             value={formData.name}
        //                             onChange={handleInputChange}
        //                         />

        //                         <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
        //                             Email
        //                         </label>
        //                         <InputText
        //                             id="email"
        //                             name='email'
        //                             type="email"
        //                             placeholder="Alamat email"
        //                             className="w-full md:w-30rem mb-3"
        //                             style={{ padding: '1rem' }}
        //                             value={formData.email}
        //                             onChange={handleInputChange}
        //                         />

        //                         <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
        //                             Password
        //                         </label>
        //                         <Password
        //                             inputId="password"
        //                             name='password'
        //                             placeholder="Password"
        //                             toggleMask
        //                             className="w-full mb-2"
        //                             inputClassName="w-full p-3 md:w-30rem"
        //                             value={formData.password}
        //                             weakLabel='Lemah'
        //                             mediumLabel='Sedang'
        //                             strongLabel='Kuat'
        //                             promptLabel='Masukkan kata sandi'
        //                             onChange={handlePasswordChange}
        //                         />

        //                         <label htmlFor="phone" className="block text-900 font-medium text-xl mb-2">
        //                             No. Hp
        //                         </label>
        //                         <InputText
        //                             id="phone"
        //                             name='phone'
        //                             type="number"
        //                             placeholder="Nomor telepon"
        //                             className="w-full md:w-30rem mb-3"
        //                             style={{ padding: '1rem' }}
        //                             value={formData.phone}
        //                             onChange={handleInputChange}
        //                         />

        //                         <label htmlFor="address" className="block text-900 font-medium text-xl mb-2">
        //                             Alamat
        //                         </label>
        //                         <InputText
        //                             id="address"
        //                             name='address'
        //                             type="text"
        //                             placeholder="Alamat lengkap"
        //                             className="w-full md:w-30rem mb-5"
        //                             style={{ padding: '1rem' }}
        //                             value={formData.address}
        //                             onChange={handleInputChange}
        //                         />
        //                         <div className="flex align-items-center justify-content-between mb-5 gap-5">
        //                             {/* <div className="flex align-items-center">
        //                             <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
        //                             <label htmlFor="rememberme1">Remember me</label>
        //                         </div>
        //                         <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
        //                         Forgot password?
        //                         </a> */}
        //                             <Link href={'/auth/login'} >
        //                                 <label htmlFor="" className='cursor-pointer'>Punya Akun?</label>
        //                             </Link>
        //                         </div>
        //                         <Button label="Sign Up" className="w-full p-3 text-xl"></Button>
        //                     </form>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        <div className="flex flex-row h-screen">
            <div className="h-full col-6 flex flex-column justify-content-center align-items-center p-8" style={{ background: 'linear-gradient(to right, #C3DCFC, #E6F2FF,#E6F2FF)' }}>
                <div className="col-11">
                    <h1 className="text-3xl mb-2">Selamat Datang di</h1>
                    <h2 className="text-5xl font-bold mb-5 w-7">CMS web sd manguharjo 1 madiun</h2>

                    <form onSubmit={handleSubmit}>
                        <div className='mb-3'>
                            <label htmlFor="name" className="block text-900 text-xl font-medium mb-2">
                                Nama
                            </label>
                            <InputText
                                id="name"
                                name='name'
                                type="text"
                                placeholder="Nama lengkap"
                                className="w-full p-3"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor="email" className="block text-900 text-xl font-medium mb-2">
                                Email
                            </label>
                            <InputText
                                id="email"
                                name='email'
                                type="email"
                                placeholder="Alamat email"
                                className="w-full p-3"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className='mb-3'>
                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password
                                inputId="password"
                                name='password'
                                placeholder="Password"
                                toggleMask
                                className="w-full "
                                inputClassName="w-full p-3"
                                value={formData.password}
                                weakLabel='Lemah'
                                mediumLabel='Sedang'
                                strongLabel='Kuat'
                                promptLabel='Masukkan kata sandi'
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className='mb-3'>
                            <label htmlFor="phone" className="block text-900 font-medium text-xl mb-2">
                                No. Hp
                            </label>
                            <InputText
                                id="phone"
                                name='phone'
                                type="number"
                                placeholder="Nomor telepon"
                                className="w-full p-3"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className='mb-6'>
                            <label htmlFor="address" className="block text-900 font-medium text-xl mb-2">
                                Alamat
                            </label>
                            <InputText
                                id="address"
                                name='address'
                                type="text"
                                placeholder="Alamat lengkap"
                                className="w-full p-3"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        <Button label="Daftar" className="border-none w-full p-3 text-xl text-blue-500 transition-all duration-300 ease-in-out hover:bg-blue-200" style={{ backgroundColor: '#C3DCFC' }} />
                    </form>

                    <div className="mt-4 text-center">
                        <span className="text-sm">Sudah Punya Akun? </span>
                        <Link href="/auth/login" className="text-blue-500 hover:underline">
                            Masuk
                        </Link>
                    </div>
                </div>

                {/* <div className="mt-8 flex justify-content-center">
                    <img src="/demo/images/logo/logo-godong.png"  alt="Logo Godong" className="mb-4 transition-transform hover:scale-110" />
                </div> */}
            </div>
            <div className="col-6 flex items-center justify-center" style={{ background: 'linear-gradient(to left, #C3DCFC, #E6F2FF)' }}>
                <img src="/demo/images/login/bg-login.png" alt="Login Illustration" className="max-w-md w-full" />
            </div>
        </div>
    );
};

export default SignupPage;
