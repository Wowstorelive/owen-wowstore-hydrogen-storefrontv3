import {useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {useTranslation} from 'react-i18next';
import {Newsletter} from '~/components/elements/Newsletter';
import {CustomModal} from '~/components/elements/CustomModal';

const MINUTES = 1440;
const timerId = MINUTES * 60 * 1000;

function setWithExpiry(key = '', isDisabled = false, isOpen = false, ttl = 0) {
  const now = new Date();
  const item = {
    isOpen,
    disabled: isDisabled,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key = '') {
  const itemStr = localStorage.getItem(key);

  if (!itemStr) {
    return false;
  }

  const item = JSON.parse(itemStr);
  if (item.disabled) {
    return item.disabled;
  }
  const now = new Date();

  if (now.getTime() > item.expiry && !item.disabled) {
    localStorage.removeItem(key);
    return false;
  }
  return item.isOpen;
}

export function NewsletterPopup({settings}: {settings?: any}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const {t} = useTranslation();
  const handleCheck = (e: any) => {
    setIsChecked(e.target.checked);
  };

  function closeModal() {
    setIsModalOpen(false);
    setWithExpiry('newsletter_popup', isChecked, true, timerId);
  }

  useEffect(() => {
    window.setTimeout(function () {
      const newsletterState = getWithExpiry('newsletter_popup');
      if (!newsletterState) {
        setIsModalOpen(true);
      }
    }, 6000);
  }, []);

  if (!isModalOpen) {
    return null;
  }

  return (
    <CustomModal
      isOpen={isModalOpen}
      onClose={closeModal}
      settings={{
        background: settings.backgroundColor,
        color: settings.textColor,
        padding: '0px',
      }}
    >
      <div className="flex justify-center">
        {settings.banner.url && (
          <div className="hidden md:block w-1/2">
            <Image
              alt="Newsletter banner"
              data={settings.banner}
              width={settings.banner?.dimensions?.width}
              height={settings.banner?.dimensions?.height}
              sizes="(max-width: 32em) 100vw, 33vw"
            />
          </div>
        )}
        <div className="p-8 flex flex-col justify-center gap-3 text-center md:w-1/2">
          <h3 className="text-lg">{settings.heading}</h3>
          <p className="text-sm opacity-80 mb-1">
            {settings.description}
          </p>

          <Newsletter inputClass="border border-gray-300 md:-mr-1 text-sm py-3 text-center md:text-left" />

          <div className="flex items-center gap-2 justify-center text-sm mt-1">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheck}
              id="newsletter-confirm"
            />
            <label
              className="cursor-pointer"
              htmlFor="newsletter-confirm"
            >
              {t('global.disablePopup')}
            </label>
          </div>
        </div>
      </div>
    </CustomModal>
  );
}
