import {useTranslation} from 'react-i18next';

import {useCountdown} from '~/hooks/useCountdown';
import {Link} from '~/components/elements/Link';

export function CountdownTimer({settings}: {settings?: any}) {
  if (!settings) {
    return <></>;
  }
  let config = {
    backgroundColor: '',
    textColor: '',
    countdownTitle: '',
    countdownSubtitle: '',
    countdownStatus: false,
    countdownDateStart: '',
    countdownDateEnd: '',
    countdownButton: false,
    buttonBackground: '',
    buttonTextColor: '',
    buttonText: '',
    buttonLink: '',
    start: '',
  };
  if (settings) {
    settings.forEach((setting: any) => {
      if (setting && setting.countdownTimer) {
        config = setting.countdownTimer;
      }
    });
  }

  if (!config.countdownStatus) {
    return <></>;
  }

  const [days, hours, minutes, seconds] = useCountdown(config.countdownDateEnd);
  const isStart =
    new Date().getTime() - new Date(config.countdownDateStart).getTime() > 0;
  const isEnd = days + hours + minutes + seconds < 0;

  const isActive = isStart && !isEnd;

  return (
    <div
      className={`flex flex-col md:flex-row md:gap-10 justify-center items-center timer-container py-3`}
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
    >
      <div className="text-center">
        <div className="font-bold text-xl md:text-2xl">
          {config.countdownTitle}
        </div>
        <div
          className="font-normal md:text-xl md-max:hidden"
          style={{lineHeight: '20px'}}
        >
          {config.countdownSubtitle}
        </div>
      </div>
      {isActive && (
        <div className="timer md-max:hidden">
          <ShowCounter days={days} hours={hours} minutes={minutes} />
        </div>
      )}
      {config.countdownButton && (
        <div className="flex timer-action">
          <Link
            to={config.buttonLink?.slug ? config.buttonLink?.slug : '/'}
            target={config.buttonLink?.newWindow ? '_blank' : '_self'}
            className="font-normal text-sm md:text-lg px-5 py-2 md:py-3 rounded text-white tracking-wider"
            style={{
              backgroundColor: config.buttonBackground,
              color: config.buttonTextColor,
            }}
          >
            {config.buttonText}
          </Link>
        </div>
      )}
    </div>
  );
}

const ShowCounter = ({
  days,
  hours,
  minutes,
}: {
  days: any;
  hours: any;
  minutes: any;
}) => {
  const {t} = useTranslation();
  return (
    <div className="flex text-center justify-center items-center text-lg font-bold">
      <DateTimeDisplay value={days} type={t('global.days')} />
      <span className="mx-2">:</span>
      <DateTimeDisplay value={hours} type={t('global.hrs')} />
      <span className="mx-2">:</span>
      <DateTimeDisplay value={minutes} type={t('global.mins')} />
    </div>
  );
};

const DateTimeDisplay = ({value, type}: {value: any; type: any}) => {
  return (
    <div className="leading-4">
      <span className="block text-2xl md:text-3xl">{value}</span>
      <span className="hidden md:block font-normal text-sm">{type}</span>
    </div>
  );
};
