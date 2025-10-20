import {useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';
import {Link} from '~/components/elements/Link';
import {IconShipping} from '~/components/elements/Icon';

export function MegaMenu({
  menu,
  wrapperClass,
  innerClass,
  itemClass,
  showShipping = false,
  shippingText,
}: {
  menu: any;
  wrapperClass?: string;
  innerClass?: string;
  itemClass?: string;
  showShipping?: boolean;
  shippingText?: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [activeDropdownMenu, setActiveDropdownMenu] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true)
  }
  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  useEffect(() => {
    window.setTimeout(function () {
      if (window.innerWidth > 992) {
        setActiveDropdownMenu(true);
      }
    }, 3000);
  });

  return (
    <div className={wrapperClass} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={innerClass}>
        <ul className="flex items-center">
          {(menu || []).map((item: any) => {
            const menuLink = item.mainLink.slug;
            const isDropdown = item.linkSection || item.brandSection || item.promoSection;
            return (
              <li key={item._id} className={`menu-item ${item.fullWidth ? '' : 'relative'}`}>
                <Link to={menuLink ? menuLink : '/'} className={itemClass}>
                  <span className="hover-effect">
                    <span className="block" data-title={item.mainLink.title}>
                      {item.mainLink.title}
                    </span>
                  </span>
                </Link>
                {isDropdown && (
                  <>
                    {(isHovering || activeDropdownMenu) && <Menu menuData={item} />}
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {showShipping && shippingText && (
          <p className="text-sm flex items-center gap-3">
            <IconShipping className="w-5 h-5" />
            {shippingText}
          </p>
        )}
      </div>
    </div>
  );
}

function Menu({menuData}: {menuData: any}) {
  const {
    linkSection,
    linksColumn,
    brandSection,
    promoSection,
    fullWidth,
    customWidth,
    dropdownPosition,
  } = menuData;

  return (
    <div
      className={`
      ${fullWidth ? 'left-0' : '-ml-8'} 
      ${dropdownPosition === 'left' ? 'right-0' : dropdownPosition === 'center' ? '-translate-x-[40%]' : ''} 
      container w-72 gap-8 border border-gray-300 pt-6 pb-8 dropdown-menu absolute top-full bg-white z-30 text-black nav-dropdown-style`}
      style={{width: fullWidth ? '100%' : customWidth}}
    >
      <div className="flex flex-col gap-y-8 justify-between w-full">
        {linkSection && (
          <LinkSection
            linkSection={linkSection}
            linksColumn={linksColumn ? linksColumn : 1}
          />
        )}
        {brandSection && brandSection.length > 0 && (
          <BrandSection brandSection={brandSection} />
        )}
      </div>
      {promoSection && promoSection.length > 0 && (
        <PromoSection promoSection={promoSection} />
      )}
    </div>
  );
}

function LinkSection({
  linkSection,
  linksColumn,
}: {
  linkSection: any;
  linksColumn: any;
}) {
  return (
    <div
      className="grid gap-x-5 gap-y-6 col-span-2"
      style={{
        gridTemplateColumns: `repeat(${linksColumn || 4}, minmax(0, 1fr)`,
      }}
    >
      {(linkSection || []).map((link: any) => (
        <div className="flex flex-col" key={link._key}>
          {link.image && link.bannerPosition && (
            <Link
              to={link?.mainLink?.slug ? link?.mainLink?.slug : '/'}
              target={link?.mainLink?.newWindow ? '_blank' : '_self'}
            >
              <Image
                alt={link.mainLink.title ? link.mainLink.title : 'Menu Banner'}
                data={link.image}
                sizes="(max-width: 32em) 10vw, 33vw"
                loading={'lazy'}
                className="w-full mb-5"
              />
            </Link>
          )}

          {link.mainLink && (
            <Link
              to={link.mainLink.slug ? link.mainLink.slug : '/'}
              target={link.mainLink.newWindow ? '_blank' : '_self'}
              className="menu-link"
            >
              <span className="font-semibold">{link.mainLink.title}</span>
            </Link>
          )}
          <div className="flex flex-col">
            {link.subLink &&
              link.subLink.map((subLink: any) => (
                <Link
                  key={subLink._key}
                  to={subLink.slug ? subLink.slug : '/'}
                  target={subLink.newWindow ? '_blank' : '_self'}
                  className="menu-link"
                >
                  {subLink.title}
                </Link>
              ))}
          </div>
          {link.image && !link.bannerPosition && (
            <Link
              to={link?.mainLink?.slug ? link?.mainLink?.slug : '/'}
              target={link?.mainLink?.newWindow ? '_blank' : '_self'}
            >
              <Image
                alt={link.mainLink.title ? link.mainLink.title : 'Menu Banner'}
                data={link.image}
                sizes="(max-width: 32em) 10vw, 33vw"
                loading={'lazy'}
                className="w-full mt-5"
              />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

function PromoSection({promoSection}: {promoSection: any}) {
  return (
    <div className="flex flex-col gap-y-6 max-w-[30%]">
      {(promoSection || []).map((promo: any) => {
        const {image, promoLink} = promo;

        return (
          <Link
            to={promoLink?.slug ? promoLink?.slug : '/'}
            className="relative"
            key={promo._key}
          >
            <Image
              alt={'Menu Banner'}
              data={image}
              sizes="(max-width: 32em) 10vw, 33vw"
              loading={'lazy'}
            />
          </Link>
        );
      })}
    </div>
  );
}

function BrandSection({brandSection}: {brandSection: any}) {
  return (
    <div className="flex gap-x-6 justify-around">
      {(brandSection || []).map((brand: any) => {
        const {image, brandLink} = brand;

        return (
          <Link
            to={brandLink?.slug ? brandLink?.slug : '/'}
            className="relative"
            key={brand._key}
          >
            <Image
              alt={'Menu Banner'}
              data={image}
              sizes="(max-width: 32em) 10vw, 33vw"
              loading={'lazy'}
            />
          </Link>
        );
      })}
    </div>
  );
}
