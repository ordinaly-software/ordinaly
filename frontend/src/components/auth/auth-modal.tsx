'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Modal } from "@/components/ui/modal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserPlus, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
}

const AuthModal = ({ isOpen, onClose, courseTitle }: AuthModalProps) => {
  const tAuth = useTranslations('authModal');
  const router = useRouter();

  const handleSignIn = () => {
    onClose();
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/auth/signup');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-[440px] sm:max-w-lg md:max-w-xl lg:max-w-2xl">
  <div className="bg-gradient-to-br from-[#22A60D]/10 via-[#217093]/10 to-[#623CEA]/10 p-6 rounded-t-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {courseTitle ? tAuth('courseEnrollTitle') : tAuth('welcome')}
          </h2>
          {courseTitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {tAuth('courseEnrollDescription', { courseTitle })}
            </p>
          )}
          {!courseTitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {tAuth('generalDescription')}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Sign In Card */}
        <Card className="border border-gray-200 dark:border-gray-700 hover:border-[#22A60D] transition-all duration-300 hover:shadow-lg hover:shadow-[#22A60D]/10 cursor-pointer group"
              onClick={handleSignIn}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#22A60D]/10 rounded-xl flex items-center justify-center group-hover:bg-[#22A60D]/20 transition-colors">
                <User className="h-6 w-6 text-[#22A60D]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {tAuth('signIn.title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {tAuth('signIn.description')}
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#22A60D] group-hover:translate-x-1 transition-all" />
            </div>
          </CardHeader>
        </Card>

        {/* Sign Up Card */}
  <Card className="border border-gray-200 dark:border-gray-700 hover:border-[#217093] transition-all duration-300 hover:shadow-lg hover:shadow-[#217093]/10 cursor-pointer group"
              onClick={handleSignUp}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#217093]/10 rounded-xl flex items-center justify-center group-hover:bg-[#217093]/20 transition-colors">
                <UserPlus className="h-6 w-6 text-[#217093]" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {tAuth('signUp.title')}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {tAuth('signUp.description')}
                </CardDescription>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#217093] group-hover:translate-x-1 transition-all" />
            </div>
          </CardHeader>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tAuth('termsText')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;
