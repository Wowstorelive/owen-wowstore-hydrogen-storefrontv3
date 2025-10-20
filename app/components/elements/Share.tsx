import {Menu} from '@headlessui/react';
import {useTranslation} from 'react-i18next';

import {Link} from './Link';
import {
  IconShare,
  IconFacebook,
  IconLinkedin,
  IconTwitter,
  IconPinterest,
} from './Icon';

export function Share({url}: {url?: string}) {
  const {t} = useTranslation();
  return (
    <div className="flex relative">
      <Menu>
        <Menu.Button>
          <div className="cursor-pointer flex item-center gap-2">
            <span className="flex items-center">
              <IconShare className="w-5 h-5" />
            </span>
            <span className="uppercase">{t('global.share')}</span>
          </div>
        </Menu.Button>
        <Menu.Items className="absolute bg-white flex flex-col top-full right-0 xl:-right-4 z-50 border border-gray-300 gap-1">
          <Link
            to={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
            target="_blank"
          >
            <Menu.Item>
              <div className="flex items-center gap-1 cursor-pointer px-3 mt-2 hover:bg-gray-200">
                <div className="text-blue-500 min-w-6">
                  <IconFacebook />
                </div>
                <span>Facebook</span>
              </div>
            </Menu.Item>
          </Link>
          <Link
            to={`https://www.linkedin.com/shareArticle?mini=true&url=${url}`}
            target="_blank"
          >
            <Menu.Item>
              <div className="flex items-center gap-1 cursor-pointer px-3 hover:bg-gray-200">
                <div className="min-w-6 text-[#0A66C2]">
                  <IconLinkedin />
                </div>
                <span>Linkedin</span>
              </div>
            </Menu.Item>
          </Link>
          <Link
            to={`https://twitter.com/intent/tweet?url=${url}`}
            target="_blank"
          >
            <Menu.Item>
              <div className="flex items-center gap-1 cursor-pointer px-3 hover:bg-gray-200">
                <div className="text-blue-500 min-w-6">
                  <IconTwitter />
                </div>
                <span>Twitter</span>
              </div>
            </Menu.Item>
          </Link>
          <Link
            to={`http://pinterest.com/pin/create/button/?url=${url}`}
            target="_blank"
          >
            <Menu.Item>
              <div className="flex items-center gap-1 cursor-pointer px-3 mb-2 hover:bg-gray-200">
                <div className="text-red-700 min-w-6">
                  <IconPinterest />
                </div>
                <span>Pinterest</span>
              </div>
            </Menu.Item>
          </Link>
        </Menu.Items>
      </Menu>
    </div>
  );
}
