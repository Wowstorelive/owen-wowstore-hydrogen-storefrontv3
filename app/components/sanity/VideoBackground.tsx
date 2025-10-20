import {useRef, useEffect, useState} from 'react';

import {PlayIcon, PauseIcon} from '~/components/elements/Icon';
import {Heading} from '~/components/elements/Text';
import {ButtonLink} from '~/components/elements/ButtonLink';

export function VideoBackground({videoData}: {videoData: any}) {
  const videoRef = useRef<any>();
  const [play, setPlay] = useState(true);

  useEffect(() => {
    if (play) {
      videoRef.current.play();
      return;
    }
    videoRef.current.pause();
  }, [play]);

  const videoControl = () => {
    setPlay((prev) => !prev);
  };

  return (
    <div className="mb-12 md:mb-20" style={{margin: videoData?.margin}}>
      <div className={videoData.fullWidth ? '' : 'container'}>
        <div className="relative h-96" style={{height: videoData?.height}}>
          <video
            ref={videoRef}
            preload="none"
            autoPlay={true}
            muted
            loop
            playsInline
            className="pointer-events-none absolute top-0 left-0 w-full h-full overflow-hidden object-cover"
          >
            <source src={videoData.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            <div
              className={
                (videoData.fullWidth ? 'container' : 'w-full px-6 md:px-12') +
                ' flex items-center justify-between'
              }
            >
              <div className="text-white">
                {videoData.caption && (
                  <p className="mb-2">{videoData.caption}</p>
                )}

                <Heading className="text-4xl md:text-6xl font-bold" as="h2">
                  {videoData.titleFirst && videoData.titleFirst} <br />
                  {videoData.titleSecond && videoData.titleSecond}
                </Heading>

                {videoData?.buttonLink && (
                  <ButtonLink
                    className="mt-6"
                    link={videoData?.buttonLink?.slug}
                    style={videoData?.buttonStyle}
                    text={videoData?.buttonLink.title}
                  />
                )}
              </div>

              <div className="hidden md:block">
                <button onClick={videoControl}>
                  {play ? (
                    <PauseIcon className="text-white w-16 h-16" />
                  ) : (
                    <PlayIcon className="text-white w-16 h-16" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
