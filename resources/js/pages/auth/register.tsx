import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { cn } from '@/lib/utils';

export default function Register() {
    return (
        <AuthLayout
            title="Create your account"
            description="Get started by creating your account today"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Name Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="grid gap-2"
                            >
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="John Doe"
                                        className={cn(
                                            "pl-10 h-11 transition-all",
                                            errors.name && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </motion.div>

                            {/* Email Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="grid gap-2"
                            >
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        className={cn(
                                            "pl-10 h-11 transition-all",
                                            errors.email && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="grid gap-2"
                            >
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Create a strong password"
                                        className={cn(
                                            "pl-10 h-11 transition-all",
                                            errors.password && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                                className="grid gap-2"
                            >
                                <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm your password"
                                        className={cn(
                                            "pl-10 h-11 transition-all",
                                            errors.password_confirmation && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                            >
                                <Button
                                    type="submit"
                                    className="mt-2 h-11 w-full gap-2 text-base font-semibold shadow-md transition-all hover:shadow-lg"
                                    tabIndex={5}
                                    disabled={processing}
                                    data-test="register-user-button"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create account
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </div>

                        {/* Login Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.4 }}
                            className="text-center text-sm text-muted-foreground"
                        >
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                className="font-semibold text-primary hover:underline"
                                tabIndex={6}
                            >
                                Sign in
                            </TextLink>
                        </motion.div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
