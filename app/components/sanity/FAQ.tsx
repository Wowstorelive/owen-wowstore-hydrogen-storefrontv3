import {Disclosure} from '@headlessui/react';
import {Heading} from '~/components/elements/Text';
import {IconCaret} from '~/components/elements/Icon';
import {PortableTextContent} from '~/components/elements/PortableTextContent';

export function FAQ({
  faqs,
  fullWidth = false,
}: {
  faqs: any;
  fullWidth?: boolean;
}) {
  const {faqItems, faqTitle} = faqs;
  console.log(faqItems);
  return (
    <div className="mb-12 md:mb-20 w-full px-8 lg:px-0 mx-auto lg:w-2/3">
      <Heading
        className="text-xl lg:text-2xl mb-5 font-semibold text-heading2"
        as="h2"
      >
        {faqTitle}
      </Heading>
      <div className="flex flex-col">
        {(faqItems || []).map((item: any) => {
          return (
            <Disclosure key={item._key}>
              {({open}) => (
                <>
                  <Disclosure.Button className="w-full text-md text-left font-medium border-b border-gray-200 py-4">
                    <Heading
                      className="relative flex items-center justify-between text-base font-medium tracking-wide text-heading4"
                      size="lead"
                      as="h4"
                    >
                      {item.question}
                      <span className="flex items-center justify-center">
                        <IconCaret
                          className="w-full"
                          direction={open ? 'up' : 'down'}
                        />
                      </span>
                    </Heading>
                  </Disclosure.Button>
                  <div
                    className={`${
                      open
                        ? `max-h-[2000px] overflow-hidden h-fit `
                        : ` max-h-0 `
                    }overflow-hidden transition-all duration-300`}
                  >
                    <Disclosure.Panel static>
                      <div className="flex flex-col gap-2 py-4 font-light">
                        <PortableTextContent data={item.answer} />
                      </div>
                    </Disclosure.Panel>
                  </div>
                </>
              )}
            </Disclosure>
          );
        })}
      </div>
    </div>
  );
}
