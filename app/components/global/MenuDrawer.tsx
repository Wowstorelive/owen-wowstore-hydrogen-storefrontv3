import {useEffect, useState} from 'react';
import {Disclosure} from '@headlessui/react';
import {useTranslation} from 'react-i18next';

import {Link} from '~/components/elements/Link';
import {IconCaret} from '~/components/elements/Icon';
import {useDirection} from '~/hooks/useDirection';
import {Drawer, useDrawer} from './Drawer';

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: any;
}) {
  const {t} = useTranslation();
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'left' : 'right';

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      openFrom={direction}
      heading={t('header.menu')}
      width="w-[90vw]"
    >
      <div className="grid border-t max-h-screen overflow-auto pb-40">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({menu, onClose}: {menu: any; onClose: () => void}) {
  const [sectionSelected, setSectionSelected] = useState<any>(null);
  const [subMenuDrawer, setSubMenuDrawer] = useState<any>(null);
  const dir = useDirection();
  const direction = dir === 'ltr' ? 'left' : 'right';
  const {
    isOpen: isSubMenuOpen,
    openDrawer: openSubMenu,
    closeDrawer: closeSubMenu,
  } = useDrawer();

  useEffect(() => {
    if (sectionSelected) {
      const linkSection = menu.find(
        (item: any) => item._id === sectionSelected,
      );
      setSubMenuDrawer(linkSection);
    }
  }, [menu, sectionSelected]);

  return (
    <nav className="grid gap-3 p-6 sm:px-12 sm:py-8">
      {(menu || []).map((item: any) => {
        const {linkSection, mainLink} = item;
        const link = mainLink.slug ? mainLink.slug : '/';
        return (
          <div
            key={item._id}
            className="bg-white relative border border-gray-200 rounded-lg box-border"
          >
            <Link
              to={link}
              onClick={onClose}
              className={`${
                linkSection ? 'relative z-10 inline-block mr-8 rtl:mr-0 rtl:ml-8' : 'block'
              } px-4 py-3`}
            >
              {mainLink.title ? mainLink.title : ''}
            </Link>
            {linkSection && (
              <span
                onClick={() => {
                  openSubMenu();
                  setSectionSelected(item._id);
                }}
                aria-hidden="true"
                className="absolute top-0 left-0 w-full h-full flex justify-end items-center px-3"
              >
                <IconCaret direction={direction} />
              </span>
            )}
          </div>
        );
      })}
      {subMenuDrawer && (
        <Drawer
          open={isSubMenuOpen}
          onClose={closeSubMenu}
          openFrom={direction}
          heading={subMenuDrawer.mainLink.title}
          width="w-[90vw]"
        >
          <nav className="grid gap-3 p-6 sm:px-12 sm:pt-8 border-t max-h-screen overflow-auto pb-40">
            {(subMenuDrawer.linkSection || []).map((item: any) => {
              const {mainLink, subLink} = item;
              return (
                <div
                  className="rounded-lg border border-gray-200"
                  key={item._key}
                >
                  {mainLink ? (
                    <Disclosure>
                      {({open}) => (
                        <>
                          <Disclosure.Button className="w-full text-base text-left font-medium border-none">
                            <div className="relative flex items-center justify-between text-base font-medium tracking-wide">
                              <Link
                                to={mainLink.slug}
                                onClick={onClose}
                                className="inline-block px-4 py-3"
                              >
                                {mainLink.title ?? 'Menu item'}
                              </Link>
                              {subLink && (
                                <span className="relative z-10 px-2 flex items-center justify-end min-w-12">
                                  <IconCaret
                                    className="w-full"
                                    direction={open ? 'up' : 'down'}
                                  />
                                </span>
                              )}
                            </div>
                          </Disclosure.Button>
                          {subLink && (
                            <div
                              className={`${
                                open
                                  ? `max-h-[2000px] overflow-hidden h-fit `
                                  : ` max-h-0 `
                              }overflow-hidden transition-all duration-300`}
                            >
                              <Disclosure.Panel
                                static
                                className="p-4 flex flex-col gap-2 text-base border-t border-gray-200 font-light"
                              >
                                {(subLink || []).map((item: any) => {
                                  const {slug, title} = item;

                                  return (
                                    <Link
                                      to={slug ? slug : ''}
                                      key={item._key}
                                      onClick={onClose}
                                    >
                                      {title ? title : ''}
                                    </Link>
                                  );
                                })}
                              </Disclosure.Panel>
                            </div>
                          )}
                        </>
                      )}
                    </Disclosure>
                  ) : (
                    <div className="p-4 flex flex-col gap-2 text-base font-light">
                      {(subLink || []).map((item: any) => {
                        const {slug, title} = item;

                        return (
                          <Link
                            to={slug ? slug : ''}
                            key={item._key}
                            onClick={onClose}
                          >
                            {title ? title : ''}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </Drawer>
      )}
    </nav>
  );
}
