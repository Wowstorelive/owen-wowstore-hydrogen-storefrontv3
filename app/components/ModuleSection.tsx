import {useRef, useState, useEffect} from 'react';

import {BannerSlider} from '~/components/sanity/BannerSlider';
import {BannerGrid} from '~/components/sanity/BannerGrid';
import {SelectedProduct} from '~/components/sanity/SelectedProduct';
import {CollectionTabs} from '~/components/sanity/CollectionTabs';
import {LatestBlog} from '~/components/sanity/LatestBlog';
import {PortableText} from '~/components/sanity/PortableText';
import {ImageWithText} from '~/components/sanity/ImageWithText';
import {Policies} from '~/components/sanity/Policies';
import {VideoBackground} from '~/components/sanity/VideoBackground';
import {ImageModule} from '~/components/sanity/ImageModule';
import {FAQ} from '~/components/sanity/FAQ';
import {Instagram} from '~/components/sanity/Instagram';
import {ContactForm} from '~/components/sanity/ContactForm';
import {GoogleMap} from '~/components/sanity/GoogleMap';
import {HtmlContent} from '~/components/sanity/HtmlContent';
import {CollectionGrid} from '~/components/sanity/CollectionGrid';

import {useOnScreen} from '~/hooks/useOnScreen';

export function ModuleSection({item}: {item: any}) {
  const refItem = useRef();
  const [isRef, setIsRef] = useState(false);
  const refValue = useOnScreen(refItem);

  useEffect(() => {
    if (!isRef) {
      setIsRef(refValue);
    }
  }, [isRef, refValue]);

  switch (item._type) {
    case 'bannerSlider':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <BannerSlider sliderData={item} />,
      );

    case 'bannerGrid':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <BannerGrid bannerGrid={item} />,
      );

    case 'selectedProducts':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <SelectedProduct selectedProduct={item} />,
      );

    case 'collectionTabs':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <CollectionTabs collectionTabs={item} />,
      );

    case 'imageWithText':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <ImageWithText data={item} />,
      );

    case 'latestBlog':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <LatestBlog latestBlog={item} />,
      );

    case 'policies':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <Policies selectedpolicies={item} />,
      );

    case 'videoBg':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <VideoBackground videoData={item} />,
      );

    case 'imageHotspot':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <ImageModule module={item} />,
      );

    case 'instagram':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <Instagram module={item} />,
      );

    case 'htmlContent':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <HtmlContent data={item} />,
      );

    case 'collectionGrid':
      return renderModuleSection(
        item.scrollToLoad,
        refItem,
        isRef,
        <CollectionGrid data={item} />,
      );

    case 'contentGrid':
      return <PortableText data={item} />;

    case 'faqs':
      return <FAQ faqs={item} />;

    case 'contactForm':
      return <ContactForm contactForm={item} />;

    case 'googleMap':
      return <GoogleMap googleMap={item} />;

    default:
      return <></>;
  }
}

function renderModuleSection(
  scrollToLoad: any,
  refCurrent: any,
  isShow: any,
  children: any,
) {
  if (scrollToLoad) {
    return (
      <section
        ref={refCurrent}
        className={`${
          children?.props?.module?._type == 'imageHotspot'
            ? 'min-h-36'
            : 'min-h-72'
        } lg:min-h-96`}
      >
        {isShow && (
          <div className="inline-block w-full animated fadeIn">{children}</div>
        )}
      </section>
    );
  } else {
    return children;
  }
}
