import {type LayoutQuery} from 'storefrontapi.generated';

import {Header} from './Header';
import {Footer} from './Footer';

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery;
  sanityData: any;
};

export function LayoutAutumn({children, layout, sanityData}: LayoutProps) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {sanityData && layout?.shop.name && (
          <Header
            title={layout.shop.name}
            menu={sanityData?.menu}
            settings={sanityData?.settings}
          />
        )}

        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {sanityData && <Footer settings={sanityData?.settings} />}
    </>
  );
}
