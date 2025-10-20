import {useTranslation} from 'react-i18next';

import {Button} from './elements/Button';
import {FeaturedSection} from './FeaturedSection';
import {PageHeader, Text} from './elements/Text';

export function NotFound({type = 'page'}: {type?: string}) {
  const {t} = useTranslation();
  const heading = t('page.notFoundHeading');
  const description = t('page.notFoundText');
  return (
    <>
      <PageHeader heading={heading} className="mt-8">
        <Text width="narrow" as="p">
          {description}
        </Text>
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
