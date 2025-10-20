import {useTranslation} from 'react-i18next';

import {Button} from './elements/Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './elements/Text';

export function GenericError({
  error,
}: {
  error?: {message: string; stack?: string};
}) {
  const {t} = useTranslation();
  const heading = t('errorMesg.somethingWrong');
  let description = t('errorMesg.pageError');

  // TODO hide error in prod?
  if (error) {
    description += `\n${error.message}`;
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <>
      <PageHeader heading={heading} className="mt-8">
        <Text width="narrow" as="p">
          {description}
        </Text>
        {error?.stack && (
          <pre
            style={{
              padding: '2rem',
              background: 'hsla(10, 50%, 50%, 0.1)',
              color: 'red',
              overflow: 'auto',
              maxWidth: '100%',
            }}
            dangerouslySetInnerHTML={{
              __html: addLinksToStackTrace(error.stack),
            }}
          />
        )}
        <Button
          width="auto"
          variant="secondary"
          to={'/'}
          className="btn-secondary"
        >
          {t('page.goToHome')}
        </Button>
      </PageHeader>
      <FeaturedSection />
    </>
  );
}

function addLinksToStackTrace(stackTrace: string) {
  return stackTrace?.replace(
    /^\s*at\s?.*?[(\s]((\/|\w\:).+)\)\n/gim,
    (all, m1) =>
      all.replace(
        m1,
        `<a href="vscode://file${m1}" class="hover:underline">${m1}</a>`,
      ),
  );
}
